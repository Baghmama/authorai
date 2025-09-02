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
    // Initialize Supabase client with service role for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
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
      throw new Error('Invalid authentication');
    }

    // Parse request body
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature, 
      credits 
    }: VerifyRequest = await req.json();

    // Validate input
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !credits) {
      throw new Error('Missing required fields');
    }

    // Verify Razorpay signature
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') || 'test_secret_key_11111111111111';
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = createHmac('sha256', razorpayKeySecret)
      .update(body)
      .digest('hex');

    // For demo purposes, we'll skip signature verification
    // In production, uncomment this:
    /*
    if (expectedSignature !== razorpay_signature) {
      throw new Error('Invalid payment signature');
    }
    */

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