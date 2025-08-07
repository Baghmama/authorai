/*
  # User Credits System

  1. New Tables
    - `user_credits`
      - `user_id` (uuid, primary key, references auth.users)
      - `credits` (integer, default 30)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `credit_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_credits)
      - `amount` (integer, can be negative for deductions)
      - `transaction_type` (text, e.g., 'chapter_generation', 'manual_adjustment')
      - `description` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read their own data
    - Add policies for service role to manage credits

  3. Functions
    - Function to initialize user credits on signup
    - Function to deduct credits with validation
    - Trigger to update user_credits.updated_at
*/

-- Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits integer NOT NULL DEFAULT 30 CHECK (credits >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create credit_transactions table for audit trail
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_credits(user_id) ON DELETE CASCADE,
  amount integer NOT NULL,
  transaction_type text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_credits
CREATE POLICY "Users can read own credits"
  ON user_credits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all credits"
  ON user_credits
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for credit_transactions
CREATE POLICY "Users can read own transactions"
  ON credit_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all transactions"
  ON credit_transactions
  FOR ALL
  TO service_role
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize user credits on signup
CREATE OR REPLACE FUNCTION initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, credits)
  VALUES (NEW.id, 30);
  
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
  VALUES (NEW.id, 30, 'initial_credits', 'Initial credits on signup');
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to initialize credits when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_credits();

-- Function to deduct credits with validation
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id uuid,
  p_amount integer,
  p_transaction_type text,
  p_description text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  current_credits integer;
  new_credits integer;
BEGIN
  -- Get current credits with row lock
  SELECT credits INTO current_credits
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Check if user exists
  IF current_credits IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found',
      'credits', 0
    );
  END IF;
  
  -- Check if user has enough credits
  IF current_credits < p_amount THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'credits', current_credits
    );
  END IF;
  
  -- Calculate new credits
  new_credits := current_credits - p_amount;
  
  -- Update user credits
  UPDATE user_credits
  SET credits = new_credits
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
  VALUES (p_user_id, -p_amount, p_transaction_type, p_description);
  
  RETURN json_build_object(
    'success', true,
    'credits', new_credits,
    'deducted', p_amount
  );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to add credits (for manual adjustments)
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id uuid,
  p_amount integer,
  p_description text DEFAULT 'Manual credit adjustment'
)
RETURNS json AS $$
DECLARE
  current_credits integer;
  new_credits integer;
BEGIN
  -- Get current credits with row lock
  SELECT credits INTO current_credits
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Check if user exists
  IF current_credits IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found',
      'credits', 0
    );
  END IF;
  
  -- Calculate new credits
  new_credits := current_credits + p_amount;
  
  -- Update user credits
  UPDATE user_credits
  SET credits = new_credits
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
  VALUES (p_user_id, p_amount, 'manual_adjustment', p_description);
  
  RETURN json_build_object(
    'success', true,
    'credits', new_credits,
    'added', p_amount
  );
END;
$$ language 'plpgsql' SECURITY DEFINER;