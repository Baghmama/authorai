import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChapterOutline, BookIdea } from '../types';
import { writeChapter } from '../utils/geminiApi';
import { deductCreditsForChapterGeneration, getUserCredits } from '../utils/creditManager';
import {
  PenTool,
  CheckCircle,
  Book,
  RefreshCw,
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Timer,
} from 'lucide-react';

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
  onCompleteWriting,
}) => {
  const [writingChapterId, setWritingChapterId] = useState<string | null>(null);
  const [regeneratingChapterId, setRegeneratingChapterId] = useState<string | null>(null);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState<string | null>(null);
  const [expandedOutlines, setExpandedOutlines] = useState<Record<string, boolean>>({});
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback(() => {
    setCooldownSeconds(15);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
          cooldownTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  React.useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    outlines.forEach((chapter) => {
      initialExpanded[chapter.id] = true;
    });
    setExpandedOutlines(initialExpanded);
  }, [outlines]);

  const toggleOutlineVisibility = (chapterId: string) => {
    setExpandedOutlines((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleWriteChapter = async (chapter: ChapterOutline) => {
    setWritingChapterId(chapter.id);
    setExpandedOutlines((prev) => ({ ...prev, [chapter.id]: false }));

    try {
      const content = await writeChapter(
        chapter.title,
        chapter.outline,
        bookIdea.language,
        bookIdea.type,
        bookIdea.writingStyle,
      );

      const updatedOutlines = outlines.map((c) =>
        c.id === chapter.id ? { ...c, content, isWritten: true } : c,
      );
      onUpdateOutlines(updatedOutlines);
      startCooldown();
    } catch (error) {
      alert('Failed to write chapter. Please try again.');
    } finally {
      setWritingChapterId(null);
    }
  };

  const handleRegenerateConfirm = async (chapterId: string) => {
    const chapter = outlines.find((c) => c.id === chapterId);
    if (!chapter) return;

    const userCredits = await getUserCredits();
    if (!userCredits || userCredits.credits < 6) {
      alert('Insufficient credits. You need 6 credits to regenerate a chapter.');
      setShowRegenerateConfirm(null);
      return;
    }

    setRegeneratingChapterId(chapterId);
    setShowRegenerateConfirm(null);
    setExpandedOutlines((prev) => ({ ...prev, [chapterId]: false }));

    try {
      const content = await writeChapter(
        chapter.title,
        chapter.outline,
        bookIdea.language,
        bookIdea.type,
        bookIdea.writingStyle,
      );

      const creditResult = await deductCreditsForChapterGeneration(1);
      if (!creditResult.success) {
        alert('Chapter regenerated but failed to deduct credits. Please contact support.');
      }

      const updatedOutlines = outlines.map((c) =>
        c.id === chapterId ? { ...c, content, isWritten: true } : c,
      );
      onUpdateOutlines(updatedOutlines);
      startCooldown();
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
    const updatedOutlines = outlines.map((c) =>
      c.id === editingChapterId ? { ...c, content: editContent, isWritten: true } : c,
    );
    onUpdateOutlines(updatedOutlines);
    setEditingChapterId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingChapterId(null);
    setEditContent('');
  };

  const allChaptersWritten = outlines.every((chapter) => chapter.isWritten);
  const completedCount = outlines.filter((c) => c.isWritten).length;
  const isCoolingDown = cooldownSeconds > 0;
  const isBusy = writingChapterId !== null || regeneratingChapterId !== null || editingChapterId !== null || isCoolingDown;

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Write Chapters</h2>
        <p className="text-slate-500 mb-4">Generate content for each chapter using AI</p>
        <div className="inline-flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-2.5">
          <div className="h-2 flex-1 min-w-[120px] bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / outlines.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
            {completedCount} / {outlines.length}
          </span>
        </div>
      </div>

      {isCoolingDown && (
        <div className="flex items-center justify-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6">
          <Timer className="h-4 w-4 text-amber-600 animate-pulse" />
          <span className="text-sm font-medium text-amber-800">
            Cooldown: {cooldownSeconds}s remaining before next chapter
          </span>
          <div className="h-1.5 w-24 bg-amber-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(cooldownSeconds / 15) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {outlines.map((chapter, index) => (
          <div
            key={chapter.id}
            className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleOutlineVisibility(chapter.id)}
                  className="mt-0.5 p-1 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100 flex-shrink-0"
                >
                  {expandedOutlines[chapter.id] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                      Ch. {index + 1}
                    </span>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug break-words">
                      {chapter.title}
                    </h3>
                  </div>

                  {chapter.isWritten && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button
                        onClick={() => handleStartEdit(chapter)}
                        disabled={isBusy}
                        className="flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setShowRegenerateConfirm(chapter.id)}
                        disabled={isBusy}
                        className="flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Regenerate <span className="hidden sm:inline">(6 credits)</span></span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {chapter.isWritten ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs font-medium hidden sm:inline">Done</span>
                    </div>
                  ) : writingChapterId === chapter.id || regeneratingChapterId === chapter.id ? (
                    <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-600 border-t-transparent" />
                      <span className="text-xs font-medium hidden sm:inline">
                        {writingChapterId === chapter.id ? 'Writing' : 'Regen'}...
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleWriteChapter(chapter)}
                      disabled={isBusy}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 sm:px-4 py-1.5 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium flex items-center gap-1.5"
                    >
                      <PenTool className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span>Write</span>
                    </button>
                  )}
                </div>
              </div>

              {expandedOutlines[chapter.id] && (
                <div className="mt-3 ml-9 text-slate-500 text-sm prose prose-sm max-w-none border-l-2 border-slate-100 pl-4">
                  <ReactMarkdown>{chapter.outline}</ReactMarkdown>
                </div>
              )}
            </div>

            {chapter.content && (
              <div className="border-t border-slate-100 p-4 sm:p-6 bg-slate-50/50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-slate-700">Generated Content</h4>
                  {editingChapterId === chapter.id && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors text-xs font-medium"
                      >
                        <Save className="h-3 w-3" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-1 bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-300 transition-colors text-xs font-medium"
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
                    className="w-full h-64 sm:h-96 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 resize-none font-mono text-sm bg-white"
                    placeholder="Edit your chapter content here..."
                  />
                ) : (
                  <div className="prose prose-sm sm:prose-base max-w-none text-slate-700">
                    <ReactMarkdown>{chapter.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {allChaptersWritten && (
          <div className="text-center pt-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-emerald-900 mb-1">All Chapters Complete!</h3>
              <p className="text-emerald-700 text-sm">Your book is ready to be compiled and downloaded.</p>
            </div>

            <button
              onClick={onCompleteWriting}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg shadow-emerald-500/20"
            >
              <Book className="h-5 w-5" />
              <span>Compile Book</span>
            </button>
          </div>
        )}
      </div>

      {showRegenerateConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Regenerate Chapter?</h3>
              <p className="text-slate-600 text-sm">
                This will cost <strong>6 credits</strong> and replace the current content with a new
                AI-generated version.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> Current content will be replaced. Use Edit for small changes.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleRegenerateConfirm(showRegenerateConfirm)}
                className="flex-1 bg-orange-500 text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-orange-600 transition-colors text-sm"
              >
                Regenerate (6 credits)
              </button>
              <button
                onClick={() => setShowRegenerateConfirm(null)}
                className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2.5 px-4 rounded-xl hover:bg-slate-200 transition-colors text-sm"
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
