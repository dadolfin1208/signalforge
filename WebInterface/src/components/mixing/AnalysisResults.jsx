import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Volume2, Gauge, AlertCircle, CheckCircle2, Lightbulb, Zap, Music2, Radio } from 'lucide-react';
import { toast } from 'sonner';

export default function AnalysisResults({ analysis, onUpdate }) {
  const [applying, setApplying] = useState(false);

  const priorityConfig = {
    critical: { color: 'bg-red-600', icon: AlertCircle },
    recommended: { color: 'bg-yellow-600', icon: Lightbulb },
    optional: { color: 'bg-blue-600', icon: Lightbulb }
  };

  const config = priorityConfig[analysis.priority] || priorityConfig.recommended;
  const Icon = config.icon;

  const handleApply = async () => {
    setApplying(true);
    try {
      await base44.entities.MixingAnalysis.update(analysis.id, { applied: true });
      toast.success('Marked as applied!');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setApplying(false);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-indigo-500/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">{analysis.track_name}</CardTitle>
          <div className="flex gap-2">
            <Badge className={`${config.color} text-white`}>
              <Icon className="w-3 h-3 mr-1" />
              {analysis.priority}
            </Badge>
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
        {/* Overall Assessment */}
        <div className="bg-indigo-950/50 rounded-lg p-4 border border-indigo-500/30">
          <p className="text-sm text-slate-300">{analysis.overall_assessment}</p>
        </div>

        {/* EQ Recommendations */}
        {analysis.eq_recommendations?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-purple-400" />
              EQ Recommendations
            </h4>
            <div className="space-y-3">
              {analysis.eq_recommendations.map((eq, i) => (
                <div key={i} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    {eq.gain > 0 ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                    <span className="text-sm font-semibold text-white">
                      {eq.frequency} Hz • {eq.gain > 0 ? '+' : ''}{eq.gain} dB
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{eq.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compression */}
        {analysis.compression_settings && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-400" />
              Standard Compression
            </h4>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <div className="text-xs text-slate-400">Threshold</div>
                  <div className="text-sm font-semibold text-white">{analysis.compression_settings.threshold} dB</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Ratio</div>
                  <div className="text-sm font-semibold text-white">{analysis.compression_settings.ratio}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Attack</div>
                  <div className="text-sm font-semibold text-white">{analysis.compression_settings.attack} ms</div>
                </div>
              </div>
              <p className="text-xs text-slate-400">{analysis.compression_settings.reasoning}</p>
            </div>
          </div>
        )}

        {/* Multi-band Compression */}
        {analysis.multiband_compression && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-purple-400" />
              Multi-Band Compression
            </h4>
            <div className="space-y-2">
              {['low_band', 'mid_band', 'high_band'].map((band) => {
                const bandData = analysis.multiband_compression[band];
                if (!bandData) return null;
                return (
                  <div key={band} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-white capitalize">
                        {band.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">{bandData.frequency_range}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <div className="text-slate-500">Threshold</div>
                        <div className="text-white">{bandData.threshold} dB</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Ratio</div>
                        <div className="text-white">{bandData.ratio}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Attack</div>
                        <div className="text-white">{bandData.attack} ms</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Release</div>
                        <div className="text-white">{bandData.release} ms</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {analysis.multiband_compression.reasoning && (
                <p className="text-xs text-slate-400 px-3">{analysis.multiband_compression.reasoning}</p>
              )}
            </div>
          </div>
        )}

        {/* Level Adjustments */}
        {analysis.level_adjustments && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Level Balancing</h4>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <div className="text-lg font-bold text-white mb-2">
                {analysis.level_adjustments.adjustment > 0 ? '+' : ''}{analysis.level_adjustments.adjustment} dB
              </div>
              <p className="text-xs text-slate-400">{analysis.level_adjustments.reasoning}</p>
            </div>
          </div>
        )}

        {/* Advanced Analysis */}
        {(analysis.transient_detection || analysis.harmonic_content || analysis.stereo_width_analysis) && (
          <div className="border-t border-slate-700 pt-4">
            <h3 className="text-base font-semibold text-white mb-4">Advanced Analysis</h3>
            <div className="space-y-4">

              {/* Transient Detection */}
              {analysis.transient_detection && (
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <h4 className="text-sm font-semibold text-white">Transient Detection</h4>
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
                    {analysis.transient_detection.attack_character && (
                      <p className="text-xs text-slate-300">{analysis.transient_detection.attack_character}</p>
                    )}
                    {analysis.transient_detection.recommendations && (
                      <p className="text-xs text-slate-400 italic">{analysis.transient_detection.recommendations}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Harmonic Content */}
              {analysis.harmonic_content && (
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Music2 className="w-4 h-4 text-purple-400" />
                    <h4 className="text-sm font-semibold text-white">Harmonic Content</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Fundamental Strength:</span>
                      <span className="text-xs font-semibold text-white">{analysis.harmonic_content.fundamental_strength}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Harmonic Richness:</span>
                      <span className="text-xs font-semibold text-white">{analysis.harmonic_content.harmonic_richness}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Tonal Balance:</span>
                      <Badge className="text-xs bg-indigo-600 capitalize">{analysis.harmonic_content.tonal_balance}</Badge>
                    </div>
                    {analysis.harmonic_content.recommendations && (
                      <p className="text-xs text-slate-400 italic">{analysis.harmonic_content.recommendations}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Stereo Width Analysis */}
              {analysis.stereo_width_analysis && (
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-semibold text-white">Stereo Width Analysis</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Current Width:</span>
                      <span className="text-xs font-semibold text-white">{analysis.stereo_width_analysis.width_percentage}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Phase Correlation:</span>
                      <span className="text-xs font-semibold text-white">{analysis.stereo_width_analysis.phase_correlation?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Mono Compatibility:</span>
                      <Badge className={`text-xs ${
                        analysis.stereo_width_analysis.mono_compatibility === 'excellent' ? 'bg-green-600' :
                        analysis.stereo_width_analysis.mono_compatibility === 'good' ? 'bg-blue-600' :
                        analysis.stereo_width_analysis.mono_compatibility === 'fair' ? 'bg-yellow-600' : 'bg-red-600'
                      }`}>
                        {analysis.stereo_width_analysis.mono_compatibility}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Recommended:</span>
                      <span className="text-xs font-semibold text-cyan-400">{analysis.stereo_width_analysis.recommended_width}%</span>
                    </div>
                    {analysis.stereo_width_analysis.recommendations && (
                      <p className="text-xs text-slate-400 italic">{analysis.stereo_width_analysis.recommendations}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!analysis.applied && (
          <Button onClick={handleApply} disabled={applying} className="w-full bg-indigo-600">
            {applying ? 'Applying...' : 'Mark as Applied'}
          </Button>
        )}
        </CardContent>
        </Card>
        );
        }