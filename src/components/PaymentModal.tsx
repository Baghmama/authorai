import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CreditCard, Shield, Sparkles, Check, Zap, Crown, Rocket, Building2 } from 'lucide-react';
import { PaymentPackage } from '../types';
import { CREDIT_PACKAGES, formatCurrency } from '../utils/razorpayConfig';
import { processPayment } from '../utils/paymentProcessor';
import PaymentVerificationModal from './PaymentVerificationModal';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PACKAGE_ICONS: Record<string, React.ReactNode> = {
  basic: <Zap className="h-5 w-5" />,
  popular: <Crown className="h-5 w-5" />,
  pro: <Rocket className="h-5 w-5" />,
  enterprise: <Building2 className="h-5 w-5" />,
};

const PACKAGE_COLORS: Record<string, { bg: string; border: string; icon: string; accent: string }> = {
  basic: { bg: 'from-sky-50 to-blue-50', border: 'border-sky-200', icon: 'text-sky-600 bg-sky-100', accent: 'text-sky-700' },
  popular: { bg: 'from-orange-50 to-amber-50', border: 'border-orange-300', icon: 'text-orange-600 bg-orange-100', accent: 'text-orange-700' },
  pro: { bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', icon: 'text-emerald-600 bg-emerald-100', accent: 'text-emerald-700' },
  enterprise: { bg: 'from-slate-50 to-slate-100', border: 'border-slate-300', icon: 'text-slate-600 bg-slate-200', accent: 'text-slate-700' },
};

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPaymentSuccess }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'INR'>('USD');
  const [selectedPackage, setSelectedPackage] = useState<PaymentPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!selectedPackage) return;

    setIsProcessing(true);
    try {
      await processPayment({
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] overflow-y-auto animate-[fadeIn_200ms_ease-out]"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="min-h-full flex items-center justify-center p-3 sm:p-6">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden animate-[slideUp_300ms_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-5 py-5 sm:px-6 sm:py-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.15),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(251,191,36,0.1),transparent_50%)]" />

              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative flex items-center gap-3">
                <div className="bg-gradient-to-br from-orange-400 to-amber-500 p-2.5 rounded-xl shadow-lg shadow-orange-500/30">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Get More Credits</h2>
                  <p className="text-sm text-white/60 mt-0.5">Power your book creation</p>
                </div>
              </div>

              <div className="relative mt-4 flex items-center gap-3 bg-white/10 rounded-xl px-3 py-2.5 backdrop-blur-sm">
                <div className="text-orange-300 text-xs font-medium whitespace-nowrap">6 credits = 1 chapter</div>
                <div className="w-px h-4 bg-white/20" />
                <div className="text-amber-300 text-xs font-medium whitespace-nowrap">130 credits = {selectedCurrency === 'USD' ? '$1' : '\u20B970'}</div>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Currency</span>
                <div className="relative flex bg-slate-100 rounded-lg p-0.5">
                  <div
                    className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-white rounded-md shadow-sm transition-transform duration-200 ${
                      selectedCurrency === 'INR' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
                    }`}
                  />
                  <button
                    onClick={() => setSelectedCurrency('USD')}
                    className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                      selectedCurrency === 'USD' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    USD ($)
                  </button>
                  <button
                    onClick={() => setSelectedCurrency('INR')}
                    className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                      selectedCurrency === 'INR' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    INR ({'\u20B9'})
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {CREDIT_PACKAGES.map((pkg) => {
                  const colors = PACKAGE_COLORS[pkg.id] || PACKAGE_COLORS.basic;
                  const icon = PACKAGE_ICONS[pkg.id];
                  const isSelected = selectedPackage?.id === pkg.id;
                  const price = selectedCurrency === 'USD' ? pkg.price.usd : pkg.price.inr;
                  const chapters = Math.floor(pkg.credits / 6);

                  return (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`relative w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 text-left group ${
                        isSelected
                          ? `bg-gradient-to-r ${colors.bg} ${colors.border} shadow-sm`
                          : 'border-slate-150 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-2.5 right-3">
                          <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm shadow-orange-200">
                            BEST VALUE
                          </span>
                        </div>
                      )}

                      <div className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
                        isSelected ? colors.icon : 'text-slate-400 bg-slate-100 group-hover:bg-slate-150'
                      }`}>
                        {icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-sm ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                            {pkg.name}
                          </span>
                          <span className={`text-xs ${isSelected ? colors.accent : 'text-slate-400'}`}>
                            {pkg.credits} credits
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Write up to {chapters} chapter{chapters !== 1 ? 's' : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-lg font-bold tabular-nums ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                          {formatCurrency(price, selectedCurrency)}
                        </span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500'
                            : 'border-slate-300 group-hover:border-slate-400'
                        }`}>
                          {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handlePayment}
                disabled={!selectedPackage || isProcessing}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-3 px-5 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-orange-500 disabled:hover:to-amber-500 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.99]"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4.5 w-4.5" />
                    <span>{selectedPackage ? `Pay ${formatCurrency(selectedCurrency === 'USD' ? selectedPackage.price.usd : selectedPackage.price.inr, selectedCurrency)}` : 'Select a package'}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-slate-400">
                <Shield className="h-3.5 w-3.5" />
                <span className="text-xs">Secured by Razorpay. 256-bit encryption.</span>
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
