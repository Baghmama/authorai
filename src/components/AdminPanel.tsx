import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  CreditCard,
  Ban,
  UserCheck,
  Search,
  Edit3,
  Save,
  X,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserPlus,
  Activity,
  Gift,
  Image,
  ExternalLink
} from 'lucide-react';
import { 
  AdminUser, 
  AdminLog,
  getAllUsers, 
  updateUserCredits, 
  banUser, 
  unbanUser, 
  addAdmin, 
  getAdminLogs,
  checkIsSuperAdmin
} from '../utils/adminApi';
import { supabase } from '../lib/supabase';

interface CreditTask {
  id: string;
  user_id: string;
  task_type: string;
  status: string;
  screenshot_url: string | null;
  submission_data: any;
  reviewed_by: string | null;
  reviewed_at: string | null;
  credits_awarded: number;
  created_at: string;
  user_email?: string;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [creditTasks, setCreditTasks] = useState<CreditTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCredits, setEditingCredits] = useState<string | null>(null);
  const [newCredits, setNewCredits] = useState<number>(0);
  const [showBanModal, setShowBanModal] = useState<string | null>(null);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'tasks'>('users');
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);

  // Ban modal state
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState<'temporary' | 'permanent'>('temporary');
  const [banExpiryDate, setBanExpiryDate] = useState('');

  // Add admin modal state
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'moderator'>('admin');

  useEffect(() => {
    loadData();
    checkSuperAdminStatus();
  }, []);

  const checkSuperAdminStatus = async () => {
    const superAdmin = await checkIsSuperAdmin();
    setIsSuperAdmin(superAdmin);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, logsData] = await Promise.all([
        getAllUsers(),
        getAdminLogs(100)
      ]);
      setUsers(usersData);
      setLogs(logsData);
      await loadCreditTasks();
    } catch (error) {
      console.error('Error loading admin data:', error);
      alert('Failed to load admin data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadCreditTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_tasks')
        .select(`
          *,
          user_email:user_id(email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const tasksWithEmail = data.map((task: any) => ({
        ...task,
        user_email: task.user_email?.email || 'Unknown'
      }));

      setCreditTasks(tasksWithEmail);
    } catch (error) {
      console.error('Error loading credit tasks:', error);
    }
  };

  const handleApproveTask = async (taskId: string, userId: string, screenshotUrl: string | null) => {
    try {
      const { error } = await supabase
        .from('credit_tasks')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      if (screenshotUrl) {
        await supabase.storage
          .from('review-screenshots')
          .remove([screenshotUrl]);
      }

      alert('Task approved! Credits awarded automatically.');
      await loadCreditTasks();
    } catch (error: any) {
      console.error('Error approving task:', error);
      alert('Failed to approve task: ' + error.message);
    }
  };

  const handleRejectTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('credit_tasks')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      alert('Task rejected.');
      await loadCreditTasks();
    } catch (error: any) {
      console.error('Error rejecting task:', error);
      alert('Failed to reject task: ' + error.message);
    }
  };

  const viewScreenshot = async (screenshotUrl: string) => {
    try {
      const { data } = supabase.storage
        .from('review-screenshots')
        .getPublicUrl(screenshotUrl);

      setViewingScreenshot(data.publicUrl);
    } catch (error) {
      console.error('Error loading screenshot:', error);
      alert('Failed to load screenshot');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateCredits = async (userId: string) => {
    try {
      await updateUserCredits(userId, newCredits, 'Admin panel credit update');
      setEditingCredits(null);
      await loadData();
      alert('Credits updated successfully!');
    } catch (error) {
      alert('Failed to update credits. Please try again.');
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!banReason.trim()) {
      alert('Please provide a reason for the ban.');
      return;
    }

    try {
      await banUser({
        userId,
        reason: banReason,
        expiresAt: banDuration === 'temporary' ? banExpiryDate : undefined,
        isPermanent: banDuration === 'permanent'
      });
      setShowBanModal(null);
      setBanReason('');
      setBanExpiryDate('');
      await loadData();
      alert('User banned successfully!');
    } catch (error) {
      alert('Failed to ban user. Please try again.');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUser(userId);
      await loadData();
      alert('User unbanned successfully!');
    } catch (error) {
      alert('Failed to unban user. Please try again.');
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      alert('Please provide an email address.');
      return;
    }

    const user = users.find(u => u.email.toLowerCase() === newAdminEmail.toLowerCase());
    if (!user) {
      alert('User not found with that email address.');
      return;
    }

    try {
      await addAdmin(user.id, newAdminRole);
      setShowAddAdminModal(false);
      setNewAdminEmail('');
      await loadData();
      alert('Admin added successfully!');
    } catch (error) {
      alert('Failed to add admin. Please try again.');
    }
  };

  const isUserBanned = (user: AdminUser) => {
    if (user.is_banned_permanently) return true;
    if (user.ban_expires_at && new Date(user.ban_expires_at) > new Date()) return true;
    return false;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-gray-600">Manage users, credits, and system settings</p>
              </div>
            </div>
            
            {isSuperAdmin && (
              <button
                onClick={() => setShowAddAdminModal(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2"
              >
                <UserPlus className="h-5 w-5" />
                <span>Add Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Users ({users.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Gift className="h-5 w-5" />
                <span>Credit Tasks ({creditTasks.filter(t => t.status === 'submitted').length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Activity Logs ({logs.length})</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by email or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Credits
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.email}</div>
                            <div className="text-sm text-gray-500">ID: {user.id.substring(0, 8)}...</div>
                            <div className="text-xs text-gray-400">
                              Joined: {formatDate(user.created_at)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingCredits === user.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={newCredits}
                                onChange={(e) => setNewCredits(parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                min="0"
                              />
                              <button
                                onClick={() => handleUpdateCredits(user.id)}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setEditingCredits(null)}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">{user.credits}</span>
                              <button
                                onClick={() => {
                                  setEditingCredits(user.id);
                                  setNewCredits(user.credits);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.admin_role ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {user.admin_role}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">User</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isUserBanned(user) ? (
                            <div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <Ban className="h-3 w-3 mr-1" />
                                Banned
                              </span>
                              {user.ban_reason && (
                                <div className="text-xs text-gray-500 mt-1">{user.ban_reason}</div>
                              )}
                              {user.ban_expires_at && !user.is_banned_permanently && (
                                <div className="text-xs text-gray-500">
                                  Until: {formatDate(user.ban_expires_at)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {isUserBanned(user) ? (
                              <button
                                onClick={() => handleUnbanUser(user.id)}
                                className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                              >
                                <UserCheck className="h-4 w-4" />
                                <span>Unban</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setShowBanModal(user.id)}
                                className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                              >
                                <Ban className="h-4 w-4" />
                                <span>Ban</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Credit Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {creditTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{task.user_email}</div>
                        <div className="text-xs text-gray-500">{task.user_id.substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {task.task_type === 'twitter_share' ? (
                            <>
                              <ExternalLink className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">Twitter Share</span>
                            </>
                          ) : (
                            <>
                              <Image className="h-4 w-4 text-green-500" />
                              <span className="text-sm">Play Store Review</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'submitted'
                            ? 'bg-yellow-100 text-yellow-800'
                            : task.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                        {task.status === 'approved' && (
                          <div className="text-xs text-gray-500 mt-1">
                            +{task.credits_awarded} credits
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(task.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {task.status === 'submitted' && (
                            <>
                              {task.screenshot_url && (
                                <button
                                  onClick={() => viewScreenshot(task.screenshot_url!)}
                                  className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                >
                                  <Image className="h-4 w-4" />
                                  View
                                </button>
                              )}
                              <button
                                onClick={() => handleApproveTask(task.id, task.user_id, task.screenshot_url)}
                                className="text-green-600 hover:text-green-900 flex items-center gap-1"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectTask(task.id)}
                                className="text-red-600 hover:text-red-900 flex items-center gap-1"
                              >
                                <X className="h-4 w-4" />
                                Reject
                              </button>
                            </>
                          )}
                          {task.status === 'approved' && (
                            <span className="text-gray-400 text-xs">
                              Reviewed {task.reviewed_at && formatDate(task.reviewed_at)}
                            </span>
                          )}
                          {task.status === 'rejected' && (
                            <span className="text-gray-400 text-xs">Rejected</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {creditTasks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No credit tasks found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.admin_email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {log.action.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.target_user_email || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {JSON.stringify(log.details, null, 2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Ban User Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ban User</h3>
              <button
                onClick={() => setShowBanModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for ban
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter reason for banning this user..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ban Duration
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="temporary"
                      checked={banDuration === 'temporary'}
                      onChange={(e) => setBanDuration(e.target.value as 'temporary')}
                      className="mr-2"
                    />
                    Temporary
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="permanent"
                      checked={banDuration === 'permanent'}
                      onChange={(e) => setBanDuration(e.target.value as 'permanent')}
                      className="mr-2"
                    />
                    Permanent
                  </label>
                </div>
              </div>
              
              {banDuration === 'temporary' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ban Expiry Date
                  </label>
                  <input
                    type="datetime-local"
                    value={banExpiryDate}
                    onChange={(e) => setBanExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => handleBanUser(showBanModal)}
                className="flex-1 bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
              >
                Ban User
              </button>
              <button
                onClick={() => setShowBanModal(null)}
                className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Admin</h3>
              <button
                onClick={() => setShowAddAdminModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Email
                </label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter user email..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Role
                </label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as 'admin' | 'moderator')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleAddAdmin}
                className="flex-1 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
              >
                Add Admin
              </button>
              <button
                onClick={() => setShowAddAdminModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Viewer Modal */}
      {viewingScreenshot && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Review Screenshot</h3>
              <button
                onClick={() => setViewingScreenshot(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              <img
                src={viewingScreenshot}
                alt="Review screenshot"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;