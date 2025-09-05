import React, { useState } from 'react';
import { BookOpen, LogOut, Menu, X, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import CreditDisplay from './CreditDisplay';
import { checkIsAdmin } from '../utils/adminApi';

interface NavigationProps {
  userEmail?: string;
  onSignOut: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ userEmail, onSignOut }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  React.useEffect(() => {
    if (userEmail) {
      checkIsAdmin().then(setIsAdmin);
    }
  }, [userEmail]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="font-poppins text-xl sm:text-2xl font-bold text-gray-900">
              Author AI
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <CreditDisplay />
            
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span className="text-sm font-poppins">Admin</span>
              </Link>
            )}
            
            {userEmail && (
              <span className="text-sm text-gray-600 font-poppins max-w-48 truncate">
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
            <div className="px-4 py-4 space-y-4">
              {/* Credits Display - Mobile */}
              <div className="pb-4 border-b border-gray-200">
                <CreditDisplay />
              </div>
              
              {/* Admin Link - Mobile */}
              {isAdmin && (
                <div className="pb-4 border-b border-gray-200">
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center space-x-2 bg-red-100 text-red-700 px-4 py-3 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-poppins">Admin Panel</span>
                  </Link>
                </div>
              )}
              
              {/* User Email - Mobile */}
              {userEmail && (
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Signed in as:</p>
                  <p className="text-sm font-medium text-gray-900 break-all">
                    {userEmail}
                  </p>
                </div>
              )}
              
              {/* Sign Out Button - Mobile */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-poppins">Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navigation;