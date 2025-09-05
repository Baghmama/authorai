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
              className="glass-button text-white px-6 py-2 rounded-lg font-medium"
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
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Transform Your Ideas Into
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"> Complete Books</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Harness the power of AI to turn your book concepts into professionally written chapters. 
              Create fiction, non-fiction, or educational content in minutes, not months.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={onGetStarted}
                className="glass-button text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center space-x-2 shadow-lg"
              >
                <span>Start Writing Your Book</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2 text-white/80">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Free 30 credits to get started</span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center glass-card rounded-lg p-4">
                <div className="text-3xl font-bold text-white">1000+</div>
                <div className="text-white/80">Books Created</div>
              </div>
              <div className="text-center glass-card rounded-lg p-4">
                <div className="text-3xl font-bold text-white">11</div>
                <div className="text-white/80">Languages Supported</div>
              </div>
              <div className="text-center glass-card rounded-lg p-4">
                <div className="text-3xl font-bold text-white">5 min</div>
                <div className="text-white/80">Average Generation Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose Author AI?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Our advanced AI technology makes book writing accessible to everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            <div className="glass-card p-8 rounded-xl hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Lightning Fast</h3>
              <p className="text-white/80">
                Generate complete chapter outlines and content in minutes. Our AI processes your ideas instantly.
              </p>
            </div>

            <div className="glass-card p-8 rounded-xl hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-green-500 to-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Multi-Language</h3>
              <p className="text-white/80">
                Create books in 11 different languages including English, Spanish, French, German, and more.
              </p>
            </div>

            <div className="glass-card p-8 rounded-xl hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Download className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Export Ready</h3>
              <p className="text-white/80">
                Download your completed book as PDF or Word document, ready for publishing or editing.
              </p>
            </div>

            <div className="glass-card p-8 rounded-xl hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-red-500 to-red-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">User Friendly</h3>
              <p className="text-white/80">
                Simple step-by-step process. No technical knowledge required. Just share your idea and let AI do the work.
              </p>
            </div>

            <div className="glass-card p-8 rounded-xl hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Save Time</h3>
              <p className="text-white/80">
                What used to take months now takes minutes. Focus on refining your ideas instead of struggling with writer's block.
              </p>
            </div>

            <div className="glass-card p-8 rounded-xl hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Secure & Private</h3>
              <p className="text-white/80">
                Your ideas and content are protected. We use enterprise-grade security to keep your work safe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Four simple steps to transform your idea into a complete book
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            <div className="text-center glass-card p-6 rounded-xl">
              <div className="bg-gradient-to-r from-orange-500 to-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Share Your Idea</h3>
              <p className="text-white/80">
                Describe your book concept, choose the type, language, and number of chapters.
              </p>
            </div>

            <div className="text-center glass-card p-6 rounded-xl">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Review Outlines</h3>
              <p className="text-white/80">
                AI generates detailed chapter outlines. Edit and customize them to match your vision.
              </p>
            </div>

            <div className="text-center glass-card p-6 rounded-xl">
              <div className="bg-gradient-to-r from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Generate Content</h3>
              <p className="text-white/80">
                AI writes complete chapters based on your outlines. Professional quality content in minutes.
              </p>
            </div>

            <div className="text-center glass-card p-6 rounded-xl">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Download & Publish</h3>
              <p className="text-white/80">
                Export your book as PDF or Word document. Ready for self-publishing or further editing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Pay only for what you use. No subscriptions, no hidden fees.
            </p>
          </div>

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="bg-gradient-to-r from-orange-500 to-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Credit-Based System</h3>
              <div className="text-4xl font-bold text-yellow-300 mb-2">$1 = 90 Credits</div>
              <p className="text-white/80 mb-6">Each chapter costs only 6 credits to generate</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="glass rounded-lg p-4">
                  <div className="text-lg font-semibold text-white">1 Chapter</div>
                  <div className="text-yellow-300 font-bold">6 Credits</div>
                  <div className="text-sm text-white/60">~$0.07</div>
                </div>
                <div className="glass rounded-lg p-4">
                  <div className="text-lg font-semibold text-white">5 Chapters</div>
                  <div className="text-yellow-300 font-bold">30 Credits</div>
                  <div className="text-sm text-white/60">~$0.33</div>
                </div>
                <div className="glass rounded-lg p-4">
                  <div className="text-lg font-semibold text-white">10 Chapters</div>
                  <div className="text-yellow-300 font-bold">60 Credits</div>
                  <div className="text-sm text-white/60">~$0.67</div>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 text-green-300 mb-6">
                <Check className="h-5 w-5 text-green-400" />
                <span className="font-medium">30 free credits for new users</span>
              </div>

              <button
                onClick={onGetStarted}
                className="glass-button text-white px-8 py-4 rounded-lg font-semibold text-lg"
              >
                Start Writing for Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to Write a Book
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Powerful AI Writing Assistant</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white">Intelligent Chapter Planning</h4>
                    <p className="text-white/80">AI analyzes your idea and creates detailed chapter outlines</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white">Professional Content Generation</h4>
                    <p className="text-white/80">Each chapter is written with proper structure and engaging content</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white">Multiple Export Formats</h4>
                    <p className="text-white/80">Download as PDF for reading or Word document for editing</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white">Customizable Outlines</h4>
                    <p className="text-white/80">Edit and refine chapter outlines before content generation</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <div className="text-center">
                <BookOpen className="h-24 w-24 text-yellow-300 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-white mb-4">
                  From Idea to Published Book
                </h3>
                <p className="text-white/80">
                  Join thousands of authors who have transformed their ideas into complete books using Author AI.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative gradient-bg-orange">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Write Your Book?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of authors who have already transformed their ideas into complete books. 
            Start your writing journey today with 30 free credits.
          </p>
          <button
            onClick={onGetStarted}
            className="glass-button text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg border-white/30"
          >
            Get Started - It's Free
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;