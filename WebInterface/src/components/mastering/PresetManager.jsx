import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, BookOpen, Music, Trash2, Star, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function PresetManager({ currentSettings, onApplyPreset }) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const queryClient = useQueryClient();

  const { data: presets = [], isLoading } = useQuery({
    queryKey: ['mastering-presets'],
    queryFn: () => base44.entities.MasteringPreset.list('-created_date')
  });

  const savePresetMutation = useMutation({
    mutationFn: async (name) => {
      return await base44.entities.MasteringPreset.create({
        name,
        genre: 'custom',
        target_lufs: currentSettings.target_lufs,
        limiter_threshold: currentSettings.limiter_threshold,
        limiter_release: currentSettings.limiter_release,
        eq_curve: currentSettings.eq_curve || [],
        compression_ratio: currentSettings.compression_ratio,
        stereo_width: currentSettings.stereo_width,
        is_default: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mastering-presets'] });
      toast.success('✨ Preset saved successfully!');
      setShowSaveDialog(false);
      setPresetName('');
    }
  });

  const deletePresetMutation = useMutation({
    mutationFn: (id) => base44.entities.MasteringPreset.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mastering-presets'] });
      toast.success('Preset deleted');
    }
  });

  const handleSave = () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }
    savePresetMutation.mutate(presetName);
  };

  const handleApply = (preset) => {
    if (onApplyPreset) {
      onApplyPreset(preset);
      toast.success(`✨ Applied "${preset.name}" preset`);
    }
  };

  // Auto-create default presets if none exist
  useEffect(() => {
    if (presets && presets.length === 0 && !isLoading) {
      const createDefaults = async () => {
        const defaults = [
          {
            name: 'Pop Master',
            genre: 'pop',
            target_lufs: -11,
            limiter_threshold: -0.3,
            limiter_release: 50,
            eq_curve: [
              { frequency: 60, gain: 1, q: 0.7, type: 'bell' },
              { frequency: 250, gain: -0.5, q: 1.0, type: 'bell' },
              { frequency: 3000, gain: 1.5, q: 1.2, type: 'bell' },
              { frequency: 10000, gain: 2, q: 0.7, type: 'shelf' }
            ],
            compression_ratio: '2:1',
            stereo_width: 105,
            is_default: true
          },
          {
            name: 'Rock Master',
            genre: 'rock',
            target_lufs: -9,
            limiter_threshold: -0.5,
            limiter_release: 30,
            eq_curve: [
              { frequency: 80, gain: 2, q: 0.7, type: 'bell' },
              { frequency: 400, gain: -1, q: 1.0, type: 'bell' },
              { frequency: 2500, gain: 1, q: 1.2, type: 'bell' },
              { frequency: 8000, gain: 1.5, q: 0.7, type: 'shelf' }
            ],
            compression_ratio: '3:1',
            stereo_width: 110,
            is_default: true
          },
          {
            name: 'Electronic Master',
            genre: 'electronic',
            target_lufs: -8,
            limiter_threshold: -0.2,
            limiter_release: 100,
            eq_curve: [
              { frequency: 40, gain: 2.5, q: 0.7, type: 'bell' },
              { frequency: 200, gain: -1, q: 1.0, type: 'bell' },
              { frequency: 5000, gain: 2, q: 1.2, type: 'bell' },
              { frequency: 12000, gain: 2.5, q: 0.7, type: 'shelf' }
            ],
            compression_ratio: '4:1',
            stereo_width: 120,
            is_default: true
          },
          {
            name: 'Hip-Hop Master',
            genre: 'hip_hop',
            target_lufs: -10,
            limiter_threshold: -0.4,
            limiter_release: 40,
            eq_curve: [
              { frequency: 50, gain: 3, q: 0.7, type: 'bell' },
              { frequency: 300, gain: -0.5, q: 1.0, type: 'bell' },
              { frequency: 4000, gain: 1, q: 1.2, type: 'bell' },
              { frequency: 10000, gain: 1.5, q: 0.7, type: 'shelf' }
            ],
            compression_ratio: '3:1',
            stereo_width: 95,
            is_default: true
          }
        ];

        for (const preset of defaults) {
          await base44.entities.MasteringPreset.create(preset);
        }
        queryClient.invalidateQueries({ queryKey: ['mastering-presets'] });
        toast.success('✨ Genre presets loaded');
      };
      createDefaults();
    }
  }, [presets, isLoading, queryClient]);

  const genreColors = {
    pop: { bg: 'bg-pink-600', icon: '🎤', label: 'Pop' },
    rock: { bg: 'bg-orange-600', icon: '🎸', label: 'Rock' },
    electronic: { bg: 'bg-cyan-600', icon: '🎧', label: 'Electronic' },
    hip_hop: { bg: 'bg-purple-600', icon: '🎵', label: 'Hip-Hop' },
    custom: { bg: 'bg-slate-600', icon: '⚙️', label: 'Custom' }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Mastering Presets
        </CardTitle>
        <p className="text-xs text-slate-400 mt-1">
          Apply genre-optimized settings or save your own custom chains
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showSaveDialog ? (
          <>
            <ScrollArea className="h-80">
              <div className="space-y-2 pr-4">
                {presets.length === 0 ? (
                  <div className="text-center py-8">
                    <Music className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Loading presets...</p>
                  </div>
                ) : (
                  presets.map((preset) => (
                    <motion.div
                      key={preset.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-slate-900/50 rounded-lg p-3 border border-slate-700 hover:border-amber-500 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${genreColors[preset.genre]?.bg || 'bg-slate-700'} flex items-center justify-center`}>
                              <span className="text-xl">{genreColors[preset.genre]?.icon || '🎵'}</span>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white flex items-center gap-2">
                                {preset.name}
                                {preset.is_default && (
                                  <Badge className="bg-blue-600 text-xs">Default</Badge>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 capitalize">
                                {genreColors[preset.genre]?.label || preset.genre}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApply(preset)}
                              className="bg-amber-600 hover:bg-amber-700 text-xs"
                            >
                              Apply
                            </Button>
                            {!preset.is_default && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deletePresetMutation.mutate(preset.id)}
                                className="text-red-400 hover:text-red-300 text-xs"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="bg-slate-900/50 rounded p-2">
                            <div className="text-slate-500">LUFS</div>
                            <div className="text-white font-semibold">{preset.target_lufs}</div>
                          </div>
                          <div className="bg-slate-900/50 rounded p-2">
                            <div className="text-slate-500">Ratio</div>
                            <div className="text-white font-semibold">{preset.compression_ratio || '2:1'}</div>
                          </div>
                          <div className="bg-slate-900/50 rounded p-2">
                            <div className="text-slate-500">Width</div>
                            <div className="text-white font-semibold">{preset.stereo_width || 100}%</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>

            <Button
              onClick={() => setShowSaveDialog(true)}
              variant="outline"
              className="w-full border-slate-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Current as Preset
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <Label className="text-slate-200">Preset Name</Label>
            <Input
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="e.g., My Custom Master"
              className="bg-slate-900 border-slate-700 text-white"
            />
            <div className="bg-slate-900/50 rounded p-3 space-y-1 text-xs">
              <div className="text-slate-400">Current Settings:</div>
              <div className="text-white">• Target: {currentSettings.target_lufs} LUFS</div>
              <div className="text-white">• Ratio: {currentSettings.compression_ratio}</div>
              <div className="text-white">• Width: {currentSettings.stereo_width}%</div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowSaveDialog(false)}
                variant="outline"
                className="flex-1 border-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={savePresetMutation.isPending}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                {savePresetMutation.isPending ? 'Saving...' : 'Save Preset'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}