import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Music4 } from 'lucide-react';
import { toast } from 'sonner';

export default function AIAssistant({ projectId, onAnalysisComplete, onAudioUpload }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [trackName, setTrackName] = useState('');
  const [analysisType, setAnalysisType] = useState('single_track');
  const [stemType, setStemType] = useState('vocals');
  const [uploading, setUploading] = useState(false);

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      toast.info('Uploading audio file...');
      const result = await base44.integrations.Core.UploadFile({ file });
      toast.success('Audio uploaded! Ready for real-time analysis');
      if (onAudioUpload) onAudioUpload(result.file_url);
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!trackName) {
      toast.error('Please enter a track name');
      return;
    }

    setAnalyzing(true);
    try {
      toast.info('Amadeus is analyzing your track...');
      
      const response = await base44.functions.invoke('analyzeMixing', {
        project_id: projectId,
        track_name: trackName,
        analysis_type: analysisType,
        stem_type: analysisType === 'single_track' ? stemType : 'full_mix'
      });

      if (response.data.success) {
        toast.success('Analysis complete!');
        if (onAnalysisComplete) onAnalysisComplete();
        setTrackName('');
      }
    } catch (error) {
      toast.error('Failed to analyze: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Music4 className="w-5 h-5 text-purple-400" />
          Ask Amadeus - Mixing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-purple-950/50 rounded-lg p-4 border border-purple-500/30">
          <div className="flex items-start gap-3">
            <Music4 className="w-5 h-5 text-purple-400 mt-0.5" />
            <p className="text-sm text-purple-200">
              Amadeus provides professional mixing recommendations for EQ, compression, and level balancing
            </p>
          </div>
        </div>

        <div>
          <Label className="text-slate-200">Track Name</Label>
          <Input
            value={trackName}
            onChange={(e) => setTrackName(e.target.value)}
            placeholder="e.g., Lead Vocals, Kick Drum"
            className="bg-slate-900 border-slate-700 text-white"
            disabled={analyzing}
          />
        </div>

        <div>
          <Label className="text-slate-200">Analysis Type</Label>
          <Select value={analysisType} onValueChange={setAnalysisType} disabled={analyzing}>
            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single_track">Single Track</SelectItem>
              <SelectItem value="full_mix">Full Mix</SelectItem>
              <SelectItem value="stem_group">Stem Group</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {analysisType === 'single_track' && (
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
          <Label className="text-slate-200">Upload Audio (Optional)</Label>
          <Input
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            disabled={uploading}
            className="bg-slate-900 border-slate-700 text-white file:bg-purple-600 file:text-white"
          />
          <p className="text-xs text-slate-400 mt-1">For real-time playback analysis</p>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={analyzing || !trackName}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
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
  );
}