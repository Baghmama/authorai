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
    <div className="max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  index <= stepIndex
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-500 border-orange-500 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}
              >
                {index < stepIndex ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${
                  index <= stepIndex ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.label}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  index < stepIndex
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-500'
                    : 'bg-gray-300'
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