import React, { useState } from 'react';
import { User, Shield, Terminal, Bell, Trash2, Check, Copy } from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: User },
    { id: 'security', name: 'Security & Auth', icon: Shield },
    { id: 'cli', name: 'CLI Access & Install', icon: Terminal },
    { id: 'notifications', name: 'Notifications', icon: Bell },
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
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Profile Details
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Update your account email and personal profile details.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-center space-x-4">
                {user?.avatar ? (
                  <img
                    className="h-16 w-16 rounded-full object-cover ring-4 ring-blue-500/10"
                    src={user.avatar}
                    alt={user.name}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-blue-500/10">
                    {user?.name ? user.name.substring(0, 2).toUpperCase() : (user?.email ? user.email.substring(0, 2).toUpperCase() : 'U')}
                  </div>
                )}
                <div>
                  <button className="px-3.5 py-1.5 border border-gray-250 dark:border-slate-800 text-xs font-semibold rounded-lg text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-850 transition-colors shadow-sm">
                    Change Photo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.name || ''}
                    className="block w-full px-3 py-2 border border-gray-250 dark:border-slate-850 bg-white dark:bg-slate-900 text-sm rounded-lg text-gray-955 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="block w-full px-3 py-2 border border-gray-250 dark:border-slate-850 bg-white dark:bg-slate-900 text-sm rounded-lg text-gray-955 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white text-sm font-semibold rounded-lg shadow-md shadow-blue-500/10 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Security Settings
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Change your credentials or enable account-level protection modules.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Update Password
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="password"
                    placeholder="Current password"
                    className="block w-full px-3 py-2 border border-gray-250 dark:border-slate-850 bg-white dark:bg-slate-900 text-sm rounded-lg text-gray-955 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    className="block w-full px-3 py-2 border border-gray-250 dark:border-slate-850 bg-white dark:bg-slate-900 text-sm rounded-lg text-gray-955 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="block w-full px-3 py-2 border border-gray-250 dark:border-slate-850 bg-white dark:bg-slate-900 text-sm rounded-lg text-gray-955 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button className="px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors mt-2">
                  Update Password
                </button>
              </div>

              <div className="border-t border-gray-150 dark:border-slate-850 pt-5">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Two-Factor Authentication (2FA)
                </h4>
                <p className="mt-1 text-xs text-gray-550 dark:text-slate-400">
                  Secure your projects with secondary dynamic login tokens.
                </p>
                <button className="mt-3 px-3.5 py-1.5 border border-blue-200 dark:border-blue-900 text-xs font-semibold rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50/20 dark:bg-blue-950/10 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                  Enable 2FA Protection
                </button>
              </div>
            </div>
          </div>
        );

      case 'cli':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                CLI Access & Configuration
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Install the command-line helper to sync and pull environment secrets instantly inside local projects.
              </p>
            </div>

            {/* Mock macOS Terminal for curl command */}
            <div className="rounded-xl overflow-hidden border border-gray-250 dark:border-slate-800 shadow-md">
              <div className="bg-gray-150 dark:bg-[#1f2937] px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 ml-2">Terminal</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded text-gray-400 hover:text-gray-650 hover:bg-gray-200 dark:hover:bg-slate-800 transition-all"
                  title="Copy command"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="bg-[#0B0F19] p-5 font-mono text-sm leading-relaxed text-slate-100 overflow-auto select-all">
                <span className="text-blue-400">$</span> curl -fsSL https://raw.githubusercontent.com/MandemGibson/lit/main/install.sh | sh
              </div>
            </div>

            <div className="space-y-5 border-t border-gray-150 dark:border-slate-850 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Personal Access Tokens
                  </h4>
                  <p className="text-xs text-gray-550 dark:text-slate-450 mt-0.5">
                    Authorized tokens used to authenticate CLI pull/push commands.
                  </p>
                </div>
                <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-750 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors">
                  Generate Token
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-slate-900/40 border border-gray-150 dark:border-slate-850 rounded-xl p-4 divide-y divide-gray-100 dark:divide-slate-800">
                <div className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                      Default Developer CLI Token
                    </p>
                    <p className="text-[11px] text-gray-450 dark:text-slate-500 mt-0.5">
                      Created 2 days ago • Last used 1 hour ago
                    </p>
                    <code className="mt-2 block p-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md text-xs font-mono text-gray-500 dark:text-slate-450 w-fit">
                      se_••••••••••••••••••••••••••••••••
                    </code>
                  </div>
                  <button className="text-xs font-bold text-red-600 hover:text-red-750 hover:bg-red-50 dark:hover:bg-red-950/20 px-2.5 py-1.5 rounded-lg transition-colors">
                    Revoke
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Notification Preferences
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Decide what alerts and status updates you want to receive.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-900/20 rounded-xl border border-gray-150 dark:border-slate-850">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Environment Secret Updates
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-450 mt-0.5">
                    Notify when keys are added, updated, or removed from your projects.
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4.5 w-4.5 text-blue-600 focus:ring-blue-500 border-gray-305 dark:border-slate-700 bg-white dark:bg-slate-900 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-900/20 rounded-xl border border-gray-150 dark:border-slate-850">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Collaboration Requests
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-450 mt-0.5">
                    Notify when you are invited to join other team projects.
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4.5 w-4.5 text-blue-600 focus:ring-blue-500 border-gray-305 dark:border-slate-700 bg-white dark:bg-slate-900 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-900/20 rounded-xl border border-gray-150 dark:border-slate-850">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    CLI Push/Pull Activity
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-450 mt-0.5">
                    Notify when CLI runs pull/push operations against your projects.
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-4.5 w-4.5 text-blue-600 focus:ring-blue-500 border-gray-305 dark:border-slate-700 bg-white dark:bg-slate-900 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
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
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-450">
            Manage your account preferences, credentials, and CLI binaries.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <div className="w-full lg:w-64 bg-white dark:bg-[#111827] border border-gray-200/60 dark:border-slate-800/60 rounded-xl p-3 shadow-sm space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 font-bold'
                      : 'text-gray-650 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 mr-3 text-gray-400" />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 w-full space-y-6">
            <div className="bg-white dark:bg-[#111827] border border-gray-200/60 dark:border-slate-800/60 rounded-xl p-6 shadow-sm">
              {renderTabContent()}
            </div>

            {/* Danger Zone */}
            <div className="bg-white dark:bg-[#111827] border border-red-200 dark:border-red-900/60 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2.5">
                <Trash2 className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-bold text-red-700 dark:text-red-400">
                  Danger Zone
                </h3>
              </div>
              <p className="mt-2 text-xs text-gray-550 dark:text-slate-400 leading-relaxed max-w-2xl">
                Permanently delete your Lit Envs account. This action is irreversible, and all encrypted project variables, collaboration logs, and access tokens will be destroyed immediately.
              </p>
              <button className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500">
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