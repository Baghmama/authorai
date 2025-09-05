import { PaymentPackage } from '../types';
import { RAZORPAY_CONFIG } from './razorpayConfig';
import { supabase } from '../lib/supabase';

interface PaymentRequest {
  package: PaymentPackage;
  currency: 'USD' | 'INR';
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentComplete?: (paymentData: any) => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Load Razorpay script dynamically
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Validate Razorpay key format
function isValidRazorpayKey(key: string): boolean {
  return key.startsWith('rzp_live_') || key.startsWith('rzp_test_');
}

// Create order through Supabase edge function
async function createRazorpayOrder(amount: number, currency: string, receipt: string, credits: number) {
  try {
    console.log('Creating Razorpay order:', { amount, currency, receipt, credits });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }

    const response = await supabase.functions.invoke('create-payment-order', {
      body: {
        amount: amount * 100, // Convert to smallest currency unit (paise/cents)
        currency: currency,
        receipt: receipt,
        credits: credits
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.error) {
      throw response.error;
    }
    
    console.log('Razorpay order created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function processPayment({ package: pkg, currency, onPaymentSuccess, onPaymentComplete }: PaymentRequest): Promise<boolean> {
  try {
    console.log('Starting payment process:', { package: pkg, currency });
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    console.log('User authenticated:', user.email);
    
    // Validate Razorpay key
    const razorpayKey = RAZORPAY_CONFIG.keyId;
    console.log('Razorpay key:', razorpayKey);
    
    if (!isValidRazorpayKey(razorpayKey)) {
      console.error('Missing or invalid Razorpay key:', razorpayKey);
      throw new Error('Payment system not configured. Please contact support.');
    }

    // Load Razorpay script
    console.log('Loading Razorpay script...');
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }
    console.log('Razorpay script loaded successfully');

    // Force INR for test keys, allow both for live keys
    const actualCurrency = currency === 'USD' ? 'USD' : 'INR';
    const amount = currency === 'USD' ? pkg.price.usd : pkg.price.inr;
    const receipt = `credits_${pkg.id}_${Date.now()}`;
    
    console.log('Payment details:', { amount, currency: actualCurrency, receipt });

    // Create Razorpay order
    const orderData = await createRazorpayOrder(amount, actualCurrency, receipt, pkg.credits);
    
    console.log('Order created:', orderData);

    // Configure Razorpay options with better error handling
    const options = {
      key: razorpayKey,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Author AI',
      description: `${pkg.credits} Credits - ${pkg.name}`,
      order_id: orderData.id,
      prefill: {
        email: '', // Will be filled by user if needed
      },
      theme: {
        color: '#f97316', // Orange color matching our theme
      },
      handler: async function (response: RazorpayResponse) {
        try {
          console.log('Payment successful, response:', response);
          
          const paymentData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            credits: pkg.credits
          };
          
          // Call the payment complete callback to show verification modal
          if (onPaymentComplete) {
            onPaymentComplete(paymentData);
          } else {
            // Fallback to old behavior
            onPaymentSuccess(paymentData);
          }
          
          return true;
        } catch (error) {
          console.error('Payment handling failed:', error);
          alert('Payment processing failed. Please contact support.');
          return false;
        }
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal closed by user');
        },
        escape: true,
        backdropclose: false
      }
    };

    console.log('Razorpay options:', options);

    // Check if Razorpay is available
    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not loaded');
    }

    // Test the key by creating a Razorpay instance first
    try {
      console.log('Testing Razorpay key validity...');
      const testRazorpay = new window.Razorpay({
        key: razorpayKey,
        amount: 100,
        currency: 'INR',
        name: 'Test',
        handler: function() {}
      });
      console.log('Razorpay key test passed');
    } catch (keyError) {
      console.error('Razorpay key test failed:', keyError);
      throw new Error('Invalid Razorpay key. Please check your configuration.');
    }

    // Open Razorpay checkout
    console.log('Opening Razorpay checkout...');
    const razorpay = new window.Razorpay(options);
    
    razorpay.on('payment.failed', function (response: any) {
      console.error('Payment failed:', response.error);
      alert(`Payment failed: ${response.error.description}`);
    });

    razorpay.open();

    return true;
  } catch (error) {
    console.error('Payment processing error:', error);
    
    // Provide specific error messages
    let errorMessage = 'Payment failed: ';
    if (error instanceof Error) {
      if (error.message.includes('Invalid Razorpay')) {
        errorMessage += 'Invalid payment configuration. Please contact support.';
      } else if (error.message.includes('SDK not loaded')) {
        errorMessage += 'Payment system not available. Please try again.';
      } else {
        errorMessage += error.message;
      }
    } else {
      errorMessage += 'Unknown error occurred.';
    }
    
    alert(errorMessage);
    throw error;
  }
}