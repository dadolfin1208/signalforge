import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Music, Zap, Shield, Sparkles, ArrowRight, Check, Apple, Monitor, Laptop } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authed = await base44.auth.isAuthenticated();
      setIsAuthenticated(authed);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    window.location.href = createPageUrl('Dashboard');
    return null;
  }

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Mixing',
      description: 'Revolutionary AI algorithms that understand your creative vision and enhance your sound'
    },
    {
      icon: Music,
      title: 'Professional Grade',
      description: 'Built for Mac, Linux, and Windows with support for all major audio interfaces'
    },
    {
      icon: Shield,
      title: 'Flexible Licensing',
      description: 'Trial, yearly, or custom subscriptions - choose what works for you'
    },
    {
      icon: Sparkles,
      title: 'Innovation First',
      description: 'Cutting-edge features designed by Barry and Judah at Genius Ideas'
    }
  ];

  const plans = [
    {
      name: '3-Day Trial',
      price: 'Free',
      description: 'Experience the full power of Signal Forge',
      features: ['All features unlocked', 'No credit card required', 'Full DAW access', 'AI features included']
    },
    {
      name: 'Yearly',
      price: '$299',
      description: 'Best value for professionals',
      features: ['12 months access', 'All updates included', 'Priority support', 'Cloud project sync'],
      popular: true
    },
    {
      name: 'Multi-Year',
      price: '$499',
      description: 'Lock in the best rate',
      features: ['24 months access', 'Lifetime updates', 'VIP support', 'Early access to features']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djRoNHYtNGgtNHptMCA4djRoNHYtNGgtNHptLTQtNHY0aDR2LTRoLTR6bTAgOHY0aDR2LTRoLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 relative">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <div className="text-8xl">🎼</div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full animate-pulse"></div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl md:text-7xl font-bold text-white mb-4"
            >
              Signal Forge
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl text-indigo-300 mb-2"
            >
              by Genius Ideas
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-slate-400 mb-8"
            >
              Designed by Barry and Judah
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12"
            >
              The next generation DAW that combines professional audio production with revolutionary AI technology.
              Built for Mac, Linux, and Windows.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                onClick={() => window.location.href = createPageUrl('Downloads')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-8 py-6"
              >
                Download Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))}
                className="border-indigo-400 text-indigo-400 hover:bg-indigo-950 text-lg px-8 py-6"
              >
                Sign In
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Signal Forge?</h2>
            <p className="text-xl text-slate-400">Innovation meets professional audio production</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 hover:border-indigo-500 transition-all"
                >
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h2>
            <p className="text-xl text-slate-400">Flexible options for every creator</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-slate-800/50 backdrop-blur-xl border rounded-2xl p-8 ${
                  plan.popular ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-slate-700'
                }`}
              >
                {plan.popular && (
                  <div className="bg-indigo-600 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-indigo-400 mb-2">{plan.price}</div>
                <p className="text-slate-400 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-slate-300">
                      <Check className="w-5 h-5 text-indigo-400 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => window.location.href = createPageUrl('Downloads')}
                  className={`w-full ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  Download Now
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Sound?</h2>
          <p className="text-xl text-slate-400 mb-8">
            Join the next generation of audio professionals using Signal Forge
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-4">
            <Button
              size="lg"
              onClick={() => window.location.href = createPageUrl('Downloads')}
              className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-6"
            >
              <Apple className="w-5 h-5 mr-2" />
              Download for Mac
            </Button>
            <Button
              size="lg"
              onClick={() => window.location.href = createPageUrl('Downloads')}
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-6 py-6"
            >
              <Monitor className="w-5 h-5 mr-2" />
              Download for Linux
            </Button>
            <Button
              size="lg"
              onClick={() => window.location.href = createPageUrl('Downloads')}
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-6 py-6"
            >
              <Laptop className="w-5 h-5 mr-2" />
              Download for Windows
            </Button>
          </div>
          <p className="text-sm text-slate-500 mt-4">
            Signal Forge by Genius Ideas • Designed by Barry and Judah
          </p>
        </div>
      </div>
    </div>
  );
}