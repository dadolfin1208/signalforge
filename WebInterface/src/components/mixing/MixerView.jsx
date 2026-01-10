import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Volume2, Gauge, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MixerView({ tracks = [], trackCount = 16, liveFeedback }) {
  const defaultTracks = tracks.length > 0 ? tracks : Array.from({ length: trackCount }, (_, i) => ({
    name: `Track ${i + 1}`,
    level: 75,
    pan: 0
  }));

  const getTrackAlert = (trackName) => {
    if (liveFeedback?.suggestion?.message.toLowerCase().includes(trackName.toLowerCase())) {
      return liveFeedback.suggestion.type;
    }
    return null;
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-indigo-400" />
          Mixer View
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-4 min-w-min">
          {defaultTracks.map((track, index) => {
            const alert = getTrackAlert(track.name);
            return (
              <motion.div
                key={index}
                className={`bg-slate-900 rounded-lg p-3 border-2 transition-colors ${
                  alert === 'warning' ? 'border-yellow-500' : 
                  alert === 'info' ? 'border-blue-500' : 
                  'border-slate-700'
                }`}
                animate={alert ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {/* Level Meter */}
                <div className="mb-3">
                  <div className="h-32 bg-slate-800 rounded relative overflow-hidden">
                    <motion.div
                      className={`absolute bottom-0 w-full rounded ${
                        track.level > 85 ? 'bg-red-500' : 
                        track.level > 70 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      animate={{ height: `${track.level}%` }}
                      transition={{ duration: 0.2 }}
                    />
                    <div className="absolute inset-0 flex flex-col justify-between p-1">
                      {[0, -6, -12, -18, -24].map(db => (
                        <div key={db} className="text-[8px] text-slate-500">
                          {db}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Track Name */}
                <div className="text-center mb-2">
                  <div className="text-xs font-semibold text-white truncate">
                    {track.name}
                  </div>
                  {alert && (
                    <div className="flex justify-center mt-1">
                      {alert === 'warning' ? (
                        <TrendingUp className="w-3 h-3 text-yellow-500" />
                      ) : (
                        <Gauge className="w-3 h-3 text-blue-500" />
                      )}
                    </div>
                  )}
                </div>

                {/* Fader */}
                <div className="flex justify-center mb-2">
                  <Slider
                    value={[track.level]}
                    max={100}
                    step={1}
                    orientation="vertical"
                    className="h-16"
                  />
                </div>

                {/* Level Display */}
                <div className="text-center text-xs text-slate-400">
                  {track.level > 0 ? '+' : ''}{(track.level - 75).toFixed(0)} dB
                </div>
              </motion.div>
            );
          })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}