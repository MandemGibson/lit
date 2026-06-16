import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  RxArrowLeft,
  RxPlus,
  RxPerson,
  RxCode,
  RxTrash,
  RxEyeOpen,
  RxEyeNone,
  RxCopy,
  RxCheck,
  RxPencil1,
  RxMagnifyingGlass,
  RxReader,
  RxMixerHorizontal,
  RxReload,
  RxLockClosed,
  RxCross2
} from 'react-icons/rx';
import DashboardLayout from '../components/Layout/DashboardLayout';
import InviteUserModal from '../components/InviteUserModal';
import axios from 'axios';
import { BACKEND_URL } from '../configs/constants';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

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
  const { showToast } = useToast();
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
      showToast(`Variable "${keyUpper}" already exists.`, "error");
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
      showToast(`Variable "${keyUpper}" already exists.`, "error");
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
    showToast('Environment variables updated successfully!', 'success');
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
      <div className="space-y-8 animate-fade-in text-[#f4f4f5]">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#27272a]">
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="p-1.5 rounded-full bg-[#18181b] border border-[#27272a] hover:bg-zinc-900 transition-colors shadow-sm"
            >
              <RxArrowLeft className="h-4.5 w-4.5 text-zinc-400" />
            </Link>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  {project.projectName}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-zinc-800 text-zinc-350 border border-zinc-700">
                  <RxLockClosed className="h-2.5 w-2.5 mr-1" /> Encrypted
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {project.description || 'No description provided.'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 border border-[#27272a] text-xs font-semibold rounded-full text-zinc-300 bg-[#18181b] hover:bg-zinc-900 transition-colors shadow-sm"
            >
              <RxPlus className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
              Invite Team
            </button>
            <button
              onClick={() => deleteProject(project.id)}
              disabled={deletingProject}
              className="inline-flex items-center px-3 py-1.5 border border-red-900/40 text-xs font-semibold rounded-full text-red-400 bg-red-950/10 hover:bg-red-950/20 transition-all shadow-sm disabled:opacity-50"
            >
              {deletingProject ? (
                <>
                  <RxReload className="h-3.5 w-3.5 mr-1.5 animate-spin" />
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
          {/* Secrets Card */}
          <div className="relative group overflow-hidden bg-gradient-to-b from-[#1c1c20] to-[#141417] border border-[#27272a] rounded-xl p-5 hover:border-zinc-700/80 transition-all duration-300 shadow-lg">
            {/* Soft radial glow in corner */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-blue-500/10 transition-all duration-300"></div>
            
            <div>
              <p className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
                Total Secrets
              </p>
              <p className="text-3xl font-extrabold text-white mt-2.5 tracking-tight">
                {variables.length}
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-[#27272a]/40 flex items-center justify-between text-[10px] text-zinc-500">
              <span>Stored in secure vault</span>
              <span className="font-mono text-blue-500/80 bg-blue-500/5 px-1.5 py-0.5 rounded-md border border-blue-500/10">AES-256</span>
            </div>
          </div>

          {/* Collaborators Card */}
          <div className="relative group overflow-hidden bg-gradient-to-b from-[#1c1c20] to-[#141417] border border-[#27272a] rounded-xl p-5 hover:border-zinc-700/80 transition-all duration-300 shadow-lg">
            {/* Soft radial glow in corner */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/10 transition-all duration-300"></div>
            
            <div>
              <p className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
                Collaborators
              </p>
              <p className="text-3xl font-extrabold text-white mt-2.5 tracking-tight">
                {teamMembers ? teamMembers.length : '...'}
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-[#27272a]/40 flex items-center justify-between text-[10px] text-zinc-500">
              <span>Active members in team</span>
              <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="text-purple-400 hover:text-purple-300 transition-colors font-medium hover:underline"
              >
                + Invite
              </button>
            </div>
          </div>

          {/* Sync Card */}
          <div className="relative group overflow-hidden bg-gradient-to-b from-[#1c1c20] to-[#141417] border border-[#27272a] rounded-xl p-5 hover:border-zinc-700/80 transition-all duration-300 shadow-lg">
            {/* Soft radial glow in corner */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-300"></div>
            
            <div>
              <p className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
                CLI Sync Status
              </p>
              <div className="flex items-baseline space-x-2 mt-2">
                <p className="text-3xl font-extrabold text-white tracking-tight">
                  Active
                </p>
                <span className="relative flex h-2 w-2 mb-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-[#27272a]/40 flex items-center justify-between text-[10px] text-zinc-500">
              <span>Real-time terminal sync</span>
              <span className="font-mono text-emerald-500/80 bg-emerald-500/5 px-1.5 py-0.5 rounded-md border border-emerald-500/10">Connected</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-950/20 border border-red-900 text-red-400 px-4 py-2.5 rounded-lg text-xs font-semibold animate-shake">
            {errorMsg}
          </div>
        )}

        {/* Variables Section */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl shadow-sm overflow-hidden">
          {/* Section Toolbar */}
          <div className="px-6 py-4 border-b border-[#27272a] bg-[#09090b]/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* View Mode Tabs */}
            <div className="flex bg-[#09090b] p-0.5 rounded-full w-fit border border-[#27272a]">
              <button
                onClick={() => setActiveTab('manager')}
                className={`flex items-center space-x-1.5 px-3 py-1 text-[11px] font-bold rounded-full transition-colors ${
                  activeTab === 'manager'
                    ? 'bg-[#27272a] text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <RxMixerHorizontal className="h-3.5 w-3.5" />
                <span>Secrets Manager</span>
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`flex items-center space-x-1.5 px-3 py-1 text-[11px] font-bold rounded-full transition-colors ${
                  activeTab === 'raw'
                    ? 'bg-[#27272a] text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <RxReader className="h-3.5 w-3.5" />
                <span>Raw .env Editor</span>
              </button>
            </div>

            {/* Actions / Search */}
            {activeTab === 'manager' && (
              <div className="flex flex-1 md:justify-end items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <RxMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search keys/values..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-9 pr-3 py-1 border border-[#27272a] rounded-full bg-[#09090b] text-xs placeholder-zinc-550 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => setIsAddingInline(true)}
                  className="inline-flex items-center px-3.5 py-1.5 bg-[#f4f4f5] hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-full shadow transition-colors"
                >
                  <RxPlus className="h-3.5 w-3.5 mr-1" /> Add Secret
                </button>
              </div>
            )}
          </div>

          {/* Section Body */}
          {loadingEnv ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <RxReload className="h-6 w-6 text-blue-550 animate-spin" />
              <p className="text-xs text-zinc-500">Decrypting secure environment...</p>
            </div>
          ) : activeTab === 'manager' ? (
            <div className="divide-y divide-[#27272a]">
              {/* Inline Add Secret Form */}
              {isAddingInline && (
                <form onSubmit={handleAddSecret} className="p-4 bg-[#09090b]/10 border-b border-[#27272a] flex flex-col md:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="KEY (e.g. DATABASE_URL)"
                      required
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      className="block w-full px-3 py-1.5 border border-[#27272a] bg-[#09090b] rounded-full text-xs font-mono placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-[2]">
                    <input
                      type="text"
                      placeholder="Value"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="block w-full px-3 py-1.5 border border-[#27272a] bg-[#09090b] rounded-full text-xs font-mono placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="submit"
                      disabled={savingEnv}
                      className="inline-flex items-center px-3.5 py-1.5 bg-[#f4f4f5] hover:bg-zinc-200 text-zinc-950 rounded-full text-xs font-bold shadow disabled:opacity-50"
                    >
                      {savingEnv ? <RxReload className="h-3 w-3 animate-spin mr-1.5" /> : <RxCheck className="h-3 w-3 mr-1.5" />}
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewKey('');
                        setNewValue('');
                        setIsAddingInline(false);
                      }}
                      className="inline-flex items-center px-2.5 py-1.5 border border-[#27272a] bg-[#18181b] text-zinc-400 rounded-full text-xs hover:bg-zinc-900 transition-colors"
                    >
                      <RxCross2 className="h-3 w-3" />
                    </button>
                  </div>
                </form>
              )}

              {/* Secrets Table Header */}
              {filteredVariables.length > 0 && (
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2.5 bg-[#09090b]/10 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  <div className="col-span-5">Key</div>
                  <div className="col-span-5">Value</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
              )}

              {/* Secrets List Rows */}
              {filteredVariables.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <RxLockClosed className="h-8 w-8 mx-auto text-zinc-650 mb-3" />
                  <h3 className="text-xs font-semibold text-white">No environment secrets</h3>
                  <p className="mt-1 text-[10px] text-zinc-550 max-w-xs mx-auto">
                    {searchQuery ? 'Adjust your search query.' : 'Create a variable or paste bulk .env contents.'}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setIsAddingInline(true)}
                      className="mt-4 inline-flex items-center px-3 py-1.5 text-xs font-bold text-zinc-950 bg-[#f4f4f5] rounded-full hover:bg-zinc-200 transition-colors"
                    >
                      <RxPlus className="h-3.5 w-3.5 mr-1" /> Add Secret
                    </button>
                  )}
                </div>
              ) : (
                filteredVariables.map((variable, idx) => {
                  const globalIdx = variables.findIndex((v) => v.key === variable.key);
                  const isEditing = editingIndex === globalIdx;
                  const isRevealed = revealedKeys[variable.key] || false;
                  
                  return (
                    <div
                      key={variable.key}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-3 items-center hover:bg-zinc-900/20 transition-colors group"
                    >
                      {/* Key Column */}
                      <div className="col-span-1 md:col-span-5 flex items-center space-x-2">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingKey}
                            onChange={(e) => setEditingKey(e.target.value)}
                            className="block w-full px-2 py-1 text-xs font-mono border border-[#27272a] bg-[#09090b] rounded focus:outline-none"
                          />
                        ) : (
                          <div className="flex items-center space-x-1.5 truncate">
                            <span className="font-mono text-xs font-bold text-[#f4f4f5]">
                              {variable.key}
                            </span>
                            <button
                              onClick={() => copyToClipboard(variable.key, `k-${variable.key}`)}
                              className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white transition-opacity p-0.5"
                              title="Copy Key"
                            >
                              {copiedKeys[`k-${variable.key}`] ? (
                                <RxCheck className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <RxCopy className="h-3.5 w-3.5" />
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
                            className="block w-full px-2 py-1 text-xs font-mono border border-[#27272a] bg-[#09090b] rounded focus:outline-none"
                          />
                        ) : (
                          <div className="flex items-center justify-between w-full bg-[#09090b]/40 px-3 py-1 border border-[#27272a] rounded-lg">
                            <span className="font-mono text-xs text-zinc-400 select-all truncate max-w-[80%]">
                              {isRevealed ? variable.value : '••••••••••••••••'}
                            </span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => toggleReveal(variable.key)}
                                className="text-zinc-500 hover:text-white p-0.5"
                              >
                                {isRevealed ? <RxEyeNone className="h-3.5 w-3.5" /> : <RxEyeOpen className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                onClick={() => copyToClipboard(variable.value, `v-${variable.key}`)}
                                className="text-zinc-500 hover:text-white p-0.5"
                                title="Copy Value"
                              >
                                {copiedKeys[`v-${variable.key}`] ? (
                                  <RxCheck className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                  <RxCopy className="h-3.5 w-3.5" />
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
                              className="p-1 text-emerald-500 hover:bg-emerald-950/20 rounded transition-colors"
                            >
                              <RxCheck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingIndex(null)}
                              className="p-1 text-zinc-500 hover:bg-zinc-800 rounded transition-colors"
                            >
                              <RxCross2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(globalIdx, variable)}
                              className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
                              title="Edit Secret"
                            >
                              <RxPencil1 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSecret(variable.key)}
                              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
                              title="Delete Secret"
                            >
                              <RxTrash className="h-3.5 w-3.5" />
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
            <div className="p-6 space-y-4 bg-[#09090b]/10">
              <div className="rounded-xl overflow-hidden border border-[#27272a]">
                <textarea
                  value={rawEnv}
                  onChange={(e) => setRawEnv(e.target.value)}
                  className="w-full h-80 p-5 bg-[#09090b] text-[#f4f4f5] outline-none font-mono text-xs leading-relaxed resize-y"
                  placeholder={`# Configuration details\nAPI_KEY=your-api-key-here\nDB_HOST=localhost`}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-zinc-500">
                  Comment lines starting with `#` are ignored in visual manager.
                </p>
                <button
                  onClick={handleRawSave}
                  disabled={savingEnv}
                  className="inline-flex items-center px-3.5 py-1.5 bg-blue-600 hover:bg-blue-705 text-white text-xs font-bold rounded-full shadow transition-colors disabled:opacity-50"
                >
                  {savingEnv ? (
                    <>
                      <RxReload className="h-3 w-3 animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <RxCheck className="h-3.5 w-3.5 mr-1.5" />
                      Save Raw Env
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Team Members List */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#27272a]">
            <h2 className="text-sm font-bold text-white flex items-center">
              <RxPerson className="h-4.5 w-4.5 mr-2 text-blue-500" />
              Project Collaborators
            </h2>
          </div>
          
          <div className="divide-y divide-[#27272a]">
            {loadingCollabs ? (
              <div className="flex items-center justify-center py-10">
                <RxReload className="h-5 w-5 text-zinc-550 animate-spin" />
              </div>
            ) : !teamMembers || teamMembers.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500">
                No collaborators found. Invite team members to join this project.
              </div>
            ) : (
              teamMembers.map((member) => (
                <div key={member.id} className="px-6 py-4 flex items-center justify-between hover:bg-zinc-900/10 transition-colors">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 text-xs font-bold">
                      {member.email.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <p className="text-xs font-semibold text-white">
                        {member.email.split('@')[0]}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  
                  {member.email !== user?.email && (
                    <button
                      onClick={() => removeCollab(member.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
                      title="Remove Collaborator"
                    >
                      <RxTrash className="h-4 w-4" />
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
