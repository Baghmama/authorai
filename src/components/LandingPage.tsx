import React from 'react';
import { ArrowRight } from 'lucide-react';
import HeroSection from './landing/HeroSection';
import FeaturesSection from './landing/FeaturesSection';
import StepsSection from './landing/StepsSection';
import PricingSection from './landing/PricingSection';
import AnimateOnScroll from './landing/AnimateOnScroll';
import Footer from './Footer';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection onGetStarted={onGetStarted} />

      <AnimateOnScroll>
        <section className="py-12 bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-medium text-slate-500 mb-5 uppercase tracking-wider">
              Also available on mobile
            </p>
            <a
              href="https://play.google.com/store/apps/details?id=tech.authorai.twa&pcampaignid=web_share"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 bg-slate-900 text-white pl-5 pr-7 py-3.5 rounded-2xl hover:bg-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              <svg
                className="h-8 w-8"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-widest text-slate-400">Get it on</div>
                <div className="text-lg font-semibold leading-tight">Google Play</div>
              </div>
            </a>
          </div>
        </section>
      </AnimateOnScroll>

      <FeaturesSection />

      <StepsSection />

      <PricingSection onGetStarted={onGetStarted} />

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimateOnScroll>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to write your book?
            </h2>
            <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of authors who have already transformed their ideas into complete books.
              Start your writing journey today with 30 free credits.
            </p>
            <button
              onClick={onGetStarted}
              className="group bg-gradient-to-r from-orange-500 to-amber-500 text-white px-10 py-4 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 font-semibold text-lg shadow-lg shadow-orange-500/25 inline-flex items-center gap-3"
              type="button"
            >
              <span>Get Started - It's Free</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </AnimateOnScroll>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
