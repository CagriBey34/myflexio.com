import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, FileText, MessageSquare, TrendingUp, Clock, Calendar } from 'lucide-react';
import { getDashboardStats } from '../../services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getUserCount = (role) => {
    const user = stats?.users?.find(u => u.role === role);
    return user?.count || 0;
  };

  const getActiveCount = (role) => {
    const user = stats?.users?.find(u => u.role === role);
    return user?.active_count || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Sistem istatistikleri ve yönetim</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {getUserCount('hasta') + getUserCount('uzman')}
          </h3>
          <p className="text-gray-600 text-sm">Toplam Kullanıcı</p>
          <div className="mt-2 text-xs text-gray-500">
            {getUserCount('hasta')} hasta, {getUserCount('uzman')} uzman
          </div>
        </motion.div>

      <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-lg p-6"
>
    <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-amber-100 rounded-lg">
            <Calendar className="text-amber-600" size={24} />
        </div>
    </div>
    <h3 className="text-2xl font-bold text-gray-900">
        {stats?.randevuStats?.beklemede || 0}
    </h3>
    <p className="text-gray-600 text-sm">Bekleyen Randevu</p>
</motion.div>

        {/* Pending Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {stats?.pendingApplications || 0}
          </h3>
          <p className="text-gray-600 text-sm">Bekleyen Başvuru</p>
        </motion.div>

        {/* Active Uzmanlar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="text-green-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {getActiveCount('uzman')}
          </h3>
          <p className="text-gray-600 text-sm">Aktif Uzman</p>
        </motion.div>

        {/* Total Articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="text-purple-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {stats?.totalArticles || 0}
          </h3>
          <p className="text-gray-600 text-sm">Yayınlanan Makale</p>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* System Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sistem İstatistikleri</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Toplam Değerlendirme</span>
              <span className="font-bold text-gray-900">{stats?.totalAssessments || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Toplam Yorum</span>
              <span className="font-bold text-gray-900">{stats?.totalReviews || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Aktif Hastalar</span>
              <span className="font-bold text-gray-900">{getActiveCount('hasta')}</span>
            </div>
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Son Aktiviteler</h2>
          <div className="space-y-3">
            {stats?.recentActivities?.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    {activity.email} - {activity.role}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
