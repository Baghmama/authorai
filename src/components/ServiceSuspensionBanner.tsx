import React from 'react';
import { AlertCircle } from 'lucide-react';

const IS_ACTIVE = false;

const ServiceSuspensionBanner: React.FC = () => {
  if (!IS_ACTIVE) return null;

  return (
    <div className="bg-red-600 text-white py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-3">
        <AlertCircle className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
        <p className="text-center font-medium">
          Due to heavy workload, our service is currently suspended for a few hours. Please try again later.
        </p>
      </div>
    </div>
  );
};

export default ServiceSuspensionBanner;
