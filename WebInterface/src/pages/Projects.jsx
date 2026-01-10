import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, Plus, Trash2, Clock, Settings, Sparkles, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import AIAssistant from '../components/mixing/AIAssistant';
import AnalysisResults from '../components/mixing/AnalysisResults';
import RealTimeAnalyzer from '../components/mixing/RealTimeAnalyzer';
import LiveFeedback from '../components/mixing/LiveFeedback';
import MixerView from '../components/mixing/MixerView';
import StemSeparator from '../components/mixing/StemSeparator';
import StemResults from '../components/mixing/StemResults';
import MasteringAssistant from '../components/mastering/MasteringAssistant';
import MasteringResults from '../components/mastering/MasteringResults';
import StemMasteringWorkflow from '../components/mastering/StemMasteringWorkflow';
import PresenceIndicator from '../components/collaboration/PresenceIndicator';
import ProjectChat from '../components/collaboration/ProjectChat';
import CollaborativeControls from '../components/collaboration/CollaborativeControls';

export default function Projects() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [liveFeedback, setLiveFeedback] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('mixing');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sample_rate: '48000',
    bit_depth: '24',
    tempo: 120,
    tracks_count: 16,
  });

  useEffect(() => {
    const loadUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date'),
  });

  const { data: analyses = [] } = useQuery({
    queryKey: ['mixing-analyses', selectedProject?.id],
    queryFn: () => {
      if (!selectedProject?.id) return [];
      return base44.entities.MixingAnalysis.filter({ project_id: selectedProject.id }, '-created_date');
    },
    enabled: !!selectedProject?.id,
  });

  const { data: separations = [] } = useQuery({
    queryKey: ['stem-separations', selectedProject?.id],
    queryFn: () => {
      if (!selectedProject?.id) return [];
      return base44.entities.StemSeparation.filter({ project_id: selectedProject.id }, '-created_date');
    },
    enabled: !!selectedProject?.id,
  });

  const { data: masterings = [] } = useQuery({
    queryKey: ['mastering-analyses', selectedProject?.id],
    queryFn: () => {
      if (!selectedProject?.id) return [];
      return base44.entities.MasteringAnalysis.filter({ project_id: selectedProject.id }, '-created_date');
    },
    enabled: !!selectedProject?.id,
  });

  const { data: collaborators = [] } = useQuery({
    queryKey: ['project-collaborators', selectedProject?.id],
    queryFn: async () => {
      if (!selectedProject?.id) return [];
      return await base44.entities.ProjectCollaboration.filter(
        { project_id: selectedProject.id },
        '-last_seen'
      );
    },
    enabled: !!selectedProject?.id,
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (selectedProject?.id && currentUser) {
      const updatePresence = async () => {
        const existing = collaborators.find(c => c.user_email === currentUser.email);
        
        if (existing) {
          await base44.entities.ProjectCollaboration.update(existing.id, {
            last_seen: new Date().toISOString(),
            current_view: currentView,
            status: 'active'
          });
        } else {
          await base44.entities.ProjectCollaboration.create({
            project_id: selectedProject.id,
            user_email: currentUser.email,
            user_name: currentUser.full_name,
            last_seen: new Date().toISOString(),
            current_view: currentView,
            status: 'active'
          });
        }
      };

      updatePresence();
      const interval = setInterval(updatePresence, 5000);

      return () => clearInterval(interval);
    }
  }, [selectedProject?.id, currentUser, currentView, collaborators]);

  const createProjectMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create({
      ...data,
      last_opened: new Date().toISOString(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully!');
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        sample_rate: '48000',
        bit_depth: '24',
        tempo: 120,
        tracks_count: 16,
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createProjectMutation.mutate(formData);
  };

  const handleAnalysisComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['mixing-analyses'] });
  };

  const handleAudioUpload = (url) => {
    setAudioFile(url);
  };

  const handleLiveFeedback = (feedback) => {
    setLiveFeedback(feedback);
  };

  const handleSeparationComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['stem-separations'] });
  };

  const handleAnalyzeStem = async (stemKey, stemLabel, stemUrl) => {
    try {
      toast.info('Analyzing ' + stemLabel + '...');
      const response = await base44.functions.invoke('analyzeMixing', {
        project_id: selectedProject.id,
        track_name: stemLabel,
        file_url: stemUrl,
        analysis_type: 'single_track'
      });
      if (response.data.success) {
        toast.success('Analysis complete!');
        handleAnalysisComplete();
      }
    } catch (error) {
      toast.error('Analysis failed');
    }
  };

  const handleMasteringComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['mastering-analyses'] });
  };

  if (selectedProject) {
    return (
      <div className="space-y-6">
        <div>
          <button onClick={() => setSelectedProject(null)} className="text-indigo-400 hover:text-indigo-300 mb-2">
            ← Back to Projects
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{selectedProject.name}</h1>
              <p className="text-slate-400">AI Mixing & Mastering Studio</p>
            </div>
            <PresenceIndicator collaborators={collaborators} />
          </div>
        </div>

        {currentUser && (
          <ProjectChat projectId={selectedProject.id} currentUser={currentUser} />
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <CollaborativeControls 
              label="AI Assistant" 
              collaborators={collaborators}
              currentSection="ai-assistant"
            >
              <div onFocus={() => setCurrentView('ai-assistant')}>
                <AIAssistant 
                  projectId={selectedProject.id} 
                  onAnalysisComplete={handleAnalysisComplete}
                  onAudioUpload={handleAudioUpload}
                />
              </div>
            </CollaborativeControls>

            <CollaborativeControls 
              label="Mastering" 
              collaborators={collaborators}
              currentSection="mastering"
            >
              <div onFocus={() => setCurrentView('mastering')}>
                <MasteringAssistant
                  projectId={selectedProject.id}
                  onAnalysisComplete={handleMasteringComplete}
                  onAudioUpload={handleAudioUpload}
                />
              </div>
            </CollaborativeControls>

            {separations.length > 0 && (
              <StemMasteringWorkflow
                projectId={selectedProject.id}
                separation={separations[0]}
                onComplete={handleMasteringComplete}
              />
            )}

            <CollaborativeControls 
              label="Stem Separator" 
              collaborators={collaborators}
              currentSection="stem-separator"
            >
              <div onFocus={() => setCurrentView('stem-separator')}>
                <StemSeparator 
                  projectId={selectedProject.id}
                  onSeparationComplete={handleSeparationComplete}
                />
              </div>
            </CollaborativeControls>

            <RealTimeAnalyzer audioFile={audioFile} onLiveFeedback={handleLiveFeedback} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <LiveFeedback feedback={liveFeedback} />
            
            <CollaborativeControls 
              label="Mixer" 
              collaborators={collaborators}
              currentSection="mixer"
            >
              <div onFocus={() => setCurrentView('mixer')}>
                <MixerView trackCount={selectedProject.tracks_count || 16} liveFeedback={liveFeedback} />
              </div>
            </CollaborativeControls>
            
            {masterings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                  <Crown className="w-5 h-5 text-amber-400" />
                  Mastering Analysis ({masterings.length})
                </h2>
                <div className="space-y-4">
                  {masterings.map((mastering) => (
                    <MasteringResults
                      key={mastering.id}
                      analysis={mastering}
                      audioFile={audioFile}
                      onUpdate={handleMasteringComplete}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {separations.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                  <Music className="w-5 h-5 text-pink-400" />
                  Separated Stems ({separations.length})
                </h2>
                <div className="space-y-4">
                  {separations.map((sep) => (
                    <StemResults 
                      key={sep.id} 
                      separation={sep}
                      onAnalyzeStem={handleAnalyzeStem}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Mixing Analysis Reports ({analyses.length})
              </h2>
              
              {analyses.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="py-12 text-center">
                    <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No saved analyses yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {analyses.map((analysis) => (
                    <AnalysisResults key={analysis.id} analysis={analysis} onUpdate={handleAnalysisComplete} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Projects</h1>
          <p className="text-slate-400">Manage your Signal Forge sessions</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Create New Project</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="name" className="text-slate-300">Project Name</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                      placeholder="My Awesome Track"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description" className="text-slate-300">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                      placeholder="Project notes..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sample_rate" className="text-slate-300">Sample Rate</Label>
                    <Select
                      value={formData.sample_rate}
                      onValueChange={(value) => setFormData({ ...formData, sample_rate: value })}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="44100">44.1 kHz</SelectItem>
                        <SelectItem value="48000">48 kHz</SelectItem>
                        <SelectItem value="88200">88.2 kHz</SelectItem>
                        <SelectItem value="96000">96 kHz</SelectItem>
                        <SelectItem value="192000">192 kHz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bit_depth" className="text-slate-300">Bit Depth</Label>
                    <Select
                      value={formData.bit_depth}
                      onValueChange={(value) => setFormData({ ...formData, bit_depth: value })}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16">16-bit</SelectItem>
                        <SelectItem value="24">24-bit</SelectItem>
                        <SelectItem value="32">32-bit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tempo" className="text-slate-300">Tempo (BPM)</Label>
                    <Input
                      id="tempo"
                      type="number"
                      min="40"
                      max="300"
                      value={formData.tempo}
                      onChange={(e) => setFormData({ ...formData, tempo: parseInt(e.target.value) })}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tracks_count" className="text-slate-300">Track Count</Label>
                    <Input
                      id="tracks_count"
                      type="number"
                      min="1"
                      max="128"
                      value={formData.tracks_count}
                      onChange={(e) => setFormData({ ...formData, tracks_count: parseInt(e.target.value) })}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="border-slate-600 text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createProjectMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group"
          >
            <Card className="bg-slate-800/50 border-slate-700 hover:border-indigo-500 transition-all h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mb-3">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteProjectMutation.mutate(project.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-950"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-white">{project.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.description && (
                  <p className="text-sm text-slate-400 line-clamp-2">{project.description}</p>
                )}
                <div className="space-y-1 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Settings className="w-3 h-3" />
                    {project.sample_rate}Hz • {project.bit_depth}-bit • {project.tempo} BPM
                  </div>
                  <div className="flex items-center gap-2">
                    <Music className="w-3 h-3" />
                    {project.tracks_count || 16} tracks
                  </div>
                  {project.last_opened && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      Last opened: {format(new Date(project.last_opened), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setSelectedProject(project)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Mixing
                  </Button>
                  <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    Open in DAW
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {projects.length === 0 && !showCreateForm && (
          <div className="md:col-span-2 lg:col-span-3">
            <Card className="bg-slate-800/50 border-slate-700 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Music className="w-16 h-16 text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
                <p className="text-slate-400 mb-6">Create your first Signal Forge project</p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}