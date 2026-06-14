import React, { useState } from 'react';
import {
  RxPerson,
  RxLockClosed,
  RxCode,
  RxBell,
  RxTrash,
  RxCheck,
  RxCopy
} from 'react-icons/rx';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: RxPerson },
    { id: 'security', name: 'Security & Auth', icon: RxLockClosed },
    { id: 'cli', name: 'CLI Access & Install', icon: RxCode },
    { id: 'notifications', name: 'Notifications', icon: RxBell },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText('curl -fsSL https://raw.githubusercontent.com/MandemGibson/lit/main/install.sh | sh');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6 animate-fade-in text-[#f4f4f5]">
            <div>
              <h3 className="text-sm font-bold text-[#f4f4f5]">
                Profile Details
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Update your account email and personal profile details.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-center space-x-4">
                {user?.avatar ? (
                  <img
                    className="h-16 w-16 rounded-full object-cover border border-[#27272a]"
                    src={user.avatar}
                    alt={user.name}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100 text-2xl font-bold">
                    {user?.name ? user.name.substring(0, 2).toUpperCase() : (user?.email ? user.email.substring(0, 2).toUpperCase() : 'U')}
                  </div>
                )}
                <div>
                  <button className="px-3 py-1 border border-[#27272a] text-xs font-semibold rounded-full text-zinc-350 bg-[#09090b] hover:bg-zinc-900 transition-colors duration-150">
                    Change Photo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.name || ''}
                    className="block w-full px-3 py-1.5 border border-[#27272a] bg-[#09090b] text-xs rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="block w-full px-3 py-1.5 border border-[#27272a] bg-[#09090b] text-xs rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full transition-colors duration-150">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6 animate-fade-in text-[#f4f4f5]">
            <div>
              <h3 className="text-sm font-bold text-[#f4f4f5]">
                Security Settings
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Change your credentials or enable account-level protection modules.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-350">
                  Update Password
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="password"
                    placeholder="Current password"
                    className="block w-full px-3 py-1.5 border border-[#27272a] bg-[#09090b] text-xs rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    className="block w-full px-3 py-1.5 border border-[#27272a] bg-[#09090b] text-xs rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="block w-full px-3 py-1.5 border border-[#27272a] bg-[#09090b] text-xs rounded-lg text-[#f4f4f5] focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
                <button className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full transition-colors duration-150 mt-2">
                  Update Password
                </button>
              </div>

              <div className="border-t border-[#27272a] pt-5">
                <h4 className="text-xs font-bold text-[#f4f4f5]">
                  Two-Factor Authentication (2FA)
                </h4>
                <p className="mt-1 text-xs text-zinc-400">
                  Secure your projects with secondary dynamic login tokens.
                </p>
                <button className="mt-3 px-3.5 py-1.5 border border-blue-900/50 text-xs font-semibold rounded-full text-blue-400 bg-blue-950/20 hover:bg-blue-950/40 transition-colors duration-150">
                  Enable 2FA Protection
                </button>
              </div>
            </div>
          </div>
        );

      case 'cli':
        return (
          <div className="space-y-6 animate-fade-in text-[#f4f4f5]">
            <div>
              <h3 className="text-sm font-bold text-[#f4f4f5]">
                CLI Access & Configuration
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Install the command-line helper to sync and pull environment secrets instantly inside local projects.
              </p>
            </div>

            {/* Mock macOS Terminal for curl command */}
            <div className="rounded-xl overflow-hidden border border-[#27272a] bg-[#09090b]">
              <div className="bg-[#18181b] px-4 py-2 flex items-center justify-between border-b border-[#27272a]">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-zinc-800 rounded-full border border-zinc-700"></div>
                  <div className="w-2.5 h-2.5 bg-zinc-800 rounded-full border border-zinc-700"></div>
                  <div className="w-2.5 h-2.5 bg-zinc-800 rounded-full border border-zinc-700"></div>
                  <span className="text-[10px] font-bold text-zinc-500 ml-2 uppercase tracking-wider">Terminal</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                  title="Copy command"
                >
                  {copied ? <RxCheck className="h-4 w-4 text-emerald-500" /> : <RxCopy className="h-4 w-4" />}
                </button>
              </div>
              <div className="p-5 font-mono text-xs leading-relaxed text-[#f4f4f5] overflow-auto select-all">
                <span className="text-blue-500">$</span> curl -fsSL https://raw.githubusercontent.com/MandemGibson/lit/main/install.sh | sh
              </div>
            </div>

            <div className="space-y-5 border-t border-[#27272a] pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#f4f4f5]">
                    Personal Access Tokens
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Authorized tokens used to authenticate CLI pull/push commands.
                  </p>
                </div>
                <button className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full transition-colors duration-150">
                  Generate Token
                </button>
              </div>

              <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 divide-y divide-[#27272a]">
                <div className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#f4f4f5]">
                      Default Developer CLI Token
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Created 2 days ago • Last used 1 hour ago
                    </p>
                    <code className="mt-2 block p-1.5 bg-[#18181b] border border-[#27272a] rounded-lg text-xs font-mono text-zinc-400 w-fit">
                      se_••••••••••••••••••••••••••••••••
                    </code>
                  </div>
                  <button className="text-xs font-semibold text-red-400 hover:bg-red-950/20 px-3 py-1 rounded-full border border-red-900/30 transition-colors duration-150">
                    Revoke
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6 animate-fade-in text-[#f4f4f5]">
            <div>
              <h3 className="text-sm font-bold text-[#f4f4f5]">
                Notification Preferences
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Decide what alerts and status updates you want to receive.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-[#09090b] rounded-xl border border-[#27272a]">
                <div>
                  <p className="text-xs font-semibold text-[#f4f4f5]">
                    Environment Secret Updates
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Notify when keys are added, updated, or removed from your projects.
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-[#27272a] bg-[#09090b] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#09090b] rounded-xl border border-[#27272a]">
                <div>
                  <p className="text-xs font-semibold text-[#f4f4f5]">
                    Collaboration Requests
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Notify when you are invited to join other team projects.
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-[#27272a] bg-[#09090b] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#09090b] rounded-xl border border-[#27272a]">
                <div>
                  <p className="text-xs font-semibold text-[#f4f4f5]">
                    CLI Push/Pull Activity
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Notify when CLI runs pull/push operations against your projects.
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-[#27272a] bg-[#09090b] rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full transition-colors duration-150">
                Save Preferences
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in text-[#f4f4f5]">
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
                Permanently delete your Lit Envs account. This action is irreversible, and all encrypted project variables, collaboration logs, and access tokens will be destroyed immediately.
              </p>
              <button className="mt-4 px-3.5 py-1.5 bg-red-650 hover:bg-red-700 text-white text-xs font-semibold rounded-full transition-colors duration-150 focus:outline-none">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;