import React from 'react';
import {
  BookOpen,
  Zap,
  Globe,
  Download,
  Star,
  ArrowRight,
  Check,
  Users,
  Clock,
  Shield,
} from 'lucide-react';
import Footer from './Footer';
import ServiceSuspensionBanner from './ServiceSuspensionBanner';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white">
      <ServiceSuspensionBanner />
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200" aria-label="Main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img
                src="/android-chrome-192x192.png"
                alt="Author AI logo"
                className="h-8 w-8 rounded-lg"
              />
              <h1 className="font-poppins text-xl sm:text-2xl font-bold text-gray-900">
                Author AI
              </h1>
            </div>
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 font-medium"
              type="button"
              aria-label="Get Started"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your Ideas Into
              <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                {' '}
                Complete Books
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Harness the power of AI to turn your book concepts into professionally written
              chapters. Create fiction, non-fiction, or educational content in minutes, not months.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-4 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 font-semibold text-lg flex items-center space-x-2 shadow-lg"
                type="button"
              >
                <span>Start Writing Your Book</span>
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="flex items-center space-x-2 text-gray-600">
                <Star className="h-5 w-5 text-yellow-500" aria-hidden="true" />
                <span className="font-medium">Free 30 credits to get started</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">1000+</div>
                <div className="text-gray-600">Books Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">11</div>
                <div className="text-gray-600">Languages Supported</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">5 min</div>
                <div className="text-gray-600">Average Generation Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Play Store Download Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Download Our Android App
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            Get the full Author AI experience on your mobile device
          </p>
          <a
            href="https://play.google.com/store/apps/details?id=tech.authorai.twa&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-3 bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-lg"
          >
            <svg
              className="h-8 w-8"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" />
            </svg>
            <div className="text-left">
              <div className="text-xs uppercase tracking-wide">Get it on</div>
              <div className="text-xl font-semibold leading-tight">Google Play</div>
            </div>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Author AI?
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our advanced AI technology makes book writing accessible to everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h4>
              <p className="text-gray-600">
                Generate complete chapter outlines and content in minutes. Our AI processes your
                ideas instantly.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-green-500 to-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Multi-Language</h4>
              <p className="text-gray-600">
                Create books in 11 different languages including English, Spanish, French, German,
                and more.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Download className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Export Ready</h4>
              <p className="text-gray-600">
                Download your completed book as PDF or Word document, ready for publishing or
                editing.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-red-500 to-red-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">User Friendly</h4>
              <p className="text-gray-600">
                Simple step-by-step process. No technical knowledge required. Just share your idea
                and let AI do the work.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Clock className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Save Time</h4>
              <p className="text-gray-600">
                What used to take months now takes minutes. Focus on refining your ideas instead of
                struggling with writer&apos;s block.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Secure &amp; Private</h4>
              <p className="text-gray-600">
                Your ideas and content are protected. We use enterprise-grade security to keep your
                work safe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Four simple steps to transform your idea into a complete book
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-500 to-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Share Your Idea</h4>
              <p className="text-gray-600">
                Describe your book concept, choose the type, language, and number of chapters.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Review Outlines</h4>
              <p className="text-gray-600">
                AI generates detailed chapter outlines. Edit and customize them to match your
                vision.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Generate Content</h4>
              <p className="text-gray-600">
                AI writes complete chapters based on your outlines. Professional quality content in
                minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Download &amp; Publish</h4>
              <p className="text-gray-600">
                Export your book as PDF or Word document. Ready for self-publishing or further
                editing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Pay only for what you use. No subscriptions, no hidden fees.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border-2 border-orange-200 p-8 text-center">
              <div className="bg-gradient-to-r from-orange-500 to-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Credit-Based System</h4>
              <div className="text-4xl font-bold text-orange-600 mb-2">₹70 = 130 Credits</div>
              <p className="text-gray-600 mb-4">Each chapter costs only 6 credits to generate</p>
              <p className="text-sm text-gray-500 mb-6">Prices include all taxes - we handle the tax compliance for you! 🎉</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="text-lg font-semibold text-gray-900">1 Chapter</div>
                  <div className="text-orange-600 font-bold">6 Credits</div>
                  <div className="text-sm text-gray-500">~₹3.20</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="text-lg font-semibold text-gray-900">21 Chapters</div>
                  <div className="text-orange-600 font-bold">130 Credits</div>
                  <div className="text-sm text-gray-500">₹70</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="text-lg font-semibold text-gray-900">43 Chapters</div>
                  <div className="text-orange-600 font-bold">260 Credits</div>
                  <div className="text-sm text-gray-500">₹140</div>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 text-green-600 mb-6">
                <Check className="h-5 w-5" aria-hidden="true" />
                <span className="font-medium">30 free credits for new users</span>
              </div>

              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-4 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 font-semibold text-lg"
                type="button"
              >
                Start Writing for Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Write a Book
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-6">Powerful AI Writing Assistant</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-gray-900">Intelligent Chapter Planning</p>
                    <p className="text-gray-600">AI analyzes your idea and creates detailed chapter outlines</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-gray-900">Professional Content Generation</p>
                    <p className="text-gray-600">Each chapter is written with proper structure and engaging content</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-gray-900">Multiple Export Formats</p>
                    <p className="text-gray-600">Download as PDF for reading or Word document for editing</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-gray-900">Customizable Outlines</p>
                    <p className="text-gray-600">Edit and refine chapter outlines before content generation</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl p-8">
              <div className="text-center">
                <BookOpen className="h-24 w-24 text-orange-500 mx-auto mb-6" aria-hidden="true" />
                <h4 className="text-xl font-bold text-gray-900 mb-4">From Idea to Published Book</h4>
                <p className="text-gray-600">
                  Join thousands of authors who have transformed their ideas into complete books
                  using Author AI.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-yellow-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Write Your Book?
          </h3>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of authors who have already transformed their ideas into complete books.
            Start your writing journey today with 30 free credits.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-orange-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold text-lg shadow-lg"
            type="button"
          >
            Get Started - It&apos;s Free
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
