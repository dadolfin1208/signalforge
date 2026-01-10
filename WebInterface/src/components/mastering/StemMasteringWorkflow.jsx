import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Crown, Download, Loader2, Check, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function StemMasteringWorkflow({ projectId, separation, onComplete }) {
  const [selectedStems, setSelectedStems] = useState([]);
  const [stemPresets, setStemPresets] = useState({});
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  const { data: presets = [] } = useQuery({
    queryKey: ['mastering-presets'],
    queryFn: () => base44.entities.MasteringPreset.list('-created_date')
  });

  const { data: masteredStems = [] } = useQuery({
    queryKey: ['mastered-stems', projectId, separation?.id],
    queryFn: () => base44.entities.MasteringAnalysis.filter({
      project_id: projectId,
      mastering_type: 'stem'
    }, '-created_date'),
    enabled: !!projectId
  });

  const stemConfig = {
    vocals: { label: 'Vocals', icon: '🎤', color: 'bg-blue-600', defaultPreset: 'pop' },
    drums: { label: 'Drums', icon: '🥁', color: 'bg-red-600', defaultPreset: 'rock' },
    bass: { label: 'Bass', icon: '🎸', color: 'bg-green-600', defaultPreset: 'hip_hop' },
    other: { label: 'Other', icon: '🎹', color: 'bg-purple-600', defaultPreset: 'electronic' }
  };

  const toggleStem = (stemKey) => {
    setSelectedStems(prev =>
      prev.includes(stemKey) ? prev.filter(k => k !== stemKey) : [...prev, stemKey]
    );
  };

  const setPresetForStem = (stemKey, presetId) => {
    setStemPresets(prev => ({ ...prev, [stemKey]: presetId }));
  };

  const handleMasterStems = async () => {
    if (selectedStems.length === 0) {
      toast.error('Please select at least one stem');
      return;
    }

    setProcessing(true);
    try {
      toast.info(`🎵 Mastering ${selectedStems.length} stems with AI...`);

      for (let i = 0; i < selectedStems.length; i++) {
        const stemKey = selectedStems[i];
        const stemInfo = stemConfig[stemKey];
        const stemUrl = separation.stems[stemKey];
        
        setProcessingStep(`${stemInfo.label} (${i + 1}/${selectedStems.length})`);

        const presetId = stemPresets[stemKey];
        let targetLufs = -14;

        if (presetId) {
          const preset = presets.find(p => p.id === presetId);
          if (preset) targetLufs = preset.target_lufs;
        }

        await base44.functions.invoke('analyzeMastering', {
          project_id: projectId,
          track_name: `${separation.track_name} - ${stemInfo.label}`,
          file_url: stemUrl,
          mastering_type: 'stem',
          stem_type: stemKey,
          target_lufs: targetLufs
        });

        toast.success(`✓ ${stemInfo.label} mastered`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast.success(`🎉 All ${selectedStems.length} stems mastered successfully!`);
      setSelectedStems([]);
      setStemPresets({});
      if (onComplete) onComplete();
    } catch (error) {
      toast.error('Mastering failed: ' + error.message);
    } finally {
      setProcessing(false);
      setProcessingStep('');
    }
  };

  const handleExportStem = (stem) => {
    toast.info(`Downloading ${stem.track_name}...`);
    window.open(stem.mastered_file_url || stem.file_url, '_blank');
  };

  const handleExportAll = () => {
    masteredStems.forEach(stem => {
      if (stem.mastered_file_url) {
        setTimeout(() => window.open(stem.mastered_file_url, '_blank'), 100);
      }
    });
    toast.success('Exporting all mastered stems...');
  };

  if (!separation || !separation.stems) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="py-8 text-center">
          <Crown className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No separated stems available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stem Selection & Preset Assignment */}
      <Card className="bg-gradient-to-br from-amber-900/30 to-purple-900/30 border-amber-500/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            Individual Stem Mastering
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            Select stems and apply genre-specific presets for professional results
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {Object.entries(stemConfig).map(([stemKey, config]) => {
              const stemUrl = separation.stems[stemKey];
              if (!stemUrl) return null;

              const isSelected = selectedStems.includes(stemKey);
              const isMastered = masteredStems.some(m => m.stem_type === stemKey);

              return (
                <motion.div
                  key={stemKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    isSelected
                      ? 'bg-amber-600/20 border-amber-500'
                      : 'bg-slate-900/50 border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleStem(stemKey)}
                      disabled={processing}
                    />
                    <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
                      <span className="text-xl">{config.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        {config.label}
                        {isMastered && (
                          <Badge className="bg-green-600 text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Mastered
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">AI stem separation</div>
                    </div>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="ml-14 space-y-2">
                        <label className="text-xs text-slate-300">Mastering Preset:</label>
                        <Select
                          value={stemPresets[stemKey] || ''}
                          onValueChange={(value) => setPresetForStem(stemKey, value)}
                          disabled={processing}
                        >
                          <SelectTrigger className="bg-slate-900 border-slate-700 text-white h-8 text-xs">
                            <SelectValue placeholder="Choose preset..." />
                          </SelectTrigger>
                          <SelectContent>
                            {presets.filter(p => p.is_default).map(preset => (
                              <SelectItem key={preset.id} value={preset.id}>
                                {preset.name} ({preset.target_lufs} LUFS)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <Button
            onClick={handleMasterStems}
            disabled={processing || selectedStems.length === 0}
            className="w-full bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-700 hover:to-purple-700"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mastering {processingStep}...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Master {selectedStems.length || 'Selected'} Stems
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Mastered Stems Results */}
      {masteredStems.length > 0 && (
        <Card className="bg-slate-800/50 border-green-500/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                Mastered Stems ({masteredStems.length})
              </CardTitle>
              <Button
                size="sm"
                onClick={handleExportAll}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <AnimatePresence>
                {masteredStems.map((stem, index) => (
                  <motion.div
                    key={stem.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-900/50 rounded-lg p-3 border border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${stemConfig[stem.stem_type]?.color || 'bg-slate-600'} flex items-center justify-center`}>
                          <span className="text-lg">{stemConfig[stem.stem_type]?.icon || '🎵'}</span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{stem.track_name}</div>
                          <div className="text-xs text-slate-400">
                            {stem.target_lufs} LUFS • DR: {stem.dynamic_range?.toFixed(1)} dB
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleExportStem(stem)}
                        className="bg-green-600 hover:bg-green-700 h-7 text-xs"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}