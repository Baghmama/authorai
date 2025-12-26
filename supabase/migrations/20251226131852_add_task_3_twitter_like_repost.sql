/*
  # Task 3 - Like & Repost Tweet Implementation

  ## Overview
  Adds Task 3 (Like & Repost Tweet) with admin configuration capabilities.

  ## Changes

  ### 1. Update credit_tasks table
  - Add 'twitter_like_repost' to allowed task types

  ### 2. New task configuration
  - Add twitter_like_repost to credit_task_settings (150 credits)

  ### 3. New Tables
  
  #### task_3_config
  Stores the configurable tweet URL for Task 3
  - `id` (integer, primary key) - Singleton (always 1)
  - `tweet_url` (text) - The tweet URL to like/repost
  - `updated_at` (timestamptz) - Last update timestamp
  - `updated_by` (uuid) - Admin who updated it

  #### credit_task_resets
  Audit trail for Task 3 resets
  - `id` (uuid, primary key)
  - `reset_date` (timestamptz) - When reset occurred
  - `reset_by` (uuid) - Admin who performed reset
  - `reason` (text) - Why reset was performed
  - `old_tweet_url` (text) - Previous tweet URL
  - `submissions_cleared` (integer) - Count of cleared submissions

  ## Security (RLS)
  - All users can read task_3_config
  - Only admins can update task_3_config
  - All users can read credit_task_resets
  - Only admins can insert credit_task_resets
*/

-- Drop existing CHECK constraint on credit_tasks.task_type
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'credit_tasks_task_type_check'
  ) THEN
    ALTER TABLE credit_tasks DROP CONSTRAINT credit_tasks_task_type_check;
  END IF;
END $$;

-- Add new CHECK constraint with twitter_like_repost included
ALTER TABLE credit_tasks 
ADD CONSTRAINT credit_tasks_task_type_check 
CHECK (task_type = ANY (ARRAY['twitter_share'::text, 'playstore_review'::text, 'twitter_like_repost'::text]));

-- Insert task settings for twitter_like_repost
INSERT INTO credit_task_settings (task_type, credits_reward, description, is_enabled, max_completions_per_user)
VALUES (
  'twitter_like_repost',
  150,
  'Like and repost our tweet, then upload proof',
  true,
  1
)
ON CONFLICT (task_type) DO NOTHING;

-- Create task_3_config table (singleton pattern)
CREATE TABLE IF NOT EXISTS task_3_config (
  id integer PRIMARY KEY DEFAULT 1,
  tweet_url text NOT NULL DEFAULT 'https://twitter.com/example/status/123456789',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  CONSTRAINT task_3_config_singleton CHECK (id = 1)
);

-- Insert default config
INSERT INTO task_3_config (id, tweet_url)
VALUES (1, 'https://twitter.com/example/status/123456789')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on task_3_config
ALTER TABLE task_3_config ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read the config
CREATE POLICY "Anyone can read task 3 config"
  ON task_3_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can update the config
CREATE POLICY "Only admins can update task 3 config"
  ON task_3_config
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Create credit_task_resets table for audit trail
CREATE TABLE IF NOT EXISTS credit_task_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reset_date timestamptz DEFAULT now(),
  reset_by uuid REFERENCES auth.users(id) NOT NULL,
  reason text NOT NULL,
  old_tweet_url text,
  submissions_cleared integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on credit_task_resets
ALTER TABLE credit_task_resets ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read reset history
CREATE POLICY "Anyone can read reset history"
  ON credit_task_resets
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert reset records
CREATE POLICY "Only admins can log resets"
  ON credit_task_resets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );