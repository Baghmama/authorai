import { createClient } from 'npm:@supabase/supabase-js@2.53.0';
import { createHmac } from 'node:crypto';

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
    console.log('Payment verification request received');
    
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
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      throw new Error('Invalid request body');
    }

    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature, 
      credits 
    }: VerifyRequest = requestBody;

    console.log('Payment data received:', {
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
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
      throw new Error('Missing required fields');
    }

    // Get Razorpay secret key
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    
    if (!razorpayKeySecret) {
      console.error('Razorpay secret key not configured');
      throw new Error('Razorpay secret key not configured');
    }

    // Verify Razorpay signature according to documentation
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = createHmac('sha256', razorpayKeySecret)
      .update(body)
      .digest('hex');

    console.log('Signature verification:', {
      body: body,
      expected: expectedSignature,
      received: razorpay_signature,
      match: expectedSignature === razorpay_signature
    });

    // Verify signature for security
    if (expectedSignature !== razorpay_signature) {
      console.error('Invalid payment signature');
      throw new Error('Invalid payment signature');
    }

    console.log('Payment signature verified successfully');

    // Add credits to user account using the database function
    const { data: creditResult, error: creditError } = await supabaseClient.rpc('add_credits', {
      p_user_id: user.id,
      p_amount: credits,
      p_transaction_type: 'purchase',
      p_description: `Credit purchase via Razorpay - Payment ID: ${razorpay_payment_id}`
    });

    if (creditError) {
      console.error('Error adding credits:', creditError);
      throw new Error('Failed to add credits to account');
    }

    console.log('Credits added successfully:', creditResult);

    // Log successful payment
    console.log(`Payment verified for user ${user.email}: ${credits} credits added`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        credits_added: credits,
        new_balance: creditResult?.credits || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error verifying payment:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});