import React, { useState, useEffect } from 'react';
import { Trophy, FileText, ExternalLink, Calendar, Award, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import GoogleFormModal from './GoogleFormModal';
import BookReader from './BookReader';
import { getActiveBookOfWeek, BookOfTheWeek as BookOfTheWeekType } from '../utils/bookOfWeekApi';

interface BookOfTheWeekProps {
  userEmail?: string;
  onSignOut?: () => void;
}

const BookOfTheWeek: React.FC<BookOfTheWeekProps> = ({ userEmail, onSignOut }) => {
  const [activeBook, setActiveBook] = useState<BookOfTheWeekType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActiveBook();
  }, []);

  const loadActiveBook = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const book = await getActiveBookOfWeek();
      setActiveBook(book);
    } catch (err) {
      console.error('Error loading active book:', err);
      setError('Failed to load book of the week. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = () => {
    if (!activeBook?.google_form_url) {
      alert('Submission form is not available at the moment.');
      return;
    }
    setIsFormModalOpen(true);
  };

  const handleViewPastResults = () => {
    if (activeBook?.past_results_url) {
      window.open(activeBook.past_results_url, '_blank', 'noopener,noreferrer');
    } else {
      alert('Past results will be available soon!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col">
      <Navigation userEmail={userEmail} />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl mb-12">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              }}></div>
            </div>
            <div className="relative px-8 py-16 sm:px-12 sm:py-20">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="p-3 bg-amber-500 rounded-2xl shadow-lg">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                  Book of the Week
                </h1>
              </div>
              <p className="text-center text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Celebrate exceptional storytelling. Each week, we spotlight an outstanding work and invite
                the community to share their creative vision for a chance to be featured next.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-amber-500 mx-auto mb-6"></div>
                  <Trophy className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-amber-500" />
                </div>
                <p className="text-slate-600 font-medium">Loading this week's featured book...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white border-2 border-red-200 rounded-2xl p-8 text-center shadow-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-red-600 text-lg mb-6">{error}</p>
              <button
                onClick={loadActiveBook}
                className="px-8 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Try Again
              </button>
            </div>
          ) : !activeBook ? (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-slate-200">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                <Calendar className="h-10 w-10 text-slate-400" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">No Active Challenge</h2>
              <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                There's no active challenge at the moment. Check back soon for the next featured book!
              </p>
              <Link
                to="/"
                className="inline-flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-semibold transition-colors"
              >
                <span>Return to Home</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Action Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Submit Entry Card */}
                <button
                  onClick={handleOpenForm}
                  className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-left border-2 border-transparent hover:border-amber-500"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500 to-amber-600 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-md mb-4 group-hover:scale-110 transition-transform duration-200">
                      <FileText className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Submit Your Entry</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Share your creative work with our community and compete for next week's feature spot.
                    </p>
                  </div>
                </button>

                {/* Past Winners Card */}
                <button
                  onClick={handleViewPastResults}
                  className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-left border-2 border-slate-200 hover:border-slate-300"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-300 to-slate-400 opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 rounded-xl shadow-md mb-4 group-hover:bg-slate-200 transition-colors duration-200">
                      <ExternalLink className="h-7 w-7 text-slate-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Past Winners</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Browse through our archive of exceptional works from previous challenges.
                    </p>
                  </div>
                </button>
              </div>

              {/* How It Works */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-md p-8 border border-amber-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <Award className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">How It Works</h3>
                    <div className="grid sm:grid-cols-3 gap-6">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                        <div>
                          <p className="font-semibold text-slate-900">Read & Engage</p>
                          <p className="text-sm text-slate-700 mt-1">Explore this week's featured book below</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                        <div>
                          <p className="font-semibold text-slate-900">Submit Your Work</p>
                          <p className="text-sm text-slate-700 mt-1">Share your own creative piece</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                        <div>
                          <p className="font-semibold text-slate-900">Get Featured</p>
                          <p className="text-sm text-slate-700 mt-1">Best submission wins the spotlight</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Book */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">Featured Winner</h2>
                  </div>
                  <p className="text-slate-600 text-lg mb-6">
                    Congratulations to last week's winner. Immerse yourself in their exceptional work below.
                  </p>

                  <div className="flex items-center space-x-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 mb-1">Written by</p>
                      <p className="text-xl font-bold text-slate-900">{activeBook.author_name}</p>
                    </div>
                    {activeBook.author_social_link && (
                      <a
                        href={activeBook.author_social_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2 group"
                      >
                        <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span>Connect</span>
                      </a>
                    )}
                  </div>
                </div>

                <BookReader
                  bookTitle={activeBook.book_title}
                  driveUrl={activeBook.book_drive_url}
                  weekStartDate={activeBook.week_start_date}
                  weekEndDate={activeBook.week_end_date}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {activeBook && (
        <GoogleFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          formUrl={activeBook.google_form_url}
        />
      )}
    </div>
  );
};

export default BookOfTheWeek;
