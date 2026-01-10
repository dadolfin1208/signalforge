import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Calendar, Clock, TrendingUp, Zap, Download, Apple, Monitor, Laptop } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({ 
        user_email: user.email,
        status: 'active'
      });
      return subs[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-last_opened', 5),
  });

  const getDaysRemaining = () => {
    if (!subscription?.end_date) return null;
    return differenceInDays(new Date(subscription.end_date), new Date());
  };

  const getSubscriptionBadge = () => {
    if (!subscription) return { text: 'No Active Subscription', color: 'bg-slate-700' };
    if (subscription.subscription_type === 'trial') return { text: 'Free Trial', color: 'bg-blue-600' };
    if (subscription.subscription_type === 'yearly') return { text: 'Yearly Plan', color: 'bg-indigo-600' };
    if (subscription.subscription_type === 'multi_year') return { text: 'Multi-Year Plan', color: 'bg-purple-600' };
    if (subscription.subscription_type === 'charity') return { text: 'Charity License', color: 'bg-green-600' };
    return { text: 'Custom Plan', color: 'bg-indigo-600' };
  };

  const daysRemaining = getDaysRemaining();
  const badge = getSubscriptionBadge();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.full_name || 'Creator'}!</h1>
            <p className="text-indigo-100">Ready to create something amazing?</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className={`${badge.color} px-4 py-2 rounded-lg font-semibold text-center`}>
              {badge.text}
            </div>
            {daysRemaining !== null && (
              <div className="text-sm text-indigo-100 text-center">
                {daysRemaining} days remaining
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-white">{projects.length}</div>
              <Music className="w-8 h-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium">Active Since</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-white">
                {subscription?.start_date ? format(new Date(subscription.start_date), 'MMM yyyy') : 'N/A'}
              </div>
              <Calendar className="w-8 h-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium">Studio Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-white">24h</div>
              <Clock className="w-8 h-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium">AI Features Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-white">12</div>
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl text-white">Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">No projects yet</p>
              <p className="text-sm text-slate-500">Create your first project in the DAW</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{project.name}</h3>
                      <p className="text-sm text-slate-400">
                        {project.tracks_count} tracks • {project.sample_rate}Hz • {project.bit_depth}-bit
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    {project.last_opened ? format(new Date(project.last_opened), 'MMM d, yyyy') : 'Never opened'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Download DAW Section */}
      <Card className="bg-gradient-to-r from-slate-800 to-indigo-900 border-indigo-700">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Download Signal Forge DAW</h3>
              <p className="text-slate-300 mb-4">
                Get the native desktop application for Mac, Linux, or Windows
              </p>
              <p className="text-sm text-slate-400">
                Designed by Barry and Judah • Signal Forge by Genius Ideas
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button 
                onClick={() => window.location.href = createPageUrl('Downloads')}
                className="bg-white text-slate-900 hover:bg-slate-100"
              >
                <Apple className="w-4 h-4 mr-2" />
                Download for Mac
              </Button>
              <Button 
                onClick={() => window.location.href = createPageUrl('Downloads')}
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Download for Linux
              </Button>
              <Button 
                onClick={() => window.location.href = createPageUrl('Downloads')}
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
              >
                <Laptop className="w-4 h-4 mr-2" />
                Download for Windows
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}