import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CreditCard, Shield, Star, Check } from 'lucide-react';
import { PaymentPackage } from '../types';
import { CREDIT_PACKAGES, formatCurrency } from '../utils/razorpayConfig';
import { processPayment } from '../utils/paymentProcessor';
import PaymentVerificationModal from './PaymentVerificationModal';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPaymentSuccess }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'INR'>('USD');
  const [selectedPackage, setSelectedPackage] = useState<PaymentPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

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
        onPaymentSuccess: onPaymentSuccess,
        onPaymentComplete: (data) => {
          setPaymentData(data);
          setShowVerificationModal(true);
        }
      });
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerificationSuccess = () => {
    onPaymentSuccess();
    setShowVerificationModal(false);
    onClose();
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] overflow-y-auto"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="min-h-full flex items-center justify-center p-3 sm:p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2.5 pr-8">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-xl flex-shrink-0">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Purchase Credits</h2>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-100">
                <div className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-700">
                    <strong>&#8377;70 = 130 credits</strong> or <strong>$1 = 130 credits</strong>. Each chapter costs only 6 credits.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedCurrency('USD')}
                  className={`p-2 rounded-xl border-2 transition-all text-sm text-center ${
                    selectedCurrency === 'USD'
                      ? 'border-orange-400 bg-orange-50 text-orange-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="font-semibold">USD ($)</div>
                </button>
                <button
                  onClick={() => setSelectedCurrency('INR')}
                  className={`p-2 rounded-xl border-2 transition-all text-sm text-center ${
                    selectedCurrency === 'INR'
                      ? 'border-orange-400 bg-orange-50 text-orange-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="font-semibold">INR (&#8377;)</div>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {CREDIT_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => handlePackageSelect(pkg)}
                    className={`relative p-3 rounded-xl border-2 text-center transition-all ${
                      selectedPackage?.id === pkg.id
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-slate-200 hover:border-slate-300'
                    } ${pkg.popular ? 'ring-2 ring-orange-200' : ''}`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          POPULAR
                        </div>
                      </div>
                    )}
                    <h4 className="font-medium text-slate-900 text-xs mb-0.5">{pkg.name}</h4>
                    <div className="text-lg font-bold text-orange-600">
                      {formatCurrency(
                        selectedCurrency === 'USD' ? pkg.price.usd : pkg.price.inr,
                        selectedCurrency
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{pkg.credits} Credits ({Math.floor(pkg.credits / 6)} ch.)</p>
                    {selectedPackage?.id === pkg.id && (
                      <div className="absolute top-1.5 right-1.5">
                        <Check className="h-4 w-4 text-orange-500" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-100 flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <p className="text-xs text-emerald-700">Encrypted and secure via Razorpay.</p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handlePayment}
                  disabled={!selectedPackage || isProcessing}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-2.5 px-4 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 text-sm"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      <span>Pay with Razorpay</span>
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSuccess={handleVerificationSuccess}
        paymentData={paymentData}
      />
    </>,
    document.body
  );
};

export default PaymentModal;
