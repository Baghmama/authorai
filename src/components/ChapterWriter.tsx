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
  Pen,
  Zap,
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

  const stopPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
      previewAudioRef.current = null;
    }
    setPlayingPreview(null);
  };

  const handleCreateEpisode = async (chapter: ChapterOutline, quality: AudioQuality, speaker: string, pace: number) => {
    if (!chapter.content) return;

    stopPreview();
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
    <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-6 py-4 sm:py-10">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest mb-4">
          <Zap className="h-3 w-3" strokeWidth={3} />
          <span>Manuscript Phase</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          Write Your <span className="gradient-text">Masterpiece</span>
        </h2>
        <p className="text-slate-500 max-w-lg mx-auto text-lg leading-relaxed font-medium">
          Refine your chapters and generate high-fidelity audio narrations.
        </p>
        
        <div className="mt-8 inline-flex items-center gap-6 glass-panel rounded-2xl px-6 py-3 shadow-xl shadow-slate-200/50">
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Completion Progress</span>
            <div className="flex items-center gap-3 mt-1">
              <div className="h-2 w-48 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                  style={{ width: `${(completedCount / outlines.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-black text-slate-900">
                {Math.round((completedCount / outlines.length) * 100)}%
              </span>
            </div>
          </div>
          <div className="w-[1px] h-8 bg-slate-200" />
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Chapters</span>
            <span className="text-xl font-black text-slate-900">{completedCount} <span className="text-slate-300 font-medium">/ {outlines.length}</span></span>
          </div>
        </div>
      </div>

      {isCoolingDown && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="glass-panel border-amber-200/50 rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-4">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Timer className="h-5 w-5 text-amber-600 animate-spin-slow" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-none">Cooling Down</p>
              <p className="text-xs text-amber-700 mt-1">Available in {cooldownSeconds}s</p>
            </div>
            <div className="h-8 w-[1px] bg-amber-200" />
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-amber-100" />
                <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-amber-500 transition-all duration-1000 ease-linear" strokeDasharray={125.6} strokeDashoffset={125.6 - (cooldownSeconds / 15) * 125.6} />
              </svg>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-12">
        {outlines.map((chapter, index) => (
          <div
            key={chapter.id}
            className="premium-card rounded-[2.5rem] overflow-hidden group border-none"
          >
            {/* Chapter Header (Glassy) */}
            <div className="bg-slate-50/80 backdrop-blur-sm px-8 py-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-inner flex items-center justify-center border border-slate-100">
                  <span className="text-lg font-black text-slate-900 tracking-tighter">{index + 1}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Chapter Title</span>
                    {chapter.isWritten && (
                      <div className="w-1 h-1 rounded-full bg-emerald-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">{chapter.title}</h3>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {chapter.isWritten ? (
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider border border-emerald-100/50">
                    <CheckCircle className="h-4 w-4" strokeWidth={2} />
                    <span>Manuscript Ready</span>
                  </div>
                ) : writingChapterId === chapter.id || regeneratingChapterId === chapter.id ? (
                  <div className="flex items-center gap-3 bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-2xl text-sm font-bold border border-indigo-100">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent" />
                    <span>{writingChapterId === chapter.id ? 'Writing' : 'Regen'} with AI...</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleWriteChapter(chapter)}
                    disabled={isBusy}
                    className="premium-button-gradient text-white px-8 py-3 rounded-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:grayscale text-sm font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-indigo-200"
                  >
                    <PenTool className="h-4 w-4" strokeWidth={2} />
                    <span>Begin Writing</span>
                  </button>
                )}
                
                <button
                  onClick={() => toggleOutlineVisibility(chapter.id)}
                  className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-100 shadow-sm"
                >
                  {expandedOutlines[chapter.id] ? (
                    <ChevronUp className="h-5 w-5" strokeWidth={1.5} />
                  ) : (
                    <ChevronDown className="h-5 w-5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            {/* Outline Section */}
            {expandedOutlines[chapter.id] && (
              <div className="bg-slate-50/30 px-10 py-8 border-b border-slate-100 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Edit3 className="h-4 w-4 text-orange-700" strokeWidth={2} />
                  </div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Directives & Outline</h4>
                </div>
                <div className="prose prose-slate prose-sm max-w-none text-slate-500 font-medium leading-relaxed italic">
                  <ReactMarkdown>{chapter.outline}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Content & Actions Section */}
            {chapter.isWritten && (
              <div className="p-10">
                {/* Actions Ribbon */}
                <div className="flex flex-wrap items-center gap-3 mb-10 p-2 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 w-fit">
                  <button
                    onClick={() => handleStartEdit(chapter)}
                    disabled={isBusy}
                    className="group flex items-center gap-2 bg-white text-slate-600 px-5 py-2.5 rounded-xl hover:text-slate-900 hover:shadow-md transition-all text-xs font-black uppercase tracking-wider disabled:opacity-50"
                  >
                    <Edit3 className="h-4 w-4 text-slate-400 group-hover:text-orange-500 transition-colors" strokeWidth={1.5} />
                    <span>Refine Text</span>
                  </button>

                  <button
                    onClick={() => setShowRegenerateConfirm(chapter.id)}
                    disabled={isBusy}
                    className="group flex items-center gap-2 bg-white text-slate-600 px-5 py-2.5 rounded-xl hover:text-orange-700 hover:shadow-md transition-all text-xs font-black uppercase tracking-wider disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4 text-slate-400 group-hover:text-orange-500 transition-colors" strokeWidth={1.5} />
                    <span>Regenerate</span>
                  </button>

                  <div className="w-[1px] h-6 bg-slate-200 mx-1" />

                  {audioStates[chapter.id]?.status === 'generating' ? (
                    <div className="flex items-center gap-3 bg-slate-100 text-slate-500 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider animate-pulse">
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-slate-400 border-t-transparent" />
                      <span>Audio is being Generated</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setChoosingAudio({ chapter, quality: 'regular' })}
                        disabled={isBusy}
                        className="group flex items-center gap-2 bg-white text-slate-600 px-5 py-2.5 rounded-xl hover:text-indigo-600 hover:shadow-md transition-all text-xs font-black uppercase tracking-wider disabled:opacity-50"
                      >
                        <Music className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" strokeWidth={1.5} />
                        <span>Regular Voice</span>
                      </button>

                      <button
                        onClick={() => setChoosingAudio({ chapter, quality: 'pro' })}
                        disabled={isBusy}
                        className="group flex items-center gap-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:shadow-xl hover:shadow-indigo-200 transition-all text-xs font-black uppercase tracking-wider disabled:opacity-50"
                      >
                        <Pen className="h-4 w-4 text-indigo-100" strokeWidth={1.5} />
                        <span>Pro Voice</span>
                      </button>
                    </>
                  )}
                </div>

                {/* The Story Display */}
                <div className="relative group/content">
                  {editingChapterId === chapter.id ? (
                    <div className="space-y-6 relative">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full h-[32rem] p-10 rounded-[2rem] border-2 border-orange-200 focus:border-orange-500 focus:ring-8 focus:ring-orange-500/5 transition-all serif-content resize-none outline-none bg-white shadow-2xl"
                        placeholder="Write your story..."
                      />
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => setEditingChapterId(null)}
                          className="px-8 py-3 rounded-2xl text-slate-500 font-black uppercase tracking-widest hover:bg-slate-100 transition-all text-xs"
                        >
                          Discard
                        </button>
                        <button
                          onClick={() => handleSaveEdit(chapter.id)}
                          className="px-10 py-3 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 text-xs"
                        >
                          Commit Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-12 shadow-inner">
                      <div className="max-w-prose mx-auto">
                        <div className="serif-content text-lg sm:text-xl prose prose-slate max-w-none prose-p:mb-6 prose-p:leading-[1.8] prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tight prose-headings:mb-6 prose-blockquote:border-l-4 prose-blockquote:border-orange-200 prose-blockquote:bg-orange-50/30 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic">
                          <ReactMarkdown>{chapter.content || ''}</ReactMarkdown>
                        </div>
                      </div>
                      
                      {/* Chapter Footer Ornament */}
                      <div className="mt-16 flex items-center justify-center gap-4 opacity-20">
                        <div className="h-[1px] w-12 bg-slate-400" />
                        <div className="w-2 h-2 rounded-full border-2 border-slate-400" />
                        <div className="h-[1px] w-12 bg-slate-400" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Audio Status Overlay */}
                {(() => {
                  const aState = audioStates[chapter.id];
                  if (!aState || aState.status === 'idle') return null;

                  if (aState.status === 'generating') {
                    const pct = Math.round((aState.progress ?? 0) * 100);
                    return (
                      <div className="mt-10 glass-panel border-indigo-100 rounded-3xl p-8 animate-in zoom-in-95 duration-500">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-200 animate-pulse">
                              <Music className="h-6 w-6 text-white" strokeWidth={2} />
                            </div>
                            <div>
                              <p className="text-lg font-black text-slate-900 leading-none">Studio Rendering</p>
                              <p className="text-sm text-slate-500 mt-1 font-medium">Processing text-to-speech engine</p>
                            </div>
                          </div>
                          <span className="text-2xl font-black text-indigo-600">{pct}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(pct, 5)}%` }}
                          />
                        </div>
                      </div>
                    );
                  }

                  if (aState.status === 'error') {
                    return (
                      <div className="mt-8 rounded-3xl bg-red-50 border border-red-100 p-6 flex items-start gap-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm">
                          <X className="h-6 w-6 text-red-500" strokeWidth={2} />
                        </div>
                        <div>
                          <p className="text-lg font-black text-red-900 leading-none">Studio Error</p>
                          <p className="text-sm text-red-700 mt-2 font-medium">{aState.error}</p>
                          <button
                            onClick={() => setAudioState(chapter.id, { status: 'idle' })}
                            className="mt-4 text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-700 underline underline-offset-4"
                          >
                            Dismiss Report
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (aState.status === 'ready' && aState.audioUrl) {
                    const isPlaying = playingChapterId === chapter.id;
                    const qualityLabel = aState.quality === 'pro' ? 'Studio Pro' : 'Regular Voice';
                    return (
                      <div className="mt-10 glass-panel bg-slate-900 border-slate-800 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-900/20 group/player">
                        <audio
                          ref={(el) => { audioRefs.current[chapter.id] = el; }}
                          src={aState.audioUrl}
                          onEnded={() => handleAudioEnded(chapter.id)}
                        />
                      <div className="mt-8 -mx-6 sm:-mx-12 -mb-6 sm:-mb-12 bg-slate-900 p-4 sm:p-6 relative overflow-hidden group/player">
                        <div className="flex items-center gap-4 sm:gap-8 relative">
                          <button
                            onClick={() => handlePlayPause(chapter.id)}
                            className="flex-shrink-0 w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-400 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                          >
                            {isPlaying
                              ? <Pause className="h-6 w-6" fill="currentColor" />
                              : <Play className="h-6 w-6 ml-1" fill="currentColor" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-3 px-1">
                              <div className="flex items-center gap-3">
                                <div className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider border border-indigo-500/30">
                                  {aState.quality.toUpperCase()} VOICE
                                </div>
                                <span className="text-xs font-bold text-slate-100 truncate sm:max-w-md">
                                  {chapter.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-slate-500 tracking-[0.2em] hidden md:block">MASTERED AUDIO</span>
                                <a
                                  href={aState.audioUrl}
                                  download={`chapter-${index + 1}-${aState.quality}.wav`}
                                  className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl hover:bg-slate-700 transition-all border border-slate-700 shadow-sm"
                                  title="Download Audio"
                                >
                                  <Download className="h-4 w-4" />
                                  <span className="text-xs font-black uppercase tracking-tighter hidden sm:inline">Save</span>
                                </a>
                              </div>
                            </div>
                            
                            <div className="flex items-end gap-1.5 h-8 bg-black/40 rounded-xl px-4 py-2 overflow-hidden border border-white/5">
                              {Array.from({ length: 100 }).map((_, i) => {
                                const h = [30,50,40,70,30,50,90,40,60,30,50,40,80,50,30,60,40,70,30,50,40,60,30,80,40,50,70,30,60,40,90,50,30,70,40,60,30,80,40,50,30,70,40,90,30,50,80,40,60,30,50,70,40,80,30,60,90,40,50,70,40,60,30,80,40,50,70,30,60,40,90,50,30,70,40,60,30,80,40,50,30,50,40,70,30,50,90,40,60,30,50,40,80,50,30,60,40,70,30,50][i];
                                return (
                                  <div
                                    key={i}
                                    className={`flex-1 rounded-full transition-all duration-300 ${
                                      isPlaying ? 'bg-indigo-400' : 'bg-slate-700'
                                    }`}
                                    style={{
                                      height: `${h * (isPlaying ? (0.4 + Math.random() * 0.6) : 0.2)}%`,
                                      transitionDelay: `${i * 5}ms`,
                                    }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
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
          <div className="text-center pt-12 pb-24">
            <div className="glass-panel border-emerald-100 rounded-[3rem] p-12 mb-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="w-20 h-20 rounded-[2rem] bg-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30 group-hover:rotate-12 transition-transform duration-500">
                  <Book className="h-10 w-10 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Manuscript Finalized</h3>
                <p className="text-slate-500 text-lg font-medium max-w-md mx-auto mb-10">
                  Every chapter has been polished and rendered. Your complete book is ready for compilation.
                </p>

                <button
                  onClick={onCompleteWriting}
                  className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] hover:bg-black transition-all duration-300 font-black uppercase tracking-widest shadow-2xl shadow-slate-900/40 flex items-center gap-4 mx-auto group/btn"
                >
                  <Book className="h-6 w-6 text-emerald-400 group-hover/btn:scale-110 transition-transform" strokeWidth={2} />
                  <span>Compile Complete Book</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {choosingAudio && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col scale-in-center border border-white/20">
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm relative">
              {/* Absolute Close Button */}
              <button
                onClick={() => {
                  stopPreview();
                  setChoosingAudio(null);
                }}
                className="absolute top-4 right-4 p-2 hover:bg-slate-200/50 rounded-xl transition-all hover:rotate-90 z-10"
              >
                <X className="h-5 w-5 text-slate-400" strokeWidth={2} />
              </button>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-orange-600 rounded-2xl shadow-lg shadow-orange-600/30 shrink-0">
                    <Headphones className="h-6 w-6 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                      Pro Voice Studio
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{choosingAudio.quality} MODE</span>
                      </div>
                      <div className="w-[1px] h-3 bg-slate-300" />
                      <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">
                        Cost: <span className="text-orange-700">{AUDIO_EPISODE_CREDITS[choosingAudio.quality]} credits</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-200 w-full md:w-auto">
                  <div className="p-2 bg-orange-50 rounded-xl shrink-0">
                    <Zap className="h-4 w-4 text-orange-600" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase leading-none tracking-wider">Pace Control</span>
                      <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">{selectedPace}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={selectedPace}
                      onChange={(e) => setSelectedPace(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                  </div>
                </div>
              </div>
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
