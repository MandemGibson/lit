import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Shield,
  Users,
  Terminal,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit2,
  Search,
  FileText,
  Sliders,
  Loader2,
  Lock,
  Save,
  X,
  UserPlus
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import InviteUserModal from '../components/InviteUserModal';
import axios from 'axios';
import { BACKEND_URL } from '../configs/constants';
import { useAuth } from '../contexts/AuthContext';

interface TeamMember {
  id: string;
  email: string;
}

interface EnvVariable {
  key: string;
  value: string;
}

const ProjectPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const project = location.state?.project;

  const [teamMembers, setTeamMembers] = useState<TeamMember[] | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [loadingCollabs, setLoadingCollabs] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  
  // Environment variables state
  const [rawEnv, setRawEnv] = useState<string>('');
  const [variables, setVariables] = useState<EnvVariable[]>([]);
  const [loadingEnv, setLoadingEnv] = useState(false);
  const [savingEnv, setSavingEnv] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<'manager' | 'raw'>('manager');
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedKeys, setCopiedKeys] = useState<Record<string, boolean>>({});
  
  // New Variable Input
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isAddingInline, setIsAddingInline] = useState(false);

  // Inline editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingKey, setEditingKey] = useState('');
  const [editingValue, setEditingValue] = useState('');

  // Nav back if state is missing
  useEffect(() => {
    if (!project) {
      navigate('/dashboard');
    }
  }, [project, navigate]);

  // Parse .env raw string to key-value objects
  const parseEnv = (text: string): EnvVariable[] => {
    if (!text) return [];
    const lines = text.split('\n');
    const list: EnvVariable[] = [];
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex !== -1) {
        const k = trimmed.slice(0, eqIndex).trim();
        let v = trimmed.slice(eqIndex + 1).trim();
        // Remove surrounding quotes if matching
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        list.push({ key: k, value: v });
      }
    });
    return list;
  };

  // Convert key-value objects back to .env string
  const serializeEnv = (list: EnvVariable[]): string => {
    return list.map((item) => `${item.key}=${item.value}`).join('\n');
  };

  // Fetch Decrypted Env Data
  const fetchEnvData = async () => {
    if (!project?.id) return;
    setLoadingEnv(true);
    setErrorMsg(null);
    try {
      const res = await axios.get(`${BACKEND_URL}/projects/pull-env-data/${project.id}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const dataStr = res.data.data || '';
      setRawEnv(dataStr);
      setVariables(parseEnv(dataStr));
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to fetch environment variables');
    } finally {
      setLoadingEnv(false);
    }
  };

  // Fetch Collaborators
  const fetchUsers = async () => {
    if (!project?.id) return;
    setLoadingCollabs(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/projects/collabs/${project.id}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setTeamMembers(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCollabs(false);
    }
  };

  useEffect(() => {
    if (project?.id) {
      fetchEnvData();
      fetchUsers();
    }
  }, [project?.id]);

  // Save changes to backend
  const saveEnvironment = async (updatedVars: EnvVariable[], rawString?: string) => {
    setSavingEnv(true);
    const dataToSend = rawString !== undefined ? rawString : serializeEnv(updatedVars);
    try {
      await axios.put(
        `${BACKEND_URL}/projects/update-env-data/${project.id}/`,
        { envData: dataToSend },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setRawEnv(dataToSend);
      setVariables(parseEnv(dataToSend));
      setErrorMsg(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to save environment variables');
    } finally {
      setSavingEnv(false);
    }
  };

  // Add a secret key-value pair
  const handleAddSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    
    // Check if key already exists
    const keyUpper = newKey.trim().toUpperCase();
    if (variables.some((v) => v.key === keyUpper)) {
      alert(`Variable "${keyUpper}" already exists.`);
      return;
    }

    const updated = [...variables, { key: keyUpper, value: newValue }];
    await saveEnvironment(updated);
    
    setNewKey('');
    setNewValue('');
    setIsAddingInline(false);
  };

  // Delete a secret
  const handleDeleteSecret = async (keyToDelete: string) => {
    if (!window.confirm(`Are you sure you want to delete "${keyToDelete}"?`)) return;
    const updated = variables.filter((v) => v.key !== keyToDelete);
    await saveEnvironment(updated);
  };

  // Start Editing
  const startEdit = (index: number, variable: EnvVariable) => {
    setEditingIndex(index);
    setEditingKey(variable.key);
    setEditingValue(variable.value);
  };

  // Save Inline Edit
  const saveEdit = async (index: number) => {
    const keyUpper = editingKey.trim().toUpperCase();
    if (!keyUpper) return;

    // Check conflict with other keys
    if (variables.some((v, idx) => v.key === keyUpper && idx !== index)) {
      alert(`Variable "${keyUpper}" already exists.`);
      return;
    }

    const updated = [...variables];
    updated[index] = { key: keyUpper, value: editingValue };
    await saveEnvironment(updated);
    setEditingIndex(null);
  };

  // Raw textarea save
  const handleRawSave = async () => {
    await saveEnvironment([], rawEnv);
    alert('Environment variables updated successfully!');
  };

  // Delete Project
  const deleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this project? This action cannot be undone.')) return;
    try {
      setDeletingProject(true);
      await axios.delete(`${BACKEND_URL}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingProject(false);
    }
  };

  // Remove Collaborator
  const removeCollab = async (userId: string) => {
    if (!window.confirm('Remove this collaborator from the project?')) return;
    try {
      const res = await axios.delete(`${BACKEND_URL}/projects/${project.id}/collabs/${userId}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setTeamMembers(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Clipboard copy helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeys((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedKeys((prev) => ({ ...prev, [id]: false }));
    }, 1500);
  };

  // Toggle reveal helper
  const toggleReveal = (key: string) => {
    setRevealedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!project) return null;

  // Search filter
  const filteredVariables = variables.filter(
    (v) =>
      v.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200/60 dark:border-slate-800/60">
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-slate-400" />
            </Link>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {project.projectName}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30">
                  <Lock className="h-3 w-3 mr-1" /> Encrypted
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                {project.description || 'No description provided.'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-250 dark:border-slate-800 text-sm font-medium rounded-lg text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-850 transition-colors shadow-sm"
            >
              <UserPlus className="h-4 w-4 mr-2 text-gray-400" />
              Invite Team
            </button>
            <button
              onClick={() => deleteProject(project.id)}
              disabled={deletingProject}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {deletingProject ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Project'
              )}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-[#111827] border border-gray-200/60 dark:border-slate-800/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold tracking-wider text-gray-400 dark:text-slate-500 uppercase">
                  Variables Count
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                  {variables.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-gray-200/60 dark:border-slate-800/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold tracking-wider text-gray-400 dark:text-slate-500 uppercase">
                  Collaborators
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                  {teamMembers ? teamMembers.length : '...'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-gray-200/60 dark:border-slate-800/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-lg">
                <Terminal className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold tracking-wider text-gray-400 dark:text-slate-500 uppercase">
                  CLI Sync Status
                </p>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                  Active & Synced
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}

        {/* Variables Section */}
        <div className="bg-white dark:bg-[#111827] border border-gray-200/60 dark:border-slate-800/60 rounded-xl shadow-sm overflow-hidden">
          {/* Section Toolbar */}
          <div className="px-6 py-5 border-b border-gray-250 dark:border-slate-850 bg-gray-50/50 dark:bg-slate-900/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* View Mode Tabs */}
            <div className="flex bg-gray-100 dark:bg-slate-800 p-0.5 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('manager')}
                className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'manager'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Secrets Manager</span>
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'raw'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Raw .env Editor</span>
              </button>
            </div>

            {/* Actions / Search */}
            {activeTab === 'manager' && (
              <div className="flex flex-1 md:justify-end items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search keys/values..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm placeholder-gray-450 dark:placeholder-slate-500 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => setIsAddingInline(true)}
                  className="inline-flex items-center px-3.5 py-1.5 bg-blue-605 text-white hover:bg-blue-700 text-xs font-semibold rounded-lg shadow transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Secret
                </button>
              </div>
            )}
          </div>

          {/* Section Body */}
          {loadingEnv ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-500 dark:text-slate-400">Loading secure environment...</p>
            </div>
          ) : activeTab === 'manager' ? (
            <div className="divide-y divide-gray-200 dark:divide-slate-800">
              {/* Inline Add Secret Form */}
              {isAddingInline && (
                <form onSubmit={handleAddSecret} className="p-4 bg-blue-50/20 dark:bg-blue-950/10 border-b border-blue-100 dark:border-blue-900/30 flex flex-col md:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="KEY (e.g. DATABASE_URL)"
                      required
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-750 bg-white dark:bg-slate-900 rounded-lg text-sm font-mono placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex-[2]">
                    <input
                      type="text"
                      placeholder="Value"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-750 bg-white dark:bg-slate-900 rounded-lg text-sm font-mono placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="submit"
                      disabled={savingEnv}
                      className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow hover:bg-emerald-750 transition-colors disabled:opacity-50"
                    >
                      {savingEnv ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Save className="h-3 w-3 mr-1.5" />}
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewKey('');
                        setNewValue('');
                        setIsAddingInline(false);
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-750 dark:text-slate-350 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </form>
              )}

              {/* Secrets Table Header */}
              {filteredVariables.length > 0 && (
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-slate-900/20 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  <div className="col-span-5">Key</div>
                  <div className="col-span-5">Value</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
              )}

              {/* Secrets List Rows */}
              {filteredVariables.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <Lock className="h-10 w-10 mx-auto text-gray-300 dark:text-slate-700 mb-3" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No environment secrets</h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400 max-w-xs mx-auto">
                    {searchQuery ? 'Adjust your search queries to find keys.' : 'Create a secret key-value or paste your raw .env contents.'}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setIsAddingInline(true)}
                      className="mt-4 inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-750 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Secret
                    </button>
                  )}
                </div>
              ) : (
                filteredVariables.map((variable) => {
                  const globalIdx = variables.findIndex((v) => v.key === variable.key);
                  const isEditing = editingIndex === globalIdx;
                  const isRevealed = revealedKeys[variable.key] || false;
                  
                  return (
                    <div
                      key={variable.key}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 items-center hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors group"
                    >
                      {/* Key Column */}
                      <div className="col-span-1 md:col-span-5 flex items-center space-x-2">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingKey}
                            onChange={(e) => setEditingKey(e.target.value)}
                            className="block w-full px-2 py-1 text-sm font-mono border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        ) : (
                          <div className="flex items-center space-x-1.5 truncate">
                            <span className="font-mono text-sm font-bold text-gray-900 dark:text-slate-100 tracking-tight">
                              {variable.key}
                            </span>
                            <button
                              onClick={() => copyToClipboard(variable.key, `k-${variable.key}`)}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-opacity p-1"
                              title="Copy Key"
                            >
                              {copiedKeys[`k-${variable.key}`] ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Value Column */}
                      <div className="col-span-1 md:col-span-5 flex items-center space-x-2">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="block w-full px-2 py-1 text-sm font-mono border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        ) : (
                          <div className="flex items-center justify-between w-full bg-gray-50 dark:bg-slate-900/60 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-slate-800">
                            <span className="font-mono text-sm text-gray-600 dark:text-slate-300 select-all truncate max-w-[80%]">
                              {isRevealed ? variable.value : '••••••••••••••••'}
                            </span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => toggleReveal(variable.key)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-0.5"
                              >
                                {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                onClick={() => copyToClipboard(variable.value, `v-${variable.key}`)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-0.5"
                                title="Copy Value"
                              >
                                {copiedKeys[`v-${variable.key}`] ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action column */}
                      <div className="col-span-1 md:col-span-2 flex items-center justify-end space-x-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(globalIdx)}
                              className="p-1 text-emerald-650 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded transition-colors"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingIndex(null)}
                              className="p-1 text-gray-450 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(globalIdx, variable)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors"
                              title="Edit Secret"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSecret(variable.key)}
                              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                              title="Delete Secret"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Raw Code Editor Textarea View */
            <div className="p-6 space-y-4">
              <div className="rounded-xl overflow-hidden border border-gray-250 dark:border-slate-800">
                <textarea
                  value={rawEnv}
                  onChange={(e) => setRawEnv(e.target.value)}
                  className="w-full h-80 p-5 bg-[#0B0F19] text-emerald-400 dark:text-emerald-350 outline-none font-mono text-sm leading-relaxed resize-y shadow-inner"
                  placeholder={`# Database configuration\nDATABASE_URL=postgresql://user:pass@localhost:5432/mydb\n\n# Security keys\nAPI_SECRET_KEY=super_secure_api_key_string\nJWT_SECRET=auth_json_web_token_secret`}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  Standard `.env` format. Comment lines starting with `#` are ignored in visual manager.
                </p>
                <button
                  onClick={handleRawSave}
                  disabled={savingEnv}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white text-xs font-semibold rounded-lg shadow transition-colors disabled:opacity-50"
                >
                  {savingEnv ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5 mr-1.5" />
                      Save Raw Env
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Team Members List */}
        <div className="bg-white dark:bg-[#111827] border border-gray-200/60 dark:border-slate-800/60 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-850">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <Users className="h-5 w-5 mr-2.5 text-blue-500" />
              Project Collaborators
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-slate-800">
            {loadingCollabs ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
              </div>
            ) : !teamMembers || teamMembers.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500 dark:text-slate-400">
                No collaborators found. Invite team members to this project.
              </div>
            ) : (
              teamMembers.map((member) => (
                <div key={member.id} className="px-6 py-4.5 flex items-center justify-between hover:bg-gray-50/30 dark:hover:bg-slate-800/10 transition-colors">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                      {member.email.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {member.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  
                  {/* Delete button (owner cannot delete himself/herself, but for mockup we allow deleting other collaborators) */}
                  {member.email !== user?.email && (
                    <button
                      onClick={() => removeCollab(member.id)}
                      className="p-2 text-gray-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                      title="Remove Collaborator"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          fetchUsers(); // Refresh after modal closed
        }}
        projectId={project.id}
      />
    </DashboardLayout>
  );
};

export default ProjectPage;

