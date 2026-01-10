import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Apple, Monitor, CheckCircle2, AlertCircle, Laptop } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Downloads() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        if (currentUser) {
          const subs = await base44.entities.Subscription.filter({ user_email: currentUser.email });
          const activeSub = subs.find(s => s.status === 'active');
          setSubscription(activeSub);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  const [downloadFiles, setDownloadFiles] = useState([]);

  useEffect(() => {
    const loadDownloadFiles = async () => {
      try {
        const files = await base44.entities.DownloadFile.filter({ is_active: true });
        setDownloadFiles(files);
      } catch (error) {
        console.error('Failed to load download files:', error);
      }
    };
    if (!loading) loadDownloadFiles();
  }, [loading]);

  const hasActiveSubscription = subscription && subscription.status === 'active';
  
  const platformIcons = {
    'macOS': Apple,
    'Linux': Monitor,
    'Windows': Laptop
  };

  const platformColors = {
    'macOS': 'from-gray-600 to-gray-800',
    'Linux': 'from-orange-600 to-red-600',
    'Windows': 'from-blue-600 to-cyan-600'
  };

  const downloads = downloadFiles.map(file => ({
    platform: file.platform,
    icon: platformIcons[file.platform],
    version: file.version,
    size: file.file_size,
    requirements: file.requirements,
    downloadUrl: file.file_url,
    color: platformColors[file.platform],
    releaseDate: file.release_date
  }));

  const currentVersion = downloads[0]?.version || "1.0.0";
  const releaseDate = downloads[0]?.releaseDate || "January 2026";

  const features = [
    'Professional multi-track recording and editing',
    'AI-powered mixing and mastering assistance',
    'Stem separation and individual track processing',
    'Low-latency audio engine optimized for Mac and Linux',
    'MIDI sequencing and virtual instrument support',
    'VST3 and AU plugin compatibility',
    'Real-time effects processing',
    'Cloud project synchronization'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">Download Signal Forge</h1>
          <p className="text-xl text-slate-400 mb-2">Professional DAW for Mac, Windows, and Linux</p>
          <Badge className="bg-indigo-600 text-white text-sm">
            Version {currentVersion} • Released {releaseDate}
          </Badge>
        </motion.div>

        {/* Subscription Status */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className={`${hasActiveSubscription ? 'bg-green-900/30 border-green-500/50' : 'bg-amber-900/30 border-amber-500/50'}`}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {hasActiveSubscription ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                        <div>
                          <div className="text-white font-semibold">Active Subscription</div>
                          <div className="text-sm text-slate-300">
                            {subscription.subscription_type} • Expires {new Date(subscription.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-6 h-6 text-amber-400" />
                        <div>
                          <div className="text-white font-semibold">No Active Subscription</div>
                          <div className="text-sm text-slate-300">Sign up to start your 3-day free trial</div>
                        </div>
                      </>
                    )}
                  </div>
                  {!hasActiveSubscription && (
                    <Button onClick={() => base44.auth.redirectToLogin()}>
                      Start Free Trial
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Download Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {downloads.map((download, index) => {
            const Icon = download.icon;
            return (
              <motion.div
                key={download.platform}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 hover:border-indigo-500 transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${download.color} flex items-center justify-center`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <Badge variant="outline" className="text-slate-300">
                        {download.version}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl text-white">{download.platform}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm text-slate-400">
                      <div>Size: {download.size}</div>
                      <div>Requirements: {download.requirements}</div>
                    </div>
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      size="lg"
                      onClick={async () => {
                        if (hasActiveSubscription) {
                          // Track download
                          const file = downloadFiles.find(f => f.platform === download.platform && f.is_active);
                          if (file) {
                            await base44.entities.DownloadFile.update(file.id, {
                              download_count: (file.download_count || 0) + 1
                            });
                            await base44.entities.UsageAnalytics.create({
                              user_email: user.email,
                              action_type: 'download_daw',
                              metadata: { platform: download.platform, version: download.version }
                            });
                          }
                          window.location.href = download.downloadUrl;
                        } else {
                          base44.auth.redirectToLogin();
                        }
                      }}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download for {download.platform}
                    </Button>
                    {!hasActiveSubscription && (
                      <p className="text-xs text-center text-slate-500">
                        Active subscription required
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Screenshot Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">See It In Action</h2>
          <div className="space-y-6">
            {/* Main Editor Screenshot */}
            <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&h=600&fit=crop" 
                alt="Multi-track DAW interface"
                className="w-full h-96 object-cover"
              />
              <CardContent className="py-4">
                <h3 className="text-xl font-bold text-white mb-2">Multi-Track Editor</h3>
                <p className="text-sm text-slate-400">
                  Professional timeline with unlimited tracks, waveform display, and non-destructive editing
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* AI Mixing */}
              <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=400&fit=crop" 
                  alt="AI Mixing Assistant"
                  className="w-full h-64 object-cover"
                />
                <CardContent className="py-4">
                  <h3 className="text-lg font-bold text-white mb-2">AI Mixing Engine</h3>
                  <p className="text-sm text-slate-400">
                    Intelligent EQ, compression, and real-time analysis
                  </p>
                </CardContent>
              </Card>

              {/* Plugin Hosting */}
              <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1619983081563-430f63602796?w=600&h=400&fit=crop" 
                  alt="Plugin support interface"
                  className="w-full h-64 object-cover"
                />
                <CardContent className="py-4">
                  <h3 className="text-lg font-bold text-white mb-2">VST3 & AU Plugin Support</h3>
                  <p className="text-sm text-slate-400">
                    Host your favorite plugins with low-latency processing
                  </p>
                </CardContent>
              </Card>

              {/* Stem Separation */}
              <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=600&h=400&fit=crop" 
                  alt="Stem separation visualization"
                  className="w-full h-64 object-cover"
                />
                <CardContent className="py-4">
                  <h3 className="text-lg font-bold text-white mb-2">AI Stem Separation</h3>
                  <p className="text-sm text-slate-400">
                    Extract vocals, drums, bass, and instruments
                  </p>
                </CardContent>
              </Card>

              {/* MIDI & Recording */}
              <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1563330232-57114bb0823c?w=600&h=400&fit=crop" 
                  alt="MIDI sequencing and recording"
                  className="w-full h-64 object-cover"
                />
                <CardContent className="py-4">
                  <h3 className="text-lg font-bold text-white mb-2">MIDI Sequencing</h3>
                  <p className="text-sm text-slate-400">
                    Full MIDI support with virtual instruments
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Minimum System Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-indigo-400 font-semibold mb-2">macOS</h4>
                  <ul className="space-y-1 text-sm text-slate-400">
                    <li>• macOS 11.0 (Big Sur) or later</li>
                    <li>• Intel Core i5 or Apple M1/M2</li>
                    <li>• 8GB RAM (16GB recommended)</li>
                    <li>• 2GB available disk space</li>
                    <li>• Audio interface recommended</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-orange-400 font-semibold mb-2">Linux</h4>
                  <ul className="space-y-1 text-sm text-slate-400">
                    <li>• Ubuntu 20.04+ or equivalent</li>
                    <li>• Intel Core i5 or AMD Ryzen 5</li>
                    <li>• 8GB RAM (16GB recommended)</li>
                    <li>• 2GB available disk space</li>
                    <li>• JACK or ALSA audio support</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-cyan-400 font-semibold mb-2">Windows</h4>
                  <ul className="space-y-1 text-sm text-slate-400">
                    <li>• Windows 10 (64-bit) or later</li>
                    <li>• Intel Core i5 or AMD Ryzen 5</li>
                    <li>• 8GB RAM (16GB recommended)</li>
                    <li>• 2GB available disk space</li>
                    <li>• ASIO driver recommended</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Support Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-8 text-slate-500"
        >
          <p>Need help? Check out our <a href="#" className="text-indigo-400 hover:underline">Knowledge Base</a> or contact support.</p>
        </motion.div>
      </div>
    </div>
  );
}