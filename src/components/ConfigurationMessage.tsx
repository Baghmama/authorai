import React from 'react';
import { AlertTriangle, Database, Settings } from 'lucide-react';

const ConfigurationMessage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <h2 className="font-poppins text-3xl font-bold text-gray-900 mb-2">
            Configuration Required
          </h2>
          <p className="text-gray-600 mb-8">
            Supabase environment variables are missing
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <Database className="h-6 w-6 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Missing Environment Variables</h3>
                <p className="text-gray-600 text-sm mb-4">
                  The following environment variables need to be configured:
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="font-mono bg-gray-100 px-2 py-1 rounded">VITE_SUPABASE_URL</li>
                  <li className="font-mono bg-gray-100 px-2 py-1 rounded">VITE_SUPABASE_ANON_KEY</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Settings className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How to Fix</h3>
                <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                  <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 underline">supabase.com</a></li>
                  <li>Get your project URL and anon key from Settings → API</li>
                  <li>Add them to your deployment environment variables</li>
                  <li>Redeploy the application</li>
                </ol>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> The application requires a properly configured Supabase database to function.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationMessage;