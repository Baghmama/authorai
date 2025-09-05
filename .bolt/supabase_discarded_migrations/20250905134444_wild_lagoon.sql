@@ .. @@
 -- Create function to add admin (super admin only)
 CREATE OR REPLACE FUNCTION admin_add_admin(
   p_user_id uuid,
-  p_role text DEFAULT 'admin',
-  p_
+  p_role text DEFAULT 'admin'
+)
+RETURNS json AS $$
+DECLARE
+  v_admin_id uuid := auth.uid();
+BEGIN
+  -- Check if caller is super admin
+  IF NOT is_super_admin(v_admin_id) THEN
+    RAISE EXCEPTION 'Access denied: Super admin privileges required';
+  END IF;
+
+  -- Insert admin record
+  INSERT INTO admins (user_id, role, created_by)
+  VALUES (p_user_id, p_role, v_admin_id)
+  ON CONFLICT (user_id) DO UPDATE SET
+    role = p_role,
+    created_by = v_admin_id,
+    updated_at = now();
+
+  -- Log admin action
+  INSERT INTO admin_logs (admin_id, action, target_user_id, details)
+  VALUES (v_admin_id, 'add_admin', p_user_id, json_build_object('role', p_role));
+
+  RETURN json_build_object('success', true, 'message', 'Admin added successfully');
+END;
+$$ LANGUAGE plpgsql SECURITY DEFINER;
+
+-- Create function to get all users for admin panel
+CREATE OR REPLACE FUNCTION get_all_users_admin()
+RETURNS TABLE (
+  id uuid,
+  email text,
+  created_at timestamptz,
+  last_sign_in_at timestamptz,
+  credits integer,
+  admin_role text,
+  ban_expires_at timestamptz,
+  is_banned_permanently boolean,
+  ban_reason text
+) AS $$
+BEGIN
+  -- Check if caller is admin
+  IF NOT is_admin() THEN
+    RAISE EXCEPTION 'Access denied: Admin privileges required';
+  END IF;
+
+  RETURN QUERY
+  SELECT 
+    u.id,
+    u.email::text,
+    u.created_at,
+    u.last_sign_in_at,
+    COALESCE(uc.credits, 0) as credits,
+    a.role as admin_role,
+    ub.expires_at as ban_expires_at,
+    COALESCE(ub.is_permanent, false) as is_banned_permanently,
+    ub.reason as ban_reason
+  FROM auth.users u
+  LEFT JOIN user_credits uc ON u.id = uc.user_id
+  LEFT JOIN admins a ON u.id = a.user_id
+  LEFT JOIN user_bans ub ON u.id = ub.user_id
+  ORDER BY u.created_at DESC;
+END;
+$$ LANGUAGE plpgsql SECURITY DEFINER;