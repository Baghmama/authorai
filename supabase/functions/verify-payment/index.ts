import { createClient } from 'npm:@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface VerifyRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  credits: number;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Payment verification request received ===');
    
    // Initialize Supabase client with service role for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      throw new Error('Missing authorization header');
    }

    // Create client with anon key for user verification
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await userClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('Invalid authentication');
    }

    console.log('User authenticated:', user.email);

    // Parse request body
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log('Raw request body:', bodyText);
      requestBody = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      throw new Error('Invalid request body format');
    }

    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature, 
      credits 
    }: VerifyRequest = requestBody;

    console.log('Payment verification data:', {
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      signature: razorpay_signature ? 'present' : 'missing',
      credits: credits
    });

    // Validate input
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !credits) {
      console.error('Missing required fields:', {
        payment_id: !!razorpay_payment_id,
        order_id: !!razorpay_order_id,
        signature: !!razorpay_signature,
        credits: !!credits
      });
      throw new Error('Missing required payment verification fields');
    }

    // Get Razorpay credentials
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials not configured');
      throw new Error('Payment system not configured');
    }

    console.log('Using Razorpay key:', razorpayKeyId);

    // Step 1: Fetch order details from Razorpay to verify it exists and is paid
    console.log('=== Fetching order details from Razorpay ===');
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('Failed to fetch order from Razorpay:', orderResponse.status, errorText);
      throw new Error(`Failed to verify order: ${orderResponse.status}`);
    }

    const orderData = await orderResponse.json();
    console.log('Order data from Razorpay:', {
      id: orderData.id,
      status: orderData.status,
      amount: orderData.amount,
      amount_paid: orderData.amount_paid,
      amount_due: orderData.amount_due
    });

    // Step 2: Fetch payment details from Razorpay
    console.log('=== Fetching payment details from Razorpay ===');
    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('Failed to fetch payment from Razorpay:', paymentResponse.status, errorText);
      throw new Error(`Failed to verify payment: ${paymentResponse.status}`);
    }

    const paymentData = await paymentResponse.json();
    console.log('Payment data from Razorpay:', {
      id: paymentData.id,
      status: paymentData.status,
      order_id: paymentData.order_id,
      amount: paymentData.amount,
      method: paymentData.method
    });

    // Step 3: Verify payment status and order matching
    if (paymentData.status !== 'captured') {
      console.error('Payment not captured:', paymentData.status);
      throw new Error(`Payment not successful. Status: ${paymentData.status}`);
    }

    if (paymentData.order_id !== razorpay_order_id) {
      console.error('Order ID mismatch:', {
        payment_order_id: paymentData.order_id,
        provided_order_id: razorpay_order_id
      });
      throw new Error('Payment and order ID mismatch');
    }

    // Step 4: Verify signature (optional but recommended)
    console.log('=== Verifying signature ===');
    const crypto = await import('node:crypto');
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', razorpayKeySecret)
      .update(body)
      .digest('hex');

    console.log('Signature verification:', {
      body: body,
      expected: expectedSignature,
      received: razorpay_signature,
      match: expectedSignature === razorpay_signature
    });

    if (expectedSignature !== razorpay_signature) {
      console.error('Invalid payment signature');
      throw new Error('Payment signature verification failed');
    }

    console.log('=== Payment verification successful ===');

    // Step 5: Add credits to user account
    console.log('=== Adding credits to user account ===');
    const { data: creditResult, error: creditError } = await supabaseClient.rpc('add_credits', {
      p_user_id: user.id,
      p_amount: credits,
      p_transaction_type: 'purchase',
      p_description: `Credit purchase via Razorpay - Payment ID: ${razorpay_payment_id}, Order ID: ${razorpay_order_id}`
    });

    if (creditError) {
      console.error('Error adding credits:', creditError);
      throw new Error('Failed to add credits to account');
    }

    console.log('Credits added successfully:', creditResult);
    console.log(`=== Payment verification complete for user ${user.email}: ${credits} credits added ===`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        credits_added: credits,
        new_balance: creditResult?.credits || 0,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('=== Payment verification failed ===');
    console.error('Error details:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});