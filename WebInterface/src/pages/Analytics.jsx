import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, Users, Zap, Clock, HardDrive, AlertCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';

export default function Analytics() {
  const [dateRange, setDateRange] = useState(7);

  const { data: analytics = [] } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => base44.entities.UsageAnalytics.list('-created_date', 1000),
  });

  const { data: systemHealth = [] } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => base44.entities.SystemHealth.list('-created_date', 50),
  });

  const { data: audioFiles = [] } = useQuery({
    queryKey: ['audio-files'],
    queryFn: () => base44.entities.AudioFile.list('-created_date', 500),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      if (currentUser?.role === 'admin') {
        return base44.entities.User.list();
      }
      return [];
    },
  });

  // Calculate stats
  const totalActions = analytics.length;
  const successRate = totalActions > 0 ? (analytics.filter(a => a.success).length / totalActions * 100) : 0;
  const avgProcessingTime = totalActions > 0 ? (analytics.reduce((sum, a) => sum + (a.processing_time_seconds || 0), 0) / analytics.length) : 0;
  const totalStorage = audioFiles.reduce((sum, f) => sum + (f.file_size_mb || 0), 0);

  // Actions by type
  const actionsByType = analytics.reduce((acc, a) => {
    acc[a.action_type] = (acc[a.action_type] || 0) + 1;
    return acc;
  }, {});

  const actionTypeData = Object.keys(actionsByType).map(key => ({
    name: key.replace(/_/g, ' '),
    value: actionsByType[key]
  }));

  // Actions over time
  const actionsOverTime = [];
  for (let i = dateRange - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'MM/dd');
    const count = analytics.filter(a => 
      format(new Date(a.created_date), 'MM/dd') === dateStr
    ).length;
    actionsOverTime.push({ date: dateStr, count });
  }

  // Latest health metrics
  const latestHealth = systemHealth.reduce((acc, metric) => {
    if (!acc[metric.metric_name] || new Date(metric.created_date) > new Date(acc[metric.metric_name].created_date)) {
      acc[metric.metric_name] = metric;
    }
    return acc;
  }, {});

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Usage Analytics</h1>
        <p className="text-slate-400">Monitor system performance and user activity</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium">Total Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-white">{totalActions}</div>
              <Activity className="w-8 h-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-white">{successRate.toFixed(1)}%</div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium">Avg Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-white">{avgProcessingTime.toFixed(1)}s</div>
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-white">{totalStorage.toFixed(1)} GB</div>
              <HardDrive className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.values(latestHealth).map((metric) => (
              <div key={metric.id} className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">{metric.metric_name.replace(/_/g, ' ')}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    metric.status === 'healthy' ? 'bg-green-500' :
                    metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                </div>
                <div className="text-2xl font-bold text-white">{metric.value}</div>
                {metric.details && (
                  <p className="text-xs text-slate-500 mt-1">{metric.details}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Activity Over Time */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Activity Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={actionsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Actions by Type */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Actions by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={actionTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {actionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.slice(0, 10).map((action) => (
              <div key={action.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {action.success ? (
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <div>
                    <div className="text-white font-medium">{action.action_type.replace(/_/g, ' ')}</div>
                    <div className="text-sm text-slate-400">{action.user_email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">
                    {format(new Date(action.created_date), 'MMM d, h:mm a')}
                  </div>
                  {action.processing_time_seconds && (
                    <div className="text-xs text-slate-500">{action.processing_time_seconds.toFixed(1)}s</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}