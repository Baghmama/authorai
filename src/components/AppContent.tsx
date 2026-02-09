import React, { useState } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import SaleBanner from './SaleBanner';
import ServiceSuspensionBanner from './ServiceSuspensionBanner';
import ProgressIndicator from './ProgressIndicator';
import IdeaForm from './IdeaForm';
import ChapterOutlines from './ChapterOutlines';
import ChapterWriter from './ChapterWriter';
import BookCompiler from './BookCompiler';
import { BookIdea, ChapterOutline, AppStep, User } from '../types';
import { generateChapterOutlines } from '../utils/geminiApi';
import { deductCreditsForChapterGeneration, getUserCredits, calculateCreditsNeeded } from '../utils/creditManager';
import { supabase } from '../lib/supabase';

interface AppContentProps {
  user: User;
  onSignOut: () => void;
}

const AppContent: React.FC<AppContentProps> = ({ user, onSignOut }) => {
  const [currentStep, setCurrentStep] = useState<AppStep>('idea');
  const [bookIdea, setBookIdea] = useState<BookIdea | null>(null);
  const [outlines, setOutlines] = useState<ChapterOutline[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const parseChapterOutlines = (text: string): ChapterOutline[] => {
    const chapters: ChapterOutline[] = [];
    const sections = text.split(/Chapter \d+:/);

    sections.slice(1).forEach((section, index) => {
      const lines = section.trim().split('\n');
      const title = lines[0]?.trim() || `Chapter ${index + 1}`;
      const outline = lines.slice(1).join('\n').trim();

      chapters.push({
        id: `chapter-${index + 1}`,
        title: `Chapter ${index + 1}: ${title}`,
        outline: outline || 'Chapter outline will be generated here.',
        isWritten: false
      });
    });

    return chapters;
  };

  const handleIdeaSubmit = async (idea: BookIdea) => {
    setIsGenerating(true);
    setBookIdea(idea);

    try {
      const userCredits = await getUserCredits();

      if (!userCredits) {
        alert('Failed to check credits. Please try again.');
        setIsGenerating(false);
        return;
      }

      const creditsNeeded = calculateCreditsNeeded(idea.chapters);
      if (userCredits.credits < creditsNeeded) {
        alert(`Insufficient credits. You need ${creditsNeeded} credits but only have ${userCredits.credits}.`);
        setIsGenerating(false);
        return;
      }

      const outlinesText = await generateChapterOutlines(
        idea.idea,
        idea.language,
        idea.chapters,
        idea.type,
        idea.writingStyle
      );

      const parsedOutlines = parseChapterOutlines(outlinesText);

      const creditResult = await deductCreditsForChapterGeneration(idea.chapters);

      if (!creditResult.success) {
        alert('Chapter outlines generated but failed to deduct credits. Please contact support.');
      }

      setOutlines(parsedOutlines);
      setCurrentStep('outlines');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert('Failed to generate chapter outlines: ' + errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartWriting = () => {
    setCurrentStep('writing');
  };

  const handleCompleteWriting = () => {
    setCurrentStep('book');
  };

  const handleNewProject = () => {
    setCurrentStep('idea');
    setBookIdea(null);
    setOutlines([]);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <ServiceSuspensionBanner />
      <Navigation userEmail={user.email} />
      <SaleBanner />

      <main className="flex-1 py-6 sm:py-10 px-3 sm:px-4 lg:px-8 max-w-7xl mx-auto w-full">
        <ProgressIndicator currentStep={currentStep} />

        {currentStep === 'idea' && (
          <IdeaForm onSubmit={handleIdeaSubmit} isLoading={isGenerating} />
        )}

        {currentStep === 'outlines' && bookIdea && (
          <ChapterOutlines
            outlines={outlines}
            onUpdateOutlines={setOutlines}
            onStartWriting={handleStartWriting}
          />
        )}

        {currentStep === 'writing' && bookIdea && (
          <ChapterWriter
            outlines={outlines}
            bookIdea={bookIdea}
            onUpdateOutlines={setOutlines}
            onCompleteWriting={handleCompleteWriting}
          />
        )}

        {currentStep === 'book' && bookIdea && (
          <BookCompiler
            project={{
              idea: bookIdea,
              outlines,
              isComplete: true
            }}
            onNewProject={handleNewProject}
          />
        )}
      </main>

      <Footer collapsible />
    </div>
  );
};

export default AppContent;
