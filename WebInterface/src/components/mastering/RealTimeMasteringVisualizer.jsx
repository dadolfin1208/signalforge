import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Play, Pause, Square, Activity, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RealTimeMasteringVisualizer({ audioFile, analysis }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [frequencyData, setFrequencyData] = useState(Array(64).fill(30));
  const [dynamicRange, setDynamicRange] = useState(0);
  const [peakLevel, setPeakLevel] = useState(-60);
  const [rmsLevel, setRmsLevel] = useState(-60);
  const [lufsEstimate, setLufsEstimate] = useState(analysis?.current_lufs || -20);
  
  // User adjustable parameters
  const [gainAdjust, setGainAdjust] = useState([analysis?.recommendations?.loudness_adjustment || 0]);
  const [limiterThreshold, setLimiterThreshold] = useState([analysis?.recommendations?.limiter_threshold || -1]);
  
  const audioRef = useRef(null);
  const analyzerRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const initializeAudioAnalyzer = async () => {
    if (!audioRef.current || audioContextRef.current) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaElementSource(audioRef.current);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 128;
      
      const gainNode = audioContext.createGain();
      gainNode.gain.value = Math.pow(10, gainAdjust[0] / 20);
      
      source.connect(gainNode);
      gainNode.connect(analyzer);
      analyzer.connect(audioContext.destination);
      analyzerRef.current = { analyzer, gainNode };

      visualize();
    } catch (error) {
      console.error('Audio analyzer initialization failed:', error);
    }
  };

  useEffect(() => {
    if (analyzerRef.current?.gainNode) {
      analyzerRef.current.gainNode.gain.value = Math.pow(10, gainAdjust[0] / 20);
    }
  }, [gainAdjust]);

  const visualize = () => {
    if (!analyzerRef.current) return;

    const bufferLength = analyzerRef.current.analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyzerRef.current.analyzer.getByteFrequencyData(dataArray);
      
      const normalizedData = Array.from(dataArray).map(value => (value / 255) * 100);
      setFrequencyData(normalizedData);

      // Calculate peak and RMS levels
      const peak = Math.max(...normalizedData);
      const rms = Math.sqrt(normalizedData.reduce((sum, val) => sum + val * val, 0) / normalizedData.length);
      
      setPeakLevel(-60 + (peak * 0.6));
      setRmsLevel(-60 + (rms * 0.6));
      
      // Estimate dynamic range
      const dr = peak - rms;
      setDynamicRange(dr * 0.2);
      
      // Estimate LUFS with gain adjustment
      const baseEstimate = analysis?.current_lufs || -20;
      setLufsEstimate(baseEstimate + gainAdjust[0]);
    };

    draw();
  };

  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    if (!audioContextRef.current) {
      await initializeAudioAnalyzer();
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getLufsColor = () => {
    if (lufsEstimate > -9) return 'text-red-500';
    if (lufsEstimate > -14) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <Card className="bg-slate-800/50 border-amber-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          Real-Time Mastering Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {audioFile && (
          <audio
            ref={audioRef}
            src={audioFile}
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
            onEnded={() => setIsPlaying(false)}
          />
        )}

        {/* Level Meters */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">Integrated</div>
            <div className={`text-2xl font-bold ${getLufsColor()}`}>
              {lufsEstimate.toFixed(1)}
            </div>
            <div className="text-xs text-slate-500">LUFS</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">Peak</div>
            <div className="text-2xl font-bold text-white">
              {peakLevel.toFixed(1)}
            </div>
            <div className="text-xs text-slate-500">dB</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">Dynamic</div>
            <div className="text-2xl font-bold text-white">
              {dynamicRange.toFixed(1)}
            </div>
            <div className="text-xs text-slate-500">dB</div>
          </div>
        </div>

        {/* Spectral Visualizer */}
        <div className="bg-slate-900 rounded-lg p-4">
          <div className="flex items-end justify-between gap-0.5 h-40 mb-2">
            {frequencyData.map((value, index) => {
              const adjustedValue = Math.min(100, value + (gainAdjust[0] * 2));
              const isClipping = adjustedValue > 95 || (peakLevel + gainAdjust[0]) > limiterThreshold[0];
              return (
                <motion.div
                  key={index}
                  className={`flex-1 rounded-t transition-colors ${
                    isClipping ? 'bg-red-500' : 
                    adjustedValue > 70 ? 'bg-yellow-500' : 
                    'bg-amber-500'
                  }`}
                  animate={{ height: `${adjustedValue}%` }}
                  transition={{ duration: 0.05 }}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>20 Hz</span>
            <span>Target: {analysis?.target_lufs} LUFS</span>
            <span>20 kHz</span>
          </div>
        </div>

        {/* Parameter Controls */}
        <div className="space-y-3 p-4 bg-amber-950/20 rounded-lg border border-amber-500/30">
          <div>
            <Label className="text-slate-200">
              Gain Adjustment: {gainAdjust[0] > 0 ? '+' : ''}{gainAdjust[0].toFixed(1)} dB
            </Label>
            <Slider
              value={gainAdjust}
              onValueChange={setGainAdjust}
              min={-12}
              max={12}
              step={0.1}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label className="text-slate-200">
              Limiter Threshold: {limiterThreshold[0].toFixed(1)} dB
            </Label>
            <Slider
              value={limiterThreshold}
              onValueChange={setLimiterThreshold}
              min={-6}
              max={0}
              step={0.1}
              className="mt-2"
            />
          </div>
        </div>

        {/* Transport Controls */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePlayPause}
              disabled={!audioFile}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              onClick={handleStop}
              disabled={!audioFile}
              variant="outline"
              className="border-slate-600"
            >
              <Square className="w-4 h-4" />
            </Button>
            <div className="flex-1 text-sm text-slate-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-amber-600 h-2 rounded-full transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>

        {!audioFile && (
          <div className="text-center py-6">
            <Volume2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Upload audio to preview mastering in real-time</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}