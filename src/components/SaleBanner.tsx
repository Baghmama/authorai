import React, { useState } from 'react';
import { X, ShoppingCart, Sparkles } from 'lucide-react';
import PaymentModal from './PaymentModal';
import { getUserCredits } from '../utils/creditManager';

const SaleBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleBuyCredits = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    await getUserCredits();
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <Sparkles className="h-5 w-5 animate-pulse text-yellow-300" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <span className="font-bold text-lg">November Sale is Live!</span>
                <span className="text-sm text-purple-100">Get amazing discounts on credit packages</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleBuyCredits}
                className="bg-white text-purple-600 font-semibold px-4 py-2 rounded-lg hover:bg-purple-50 transition-all duration-200 flex items-center space-x-2 shadow-md"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Buy Credits</span>
                <span className="sm:hidden">Buy</span>
              </button>

              <button
                onClick={handleClose}
                className="text-white hover:text-purple-200 transition-colors p-1 rounded-lg hover:bg-purple-700/50"
                aria-label="Close banner"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-300 via-pink-300 to-yellow-300 animate-pulse"></div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default SaleBanner;
