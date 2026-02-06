import React, { useState } from 'react';
import { Menu, X, Shield, Settings, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreditDisplay from './CreditDisplay';
import { checkIsAdmin } from '../utils/adminApi';

interface NavigationProps {
  userEmail?: string;
  onSignOut?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ userEmail }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  React.useEffect(() => {
    if (userEmail) {
      checkIsAdmin().then(setIsAdmin);
    }
  }, [userEmail]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/android-chrome-192x192.png"
              alt="Author AI Logo"
              className="h-8 w-8 rounded-xl shadow-sm group-hover:shadow-md transition-shadow"
            />
            <span className="font-poppins text-xl font-bold text-slate-900">
              Author AI
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <CreditDisplay />

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium"
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}

            <Link
              to="/account"
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium"
            >
              <Settings className="h-4 w-4" />
              <span>Account</span>
            </Link>

            {userEmail && (
              <div className="ml-1 pl-3 border-l border-slate-200">
                <span className="text-sm text-slate-500 max-w-[180px] truncate block">
                  {userEmail}
                </span>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <CreditDisplay />
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-lg transition-all duration-200 ease-out z-50 ${
          isMobileMenuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="px-4 py-3 space-y-1">
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Admin Panel</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          )}

          <Link
            to="/account"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Account Settings</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>

          {userEmail && (
            <div className="px-4 py-3 mt-1 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-0.5">Signed in as</p>
              <p className="text-sm font-medium text-slate-700 break-all">
                {userEmail}
              </p>
            </div>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navigation;
