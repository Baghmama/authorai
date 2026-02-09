import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Sparkles, BookOpen, PenTool, Layers } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      onAuthSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative bg-slate-950 overflow-hidden flex-col justify-between p-12">
        <div className="hero-mesh absolute inset-0" />
        <div className="absolute top-24 right-[15%] w-72 h-72 bg-orange-500/[0.07] rounded-full blur-3xl" />
        <div className="absolute bottom-16 left-[10%] w-56 h-56 bg-amber-500/[0.05] rounded-full blur-3xl" />

        <div className="relative z-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-16 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-3 mb-12">
            <img
              src="/android-chrome-192x192.png"
              alt="Author AI logo"
              className="h-10 w-10 rounded-xl"
            />
            <span className="font-poppins text-2xl font-bold text-white">
              Author AI
            </span>
          </div>

          <h1 className="font-poppins text-4xl xl:text-5xl font-bold text-white leading-[1.1] mb-5 tracking-tight">
            Your next book<br />
            <span className="gradient-text">starts here.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            Turn your ideas into professionally written chapters with the power of AI.
          </p>
        </div>

        <div className="relative z-10 space-y-5">
          <div className="flex items-center gap-4 text-slate-400">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-orange-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">AI-Powered Writing</p>
              <p className="text-slate-500 text-xs">Generate complete chapters in minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
              <Layers className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Multiple Genres</p>
              <p className="text-slate-500 text-xs">Fiction, non-fiction, and educational content</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
              <PenTool className="h-4 w-4 text-orange-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Export Anywhere</p>
              <p className="text-slate-500 text-xs">Download as PDF, DOCX, or read online</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
      </div>

      <div className="flex-1 flex flex-col bg-slate-50">
        <div className="lg:hidden bg-slate-950 px-6 py-6 relative overflow-hidden">
          <div className="hero-mesh absolute inset-0" />
          <div className="relative z-10 flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Home</span>
            </button>
            <div className="flex items-center gap-2.5">
              <img
                src="/android-chrome-192x192.png"
                alt="Author AI logo"
                className="h-8 w-8 rounded-lg"
              />
              <span className="font-poppins text-lg font-bold text-white">Author AI</span>
            </div>
            <div className="w-16" />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-8">
          <div className="w-full max-w-[420px]">
            <div className="text-center mb-8">
              <div className="lg:hidden w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/20">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Welcome back
              </h2>
              <p className="text-slate-500 text-sm sm:text-base">
                Sign in to your account or create one with Google
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 sm:p-8">
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full bg-white border border-slate-200 text-slate-700 font-medium py-3 px-6 rounded-xl hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm"
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-xs font-medium text-slate-400 uppercase tracking-wider">or sign in with email</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
                New users can create an account using Google above. Existing users can sign in with email and password.
              </p>

              <form onSubmit={handleEmailLogin} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-red-600 text-xs font-bold">!</span>
                    </div>
                    <p className="text-red-600 text-sm leading-snug">{error}</p>
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>Email</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all text-slate-700 placeholder:text-slate-400 bg-slate-50/50 text-sm"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all text-slate-700 placeholder:text-slate-400 bg-slate-50/50 pr-12 text-sm"
                      placeholder="Enter your password"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/25 text-sm mt-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <p className="text-center text-xs text-slate-400 mt-6">
              By continuing, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
