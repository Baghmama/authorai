import React, { useEffect, useRef, useState } from 'react';
import { BookIdea, WritingStyle } from '../types';
import { Lightbulb, Globe, BookOpen, Layers, Pen, Feather, MessageCircle, BookMarked, Laugh, GraduationCap, Palette, ChevronDown, Music, Check } from 'lucide-react';
import { calculateCreditsNeeded } from '../utils/creditManager';

const LANGUAGES = [
  { value: 'English', label: 'English', audio: true },
  { value: 'Spanish', label: 'Spanish', audio: false },
  { value: 'French', label: 'French', audio: false },
  { value: 'German', label: 'German', audio: false },
  { value: 'Italian', label: 'Italian', audio: false },
  { value: 'Portuguese', label: 'Portuguese', audio: false },
  { value: 'Chinese', label: 'Chinese', audio: false },
  { value: 'Japanese', label: 'Japanese', audio: false },
  { value: 'Korean', label: 'Korean', audio: false },
  { value: 'Arabic', label: 'Arabic', audio: false },
  { value: 'Hindi', label: 'Hindi', audio: true },
];

const WRITING_STYLES: { value: WritingStyle; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'formal', label: 'Formal', description: 'Polished and professional tone', icon: <Feather className="h-4 w-4" /> },
  { value: 'conversational', label: 'Conversational', description: 'Friendly and approachable', icon: <MessageCircle className="h-4 w-4" /> },
  { value: 'literary', label: 'Literary', description: 'Rich, artistic prose', icon: <BookMarked className="h-4 w-4" /> },
  { value: 'humorous', label: 'Humorous', description: 'Witty and entertaining', icon: <Laugh className="h-4 w-4" /> },
  { value: 'academic', label: 'Academic', description: 'Scholarly and research-driven', icon: <GraduationCap className="h-4 w-4" /> },
  { value: 'descriptive', label: 'Descriptive', description: 'Vivid and immersive detail', icon: <Palette className="h-4 w-4" /> },
];

interface IdeaFormProps {
  onSubmit: (idea: BookIdea) => void;
  isLoading: boolean;
}

const IdeaForm: React.FC<IdeaFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<BookIdea>({
    idea: '',
    language: 'English',
    chapters: 1,
    type: 'Fiction',
    writingStyle: 'formal',
  });
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const creditsNeeded = calculateCreditsNeeded(formData.chapters);
  const selectedLanguage = LANGUAGES.find((language) => language.value === formData.language) ?? LANGUAGES[0];

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsLanguageMenuOpen(false);
    };

    document.addEventListener('mousedown', closeMenu);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', closeMenu);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.idea.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-6 sm:px-10 sm:py-8 flex items-center gap-5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/30">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Share Your Idea</h2>
            <p className="text-slate-400 text-sm">Tell us about the book you want to create</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Pen className="h-4 w-4 text-orange-600" />
              <span>Book Idea</span>
            </label>
            <textarea
              value={formData.idea}
              onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
              placeholder="Describe your book idea in detail..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-600/20 focus:border-orange-500 resize-none transition-all text-slate-700 placeholder:text-slate-400 bg-slate-50/50"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Globe className="h-4 w-4 text-orange-600" />
                <span>Language</span>
              </label>
              <div className="relative" ref={languageMenuRef}>
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isLanguageMenuOpen}
                  onClick={() => setIsLanguageMenuOpen((isOpen) => !isOpen)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-all bg-slate-50/50 text-slate-700 ${
                    isLanguageMenuOpen
                      ? 'border-orange-500 ring-4 ring-orange-500/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className="font-medium truncate">{selectedLanguage.label}</span>
                    {selectedLanguage.audio && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-700 shrink-0">
                        <Music className="h-3 w-3" /> Audio
                      </span>
                    )}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${isLanguageMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLanguageMenuOpen && (
                  <div role="listbox" aria-label="Choose a language" className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                    {LANGUAGES.map((language) => {
                      const isSelected = language.value === formData.language;
                      return (
                        <button
                          key={language.value}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setFormData({ ...formData, language: language.value });
                            setIsLanguageMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${isSelected ? 'bg-orange-50 text-orange-700' : 'text-slate-700 hover:bg-slate-50'}`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className={`h-2 w-2 rounded-full ${isSelected ? 'bg-orange-500' : 'bg-slate-200'}`} />
                            <span className="font-medium">{language.label}</span>
                            {language.audio && <span className="text-xs text-slate-400">Audio</span>}
                          </span>
                          {isSelected && <Check className="h-4 w-4 text-orange-600" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <p className="mt-2 text-[10px] font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                <Music className="h-3 w-3" />
                <span>Audio supported for English & Hindi</span>
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Layers className="h-4 w-4 text-orange-600" />
                <span>Chapters</span>
              </label>
              <div className="space-y-3">
                <input
                  type="range"
                  min="1"
                  max="18"
                  value={formData.chapters}
                  onChange={(e) =>
                    setFormData({ ...formData, chapters: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #ea580c 0%, #ea580c ${((formData.chapters - 1) / 17) * 100}%, #e2e8f0 ${((formData.chapters - 1) / 17) * 100}%, #e2e8f0 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>1</span>
                  <span className="font-semibold text-orange-600">
                    {formData.chapters} chapters ({creditsNeeded} credits)
                  </span>
                  <span>18</span>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <BookOpen className="h-4 w-4 text-orange-600" />
                <span>Book Type</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as BookIdea['type'] })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-600/20 focus:border-orange-500 transition-all bg-slate-50/50 text-slate-700"
              >
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Educative">Educative</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
              <Feather className="h-4 w-4 text-orange-600" />
              <span>Writing Style</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {WRITING_STYLES.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, writingStyle: style.value })}
                  className={`group relative flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                    formData.writingStyle === style.value
                      ? 'border-orange-400 bg-orange-50/80 shadow-sm shadow-orange-500/10'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`flex items-center gap-2 ${
                    formData.writingStyle === style.value ? 'text-orange-600' : 'text-slate-500 group-hover:text-slate-700'
                  } transition-colors`}>
                    {style.icon}
                    <span className={`text-sm font-semibold ${
                      formData.writingStyle === style.value ? 'text-orange-700' : 'text-slate-700'
                    }`}>{style.label}</span>
                  </div>
                  <span className={`text-xs leading-snug ${
                    formData.writingStyle === style.value ? 'text-orange-600/80' : 'text-slate-400'
                  }`}>{style.description}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !formData.idea.trim()}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-orange-700 hover:to-amber-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 hover:shadow-xl hover:shadow-orange-600/25"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Generating Outlines... ({creditsNeeded} credits)</span>
              </>
            ) : (
              <>
                <Pen className="h-5 w-5" />
                <span>Generate Chapter Outlines ({creditsNeeded} credits)</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IdeaForm;
