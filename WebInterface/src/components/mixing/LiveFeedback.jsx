import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Info, CheckCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveFeedback({ feedback }) {
  const [feedbackHistory, setFeedbackHistory] = useState([]);

  useEffect(() => {
    if (feedback) {
      setFeedbackHistory(prev => [feedback, ...prev.slice(0, 4)]);
    }
  }, [feedback]);

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return AlertCircle;
      case 'info': return Info;
      case 'success': return CheckCircle;
      default: return Zap;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'warning': return 'border-yellow-500 bg-yellow-500/10';
      case 'info': return 'border-blue-500 bg-blue-500/10';
      case 'success': return 'border-green-500 bg-green-500/10';
      default: return 'border-purple-500 bg-purple-500/10';
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'warning': return 'bg-yellow-600';
      case 'info': return 'bg-blue-600';
      case 'success': return 'bg-green-600';
      default: return 'bg-purple-600';
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Live Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {feedbackHistory.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <Zap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Play audio to receive live mixing feedback</p>
              </motion.div>
            ) : (
              feedbackHistory.map((item, index) => {
                const Icon = getIcon(item.suggestion?.type);
                return (
                  <motion.div
                    key={`${item.time}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`border-l-4 rounded-lg p-4 ${getColor(item.suggestion?.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${getBadgeColor(item.suggestion?.type)} text-white text-xs`}>
                            {item.suggestion?.frequency}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {item.time?.toFixed(1)}s
                          </span>
                        </div>
                        <p className="text-sm text-white">
                          {item.suggestion?.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}