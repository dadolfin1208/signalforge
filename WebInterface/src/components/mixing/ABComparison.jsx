import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, Volume2, Repeat } from 'lucide-react';

export default function ABComparison({ originalUrl, processedUrl, title = "A/B Comparison" }) {
  const [playing, setPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('A');
  const [volume, setVolume] = useState([80]);
  const [loop, setLoop] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioARef = useRef(null);
  const audioBRef = useRef(null);

  const handlePlayPause = () => {
    const activeAudio = currentTrack === 'A' ? audioARef.current : audioBRef.current;
    const inactiveAudio = currentTrack === 'A' ? audioBRef.current : audioARef.current;
    
    if (playing) {
      activeAudio.pause();
    } else {
      inactiveAudio.pause();
      activeAudio.currentTime = currentTime;
      activeAudio.play();
    }
    setPlaying(!playing);
  };

  const handleSwitch = () => {
    const currentAudio = currentTrack === 'A' ? audioARef.current : audioBRef.current;
    const nextAudio = currentTrack === 'A' ? audioBRef.current : audioARef.current;
    
    const wasPlaying = playing;
    const savedTime = currentAudio.currentTime;
    
    currentAudio.pause();
    nextAudio.currentTime = savedTime;
    
    if (wasPlaying) {
      nextAudio.play();
    }
    
    setCurrentTrack(currentTrack === 'A' ? 'B' : 'A');
  };

  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
  };

  const handleLoadedMetadata = (e) => {
    setDuration(e.target.duration);
  };

  const handleSeek = (value) => {
    const newTime = (value[0] / 100) * duration;
    setCurrentTime(newTime);
    if (audioARef.current) audioARef.current.currentTime = newTime;
    if (audioBRef.current) audioBRef.current.currentTime = newTime;
  };

  const handleVolumeChange = (value) => {
    setVolume(value);
    if (audioARef.current) audioARef.current.volume = value[0] / 100;
    if (audioBRef.current) audioBRef.current.volume = value[0] / 100;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <audio
          ref={audioARef}
          src={originalUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          loop={loop}
        />
        <audio
          ref={audioBRef}
          src={processedUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          loop={loop}
        />

        {/* Track Selection */}
        <div className="flex gap-2">
          <Button
            className={`flex-1 ${currentTrack === 'A' ? 'bg-indigo-600' : 'bg-slate-700'}`}
            onClick={() => currentTrack !== 'A' && handleSwitch()}
          >
            A - Original
          </Button>
          <Button
            className={`flex-1 ${currentTrack === 'B' ? 'bg-indigo-600' : 'bg-slate-700'}`}
            onClick={() => currentTrack !== 'B' && handleSwitch()}
          >
            B - Processed
          </Button>
        </div>

        {/* Progress Bar */}
        <div>
          <Slider
            value={[duration ? (currentTime / duration) * 100 : 0]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              setCurrentTime(0);
              if (audioARef.current) audioARef.current.currentTime = 0;
              if (audioBRef.current) audioBRef.current.currentTime = 0;
            }}
            className="border-slate-600"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            size="icon"
            onClick={handlePlayPause}
            className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700"
          >
            {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>

          <Button
            size="icon"
            variant="outline"
            onClick={() => setLoop(!loop)}
            className={`border-slate-600 ${loop ? 'bg-indigo-900' : ''}`}
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-slate-400" />
          <Slider
            value={volume}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-sm text-slate-400 w-12 text-right">{volume[0]}%</span>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <p className="text-sm text-slate-300 text-center">
            Currently playing: <span className="font-semibold text-white">{currentTrack === 'A' ? 'Original' : 'Processed'}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}