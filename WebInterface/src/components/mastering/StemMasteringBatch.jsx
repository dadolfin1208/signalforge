import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Crown, Loader2, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function StemMasteringBatch({ projectId, stems = [], onComplete }) {
  const [processing, setProcessing] = useState(false);
  const [selectedStems, setSelectedStems] = useState([]);

  const availableStems = [
    { key: 'vocals', label: 'Vocals', icon: '🎤', target_lufs: -11 },
    { key: 'drums', label: 'Drums', icon: '🥁', target_lufs: -9 },
    { key: 'bass', label: 'Bass', icon: '🎸', target_lufs: -11 },
    { key: 'guitar', label: 'Guitar', icon: '🎸', target_lufs: -13 },
    { key: 'keys', label: 'Keys', icon: '🎹', target_lufs: -15 },
    { key: 'other', label: 'Other', icon: '🎼', target_lufs: -15 },
  ];

  const toggleStem = (stemKey) => {
    setSelectedStems(prev =>
      prev.includes(stemKey)
        ? prev.filter(k => k !== stemKey)
        : [...prev, stemKey]
    );
  };

  const handleBatchMaster = async () => {
    if (selectedStems.length === 0) {
      toast.error('Please select at least one stem');
      return;
    }

    if (stems.length === 0) {
      toast.error('No separated stems available. Please separate stems first.');
      return;
    }

    setProcessing(true);
    try {
      toast.info(`🎼 Processing ${selectedStems.length} stems for mastering...`);

      const latestSeparation = stems[0];

      for (let i = 0; i < selectedStems.length; i++) {
        const stemKey = selectedStems[i];
        const stem = availableStems.find(s => s.key === stemKey);
        const stemUrl = latestSeparation.stems?.[stemKey];

        if (!stemUrl) {
          toast.error(`${stem.label} stem not found`);
          continue;
        }

        await base44.functions.invoke('analyzeMastering', {
          project_id: projectId,
          track_name: `${latestSeparation.track_name} - ${stem.label}`,
          file_url: stemUrl,
          mastering_type: 'stem',
          stem_type: stemKey,
          target_lufs: stem.target_lufs
        });

        toast.success(`✓ ${stem.label} mastered (${i + 1}/${selectedStems.length})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast.success(`🎉 Successfully mastered all ${selectedStems.length} stems!`);
      if (onComplete) onComplete();
      setSelectedStems([]);
    } catch (error) {
      toast.error('Batch mastering failed: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/50 to-amber-900/50 border-amber-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Layers className="w-5 h-5 text-amber-400" />
          Batch Stem Mastering
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-amber-950/30 rounded-lg p-4 border border-amber-500/30">
          <p className="text-sm text-amber-200">
            Master individual stems with AI-optimized settings for each element, then recombine for a cohesive final master.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {availableStems.map((stem) => (
            <motion.div
              key={stem.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <label
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedStems.includes(stem.key)
                    ? 'bg-amber-600/20 border-amber-500'
                    : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <Checkbox
                  checked={selectedStems.includes(stem.key)}
                  onCheckedChange={() => toggleStem(stem.key)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{stem.icon}</span>
                    <span className="text-sm font-semibold text-white">{stem.label}</span>
                  </div>
                  <div className="text-xs text-slate-400">Target: {stem.target_lufs} LUFS</div>
                </div>
              </label>
            </motion.div>
          ))}
        </div>

        <Button
          onClick={handleBatchMaster}
          disabled={processing || selectedStems.length === 0}
          className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Mastering {selectedStems.length} Stems...
            </>
          ) : (
            <>
              <Crown className="w-4 h-4 mr-2" />
              Master {selectedStems.length || 'Selected'} Stems
            </>
          )}
        </Button>

        {selectedStems.length > 0 && (
          <div className="text-xs text-center text-amber-300">
            Selected: {selectedStems.map(k => availableStems.find(s => s.key === k)?.label).join(', ')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}