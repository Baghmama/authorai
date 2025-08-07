/*
  # Fix RLS policies for user credits system

  1. Security Updates
    - Update RLS policies for `user_credits` table to allow authenticated users to manage their own data
    - Update RLS policies for `credit_transactions` table to allow authenticated users to view and create their own transactions
    - Add missing INSERT and UPDATE policies for proper credit management

  2. Changes
    - Allow authenticated users to INSERT their own credit records
    - Allow authenticated users to UPDATE their own credit records  
    - Allow authenticated users to INSERT their own transaction records
    - Maintain security by ensuring users can only access their own data
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can read own credits" ON user_credits;
DROP POLICY IF EXISTS "Service role can manage all credits" ON user_credits;
DROP POLICY IF EXISTS "Users can read own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Service role can manage all transactions" ON credit_transactions;

-- User Credits Table Policies
CREATE POLICY "Users can read own credits"
  ON user_credits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits"
  ON user_credits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
  ON user_credits
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all credits"
  ON user_credits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Credit Transactions Table Policies
CREATE POLICY "Users can read own transactions"
  ON credit_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON credit_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all transactions"
  ON credit_transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);