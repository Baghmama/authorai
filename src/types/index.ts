export type WritingStyle = 'formal' | 'conversational' | 'literary' | 'humorous' | 'academic' | 'descriptive';

export interface BookIdea {
  idea: string;
  language: string;
  chapters: number;
  type: 'Fiction' | 'Non-Fiction' | 'Educative';
  writingStyle: WritingStyle;
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

export type AppStep = 'idea' | 'outlines' | 'writing' | 'book';

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