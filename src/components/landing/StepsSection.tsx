import React from 'react';
import { Lightbulb, ListChecks, PenLine, FileDown } from 'lucide-react';
import AnimateOnScroll from './AnimateOnScroll';

const steps = [
  {
    number: '01',
    icon: Lightbulb,
    title: 'Share Your Idea',
    description: 'Describe your book concept, choose the type, language, and number of chapters.',
  },
  {
    number: '02',
    icon: ListChecks,
    title: 'Review Outlines',
    description: 'AI generates detailed chapter outlines. Edit and customize them to match your vision.',
  },
  {
    number: '03',
    icon: PenLine,
    title: 'Generate Content',
    description: 'AI writes complete chapters based on your outlines. Professional quality in minutes.',
  },
  {
    number: '04',
    icon: FileDown,
    title: 'Download & Publish',
    description: 'Export your book as PDF or Word document. Ready for self-publishing or editing.',
  },
];

const StepsSection: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll>
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-3">
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Four simple steps to your book
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From idea to finished manuscript in minutes
            </p>
          </div>
        </AnimateOnScroll>

        <div className="relative">
          <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-0.5">
            <div className="step-connector w-full h-full opacity-30" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <AnimateOnScroll key={step.number} delay={index * 120}>
                <div className="relative text-center lg:text-center">
                  <div className="relative inline-flex mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <step.icon className="h-7 w-7 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white">
                      {step.number.replace('0', '')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600 text-[15px] leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StepsSection;
