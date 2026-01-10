import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HardDrive, Trash2, Download, Search, Music } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function FileManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { data: audioFiles = [] } = useQuery({
    queryKey: ['audio-files'],
    queryFn: () => base44.entities.AudioFile.list('-created_date', 1000),
  });

  const deleteFileMutation = useMutation({
    mutationFn: (id) => base44.entities.AudioFile.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audio-files'] });
      toast.success('File deleted');
    },
  });

  const filteredFiles = audioFiles.filter(file => {
   const matchesSearch = (file.file_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (file.user_email || '').toLowerCase().includes(searchTerm.toLowerCase());
   const matchesType = filterType === 'all' || file.file_type === filterType;
   return matchesSearch && matchesType;
  });

  const totalSize = audioFiles.reduce((sum, f) => sum + (f.file_size_mb || 0), 0);
  const filesByType = audioFiles.reduce((acc, f) => {
    acc[f.file_type] = (acc[f.file_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">File Management</h1>
        <p className="text-slate-400">Monitor and manage uploaded audio files</p>
      </div>

      {/* Storage Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium">Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-white">{audioFiles.length}</div>
              <Music className="w-8 h-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium">Total Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-white">{totalSize.toFixed(1)} GB</div>
              <HardDrive className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium">Original Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{filesByType.original || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium">Processed Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {(filesByType.mixed || 0) + (filesByType.mastered || 0) + (filesByType.stem || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by filename or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
                className={filterType === 'all' ? 'bg-indigo-600' : 'border-slate-600'}
              >
                All
              </Button>
              <Button
                variant={filterType === 'original' ? 'default' : 'outline'}
                onClick={() => setFilterType('original')}
                className={filterType === 'original' ? 'bg-indigo-600' : 'border-slate-600'}
              >
                Original
              </Button>
              <Button
                variant={filterType === 'mixed' ? 'default' : 'outline'}
                onClick={() => setFilterType('mixed')}
                className={filterType === 'mixed' ? 'bg-indigo-600' : 'border-slate-600'}
              >
                Mixed
              </Button>
              <Button
                variant={filterType === 'mastered' ? 'default' : 'outline'}
                onClick={() => setFilterType('mastered')}
                className={filterType === 'mastered' ? 'bg-indigo-600' : 'border-slate-600'}
              >
                Mastered
              </Button>
              <Button
                variant={filterType === 'stem' ? 'default' : 'outline'}
                onClick={() => setFilterType('stem')}
                className={filterType === 'stem' ? 'bg-indigo-600' : 'border-slate-600'}
              >
                Stems
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Audio Files ({filteredFiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{file.file_name || 'Unknown File'}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                      <span>{file.user_email || 'Unknown User'}</span>
                      <span>•</span>
                      <span>{(file.file_size_mb || 0).toFixed(2)} MB</span>
                      <span>•</span>
                      <span className="capitalize">{file.file_type}</span>
                      {file.duration_seconds && (
                        <>
                          <span>•</span>
                          <span>{file.duration_seconds.toFixed(0)}s</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{format(new Date(file.created_date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(file.file_url, '_blank')}
                    className="border-slate-600"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteFileMutation.mutate(file.id)}
                    className="border-red-600 text-red-400 hover:bg-red-950"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredFiles.length === 0 && (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No files found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}