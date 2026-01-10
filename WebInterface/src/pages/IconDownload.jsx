import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function IconDownload() {
  const iconRef = useRef(null);

  const downloadIcon = async (size) => {
    if (!iconRef.current) return;

    const canvas = await html2canvas(iconRef.current, {
      backgroundColor: null,
      scale: size / 128,
    });

    const link = document.createElement('a');
    link.download = `signal-forge-icon-${size}x${size}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Signal Forge Icon Download</h1>
        
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Icon Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div 
              ref={iconRef}
              className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 flex items-center justify-center"
              style={{ width: '256px', height: '256px' }}
            >
              <div className="text-9xl">🎼</div>
            </div>

            <div className="text-center">
              <p className="text-slate-400 mb-4">Click below to download in different sizes</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={() => downloadIcon(16)} variant="outline" className="border-indigo-500 text-indigo-400">
                  <Download className="w-4 h-4 mr-2" />
                  16x16
                </Button>
                <Button onClick={() => downloadIcon(32)} variant="outline" className="border-indigo-500 text-indigo-400">
                  <Download className="w-4 h-4 mr-2" />
                  32x32
                </Button>
                <Button onClick={() => downloadIcon(48)} variant="outline" className="border-indigo-500 text-indigo-400">
                  <Download className="w-4 h-4 mr-2" />
                  48x48
                </Button>
                <Button onClick={() => downloadIcon(64)} variant="outline" className="border-indigo-500 text-indigo-400">
                  <Download className="w-4 h-4 mr-2" />
                  64x64
                </Button>
                <Button onClick={() => downloadIcon(128)} variant="outline" className="border-indigo-500 text-indigo-400">
                  <Download className="w-4 h-4 mr-2" />
                  128x128
                </Button>
                <Button onClick={() => downloadIcon(256)} className="bg-indigo-600 hover:bg-indigo-700">
                  <Download className="w-4 h-4 mr-2" />
                  256x256
                </Button>
                <Button onClick={() => downloadIcon(512)} className="bg-indigo-600 hover:bg-indigo-700">
                  <Download className="w-4 h-4 mr-2" />
                  512x512
                </Button>
                <Button onClick={() => downloadIcon(1024)} className="bg-purple-600 hover:bg-purple-700">
                  <Download className="w-4 h-4 mr-2" />
                  1024x1024
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">How to Create Program Icons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">For macOS (.icns)</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Download all sizes (16x16 through 1024x1024)</li>
                <li>Create a folder named <code className="bg-slate-900 px-2 py-1 rounded">icon.iconset</code></li>
                <li>Rename and place files: <code className="bg-slate-900 px-2 py-1 rounded">icon_16x16.png</code>, <code className="bg-slate-900 px-2 py-1 rounded">icon_32x32.png</code>, etc.</li>
                <li>Run: <code className="bg-slate-900 px-2 py-1 rounded">iconutil -c icns icon.iconset</code></li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">For Windows (.ico)</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Download 16x16, 32x32, 48x48, and 256x256</li>
                <li>Use a tool like ImageMagick: <code className="bg-slate-900 px-2 py-1 rounded">convert icon-16x16.png icon-32x32.png icon-48x48.png icon-256x256.png icon.ico</code></li>
                <li>Or use an online converter like <a href="https://convertio.co/png-ico/" target="_blank" className="text-indigo-400 hover:underline">convertio.co</a></li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">For Linux (.png)</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Download the 256x256 or 512x512 PNG</li>
                <li>Place in <code className="bg-slate-900 px-2 py-1 rounded">/usr/share/icons/hicolor/256x256/apps/</code></li>
                <li>Or use as-is in your application bundle</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}