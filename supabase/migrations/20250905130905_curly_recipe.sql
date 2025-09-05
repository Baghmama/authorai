/*
  # Add credits function for payment processing

  1. New Functions
    - `add_credits` - Safely adds credits to user account with transaction logging
    
  2. Security
    - Function uses security definer to run with elevated privileges
    - Validates user exists before adding credits
    - Creates transaction record for audit trail
*/

-- Function to safely add credits to user account
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id uuid,
  p_amount integer,
  p_transaction_type text,
  p_description text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_credits integer;
  v_new_credits integer;
  v_result json;
BEGIN
  -- Validate input
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Credit amount must be positive';
  END IF;

  -- Get current credits or create user_credits record if it doesn't exist
  INSERT INTO user_credits (user_id, credits)
  VALUES (p_user_id, 30)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current credits
  SELECT credits INTO v_current_credits
  FROM user_credits
  WHERE user_id = p_user_id;

  IF v_current_credits IS NULL THEN
    RAISE EXCEPTION 'User credits record not found';
  END IF;

  -- Calculate new credits
  v_new_credits := v_current_credits + p_amount;

  -- Update user credits
  UPDATE user_credits
  SET credits = v_new_credits,
      updated_at = now()
  WHERE user_id = p_user_id;

  -- Record the transaction
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
  VALUES (p_user_id, p_amount, p_transaction_type, p_description);

  -- Return result
  v_result := json_build_object(
    'success', true,
    'credits', v_new_credits,
    'added', p_amount
  );

  RETURN v_result;
END;
$$;