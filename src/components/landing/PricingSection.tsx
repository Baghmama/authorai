import React from 'react';
import { Check, Coins } from 'lucide-react';
import AnimateOnScroll from './AnimateOnScroll';

interface PricingSectionProps {
  onGetStarted: () => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onGetStarted }) => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll>
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-3">
              Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Pay only for what you use. No subscriptions, no hidden fees.
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll>
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500" />

              <div className="p-8 sm:p-10">
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <Coins className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Credit-Based System</h3>
                </div>

                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-slate-900">&#8377;70</span>
                    <span className="text-slate-500 text-lg">=</span>
                    <span className="text-5xl font-bold gradient-text">130</span>
                    <span className="text-slate-500 text-lg">credits</span>
                  </div>
                  <p className="text-slate-500 mt-2">Each chapter costs only 6 credits to generate</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { chapters: '1 Chapter', credits: '6 Credits', price: '~\u20B93.20' },
                    { chapters: '21 Chapters', credits: '130 Credits', price: '\u20B970' },
                    { chapters: '43 Chapters', credits: '260 Credits', price: '\u20B9140' },
                  ].map((tier) => (
                    <div
                      key={tier.chapters}
                      className="bg-slate-50 rounded-xl p-5 text-center border border-slate-100"
                    >
                      <div className="text-sm font-semibold text-slate-900 mb-1">{tier.chapters}</div>
                      <div className="text-orange-600 font-bold text-sm">{tier.credits}</div>
                      <div className="text-xs text-slate-400 mt-1">{tier.price}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-8">
                  <div className="flex items-center justify-center gap-2 text-emerald-700">
                    <Check className="h-5 w-5" />
                    <span className="font-semibold">30 free credits for new users</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 text-center mb-6">
                  Prices include all taxes - we handle the tax compliance for you
                </p>

                <div className="text-center">
                  <button
                    onClick={onGetStarted}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-10 py-4 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 font-semibold text-lg shadow-lg shadow-orange-500/20"
                    type="button"
                  >
                    Start Writing for Free
                  </button>
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default PricingSection;
