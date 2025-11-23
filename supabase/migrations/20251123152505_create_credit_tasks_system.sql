-- Create Credit Tasks System
-- 1. New Tables: credit_tasks and credit_task_settings
-- 2. Storage bucket for review screenshots
-- 3. RLS policies and automatic credit awarding

-- Create credit_tasks table
CREATE TABLE IF NOT EXISTS credit_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_type text NOT NULL CHECK (task_type IN ('twitter_share', 'playstore_review')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
  screenshot_url text,
  submission_data jsonb DEFAULT '{}'::jsonb,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  credits_awarded integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, task_type)
);

-- Create credit_task_settings table
CREATE TABLE IF NOT EXISTS credit_task_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type text UNIQUE NOT NULL,
  credits_reward integer NOT NULL DEFAULT 200,
  is_enabled boolean DEFAULT true,
  max_completions_per_user integer DEFAULT 1,
  description text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Insert default task settings
INSERT INTO credit_task_settings (task_type, credits_reward, is_enabled, max_completions_per_user, description)
VALUES 
  ('twitter_share', 200, true, 1, 'Share about Author AI on Twitter/X'),
  ('playstore_review', 200, true, 1, 'Write a review on Google Play Store')
ON CONFLICT (task_type) DO NOTHING;

-- Create storage bucket for review screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-screenshots', 'review-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE credit_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_task_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_tasks

-- Users can view their own tasks
CREATE POLICY "Users can view own tasks"
  ON credit_tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own tasks (first submission)
CREATE POLICY "Users can create own tasks"
  ON credit_tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending/rejected tasks
CREATE POLICY "Users can update own pending tasks"
  ON credit_tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status IN ('pending', 'rejected'))
  WITH CHECK (auth.uid() = user_id AND status IN ('pending', 'submitted'));

-- Admins can view all tasks
CREATE POLICY "Admins can view all tasks"
  ON credit_tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Admins can update any task (for review)
CREATE POLICY "Admins can update tasks"
  ON credit_tasks FOR UPDATE
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

-- Admins can delete tasks
CREATE POLICY "Admins can delete tasks"
  ON credit_tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- RLS Policies for credit_task_settings

-- Everyone can read settings
CREATE POLICY "Everyone can read task settings"
  ON credit_task_settings FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins can update task settings"
  ON credit_task_settings FOR UPDATE
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

-- Storage policies for review-screenshots bucket

-- Users can upload their own review screenshots
CREATE POLICY "Users can upload review screenshots"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'review-screenshots' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own screenshots
CREATE POLICY "Users can view own screenshots"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'review-screenshots' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can view all screenshots
CREATE POLICY "Admins can view all screenshots"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'review-screenshots' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Admins can delete screenshots (when approving tasks)
CREATE POLICY "Admins can delete screenshots"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'review-screenshots' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Function to automatically award credits when task is approved
CREATE OR REPLACE FUNCTION award_credits_on_approval()
RETURNS TRIGGER AS $$
DECLARE
  reward_amount integer;
BEGIN
  -- Only process if status changed to 'approved' and credits not yet awarded
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.credits_awarded = 0 THEN
    -- Get reward amount from settings
    SELECT credits_reward INTO reward_amount
    FROM credit_task_settings
    WHERE task_type = NEW.task_type AND is_enabled = true;
    
    IF reward_amount IS NOT NULL THEN
      -- Award credits
      UPDATE user_credits
      SET 
        credits = credits + reward_amount,
        updated_at = now()
      WHERE user_id = NEW.user_id;
      
      -- Log transaction
      INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
      VALUES (
        NEW.user_id,
        reward_amount,
        'task_reward',
        'Reward for completing task: ' || NEW.task_type
      );
      
      -- Update task with awarded credits
      NEW.credits_awarded = reward_amount;
      NEW.reviewed_at = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic credit awarding
DROP TRIGGER IF EXISTS award_credits_trigger ON credit_tasks;
CREATE TRIGGER award_credits_trigger
  BEFORE UPDATE ON credit_tasks
  FOR EACH ROW
  EXECUTE FUNCTION award_credits_on_approval();