import { supabase } from '../lib/supabase';

export interface AdminUser {
  id: string;
  email: string;
  credits: number;
  admin_role: string | null;
  ban_expires_at: string | null;
  is_banned_permanently: boolean;
  ban_reason: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

export interface AdminLog {
  id: string;
  admin_email: string;
  action: string;
  target_user_email: string | null;
  details: any;
  created_at: string;
}

export interface BanUserRequest {
  userId: string;
  reason: string;
  expiresAt?: string;
  isPermanent: boolean;
}

// Check if current user is admin
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_admin');
    if (error) throw error;
    return data || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Check if current user is super admin
export async function checkIsSuperAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_super_admin');
    if (error) throw error;
    return data || false;
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
}

// Get all users with their credits and admin status
export async function getAllUsers(): Promise<AdminUser[]> {
  try {
    const { data, error } = await supabase
      .from('auth.users')
      .select(`
        id,
        email,
        created_at,
        last_sign_in_at,
        user_credits!inner(credits),
        admins(role),
        user_bans(expires_at, is_permanent, reason)
      `);

    if (error) {
      // Fallback query if the above doesn't work
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_all_users_admin');
      
      if (usersError) throw usersError;
      return usersData || [];
    }

    return data?.map((user: any) => ({
      id: user.id,
      email: user.email || 'No email',
      credits: user.user_credits?.credits || 0,
      admin_role: user.admins?.role || null,
      ban_expires_at: user.user_bans?.expires_at || null,
      is_banned_permanently: user.user_bans?.is_permanent || false,
      ban_reason: user.user_bans?.reason || null,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at
    })) || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// Update user credits
export async function updateUserCredits(userId: string, credits: number, description: string = 'Admin credit adjustment'): Promise<void> {
  try {
    const { data, error } = await supabase.rpc('admin_update_credits', {
      p_user_id: userId,
      p_amount: credits,
      p_description: description
    });

    if (error) throw error;
    if (!data?.success) throw new Error('Failed to update credits');
  } catch (error) {
    console.error('Error updating credits:', error);
    throw error;
  }
}

// Ban user
export async function banUser({ userId, reason, expiresAt, isPermanent }: BanUserRequest): Promise<void> {
  try {
    const { data, error } = await supabase.rpc('admin_ban_user', {
      p_user_id: userId,
      p_reason: reason,
      p_expires_at: expiresAt || null,
      p_is_permanent: isPermanent
    });

    if (error) throw error;
    if (!data?.success) throw new Error('Failed to ban user');
  } catch (error) {
    console.error('Error banning user:', error);
    throw error;
  }
}

// Unban user
export async function unbanUser(userId: string): Promise<void> {
  try {
    const { data, error } = await supabase.rpc('admin_unban_user', {
      p_user_id: userId
    });

    if (error) throw error;
    if (!data?.success) throw new Error('Failed to unban user');
  } catch (error) {
    console.error('Error unbanning user:', error);
    throw error;
  }
}

// Add admin
export async function addAdmin(userId: string, role: string = 'admin'): Promise<void> {
  try {
    const { data, error } = await supabase.rpc('admin_add_admin', {
      p_user_id: userId,
      p_role: role
    });

    if (error) throw error;
    if (!data?.success) throw new Error('Failed to add admin');
  } catch (error) {
    console.error('Error adding admin:', error);
    throw error;
  }
}

// Get admin logs
export async function getAdminLogs(limit: number = 50): Promise<AdminLog[]> {
  try {
    const { data, error } = await supabase
      .from('admin_logs')
      .select(`
        id,
        action,
        details,
        created_at,
        admin:admin_id(email),
        target_user:target_user_id(email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data?.map((log: any) => ({
      id: log.id,
      admin_email: log.admin?.email || 'Unknown',
      action: log.action,
      target_user_email: log.target_user?.email || null,
      details: log.details,
      created_at: log.created_at
    })) || [];
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    return [];
  }
}