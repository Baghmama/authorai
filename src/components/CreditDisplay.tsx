import React, { useState, useEffect } from 'react';
import { Coins, ShoppingCart, AlertCircle, X, MessageCircle, CreditCard, Shield } from 'lucide-react';
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

  const renderPurchaseModal = () => {
    if (!showPurchaseModal) return null;

    return (
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
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing</h3>
              <div className="text-2xl font-bold text-orange-600">
                ₹1 = 10 Credits | $0.10 = 10 Credits
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Each chapter generation costs 6 credits
              </p>
            </div>

            {/* Manual Process Notice */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Secure Payments</h4>
                  <p className="text-sm text-gray-600">
                    Purchase credits securely using Razorpay. Supports cards, UPI, net banking, and wallets.
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
                <span>Purchase Credits</span>
              </button>
            </div>

            {/* Payment Methods */}
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-2">Accepted Payment Methods:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>• Credit/Debit Cards</div>
                <div>• UPI</div>
                <div>• Net Banking</div>
                <div>• Digital Wallets</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-1.5 rounded-full">
            <Coins className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 leading-none">Credits</p>
            <p className="text-lg font-bold text-gray-900 leading-none">
              {credits?.credits ?? 0}
            </p>
          </div>
        </div>
        
        <button
          onClick={openPurchaseModal}
          className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="text-xs font-medium">Buy</span>
        </button>

        {credits && credits.credits < 6 && (
          <div className="flex items-center space-x-1 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Low Credits</span>
          </div>
        )}
      </div>

      {/* Purchase Credits Modal */}
      {renderPurchaseModal()}

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