import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Users, Plus, Trash2, Edit, CheckCircle, XCircle, Download, Upload, UserPlus, Mail } from 'lucide-react';
import { format, addMonths, addDays } from 'date-fns';
import { toast } from 'sonner';

export default function Admin() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'user'
  });
  const [formData, setFormData] = useState({
    email: '',
    subscription_type: 'yearly',
    duration_months: 12,
    notes: '',
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['all-subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date'),
  });

  const { data: downloadFiles = [] } = useQuery({
    queryKey: ['download-files'],
    queryFn: () => base44.entities.DownloadFile.list('-created_date'),
  });

  const [showVersionHistory, setShowVersionHistory] = useState(null);

  const [uploadingPlatform, setUploadingPlatform] = useState(null);

  const inviteUserMutation = useMutation({
    mutationFn: async ({ email, role }) => {
      await base44.users.inviteUser(email, role);
    },
    onSuccess: () => {
      toast.success('User invited successfully!');
      setShowInviteForm(false);
      setInviteData({ email: '', role: 'user' });
    },
    onError: (error) => {
      toast.error('Failed to invite user: ' + error.message);
    }
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (data) => {
      const startDate = new Date();
      const endDate = data.subscription_type === 'trial' 
        ? addDays(startDate, 3)
        : addMonths(startDate, data.duration_months);

      await base44.entities.Subscription.create({
        user_email: data.email,
        subscription_type: data.subscription_type,
        status: 'active',
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        duration_months: data.duration_months,
        is_admin_created: true,
        notes: data.notes,
      });

      // Invite user if they don't exist
      try {
        await base44.users.inviteUser(data.email, 'user');
      } catch (error) {
        // User might already exist, that's okay
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-subscriptions'] });
      toast.success('Subscription created successfully!');
      setShowCreateForm(false);
      setFormData({
        email: '',
        subscription_type: 'yearly',
        duration_months: 12,
        notes: '',
      });
    },
    onError: (error) => {
      toast.error('Failed to create subscription: ' + error.message);
    },
  });

  const deleteSubscriptionMutation = useMutation({
    mutationFn: (id) => base44.entities.Subscription.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-subscriptions'] });
      toast.success('Subscription deleted');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, currentStatus }) => 
      base44.entities.Subscription.update(id, { 
        status: currentStatus === 'active' ? 'cancelled' : 'active' 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-subscriptions'] });
      toast.success('Status updated');
    },
  });

  const [newVersionData, setNewVersionData] = useState({
    platform: null,
    version: '',
    requirements: '',
    file: null
  });

  const uploadInstallerMutation = useMutation({
    mutationFn: async ({ platform, file, version, requirements }) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(0);

      // Deactivate previous versions if marking this as active
      const existingFiles = downloadFiles.filter(d => d.platform === platform);
      for (const oldFile of existingFiles) {
        if (oldFile.is_active) {
          await base44.entities.DownloadFile.update(oldFile.id, { is_active: false });
        }
      }

      return base44.entities.DownloadFile.create({
        platform,
        version: version || '1.0.0',
        file_url,
        file_size: `${fileSizeMB} MB`,
        requirements: requirements || (platform === 'macOS' 
          ? 'macOS 11.0 or later (Intel & Apple Silicon)'
          : platform === 'Windows'
          ? 'Windows 10 (64-bit) or later'
          : 'Ubuntu 20.04+, Fedora 34+, or equivalent'),
        release_date: format(new Date(), 'MMMM yyyy'),
        is_active: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['download-files'] });
      toast.success('Installer uploaded successfully!');
      setUploadingPlatform(null);
      setNewVersionData({ platform: null, version: '', requirements: '', file: null });
    },
    onError: (error) => {
      toast.error('Upload failed: ' + error.message);
      setUploadingPlatform(null);
    },
  });

  const toggleActiveVersionMutation = useMutation({
    mutationFn: async ({ fileId, platform }) => {
      // Deactivate all versions for this platform
      const platformFiles = downloadFiles.filter(d => d.platform === platform);
      for (const file of platformFiles) {
        await base44.entities.DownloadFile.update(file.id, { is_active: false });
      }
      // Activate the selected version
      await base44.entities.DownloadFile.update(fileId, { is_active: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['download-files'] });
      toast.success('Active version updated');
    },
  });

  const deleteDownloadMutation = useMutation({
    mutationFn: (id) => base44.entities.DownloadFile.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['download-files'] });
      toast.success('Download file deleted');
    },
  });

  const handleFileUpload = async (platform, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewVersionData({ ...newVersionData, platform, file });
  };

  const submitNewVersion = () => {
    if (!newVersionData.file || !newVersionData.version) {
      toast.error('Please provide version number');
      return;
    }
    setUploadingPlatform(newVersionData.platform);
    uploadInstallerMutation.mutate(newVersionData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createSubscriptionMutation.mutate(formData);
  };

  const getDurationLabel = (type, months) => {
    if (type === 'trial') return '3 Days';
    if (type === 'custom' || type === 'charity') return `${months} Months`;
    if (type === 'yearly') return '12 Months';
    if (type === 'multi_year') return '24 Months';
    return `${months} Months`;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Manage subscriptions, downloads, and user access</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowInviteForm(!showInviteForm)}
            variant="outline"
            className="border-indigo-500 text-indigo-400"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Subscription
          </Button>
        </div>
      </div>

      {/* Invite User Form */}
      {showInviteForm && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Invite User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Email Address</Label>
                <Input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  placeholder="user@example.com"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Role</Label>
                <Select
                  value={inviteData.role}
                  onValueChange={(value) => setInviteData({ ...inviteData, role: value })}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  <strong>Note:</strong> Custom email domains like @signal-forge.online require DNS and email service configuration outside of this app.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => inviteUserMutation.mutate(inviteData)}
                  disabled={!inviteData.email || inviteUserMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {inviteUserMutation.isPending ? 'Sending...' : 'Send Invitation'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInviteForm(false);
                    setInviteData({ email: '', role: 'user' });
                  }}
                  className="border-slate-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download Management */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="w-5 h-5" />
            Download Files Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {['macOS', 'Linux', 'Windows'].map((platform) => {
              const platformVersions = downloadFiles.filter(d => d.platform === platform);
              const activeVersion = platformVersions.find(d => d.is_active);
              const isUploading = uploadingPlatform === platform;
              const hasNewFile = newVersionData.platform === platform && newVersionData.file;

              return (
                <div key={platform} className="border border-slate-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">{platform}</h3>
                    {platformVersions.length > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowVersionHistory(showVersionHistory === platform ? null : platform)}
                        className="text-xs text-indigo-400"
                      >
                        {platformVersions.length} version{platformVersions.length !== 1 ? 's' : ''}
                      </Button>
                    )}
                  </div>

                  {activeVersion && (
                    <div className="bg-slate-900/50 rounded p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-600">Active</Badge>
                        <span className="text-white text-sm font-semibold">{activeVersion.version}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        <div>Size: {activeVersion.file_size}</div>
                        <div>Released: {activeVersion.release_date}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(activeVersion.file_url);
                          toast.success('URL copied');
                        }}
                        className="w-full border-slate-600 text-xs"
                      >
                        Copy URL
                      </Button>
                    </div>
                  )}

                  {showVersionHistory === platform && platformVersions.length > 1 && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {platformVersions.filter(v => !v.is_active).map(version => (
                        <div key={version.id} className="bg-slate-900/30 rounded p-2 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-slate-300 font-semibold">{version.version}</span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleActiveVersionMutation.mutate({ fileId: version.id, platform })}
                                className="h-6 px-2 text-xs text-green-400"
                              >
                                Set Active
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteDownloadMutation.mutate(version.id)}
                                className="h-6 px-2 text-xs text-red-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-slate-500">{version.file_size} • {version.release_date}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!hasNewFile ? (
                    <div>
                      <Input
                        type="file"
                        accept={platform === 'macOS' ? '.dmg,.pkg' : platform === 'Windows' ? '.exe,.msi' : '.deb,.AppImage,.rpm'}
                        onChange={(e) => handleFileUpload(platform, e)}
                        disabled={isUploading}
                        className="bg-slate-900 border-slate-700 text-white file:bg-indigo-600 file:text-white text-xs"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs text-green-400">File selected: {newVersionData.file.name}</div>
                      <Input
                        placeholder="Version (e.g., 1.2.0)"
                        value={newVersionData.version}
                        onChange={(e) => setNewVersionData({ ...newVersionData, version: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white text-xs"
                      />
                      <Input
                        placeholder="Requirements (optional)"
                        value={newVersionData.requirements}
                        onChange={(e) => setNewVersionData({ ...newVersionData, requirements: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white text-xs"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={submitNewVersion}
                          disabled={isUploading}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-xs"
                        >
                          {isUploading ? 'Uploading...' : 'Upload'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setNewVersionData({ platform: null, version: '', requirements: '', file: null })}
                          className="border-slate-600 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              <strong>Version Management:</strong> Upload new versions while keeping old ones available. 
              Only the "Active" version appears on the Downloads page. Users can access version history if needed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Create Subscription Form */}
      {showCreateForm && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Create Custom Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-slate-300">User Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-slate-300">Subscription Type</Label>
                  <Select
                    value={formData.subscription_type}
                    onValueChange={(value) => {
                      const months = value === 'trial' ? 0 : value === 'yearly' ? 12 : value === 'multi_year' ? 24 : 6;
                      setFormData({ ...formData, subscription_type: value, duration_months: months });
                    }}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial (3 Days)</SelectItem>
                      <SelectItem value="yearly">Yearly (12 Months)</SelectItem>
                      <SelectItem value="multi_year">Multi-Year (24 Months)</SelectItem>
                      <SelectItem value="charity">Charity (Custom)</SelectItem>
                      <SelectItem value="custom">Custom Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(formData.subscription_type === 'custom' || formData.subscription_type === 'charity') && (
                  <div>
                    <Label htmlFor="duration" className="text-slate-300">Duration (Months)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="120"
                      required
                      value={formData.duration_months}
                      onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) })}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                )}

                <div className={formData.subscription_type === 'custom' || formData.subscription_type === 'charity' ? '' : 'md:col-span-2'}>
                  <Label htmlFor="notes" className="text-slate-300">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white"
                    placeholder="e.g., For charity auction, eBay sale, etc."
                    rows={3}
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
                  disabled={createSubscriptionMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {createSubscriptionMutation.isPending ? 'Creating...' : 'Create Subscription'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Subscriptions List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            All Subscriptions ({subscriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-900/50 rounded-lg gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">{sub.user_email}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      sub.subscription_type === 'trial' ? 'bg-blue-600' :
                      sub.subscription_type === 'charity' ? 'bg-green-600' :
                      sub.subscription_type === 'multi_year' ? 'bg-purple-600' :
                      'bg-indigo-600'
                    } text-white`}>
                      {sub.subscription_type}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      sub.status === 'active' ? 'bg-emerald-600' : 'bg-slate-600'
                    } text-white`}>
                      {sub.status}
                    </span>
                    {sub.is_admin_created && (
                      <span className="px-2 py-1 rounded text-xs bg-yellow-600 text-white font-semibold">
                        Admin Created
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-400">
                    {format(new Date(sub.start_date), 'MMM d, yyyy')} → {format(new Date(sub.end_date), 'MMM d, yyyy')}
                    <span className="mx-2">•</span>
                    {getDurationLabel(sub.subscription_type, sub.duration_months)}
                  </div>
                  {sub.notes && (
                    <p className="text-sm text-slate-500 mt-1">{sub.notes}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleStatusMutation.mutate({ id: sub.id, currentStatus: sub.status })}
                    className="border-slate-600"
                  >
                    {sub.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteSubscriptionMutation.mutate(sub.id)}
                    className="border-red-600 text-red-400 hover:bg-red-950"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {subscriptions.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No subscriptions yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}