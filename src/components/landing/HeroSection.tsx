import React from 'react';
import { ArrowRight, Star, Sparkles } from 'lucide-react';
import ServiceSuspensionBanner from '../ServiceSuspensionBanner';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <>
      <ServiceSuspensionBanner />
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="hero-mesh absolute inset-0" />

        <div className="absolute top-24 right-[15%] w-72 h-72 bg-orange-500/[0.07] rounded-full blur-3xl" />
        <div className="absolute bottom-16 left-[10%] w-56 h-56 bg-amber-500/[0.05] rounded-full blur-3xl" />

        <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <img
                src="/android-chrome-192x192.png"
                alt="Author AI logo"
                className="h-9 w-9 rounded-xl"
              />
              <span className="font-poppins text-xl font-bold text-white">
                Author AI
              </span>
            </div>
            <button
              onClick={onGetStarted}
              className="bg-white/10 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl border border-white/15 hover:bg-white/20 transition-all duration-300 font-medium text-sm"
              type="button"
              aria-label="Get Started"
            >
              Get Started
            </button>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 sm:pt-16 sm:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-300 text-sm font-medium px-4 py-2 rounded-full mb-8">
                <Sparkles className="h-4 w-4" />
                <span>AI-Powered Book Writing</span>
              </div>

              <h1 className="font-poppins text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1] mb-6 tracking-tight">
                Transform Your Ideas Into{' '}
                <span className="gradient-text">Complete Books</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-xl leading-relaxed">
                Turn book concepts into professionally written chapters. Create fiction,
                non-fiction, or educational content in minutes, not months.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-12">
                <button
                  onClick={onGetStarted}
                  className="group bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 font-semibold text-lg flex items-center gap-3 shadow-lg shadow-orange-500/25 animate-pulse-glow"
                  type="button"
                >
                  <span>Start Writing Your Book</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
                <div className="flex items-center gap-2 text-slate-400">
                  <Star className="h-5 w-5 text-amber-400" />
                  <span className="font-medium">Free 30 credits to start</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-8 sm:gap-12">
                <div>
                  <div className="text-3xl font-bold text-white">1,000+</div>
                  <div className="text-sm text-slate-500 mt-1">Books Created</div>
                </div>
                <div className="border-l border-slate-800 pl-8 sm:pl-12">
                  <div className="text-3xl font-bold text-white">11</div>
                  <div className="text-sm text-slate-500 mt-1">Languages</div>
                </div>
                <div className="border-l border-slate-800 pl-8 sm:pl-12">
                  <div className="text-3xl font-bold text-white">5 min</div>
                  <div className="text-sm text-slate-500 mt-1">Avg. Generation</div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative animate-float" style={{ perspective: '1000px' }}>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-orange-500/15 blur-2xl rounded-full" />

                <div className="absolute top-5 left-5 right-0 bottom-0 bg-white/[0.03] rounded-2xl border border-white/[0.06] transform rotate-3" />
                <div className="absolute top-2.5 left-2.5 right-0.5 bottom-0.5 bg-white/[0.05] rounded-2xl border border-white/[0.08] transform rotate-[1.5deg]" />

                <div
                  className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.12] p-8 shadow-2xl"
                  style={{ transform: 'rotateY(-4deg) rotateX(2deg)' }}
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="h-3 bg-white/30 rounded-full w-28" />
                    <div className="ml-auto h-2.5 bg-white/10 rounded-full w-16" />
                  </div>

                  <div className="h-5 bg-white/20 rounded-full w-4/5 mb-3" />
                  <div className="h-5 bg-white/15 rounded-full w-3/5 mb-8" />

                  <div className="space-y-2.5">
                    <div className="h-2.5 bg-white/[0.08] rounded-full w-full" />
                    <div className="h-2.5 bg-white/[0.08] rounded-full w-11/12" />
                    <div className="h-2.5 bg-white/[0.08] rounded-full w-full" />
                    <div className="h-2.5 bg-white/[0.08] rounded-full w-4/5" />
                    <div className="h-2.5 bg-white/[0.08] rounded-full w-full" />
                    <div className="h-2.5 bg-white/[0.08] rounded-full w-3/4" />
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/[0.08]">
                    <div className="h-4 bg-orange-500/20 rounded-full w-2/5 mb-4" />
                    <div className="space-y-2.5">
                      <div className="h-2.5 bg-white/[0.08] rounded-full w-full" />
                      <div className="h-2.5 bg-white/[0.08] rounded-full w-5/6" />
                      <div className="h-2.5 bg-white/[0.08] rounded-full w-full" />
                      <div className="h-2.5 bg-white/[0.08] rounded-full w-2/3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
      </section>
    </>
  );
};

export default HeroSection;
