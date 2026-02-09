import React, { useState } from 'react';
import { BookIdea, WritingStyle } from '../types';
import { Lightbulb, Globe, BookOpen, Layers, Sparkles, Feather, MessageCircle, BookMarked, Laugh, GraduationCap, Palette } from 'lucide-react';
import { calculateCreditsNeeded } from '../utils/creditManager';

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

  const creditsNeeded = calculateCreditsNeeded(formData.chapters);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.idea.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-5 sm:px-8 sm:py-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
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
              <Sparkles className="h-4 w-4 text-orange-500" />
              <span>Book Idea</span>
            </label>
            <textarea
              value={formData.idea}
              onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
              placeholder="Describe your book idea in detail..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 resize-none transition-all text-slate-700 placeholder:text-slate-400 bg-slate-50/50"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Globe className="h-4 w-4 text-orange-500" />
                <span>Language</span>
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all bg-slate-50/50 text-slate-700"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Italian">Italian</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
                <option value="Korean">Korean</option>
                <option value="Arabic">Arabic</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Layers className="h-4 w-4 text-orange-500" />
                <span>Chapters</span>
              </label>
              <div className="space-y-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.chapters}
                  onChange={(e) =>
                    setFormData({ ...formData, chapters: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #f97316 0%, #f97316 ${(formData.chapters - 1) * 11.11}%, #e2e8f0 ${(formData.chapters - 1) * 11.11}%, #e2e8f0 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>1</span>
                  <span className="font-semibold text-orange-600">
                    {formData.chapters} chapters ({creditsNeeded} credits)
                  </span>
                  <span>10</span>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <BookOpen className="h-4 w-4 text-orange-500" />
                <span>Book Type</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as BookIdea['type'] })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all bg-slate-50/50 text-slate-700"
              >
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Educative">Educative</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
              <Feather className="h-4 w-4 text-orange-500" />
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
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/25"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Generating Outlines... ({creditsNeeded} credits)</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
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
