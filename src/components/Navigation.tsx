import React from 'react';
import { BookOpen, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CreditDisplay from './CreditDisplay';

interface NavigationProps {
  userEmail?: string;
  onSignOut: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ userEmail, onSignOut }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="font-poppins text-2xl font-bold text-gray-900">
              Author AI
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <CreditDisplay />
            
            {userEmail && (
              <span className="text-sm text-gray-600 font-poppins">
                {userEmail}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-poppins">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;