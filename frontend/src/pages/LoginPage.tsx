import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RxEyeOpen, RxEyeNone, RxReload, RxEnvelopeClosed, RxLockClosed } from 'react-icons/rx';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from 'axios';
import { BACKEND_URL } from '../configs/constants';
import litAuthIllustration from '../assets/lit_auth_illustration.png';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await axiosInstance.post(`${BACKEND_URL}/auths/obtain-token`, { email, password });
      login(res.data.data);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#09090b] text-[#f4f4f5] transition-colors duration-200">
      
      {/* Left Column: Form Parent (Centers the form) */}
      <div className="flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <Link to="/" className="inline-flex items-center space-x-2.5 group">
              <div className="bg-[#18181b] p-1.5 rounded-lg border border-[#27272a]">
                <RxLockClosed className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight text-[#f4f4f5]">
                Lit Envs
              </span>
            </Link>
            <h2 className="mt-8 text-3xl font-bold tracking-tight text-[#f4f4f5] leading-tight">
              Holla, <br /> Welcome Back
            </h2>
            <p className="mt-2 text-xs text-zinc-400">
              Hey, welcome back to your special place
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-950/20 border border-red-900 text-red-400 px-4 py-2.5 rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-[#27272a] rounded-lg bg-[#09090b] text-xs placeholder-zinc-650 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    placeholder="name@example.com"
                  />
                  <RxEnvelopeClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="password" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[10px] font-bold text-blue-500 hover:underline font-sans"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-[#27272a] rounded-lg bg-[#09090b] text-xs placeholder-zinc-650 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    placeholder="••••••••••••"
                  />
                  <RxLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-550 hover:text-white"
                  >
                    {showPassword ? <RxEyeNone className="h-4 w-4" /> : <RxEyeOpen className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-full text-white transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <RxReload className="h-4 w-4 animate-spin text-white" />
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-[#27272a]">
            <span className="text-xs text-zinc-400">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-bold text-blue-500 hover:underline"
              >
                Sign up
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Full Height Illustration */}
      <div className="hidden lg:block h-screen overflow-hidden">
        <img
          src={litAuthIllustration}
          alt="Lit Envs concept"
          className="w-full h-full object-cover"
        />
      </div>

    </div>
  );
};

export default LoginPage;
