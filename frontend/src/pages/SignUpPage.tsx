import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RxEyeOpen, RxEyeNone, RxReload, RxEnvelopeClosed, RxLockClosed } from 'react-icons/rx';
import axios from 'axios';
import { BACKEND_URL } from '../configs/constants';
import litAuthIllustration from '../assets/lit_auth_illustration.png';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${BACKEND_URL}/auths/register`,
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      navigate('/verify-user', { state: { pendingUserEmail: email } });
      console.log(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed');
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
              Get Started <br /> With Lit Envs
            </h2>
            <p className="mt-2 text-xs text-zinc-400">
              Manage your project environments with ultimate speed and safety.
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
                <label htmlFor="password" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-[#27272a] rounded-lg bg-[#09090b] text-xs placeholder-zinc-650 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    placeholder="Create password"
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
                <p className="mt-1 text-[9px] text-zinc-550">
                  Password must be at least 8 characters.
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-[#27272a] rounded-lg bg-[#09090b] text-xs placeholder-zinc-650 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    placeholder="Repeat password"
                  />
                  <RxLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
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
                  'Create account'
                )}
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-[#27272a]">
            <span className="text-xs text-zinc-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-blue-500 hover:underline"
              >
                Sign in
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

export default SignUpPage;
