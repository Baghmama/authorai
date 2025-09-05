/*
  # Create Admin System

  1. New Tables
    - `admins` - Store admin users with roles and permissions
    - `user_bans` - Track banned users with expiry dates
    - `admin_logs` - Audit trail for admin actions

  2. Security
    - Enable RLS on all admin tables
    - Add policies for admin-only access
    - Create admin check functions

  3. Functions
    - Admin verification functions
    - User management functions
    - Credit management functions
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  permissions jsonb DEFAULT '{"can_manage_users": true, "can_manage_credits": true, "can_ban_users": true, "can_add_admins": false}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user bans table
CREATE TABLE IF NOT EXISTS user_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by uuid REFERENCES auth.users(id),
  reason text NOT NULL,
  expires_at timestamptz,
  is_permanent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create admin logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  target_user_id uuid REFERENCES auth.users(id),
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid()
  );
END;
$$;

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  );
END;
$$;

-- Create function to check if user is banned
CREATE OR REPLACE FUNCTION is_user_banned(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_bans 
    WHERE user_id = user_uuid 
    AND (is_permanent = true OR expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all users for admin panel
CREATE OR REPLACE FUNCTION get_all_users_admin()
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

-- Admin policies
CREATE POLICY "Admins can read all admin records"
  ON admins
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Super admins can manage admins"
  ON admins
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- User bans policies
CREATE POLICY "Admins can read all bans"
  ON user_bans
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can manage bans"
  ON user_bans
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin logs policies
CREATE POLICY "Admins can read all logs"
  ON admin_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert logs"
  ON admin_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Insert the initial super admin
INSERT INTO admins (user_id, role, permissions, created_by)
VALUES (
  '043806e4-ce06-410a-9876-356647847f99'::uuid,
  'super_admin',
  '{"can_manage_users": true, "can_manage_credits": true, "can_ban_users": true, "can_add_admins": true}'::jsonb,
  '043806e4-ce06-410a-9876-356647847f99'::uuid
) ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin',
  permissions = '{"can_manage_users": true, "can_manage_credits": true, "can_ban_users": true, "can_add_admins": true}'::jsonb,
  updated_at = now();

-- Create function to update user credits (admin only)
CREATE OR REPLACE FUNCTION admin_update_credits(
  p_user_id uuid,
  p_amount integer,
  p_description text DEFAULT 'Admin credit adjustment'
)
RETURNS json AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_result json;
BEGIN
  -- Check if caller is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Update credits
  UPDATE user_credits 
  SET credits = p_amount, updated_at = now()
  WHERE user_id = p_user_id;

  -- Insert transaction record
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
  VALUES (p_user_id, p_amount, 'admin_adjustment', p_description);

  -- Log admin action
  INSERT INTO admin_logs (admin_id, action, target_user_id, details)
  VALUES (v_admin_id, 'update_credits', p_user_id, json_build_object('new_amount', p_amount, 'description', p_description));

  -- Get updated credits
  SELECT json_build_object('success', true, 'credits', credits)
  INTO v_result
  FROM user_credits
  WHERE user_id = p_user_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to ban user (admin only)
CREATE OR REPLACE FUNCTION admin_ban_user(
  p_user_id uuid,
  p_reason text,
  p_expires_at timestamptz DEFAULT NULL,
  p_is_permanent boolean DEFAULT false
)
RETURNS json AS $$
DECLARE
  v_admin_id uuid := auth.uid();
BEGIN
  -- Check if caller is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Insert ban record
  INSERT INTO user_bans (user_id, banned_by, reason, expires_at, is_permanent)
  VALUES (p_user_id, v_admin_id, p_reason, p_expires_at, p_is_permanent)
  ON CONFLICT (user_id) DO UPDATE SET
    banned_by = v_admin_id,
    reason = p_reason,
    expires_at = p_expires_at,
    is_permanent = p_is_permanent,
    updated_at = now();

  -- Log admin action
  INSERT INTO admin_logs (admin_id, action, target_user_id, details)
  VALUES (v_admin_id, 'ban_user', p_user_id, json_build_object('reason', p_reason, 'expires_at', p_expires_at, 'is_permanent', p_is_permanent));

  RETURN json_build_object('success', true, 'message', 'User banned successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to unban user (admin only)
CREATE OR REPLACE FUNCTION admin_unban_user(p_user_id uuid)
RETURNS json AS $$
DECLARE
  v_admin_id uuid := auth.uid();
BEGIN
  -- Check if caller is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Remove ban record
  DELETE FROM user_bans WHERE user_id = p_user_id;

  -- Log admin action
  INSERT INTO admin_logs (admin_id, action, target_user_id, details)
  VALUES (v_admin_id, 'unban_user', p_user_id, json_build_object('message', 'User unbanned'));

  RETURN json_build_object('success', true, 'message', 'User unbanned successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add admin (super admin only)
CREATE OR REPLACE FUNCTION admin_add_admin(
  p_user_id uuid,
  p_role text DEFAULT 'admin'
)
RETURNS json AS $$
DECLARE
  v_admin_id uuid := auth.uid();
BEGIN
  -- Check if caller is super admin
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Super admin privileges required';
  END IF;

  -- Insert admin record
  INSERT INTO admins (user_id, role, created_by)
  VALUES (p_user_id, p_role, v_admin_id)
  ON CONFLICT (user_id) DO UPDATE SET
    role = p_role,
    updated_at = now();

  -- Log admin action
  INSERT INTO admin_logs (admin_id, action, target_user_id, details)
  VALUES (v_admin_id, 'add_admin', p_user_id, json_build_object('role', p_role));

  RETURN json_build_object('success', true, 'message', 'Admin added successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_users_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_credits(uuid, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_ban_user(uuid, text, timestamptz, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_unban_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_add_admin(uuid, text) TO authenticated;