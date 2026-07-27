import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  RxGear,
  RxExit,
  RxChevronDown,
  RxSun,
  RxMoon,
  RxDesktop,
} from 'react-icons/rx';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, ThemeMode } from '../../contexts/ThemeContext';
import logoImg from '../../assets/logo.png';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { mode, setMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Overview', href: '/dashboard', active: false },
    { name: 'Secrets', href: '#', active: true },
    { name: 'Settings', href: '/settings', active: false },
  ];

  const themeOptions: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
    { value: 'light', label: 'Light', icon: RxSun },
    { value: 'dark', label: 'Dark', icon: RxMoon },
    { value: 'system', label: 'System', icon: RxDesktop },
  ];

  return (
    <div className="h-[100dvh] bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans overflow-hidden relative">
      {/* Top Header Navigation */}
      <header className="absolute top-0 left-0 right-0 h-16 bg-[#09090b]/80 backdrop-blur-md flex items-center justify-between px-6 z-40">
        {/* Left Side: Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="bg-[#18181b] p-0.5 rounded-md border border-[#27272a] group-hover:border-zinc-500 transition-colors duration-200 flex items-center justify-center flex-shrink-0">
            <img src={logoImg} alt="Lit Envs Logo" className="h-5 w-5 object-contain" />
          </div>
          <span className="text-sm font-bold tracking-tight text-[#f4f4f5] hidden sm:block">
            Lit Envs
          </span>
        </Link>

        {/* Right Side: Navigation & Profile Dropdown */}
        <div className="flex items-center space-x-6">
          {/* Flat text navigation links */}
          <nav className="flex space-x-6">
            {navigation.map((item) => {
              const isCurrent = location.pathname === item.href || (item.active && location.pathname.startsWith('/project/'));
              
              // Only render Secrets if we are inside a project view
              if (item.name === 'Secrets' && !location.pathname.startsWith('/project/')) {
                return null;
              }

              // For Secrets tab, keep path unchanged so it behaves dynamically
              const targetHref = item.name === 'Secrets' ? location.pathname : item.href;

              return (
                <Link
                  key={item.name}
                  to={targetHref}
                  className={`text-xs font-bold transition-all relative py-2 ${
                    isCurrent
                      ? 'text-cyan-400'
                      : 'text-zinc-550 hover:text-zinc-300'
                  }`}
                >
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Avatar with dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-1.5 p-0.5 rounded-full hover:bg-zinc-800 transition-colors focus:outline-none"
            >
              {user?.avatar ? (
                <img
                  className="h-7 w-7 rounded-full object-cover border border-[#27272a]"
                  src={user.avatar}
                  alt={user.name}
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 text-xs font-bold font-mono">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : (user?.email ? user.email.substring(0, 2).toUpperCase() : 'U')}
                </div>
              )}
              <RxChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            {dropdownOpen && (
              <>
                {/* Click outside backdrop to close dropdown */}
                <div className="fixed inset-0 z-45 cursor-default" onClick={() => setDropdownOpen(false)}></div>
                
                <div className="absolute right-0 mt-2.5 w-56 bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-900 rounded-2xl shadow-2xl py-1.5 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-zinc-900/60 mb-1.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-550 truncate mt-0.5 font-mono">{user?.email}</p>
                  </div>

                  {/* Mode Selector Segment */}
                  <div className="px-3 py-2 border-b border-slate-200 dark:border-zinc-900/60 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 block mb-1.5">
                      Theme Mode
                    </span>
                    <div className="flex items-center justify-between p-1 bg-slate-100 dark:bg-[#121215] border border-slate-200 dark:border-zinc-900 rounded-xl">
                      {themeOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = mode === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setMode(opt.value)}
                            className={`flex-1 flex items-center justify-center space-x-1 py-1 px-1.5 text-[11px] font-bold rounded-lg transition-all ${
                              isSelected
                                ? 'bg-cyan-500/15 text-cyan-600 border border-cyan-500/30 dark:bg-cyan-600/20 dark:text-cyan-400'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/40 border border-transparent'
                            }`}
                            title={`Switch to ${opt.label} mode`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span className="capitalize">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-350 dark:hover:bg-[#121215]/60 dark:hover:text-white transition-colors"
                  >
                    <RxGear className="h-4 w-4 mr-2.5 text-slate-400 dark:text-zinc-500" />
                    Settings
                  </Link>
                  
                  <div className="h-[1px] bg-slate-200 dark:bg-zinc-900 my-1" />
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/20 transition-colors text-left"
                  >
                    <RxExit className="h-4 w-4 mr-2.5 text-red-400" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto pt-24 pb-8 px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
