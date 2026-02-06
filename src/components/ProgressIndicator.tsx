import React from 'react';
import { AppStep } from '../types';
import { Check, Lightbulb, List, PenTool, BookOpen } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: AppStep;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { id: 'idea', label: 'Idea', icon: Lightbulb },
    { id: 'outlines', label: 'Outlines', icon: List },
    { id: 'writing', label: 'Writing', icon: PenTool },
    { id: 'book', label: 'Book', icon: BookOpen },
  ];

  const stepIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="max-w-2xl mx-auto mb-8 px-2">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < stepIndex;
          const isCurrent = index === stepIndex;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                      : isCurrent
                        ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 ring-4 ring-orange-100'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs sm:text-sm font-medium transition-colors ${
                    isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-1.5 sm:mx-3 mb-5">
                  <div className="h-0.5 rounded-full overflow-hidden bg-slate-200">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500 ${
                        isCompleted ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
