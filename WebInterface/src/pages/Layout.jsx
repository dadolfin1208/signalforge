
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { Music, Users, BookOpen, LayoutDashboard, LogOut, Menu, X, Download, BarChart3, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const navigation = user ? [
    { name: 'Dashboard', path: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { name: 'Projects', path: 'Projects', icon: Music, adminOnly: false },
    { name: 'Downloads', path: 'Downloads', icon: Download, adminOnly: false },
    { name: 'Icon Download', path: 'IconDownload', icon: Download, adminOnly: false },
    { name: 'API Docs', path: 'APIDocumentation', icon: BookOpen, adminOnly: false },
    { name: 'Knowledge Base', path: 'KnowledgeBase', icon: BookOpen, adminOnly: false },
    { name: 'Analytics', path: 'Analytics', icon: BarChart3, adminOnly: true },
    { name: 'Files', path: 'FileManagement', icon: HardDrive, adminOnly: true },
    { name: 'Admin', path: 'Admin', icon: Users, adminOnly: true },
  ].filter(item => !item.adminOnly || user?.role === 'admin') : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading Signal Forge...</div>
      </div>
    );
  }

  if (!user && currentPageName !== 'Home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        {children}
      </div>
    );
  }

  if (currentPageName === 'Home') {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <style>{`
        :root {
          --signal-forge-primary: #6366f1;
          --signal-forge-secondary: #818cf8;
          --signal-forge-accent: #c084fc;
        }
      `}</style>
      
      {/* Top Navigation */}
      <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
              <div className="relative">
                <div className="text-4xl">🎼</div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Signal Forge</h1>
                <p className="text-xs text-indigo-400">by Genius Ideas</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.path;
                return (
                  <Link
                    key={item.path}
                    to={createPageUrl(item.path)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => base44.auth.logout()}
                className="text-slate-300 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.path;
                return (
                  <Link
                    key={item.path}
                    to={createPageUrl(item.path)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => base44.auth.logout()}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/30 backdrop-blur-xl border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-slate-400 text-sm">
                Signal Forge by <span className="text-indigo-400 font-semibold">Genius Ideas</span>
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Designed by Barry and Judah
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Link to={createPageUrl('KnowledgeBase')} className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">
                Knowledge Base
              </Link>
              <a href="#" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
