import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Users, FolderOpen, Activity, DollarSign, TrendingUp } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    activeUsers: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const profilesSnapshot = await getDocs(collection(db, 'profiles'));
      const projectsSnapshot = await getDocs(collection(db, 'projects'));

      const users = profilesSnapshot.docs.map(doc => doc.data());
      const proUsers = users.filter((u: any) => u.plan === 'pro').length;
      const enterpriseUsers = users.filter((u: any) => u.plan === 'enterprise').length;
      const users = profiles Snapshot = await getDocs(collection(db, 'profiles'));
      const proUsers = users.filter typ

      setStats({
        totalUsers: users.length,
        totalProjects: projectsSnapshot.size,
        activeUsers: users.filter((u: any) => {
          if (!u.createdAt) return false;
          const created = u.createdAt.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
          const daysSinceCreation = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceCreation <= 30;
        }).length,
        revenue: proUsers * 29 + enterpriseUsers * 299
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-cyan-500 to-blue-600',
      change: '+12%'
    },
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderOpen,
      color: 'from-purple-500 to-pink-500',
      change: '+23%'
    },
    {
      label: 'Active Users (30d)',
      value: stats.activeUsers,
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      change: '+8%'
    },
    {
      label: 'Monthly Revenue',
      value: `$${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-orange-500 to-red-500',
      change: '+34%'
    }
  ];

  return (
    <div className="flex-1 overflow-auto gradient-background">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor platform metrics and user activity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <TrendingUp className="w-4 h-4" />
                    {stat.change}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { user: 'user@example.com', action: 'Created new project', time: '2m ago' },
                { user: 'dev@example.com', action: 'Upgraded to Pro', time: '15m ago' },
                { user: 'designer@example.com', action: 'Generated design', time: '1h ago' },
                { user: 'coder@example.com', action: 'Exported code', time: '2h ago' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="font-medium text-gray-900">{activity.user}</div>
                    <div className="text-sm text-gray-600">{activity.action}</div>
                  </div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Plan Distribution</h2>
            <div className="space-y-4">
              {[
                { plan: 'Free', count: stats.totalUsers - Math.floor(stats.totalUsers * 0.3), color: 'bg-gray-500' },
                { plan: 'Pro', count: Math.floor(stats.totalUsers * 0.25), color: 'bg-blue-500' },
                { plan: 'Enterprise', count: Math.floor(stats.totalUsers * 0.05), color: 'bg-purple-500' }
              ].map((item) => (
                <div key={item.plan}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{item.plan}</span>
                    <span className="text-sm text-gray-600">{item.count} users</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all`}
                      style={{ width: `${(item.count / stats.totalUsers) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
