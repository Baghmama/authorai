import React, { useState } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import ProgressIndicator from './ProgressIndicator';
import IdeaForm from './IdeaForm';
import ChapterOutlines from './ChapterOutlines';
import ChapterWriter from './ChapterWriter';
import BookCompiler from './BookCompiler';
import { BookIdea, ChapterOutline, AppStep, User } from '../types';
import { generateChapterOutlines } from '../utils/geminiApi';
import { deductCreditsForChapterGeneration } from '../utils/creditManager';

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
      // Check and deduct credits first
      const creditResult = await deductCreditsForChapterGeneration(idea.chapters);
      
      if (!creditResult.success) {
        alert(creditResult.error || 'Failed to deduct credits');
        setIsGenerating(false);
        return;
      }
      
      const outlinesText = await generateChapterOutlines(
        idea.idea,
        idea.language,
        idea.chapters,
        idea.type
      );
      
      const parsedOutlines = parseChapterOutlines(outlinesText);
      setOutlines(parsedOutlines);
      setCurrentStep('outlines');
    } catch (error) {
      // If outline generation fails after credits were deducted,
      // we should ideally refund the credits, but for now just show error
      alert('Failed to generate chapter outlines. Please contact support if credits were deducted.');
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
    <div className="min-h-screen bg-gray-50">
      <Navigation userEmail={user.email} />
      
      <main className="py-8 px-4 sm:px-6 lg:px-8">
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
      
      <Footer />
    </div>
  );
};

export default AppContent;