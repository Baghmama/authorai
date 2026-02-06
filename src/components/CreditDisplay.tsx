import React, { useState, useEffect } from 'react';
import { Coins, ShoppingCart, AlertCircle, X, CreditCard, Shield } from 'lucide-react';
import { getUserCredits, UserCredits } from '../utils/creditManager';
import PaymentModal from './PaymentModal';

const CreditDisplay: React.FC = () => {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    setLoading(true);
    try {
      const userCredits = await getUserCredits();
      setCredits(userCredits);
    } catch (error) {
      console.error('Error loading credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    loadCredits();
    setShowPaymentModal(false);
    setShowPurchaseModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200/60">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-7 h-7 bg-slate-200 rounded-full" />
          <div className="w-10 h-4 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-200/60">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-1 rounded-lg">
            <Coins className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-900 tabular-nums">
            {credits?.credits ?? 0}
          </span>
          {credits && credits.credits < 6 && (
            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
          )}
        </div>

        <button
          onClick={() => setShowPurchaseModal(true)}
          className="flex items-center gap-1 text-slate-600 hover:text-orange-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-orange-50 text-xs font-medium"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Buy</span>
        </button>
      </div>

      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-xl">
                  <ShoppingCart className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Purchase Credits</h2>
              </div>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Pricing</h3>
                <div className="text-xl font-bold text-orange-600">
                  &#8377;70 = 130 Credits | $1 = 130 Credits
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Each chapter generation costs 6 credits
                </p>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-slate-900 text-sm mb-0.5">Secure Payments</h4>
                    <p className="text-xs text-slate-600">
                      Purchase credits securely using Razorpay. Supports cards, UPI, net banking, and wallets.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
              >
                <CreditCard className="h-5 w-5" />
                <span>Purchase Credits</span>
              </button>

              <div className="text-xs text-slate-500">
                <p className="font-medium text-slate-700 mb-1.5">Accepted Payment Methods:</p>
                <div className="grid grid-cols-2 gap-1 text-slate-500">
                  <span>Credit/Debit Cards</span>
                  <span>UPI</span>
                  <span>Net Banking</span>
                  <span>PayPal</span>
                  <span>Digital Wallets</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default CreditDisplay;
