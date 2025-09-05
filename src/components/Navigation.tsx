import React, { useState } from 'react';
import { BookOpen, LogOut, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CreditDisplay from './CreditDisplay';

interface NavigationProps {
  userEmail?: string;
  onSignOut: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ userEmail, onSignOut }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="glass border-b border-white/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="font-poppins text-xl sm:text-2xl font-bold text-white">
              Author AI
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <CreditDisplay />
            
            {userEmail && (
              <span className="text-sm text-glass-muted font-poppins max-w-48 truncate">
                {userEmail}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-glass-muted hover:text-glass transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-poppins">Sign Out</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-glass-muted hover:text-glass hover:bg-white/10 transition-colors"
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
          <div className="md:hidden absolute top-16 left-0 right-0 glass border-b border-white/20 shadow-lg z-50">
            <div className="px-4 py-4 space-y-4">
              {/* Credits Display - Mobile */}
              <div className="pb-4 border-b border-white/20">
                <CreditDisplay />
              </div>
              
              {/* User Email - Mobile */}
              {userEmail && (
                <div className="pb-4 border-b border-white/20">
                  <p className="text-sm text-glass-subtle mb-1">Signed in as:</p>
                  <p className="text-sm font-medium text-glass break-all">
                    {userEmail}
                  </p>
                </div>
              )}
              
              {/* Sign Out Button - Mobile */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center space-x-2 glass-button text-glass px-4 py-3 rounded-lg transition-colors"
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