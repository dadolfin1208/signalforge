import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code, Book, Zap, Database, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function APIDocumentation() {
  const downloadDocumentation = () => {
    const content = generateMarkdownDocumentation();
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'signal-forge-api-documentation.md';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    toast.success('Documentation downloaded!');
  };

  const generateMarkdownDocumentation = () => {
    return `# Signal Forge Native DAW - Web API Integration Guide

## Base URL
Your app's API base URL: \`https://[your-app-url].base44.com/api\`

## Authentication

### Initialize SDK
\`\`\`javascript
import { createClient } from '@base44/sdk';

const base44 = createClient({
  baseUrl: 'https://[your-app-url].base44.com',
  token: userSessionToken
});
\`\`\`

### Check Authentication
\`\`\`javascript
const user = await base44.auth.me();
const subscriptions = await base44.entities.Subscription.filter({ 
  user_email: user.email,
  status: 'active'
});
\`\`\`

## Projects API

### List Projects
\`\`\`javascript
const projects = await base44.entities.Project.list('-last_opened', 50);
\`\`\`

### Create Project
\`\`\`javascript
const project = await base44.entities.Project.create({
  name: 'My Song',
  sample_rate: '48000',
  bit_depth: '24',
  tempo: 120,
  tracks_count: 8
});
\`\`\`

## AI Mixing

### Request Mixing Analysis
\`\`\`javascript
await base44.functions.invoke('analyzeMixing', {
  project_id: projectId,
  track_name: 'Lead Vocals',
  stem_type: 'vocals',
  analysis_type: 'single_track',
  file_url: audioFileUrl
});
\`\`\`

### Get Analysis Results
\`\`\`javascript
const analyses = await base44.entities.MixingAnalysis.filter({ 
  project_id: projectId,
  track_name: 'Lead Vocals'
});
\`\`\`

## AI Mastering

### Request Mastering
\`\`\`javascript
await base44.functions.invoke('analyzeMastering', {
  project_id: projectId,
  track_name: 'Final Mix',
  mastering_type: 'full_mix',
  target_lufs: -14,
  file_url: audioFileUrl
});
\`\`\`

## Stem Separation

### Request Stem Separation
\`\`\`javascript
await base44.functions.invoke('separateStems', {
  project_id: projectId,
  track_name: 'Full Mix',
  source_file_url: mixFileUrl
});
\`\`\`

## File Management

### Upload Audio File
\`\`\`javascript
const { file_url } = await base44.integrations.Core.UploadFile({ 
  file: audioFile 
});
\`\`\`

## Best Practices

1. Cache results locally
2. Batch operations when possible
3. Compress audio for uploads
4. Poll every 3-5 seconds
5. Handle authentication errors

## Authentication Flow

1. User opens DAW → Check for stored token
2. If no token → Redirect to web login
3. After login → Callback with token
4. Store token securely
5. Use token for all API calls
`;
  };

  const sections = [
    {
      title: 'Authentication',
      icon: Code,
      color: 'text-indigo-400',
      endpoints: [
        { method: 'GET', path: 'base44.auth.me()', description: 'Get current user' },
        { method: 'GET', path: 'base44.auth.isAuthenticated()', description: 'Check auth status' },
      ]
    },
    {
      title: 'Projects',
      icon: Database,
      color: 'text-blue-400',
      endpoints: [
        { method: 'GET', path: 'base44.entities.Project.list()', description: 'List all projects' },
        { method: 'POST', path: 'base44.entities.Project.create(data)', description: 'Create project' },
        { method: 'PUT', path: 'base44.entities.Project.update(id, data)', description: 'Update project' },
        { method: 'DELETE', path: 'base44.entities.Project.delete(id)', description: 'Delete project' },
      ]
    },
    {
      title: 'AI Mixing',
      icon: Zap,
      color: 'text-purple-400',
      endpoints: [
        { method: 'POST', path: 'base44.functions.invoke("analyzeMixing", params)', description: 'Request mixing analysis' },
        { method: 'GET', path: 'base44.entities.MixingAnalysis.filter({ project_id })', description: 'Get analysis results' },
        { method: 'PUT', path: 'base44.entities.MixingAnalysis.update(id, { applied: true })', description: 'Mark as applied' },
      ]
    },
    {
      title: 'AI Mastering',
      icon: Zap,
      color: 'text-amber-400',
      endpoints: [
        { method: 'POST', path: 'base44.functions.invoke("analyzeMastering", params)', description: 'Request mastering analysis' },
        { method: 'GET', path: 'base44.entities.MasteringAnalysis.filter({ project_id })', description: 'Get mastering results' },
        { method: 'GET', path: 'base44.entities.MasteringPreset.list()', description: 'List presets' },
      ]
    },
    {
      title: 'Stem Separation',
      icon: Database,
      color: 'text-green-400',
      endpoints: [
        { method: 'POST', path: 'base44.functions.invoke("separateStems", params)', description: 'Request stem separation' },
        { method: 'GET', path: 'base44.entities.StemSeparation.filter({ project_id })', description: 'Get separation status' },
      ]
    },
    {
      title: 'File Management',
      icon: Upload,
      color: 'text-pink-400',
      endpoints: [
        { method: 'POST', path: 'base44.integrations.Core.UploadFile({ file })', description: 'Upload audio file' },
        { method: 'GET', path: 'fetch(fileUrl)', description: 'Download processed audio' },
      ]
    }
  ];

  const codeExamples = {
    auth: `import { createClient } from '@base44/sdk';

const base44 = createClient({
  baseUrl: 'https://[your-app].base44.com',
  token: userSessionToken
});

const user = await base44.auth.me();
const subscriptions = await base44.entities.Subscription.filter({ 
  user_email: user.email,
  status: 'active'
});`,

    project: `// Create a new project
const project = await base44.entities.Project.create({
  name: 'My Song',
  sample_rate: '48000',
  bit_depth: '24',
  tempo: 120,
  tracks_count: 8
});

// Update project
await base44.entities.Project.update(project.id, {
  tracks_count: 12,
  last_opened: new Date().toISOString()
});`,

    mixing: `// Upload audio
const { file_url } = await base44.integrations.Core.UploadFile({ 
  file: audioFile 
});

// Request mixing analysis
await base44.functions.invoke('analyzeMixing', {
  project_id: projectId,
  track_name: 'Lead Vocals',
  stem_type: 'vocals',
  analysis_type: 'single_track',
  file_url: file_url
});

// Get results
const analyses = await base44.entities.MixingAnalysis.filter({ 
  project_id: projectId,
  track_name: 'Lead Vocals'
});`,

    mastering: `// Request mastering
await base44.functions.invoke('analyzeMastering', {
  project_id: projectId,
  track_name: 'Final Mix',
  mastering_type: 'full_mix',
  target_lufs: -14,
  file_url: audioFileUrl
});

// Get results
const masterings = await base44.entities.MasteringAnalysis.filter({ 
  project_id: projectId
});

// Load preset
const presets = await base44.entities.MasteringPreset.filter({ 
  genre: 'pop' 
});`,

    stems: `// Request stem separation
await base44.functions.invoke('separateStems', {
  project_id: projectId,
  track_name: 'Full Mix',
  source_file_url: mixFileUrl
});

// Check status
const separations = await base44.entities.StemSeparation.filter({ 
  project_id: projectId
});

if (separations[0].status === 'completed') {
  const stems = separations[0].stems;
  // Download: stems.vocals, stems.drums, stems.bass, stems.other
}`
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-white mb-4">API Integration Guide</h1>
          <p className="text-xl text-slate-400">
            Connect your native Signal Forge DAW to the web backend
          </p>
        </div>
        <Button onClick={downloadDocumentation} className="bg-indigo-600 hover:bg-indigo-700">
          <Download className="w-4 h-4 mr-2" />
          Download as Markdown
        </Button>
      </div>

      {/* Quick Start */}
      <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Book className="w-5 h-5" />
            Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-slate-300 mb-2">Install the SDK:</p>
            <code className="text-green-400">npm install @base44/sdk</code>
          </div>
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-slate-300 mb-2">Initialize:</p>
            <pre className="text-sm text-slate-300 overflow-x-auto">
{codeExamples.auth}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* API Sections */}
      {sections.map((section, idx) => {
        const Icon = section.icon;
        return (
          <Card key={idx} className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${section.color}`} />
                <span className="text-white">{section.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {section.endpoints.map((endpoint, i) => (
                <div key={i} className="bg-slate-900/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-xs">
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm text-indigo-400">{endpoint.path}</code>
                  </div>
                  <p className="text-sm text-slate-400">{endpoint.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Code Examples */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-green-400" />
            Code Examples
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(codeExamples).slice(1).map(([key, code]) => (
            <div key={key}>
              <h3 className="text-white font-semibold mb-2 capitalize">{key} Example</h3>
              <pre className="bg-slate-900 rounded-lg p-4 text-sm text-slate-300 overflow-x-auto">
{code}
              </pre>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <span><strong>Cache results:</strong> Store analysis data locally to avoid repeated API calls</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <span><strong>Batch operations:</strong> Create multiple analyses at once when possible</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <span><strong>Compress audio:</strong> Use MP3/AAC for analysis uploads (smaller files)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <span><strong>Poll interval:</strong> Check status every 3-5 seconds, not more frequently</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <span><strong>Error handling:</strong> Always handle 401 (auth), 403 (subscription), and network errors</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Authentication Flow */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Authentication Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="text-white font-semibold mb-2">1. User Opens DAW</div>
              <p className="text-sm text-slate-400">Check if user has valid session token stored locally</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="text-white font-semibold mb-2">2. Redirect to Login</div>
              <p className="text-sm text-slate-400">Open browser: <code className="text-indigo-400">https://[your-app].base44.com</code></p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="text-white font-semibold mb-2">3. Handle Callback</div>
              <p className="text-sm text-slate-400">After login, redirect to: <code className="text-indigo-400">signalforge://auth?token=SESSION_TOKEN</code></p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="text-white font-semibold mb-2">4. Store Token</div>
              <p className="text-sm text-slate-400">Save session token securely in DAW's keychain/credential manager</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="text-white font-semibold mb-2">5. Initialize SDK</div>
              <p className="text-sm text-slate-400">Create Base44 client with stored token for all API calls</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}