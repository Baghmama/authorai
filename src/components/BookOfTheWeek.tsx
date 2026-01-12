import React, { useState, useEffect } from 'react';
import { Trophy, FileText, ExternalLink, Calendar, Award } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation userEmail={userEmail} />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Trophy className="h-10 w-10" />
              <h1 className="text-3xl sm:text-4xl font-bold">Book of the Week Challenge</h1>
            </div>
            <p className="text-center text-lg opacity-90 max-w-3xl mx-auto">
              Join our weekly reading challenge! Each week, we feature a selected book and invite you to submit your own work.
              Showcase your creativity and get featured as our next Book of the Week!
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading this week's challenge...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadActiveBook}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : !activeBook ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Challenge</h2>
              <p className="text-gray-600 mb-6">
                There's no active book challenge at the moment. Check back soon for the next challenge!
              </p>
              <Link
                to="/"
                className="inline-flex items-center space-x-2 text-orange-500 hover:text-orange-600 font-medium"
              >
                <span>Back to Home</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleOpenForm}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <FileText className="h-6 w-6" />
                    <span>Submit Your Entry</span>
                  </button>

                  <button
                    onClick={handleViewPastResults}
                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-3 border-2 border-gray-300"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>View Past Winners</span>
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-start space-x-3 bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <Award className="h-6 w-6 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-orange-900 mb-1">How It Works</h3>
                      <ul className="text-sm text-orange-800 space-y-1">
                        <li>1. Read this week's featured book below</li>
                        <li>2. Submit your own work using the form above</li>
                        <li>3. Best submission gets featured next week!</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    <span>Previous Week's Winner</span>
                  </h2>
                  <p className="text-gray-600">
                    Congratulations to last week's winner! Read their featured work below.
                  </p>
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
