import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RealTimeAnalyzer({ audioFile, onLiveFeedback }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [frequencyData, setFrequencyData] = useState(Array(32).fill(50));
  const audioRef = useRef(null);
  const analyzerRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const initializeAudioAnalyzer = async () => {
    if (!audioRef.current || audioContextRef.current) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaElementSource(audioRef.current);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 64;
      
      source.connect(analyzer);
      analyzer.connect(audioContext.destination);
      analyzerRef.current = analyzer;

      visualize();
    } catch (error) {
      console.error('Audio analyzer initialization failed:', error);
    }
  };

  const visualize = () => {
    if (!analyzerRef.current) return;

    const bufferLength = analyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyzerRef.current.getByteFrequencyData(dataArray);
      
      const normalizedData = Array.from(dataArray).map(value => (value / 255) * 100);
      setFrequencyData(normalizedData);

      // Trigger live feedback at intervals
      if (isPlaying && Math.random() < 0.1) {
        const avgFrequency = normalizedData.reduce((a, b) => a + b) / normalizedData.length;
        if (avgFrequency > 40 && onLiveFeedback) {
          onLiveFeedback({
            time: currentTime,
            frequency: Math.max(...normalizedData),
            suggestion: generateLiveSuggestion(normalizedData)
          });
        }
      }
    };

    draw();
  };

  const generateLiveSuggestion = (data) => {
    const avgLow = data.slice(0, 8).reduce((a, b) => a + b) / 8;
    const avgMid = data.slice(8, 24).reduce((a, b) => a + b) / 16;
    const avgHigh = data.slice(24).reduce((a, b) => a + b) / 8;

    if (avgLow > 70) return { type: 'warning', message: 'Excessive low-end energy detected', frequency: '80-200 Hz' };
    if (avgMid < 30) return { type: 'info', message: 'Mid-range could use more presence', frequency: '1-4 kHz' };
    if (avgHigh > 65) return { type: 'warning', message: 'High frequencies may be harsh', frequency: '8-12 kHz' };
    return { type: 'success', message: 'Frequency balance looks good', frequency: 'Full spectrum' };
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

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          Real-Time Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audio Element */}
        {audioFile && (
          <audio
            ref={audioRef}
            src={audioFile}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          />
        )}

        {/* Spectral Visualizer */}
        <div className="bg-slate-900 rounded-lg p-4">
          <div className="flex items-end justify-between gap-1 h-32">
            {frequencyData.map((value, index) => (
              <motion.div
                key={index}
                className={`flex-1 rounded-t transition-colors ${
                  value > 70 ? 'bg-red-500' : value > 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                animate={{ height: `${value}%` }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>20 Hz</span>
            <span>1 kHz</span>
            <span>20 kHz</span>
          </div>
        </div>

        {/* Transport Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePlayPause}
              disabled={!audioFile}
              className="bg-indigo-600 hover:bg-indigo-700"
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

          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>

        {!audioFile && (
          <div className="text-center py-4">
            <p className="text-sm text-slate-400">Upload an audio file to enable real-time analysis</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}