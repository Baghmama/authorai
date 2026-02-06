import React, { useState, useEffect } from 'react';
import { Coins, ShoppingCart, AlertCircle } from 'lucide-react';
import { getUserCredits, UserCredits } from '../utils/creditManager';
import PaymentModal from './PaymentModal';

const CreditDisplay: React.FC = () => {
  const [credits, setCredits] = useState<UserCredits | null>(null);
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
          onClick={() => setShowPaymentModal(true)}
          className="flex items-center gap-1 text-slate-600 hover:text-orange-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-orange-50 text-xs font-medium"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Buy Credits</span>
        </button>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default CreditDisplay;
