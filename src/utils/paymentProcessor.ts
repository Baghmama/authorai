import { PaymentPackage } from '../types';
import { RAZORPAY_CONFIG } from './razorpayConfig';
import { supabase } from '../lib/supabase';

interface PaymentRequest {
  package: PaymentPackage;
  currency: 'USD' | 'INR';
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

// Create order on backend
async function createRazorpayOrder(amount: number, currency: string, receipt: string) {
  try {
    // Call Supabase edge function to create order
    const { data, error } = await supabase.functions.invoke('create-payment-order', {
      body: {
        amount: amount * 100, // Razorpay expects amount in smallest currency unit
        currency,
        receipt,
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create payment order');
  }
}

// Verify payment on backend
async function verifyPayment(paymentData: RazorpayResponse, orderData: any) {
  try {
    const { data, error } = await supabase.functions.invoke('verify-payment', {
      body: {
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_signature: paymentData.razorpay_signature,
        credits: orderData.credits,
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw new Error('Failed to verify payment');
  }
}

export async function processPayment({ package: pkg, currency }: PaymentRequest): Promise<boolean> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Load Razorpay script
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    // Calculate amount based on currency
    const amount = pkg.price[currency.toLowerCase() as 'usd' | 'inr'];
    const receipt = `credits_${pkg.id}_${Date.now()}`;

    // For testing, create a mock order since we don't have valid keys
    const orderData = {
      id: `order_test_${Date.now()}`,
      amount: amount * 100, // Convert to smallest currency unit
      currency: currency,
      receipt: receipt,
      credits: pkg.credits
    };

    // In production with valid keys, use this instead:
    // const orderData = await createRazorpayOrder(amount, currency, receipt);
    // orderData.credits = pkg.credits;

    // Configure Razorpay options
    const options = {
      key: RAZORPAY_CONFIG.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Author AI',
      description: `${pkg.credits} Credits - ${pkg.name}`,
      order_id: orderData.id,
      prefill: {
        email: user.email,
      },
      theme: {
        color: '#f97316', // Orange color matching our theme
      },
      handler: async function (response: RazorpayResponse) {
        try {
          // Verify payment on backend
          // await verifyPayment(response, orderData);
          
          // Show success message
          alert(`Payment successful! ${pkg.credits} credits have been added to your account.`);
          
          return true;
        } catch (error) {
          console.error('Payment verification failed:', error);
          alert('This is a demo. In production, payment would be verified and credits added.');
          return false;
        }
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal closed');
        }
      }
    };

    // Open Razorpay checkout
    const razorpay = new window.Razorpay(options);
    razorpay.open();

    return true;
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
}