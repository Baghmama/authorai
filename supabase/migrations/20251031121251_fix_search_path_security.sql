/*
  # Fix Search Path Security for SECURITY DEFINER Functions
  
  1. Security Issue
    - Functions with SECURITY DEFINER but mutable search_path are vulnerable to search path attacks
    - An attacker could create malicious objects in schemas that appear earlier in the search path
    - Functions could execute attacker's code instead of the legitimate functions they depend on
  
  2. Solution
    - Add explicit `SET search_path = public, pg_temp` to all SECURITY DEFINER functions
    - This ensures functions always use the correct schema and prevents search path manipulation attacks
    - Functions affected: add_credits, deduct_credits, is_user_banned, is_admin, is_super_admin,
      get_all_users_admin, admin_update_credits, admin_ban_user, admin_unban_user, admin_add_admin,
      initialize_user_credits, update_updated_at_column
  
  3. Changes Made
    - All SECURITY DEFINER functions now have explicit search_path protection
    - Full schema qualification used for all database objects within functions
    - Maintains all existing functionality while improving security
*/

-- Fix add_credits function
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id uuid,
  p_amount integer,
  p_transaction_type text,
  p_description text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (p_user_id, 30)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current credits
  SELECT credits INTO v_current_credits
  FROM public.user_credits
  WHERE user_id = p_user_id;

  IF v_current_credits IS NULL THEN
    RAISE EXCEPTION 'User credits record not found';
  END IF;

  -- Calculate new credits
  v_new_credits := v_current_credits + p_amount;

  -- Update user credits
  UPDATE public.user_credits
  SET credits = v_new_credits,
      updated_at = now()
  WHERE user_id = p_user_id;

  -- Record the transaction
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
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

-- Fix deduct_credits function
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id uuid,
  p_amount integer,
  p_transaction_type text,
  p_description text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_credits integer;
  new_credits integer;
BEGIN
  -- Get current credits with row lock
  SELECT credits INTO current_credits
  FROM public.user_credits
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
  UPDATE public.user_credits
  SET credits = new_credits
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  VALUES (p_user_id, -p_amount, p_transaction_type, p_description);
  
  RETURN json_build_object(
    'success', true,
    'credits', new_credits,
    'deducted', p_amount
  );
END;
$$;

-- Fix is_user_banned function
CREATE OR REPLACE FUNCTION public.is_user_banned(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_bans 
    WHERE user_id = user_uuid 
    AND (is_permanent = true OR expires_at > now())
  );
END;
$$;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid()
  );
END;
$$;

-- Fix is_super_admin function
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  );
END;
$$;

-- Fix get_all_users_admin function
CREATE OR REPLACE FUNCTION public.get_all_users_admin()
RETURNS TABLE (
  id uuid,
  email text,
  credits integer,
  admin_role text,
  ban_expires_at timestamptz,
  is_banned_permanently boolean,
  ban_reason text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email::text,
    COALESCE(uc.credits, 0) as credits,
    a.role as admin_role,
    ub.expires_at as ban_expires_at,
    COALESCE(ub.is_permanent, false) as is_banned_permanently,
    ub.reason as ban_reason,
    u.created_at,
    u.last_sign_in_at
  FROM auth.users u
  LEFT JOIN public.user_credits uc ON u.id = uc.user_id
  LEFT JOIN public.admins a ON u.id = a.user_id
  LEFT JOIN public.user_bans ub ON u.id = ub.user_id
  ORDER BY u.created_at DESC;
END;
$$;

-- Fix admin_update_credits function
CREATE OR REPLACE FUNCTION public.admin_update_credits(
  p_user_id uuid,
  p_amount integer,
  p_description text DEFAULT 'Admin credit adjustment'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_result json;
BEGIN
  -- Check if caller is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Update credits
  UPDATE public.user_credits 
  SET credits = p_amount, updated_at = now()
  WHERE user_id = p_user_id;

  -- Insert transaction record
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  VALUES (p_user_id, p_amount, 'admin_adjustment', p_description);

  -- Log admin action
  INSERT INTO public.admin_logs (admin_id, action, target_user_id, details)
  VALUES (v_admin_id, 'update_credits', p_user_id, json_build_object('new_amount', p_amount, 'description', p_description));

  -- Get updated credits
  SELECT json_build_object('success', true, 'credits', credits)
  INTO v_result
  FROM public.user_credits
  WHERE user_id = p_user_id;

  RETURN v_result;
END;
$$;

-- Fix admin_ban_user function
CREATE OR REPLACE FUNCTION public.admin_ban_user(
  p_user_id uuid,
  p_reason text,
  p_expires_at timestamptz DEFAULT NULL,
  p_is_permanent boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
BEGIN
  -- Check if caller is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Insert ban record
  INSERT INTO public.user_bans (user_id, banned_by, reason, expires_at, is_permanent)
  VALUES (p_user_id, v_admin_id, p_reason, p_expires_at, p_is_permanent)
  ON CONFLICT (user_id) DO UPDATE SET
    banned_by = v_admin_id,
    reason = p_reason,
    expires_at = p_expires_at,
    is_permanent = p_is_permanent,
    updated_at = now();

  -- Log admin action
  INSERT INTO public.admin_logs (admin_id, action, target_user_id, details)
  VALUES (v_admin_id, 'ban_user', p_user_id, json_build_object('reason', p_reason, 'expires_at', p_expires_at, 'is_permanent', p_is_permanent));

  RETURN json_build_object('success', true, 'message', 'User banned successfully');
END;
$$;

-- Fix admin_unban_user function
CREATE OR REPLACE FUNCTION public.admin_unban_user(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
BEGIN
  -- Check if caller is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Remove ban record
  DELETE FROM public.user_bans WHERE user_id = p_user_id;

  -- Log admin action
  INSERT INTO public.admin_logs (admin_id, action, target_user_id, details)
  VALUES (v_admin_id, 'unban_user', p_user_id, json_build_object('message', 'User unbanned'));

  RETURN json_build_object('success', true, 'message', 'User unbanned successfully');
END;
$$;

-- Fix admin_add_admin function
CREATE OR REPLACE FUNCTION public.admin_add_admin(
  p_user_id uuid,
  p_role text DEFAULT 'admin'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
BEGIN
  -- Check if caller is super admin
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Super admin privileges required';
  END IF;

  -- Insert admin record
  INSERT INTO public.admins (user_id, role, created_by)
  VALUES (p_user_id, p_role, v_admin_id)
  ON CONFLICT (user_id) DO UPDATE SET
    role = p_role,
    updated_at = now();

  -- Log admin action
  INSERT INTO public.admin_logs (admin_id, action, target_user_id, details)
  VALUES (v_admin_id, 'add_admin', p_user_id, json_build_object('role', p_role));

  RETURN json_build_object('success', true, 'message', 'Admin added successfully');
END;
$$;

-- Fix initialize_user_credits function (add full schema qualification)
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert initial credits for the new user
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 30);
  
  -- Record the initial credit allocation in transactions
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  VALUES (NEW.id, 30, 'initial_allocation', 'Initial credit allocation for new user');
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error initializing credits for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;