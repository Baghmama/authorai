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

// Create order on backend (simplified for testing)
async function createRazorpayOrder(amount: number, currency: string, receipt: string) {
  try {
    console.log('Creating Razorpay order:', { amount, currency, receipt });
    
    // For now, let's create a mock order that works with Razorpay
    // In production, this would call your backend
    const mockOrder = {
      id: `order_${Date.now()}`,
      amount: amount * 100, // Convert to smallest currency unit
      currency: currency,
      receipt: receipt,
      status: 'created'
    };
    
    console.log('Mock order created:', mockOrder);
    return mockOrder;
    
    // Uncomment this when your Supabase functions are ready:
    /*
    const { data, error } = await supabase.functions.invoke('create-payment-order', {
      body: {
        amount: amount * 100,
        currency,
        receipt,
      },
    });

    if (error) throw error;
    return data;
    */
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create payment order');
  }
}

// Verify payment (simplified for testing)
async function verifyPayment(paymentData: RazorpayResponse, orderData: any) {
  try {
    console.log('Verifying payment:', paymentData);
    
    // For testing, we'll just simulate success
    // In production, this would verify the signature
    console.log('Payment verification simulated as successful');
    return { success: true };
    
    // Uncomment this when your Supabase functions are ready:
    /*
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
    */
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw new Error('Failed to verify payment');
  }
}

export async function processPayment({ package: pkg, currency }: PaymentRequest): Promise<boolean> {
  try {
    console.log('Starting payment process:', { package: pkg, currency });
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    console.log('User authenticated:', user.email);

    // Load Razorpay script
    console.log('Loading Razorpay script...');
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }
    console.log('Razorpay script loaded successfully');

    // Calculate amount based on currency
    const amount = pkg.price[currency.toLowerCase() as 'usd' | 'inr'];
    const receipt = `credits_${pkg.id}_${Date.now()}`;
    
    console.log('Payment details:', { amount, currency, receipt });

    // Create Razorpay order
    const orderData = await createRazorpayOrder(amount, currency, receipt);
    orderData.credits = pkg.credits;
    
    console.log('Order created:', orderData);

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
          console.log('Payment successful, response:', response);
          
          // Verify payment on backend
          await verifyPayment(response, orderData);
          
          // Show success message
          alert(`Payment successful! ${pkg.credits} credits have been added to your account.`);
          return true;
        } catch (error) {
          console.error('Payment verification failed:', error);
          alert('Payment verification failed. Please contact support if payment was deducted.');
          return false;
        }
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal closed by user');
        }
      }
    };

    console.log('Razorpay options:', options);

    // Check if Razorpay is available
    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not loaded');
    }

    // Open Razorpay checkout
    console.log('Opening Razorpay checkout...');
    const razorpay = new window.Razorpay(options);
    razorpay.open();

    return true;
  } catch (error) {
    console.error('Payment processing error:', error);
    alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}