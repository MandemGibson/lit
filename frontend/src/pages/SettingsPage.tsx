import React, { useState } from 'react';
import { User, Shield, Terminal, Bell, Trash2 } from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'cli', name: 'CLI Access', icon: Terminal },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Profile Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Update your personal information and profile settings.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  className="h-16 w-16 rounded-full"
                  src={user?.avatar}
                  alt={user?.name}
                />
                <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500">
                  Change photo
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full name
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                  Save changes
                </button>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Security Settings
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Manage your account security and password.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Change Password
                </h4>
                <div className="mt-2 space-y-3">
                  <input
                    type="password"
                    placeholder="Current password"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                    Update password
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Two-Factor Authentication
                </h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add an extra layer of security to your account
                </p>
                <button className="mt-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border border-blue-300 rounded-md">
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        );

      case 'cli':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                CLI Access Tokens
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Manage tokens for CLI access to your projects.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400">
                Install the CLI
              </h4>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                First, install the SecureEnv CLI tool:
              </p>
              <code className="mt-2 block p-2 bg-white dark:bg-gray-800 rounded border text-sm font-mono">
                npm install -g @secureenv/cli
              </code>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Active Tokens
                </h4>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                  Generate new token
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Personal Access Token
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Created 2 days ago • Last used 1 hour ago
                      </p>
                    </div>
                    <button className="text-red-600 hover:text-red-700 text-sm">
                      Revoke
                    </button>
                  </div>
                  <code className="mt-2 block p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                    se_••••••••••••••••••••••••••••••••
                  </code>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Notification Preferences
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Choose what notifications you want to receive.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Environment variable changes
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified when variables are added, updated, or deleted
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Team invitations
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified when you're invited to a project
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    CLI activity
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified about CLI sync activities
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                Save preferences
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              {renderTabContent()}
            </div>

            {/* Danger Zone */}
            <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-center">
                <Trash2 className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="text-lg font-medium text-red-900 dark:text-red-400">
                  Danger Zone
                </h3>
              </div>
              <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                Once you delete your account, there is no going back. All your projects and data will be permanently deleted.
              </p>
              <button className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md">
                Delete account
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;