import { createClient } from 'npm:@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface OrderRequest {
  amount: number;
  currency: string;
  receipt: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Parse request body
    const { amount, currency, receipt }: OrderRequest = await req.json();

    // Validate input
    if (!amount || !currency || !receipt) {
      throw new Error('Missing required fields');
    }

    if (amount < 100) { // Minimum amount in smallest currency unit
      throw new Error('Amount too small');
    }

    // Create Razorpay order using test credentials
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID') || 'rzp_test_1234567890';
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') || 'test_secret_key';

    const orderData = {
      amount,
      currency,
      receipt,
      notes: {
        user_id: user.id,
        user_email: user.email,
      },
    };

    // For testing, we'll create a mock order response
    // In production, you would make an actual API call to Razorpay
    const mockOrder = {
      id: `order_${Date.now()}`,
      entity: 'order',
      amount,
      currency,
      receipt,
      status: 'created',
      created_at: Math.floor(Date.now() / 1000),
    };

    // In production, uncomment this and use actual Razorpay API:
    /*
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Failed to create Razorpay order');
    }

    const order = await response.json();
    */

    return new Response(
      JSON.stringify(mockOrder),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating payment order:', error);
    
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