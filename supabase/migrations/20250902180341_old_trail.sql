/*
  # Add Credits Function

  1. New Functions
    - `add_credits` - Safely add credits to user account with transaction logging
    
  2. Security
    - Function uses security definer to allow service role operations
    - Validates user exists before adding credits
    - Creates transaction record for audit trail
    
  3. Features
    - Atomic operation (credits + transaction in single function)
    - Returns updated credit balance
    - Handles edge cases (user doesn't exist, negative amounts)
*/

-- Function to safely add credits to a user account
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id uuid,
  p_amount integer,
  p_transaction_type text DEFAULT 'purchase',
  p_description text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_credits integer;
  v_new_credits integer;
  v_user_exists boolean;
BEGIN
  -- Validate input
  IF p_amount <= 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Amount must be positive',
      'credits', 0
    );
  END IF;

  -- Check if user exists in auth.users
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE id = p_user_id
  ) INTO v_user_exists;

  IF NOT v_user_exists THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found',
      'credits', 0
    );
  END IF;

  -- Get current credits or create user_credits record if it doesn't exist
  SELECT credits INTO v_current_credits
  FROM user_credits
  WHERE user_id = p_user_id;

  IF v_current_credits IS NULL THEN
    -- Create new user_credits record
    INSERT INTO user_credits (user_id, credits)
    VALUES (p_user_id, p_amount)
    RETURNING credits INTO v_new_credits;
  ELSE
    -- Update existing credits
    UPDATE user_credits
    SET credits = credits + p_amount,
        updated_at = now()
    WHERE user_id = p_user_id
    RETURNING credits INTO v_new_credits;
  END IF;

  -- Record the transaction
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
  VALUES (p_user_id, p_amount, p_transaction_type, p_description);

  -- Return success with new balance
  RETURN json_build_object(
    'success', true,
    'credits', v_new_credits,
    'added', p_amount
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Return error information
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'credits', 0
    );
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION add_credits TO authenticated, service_role;