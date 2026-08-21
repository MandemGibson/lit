import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
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
  RxChevronDown,
} from "react-icons/rx";
import DashboardLayout from "../components/Layout/DashboardLayout";
import InviteUserModal from "../components/InviteUserModal";
import AddVariableModal from "../components/AddVariableModal";
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
  const queryClient = useQueryClient();
  const project = location.state?.project;

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  // Environment data state
  const [variables, setVariables] = useState<EnvVariable[]>([]);
  const [rawEnv, setRawEnv] = useState<string>("");
  const [savingEnv, setSavingEnv] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Environment & Scope Multi-Env Monorepo state
  const [selectedEnv, setSelectedEnv] = useState<"development" | "staging" | "production">("development");
  const [selectedScope, setSelectedScope] = useState<string>("default");
  const [scopes, setScopes] = useState<string[]>(["default", "client", "server"]);
  const [isAddingScope, setIsAddingScope] = useState(false);
  const [newScopeInput, setNewScopeInput] = useState("");
  const [isEnvDropdownOpen, setIsEnvDropdownOpen] = useState(false);
  const [isScopeDropdownOpen, setIsScopeDropdownOpen] = useState(false);

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
    environment?: string;
    scope?: string;
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

  // Reset editing/revealed state when switching environment or scope
  useEffect(() => {
    setEditingIndex(null);
    setRevealedKeys({});
    setIsAddingInline(false);
    setErrorMsg(null);
  }, [selectedEnv, selectedScope]);

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
    isFetching: fetchingEnv,
    refetch: fetchEnvData,
  } = useQuery<string>({
    queryKey: ["projectEnv", project?.id, selectedEnv, selectedScope],
    queryFn: async ({ queryKey }) => {
      const [, projId, env, scope] = queryKey as [string, string, string, string];
      if (!projId) return "";
      const res = await axios.get(
        `${BACKEND_URL}/projects/pull-env-data/${projId}?environment=${env}&scope=${scope}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      );
      return res.data.data || "";
    },
    enabled: !!project?.id,
    placeholderData: keepPreviousData,
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
        {
          envData: dataToSend,
          environment: selectedEnv,
          scope: selectedScope,
        },
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
          queryClient.invalidateQueries({ queryKey: ["activeProjects"] });
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

        {/* Environment & Monorepo Service Scope Control Strip */}
        <div className="bg-slate-100/60 dark:bg-[#121215]/40 border border-slate-200 dark:border-zinc-900/40 rounded-2xl px-4 py-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left: Integrated Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Environment Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsEnvDropdownOpen(!isEnvDropdownOpen);
                    setIsScopeDropdownOpen(false);
                  }}
                  className="flex items-center space-x-2 px-3.5 py-2 bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white hover:border-slate-300 dark:hover:border-zinc-700 transition-all shadow-xs"
                >
                  <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono uppercase tracking-wider">Env:</span>
                  <div className="flex items-center space-x-1.5 capitalize">
                    {selectedEnv === "production" ? (
                      <RxLockClosed className="h-3 w-3 text-rose-500 dark:text-rose-400" />
                    ) : selectedEnv === "staging" ? (
                      <span className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                    )}
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedEnv}</span>
                  </div>
                  <RxChevronDown className={`h-3.5 w-3.5 text-slate-400 dark:text-zinc-500 transition-transform ${isEnvDropdownOpen ? "rotate-180 text-slate-800 dark:text-white" : ""}`} />
                </button>

                {/* Environment Dropdown Menu */}
                {isEnvDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30 cursor-default"
                      onClick={() => setIsEnvDropdownOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800/90 rounded-xl shadow-xl p-1.5 z-40 space-y-1 animate-fade-in">
                      <div className="px-2 py-1 text-[10px] font-mono text-slate-500 dark:text-zinc-500 uppercase tracking-wider">
                        Select Environment
                      </div>
                      {[
                        {
                          id: "development",
                          label: "development",
                          badge: "dev",
                          desc: "Local development & testing",
                          color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                        },
                        {
                          id: "staging",
                          label: "staging",
                          badge: "stage",
                          desc: "Pre-release QA environment",
                          color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
                        },
                        {
                          id: "production",
                          label: "production",
                          badge: "prod",
                          desc: "Live production secrets",
                          color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
                        },
                      ].map((item) => {
                        const isCurrent = selectedEnv === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setSelectedEnv(item.id as any);
                              setIsEnvDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                              isCurrent
                                ? "bg-slate-100 dark:bg-[#18181b] text-slate-900 dark:text-white font-semibold"
                                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-zinc-900/60"
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-2 capitalize">
                                <span className={isCurrent ? "font-bold text-slate-900 dark:text-white" : "text-slate-700 dark:text-zinc-300"}>{item.label}</span>
                                <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${item.color}`}>
                                  {item.badge}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-normal">
                                {item.desc}
                              </p>
                            </div>
                            {isCurrent && <RxCheck className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Scope Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsScopeDropdownOpen(!isScopeDropdownOpen);
                    setIsEnvDropdownOpen(false);
                  }}
                  className="flex items-center space-x-2 px-3.5 py-2 bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-white hover:border-slate-300 dark:hover:border-zinc-700 transition-all shadow-xs"
                >
                  <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono uppercase tracking-wider">Scope:</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                    {selectedScope === "default" ? "root (default)" : selectedScope}
                  </span>
                  <RxChevronDown className={`h-3.5 w-3.5 text-slate-400 dark:text-zinc-500 transition-transform ${isScopeDropdownOpen ? "rotate-180 text-slate-800 dark:text-white" : ""}`} />
                </button>

                {/* Scope Dropdown Menu */}
                {isScopeDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30 cursor-default"
                      onClick={() => setIsScopeDropdownOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-60 bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800/90 rounded-xl shadow-xl p-1.5 z-40 space-y-1 animate-fade-in">
                      <div className="px-2 py-1 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-500 uppercase tracking-wider">
                        <span>Select Scope</span>
                        <span>{scopes.length} scopes</span>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5">
                        {scopes.map((s) => {
                          const isCurrent = selectedScope === s;
                          const isRemovable = s !== "default" && s !== "client" && s !== "server";
                          return (
                            <div
                              key={s}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                                isCurrent
                                  ? "bg-slate-100 dark:bg-[#18181b] text-cyan-600 dark:text-cyan-400 font-semibold"
                                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-zinc-900/60"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedScope(s);
                                  setIsScopeDropdownOpen(false);
                                }}
                                className="flex-1 text-left flex items-center space-x-2"
                              >
                                <span>{s === "default" ? "root (default)" : s}</span>
                              </button>

                              <div className="flex items-center space-x-1.5 ml-2">
                                {isCurrent && <RxCheck className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />}
                                {isRemovable && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newScopes = scopes.filter((sc) => sc !== s);
                                      setScopes(newScopes);
                                      if (selectedScope === s) setSelectedScope("default");
                                    }}
                                    className="text-slate-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 p-0.5 transition-colors"
                                    title="Delete scope"
                                  >
                                    <RxCross2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Scope Section inside Dropdown */}
                      <div className="pt-1.5 border-t border-slate-200 dark:border-zinc-900">
                        {isAddingScope ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (newScopeInput.trim() && !scopes.includes(newScopeInput.trim().toLowerCase())) {
                                const clean = newScopeInput.trim().toLowerCase();
                                setScopes([...scopes, clean]);
                                setSelectedScope(clean);
                              }
                              setNewScopeInput("");
                              setIsAddingScope(false);
                              setIsScopeDropdownOpen(false);
                            }}
                            className="flex items-center space-x-1 px-2 py-1 bg-slate-50 dark:bg-[#121215] border border-cyan-500/40 rounded-lg text-xs font-mono"
                          >
                            <input
                              type="text"
                              autoFocus
                              placeholder="e.g. worker"
                              value={newScopeInput}
                              onChange={(e) => setNewScopeInput(e.target.value)}
                              className="bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-700 focus:outline-none w-full text-xs"
                            />
                            <button type="submit" className="text-cyan-600 dark:text-cyan-400 font-bold px-1 hover:text-cyan-500">
                              ✓
                            </button>
                            <button type="button" onClick={() => setIsAddingScope(false)} className="text-slate-400 dark:text-zinc-500 px-1 hover:text-slate-600 dark:hover:text-zinc-300">
                              ✕
                            </button>
                          </form>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsAddingScope(true)}
                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/10 font-mono transition-colors flex items-center space-x-1.5"
                          >
                            <RxPlus className="h-3.5 w-3.5" />
                            <span>Create New Scope</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right: Terminal CLI Command */}
            <div className="flex items-center space-x-2 shrink-0">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-600 dark:text-zinc-400 shadow-xs">
                <span className="text-slate-400 dark:text-zinc-600 select-none">$</span>
                <span className="text-slate-800 dark:text-zinc-300">lit pull -e {selectedEnv.substring(0, 4)} {selectedScope !== "default" ? `-s ${selectedScope}` : ""}</span>
                <button
                  type="button"
                  onClick={() => {
                    const cmd = `lit pull -e ${selectedEnv} ${selectedScope !== "default" ? `-s ${selectedScope}` : ""}`;
                    navigator.clipboard.writeText(cmd);
                    showToast("CLI command copied to clipboard!", "success");
                  }}
                  className="text-slate-400 hover:text-cyan-600 dark:text-zinc-500 dark:hover:text-cyan-400 transition-colors p-0.5 ml-1"
                  title="Copy CLI command"
                >
                  <RxCopy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Variables Section Wrapper (Borderless) */}
        <div className="space-y-6">
          {/* View Mode Tabs & Actions Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 min-h-[44px]">
            <div className="flex items-center space-x-1 p-1 bg-slate-100/80 dark:bg-[#121215]/60 border border-slate-200 dark:border-zinc-900/60 rounded-xl shrink-0">
              {[
                { id: "manager", label: "Secrets Manager" },
                { id: "raw", label: "Raw .env Editor" },
                { id: "history", label: "Audit Logs" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-[#18181b] text-cyan-600 dark:text-cyan-400 shadow-xs border border-slate-200/80 dark:border-zinc-800"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-transparent"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Actions / Search (Smooth Fade) */}
            <div
              className={`flex flex-1 md:justify-end items-center gap-2.5 transition-all duration-200 ${
                activeTab === "manager"
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none hidden md:flex invisible"
              }`}
            >
              <div className="relative flex-1 max-w-xs">
                <RxMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search keys/values..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full h-9 pl-10 pr-4 py-2 border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#121215]/40 text-xs placeholder-slate-400 dark:placeholder-zinc-550 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/25 rounded-xl transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(true)}
                className="inline-flex items-center justify-center px-3.5 h-9 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121215]/40 hover:bg-slate-100 dark:hover:bg-[#18181c] text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold rounded-xl transition-colors shrink-0"
              >
                Bulk Import .env
              </button>
              <button
                type="button"
                onClick={() => setIsAddingInline(true)}
                className="inline-flex items-center justify-center px-4 h-9 btn-cyan-glossy text-white text-xs font-bold rounded-xl shrink-0"
              >
                <RxPlus className="h-3.5 w-3.5 mr-1" /> Add Secret
              </button>
            </div>
          </div>

          {/* Section Body */}
          {loadingEnv && !fetchedEnv ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <RxReload className="h-5 w-5 text-cyan-500 animate-spin" />
<p className="text-xs text-slate-500 dark:text-zinc-500 font-semibold">
                Decrypting secure environment...
              </p>
            </div>
          ) : (
            <div className={`min-h-[280px] transition-all duration-200 ease-in-out ${fetchingEnv ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
              <div key={activeTab} className="animate-fade-in">
                {activeTab === "manager" ? (
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
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="VALUE"
                          required
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          className="block w-full px-3.5 py-2 border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#09090b] rounded-xl text-xs font-mono placeholder-slate-400 dark:placeholder-zinc-650 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="submit"
                          className="px-4 py-2 btn-cyan-glossy text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingInline(false)}
                          className="px-3 py-2 text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white text-xs font-bold transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Empty state or variables list */}
                  {filteredVariables.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 dark:bg-[#121215]/20 border border-slate-200 dark:border-zinc-900/60 rounded-2xl animate-fade-in">
                      <p className="text-xs text-slate-500 dark:text-zinc-550 font-medium">
                        No environment variables found matching active filters.
                      </p>
                      <button
                        onClick={() => setIsAddingInline(true)}
                        className="mt-3 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                      >
                        + Add your first secret
                      </button>
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
                          <div className="md:col-span-4 flex items-center">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingKey}
                                onChange={(e) => setEditingKey(e.target.value)}
                                className="block w-full px-3.5 py-1.5 text-xs font-mono border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#09090b] rounded-xl focus:outline-none focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10 text-slate-900 dark:text-white"
                              />
                            ) : (
                              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white tracking-wide select-all">
                                {variable.key}
                              </span>
                            )}
                          </div>

                          {/* Value Column */}
                          <div className="md:col-span-5 flex items-center">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                className="block w-full px-3.5 py-1.5 text-xs font-mono border border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#09090b] rounded-xl focus:outline-none focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10 text-slate-900 dark:text-white"
                              />
                            ) : (
                              <div className="flex items-center justify-between w-full bg-slate-100/80 dark:bg-[#121215]/40 px-3.5 py-1.5 border border-slate-200 dark:border-zinc-900/60 rounded-xl">
                                <span className="font-mono text-xs text-slate-600 dark:text-zinc-400 truncate max-w-[200px] md:max-w-[280px]">
                                  {isRevealed
                                    ? variable.value
                                    : "••••••••••••••••"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleReveal(variable.key)}
                                  className="text-slate-400 hover:text-slate-700 dark:text-zinc-550 dark:hover:text-zinc-300 ml-2 transition-colors"
                                >
                                  {isRevealed ? (
                                    <RxEyeNone className="h-3.5 w-3.5" />
                                  ) : (
                                    <RxEyeOpen className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Actions Column */}
                          <div className="md:col-span-3 flex items-center justify-end space-x-1.5">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => saveEdit(globalIdx)}
                                  className="p-1.5 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-950/20 rounded-lg transition-colors"
                                  title="Save edit"
                                >
                                  <RxCheck className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingIndex(null)}
                                  className="p-1.5 text-slate-400 dark:text-zinc-550 hover:bg-zinc-800 rounded-lg transition-colors"
                                  title="Cancel edit"
                                >
                                  <RxCross2 className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyToClipboard(variable.value, variable.key)
                                  }
                                  className="p-1.5 text-slate-400 dark:text-zinc-550 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                                  title="Copy value"
                                >
                                  {copiedKeys[variable.key] ? (
                                    <RxCheck className="h-3.5 w-3.5 text-emerald-500" />
                                  ) : (
                                    <RxCopy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => startEdit(globalIdx, variable)}
                                  className="p-1.5 text-slate-400 dark:text-zinc-550 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                                  title="Edit variable"
                                >
                                  <RxPencil1 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSecret(variable.key)}
                                  className="p-1.5 text-slate-400 dark:text-zinc-550 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
                                  title="Delete variable"
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
                <div className="space-y-4 pt-2 animate-fade-in">
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-900">
                    <textarea
                      value={rawEnv}
                      onChange={(e) => setRawEnv(e.target.value)}
                      className="w-full h-80 p-5 bg-white dark:bg-[#09090b]/80 text-slate-900 dark:text-[#f4f4f5] outline-none font-mono text-xs leading-relaxed resize-y focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                      placeholder={`# Configuration details\nAPI_KEY=your-api-key-here\nDB_HOST=localhost`}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-semibold font-mono">
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
                <div className="space-y-6 pt-2 animate-fade-in">
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
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mr-1.5">
                              {item.environment || "dev"} / {item.scope || "default"}
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
      </div>
    )}

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

      {/* Bulk Add Secret Variable Modal */}
      <AddVariableModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSubmit={() => {
          fetchEnvData();
          showToast(`Secrets updated for ${selectedEnv} (${selectedScope})`, "success");
        }}
        projectId={project.id}
        environment={selectedEnv}
        scope={selectedScope}
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
      </div>
    </DashboardLayout>
  );
};

export default ProjectPage;
