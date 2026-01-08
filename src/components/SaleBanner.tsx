import React, { useState } from 'react';
import { X, ShoppingCart, Snowflake } from 'lucide-react';
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
      <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white shadow-lg overflow-hidden">
        <style>{`
          @keyframes snowfall {
            0% {
              transform: translateY(-10px) translateX(0);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(100px) translateX(10px);
              opacity: 0;
            }
          }
          .snowflake {
            position: absolute;
            top: -10px;
            color: white;
            opacity: 0.8;
            animation: snowfall linear infinite;
            pointer-events: none;
          }
        `}</style>

        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="snowflake"
            style={{
              left: `${(i * 7) % 100}%`,
              fontSize: `${10 + (i % 3) * 4}px`,
              animationDuration: `${3 + (i % 4)}s`,
              animationDelay: `${(i % 5) * 0.5}s`,
            }}
          >
            ❄
          </div>
        ))}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <Snowflake className="h-5 w-5 animate-pulse text-white" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <span className="font-bold text-lg">New Year Sale is Live!</span>
                <span className="text-sm text-purple-100">Credits Packs Starting from Just $1</span>
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
