import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import LegalPages from './components/LegalPages';
import Auth from './components/Auth';
import AppContent from './components/AppContent';
import ConfigurationMessage from './components/ConfigurationMessage';
import { User } from './types';
import { supabase } from './lib/supabase';

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If Supabase is not configured, show configuration message
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || ''
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || ''
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    // User state will be updated by the auth state change listener
    setShowAuth(false);
    navigate('/app');
  };

  const handleSignOut = () => {
    supabase.auth.signOut();
    setUser(null);
    setShowAuth(false);
    navigate('/');
  };

  const handleGetStarted = () => {
    if (!isSupabaseConfigured()) {
      alert('Supabase is not configured. Please set up your environment variables.');
      return;
    }
    setShowAuth(true);
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
          !user ? (
            <>
              <LandingPage onGetStarted={handleGetStarted} />
              {showAuth && <Auth onAuthSuccess={handleAuthSuccess} />}
            </>
          ) : (
            <AppContent user={user} onSignOut={handleSignOut} />
          )
        } 
      />
      
      {/* App routes for logged-in users */}
      <Route 
        path="/app/*" 
        element={
          user ? (
            <AppContent user={user} onSignOut={handleSignOut} />
          ) : (
            <>
              <LandingPage onGetStarted={handleGetStarted} />
              {showAuth && <Auth onAuthSuccess={handleAuthSuccess} />}
            </>
          )
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