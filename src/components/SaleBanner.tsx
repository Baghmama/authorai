import React, { useState } from 'react';
import { X, ShoppingCart, Heart } from 'lucide-react';
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
      <div className="relative bg-gradient-to-r from-rose-600 via-pink-500 to-rose-600 text-white shadow-lg overflow-hidden">
        <style>{`
          @keyframes floatHeart {
            0% {
              transform: translateY(10px) scale(0.8) rotate(0deg);
              opacity: 0;
            }
            15% {
              opacity: 0.7;
            }
            85% {
              opacity: 0.7;
            }
            100% {
              transform: translateY(-80px) scale(1.1) rotate(15deg);
              opacity: 0;
            }
          }
          .floating-heart {
            position: absolute;
            bottom: -10px;
            pointer-events: none;
            animation: floatHeart linear infinite;
          }
        `}</style>

        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="floating-heart text-pink-200/60"
            style={{
              left: `${(i * 8.5) % 100}%`,
              fontSize: `${10 + (i % 3) * 5}px`,
              animationDuration: `${3 + (i % 4)}s`,
              animationDelay: `${(i % 6) * 0.6}s`,
            }}
          >
            &#x2764;
          </div>
        ))}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <Heart className="h-5 w-5 animate-pulse text-pink-200 fill-pink-200" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <span className="font-bold text-lg">Valentine's Month Sale is Live!</span>
                <span className="text-sm text-pink-100">Credit Packs Starting from Just $1</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleBuyCredits}
                className="bg-white text-rose-600 font-semibold px-4 py-2 rounded-lg hover:bg-pink-50 transition-all duration-200 flex items-center space-x-2 shadow-md"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Buy Credits</span>
                <span className="sm:hidden">Buy</span>
              </button>

              <button
                onClick={handleClose}
                className="text-white hover:text-pink-200 transition-colors p-1 rounded-lg hover:bg-rose-700/50"
                aria-label="Close banner"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-300 via-red-300 to-pink-300 animate-pulse"></div>
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
