import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import LegalPages from './components/LegalPages';
import Auth from './components/Auth';
import AuthCallback from './components/AuthCallback';
import AppContent from './components/AppContent';
import ConfigurationMessage from './components/ConfigurationMessage';
import AdminPanel from './components/AdminPanel';
import AccountSettings from './components/AccountSettings';
import BookOfTheWeek from './components/BookOfTheWeek';
import { User } from './types';
import { supabase } from './lib/supabase';
import { checkIsAdmin } from './utils/adminApi';

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If Supabase is not configured, show configuration message
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error fetching session:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || ''
        });
        
        // Check if user is admin
        checkIsAdmin()
          .then(setIsAdmin)
          .catch(err => {
            console.error('Error checking admin status:', err);
            setIsAdmin(false);
          });
      }
      setLoading(false);
    }).catch(err => {
      console.error('Unexpected error during session check:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || ''
        });
        
        // Check if user is admin
        checkIsAdmin()
          .then(setIsAdmin)
          .catch(() => setIsAdmin(false));
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // Safety timeout: Ensure loading is disabled after 10 seconds even if auth hangs
    const timeout = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          console.warn('Auth initialization timed out, forcing loading to false');
          return false;
        }
        return prev;
      });
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleAuthSuccess = () => {
    // User state will be updated by the auth state change listener
    navigate('/app');
  };

  const handleSignOut = () => {
    supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    navigate('/');
  };

  const handleGetStarted = () => {
    if (!isSupabaseConfigured()) {
      alert('Supabase is not configured. Please set up your environment variables.');
      return;
    }
    console.log('Get Started clicked - navigating to auth page');
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return <ConfigurationMessage />;
  }

  return (
    <Routes>
      {/* Landing page for non-logged-in users */}
      <Route
        path="/"
        element={
          !user ? <LandingPage onGetStarted={handleGetStarted} /> : (
            <AppContent user={user} onSignOut={handleSignOut} />
          )
        }
      />

      {/* OAuth callback handler */}
      <Route
        path="/auth/callback"
        element={<AuthCallback onAuthSuccess={handleAuthSuccess} />}
      />

      {/* Dedicated authentication page */}
      <Route
        path="/auth"
        element={
          !user ? <Auth onAuthSuccess={handleAuthSuccess} /> : (
            <AppContent user={user} onSignOut={handleSignOut} />
          )
        }
      />
      
      {/* App routes for logged-in users */}
      <Route 
        path="/app/*" 
        element={
          user ? <AppContent user={user} onSignOut={handleSignOut} /> : <LandingPage onGetStarted={handleGetStarted} />
        } 
      />
      
      {/* Admin panel route */}
      <Route 
        path="/admin" 
        element={
          user && isAdmin ? (
            <AdminPanel />
          ) : user ? (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-600">You don't have admin privileges.</p>
              </div>
            </div>
          ) : (
            <LandingPage onGetStarted={handleGetStarted} />
          )
        } 
      />
      
      {/* Account settings route */}
      <Route
        path="/account"
        element={
          user ? (
            <AccountSettings user={user} onSignOut={handleSignOut} />
          ) : (
            <LandingPage onGetStarted={handleGetStarted} />
          )
        }
      />

      {/* Book of the Week route - accessible to everyone */}
      <Route
        path="/book-of-week"
        element={
          <BookOfTheWeek
            userEmail={user?.email}
            onSignOut={handleSignOut}
          />
        }
      />

      {/* Legal pages with proper URLs */}
      <Route path="/contact" element={<LegalPages currentPage="contact" />} />
      <Route path="/refund" element={<LegalPages currentPage="refund" />} />
      <Route path="/about" element={<LegalPages currentPage="about" />} />
      <Route path="/terms" element={<LegalPages currentPage="terms" />} />
      <Route path="/privacy" element={<LegalPages currentPage="privacy" />} />
    </Routes>
  );
}

export default App;