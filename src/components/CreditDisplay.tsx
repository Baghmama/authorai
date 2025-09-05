import React, { useState, useEffect } from 'react';
import { Coins, ShoppingCart, AlertCircle, X, MessageCircle, CreditCard } from 'lucide-react';
import { getUserCredits, getCreditTransactions, UserCredits, CreditTransaction } from '../utils/creditManager';
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

  const openPurchaseModal = () => {
    setShowPurchaseModal(true);
  };

  const closePurchaseModal = () => {
    setShowPurchaseModal(false);
  };

  const openTwitter = () => {
    window.open('https://x.com/shuvodip99', '_blank');
  };

  const handlePaymentSuccess = () => {
    loadCredits(); // Refresh credits after successful payment
    setShowPaymentModal(false);
    setShowPurchaseModal(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="w-20 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 glass rounded-lg px-3 py-2">
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-1.5 rounded-full">
            <Coins className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs text-glass-subtle leading-none">Credits</p>
            <p className="text-lg font-bold text-white leading-none">
              {credits?.credits ?? 0}
            </p>
          </div>
        </div>
        
        <button
          onClick={openPurchaseModal}
          className="flex items-center space-x-1 text-glass-subtle hover:text-glass transition-colors p-2 rounded-lg hover:bg-white/10"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="text-xs font-medium">Buy</span>
        </button>

        {credits && credits.credits < 6 && (
          <div className="flex items-center space-x-1 text-red-300">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Low Credits</span>
          </div>
        )}

      </div>

      {/* Purchase Credits Modal */}
      {showPurchaseModal && (
        )
        }
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 rounded-full">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
               <h2 className="text-xl font-bold text-glass">Purchase Credits</h2>
              </div>
              <button
                onClick={closePurchaseModal}
               className="text-glass-subtle hover:text-glass transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Pricing */}
              <div className="glass rounded-lg p-4 border border-orange-400/30">
               <h3 className="text-lg font-semibold text-glass mb-2">Pricing</h3>
                <div className="text-2xl font-bold text-yellow-300">
                  $1 USD = 90 Credits
                </div>
               <p className="text-sm text-glass-muted mt-1">
                  Each chapter generation costs 6 credits
                </p>
              </div>

              {/* Manual Process Notice */}
              <div className="glass rounded-lg p-4 border border-blue-400/30">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-glass mb-1">Payment Options</h4>
                    <p className="text-sm text-glass-muted">
                      Razorpay integration is coming soon! For now, message me on X (Twitter) 
                      to purchase credits and I'll update your balance manually after payment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Button */}
              <div className="space-y-3">
                <button
                  onClick={openTwitter}
                  className="w-full glass-button text-glass font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Message on X (Twitter)</span>
                </button>
              </div>

              {/* Instructions */}
              <div className="text-sm text-white/80 space-y-2">
             <div className="text-sm text-glass-muted space-y-2">
               <p className="font-medium text-glass">How it works:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Click the button above to message me on X</li>
                  <li>Let me know how many credits you want to purchase</li>
                  <li>I'll provide payment instructions</li>
                  <li>After payment, I'll manually add credits to your account</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default CreditDisplay;