import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Scissors, Download, Music } from 'lucide-react';
import { toast } from 'sonner';

export default function StemSeparator({ projectId, onSeparationComplete }) {
  const [processing, setProcessing] = useState(false);
  const [trackName, setTrackName] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      toast.info('Uploading audio file...');
      const result = await base44.integrations.Core.UploadFile({ file });
      setAudioUrl(result.file_url);
      setAudioFile(file);
      toast.success('File uploaded successfully!');
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSeparate = async () => {
    if (!trackName || !audioUrl) {
      toast.error('Please provide track name and upload audio');
      return;
    }

    setProcessing(true);
    try {
      toast.info('🎵 Starting AI stem separation... This may take 2-5 minutes.');
      
      const response = await base44.functions.invoke('separateStems', {
        project_id: projectId,
        track_name: trackName,
        source_file_url: audioUrl
      });

      if (response.data.success) {
        toast.success('✅ Stem separation complete! Individual stems are ready for mastering.');
        if (onSeparationComplete) onSeparationComplete(response.data);
        setTrackName('');
        setAudioFile(null);
        setAudioUrl(null);
      }
    } catch (error) {
      toast.error('Separation failed: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-pink-900/50 to-purple-900/50 border-pink-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Scissors className="w-5 h-5 text-pink-400" />
          AI Stem Separation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-pink-950/50 rounded-lg p-4 border border-pink-500/30">
          <div className="flex items-start gap-3">
            <Music className="w-5 h-5 text-pink-400 mt-0.5" />
            <div className="text-sm text-pink-200">
              <p className="mb-2">Isolate vocals, drums, bass, and instruments from your mixed track using AI</p>
              <ul className="text-xs text-pink-300 space-y-1 list-disc list-inside">
                <li>Separates into: Vocals, Drums, Bass, and Other instruments</li>
                <li>Each stem can be individually mastered afterward</li>
                <li>Processing takes 2-5 minutes depending on track length</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-slate-200">Track Name</Label>
          <Input
            value={trackName}
            onChange={(e) => setTrackName(e.target.value)}
            placeholder="e.g., My Song Mix"
            className="bg-slate-900 border-slate-700 text-white"
            disabled={processing || uploading}
          />
        </div>

        <div>
          <Label className="text-slate-200">Upload Mixed Audio</Label>
          <Input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            disabled={processing || uploading}
            className="bg-slate-900 border-slate-700 text-white file:bg-pink-600 file:text-white"
          />
          {audioFile && (
            <p className="text-xs text-green-400 mt-1">✓ {audioFile.name}</p>
          )}
        </div>

        <Button
          onClick={handleSeparate}
          disabled={processing || uploading || !trackName || !audioUrl}
          className="w-full bg-gradient-to-r from-pink-600 to-purple-600"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Separating Stems...
            </>
          ) : (
            <>
              <Scissors className="w-4 h-4 mr-2" />
              Separate into Stems
            </>
          )}
        </Button>

        <p className="text-xs text-slate-400 text-center">
          Powered by AI • Designed by Barry and Judah
        </p>
      </CardContent>
    </Card>
  );
}