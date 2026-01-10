import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Volume2, Gauge, TrendingUp, TrendingDown, 
  CheckCircle2, Settings, Crown, Download, Zap, Music2, Radio 
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import RealTimeMasteringVisualizer from './RealTimeMasteringVisualizer';

export default function MasteringResults({ analysis, audioFile, onUpdate }) {
  const [applying, setApplying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [customLufs, setCustomLufs] = useState([analysis.target_lufs || -14]);
  const [customThreshold, setCustomThreshold] = useState([analysis.recommendations?.limiter_threshold || -1]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await base44.entities.MasteringAnalysis.update(analysis.id, { applied: true });
      toast.success('Mastering settings applied!');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to apply settings');
    } finally {
      setApplying(false);
    }
  };

  const spectralData = analysis.spectral_balance || {};
  const bars = [
    { label: 'Low', value: spectralData.low || 50, range: '20-250 Hz' },
    { label: 'Low-Mid', value: spectralData.low_mid || 50, range: '250-500 Hz' },
    { label: 'Mid', value: spectralData.mid || 50, range: '500-2k Hz' },
    { label: 'High-Mid', value: spectralData.high_mid || 50, range: '2-8k Hz' },
    { label: 'High', value: spectralData.high || 50, range: '8-20k Hz' }
  ];

  const getBarColor = (value) => {
    if (value > 70) return 'bg-red-500';
    if (value > 40) return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <Card className="bg-slate-800/50 border-amber-500/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            {analysis.track_name}
          </CardTitle>
          <div className="flex gap-2">
            <Badge className="bg-amber-600 text-white">
              {analysis.mastering_type === 'full_mix' ? 'Full Mix' : 'Stem'}
            </Badge>
            {analysis.stem_type && analysis.stem_type !== 'full_mix' && (
              <Badge className="bg-purple-600 text-white capitalize">
                {analysis.stem_type}
              </Badge>
            )}
            {analysis.applied && (
              <Badge className="bg-green-600 text-white">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Applied
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Real-Time Visualizer */}
        {audioFile && (
          <RealTimeMasteringVisualizer audioFile={audioFile} analysis={analysis} />
        )}

        {/* Overall Assessment */}
        <div className="bg-amber-950/50 rounded-lg p-4 border border-amber-500/30">
          <p className="text-sm text-slate-300">{analysis.overall_assessment}</p>
        </div>

        {/* Loudness Analysis */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-white">Loudness</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">{analysis.current_lufs?.toFixed(1)} LUFS</div>
              <div className="text-xs text-slate-400">Current</div>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-sm text-green-400">
                  +{analysis.recommendations?.loudness_adjustment?.toFixed(1)} dB to reach {analysis.target_lufs} LUFS
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-white">Dynamic Range</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">{analysis.dynamic_range?.toFixed(1)} dB</div>
              <div className="text-xs text-slate-400">
                {analysis.dynamic_range > 12 ? 'Wide' : analysis.dynamic_range > 8 ? 'Good' : 'Compressed'}
              </div>
            </div>
          </div>
        </div>

        {/* Spectral Balance */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-400" />
            Spectral Balance
          </h4>
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-end justify-between gap-2 h-32 mb-2">
              {bars.map((bar, i) => (
                <motion.div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2"
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                >
                  <div className={`w-full rounded-t ${getBarColor(bar.value)}`} style={{ height: `${bar.value}%` }} />
                  <div className="text-xs text-slate-400 text-center">{bar.label}</div>
                </motion.div>
              ))}
            </div>
            <div className="text-xs text-slate-500 text-center">Frequency Distribution</div>
          </div>
        </div>

        {/* Limiter Settings */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Limiter Recommendations</h4>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <div className="text-xs text-slate-400">Threshold</div>
              <div className="text-lg font-bold text-white">
                {analysis.recommendations?.limiter_threshold?.toFixed(1)} dB
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <div className="text-xs text-slate-400">Release</div>
              <div className="text-lg font-bold text-white">
                {analysis.recommendations?.limiter_release} ms
              </div>
            </div>
          </div>
        </div>

        {/* EQ Recommendations */}
        {analysis.recommendations?.eq_curve?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">EQ Adjustments</h4>
            <div className="space-y-2">
              {analysis.recommendations.eq_curve.map((eq, i) => (
                <div key={i} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {eq.gain > 0 ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                    <span className="text-sm text-white">{eq.frequency} Hz</span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {eq.gain > 0 ? '+' : ''}{eq.gain} dB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Analysis */}
        {(analysis.transient_detection || analysis.harmonic_content || analysis.stereo_width_analysis) && (
          <div className="border-t border-amber-700 pt-4">
            <h3 className="text-base font-semibold text-white mb-4">Advanced Analysis</h3>
            <div className="space-y-3">

              {/* Transient Detection */}
              {analysis.transient_detection && (
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <h4 className="text-sm font-semibold text-white">Transient Analysis</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Density:</span>
                      <Badge className={`text-xs ${
                        analysis.transient_detection.transient_density === 'high' ? 'bg-red-600' :
                        analysis.transient_detection.transient_density === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
                      }`}>
                        {analysis.transient_detection.transient_density}
                      </Badge>
                    </div>
                    {analysis.transient_detection.peak_characteristics && (
                      <p className="text-xs text-slate-300">{analysis.transient_detection.peak_characteristics}</p>
                    )}
                    {analysis.transient_detection.limiter_impact && (
                      <p className="text-xs text-slate-400">
                        <span className="font-semibold">Limiter Impact:</span> {analysis.transient_detection.limiter_impact}
                      </p>
                    )}
                    {analysis.transient_detection.recommendations && (
                      <p className="text-xs text-amber-400 italic">{analysis.transient_detection.recommendations}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Harmonic Content */}
              {analysis.harmonic_content && (
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Music2 className="w-4 h-4 text-purple-400" />
                    <h4 className="text-sm font-semibold text-white">Harmonic Analysis</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Harmonic Saturation:</span>
                      <span className="text-xs font-semibold text-white">{analysis.harmonic_content.harmonic_saturation}%</span>
                    </div>
                    {analysis.harmonic_content.frequency_spread && (
                      <p className="text-xs text-slate-300">{analysis.harmonic_content.frequency_spread}</p>
                    )}
                    {analysis.harmonic_content.enhancement_potential && (
                      <p className="text-xs text-slate-400">
                        <span className="font-semibold">Enhancement:</span> {analysis.harmonic_content.enhancement_potential}
                      </p>
                    )}
                    {analysis.harmonic_content.recommendations && (
                      <p className="text-xs text-amber-400 italic">{analysis.harmonic_content.recommendations}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Stereo Width Analysis */}
              {analysis.stereo_width_analysis && (
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-semibold text-white">Stereo Imaging</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Current Width:</span>
                      <span className="text-xs font-semibold text-white">{analysis.stereo_width_analysis.current_width}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Phase Coherence:</span>
                      <span className="text-xs font-semibold text-white">{analysis.stereo_width_analysis.phase_coherence}%</span>
                    </div>
                    {analysis.stereo_width_analysis.spatial_distribution && (
                      <p className="text-xs text-slate-300">{analysis.stereo_width_analysis.spatial_distribution}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Recommended:</span>
                      <span className="text-xs font-semibold text-cyan-400">{analysis.stereo_width_analysis.recommended_width}%</span>
                    </div>
                    {analysis.stereo_width_analysis.recommendations && (
                      <p className="text-xs text-amber-400 italic">{analysis.stereo_width_analysis.recommendations}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fine-Tune Controls */}
        {showControls && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700"
          >
            <h4 className="text-sm font-semibold text-white">Fine-Tune Parameters</h4>

            <div>
              <Label className="text-slate-200">Target LUFS: {customLufs[0]}</Label>
              <Slider
                value={customLufs}
                onValueChange={setCustomLufs}
                min={-23}
                max={-8}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-slate-200">Limiter Threshold: {customThreshold[0]} dB</Label>
              <Slider
                value={customThreshold}
                onValueChange={setCustomThreshold}
                min={-6}
                max={0}
                step={0.1}
                className="mt-2"
              />
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!analysis.applied && (
            <>
              <Button
                onClick={() => setShowControls(!showControls)}
                variant="outline"
                className="flex-1 border-slate-600"
              >
                <Settings className="w-4 h-4 mr-2" />
                {showControls ? 'Hide' : 'Fine-Tune'}
              </Button>
              <Button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                {applying ? 'Applying...' : 'Apply Mastering'}
              </Button>
            </>
          )}
          {analysis.mastered_file_url && (
            <Button className="flex-1 bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Download Master
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}