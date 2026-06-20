import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  RxGear,
  RxExit,
  RxChevronDown,
  RxLockClosed
} from 'react-icons/rx';
import { useAuth } from '../../contexts/AuthContext';
import logoImg from '../../assets/logo.png';

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
    { name: 'Overview', href: '/dashboard', active: false },
    { name: 'Secrets', href: '#', active: true },
    { name: 'Settings', href: '/settings', active: false },
  ];

  return (
    <div className="h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans overflow-hidden">
      {/* Top Header Navigation */}
      <header className="h-16 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between px-6 flex-shrink-0 z-40 relative">
        {/* Left Side: Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="bg-[#27272a] p-0.5 rounded-lg border border-[#3f3f46] group-hover:border-zinc-500 transition-colors duration-200 flex items-center justify-center">
            <img src={logoImg} alt="Lit Envs Logo" className="h-5 w-5 object-contain" />
          </div>
          <span className="text-sm font-bold tracking-tight text-[#f4f4f5]">
            Lit Envs
          </span>
        </Link>

        {/* Right Side: Navigation & Profile Dropdown */}
        <div className="flex items-center space-x-4">
          {/* Segmented Controls for Navigation Tabs */}
          <nav className="flex bg-[#09090b] p-0.5 rounded-full border border-[#27272a] w-fit">
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
                  className={`text-[11px] font-bold px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                    isCurrent
                      ? 'bg-[#27272a] text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Avatar with dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-1.5 p-0.5 rounded-full hover:bg-zinc-800 transition-colors focus:outline-none border border-transparent hover:border-[#27272a]"
            >
              {user?.avatar ? (
                <img
                  className="h-7 w-7 rounded-full object-cover border border-[#27272a]"
                  src={user.avatar}
                  alt={user.name}
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100 text-xs font-bold">
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
                
                <div className="absolute right-0 mt-2 w-52 bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-[#27272a] mb-1.5">
                    <p className="text-xs font-bold text-white truncate">{user?.name || 'User'}</p>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">{user?.email}</p>
                  </div>
                  
                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-2 text-xs font-semibold text-zinc-350 hover:bg-zinc-900 hover:text-white transition-colors"
                  >
                    <RxGear className="h-4 w-4 mr-2.5 text-zinc-500" />
                    Settings
                  </Link>
                  
                  <div className="h-[1px] bg-[#27272a] my-1" />
                  
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
      <main className="flex-1 min-w-0 overflow-y-auto py-8 px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
