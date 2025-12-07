import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChapterOutline, BookIdea } from '../types';
import { writeChapter } from '../utils/geminiApi';
import { deductCreditsForChapterGeneration, getUserCredits } from '../utils/creditManager';
import { PenTool, CheckCircle, Clock, Book, RefreshCw, Edit3, Save, X, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [regeneratingChapterId, setRegeneratingChapterId] = useState<string | null>(null);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState<string | null>(null);
  const [expandedOutlines, setExpandedOutlines] = useState<Record<string, boolean>>({});

  // Initialize expanded outlines when outlines change
  React.useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    outlines.forEach(chapter => {
      initialExpanded[chapter.id] = true; // All outlines expanded by default
    });
    setExpandedOutlines(initialExpanded);
  }, [outlines]);

  const toggleOutlineVisibility = (chapterId: string) => {
    setExpandedOutlines(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const handleWriteChapter = async (chapter: ChapterOutline) => {
    setWritingChapterId(chapter.id);
    
    // Collapse the outline when starting to write
    setExpandedOutlines(prev => ({
      ...prev,
      [chapter.id]: false
    }));
    
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

  const handleRegenerateConfirm = async (chapterId: string) => {
    const chapter = outlines.find(c => c.id === chapterId);
    if (!chapter) return;

    // Check user credits first
    const userCredits = await getUserCredits();
    if (!userCredits || userCredits.credits < 6) {
      alert('Insufficient credits. You need 6 credits to regenerate a chapter.');
      setShowRegenerateConfirm(null);
      return;
    }

    setRegeneratingChapterId(chapterId);
    setShowRegenerateConfirm(null);

    // Collapse the outline when regenerating
    setExpandedOutlines(prev => ({
      ...prev,
      [chapterId]: false
    }));

    try {
      // Regenerate the chapter FIRST
      const content = await writeChapter(
        chapter.title,
        chapter.outline,
        bookIdea.language,
        bookIdea.type
      );

      // Only deduct credits AFTER successful generation
      const creditResult = await deductCreditsForChapterGeneration(1); // 1 chapter = 6 credits

      if (!creditResult.success) {
        alert('Chapter regenerated but failed to deduct credits. Please contact support.');
      }

      const updatedOutlines = outlines.map(c =>
        c.id === chapterId
          ? { ...c, content, isWritten: true }
          : c
      );

      onUpdateOutlines(updatedOutlines);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert('Failed to regenerate chapter: ' + errorMessage);
    } finally {
      setRegeneratingChapterId(null);
    }
  };

  const handleStartEdit = (chapter: ChapterOutline) => {
    setEditingChapterId(chapter.id);
    setEditContent(chapter.content || '');
  };

  const handleSaveEdit = () => {
    if (!editingChapterId) return;

    const updatedOutlines = outlines.map(c =>
      c.id === editingChapterId
        ? { ...c, content: editContent, isWritten: true }
        : c
    );
    
    onUpdateOutlines(updatedOutlines);
    setEditingChapterId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingChapterId(null);
    setEditContent('');
  };

  const allChaptersWritten = outlines.every(chapter => chapter.isWritten);

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
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
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="w-full">
                  <div className="flex justify-between items-start mb-3 sm:mb-0 sm:items-center">
                    <div className="flex items-center flex-1 mr-2">
                      <button
                        onClick={() => toggleOutlineVisibility(chapter.id)}
                        className="mr-2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {expandedOutlines[chapter.id] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      <h3 className="text-base sm:text-xl font-semibold text-gray-900 leading-tight">{chapter.title}</h3>
                    </div>
                    <div className="flex-shrink-0">
                      {chapter.isWritten ? (
                        <div className="flex items-center space-x-2 text-green-600 mb-2 sm:mb-0">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Complete</span>
                        </div>
                      ) : writingChapterId === chapter.id ? (
                        <div className="flex items-center space-x-2 text-orange-600">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                          <span className="text-sm font-medium">Writing...</span>
                        </div>
                      ) : regeneratingChapterId === chapter.id ? (
                        <div className="flex items-center space-x-2 text-orange-600">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                          <span className="text-sm font-medium">Regenerating...</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleWriteChapter(chapter)}
                          disabled={writingChapterId !== null || regeneratingChapterId !== null || editingChapterId !== null}
                          className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-1.5 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          Write
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Action buttons for completed chapters - mobile optimized */}
                  {chapter.isWritten && (
                    <div className="flex flex-wrap gap-2 sm:hidden">
                      <button
                        onClick={() => handleStartEdit(chapter)}
                        disabled={editingChapterId !== null || writingChapterId !== null || regeneratingChapterId !== null}
                        className="flex items-center justify-center space-x-1 bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      
                      <button
                        onClick={() => setShowRegenerateConfirm(chapter.id)}
                        disabled={editingChapterId !== null || writingChapterId !== null || regeneratingChapterId !== null}
                        className="flex items-center justify-center space-x-1 bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Regen</span>
                      </button>
                    </div>
                  )}
                  
                  {/* Desktop action buttons */}
                  {chapter.isWritten && (
                    <div className="hidden sm:flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => handleStartEdit(chapter)}
                        disabled={editingChapterId !== null || writingChapterId !== null || regeneratingChapterId !== null}
                        className="flex items-center justify-center space-x-1 bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      
                      <button
                        onClick={() => setShowRegenerateConfirm(chapter.id)}
                        disabled={editingChapterId !== null || writingChapterId !== null || regeneratingChapterId !== null}
                        className="flex items-center justify-center space-x-1 bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Regenerate (6 credits)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Collapsible outline section */}
              {expandedOutlines[chapter.id] && (
                <div className="mt-3">
                  <div className="text-gray-600 text-sm prose prose-sm max-w-none">
                    <ReactMarkdown>{chapter.outline}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {chapter.content && (
              <div className="p-4 sm:p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-gray-900">Generated Content:</h4>
                  {editingChapterId === chapter.id && (
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center space-x-1 bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        <Save className="h-3 w-3" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center space-x-1 bg-gray-500 text-white px-3 py-1.5 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      >
                        <X className="h-3 w-3" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
                
                {editingChapterId === chapter.id ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-64 sm:h-96 p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none font-mono text-sm"
                    placeholder="Edit your chapter content here..."
                  />
                ) : (
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown>{chapter.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {allChaptersWritten && (
          <div className="text-center pt-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6 mb-6">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-green-900 mb-2">All Chapters Complete!</h3>
              <p className="text-green-700">Your book is ready to be compiled and downloaded.</p>
            </div>
            
            <button
              onClick={onCompleteWriting}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 mx-auto"
            >
              <Book className="h-5 w-5" />
              <span>Compile Book</span>
            </button>
          </div>
        )}
      </div>

      {/* Regenerate Confirmation Modal */}
      {showRegenerateConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 mx-4">
            <div className="text-center mb-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Regenerate Chapter?</h3>
              <p className="text-gray-600">
                This will cost <strong>6 credits</strong> and replace the current chapter content with a new AI-generated version.
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> The current chapter content will be permanently replaced. Consider using the Edit button if you just want to make small changes.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => handleRegenerateConfirm(showRegenerateConfirm)}
                className="w-full sm:flex-1 bg-orange-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Yes, Regenerate (6 credits)
              </button>
              <button
                onClick={() => setShowRegenerateConfirm(null)}
                className="w-full sm:flex-1 bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterWriter;