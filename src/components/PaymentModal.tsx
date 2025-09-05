import React, { useState } from 'react';
import { X, CreditCard, Shield, Zap, Star, Check } from 'lucide-react';
import { PaymentPackage } from '../types';
import { CREDIT_PACKAGES, formatCurrency } from '../utils/razorpayConfig';
import { processPayment } from '../utils/paymentProcessor';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPaymentSuccess }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'INR'>('USD');
  const [selectedPackage, setSelectedPackage] = useState<PaymentPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePackageSelect = (pkg: PaymentPackage) => {
    setSelectedPackage(pkg);
  };

  const handlePayment = async () => {
    if (!selectedPackage) return;

    setIsProcessing(true);
    try {
      const success = await processPayment({
        package: selectedPackage,
        currency: selectedCurrency,
      });

      if (success) {
        onPaymentSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 rounded-full">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Purchase Credits</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Currency Selection */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">Payment Ready</h4>
                <p className="text-sm text-green-700">
                  Secure payments powered by Razorpay. Supports multiple currencies and payment methods.
                </p>
              </div>
            </div>
          </div>

          {/* Currency Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Currency</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedCurrency('USD')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedCurrency === 'USD'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">USD ($)</div>
                  <div className="text-sm text-gray-600">US Dollar</div>
                </div>
              </button>
              <button
                onClick={() => setSelectedCurrency('INR')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedCurrency === 'INR'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">INR (₹)</div>
                  <div className="text-sm text-gray-600">Indian Rupee</div>
                </div>
              </button>
            </div>
          </div>
          {/* Package Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Choose Package</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CREDIT_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => handlePackageSelect(pkg)}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPackage?.id === pkg.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${pkg.popular ? 'ring-2 ring-orange-200' : ''}`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>POPULAR</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">{pkg.name}</h4>
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {formatCurrency(
                        selectedCurrency === 'USD' ? pkg.price.usd : pkg.price.inr,
                        selectedCurrency
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      <p>{pkg.credits} Credits</p>
                    </div>
                  </div>
                  
                  {selectedPackage?.id === pkg.id && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-5 w-5 text-orange-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Security Notice */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">Secure Payment</h4>
                <p className="text-sm text-green-700">
                  Your payment information is secure and encrypted. We use Razorpay's industry-standard security measures.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handlePayment}
              disabled={!selectedPackage || isProcessing}
              className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  <span>Pay with Razorpay</span>
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;