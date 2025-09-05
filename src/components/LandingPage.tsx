import React from 'react';
import { BookOpen, Zap, Globe, Download, Star, ArrowRight, Check, Users, Clock, Shield } from 'lucide-react';
import Footer from './Footer';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <nav className="glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="font-poppins text-xl sm:text-2xl font-bold text-white">
                Author AI
              </h1>
            </div>
            <button
              onClick={onGetStarted}
              className="glass-button text-glass px-6 py-2 rounded-lg font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-glass mb-6 leading-tight">
              Transform Your Ideas Into
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"> Complete Books</span>
            </h1>
            <p className="text-xl text-glass-muted mb-8 max-w-3xl mx-auto leading-relaxed">
              Harness the power of AI to turn your book concepts into professionally written chapters. 
              Create fiction, non-fiction, or educational content in minutes, not months.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={onGetStarted}
                className="glass-button text-glass px-8 py-4 rounded-lg font-semibold text-lg flex items-center space-x-2 shadow-lg"
              >
                <span>Start Writing Your Book</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2 text-glass-muted">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Free 30 credits to get started</span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center glass-card rounded-lg p-4">
                <div className="text-3xl font-bold text-glass">1000+</div>
                <div className="text-glass-muted">Books Created</div>
              </div>
              <div className="text-center glass-card rounded-lg p-4">
                <div className="text-3xl font-bold text-glass">11</div>
                <div className="text-glass-muted">Languages Supported</div>
              </div>
              <div className="text-center glass-card rounded-lg p-4">
                <div className="text-3xl font-bold text-glass">5 min</div>
                <div className="text-glass-muted">Average Generation Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5"></div>
  )
}