import React, { useState, useEffect, useCallback } from 'react';
import {
  RxPerson,
  RxLockClosed,
  RxCode,
  RxBell,
  RxTrash,
  RxCheck,
  RxCopy,
  RxPlus,
  RxCross2,
  RxEyeOpen,
  RxEyeClosed,
} from 'react-icons/rx';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { BACKEND_URL } from '../configs/constants';
import axios from 'axios';

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
}

interface CliToken {
  id: string;
  label: string;
  prefix: string;
  createdOn: string;
  lastUsedOn: string;
}

// ── Component ─────────────────────────────────────────────────────
const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  // ── Profile state ──
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Password state ──
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // ── 2FA state ──
  const [confirmMfaOpen, setConfirmMfaOpen] = useState(false);
  const [mfaPassword, setMfaPassword] = useState('');
  const [togglingMfa, setTogglingMfa] = useState(false);

  // ── Notifications state ──
  const [notifPrefs, setNotifPrefs] = useState({
    secretUpdatesEnabled: true,
    collabRequestsEnabled: true,
    cliActivityEnabled: false,
  });
  const [savingNotifs, setSavingNotifs] = useState(false);

  // ── CLI tokens state ──
  const [cliTokens, setCliTokens] = useState<CliToken[]>([]);
  const [newTokenLabel, setNewTokenLabel] = useState('');
  const [creatingToken, setCreatingToken] = useState(false);
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [showTokenForm, setShowTokenForm] = useState(false);

  // ── Delete account state ──
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // ── Install CLI copy state ──
  const [installCopied, setInstallCopied] = useState(false);

  const headers = { Authorization: `Bearer ${user?.token}` };

  // ── Fetch profile ──
  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/users/me`, { headers });
      const data = res.data.data as Profile;
      setProfile(data);
      setProfileName(data.name || '');
      setNotifPrefs({
        secretUpdatesEnabled: data.secretUpdatesEnabled,
        collabRequestsEnabled: data.collabRequestsEnabled,
        cliActivityEnabled: data.cliActivityEnabled,
      });
    } catch {
      showToast('Failed to load profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // ── Fetch CLI tokens ──
  const fetchTokens = useCallback(async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/users/me/tokens`, { headers });
      setCliTokens(res.data.data || []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchTokens();
  }, []);

  // ── Save profile ──
  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      await axios.put(`${BACKEND_URL}/users/me`, { name: profileName.trim() }, { headers });
      showToast('Profile updated', 'success');
      // Update localStorage user name
      if (user) {
        const updated = { ...user, name: profileName.trim() };
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } catch {
      showToast('Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Toggle MFA ──
  const handleToggleMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaPassword) {
      showToast('Password is required', 'error');
      return;
    }
    setTogglingMfa(true);
    const targetState = !profile?.mfaEnabled;
    try {
      const res = await axios.put(
        `${BACKEND_URL}/users/me/mfa`,
        { enabled: targetState, password: mfaPassword },
        { headers }
      );
      if (res.data.statusCode === 200) {
        showToast(
          `Two-factor authentication has been ${targetState ? 'enabled' : 'disabled'}`,
          'success'
        );
        if (profile) {
          setProfile({ ...profile, mfaEnabled: targetState });
        }
        setConfirmMfaOpen(false);
        setMfaPassword('');
      } else {
        showToast(res.data.message || 'Failed to toggle MFA', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to toggle MFA', 'error');
    } finally {
      setTogglingMfa(false);
    }
  };

  // ── Change password ──
  const handleChangePassword = async () => {
    if (!currentPassword) {
      showToast('Enter your current password', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setChangingPassword(true);
    try {
      const res = await axios.put(
        `${BACKEND_URL}/users/me/password`,
        { currentPassword, newPassword },
        { headers }
      );
      if (res.data.statusCode === 200) {
        showToast('Password updated successfully', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(res.data.message || 'Failed to update password', 'error');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update password';
      showToast(msg, 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  // ── Update notifications ──
  const handleSaveNotifications = async () => {
    setSavingNotifs(true);
    try {
      await axios.put(`${BACKEND_URL}/users/me/notifications`, notifPrefs, { headers });
      showToast('Notification preferences saved', 'success');
    } catch {
      showToast('Failed to save preferences', 'error');
    } finally {
      setSavingNotifs(false);
    }
  };

  // ── Generate CLI token ──
  const handleGenerateToken = async () => {
    if (!newTokenLabel.trim()) {
      showToast('Enter a token label', 'error');
      return;
    }
    setCreatingToken(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/users/me/tokens`,
        { label: newTokenLabel.trim() },
        { headers }
      );
      if (res.data.statusCode === 201) {
        setNewlyCreatedToken(res.data.data.token);
        showToast('Token created — copy it now!', 'success');
        setNewTokenLabel('');
        fetchTokens();
      } else {
        showToast(res.data.message || 'Failed to create token', 'error');
      }
    } catch {
      showToast('Failed to create token', 'error');
    } finally {
      setCreatingToken(false);
    }
  };

  // ── Revoke CLI token ──
  const handleRevokeToken = async (tokenId: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/users/me/tokens/${tokenId}`, { headers });
      showToast('Token revoked', 'success');
      fetchTokens();
    } catch {
      showToast('Failed to revoke token', 'error');
    }
  };

  // ── Delete account ──
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showToast('Enter your password to confirm', 'error');
      return;
    }
    setDeletingAccount(true);
    try {
      const res = await axios.delete(`${BACKEND_URL}/users/me`, {
        headers,
        data: { password: deletePassword },
      });
      if (res.data.statusCode === 200) {
        showToast('Account deleted', 'info');
        logout();
      } else {
        showToast(res.data.message || 'Failed to delete account', 'error');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete account';
      showToast(msg, 'error');
    } finally {
      setDeletingAccount(false);
      setConfirmDeleteOpen(false);
      setDeletePassword('');
    }
  };

  // ── Copy helpers ──
  const handleCopyInstall = () => {
    navigator.clipboard.writeText(
      'curl -fsSL https://raw.githubusercontent.com/MandemGibson/lit/main/install.sh | sh'
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
    if (!isoStr) return '';
    const diff = Date.now() - new Date(isoStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  // ── Tabs ────────────────────────────────────────────────────────
  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: RxPerson },
    { id: 'security', name: 'Security & Auth', icon: RxLockClosed },
    { id: 'cli', name: 'CLI Access & Install', icon: RxCode },
    { id: 'notifications', name: 'Notifications', icon: RxBell },
  ];

  // ── Render tab content ──────────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      // ────────── PROFILE ──────────
      case 'profile':
        return (
          <div className="space-y-6 animate-fade-in text-[#f4f4f5]">
            <div>
              <h3 className="text-sm font-bold text-[#f4f4f5]">Profile Details</h3>
              <p className="mt-1 text-xs text-zinc-400">
                Update your display name and view your account info.
              </p>
            </div>

            {profileLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center space-x-4">
                  {profile?.avatar ? (
                    <img
                      className="h-16 w-16 rounded-full object-cover border border-[#27272a]"
                      src={profile.avatar}
                      alt={profile.name}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100 text-2xl font-bold">
                      {profileName
                        ? profileName.substring(0, 2).toUpperCase()
                        : profile?.email
                        ? profile.email.substring(0, 2).toUpperCase()
                        : 'U'}
                    </div>
                  )}
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="block w-full px-3 py-1.5 border border-[#27272a] bg-[#09090b] text-xs rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="block w-full px-3 py-1.5 border border-[#27272a] bg-[#09090b] text-xs rounded-lg text-zinc-500 focus:outline-none font-mono cursor-not-allowed"
                    />
                  </div>
                </div>

                {profile?.joinedOn && (
                  <p className="text-[10px] text-zinc-500">
                    Member since{' '}
                    {new Date(profile.joinedOn).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-full transition-colors duration-150"
                  >
                    {savingProfile ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      // ────────── SECURITY ──────────
      case 'security':
        return (
          <div className="space-y-6 animate-fade-in text-[#f4f4f5]">
            <div>
              <h3 className="text-sm font-bold text-[#f4f4f5]">Security Settings</h3>
              <p className="mt-1 text-xs text-zinc-400">
                Change your credentials or enable account-level protection modules.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-350">Update Password</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="relative">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="block w-full px-3 py-1.5 pr-9 border border-[#27272a] bg-[#09090b] text-xs rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showCurrentPw ? <RxEyeClosed className="h-3.5 w-3.5" /> : <RxEyeOpen className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      placeholder="New password (min 8 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full px-3 py-1.5 pr-9 border border-[#27272a] bg-[#09090b] text-xs rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showNewPw ? <RxEyeClosed className="h-3.5 w-3.5" /> : <RxEyeOpen className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-3 py-1.5 border border-[#27272a] bg-[#09090b] text-xs rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-full transition-colors duration-150 mt-2"
                >
                  {changingPassword ? 'Updating…' : 'Update Password'}
                </button>
              </div>

              <div className="border-t border-[#27272a] pt-5">
                <h4 className="text-xs font-bold text-[#f4f4f5]">
                  Two-Factor Authentication (2FA)
                </h4>
                <p className="mt-1 text-xs text-zinc-400">
                  Secure your projects with secondary dynamic login tokens.
                </p>
                {profileLoading ? (
                  <div className="mt-3 w-5 h-5 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin" />
                ) : confirmMfaOpen ? (
                  <form onSubmit={handleToggleMfa} className="mt-4 space-y-3 p-4 bg-[#1f1f23] border border-[#27272a] rounded-xl max-w-md">
                    <p className="text-xs text-zinc-300 font-semibold">
                      Type your password to confirm {profile?.mfaEnabled ? 'disabling' : 'enabling'} Two-Factor Authentication.
                    </p>
                    <input
                      type="password"
                      value={mfaPassword}
                      onChange={(e) => setMfaPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="block w-full px-3 py-1.5 border border-[#27272a] bg-[#09090b] text-xs rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        type="submit"
                        disabled={togglingMfa}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-full transition-colors duration-150"
                      >
                        {togglingMfa ? 'Confirming…' : 'Confirm'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmMfaOpen(false);
                          setMfaPassword('');
                        }}
                        className="px-3.5 py-1.5 border border-[#27272a] text-xs font-semibold rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition-colors duration-150"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : profile?.mfaEnabled ? (
                  <div className="mt-3 flex items-center space-x-3">
                    <button
                      onClick={() => setConfirmMfaOpen(true)}
                      className="px-3.5 py-1.5 border border-zinc-700 text-xs font-semibold rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors duration-150"
                    >
                      Disable 2FA Protection
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmMfaOpen(true)}
                    className="mt-3 px-3.5 py-1.5 border border-blue-900/50 text-xs font-semibold rounded-full text-blue-400 bg-blue-950/20 hover:bg-blue-950/40 transition-colors duration-150"
                  >
                    Enable 2FA Protection
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      // ────────── CLI ──────────
      case 'cli':
        return (
          <div className="space-y-6 animate-fade-in text-[#f4f4f5]">
            <div>
              <h3 className="text-sm font-bold text-[#f4f4f5]">CLI Access & Configuration</h3>
              <p className="mt-1 text-xs text-zinc-400">
                Install the command-line helper to sync and pull environment secrets.
              </p>
            </div>

            {/* Mock macOS Terminal */}
            <div className="rounded-xl overflow-hidden border border-[#27272a] bg-[#09090b]">
              <div className="bg-[#18181b] px-4 py-2 flex items-center justify-between border-b border-[#27272a]">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-zinc-800 rounded-full border border-zinc-700" />
                  <div className="w-2.5 h-2.5 bg-zinc-800 rounded-full border border-zinc-700" />
                  <div className="w-2.5 h-2.5 bg-zinc-800 rounded-full border border-zinc-700" />
                  <span className="text-[10px] font-bold text-zinc-500 ml-2 uppercase tracking-wider">
                    Terminal
                  </span>
                </div>
                <button
                  onClick={handleCopyInstall}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                  title="Copy command"
                >
                  {installCopied ? (
                    <RxCheck className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <RxCopy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="p-5 font-mono text-xs leading-relaxed text-[#f4f4f5] overflow-auto select-all">
                <span className="text-blue-500">$</span> curl -fsSL
                https://raw.githubusercontent.com/MandemGibson/lit/main/install.sh | sh
              </div>
            </div>

            {/* Personal Access Tokens */}
            <div className="space-y-5 border-t border-[#27272a] pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#f4f4f5]">Personal Access Tokens</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Authorized tokens used to authenticate CLI pull/push commands.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowTokenForm(true);
                    setNewlyCreatedToken(null);
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full transition-colors duration-150 flex items-center space-x-1.5"
                >
                  <RxPlus className="h-3 w-3" />
                  <span>Generate Token</span>
                </button>
              </div>

              {/* New token banner */}
              {newlyCreatedToken && (
                <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 space-y-2">
                  <p className="text-[11px] font-bold text-emerald-400">
                    ✓ Token created — copy it now, it won't be shown again.
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 p-2 bg-[#09090b] border border-[#27272a] rounded-lg text-xs font-mono text-emerald-300 select-all overflow-x-auto">
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
                <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 space-y-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Token Label
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newTokenLabel}
                      onChange={(e) => setNewTokenLabel(e.target.value)}
                      placeholder="e.g. My MacBook Pro"
                      className="flex-1 px-3 py-1.5 border border-[#27272a] bg-[#18181b] text-xs rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                    <button
                      onClick={handleGenerateToken}
                      disabled={creatingToken}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-full transition-colors duration-150"
                    >
                      {creatingToken ? 'Creating…' : 'Create'}
                    </button>
                    <button
                      onClick={() => {
                        setShowTokenForm(false);
                        setNewTokenLabel('');
                      }}
                      className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      <RxCross2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Token list */}
              {cliTokens.length > 0 ? (
                <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 divide-y divide-[#27272a]">
                  {cliTokens.map((token) => (
                    <div
                      key={token.id}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-[#f4f4f5]">{token.label}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          Created {relativeTime(token.createdOn)}
                          {token.lastUsedOn && ` • Last used ${relativeTime(token.lastUsedOn)}`}
                        </p>
                        <code className="mt-2 block p-1.5 bg-[#18181b] border border-[#27272a] rounded-lg text-xs font-mono text-zinc-400 w-fit">
                          {token.prefix}••••••••••••••••••••
                        </code>
                      </div>
                      <button
                        onClick={() => handleRevokeToken(token.id)}
                        className="text-xs font-semibold text-red-400 hover:bg-red-950/20 px-3 py-1 rounded-full border border-red-900/30 transition-colors duration-150"
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-6 text-center">
                  <p className="text-xs text-zinc-500">
                    No tokens yet. Generate one to authenticate your CLI.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      // ────────── NOTIFICATIONS ──────────
      case 'notifications':
        return (
          <div className="space-y-6 animate-fade-in text-[#f4f4f5]">
            <div>
              <h3 className="text-sm font-bold text-[#f4f4f5]">Notification Preferences</h3>
              <p className="mt-1 text-xs text-zinc-400">
                Decide what alerts and status updates you want to receive.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  key: 'secretUpdatesEnabled' as const,
                  title: 'Environment Secret Updates',
                  desc: 'Notify when keys are added, updated, or removed from your projects.',
                },
                {
                  key: 'collabRequestsEnabled' as const,
                  title: 'Collaboration Requests',
                  desc: 'Notify when you are invited to join other team projects.',
                },
                {
                  key: 'cliActivityEnabled' as const,
                  title: 'CLI Push/Pull Activity',
                  desc: 'Notify when CLI runs pull/push operations against your projects.',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3.5 bg-[#09090b] rounded-xl border border-[#27272a]"
                >
                  <div>
                    <p className="text-xs font-semibold text-[#f4f4f5]">{item.title}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</p>
                  </div>
                  {/* Custom toggle switch */}
                  <button
                    role="switch"
                    aria-checked={notifPrefs[item.key]}
                    onClick={() =>
                      setNotifPrefs((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                    }
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notifPrefs[item.key] ? 'bg-blue-600' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifPrefs[item.key] ? 'translate-x-4' : 'translate-x-0'
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
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-full transition-colors duration-150"
              >
                {savingNotifs ? 'Saving…' : 'Save Preferences'}
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
      <div className="space-y-8 animate-fade-in text-[#f4f4f5]">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#f4f4f5]">Settings</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Manage your account preferences, credentials, and CLI binaries.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <div className="w-full lg:w-64 bg-[#18181b] border border-[#27272a] rounded-xl p-3 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-2.5 text-xs font-semibold rounded-full transition-all space-x-3 ${
                    isActive
                      ? 'bg-[#27272a] text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                  }`}
                >
                  <Icon className="h-4 w-4 text-zinc-400" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 w-full space-y-6">
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
              {renderTabContent()}
            </div>

            {/* Danger Zone */}
            <div className="bg-[#18181b] border border-red-950 rounded-xl p-6">
              <div className="flex items-center space-x-2.5">
                <RxTrash className="h-4 w-4 text-red-400" />
                <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                  Danger Zone
                </h3>
              </div>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed max-w-2xl">
                Permanently delete your Lit Envs account. This action is irreversible, and all
                encrypted project variables, collaboration logs, and access tokens will be destroyed
                immediately.
              </p>

              {!confirmDeleteOpen ? (
                <button
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="mt-4 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-full transition-colors duration-150 focus:outline-none"
                >
                  Delete Account
                </button>
              ) : (
                <div className="mt-4 space-y-3 p-4 bg-red-950/10 border border-red-900/30 rounded-xl">
                  <p className="text-xs text-red-300 font-semibold">
                    Type your password to confirm account deletion.
                  </p>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="block w-full max-w-sm px-3 py-1.5 border border-red-900/40 bg-[#09090b] text-xs rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold rounded-full transition-colors duration-150"
                    >
                      {deletingAccount ? 'Deleting…' : 'Confirm Delete'}
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDeleteOpen(false);
                        setDeletePassword('');
                      }}
                      className="px-3.5 py-1.5 border border-[#27272a] text-xs font-semibold rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition-colors duration-150"
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