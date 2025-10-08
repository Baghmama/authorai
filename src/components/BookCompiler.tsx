import React, { useState } from 'react';
import { BookProject } from '../types';
import { generatePDF, generateWord } from '../utils/bookGenerator';
import { Download, FileText, BookOpen, Check, FileDown } from 'lucide-react';

interface BookCompilerProps {
  project: BookProject;
  onNewProject: () => void;
}

const BookCompiler: React.FC<BookCompilerProps> = ({ project, onNewProject }) => {
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingWord, setDownloadingWord] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      await generatePDF(project);
    } catch (error) {
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDownloadWord = async () => {
    setDownloadingWord(true);
    try {
      await generateWord(project);
    } catch (error) {
      alert('Failed to generate Word document. Please try again.');
    } finally {
      setDownloadingWord(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Book Complete!</h2>
        <p className="text-gray-600">Your book has been successfully generated and is ready for download</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Details</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Idea:</strong> {project.idea.idea}</p>
              <p><strong>Type:</strong> {project.idea.type}</p>
              <p><strong>Language:</strong> {project.idea.language}</p>
              <p><strong>Chapters:</strong> {project.outlines.length}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Total Words:</strong> {project.outlines.reduce((acc, chapter) => 
                acc + (chapter.content?.split(' ').length || 0), 0).toLocaleString()}</p>
              <p><strong>Chapters Written:</strong> {project.outlines.filter(c => c.isWritten).length}</p>
              <p><strong>Status:</strong> <span className="text-green-600 font-medium">Complete</span></p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chapter Preview</h3>
          <div className="space-y-3">
            {project.outlines.map((chapter, index) => (
              <div key={chapter.id} className="flex items-center space-x-3 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span className="font-medium">Chapter {index + 1}:</span>
                <span className="text-gray-600">{chapter.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Download Your Book</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
            className="flex flex-col items-center space-y-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-xl p-4 sm:p-6 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="bg-red-500 p-3 rounded-full">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-900">Download PDF</h4>
              <p className="text-sm text-gray-600">Portable Document Format • Universal compatibility</p>
            </div>
            {downloadingPDF ? (
              <div className="flex items-center space-x-2 text-red-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                <span className="text-sm">Generating PDF...</span>
              </div>
            ) : (
              <Download className="h-5 w-5 text-red-600" />
            )}
          </button>

          <button
            onClick={handleDownloadWord}
            disabled={downloadingWord}
            className="flex flex-col items-center space-y-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl p-4 sm:p-6 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="bg-blue-500 p-3 rounded-full">
              <FileDown className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-900">Download Word</h4>
              <p className="text-sm text-gray-600">Microsoft Word Document • Editable format</p>
            </div>
            {downloadingWord ? (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Generating Word...</span>
              </div>
            ) : (
              <Download className="h-5 w-5 text-blue-600" />
            )}
          </button>

        </div>

        <div className="text-center">
          {/* App Download Notification */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 p-2 rounded-full flex-shrink-0">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-blue-900 mb-1">Using Author AI App?</h4>
                <p className="text-sm text-blue-700">
                  If you're using the Author AI mobile app, please check your device notifications 
                  for download completion. Files will be saved to your device's Downloads folder.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onNewProject}
            className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg transition-colors font-medium"
          >
            Create New Book
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCompiler;