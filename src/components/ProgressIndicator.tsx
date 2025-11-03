import React from 'react';
import { AppStep } from '../types';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: AppStep;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { id: 'idea', label: 'Idea', description: 'Share your concept' },
    { id: 'outlines', label: 'Outlines', description: 'Review chapters' },
    { id: 'writing', label: 'Writing', description: 'Generate content' },
    { id: 'book', label: 'Book', description: 'Download result' }
  ];

  const stepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="max-w-4xl mx-auto mb-8 animate-fade-in">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 font-semibold transition-all duration-300 ${
                  index <= stepIndex
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-500 border-orange-500 text-white shadow-glow'
                    : 'bg-white border-gray-200 text-gray-400 shadow-card'
                }`}
              >
                {index < stepIndex ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>
              <div className="mt-3 text-center">
                <div className={`text-sm font-semibold transition-colors duration-300 ${
                  index <= stepIndex ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{step.description}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                  index < stepIndex
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-500 shadow-glow'
                    : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;