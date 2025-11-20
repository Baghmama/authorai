export interface BookIdea {
  idea: string;
  language: string;
  chapters: number;
  type: 'Fiction' | 'Non-Fiction' | 'Educative';
}

export interface ChapterOutline {
  id: string;
  title: string;
  outline: string;
  content?: string;
  isWritten: boolean;
}

export interface BookProject {
  idea: BookIdea;
  outlines: ChapterOutline[];
  isComplete: boolean;
}

export type AppStep = 'idea' | 'outlines' | 'writing' | 'book' | 'director';

export interface User {
  id: string;
  email: string;
}

export interface PaymentPackage {
  id: string;
  name: string;
  credits: number;
  price: {
    usd: number;
    inr: number;
  };
  popular?: boolean;
}

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface DirectorChapter {
  id: string;
  project_id: string;
  chapter_number: number;
  title: string;
  content: string;
  conversation_history: ChatMessage[];
  created_at: Date;
  updated_at: Date;
}

export interface DirectorProject {
  id: string;
  user_id: string;
  title: string;
  chapters: DirectorChapter[];
  created_at: Date;
  updated_at: Date;
}