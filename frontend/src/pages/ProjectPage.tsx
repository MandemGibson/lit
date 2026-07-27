import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  RxArrowLeft,
  RxPlus,
  RxPerson,
  RxTrash,
  RxEyeOpen,
  RxEyeNone,
  RxCopy,
  RxCheck,
  RxPencil1,
  RxMagnifyingGlass,
  RxReload,
  RxLockClosed,
  RxCross2,
  RxActivityLog,
} from "react-icons/rx";
import DashboardLayout from "../components/Layout/DashboardLayout";
import InviteUserModal from "../components/InviteUserModal";
import ConfirmModal from "../components/ConfirmModal";
import axios from "axios";
import { BACKEND_URL } from "../configs/constants";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

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

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  // Environment variables state
  const [rawEnv, setRawEnv] = useState<string>("");
  const [variables, setVariables] = useState<EnvVariable[]>([]);
  const [savingEnv, setSavingEnv] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  interface HistoryItem {
    id: string;
    projectId: string;
    userId: string;
    userName: string;
    userEmail: string;
    timestamp: string;
    addedKeys: string[];
    modifiedKeys: string[];
    deletedKeys: string[];
  }

  // UI state
  const [activeTab, setActiveTab] = useState<"manager" | "raw" | "history">(
    "manager",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedKeys, setCopiedKeys] = useState<Record<string, boolean>>({});

  // New Variable Input
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isAddingInline, setIsAddingInline] = useState(false);

  // Inline editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingKey, setEditingKey] = useState("");
  const [editingValue, setEditingValue] = useState("");

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
    confirmText: "Confirm",
    isDestructive: false,
  });

  // Nav back if state is missing
  useEffect(() => {
    if (!project) {
      navigate("/dashboard");
    }
  }, [project, navigate]);

  // Parse .env raw string to key-value objects
  const parseEnv = (text: string): EnvVariable[] => {
    if (!text) return [];
    const lines = text.split("\n");
    const list: EnvVariable[] = [];
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex !== -1) {
        const k = trimmed.slice(0, eqIndex).trim();
        let v = trimmed.slice(eqIndex + 1).trim();
        // Remove surrounding quotes if matching
        if (
          (v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))
        ) {
          v = v.slice(1, -1);
        }
        list.push({ key: k, value: v });
      }
    });
    return list;
  };

  // Convert key-value objects back to .env string
  const serializeEnv = (list: EnvVariable[]): string => {
    return list.map((item) => `${item.key}=${item.value}`).join("\n");
  };

  // Fetch Decrypted Env Data
  const {
    data: fetchedEnv = "",
    isLoading: loadingEnv,
    refetch: fetchEnvData,
  } = useQuery<string>({
    queryKey: ["projectEnv", project?.id],
    queryFn: async () => {
      if (!project?.id) return "";
      const res = await axios.get(
        `${BACKEND_URL}/projects/pull-env-data/${project.id}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      );
      return res.data.data || "";
    },
    enabled: !!project?.id,
  });

  // Sync decrypted variables to local states for editing
  useEffect(() => {
    setRawEnv(fetchedEnv);
    setVariables(parseEnv(fetchedEnv));
  }, [fetchedEnv]);

  // Fetch Collaborators
  const {
    data: teamMembers = [],
    isLoading: loadingCollabs,
    refetch: fetchUsers,
  } = useQuery<TeamMember[]>({
    queryKey: ["projectCollabs", project?.id],
    queryFn: async () => {
      if (!project?.id) return [];
      const res = await axios.get(
        `${BACKEND_URL}/projects/collabs/${project.id}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      );
      return res.data.data || [];
    },
    enabled: !!project?.id,
  });

  // Fetch History / Audit Logs
  const {
    data: history = [],
    isLoading: loadingHistory,
    refetch: fetchHistory,
  } = useQuery<HistoryItem[]>({
    queryKey: ["projectHistory", project?.id],
    queryFn: async () => {
      if (!project?.id) return [];
      const res = await axios.get(
        `${BACKEND_URL}/projects/${project.id}/history`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      );
      return res.data.data || [];
    },
    enabled: !!project?.id && activeTab === "history",
  });

  // Save changes to backend
  const saveEnvironment = async (
    updatedVars: EnvVariable[],
    rawString?: string,
  ) => {
    setSavingEnv(true);
    const dataToSend =
      rawString !== undefined ? rawString : serializeEnv(updatedVars);
    try {
      await axios.put(
        `${BACKEND_URL}/projects/update-env-data/${project.id}/`,
        { envData: dataToSend },
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );
      fetchEnvData();
      setRawEnv(dataToSend);
      setVariables(parseEnv(dataToSend));
      setErrorMsg(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message || "Failed to save environment variables",
      );
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

    setNewKey("");
    setNewValue("");
    setIsAddingInline(false);
  };

  // Delete a secret
  const handleDeleteSecret = (keyToDelete: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Secret Key",
      description: `Are you sure you want to permanently delete the variable key "${keyToDelete}"? This action cannot be undone.`,
      confirmText: "Delete Key",
      isDestructive: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        const updated = variables.filter((v) => v.key !== keyToDelete);
        await saveEnvironment(updated);
        showToast(`Successfully deleted variable "${keyToDelete}"`, "success");
      },
    });
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
    showToast("Environment variables updated successfully!", "success");
  };

  // Delete Project
  const deleteProject = (projectId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Project",
      description: `WARNING: Deleting this project will permanently erase all environment variables, secrets, and collaborators associated with it. This action is irreversible.`,
      confirmText: "Delete Project",
      isDestructive: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          setDeletingProject(true);
          await axios.delete(`${BACKEND_URL}/projects/${projectId}`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          });
          showToast("Project deleted successfully", "success");
          navigate("/dashboard");
        } catch (error) {
          console.error(error);
          showToast("Failed to delete project", "error");
        } finally {
          setDeletingProject(false);
        }
      },
    });
  };

  // Remove Collaborator
  const removeCollab = (userId: string, userName?: string) => {
    const nameLabel = userName ? `"${userName}"` : "this collaborator";
    setConfirmModal({
      isOpen: true,
      title: "Remove Collaborator",
      description: `Are you sure you want to remove ${nameLabel} from the project? They will lose access to all environment configurations.`,
      confirmText: "Remove",
      isDestructive: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await axios.delete(
            `${BACKEND_URL}/projects/${project.id}/collabs/${userId}`,
            {
              headers: { Authorization: `Bearer ${user?.token}` },
            },
          );
          showToast("Collaborator removed successfully", "success");
          fetchUsers();
        } catch (error) {
          console.error(error);
          showToast("Failed to remove collaborator", "error");
        }
      },
    });
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
      v.value.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in text-[#f4f4f5]">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="p-2 rounded-xl bg-[#121215]/60 hover:bg-[#18181c]/60 text-zinc-400 hover:text-white transition-colors"
            >
              <RxArrowLeft className="h-4.5 w-4.5" />
            </Link>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  {project.projectName}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#121215]/80 text-cyan-400 border border-cyan-500/10">
                  <RxLockClosed className="h-2.5 w-2.5 mr-1" /> Encrypted
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500 font-medium">
                {project.description || "No description provided."}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-zinc-900 text-xs font-bold rounded-xl text-zinc-300 bg-[#121215]/40 hover:bg-[#18181c]/60 hover:text-white transition-all duration-200"
            >
              <RxPlus className="h-3.5 w-3.5 mr-1.5 text-zinc-550" />
              Invite Team
            </button>
            <button
              onClick={() => deleteProject(project.id)}
              disabled={deletingProject}
              className="inline-flex items-center px-4 py-2 btn-red-glossy text-white text-xs font-bold rounded-xl disabled:opacity-50"
            >
              {deletingProject ? (
                <>
                  <RxReload className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Project"
              )}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Secrets Card */}
          <div className="relative group overflow-hidden bg-[#121215]/40 rounded-2xl p-6 transition-all duration-300 shadow-sm">
            <div>
              <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase font-mono">
                Total Secrets
              </p>
              <p className="text-3xl font-extrabold text-white mt-2.5 tracking-tight">
                {variables.length}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-900/40 flex items-center justify-between text-[10px] text-zinc-500 font-semibold">
              <span>Stored in secure vault</span>
              <span className="font-mono text-cyan-400 bg-cyan-500/5 px-2 py-0.5 rounded-lg border border-cyan-500/10">
                AES-256
              </span>
            </div>
          </div>

          {/* Collaborators Card */}
          <div className="relative group overflow-hidden bg-[#121215]/40 rounded-2xl p-6 transition-all duration-300 shadow-sm">
            <div>
              <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase font-mono">
                Collaborators
              </p>
              <p className="text-3xl font-extrabold text-white mt-2.5 tracking-tight">
                {teamMembers ? teamMembers.length : "..."}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-900/40 flex items-center justify-between text-[10px] text-zinc-500 font-semibold">
              <span>Active members in team</span>
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                + Invite
              </button>
            </div>
          </div>

          {/* Sync Card */}
          <div className="relative group overflow-hidden bg-[#121215]/40 rounded-2xl p-6 transition-all duration-300 shadow-sm">
            <div>
              <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase font-mono">
                CLI Sync Status
              </p>
              <div className="flex items-baseline space-x-2 mt-2">
                <p className="text-3xl font-extrabold text-white tracking-tight">
                  Active
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-900/40 flex items-center justify-between text-[10px] text-zinc-500 font-semibold">
              <span>Real-time terminal sync</span>
              <span className="font-mono text-cyan-400 bg-cyan-500/5 px-2 py-0.5 rounded-lg border border-cyan-500/10">
                Connected
              </span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-950/20 border border-red-900/40 text-red-400 px-4 py-2.5 rounded-xl text-xs font-semibold animate-shake">
            {errorMsg}
          </div>
        )}

        {/* Variables Section Wrapper (Borderless) */}
        <div className="space-y-6">
          {/* View Mode Tabs bottom indicator style */}
          <div className="border-b border-slate-200 dark:border-zinc-900/60 pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex space-x-6">
              {[
                { id: "manager", label: "Secrets Manager" },
                { id: "raw", label: "Raw .env Editor" },
                { id: "history", label: "Audit Logs" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`text-xs font-bold transition-all relative pb-3 -mb-[13px] ${
                    activeTab === tab.id
                      ? "text-cyan-600 dark:text-cyan-400"
                      : "text-slate-500 hover:text-slate-800 dark:text-zinc-550 dark:hover:text-zinc-300"
                  }`}
                >
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-cyan-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Actions / Search */}
            {activeTab === "manager" && (
              <div className="flex flex-1 md:justify-end items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <RxMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search keys/values..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-4 py-1.5 border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#121215]/40 text-xs placeholder-slate-400 dark:placeholder-zinc-550 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/25 rounded-xl transition-all"
                  />
                </div>
                <button
                  onClick={() => setIsAddingInline(true)}
                  className="inline-flex items-center px-4 py-2 btn-cyan-glossy text-white text-xs font-bold rounded-xl"
                >
                  <RxPlus className="h-3.5 w-3.5 mr-1" /> Add Secret
                </button>
              </div>
            )}
          </div>

          {/* Section Body */}
          {loadingEnv ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <RxReload className="h-5 w-5 text-cyan-500 animate-spin" />
              <p className="text-xs text-slate-500 dark:text-zinc-500 font-semibold">
                Decrypting secure environment...
              </p>
            </div>
          ) : activeTab === "manager" ? (
            <div className="divide-y divide-slate-200 dark:divide-zinc-900/40">
              {/* Inline Add Secret Form */}
              {isAddingInline && (
                <form
                  onSubmit={handleAddSecret}
                  className="p-4 bg-slate-50 dark:bg-[#121215]/20 border border-slate-200 dark:border-zinc-900/60 rounded-2xl flex flex-col md:flex-row gap-3 mb-4 animate-fade-in"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="KEY (e.g. DATABASE_URL)"
                      required
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      className="block w-full px-3.5 py-2 border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#09090b] rounded-xl text-xs font-mono placeholder-slate-400 dark:placeholder-zinc-650 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                    />
                  </div>
                  <div className="flex-[2]">
                    <input
                      type="text"
                      placeholder="Value"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="block w-full px-3.5 py-2 border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#09090b] rounded-xl text-xs font-mono placeholder-slate-400 dark:placeholder-zinc-650 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="submit"
                      disabled={savingEnv}
                      className="inline-flex items-center px-4 py-2 btn-cyan-glossy text-white rounded-xl text-xs font-bold disabled:opacity-50"
                    >
                      {savingEnv ? (
                        <RxReload className="h-3 w-3 animate-spin mr-1.5" />
                      ) : (
                        <RxCheck className="h-3 w-3 mr-1.5" />
                      )}
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewKey("");
                        setNewValue("");
                        setIsAddingInline(false);
                      }}
                      className="text-slate-500 hover:text-slate-800 dark:text-zinc-550 dark:hover:text-white rounded-xl text-xs font-bold py-2 px-3"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Secrets Table Header */}
              {filteredVariables.length > 0 && (
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  <div className="col-span-5">Key</div>
                  <div className="col-span-5">Value</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
              )}

              {/* Secrets List Rows */}
              {filteredVariables.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-[#121215]/20 border border-slate-200 dark:border-zinc-900/60 rounded-2xl">
                  <RxLockClosed className="h-8 w-8 mx-auto text-slate-400 dark:text-zinc-700 mb-3" />
                  <h3 className="text-xs font-semibold text-slate-800 dark:text-white">
                    No environment secrets
                  </h3>
                  <p className="mt-1 text-[10px] text-slate-500 dark:text-zinc-550 max-w-xs mx-auto font-medium">
                    {searchQuery
                      ? "Adjust your search query."
                      : "Create a variable or paste bulk .env contents."}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setIsAddingInline(true)}
                      className="mt-4 inline-flex items-center px-4 py-2 text-xs font-bold text-white btn-cyan-glossy rounded-xl"
                    >
                      <RxPlus className="h-3.5 w-3.5 mr-1" /> Add Secret
                    </button>
                  )}
                </div>
              ) : (
                filteredVariables.map((variable) => {
                  const globalIdx = variables.findIndex(
                    (v) => v.key === variable.key,
                  );
                  const isEditing = editingIndex === globalIdx;
                  const isRevealed = revealedKeys[variable.key] || false;

                  return (
                    <div
                      key={variable.key}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 items-center hover:bg-slate-100/80 dark:hover:bg-[#121215]/20 transition-colors group"
                    >
                      {/* Key Column */}
                      <div className="col-span-1 md:col-span-5 flex items-center space-x-2">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingKey}
                            onChange={(e) => setEditingKey(e.target.value)}
                            className="block w-full px-3.5 py-1.5 text-xs font-mono border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#09090b] rounded-xl focus:outline-none focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10 text-slate-900 dark:text-white"
                          />
                        ) : (
                          <div className="flex items-center space-x-1.5 truncate">
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-[#f4f4f5]">
                              {variable.key}
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  variable.key,
                                  `k-${variable.key}`,
                                )
                              }
                              className="opacity-0 group-hover:opacity-100 text-slate-400 dark:text-zinc-550 hover:text-slate-700 dark:hover:text-white transition-opacity p-0.5"
                              title="Copy Key"
                            >
                              {copiedKeys[`k-${variable.key}`] ? (
                                <RxCheck className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
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
                            className="block w-full px-3.5 py-1.5 text-xs font-mono border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#09090b] rounded-xl focus:outline-none focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10 text-slate-900 dark:text-white"
                          />
                        ) : (
                          <div className="flex items-center justify-between w-full bg-slate-100/80 dark:bg-[#121215]/40 px-3.5 py-1.5 border border-slate-200 dark:border-zinc-900/60 rounded-xl">
                            <span className="font-mono text-xs text-slate-600 dark:text-zinc-400 select-all truncate max-w-[80%]">
                              {isRevealed ? variable.value : "••••••••••••••••"}
                            </span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => toggleReveal(variable.key)}
                                className="text-zinc-550 hover:text-white p-0.5"
                              >
                                {isRevealed ? (
                                  <RxEyeNone className="h-3.5 w-3.5" />
                                ) : (
                                  <RxEyeOpen className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    variable.value,
                                    `v-${variable.key}`,
                                  )
                                }
                                className="text-zinc-550 hover:text-white p-0.5"
                                title="Copy Value"
                              >
                                {copiedKeys[`v-${variable.key}`] ? (
                                  <RxCheck className="h-3.5 w-3.5 text-cyan-400" />
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
                              className="p-1.5 text-cyan-400 hover:bg-cyan-950/20 rounded-lg transition-colors"
                            >
                              <RxCheck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingIndex(null)}
                              className="p-1.5 text-zinc-550 hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                              <RxCross2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(globalIdx, variable)}
                              className="p-1.5 text-zinc-550 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
                              title="Edit Secret"
                            >
                              <RxPencil1 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSecret(variable.key)}
                              className="p-1.5 text-zinc-550 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
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
          ) : activeTab === "raw" ? (
            /* Raw Code Editor Textarea View */
            <div className="space-y-4 pt-2">
              <div className="rounded-xl overflow-hidden border border-zinc-900">
                <textarea
                  value={rawEnv}
                  onChange={(e) => setRawEnv(e.target.value)}
                  className="w-full h-80 p-5 bg-[#09090b]/80 text-[#f4f4f5] outline-none font-mono text-xs leading-relaxed resize-y focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                  placeholder={`# Configuration details\nAPI_KEY=your-api-key-here\nDB_HOST=localhost`}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-zinc-500 font-semibold font-mono">
                  Comment lines starting with `#` are ignored in visual manager.
                </p>
                <button
                  onClick={handleRawSave}
                  disabled={savingEnv}
                  className="inline-flex items-center px-4 py-2 btn-cyan-glossy text-white text-xs font-bold rounded-xl disabled:opacity-50"
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
          ) : (
            /* Audit Logs View */
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                  Project Change History
                </h3>
                <button
                  onClick={() => fetchHistory()}
                  disabled={loadingHistory}
                  className="inline-flex items-center px-3.5 py-1.5 border border-zinc-900 bg-[#121215]/40 text-zinc-400 rounded-xl text-xs font-bold hover:bg-zinc-900 transition-colors disabled:opacity-50"
                >
                  <RxReload
                    className={`h-3.5 w-3.5 mr-1.5 ${loadingHistory ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>

              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <RxReload className="h-5 w-5 text-cyan-500 animate-spin" />
                  <p className="text-xs text-zinc-550 font-semibold">
                    Loading activity timeline...
                  </p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-16 bg-[#121215]/20 rounded-2xl">
                  <RxActivityLog className="h-8 w-8 mx-auto text-zinc-700 mb-3" />
                  <h3 className="text-xs font-semibold text-white">
                    No activity logged
                  </h3>
                  <p className="mt-1 text-[10px] text-zinc-550 max-w-xs mx-auto font-medium">
                    Push variables from CLI or update them here to start
                    recording audit logs.
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 border-l border-slate-200 dark:border-zinc-900/60 space-y-4 py-1">
                  {history.map((item) => {
                    const dateStr = new Date(item.timestamp).toLocaleString(
                      undefined,
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      },
                    );

                    const hasChanges =
                      item.addedKeys.length > 0 ||
                      item.modifiedKeys.length > 0 ||
                      item.deletedKeys.length > 0;

                    return (
                      <div
                        key={item.id}
                        className="relative group flex items-center min-h-[24px]"
                      >
                        {/* Timeline node dot */}
                        <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white dark:bg-[#09090b] border-2 border-slate-300 dark:border-zinc-900 group-hover:border-cyan-500 transition-colors flex items-center justify-center">
                          <div className="h-1 w-1 rounded-full bg-slate-400 dark:bg-zinc-650 group-hover:bg-cyan-500 transition-colors" />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2 text-xs">
                          <div className="text-slate-600 dark:text-zinc-400 font-medium">
                            <span className="font-bold text-slate-900 dark:text-white mr-1.5">
                              {item.userName || item.userEmail.split("@")[0]}
                            </span>
                            <span className="text-slate-500 dark:text-zinc-500">
                              {!hasChanges ? (
                                "pushed environment details with no modifications"
                              ) : (
                                <>
                                  {item.addedKeys.length > 0 && (
                                    <>
                                      added{" "}
                                      {item.addedKeys.map((key, idx) => (
                                        <span
                                          key={key}
                                          className="font-mono text-slate-900 dark:text-white font-bold"
                                        >
                                          {key}
                                          {idx < item.addedKeys.length - 1 &&
                                            ", "}
                                        </span>
                                      ))}
                                      {item.modifiedKeys.length > 0 ||
                                      item.deletedKeys.length > 0
                                        ? " and "
                                        : ""}
                                    </>
                                  )}
                                  {item.modifiedKeys.length > 0 && (
                                    <>
                                      modified{" "}
                                      {item.modifiedKeys.map((key, idx) => (
                                        <span
                                          key={key}
                                          className="font-mono text-slate-900 dark:text-white font-bold"
                                        >
                                          {key}
                                          {idx < item.modifiedKeys.length - 1 &&
                                            ", "}
                                        </span>
                                      ))}
                                      {item.deletedKeys.length > 0
                                        ? " and "
                                        : ""}
                                    </>
                                  )}
                                  {item.deletedKeys.length > 0 && (
                                    <>
                                      deleted{" "}
                                      {item.deletedKeys.map((key, idx) => (
                                        <span
                                          key={key}
                                          className="font-mono text-slate-900 dark:text-white font-bold"
                                        >
                                          {key}
                                          {idx < item.deletedKeys.length - 1 &&
                                            ", "}
                                        </span>
                                      ))}
                                    </>
                                  )}
                                </>
                              )}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-600 font-mono flex-shrink-0">
                            {dateStr}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Team Members List (Borderless) */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center">
              <RxPerson className="h-4.5 w-4.5 mr-2 text-cyan-400 animate-pulse" />
              Project Collaborators
            </h2>
          </div>

          <div className="divide-y divide-zinc-900/40">
            {loadingCollabs ? (
              <div className="flex items-center justify-center py-10">
                <RxReload className="h-5 w-5 text-cyan-500 animate-spin" />
              </div>
            ) : !teamMembers || teamMembers.length === 0 ? (
              <div className="text-center py-16 bg-[#121215]/20 rounded-2xl text-xs text-zinc-550 font-medium">
                No collaborators found. Invite team members to join this
                project.
              </div>
            ) : (
              teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="py-4 flex items-center justify-between hover:bg-[#121215]/20 px-4 rounded-xl transition-colors"
                >
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 text-xs font-bold font-mono">
                      {member.email.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <p className="text-xs font-bold text-white">
                        {member.email.split("@")[0]}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  {member.email !== user?.email && (
                    <button
                      onClick={() => removeCollab(member.id, member.email)}
                      className="p-2 text-zinc-550 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-colors animate-fade-in"
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

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText}
        isDestructive={confirmModal.isDestructive}
      />
    </DashboardLayout>
  );
};

export default ProjectPage;
