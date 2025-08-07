import React, { useState } from 'react';
import { ChapterOutline, BookIdea } from '../types';
import { writeChapter } from '../utils/geminiApi';
import { PenTool, CheckCircle, Clock, Book } from 'lucide-react';

interface ChapterWriterProps {
  outlines: ChapterOutline[];
  bookIdea: BookIdea;
  onUpdateOutlines: (outlines: ChapterOutline[]) => void;
  onCompleteWriting: () => void;
}

const ChapterWriter: React.FC<ChapterWriterProps> = ({
  outlines,
  bookIdea,
  onUpdateOutlines,
  onCompleteWriting
}) => {
  const [writingChapterId, setWritingChapterId] = useState<string | null>(null);

  const handleWriteChapter = async (chapter: ChapterOutline) => {
    setWritingChapterId(chapter.id);
    
    try {
      const content = await writeChapter(
        chapter.title,
        chapter.outline,
        bookIdea.language,
        bookIdea.type
      );
      
      const updatedOutlines = outlines.map(c =>
        c.id === chapter.id
          ? { ...c, content, isWritten: true }
          : c
      );
      
      onUpdateOutlines(updatedOutlines);
    } catch (error) {
      alert('Failed to write chapter. Please try again.');
    } finally {
      setWritingChapterId(null);
    }
  };

  const allChaptersWritten = outlines.every(chapter => chapter.isWritten);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Write Chapters</h2>
        <p className="text-gray-600">Generate content for each chapter using AI</p>
        <div className="mt-4 bg-gray-100 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Progress:</strong> {outlines.filter(c => c.isWritten).length} of {outlines.length} chapters completed
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {outlines.map((chapter) => (
          <div key={chapter.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">{chapter.title}</h3>
                <div className="flex items-center space-x-3">
                  {chapter.isWritten ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Complete</span>
                    </div>
                  ) : writingChapterId === chapter.id ? (
                    <div className="flex items-center space-x-2 text-orange-600">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                      <span className="text-sm font-medium">Writing...</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleWriteChapter(chapter)}
                      disabled={writingChapterId !== null}
                      className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PenTool className="h-4 w-4" />
                      <span>Write Chapter</span>
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mt-2 text-sm">{chapter.outline}</p>
            </div>

            {chapter.content && (
              <div className="p-6 bg-gray-50">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Generated Content:</h4>
                <div className="prose max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {chapter.content}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {allChaptersWritten && (
          <div className="text-center pt-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-green-900 mb-2">All Chapters Complete!</h3>
              <p className="text-green-700">Your book is ready to be compiled and downloaded.</p>
            </div>
            
            <button
              onClick={onCompleteWriting}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 mx-auto"
            >
              <Book className="h-5 w-5" />
              <span>Compile Book</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterWriter;