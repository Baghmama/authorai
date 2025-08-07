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

export type AppStep = 'idea' | 'outlines' | 'writing' | 'book';

export interface User {
  id: string;
  email: string;
}