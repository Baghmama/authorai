import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, RefreshCw, Mail, Copy, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    credits: number;
  };
}

type VerificationStatus = 'verifying' | 'success' | 'failed' | 'manual';

const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  paymentData
}) => {
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [retryCount, setRetryCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && paymentData) {
      verifyPayment();
    }
  }, [isOpen, paymentData]);

  const verifyPayment = async () => {
    setStatus('verifying');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      console.log('Calling verify-payment function with data:', paymentData);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      console.log('Verify-payment response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Verify-payment error response:', errorText);
        throw new Error(`Verification failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Verify-payment success result:', result);
      
      setStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Payment verification error:', error);
      
      if (retryCount < 2) {
        // Retry up to 2 times
        console.log(`Retrying payment verification (attempt ${retryCount + 1}/2)`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          verifyPayment();
        }, 3000);
      } else {
        setStatus('failed');
      }
    }
  };

  const handleManualVerification = () => {
    setStatus('manual');
  };

  const copyPaymentDetails = () => {
    const details = `Payment ID: ${paymentData.razorpay_payment_id}
Order ID: ${paymentData.razorpay_order_id}
Credits: ${paymentData.credits}
Signature: ${paymentData.razorpay_signature}`;
    
    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendSupportEmail = () => {
    const subject = encodeURIComponent('Payment Verification Issue - Author AI');
    const body = encodeURIComponent(`Hi,

I made a payment but the automatic verification failed. Please help me add credits to my account.

Payment Details:
- Payment ID: ${paymentData.razorpay_payment_id}
- Order ID: ${paymentData.razorpay_order_id}
- Credits: ${paymentData.credits}
- Signature: ${paymentData.razorpay_signature}

Please add ${paymentData.credits} credits to my account.

Thank you!`);
    
    window.open(`mailto:sv@goodaiclub.com?subject=${subject}&body=${body}`);
  };

  if (!isOpen) return null;

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Verifying Payment</h3>
            <p className="text-gray-600 mb-4">
              Please wait while we verify your payment and add credits to your account...
            </p>
            {retryCount > 0 && (
              <p className="text-sm text-orange-600">
                Retry attempt {retryCount}/2
              </p>
            )}
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Verified!</h3>
            <p className="text-gray-600 mb-4">
              {paymentData.credits} credits have been added to your account successfully.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                You can now use your credits to generate book chapters!
              </p>
            </div>
          </div>
        );

      case 'failed':
        return (
          <div className="text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h3>
            <p className="text-gray-600 mb-6">
              We couldn't automatically verify your payment. Don't worry - your payment was successful!
            </p>
            
            <div className="space-y-4">
              <button
                onClick={verifyPayment}
                className="w-full bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Try Again</span>
              </button>
              
              <button
                onClick={handleManualVerification}
                className="w-full bg-orange-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Get Manual Help
              </button>
            </div>
          </div>
        );

      case 'manual':
        return (
          <div>
            <div className="text-center mb-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Manual Verification</h3>
              <p className="text-gray-600">
                We'll help you manually verify your payment and add credits to your account.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Payment Details:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono text-gray-900">{paymentData.razorpay_payment_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono text-gray-900">{paymentData.razorpay_order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Credits:</span>
                  <span className="font-semibold text-green-600">{paymentData.credits}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={copyPaymentDetails}
                className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Copy className="h-5 w-5" />
                <span>{copied ? 'Copied!' : 'Copy Payment Details'}</span>
              </button>
              
              <button
                onClick={sendSupportEmail}
                className="w-full bg-orange-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Mail className="h-5 w-5" />
                <span>Contact Support</span>
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex items-start space-x-2">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-900 font-medium text-sm">Expected Response Time</p>
                  <p className="text-blue-700 text-sm">We typically respond within 2-4 hours during business hours.</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[70] p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Payment Verification</h2>
          {status !== 'verifying' && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="p-4 sm:p-5">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PaymentVerificationModal;