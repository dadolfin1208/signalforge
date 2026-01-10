import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2, Music4 } from 'lucide-react';
import { toast } from 'sonner';
import PresetManager from './PresetManager';

export default function MasteringAssistant({ projectId, onAnalysisComplete, onAudioUpload }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [trackName, setTrackName] = useState('');
  const [masteringType, setMasteringType] = useState('full_mix');
  const [stemType, setStemType] = useState('vocals');
  const [targetLufs, setTargetLufs] = useState([-14]);
  const [uploading, setUploading] = useState(false);

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      toast.info('Uploading audio file...');
      const result = await base44.integrations.Core.UploadFile({ file });
      toast.success('Audio uploaded!');
      if (onAudioUpload) onAudioUpload(result.file_url);
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleApplyPreset = (preset) => {
    setTargetLufs([preset.target_lufs || -14]);
    toast.success(`Applied ${preset.name} - ${preset.target_lufs} LUFS target`);
  };

  const handleAnalyze = async () => {
    if (!trackName) {
      toast.error('Please enter a track name');
      return;
    }

    setAnalyzing(true);
    try {
      toast.info('Amadeus is analyzing for mastering...');
      
      const response = await base44.functions.invoke('analyzeMastering', {
        project_id: projectId,
        track_name: trackName,
        mastering_type: masteringType,
        stem_type: masteringType === 'stem' ? stemType : null,
        target_lufs: targetLufs[0],
        preset_name: currentSettings.preset_name || null
      });

      if (response.data.success) {
        toast.success('Mastering analysis complete!');
        if (onAnalysisComplete) onAnalysisComplete();
        setTrackName('');
      }
    } catch (error) {
      toast.error('Failed to analyze: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const currentSettings = {
    target_lufs: targetLufs[0],
    limiter_threshold: -1,
    limiter_release: 50,
    compression_ratio: "2:1",
    stereo_width: 100,
    track_name: trackName
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 border-amber-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Music4 className="w-5 h-5 text-amber-400" />
            Ask Amadeus - Mastering
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="bg-amber-950/50 rounded-lg p-4 border border-amber-500/30">
          <div className="flex items-start gap-3">
            <Music4 className="w-5 h-5 text-amber-400 mt-0.5" />
            <p className="text-sm text-amber-200">
              Amadeus provides professional mastering analysis for loudness, tonal balance, and dynamic range
            </p>
          </div>
        </div>

        <div>
          <Label className="text-slate-200">Track Name</Label>
          <Input
            value={trackName}
            onChange={(e) => setTrackName(e.target.value)}
            placeholder="e.g., Final Mix, Master Vocals"
            className="bg-slate-900 border-slate-700 text-white"
            disabled={analyzing}
          />
        </div>

        <div>
          <Label className="text-slate-200">Mastering Type</Label>
          <Select value={masteringType} onValueChange={setMasteringType} disabled={analyzing}>
            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_mix">Full Mix</SelectItem>
              <SelectItem value="stem">Individual Stem</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {masteringType === 'stem' && (
          <div>
            <Label className="text-slate-200">Stem Type</Label>
            <Select value={stemType} onValueChange={setStemType} disabled={analyzing}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vocals">🎤 Vocals</SelectItem>
                <SelectItem value="drums">🥁 Drums</SelectItem>
                <SelectItem value="bass">🎸 Bass</SelectItem>
                <SelectItem value="guitar">🎸 Guitar</SelectItem>
                <SelectItem value="keys">🎹 Keys</SelectItem>
                <SelectItem value="other">🎼 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label className="text-slate-200">Target Loudness: {targetLufs[0]} LUFS</Label>
          <Slider
            value={targetLufs}
            onValueChange={setTargetLufs}
            min={-23}
            max={-8}
            step={1}
            className="mt-2"
            disabled={analyzing}
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>-23 (Quiet)</span>
            <span>-14 (Streaming)</span>
            <span>-8 (Loud)</span>
          </div>
        </div>

        <div>
          <Label className="text-slate-200">Upload Audio (Optional)</Label>
          <Input
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            disabled={uploading}
            className="bg-slate-900 border-slate-700 text-white file:bg-amber-600 file:text-white"
          />
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={analyzing || !trackName}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Music4 className="w-4 h-4 mr-2" />
              Ask Amadeus
            </>
          )}
        </Button>
        </CardContent>
      </Card>

      <PresetManager 
        currentSettings={currentSettings}
        onApplyPreset={handleApplyPreset}
      />
    </>
  );
}