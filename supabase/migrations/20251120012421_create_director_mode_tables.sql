/*
  # Director Mode Database Schema

  ## Overview
  This migration creates the database schema for Director Mode, an AI-powered vibe writing feature
  that allows users to write books through conversational prompts with full editing control.

  ## New Tables

  ### `director_projects`
  Main project container for director mode sessions
  - `id` (uuid, primary key) - Unique project identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `title` (text) - Project title
  - `created_at` (timestamptz) - Project creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `director_chapters`
  Individual chapters within a director project
  - `id` (uuid, primary key) - Unique chapter identifier
  - `project_id` (uuid, foreign key) - References director_projects
  - `chapter_number` (integer) - Sequential chapter number
  - `title` (text) - Chapter title
  - `content` (text) - Rich text content of the chapter
  - `created_at` (timestamptz) - Chapter creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `director_conversations`
  Chat message history for each chapter
  - `id` (uuid, primary key) - Unique conversation record identifier
  - `chapter_id` (uuid, foreign key) - References director_chapters
  - `messages` (jsonb) - Array of chat messages with role, content, and timestamp
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own projects and related data
  - Policies enforce user ownership through the entire hierarchy

  ## Indexes
  - Efficient querying by user_id and project_id
  - Chapter ordering by chapter_number
*/

-- Create director_projects table
CREATE TABLE IF NOT EXISTS director_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled Project',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create director_chapters table
CREATE TABLE IF NOT EXISTS director_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES director_projects(id) ON DELETE CASCADE,
  chapter_number integer NOT NULL DEFAULT 1,
  title text NOT NULL DEFAULT 'Untitled Chapter',
  content text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, chapter_number)
);

-- Create director_conversations table
CREATE TABLE IF NOT EXISTS director_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES director_chapters(id) ON DELETE CASCADE,
  messages jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_director_projects_user_id ON director_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_director_chapters_project_id ON director_chapters(project_id);
CREATE INDEX IF NOT EXISTS idx_director_chapters_number ON director_chapters(project_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_director_conversations_chapter_id ON director_conversations(chapter_id);

-- Enable Row Level Security
ALTER TABLE director_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE director_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE director_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for director_projects
CREATE POLICY "Users can view own projects"
  ON director_projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON director_projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON director_projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON director_projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for director_chapters
CREATE POLICY "Users can view own chapters"
  ON director_chapters FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM director_projects
      WHERE director_projects.id = director_chapters.project_id
      AND director_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chapters in own projects"
  ON director_chapters FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM director_projects
      WHERE director_projects.id = director_chapters.project_id
      AND director_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own chapters"
  ON director_chapters FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM director_projects
      WHERE director_projects.id = director_chapters.project_id
      AND director_projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM director_projects
      WHERE director_projects.id = director_chapters.project_id
      AND director_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own chapters"
  ON director_chapters FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM director_projects
      WHERE director_projects.id = director_chapters.project_id
      AND director_projects.user_id = auth.uid()
    )
  );

-- RLS Policies for director_conversations
CREATE POLICY "Users can view own conversations"
  ON director_conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM director_chapters
      JOIN director_projects ON director_projects.id = director_chapters.project_id
      WHERE director_chapters.id = director_conversations.chapter_id
      AND director_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations in own chapters"
  ON director_conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM director_chapters
      JOIN director_projects ON director_projects.id = director_chapters.project_id
      WHERE director_chapters.id = director_conversations.chapter_id
      AND director_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own conversations"
  ON director_conversations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM director_chapters
      JOIN director_projects ON director_projects.id = director_chapters.project_id
      WHERE director_chapters.id = director_conversations.chapter_id
      AND director_projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM director_chapters
      JOIN director_projects ON director_projects.id = director_chapters.project_id
      WHERE director_chapters.id = director_conversations.chapter_id
      AND director_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own conversations"
  ON director_conversations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM director_chapters
      JOIN director_projects ON director_projects.id = director_chapters.project_id
      WHERE director_chapters.id = director_conversations.chapter_id
      AND director_projects.user_id = auth.uid()
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_director_projects_updated_at
  BEFORE UPDATE ON director_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_director_chapters_updated_at
  BEFORE UPDATE ON director_chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_director_conversations_updated_at
  BEFORE UPDATE ON director_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();