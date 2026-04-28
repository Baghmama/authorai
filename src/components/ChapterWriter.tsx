import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChapterOutline, BookIdea } from '../types';
import { writeChapter } from '../utils/geminiApi';
import { deductCreditsForChapterGeneration, getUserCredits, deductCreditsForAudioEpisode, AUDIO_EPISODE_CREDITS } from '../utils/creditManager';
import { generateAudioEpisode, AudioQuality } from '../utils/sarvamApi';
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
  Headphones,
  Play,
  Pause,
  Download,
  Star,
  Music,
  Volume2,
  FastForward,
} from 'lucide-react';

type AudioStatus = 'idle' | 'choosing' | 'generating' | 'ready' | 'error';

interface AudioState {
  status: AudioStatus;
  audioUrl?: string;
  quality?: AudioQuality;
  speaker?: string;
  progress?: number;
  error?: string;
}

const VOICES: Record<AudioQuality, { female: string[], male: string[] }> = {
  pro: {
    female: ['priya', 'ritu', 'ishita', 'kavya', 'pooja', 'shreya', 'simran'],
    male: ['shubh', 'aditya', 'amit', 'rahul', 'rohan', 'ratan']
  },
  regular: {
    female: ['anushka', 'manisha', 'vidya'],
    male: ['abhilash', 'hitesh', 'karun']
  }
};

const PREVIEW_BASE_URL = 'https://pub-2a5b45b3640e4493b3b146d143ef868a.r2.dev';

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
  const [audioStates, setAudioStates] = useState<Record<string, AudioState>>({});
  const [playingChapterId, setPlayingChapterId] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const [choosingAudio, setChoosingAudio] = useState<{ chapter: ChapterOutline, quality: AudioQuality } | null>(null);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedPace, setSelectedPace] = useState(1.0);

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

  const setAudioState = (chapterId: string, update: Partial<AudioState>) => {
    setAudioStates((prev) => ({
      ...prev,
      [chapterId]: { ...(prev[chapterId] ?? { status: 'idle' }), ...update },
    }));
  };

  const handleCreateEpisode = async (chapter: ChapterOutline, quality: AudioQuality, speaker: string, pace: number) => {
    if (!chapter.content) return;

    setChoosingAudio(null);
    setAudioState(chapter.id, { status: 'generating', quality, speaker, progress: 0 });

    try {
      // Deduct credits first
      const creditResult = await deductCreditsForAudioEpisode(quality);
      if (!creditResult.success) {
        setAudioState(chapter.id, { status: 'error', error: creditResult.error || 'Failed to deduct credits.' });
        return;
      }

      // Generate audio
      const blob = await generateAudioEpisode(chapter.content, quality, speaker, pace, (progress) => {
        setAudioState(chapter.id, { progress });
      });

      const url = URL.createObjectURL(blob);
      setAudioState(chapter.id, { status: 'ready', audioUrl: url, quality, speaker, progress: 1 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setAudioState(chapter.id, { status: 'error', error: msg });
    }
  };

  const handlePreviewVoice = (voice: string) => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      if (playingPreview === voice) {
        setPlayingPreview(null);
        return;
      }
    }

    const url = `${PREVIEW_BASE_URL}/${voice}_tts_audio.mp3`;
    const audio = new Audio(url);
    previewAudioRef.current = audio;
    setPlayingPreview(voice);
    
    audio.play().catch(console.error);
    audio.onended = () => setPlayingPreview(null);
  };

  const handlePlayPause = (chapterId: string) => {
    const audio = audioRefs.current[chapterId];
    if (!audio) return;
    if (playingChapterId === chapterId && !audio.paused) {
      audio.pause();
      setPlayingChapterId(null);
    } else {
      // Pause any other playing audio
      Object.entries(audioRefs.current).forEach(([id, el]) => {
        if (id !== chapterId && el && !el.paused) el.pause();
      });
      audio.play();
      setPlayingChapterId(chapterId);
    }
  };

  const handleAudioEnded = (chapterId: string) => {
    setPlayingChapterId(null);
    // Reset audio position
    const audio = audioRefs.current[chapterId];
    if (audio) audio.currentTime = 0;
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
                      {/* Audio episode buttons */}
                      {(() => {
                        const aState = audioStates[chapter.id];
                        if (aState?.status === 'generating') return null;
                        return (
                          <>
                            <button
                              onClick={() => setChoosingAudio({ chapter, quality: 'regular' })}
                              disabled={isBusy || aState?.status === 'generating'}
                              className="flex items-center gap-1 bg-violet-50 text-violet-700 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Regular audio using bulbul:v2"
                            >
                              <Music className="h-3 w-3" />
                              <span>Audio <span className="hidden sm:inline">(4 credits)</span></span>
                            </button>
                            <button
                              onClick={() => setChoosingAudio({ chapter, quality: 'pro' })}
                              disabled={isBusy || aState?.status === 'generating'}
                              className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Pro audio using bulbul:v3"
                            >
                              <Star className="h-3 w-3" />
                              <span>Pro Audio <span className="hidden sm:inline">(7 credits)</span></span>
                            </button>
                          </>
                        );
                      })()}
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

                {/* ── Audio Episode Section ── */}
                {(() => {
                  const aState = audioStates[chapter.id];
                  if (!aState || aState.status === 'idle') return null;

                  if (aState.status === 'generating') {
                    const pct = Math.round((aState.progress ?? 0) * 100);
                    return (
                      <div className="mt-4 rounded-xl bg-gradient-to-r from-violet-50 to-amber-50 border border-violet-200/60 p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-violet-500 border-t-transparent flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-violet-800">
                              Generating {aState.quality === 'pro' ? '⭐ Pro' : '🎵 Regular'} Audio Episode...
                            </p>
                            <p className="text-xs text-violet-600 mt-0.5">
                              {pct > 0 ? `${pct}% — processing text chunks` : 'Starting up...'}
                            </p>
                          </div>
                        </div>
                        <div className="h-1.5 bg-violet-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(pct, 5)}%` }}
                          />
                        </div>
                      </div>
                    );
                  }

                  if (aState.status === 'error') {
                    return (
                      <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                        <X className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-800">Audio Generation Failed</p>
                          <p className="text-xs text-red-600 mt-1">{aState.error}</p>
                          <button
                            onClick={() => setAudioState(chapter.id, { status: 'idle' })}
                            className="text-xs text-red-700 underline mt-2"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (aState.status === 'ready' && aState.audioUrl) {
                    const isPlaying = playingChapterId === chapter.id;
                    const qualityLabel = aState.quality === 'pro' ? '⭐ Pro' : '🎵 Regular';
                    return (
                      <div className="mt-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 shadow-lg">
                        {/* Hidden native audio element */}
                        <audio
                          ref={(el) => { audioRefs.current[chapter.id] = el; }}
                          src={aState.audioUrl}
                          onEnded={() => handleAudioEnded(chapter.id)}
                        />
                        <div className="flex items-center gap-3">
                          {/* Play/Pause */}
                          <button
                            onClick={() => handlePlayPause(chapter.id)}
                            className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-amber-400 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                          >
                            {isPlaying
                              ? <Pause className="h-4 w-4 text-white" />
                              : <Play className="h-4 w-4 text-white ml-0.5" />}
                          </button>

                          {/* Info + waveform bars */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Headphones className="h-3 w-3 text-violet-300 flex-shrink-0" />
                              <span className="text-xs font-semibold text-white truncate">
                                Ch. {index + 1} — {chapter.title}
                              </span>
                              <span className="text-xs text-violet-300 ml-auto flex-shrink-0">{qualityLabel}</span>
                            </div>
                            {/* Animated waveform (decorative) */}
                            <div className="flex items-end gap-0.5 h-5">
                              {[3,5,4,6,3,5,7,4,6,3,5,4,6,5,3].map((h, i) => (
                                <div
                                  key={i}
                                  className={`w-1 rounded-full transition-all ${
                                    isPlaying
                                      ? 'bg-gradient-to-t from-violet-500 to-amber-300 animate-pulse'
                                      : 'bg-slate-600'
                                  }`}
                                  style={{
                                    height: `${h * (isPlaying ? 1 : 0.5)}px`,
                                    animationDelay: `${i * 80}ms`,
                                  }}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Download */}
                          <a
                            href={aState.audioUrl}
                            download={`chapter-${index + 1}-${aState.quality}-audio.wav`}
                            className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors"
                            title="Download audio"
                          >
                            <Download className="h-3.5 w-3.5 text-slate-200" />
                          </a>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 text-right">
                          Regenerate episode using the buttons above
                        </p>
                      </div>
                    );
                  }

                  return null;
                })()}
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

      {choosingAudio && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col scale-in-center">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-orange-500" />
                  Select Voice — {choosingAudio.quality === 'pro' ? '⭐ Pro' : '🎵 Regular'}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Cost: <span className="font-bold text-orange-600">{AUDIO_EPISODE_CREDITS[choosingAudio.quality]} credits</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 pr-4">
                <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100">
                  <FastForward className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-bold text-orange-700">{selectedPace.toFixed(1)}x Speed</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={selectedPace}
                    onChange={(e) => setSelectedPace(parseFloat(e.target.value))}
                    className="w-24 h-1.5 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500 ml-2"
                  />
                </div>
              </div>
              <button
                onClick={() => setChoosingAudio(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

              {/* Female Voices */}
              <div>
                <h4 className="text-xs font-bold text-pink-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                  Female Voices
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {VOICES[choosingAudio.quality].female.map((voice) => (
                    <div
                      key={voice}
                      className="group flex items-center p-1 rounded-2xl border border-pink-100 bg-pink-50/50 hover:bg-pink-100 transition-all"
                    >
                      <button
                        onClick={() => handlePreviewVoice(voice)}
                        className="p-3 text-pink-500 hover:text-pink-600 transition-colors"
                        title="Play preview"
                      >
                        {playingPreview === voice ? (
                          <div className="flex gap-0.5 items-end h-4">
                            <div className="w-0.5 h-full bg-pink-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-0.5 h-3 bg-pink-500 animate-bounce" style={{ animationDelay: '100ms' }} />
                            <div className="w-0.5 h-full bg-pink-500 animate-bounce" style={{ animationDelay: '200ms' }} />
                          </div>
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCreateEpisode(choosingAudio.chapter, choosingAudio.quality, voice, selectedPace)}
                        className="flex-1 text-left py-3 pr-4"
                      >
                        <span className="block text-sm font-bold text-pink-700 capitalize">
                          {voice}
                        </span>
                      </button>
                      <button
                        onClick={() => handleCreateEpisode(choosingAudio.chapter, choosingAudio.quality, voice, selectedPace)}
                        className="bg-white/80 text-pink-600 px-3 py-1.5 rounded-xl text-[10px] font-bold mr-2 shadow-sm hover:bg-white transition-colors"
                      >
                        SELECT
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Male Voices */}
              <div>
                <h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Male Voices
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {VOICES[choosingAudio.quality].male.map((voice) => (
                    <div
                      key={voice}
                      className="group flex items-center p-1 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100 transition-all"
                    >
                      <button
                        onClick={() => handlePreviewVoice(voice)}
                        className="p-3 text-blue-500 hover:text-blue-600 transition-colors"
                        title="Play preview"
                      >
                        {playingPreview === voice ? (
                          <div className="flex gap-0.5 items-end h-4">
                            <div className="w-0.5 h-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-0.5 h-3 bg-blue-500 animate-bounce" style={{ animationDelay: '100ms' }} />
                            <div className="w-0.5 h-full bg-blue-500 animate-bounce" style={{ animationDelay: '200ms' }} />
                          </div>
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCreateEpisode(choosingAudio.chapter, choosingAudio.quality, voice, selectedPace)}
                        className="flex-1 text-left py-3 pr-4"
                      >
                        <span className="block text-sm font-bold text-blue-700 capitalize">
                          {voice}
                        </span>
                      </button>
                      <button
                        onClick={() => handleCreateEpisode(choosingAudio.chapter, choosingAudio.quality, voice, selectedPace)}
                        className="bg-white/80 text-blue-600 px-3 py-1.5 rounded-xl text-[10px] font-bold mr-2 shadow-sm hover:bg-white transition-colors"
                      >
                        SELECT
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400">
                AI generation takes ~10-20 seconds depending on chapter length.
              </p>
            </div>
          </div>
        </div>
      )}

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
