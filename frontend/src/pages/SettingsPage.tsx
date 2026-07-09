import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  RxPerson,
  RxLockClosed,
  RxCardStack,
  RxCode,
  RxBell,
  RxTrash,
  RxCheck,
  RxCopy,
  RxPlus,
  RxCross2,
  RxEyeOpen,
  RxEyeClosed,
} from "react-icons/rx";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { BACKEND_URL } from "../configs/constants";
import axios from "axios";

// ── Types ─────────────────────────────────────────────────────────
interface Profile {
  id: string;
  email: string;
  name: string;
  avatar: string;
  joinedOn: string | null;
  secretUpdatesEnabled: boolean;
  collabRequestsEnabled: boolean;
  cliActivityEnabled: boolean;
  mfaEnabled: boolean;
  plan: string;
}

interface CliToken {
  id: string;
  label: string;
  prefix: string;
  createdOn: string;
  lastUsedOn: string;
}

interface BillingSummary {
  plan: string;
  projectsUsed: number;
  projectsLimit: number;
  collaboratorsUsed: number;
  collaboratorsLimit: number;
  cliSyncPriority: string;
  paymentMethod: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
}

// ── Component ─────────────────────────────────────────────────────
const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  // ── TanStack Query Fetching ──
  const headers = { Authorization: `Bearer ${user?.token}` };

  const {
    data: profile = null,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useQuery<Profile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await axios.get(`${BACKEND_URL}/users/me`, { headers });
      return res.data.data;
    },
    enabled: !!user?.token,
  });

  const { data: cliTokens = [], refetch: fetchTokens } = useQuery<CliToken[]>({
    queryKey: ["cliTokens"],
    queryFn: async () => {
      const res = await axios.get(`${BACKEND_URL}/users/me/tokens`, {
        headers,
      });
      return res.data.data || [];
    },
    enabled: !!user?.token,
  });

  const { data: billing = null, isLoading: billingLoading } =
    useQuery<BillingSummary | null>({
      queryKey: ["billingSummary"],
      queryFn: async () => {
        const res = await axios.get(`${BACKEND_URL}/users/me/billing`, {
          headers,
        });
        return res.data.data;
      },
      enabled: !!user?.token && activeTab === "billing",
    });

  // ── Profile form values synchronization ──
  useEffect(() => {
    if (profile) {
      setProfileName(profile.name || "");
      setNotifPrefs({
        secretUpdatesEnabled: profile.secretUpdatesEnabled,
        collabRequestsEnabled: profile.collabRequestsEnabled,
        cliActivityEnabled: profile.cliActivityEnabled,
      });
    }
  }, [profile]);

  const [profileName, setProfileName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Password state ──
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // ── 2FA state ──
  const [confirmMfaOpen, setConfirmMfaOpen] = useState(false);
  const [mfaPassword, setMfaPassword] = useState("");
  const [togglingMfa, setTogglingMfa] = useState(false);

  // ── Notifications state ──
  const [notifPrefs, setNotifPrefs] = useState({
    secretUpdatesEnabled: true,
    collabRequestsEnabled: true,
    cliActivityEnabled: false,
  });
  const [savingNotifs, setSavingNotifs] = useState(false);

  // ── CLI tokens state ──
  const [newTokenLabel, setNewTokenLabel] = useState("");
  const [creatingToken, setCreatingToken] = useState(false);
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(
    null,
  );
  const [tokenCopied, setTokenCopied] = useState(false);
  const [showTokenForm, setShowTokenForm] = useState(false);

  // ── Delete account state ──
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // ── Install CLI copy state ──
  const [installCopied, setInstallCopied] = useState(false);

  // ── Save profile ──
  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      showToast("Name cannot be empty", "error");
      return;
    }
    setSavingProfile(true);
    try {
      await axios.put(
        `${BACKEND_URL}/users/me`,
        { name: profileName.trim() },
        { headers },
      );
      showToast("Profile updated", "success");
      // Invalidate query cache to pull updated name
      refetchProfile();
      // Update localStorage user name
      if (user) {
        const updated = { ...user, name: profileName.trim() };
        localStorage.setItem("user", JSON.stringify(updated));
      }
    } catch {
      showToast("Failed to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Toggle MFA ──
  const handleToggleMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaPassword) {
      showToast("Password is required", "error");
      return;
    }
    setTogglingMfa(true);
    const targetState = !profile?.mfaEnabled;
    try {
      const res = await axios.put(
        `${BACKEND_URL}/users/me/mfa`,
        { enabled: targetState, password: mfaPassword },
        { headers },
      );
      if (res.data.statusCode === 200) {
        showToast(
          `Two-factor authentication has been ${targetState ? "enabled" : "disabled"}`,
          "success",
        );
        refetchProfile();
        setConfirmMfaOpen(false);
        setMfaPassword("");
      } else {
        showToast(res.data.message || "Failed to toggle MFA", "error");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to toggle MFA", "error");
    } finally {
      setTogglingMfa(false);
    }
  };

  // ── Change password ──
  const handleChangePassword = async () => {
    if (!currentPassword) {
      showToast("Enter your current password", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("New password must be at least 8 characters", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await axios.put(
        `${BACKEND_URL}/users/me/password`,
        { currentPassword, newPassword },
        { headers },
      );
      if (res.data.statusCode === 200) {
        showToast("Password updated successfully", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showToast(res.data.message || "Failed to update password", "error");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update password";
      showToast(msg, "error");
    } finally {
      setChangingPassword(false);
    }
  };

  // ── Update notifications ──
  const handleSaveNotifications = async () => {
    setSavingNotifs(true);
    try {
      await axios.put(`${BACKEND_URL}/users/me/notifications`, notifPrefs, {
        headers,
      });
      showToast("Notification preferences saved", "success");
      refetchProfile();
    } catch {
      showToast("Failed to save preferences", "error");
    } finally {
      setSavingNotifs(false);
    }
  };

  // ── Generate CLI token ──
  const handleGenerateToken = async () => {
    if (!newTokenLabel.trim()) {
      showToast("Enter a token label", "error");
      return;
    }
    setCreatingToken(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/users/me/tokens`,
        { label: newTokenLabel.trim() },
        { headers },
      );
      if (res.data.statusCode === 201) {
        setNewlyCreatedToken(res.data.data.token);
        showToast("Token created — copy it now!", "success");
        setNewTokenLabel("");
        fetchTokens();
      } else {
        showToast(res.data.message || "Failed to create token", "error");
      }
    } catch {
      showToast("Failed to create token", "error");
    } finally {
      setCreatingToken(false);
    }
  };

  // ── Revoke CLI token ──
  const handleRevokeToken = async (tokenId: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/users/me/tokens/${tokenId}`, {
        headers,
      });
      showToast("Token revoked", "success");
      fetchTokens();
    } catch {
      showToast("Failed to revoke token", "error");
    }
  };

  // ── Delete account ──
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showToast("Enter your password to confirm", "error");
      return;
    }
    setDeletingAccount(true);
    try {
      const res = await axios.delete(`${BACKEND_URL}/users/me`, {
        headers,
        data: { password: deletePassword },
      });
      if (res.data.statusCode === 200) {
        showToast("Account deleted", "info");
        logout();
      } else {
        showToast(res.data.message || "Failed to delete account", "error");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to delete account";
      showToast(msg, "error");
    } finally {
      setDeletingAccount(false);
      setConfirmDeleteOpen(false);
      setDeletePassword("");
    }
  };

  // ── Copy helpers ──
  const handleCopyInstall = () => {
    navigator.clipboard.writeText(
      "curl -fsSL https://raw.githubusercontent.com/MandemGibson/lit/main/install.sh | sh",
    );
    setInstallCopied(true);
    setTimeout(() => setInstallCopied(false), 2000);
  };

  const handleCopyNewToken = () => {
    if (newlyCreatedToken) {
      navigator.clipboard.writeText(newlyCreatedToken);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    }
  };

  // ── Relative time helper ──
  const relativeTime = (isoStr: string) => {
    if (!isoStr) return "";
    const diff = Date.now() - new Date(isoStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  // ── Usage reset date helper ──
  const getNextMonthResetDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    });
  };

  // ── Tabs ────────────────────────────────────────────────────────
  const tabs = [
    { id: "profile", name: "Profile Information", icon: RxPerson },
    { id: "security", name: "Security & Auth", icon: RxLockClosed },
    { id: "billing", name: "Billing & Plan", icon: RxCardStack },
    { id: "cli", name: "CLI Access & Install", icon: RxCode },
    { id: "notifications", name: "Notifications", icon: RxBell },
  ];

  // ── Render tab content ──────────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      // ────────── PROFILE ──────────
      case "profile":
        return (
          <div className="space-y-8 animate-fade-in text-[#f4f4f5]">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Profile Details
              </h3>
              <p className="mt-1 text-xs text-zinc-400 font-medium">
                Update your display name and view your active subscription tier.
              </p>
            </div>

            {profileLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-zinc-700 border-t-cyan-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Avatar Row */}
                <div className="flex items-center space-x-4">
                  {profile?.avatar ? (
                    <img
                      className="h-16 w-16 rounded-2xl object-cover"
                      src={profile.avatar}
                      alt={profile.name}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-900 flex items-center justify-center text-zinc-200 text-xl font-bold font-mono">
                      {profileName
                        ? profileName.substring(0, 2).toUpperCase()
                        : profile?.email
                          ? profile.email.substring(0, 2).toUpperCase()
                          : "U"}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-zinc-300">
                      {profileName || "User Account"}
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {profile?.email}
                    </p>
                  </div>
                </div>

                {/* Profile Fields Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="block w-full px-4 py-2.5 border border-zinc-900 bg-[#121215]/40 text-xs rounded-xl text-[#f4f4f5] focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/20 font-mono transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="block w-full px-4 py-2.5 border border-zinc-900/60 bg-transparent text-xs rounded-xl text-zinc-500 font-mono cursor-not-allowed"
                    />
                  </div>
                </div>

                {profile?.joinedOn && (
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Member since{" "}
                    {new Date(profile.joinedOn).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all duration-200"
                  >
                    {savingProfile ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      // ────────── SECURITY ──────────
      case "security":
        return (
          <div className="space-y-8 animate-fade-in text-[#f4f4f5]">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Security Settings
              </h3>
              <p className="mt-1 text-xs text-zinc-400 font-medium">
                Change your account password or activate two-factor
                authentication.
              </p>
            </div>

            <div className="space-y-6">
              {/* Password Block */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
                  Update Password
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="block w-full px-4 py-2.5 pr-10 border border-zinc-900 bg-[#121215]/40 text-xs rounded-xl text-[#f4f4f5] focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/20 font-mono transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showCurrentPw ? (
                        <RxEyeClosed className="h-4 w-4" />
                      ) : (
                        <RxEyeOpen className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      placeholder="New password (min 8 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full px-4 py-2.5 pr-10 border border-zinc-900 bg-[#121215]/40 text-xs rounded-xl text-[#f4f4f5] focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/20 font-mono transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showNewPw ? (
                        <RxEyeClosed className="h-4 w-4" />
                      ) : (
                        <RxEyeOpen className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-zinc-900 bg-[#121215]/40 text-xs rounded-xl text-[#f4f4f5] focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/20 font-mono transition-all"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all duration-200 mt-2"
                >
                  {changingPassword ? "Updating…" : "Update Password"}
                </button>
              </div>

              {/* 2FA Block */}
              <div className="border-t border-zinc-900/60 pt-6">
                <h4 className="text-xs font-bold text-zinc-350 uppercase tracking-wide">
                  Two-Factor Authentication (2FA)
                </h4>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed font-medium">
                  Protect your projects and encryption keys with temporary
                  dynamic login verification codes.
                </p>

                {profileLoading ? (
                  <div className="mt-4 w-5 h-5 border-2 border-zinc-700 border-t-cyan-500 rounded-full animate-spin" />
                ) : confirmMfaOpen ? (
                  <form
                    onSubmit={handleToggleMfa}
                    className="mt-4 space-y-4 p-5 bg-[#121215]/50 rounded-xl max-w-md"
                  >
                    <p className="text-xs text-zinc-300 font-semibold">
                      Please enter your account password to confirm{" "}
                      {profile?.mfaEnabled ? "disabling" : "enabling"}{" "}
                      Two-Factor Authentication.
                    </p>
                    <input
                      type="password"
                      value={mfaPassword}
                      onChange={(e) => setMfaPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="block w-full px-3.5 py-2 border border-zinc-900 bg-[#09090b] text-xs rounded-xl text-[#f4f4f5] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 font-mono"
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        type="submit"
                        disabled={togglingMfa}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all"
                      >
                        {togglingMfa ? "Confirming…" : "Confirm"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmMfaOpen(false);
                          setMfaPassword("");
                        }}
                        className="px-4 py-2 border border-zinc-800 text-xs font-bold rounded-xl text-zinc-450 hover:text-white hover:bg-zinc-900/60 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : profile?.mfaEnabled ? (
                  <div className="mt-4">
                    <button
                      onClick={() => setConfirmMfaOpen(true)}
                      className="px-4 py-2 border border-zinc-800 text-xs font-bold rounded-xl text-zinc-350 hover:text-white hover:bg-zinc-900/60 transition-colors duration-150"
                    >
                      Disable 2FA Protection
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmMfaOpen(true)}
                    className="mt-4 px-4 py-2 border border-cyan-800/40 text-xs font-bold rounded-xl text-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/45 transition-colors duration-150"
                  >
                    Enable 2FA Protection
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      // ────────── BILLING & PLAN ──────────
      case "billing":
        return (
          <div className="space-y-8 animate-fade-in text-[#f4f4f5]">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Billing & plan
              </h3>
              <p className="mt-1 text-xs text-zinc-400 font-medium">
                Manage your plan, usage, and billing details.
              </p>
            </div>

            {billingLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-zinc-700 border-t-cyan-500 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Current Plan Section */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Current plan
                  </h4>
                  <div className="bg-[#121215]/40 rounded-xl overflow-hidden divide-y divide-zinc-900/60">
                    <div className="p-5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                        Active Plan
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {billing?.plan === "team_annual"
                          ? "Team Pro (Annual) · $23/month"
                          : billing?.plan === "team_monthly"
                            ? "Team Pro (Monthly) · $29/month"
                            : "Free · $0/month"}
                      </h4>
                    </div>

                    <div className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1">
                        <h5 className="text-xs font-bold text-zinc-300">
                          {billing?.plan === "team_annual" ||
                          billing?.plan === "team_monthly"
                            ? "Adjust features or billing intervals?"
                            : "Need more room?"}
                        </h5>
                        <p className="text-xs text-zinc-450 leading-relaxed max-w-lg font-medium">
                          {billing?.plan === "team_annual" ||
                          billing?.plan === "team_monthly"
                            ? "Manage your subscription seats, billing intervals, or downgrade back to the Developer plan."
                            : "Upgrade to Pro to add unlimited projects, keep your full history, and collaborate with your team."}
                        </p>
                      </div>

                      <div className="flex flex-col items-center sm:items-end gap-1.5 flex-shrink-0">
                        <Link
                          to="/pricing"
                          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 block text-center ${
                            billing?.plan === "team_annual" ||
                            billing?.plan === "team_monthly"
                              ? "border border-zinc-800 hover:border-zinc-700 bg-[#09090b]/80 hover:bg-[#09090b] text-zinc-300 hover:text-white"
                              : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-md"
                          }`}
                        >
                          {billing?.plan === "team_annual" ||
                          billing?.plan === "team_monthly"
                            ? "Manage Subscription"
                            : "Upgrade to Pro"}
                        </Link>
                        {(!billing?.plan || billing?.plan === "developer") && (
                          <span className="text-[9px] font-bold text-zinc-500 font-mono">
                            Starts from $23/month
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usage Section */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Usage this month
                  </h4>
                  <div className="bg-[#121215]/40 rounded-xl overflow-hidden divide-y divide-[#1e1e24]/40">
                    <div className="p-4 flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-300">
                        Projects
                      </span>
                      <span className="text-xs font-bold text-white font-mono">
                        {billing?.projectsLimit === -1
                          ? `${billing?.projectsUsed} / Unlimited`
                          : `${billing?.projectsUsed} / ${billing?.projectsLimit} used`}
                      </span>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-350">
                        Collaborator seats
                      </span>
                      <span className="text-xs font-bold text-white font-mono">
                        {billing?.collaboratorsLimit === -1
                          ? `${billing?.collaboratorsUsed} / Unlimited`
                          : `${billing?.collaboratorsUsed} / ${billing?.collaboratorsLimit} used`}
                      </span>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-350">
                        CLI Sync Operations
                      </span>
                      <span className="text-xs font-bold text-white font-mono">
                        {billing?.cliSyncPriority}
                      </span>
                    </div>
                    <div className="p-4 bg-[#121215]/20 text-[10px] text-zinc-500 font-semibold font-mono">
                      Usage resets on {getNextMonthResetDate()}.
                    </div>
                  </div>
                </div>

                {/* Billing Details Section */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Billing details
                  </h4>
                  <div className="bg-[#121215]/40 rounded-xl p-5">
                    {billing?.paymentMethod ? (
                      <div className="space-y-2.5">
                        <p className="text-xs text-zinc-400 font-semibold">
                          Payment Method
                        </p>
                        <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-white font-bold tracking-wider text-[10px]">
                            {billing.paymentMethod.brand}
                          </span>
                          <span>
                            •••• •••• •••• {billing.paymentMethod.last4}{" "}
                            (Expires {billing.paymentMethod.expMonth}/
                            {String(billing.paymentMethod.expYear).substring(2)}
                            )
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-zinc-350">
                          No billing details yet.
                        </p>
                        <p className="text-xs text-zinc-500 font-semibold">
                          Billing details will appear here after you upgrade.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        );

      // ────────── CLI ──────────
      case "cli":
        return (
          <div className="space-y-8 animate-fade-in text-[#f4f4f5]">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                CLI Access & Configuration
              </h3>
              <p className="mt-1 text-xs text-zinc-400 font-medium">
                Install our unified terminal sync agent to pull and push
                environment variables programmatically.
              </p>
            </div>

            {/* Mock macOS Terminal */}
            <div className="rounded-xl overflow-hidden bg-[#121215]/40">
              <div className="bg-[#121215] px-4 py-3 flex items-center justify-between border-b border-zinc-900/40">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-[#ff5f56] rounded-full" />
                  <div className="w-2.5 h-2.5 bg-[#ffbd2e] rounded-full" />
                  <div className="w-2.5 h-2.5 bg-[#27c93f] rounded-full" />
                  <span className="text-[10px] font-bold text-zinc-500 ml-2 uppercase tracking-wider font-mono">
                    bash
                  </span>
                </div>
                <button
                  onClick={handleCopyInstall}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all"
                  title="Copy command"
                >
                  {installCopied ? (
                    <RxCheck className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <RxCopy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <div className="p-5 font-mono text-xs leading-relaxed text-[#f4f4f5] overflow-auto select-all">
                <span className="text-cyan-500 font-bold">$</span> curl -fsSL
                https://raw.githubusercontent.com/MandemGibson/lit/main/install.sh
                | sh
              </div>
            </div>

            {/* Personal Access Tokens */}
            <div className="space-y-5 border-t border-zinc-900/60 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
                    Personal Access Tokens
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Generate secure tokens to authenticate developer CLI
                    operations.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowTokenForm(true);
                    setNewlyCreatedToken(null);
                  }}
                  className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all duration-200 flex items-center space-x-1.5"
                >
                  <RxPlus className="h-3.5 w-3.5" />
                  <span>Generate Token</span>
                </button>
              </div>

              {/* New token banner */}
              {newlyCreatedToken && (
                <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 space-y-2.5">
                  <p className="text-[11px] font-bold text-emerald-400">
                    ✓ Token created — copy it now, it will not be shown again.
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 p-2 bg-[#09090b] border border-zinc-900 rounded-lg text-xs font-mono text-emerald-350 select-all overflow-x-auto">
                      {newlyCreatedToken}
                    </code>
                    <button
                      onClick={handleCopyNewToken}
                      className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors"
                    >
                      {tokenCopied ? (
                        <RxCheck className="h-4 w-4" />
                      ) : (
                        <RxCopy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Token creation form */}
              {showTokenForm && !newlyCreatedToken && (
                <div className="bg-[#121215]/50 rounded-xl p-4 space-y-3.5 max-w-lg">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Token Label
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newTokenLabel}
                      onChange={(e) => setNewTokenLabel(e.target.value)}
                      placeholder="e.g. My MacBook Pro"
                      className="flex-1 px-3.5 py-2 border border-zinc-900 bg-[#09090b] text-xs rounded-xl text-[#f4f4f5] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 font-mono"
                    />
                    <button
                      onClick={handleGenerateToken}
                      disabled={creatingToken}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all"
                    >
                      {creatingToken ? "Creating…" : "Create"}
                    </button>
                    <button
                      onClick={() => {
                        setShowTokenForm(false);
                        setNewTokenLabel("");
                      }}
                      className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      <RxCross2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Token list */}
              {cliTokens.length > 0 ? (
                <div className="divide-y divide-zinc-900/60">
                  {cliTokens.map((token) => (
                    <div
                      key={token.id}
                      className="py-4 flex items-center justify-between first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="text-xs font-bold text-zinc-200">
                          {token.label}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                          Created {relativeTime(token.createdOn)}
                          {token.lastUsedOn &&
                            ` • Last used ${relativeTime(token.lastUsedOn)}`}
                        </p>
                        <code className="mt-2.5 block p-1.5 bg-[#121215]/30 border border-zinc-900/50 rounded-lg text-xs font-mono text-zinc-400 w-fit">
                          {token.prefix}••••••••••••••••••••
                        </code>
                      </div>
                      <button
                        onClick={() => handleRevokeToken(token.id)}
                        className="text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 px-3.5 py-1.5 rounded-xl border border-red-950/60 transition-all duration-150"
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#121215]/10 rounded-xl p-6 text-center">
                  <p className="text-xs text-zinc-500 font-semibold">
                    No active tokens. Generate a token to configure your CLI
                    login credentials.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      // ────────── NOTIFICATIONS ──────────
      case "notifications":
        return (
          <div className="space-y-8 animate-fade-in text-[#f4f4f5]">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Notification Preferences
              </h3>
              <p className="mt-1 text-xs text-zinc-400 font-medium">
                Decide what alerts and status updates you want to receive via
                email.
              </p>
            </div>

            <div className="divide-y divide-zinc-900/60">
              {[
                {
                  key: "secretUpdatesEnabled" as const,
                  title: "Environment Secret Updates",
                  desc: "Notify when keys are added, updated, or removed from your projects.",
                },
                {
                  key: "collabRequestsEnabled" as const,
                  title: "Collaboration Requests",
                  desc: "Notify when you are invited to join other team projects.",
                },
                {
                  key: "cliActivityEnabled" as const,
                  title: "CLI Push/Pull Activity",
                  desc: "Notify when CLI runs pull/push operations against your projects.",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="pr-4">
                    <p className="text-xs font-bold text-zinc-250">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  {/* Custom toggle switch */}
                  <button
                    role="switch"
                    aria-checked={notifPrefs[item.key]}
                    onClick={() =>
                      setNotifPrefs((prev) => ({
                        ...prev,
                        [item.key]: !prev[item.key],
                      }))
                    }
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none ${
                      notifPrefs[item.key] ? "bg-cyan-600" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifPrefs[item.key] ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveNotifications}
                disabled={savingNotifs}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all duration-200"
              >
                {savingNotifs ? "Saving…" : "Save Preferences"}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ── Page Layout ─────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in text-[#f4f4f5] max-w-5xl">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#f4f4f5]">
            Settings
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Manage your account preferences, credentials, and CLI binaries.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <div className="w-full lg:w-60 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative w-full flex items-center px-4 py-3.5 text-xs font-bold transition-all space-x-3 rounded-xl text-left ${
                    isActive
                      ? "text-white bg-zinc-900/40"
                      : "text-zinc-500 hover:text-white hover:bg-zinc-900/20"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-600 rounded-r-md" />
                  )}
                  <Icon
                    className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-zinc-500"}`}
                  />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 w-full space-y-6">
            <div className="pb-8">{renderTabContent()}</div>

            {/* Danger Zone */}
            <div className="border-t border-zinc-900/80 pt-8 relative overflow-hidden">
              <div className="flex items-center space-x-2.5">
                <RxTrash className="h-4 w-4 text-red-400" />
                <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                  Danger Zone
                </h3>
              </div>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed max-w-2xl font-semibold">
                Permanently delete your Lit Envs account. This action is
                irreversible, and all encrypted project variables, collaboration
                logs, and access tokens will be destroyed immediately.
              </p>

              {!confirmDeleteOpen ? (
                <button
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="mt-4 px-4 py-2 border border-red-950/60 text-red-400 hover:text-red-350 bg-red-950/10 hover:bg-red-950/20 text-xs font-bold rounded-xl transition-all duration-150 focus:outline-none"
                >
                  Delete Account
                </button>
              ) : (
                <div className="mt-4 space-y-4 p-4 bg-red-950/5 border border-red-900/35 rounded-xl max-w-md">
                  <p className="text-xs text-red-300 font-semibold">
                    Type your password to confirm account deletion.
                  </p>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="block w-full px-3.5 py-2 border border-red-900/35 bg-[#09090b] text-xs rounded-xl text-[#f4f4f5] focus:outline-none focus:ring-1 focus:ring-red-500/20 font-mono"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors duration-150"
                    >
                      {deletingAccount ? "Deleting…" : "Confirm Delete"}
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDeleteOpen(false);
                        setDeletePassword("");
                      }}
                      className="px-4 py-2 border border-zinc-800 text-xs font-bold rounded-xl text-zinc-450 hover:text-white hover:bg-zinc-900/60 transition-colors duration-150"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
