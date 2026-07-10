import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  RxReload,
  RxEnvelopeClosed,
  RxCheck,
  RxArrowLeft,
} from "react-icons/rx";
import logoImg from "../assets/logo.png";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsLoading(false);
    setIsSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex items-center justify-center p-6 transition-colors duration-200">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div>
          {/* Logo Branding */}
          <Link to="/" className="inline-flex items-center space-x-2.5 group">
            <div className="bg-[#18181b] p-0.5 rounded-lg border border-[#27272a] group-hover:border-zinc-550 transition-colors duration-200 flex items-center justify-center flex-shrink-0">
              <img
                src={logoImg}
                alt="Lit Envs Logo"
                className="h-5 w-5 object-contain"
              />
            </div>
            <span className="text-sm font-bold tracking-tight text-[#f4f4f5]">
              Lit Envs
            </span>
          </Link>

          <h2 className="mt-8 text-3xl font-bold tracking-tight text-[#f4f4f5] leading-tight">
            Reset Your <br /> Password
          </h2>
          <p className="mt-2 text-xs text-zinc-400">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-6">
            <div className="bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 p-4.5 rounded-2xl text-xs font-semibold flex items-start space-x-3">
              <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <RxCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-white mb-0.5">Check your email</p>
                <p className="text-[11px] text-zinc-450 leading-relaxed font-medium">
                  We've sent a password reset link to <span className="text-white font-mono font-bold">{email}</span>.
                </p>
              </div>
            </div>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <RxArrowLeft className="h-4 w-4 mr-1.5" />
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5"
              >
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
                  className="block w-full pl-10 pr-3 py-2 border border-[#27272a] rounded-xl bg-[#09090b] text-xs placeholder-zinc-650 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500 font-mono"
                  placeholder="name@example.com"
                />
                <RxEnvelopeClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full flex justify-center py-2.5 btn-cyan-glossy text-xs font-bold rounded-xl text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <RxReload className="h-4 w-4 animate-spin text-white" />
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </div>

            <div className="pt-4 border-t border-[#27272a] text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <RxArrowLeft className="h-4 w-4 mr-1.5" />
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;