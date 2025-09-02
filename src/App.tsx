import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import LegalPages from './components/LegalPages';
import Auth from './components/Auth';
import ProgressIndicator from './components/ProgressIndicator';
import IdeaForm from './components/IdeaForm';
import ChapterOutlines from './components/ChapterOutlines';
import ChapterWriter from './components/ChapterWriter';
import BookCompiler from './components/BookCompiler';
import ConfigurationMessage from './components/ConfigurationMessage';
import { BookIdea, ChapterOutline, AppStep, User } from './types';
import { generateChapterOutlines } from './utils/geminiApi';
import { supabase } from './lib/supabase';
import { deductCreditsForChapterGeneration, getUserCredits } from './utils/creditManager';

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<AppStep>('idea');
  const [bookIdea, setBookIdea] = useState<BookIdea | null>(null);
  const [outlines, setOutlines] = useState<ChapterOutline[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentLegalPage, setCurrentLegalPage] = useState<'contact' | 'refund' | 'about' | null>(null);

  useEffect(() => {
    // If Supabase is not configured, show configuration message
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || ''
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || ''
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleAuthSuccess = () => {
    // User state will be updated by the auth state change listener
  };

  const handleSignOut = () => {
    setUser(null);
    setCurrentStep('idea');
    setBookIdea(null);
    setOutlines([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return <ConfigurationMessage />;
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // Show legal pages
  if (currentLegalPage) {
    return (
      <LegalPages
        currentPage={currentLegalPage}
        onClose={() => setCurrentLegalPage(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userEmail={user.email} onSignOut={handleSignOut} />
      
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
      
      <Footer onPageChange={setCurrentLegalPage} />
    </div>
  );
}

export default App;