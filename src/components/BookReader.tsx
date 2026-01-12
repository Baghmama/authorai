import React, { useState } from 'react';
import { BookOpen, Maximize2, Minimize2, Calendar } from 'lucide-react';

interface BookReaderProps {
  bookTitle: string;
  driveUrl: string;
  weekStartDate: string;
  weekEndDate: string;
}

const BookReader: React.FC<BookReaderProps> = ({
  bookTitle,
  driveUrl,
  weekStartDate,
  weekEndDate
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const convertToEmbedUrl = (url: string): string => {
    try {
      let fileId = '';

      if (url.includes('/file/d/')) {
        const match = url.match(/\/file\/d\/([^/?]+)/);
        if (match) {
          fileId = match[1];
        }
      } else if (url.includes('/open?id=')) {
        const match = url.match(/\/open\?id=([^&]+)/);
        if (match) {
          fileId = match[1];
        }
      } else if (url.includes('id=')) {
        const match = url.match(/[?&]id=([^&]+)/);
        if (match) {
          fileId = match[1];
        }
      }

      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }

      if (url.includes('/preview')) {
        return url;
      }

      return url;
    } catch (error) {
      console.error('Error converting Drive URL:', error);
      return url;
    }
  };

  const embedUrl = convertToEmbedUrl(driveUrl);

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'} flex flex-col`}>
      <div className={`bg-gradient-to-r from-orange-500 to-yellow-500 p-4 ${isFullscreen ? '' : 'rounded-t-xl'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <BookOpen className="h-6 w-6 text-white flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-white truncate">{bookTitle}</h3>
              <div className="flex items-center space-x-2 text-white text-sm opacity-90">
                <Calendar className="h-3 w-3" />
                <span className="truncate">
                  {formatDate(weekStartDate)} - {formatDate(weekEndDate)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={toggleFullscreen}
            className="ml-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all flex-shrink-0"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5 text-white" />
            ) : (
              <Maximize2 className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
      </div>

      <div className={`relative bg-gray-100 ${isFullscreen ? 'flex-1' : 'rounded-b-xl'}`}>
        {isLoading && (
          <div className={`absolute inset-0 flex items-center justify-center bg-white ${isFullscreen ? '' : 'rounded-b-xl'}`}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading book...</p>
            </div>
          </div>
        )}
        <iframe
          src={embedUrl}
          className={`w-full ${isFullscreen ? 'h-full' : 'h-[600px]'} ${isFullscreen ? '' : 'rounded-b-xl'}`}
          frameBorder="0"
          title={`Book: ${bookTitle}`}
          onLoad={() => setIsLoading(false)}
          allow="autoplay"
        />
      </div>
    </div>
  );
};

export default BookReader;
