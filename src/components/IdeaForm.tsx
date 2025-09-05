import React, { useState } from 'react';
import { BookIdea } from '../types';
import { Lightbulb, Globe, BookOpen, Layers } from 'lucide-react';
import { calculateCreditsNeeded } from '../utils/creditManager';

interface IdeaFormProps {
  onSubmit: (idea: BookIdea) => void;
  isLoading: boolean;
}

const IdeaForm: React.FC<IdeaFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<BookIdea>({
    idea: '',
    language: 'English',
    chapters: 1,
    type: 'Fiction'
  });

  const creditsNeeded = calculateCreditsNeeded(formData.chapters);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.idea.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="max-w-2xl mx-auto glass-card rounded-xl p-8">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lightbulb className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-glass mb-2">Share Your Idea</h2>
        <p className="text-glass-muted">Tell us about the book you want to create</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-glass mb-2">
            <Lightbulb className="h-4 w-4" />
            <span>Book Idea</span>
          </label>
          <textarea
            value={formData.idea}
            onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
            placeholder="Describe your book idea in detail..."
            className="w-full px-4 py-3 glass-input rounded-lg resize-none text-glass placeholder-glass-subtle"
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-glass mb-2">
              <Globe className="h-4 w-4" />
              <span>Language</span>
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-4 py-3 glass-input rounded-lg text-glass"
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
            <label className="flex items-center space-x-2 text-sm font-medium text-glass mb-2">
              <Layers className="h-4 w-4" />
              <span>Chapters</span>
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.chapters}
                onChange={(e) => setFormData({ ...formData, chapters: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #f97316 0%, #f97316 ${(formData.chapters - 1) * 11.11}%, #e5e7eb ${(formData.chapters - 1) * 11.11}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-white/60">
                <span>1</span>
                <span className="font-semibold text-orange-600">
                  {formData.chapters} chapters ({creditsNeeded} credits)
                </span>
                <span>10</span>
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-glass mb-2">
              <BookOpen className="h-4 w-4" />
              <span>Book Type</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as BookIdea['type'] })}
              className="w-full px-4 py-3 glass-input rounded-lg text-glass"
            >
              <option value="Fiction">Fiction</option>
              <option value="Non-Fiction">Non-Fiction</option>
              <option value="Educative">Educative</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.idea.trim()}
          className="w-full glass-button text-glass font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-glass"></div>
              <span>Generating Chapter Outlines... ({creditsNeeded} credits)</span>
            </>
          ) : (
            <>
              <Lightbulb className="h-5 w-5" />
              <span>Generate Chapter Outlines ({creditsNeeded} credits)</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default IdeaForm;