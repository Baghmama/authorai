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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 w-full md:w-auto">
      <div className="flex items-center justify-between space-x-2">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 rounded-full">
            <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Available Credits</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {credits?.credits ?? 0}
            </p>
          </div>
        </div>
        
        <button
          onClick={openPurchaseModal}
          className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-gray-700 transition-colors p-1"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="text-xs sm:text-sm hidden sm:inline">Shop</span>
        </button>
      </div>

      {credits && credits.credits < 6 && (
        <div className="mt-3 sm:mt-4 bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-xs sm:text-sm text-red-700">
              Insufficient credits for chapter generation (6 credits required per chapter)
            </p>
          </div>
        </div>
      )}

      </div>

      {/* Purchase Credits Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 rounded-full">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Purchase Credits</h2>
              </div>
              <button
                onClick={closePurchaseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Pricing */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing</h3>
                <div className="text-2xl font-bold text-orange-600">
                  $1 USD = 90 Credits
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Each chapter generation costs 6 credits
                </p>
              </div>

              {/* Manual Process Notice */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Demo & Manual Options</h4>
                    <p className="text-sm text-blue-700">
                      The Razorpay integration is in demo mode. For real credit purchases, 
                      message me on X (Twitter) and I'll update your balance after payment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Button */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Try Demo Payment</span>
                </button>

                <div className="text-center text-sm text-gray-500">or</div>

                <button
                  onClick={openTwitter}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Message on X (Twitter)</span>
                </button>
              </div>

              {/* Instructions */}
              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-medium">How it works:</p>
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