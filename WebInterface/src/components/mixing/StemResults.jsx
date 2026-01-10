import React from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Music, Sparkles, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function StemResults({ separation, onAnalyzeStem }) {
  const stems = [
    { key: 'vocals', label: 'Vocals', icon: '🎤', color: 'bg-blue-600' },
    { key: 'drums', label: 'Drums', icon: '🥁', color: 'bg-red-600' },
    { key: 'bass', label: 'Bass', icon: '🎸', color: 'bg-green-600' },
    { key: 'other', label: 'Other Instruments', icon: '🎹', color: 'bg-purple-600' }
  ];

  const handleDownload = (stemUrl, stemName) => {
    const link = document.createElement('a');
    link.href = stemUrl;
    link.download = `${separation.track_name}_${stemName}.wav`;
    link.click();
    toast.success(`Downloading ${stemName}...`);
  };

  const handleAnalyze = (stemKey, stemLabel) => {
    if (onAnalyzeStem) {
      onAnalyzeStem(stemKey, stemLabel, separation.stems[stemKey]);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-pink-500/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Music className="w-5 h-5 text-pink-400" />
            {separation.track_name}
          </CardTitle>
          <Badge className={`${
            separation.status === 'completed' ? 'bg-green-600' : 
            separation.status === 'processing' ? 'bg-yellow-600' : 
            'bg-red-600'
          } text-white`}>
            {separation.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {separation.status === 'completed' && separation.stems ? (
          <>
            <div className="bg-green-950/30 rounded-lg p-3 border border-green-500/30 mb-4">
              <p className="text-xs text-green-300">
                ✓ Stems separated successfully! You can now download each stem or send them to the AI Mastering Assistant for individual mastering.
              </p>
            </div>
            <div className="space-y-3">
              {stems.map((stem, index) => (
              <motion.div
                key={stem.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900/50 rounded-lg p-4 border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${stem.color} rounded-lg flex items-center justify-center text-xl`}>
                      {stem.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{stem.label}</div>
                      <div className="text-xs text-slate-400">Isolated stem</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAnalyze(stem.key, stem.label)}
                      className="border-purple-600 text-purple-400 hover:bg-purple-950"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Analyze
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(separation.stems[stem.key], stem.label)}
                      className="bg-pink-600 hover:bg-pink-700"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
              ))}
              
              {separation.processing_time && (
                <p className="text-xs text-slate-500 text-center mt-4">
                  Processed in {separation.processing_time.toFixed(1)}s
                </p>
              )}
            </div>
          </>
        ) : separation.status === 'processing' ? (
          <div className="text-center py-8">
            <div className="animate-spin w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-400">AI is separating your stems...</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-red-400">Separation failed</p>
            {separation.error_message && (
              <p className="text-xs text-slate-500 mt-2">{separation.error_message}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}