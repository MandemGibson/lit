import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  RxDashboard,
  RxGear,
  RxExit,
  RxPerson,
  RxChevronDown,
  RxLockClosed,
  RxLayers,
  RxFileText,
  RxActivityLog
} from 'react-icons/rx';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: RxDashboard },
    { name: 'Environments', href: '#', icon: RxLayers, disabled: true },
    { name: 'Secrets', href: '#', icon: RxLockClosed, active: true },
    { name: 'Policies', href: '#', icon: RxFileText, disabled: true },
    { name: 'Access Logs', href: '#', icon: RxActivityLog, disabled: true },
    { name: 'Settings', href: '/settings', icon: RxGear },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col md:flex-row font-sans">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-[#18181b] border-b md:border-b-0 md:border-r border-[#27272a] flex flex-col justify-between flex-shrink-0 z-35">
        <div>
          {/* Header Brand */}
          <div className="h-16 flex items-center px-6 border-b border-[#27272a]">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="bg-[#27272a] p-1.5 rounded-lg border border-[#3f3f46]">
                <RxLockClosed className="h-5 w-5 text-white" />
              </div>
              <span className="text-md font-bold tracking-tight text-[#f4f4f5]">
                Lit Envs
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isCurrent = location.pathname === item.href || (item.active && location.pathname.startsWith('/project/'));
              
              if (item.disabled) {
                return (
                  <div
                    key={item.name}
                    className="flex items-center px-3 py-2 text-xs font-semibold text-zinc-650 cursor-not-allowed select-none space-x-3"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-colors space-x-3 ${
                    isCurrent
                      ? 'bg-[#27272a] text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Section */}
        <div className="p-4 border-t border-[#27272a] relative">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity focus:outline-none"
            >
              {user?.avatar ? (
                <img
                  className="h-8 w-8 rounded-full object-cover border border-[#27272a]"
                  src={user.avatar}
                  alt={user.name}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100 text-xs font-bold">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : (user?.email ? user.email.substring(0, 2).toUpperCase() : 'U')}
                </div>
              )}
              <div className="text-left max-w-[120px]">
                <p className="text-xs font-semibold text-[#f4f4f5] truncate">{user?.name}</p>
                <div className="flex items-center text-[10px] text-zinc-500 font-medium mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-550 mr-1.5"></span>
                  online
                </div>
              </div>
              <RxChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            </button>
          </div>

          {/* Profile Dropdown */}
          {dropdownOpen && (
            <div className="absolute left-4 bottom-16 right-4 bg-[#18181b] border border-[#27272a] rounded-xl shadow-xl py-1 z-50 animate-fade-in">
              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center px-4 py-2 text-xs font-semibold text-zinc-350 hover:bg-zinc-900 transition-colors"
              >
                <RxPerson className="h-4 w-4 mr-2.5 text-zinc-400" />
                Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/20 transition-colors text-left"
              >
                <RxExit className="h-4 w-4 mr-2.5 text-red-400" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto py-8 px-6 md:px-8">
        <div className="max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
