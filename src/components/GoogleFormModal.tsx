import React from 'react';
import { X, FileText } from 'lucide-react';

interface GoogleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formUrl: string;
}

const GoogleFormModal: React.FC<GoogleFormModalProps> = ({ isOpen, onClose, formUrl }) => {
  if (!isOpen) return null;

  const convertToEmbedUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);

      if (!urlObj.searchParams.has('embedded')) {
        urlObj.searchParams.set('embedded', 'true');
      }

      return urlObj.toString();
    } catch (error) {
      console.error('Error converting Form URL:', error);
      return url;
    }
  };

  const embedUrl = convertToEmbedUrl(formUrl);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 rounded-full">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Submit Your Entry</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title="Book of the Week Submission Form"
          >
            Loading form...
          </iframe>
        </div>
      </div>
    </div>
  );
};

export default GoogleFormModal;
