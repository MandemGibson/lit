import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  RxCode,
  RxEnter,
  RxLayers,
  RxUpload,
  RxArrowDown,
  RxCopy,
  RxCheck,
  RxReload,
  RxPlus,
  RxGear,
} from "react-icons/rx";
import logoImg from "../assets/logo.png";

const DocsPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const installCmd =
    "curl -fsSL https://raw.githubusercontent.com/MandemGibson/lit/main/install.sh | sh";

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-[#f4f4f5] font-sans selection:bg-slate-200 dark:selection:bg-zinc-800 pb-20 transition-colors">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-sm border-b border-slate-200 dark:border-zinc-800/80">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="bg-slate-100 dark:bg-[#18181b] p-1 rounded-lg border border-slate-200 dark:border-[#27272a] flex items-center justify-center">
              <img
                src={logoImg}
                alt="Lit Envs Logo"
                className="h-5 w-5 object-contain"
              />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-[#f4f4f5]">
              Lit Envs
            </span>
          </Link>
          <Link
            to="/dashboard"
            className="px-3.5 py-1.5 bg-slate-900 dark:bg-[#18181b] border border-slate-800 dark:border-[#27272a] text-white dark:text-zinc-300 hover:bg-slate-800 dark:hover:bg-zinc-900 text-xs font-semibold rounded-xl transition-all shadow-xs"
          >
            Go to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pt-12">
        <div className="border-b border-slate-200 dark:border-[#27272a] pb-8 mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-mono mb-4">
            <RxCode className="h-3.5 w-3.5" />
            <span>Lit CLI v1.4 Documentation</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-[#f4f4f5]">
            Lit CLI Documentation
          </h1>
          <p className="mt-2 text-xs md:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
            The Lit CLI helper is a zero-latency binary designed to pull, push, and sync end-to-end encrypted environment secrets across multi-environment setups and monorepo service scopes.
          </p>
        </div>

        <div className="space-y-12">
          {/* Step 1: Install CLI */}
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#f4f4f5] mb-1.5">
                1. Install the CLI
              </h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mb-3 leading-relaxed">
                Run the following automated installation script in your terminal (macOS & Linux):
              </p>
              <div className="relative flex items-center bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] p-4 rounded-xl font-mono text-xs text-slate-800 dark:text-zinc-300 shadow-xs">
                <span className="select-all overflow-x-auto pr-12 font-mono">
                  {installCmd}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Copy command"
                >
                  {copied ? (
                    <RxCheck className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <RxCopy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-2">
                Or manually download release binaries from{" "}
                <a
                  href="https://github.com/MandemGibson/lit/releases"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                >
                  GitHub Releases
                </a>.
              </p>
            </div>
          </div>

          {/* Step 2: Init & Project Linking */}
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#f4f4f5] mb-1.5">
                2. Initialize Workspace Link
              </h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mb-3 leading-relaxed">
                Link your current repository or folder with Lit Envs by executing:
              </p>
              <pre className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] p-4 rounded-xl text-xs font-mono text-slate-800 dark:text-zinc-300 shadow-xs">
                lit init
              </pre>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-3 mb-2 leading-relaxed">
                This configures your local workspace and ensures local secrets files are excluded in your <code className="px-1 py-0.5 bg-slate-200 dark:bg-zinc-800 rounded text-slate-800 dark:text-zinc-300 font-mono text-[11px]">.gitignore</code>.
              </p>
            </div>
          </div>

          {/* Multi-Env & Service Scope Section */}
          <div className="p-6 bg-slate-100/80 dark:bg-[#121215]/60 border border-slate-200 dark:border-zinc-800/80 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-mono flex items-center space-x-1.5">
              <RxGear className="h-4 w-4" />
              <span>Multi-Environment & Monorepo Scope Flags</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Lit CLI supports target environments (<code className="font-mono text-slate-800 dark:text-zinc-300">-e / --env</code>) and monorepo service scopes (<code className="font-mono text-slate-800 dark:text-zinc-300">-s / --scope</code>) on pull, push, and set operations:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 font-mono text-xs">
              <div className="p-3 bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] uppercase text-slate-400 dark:text-zinc-500 font-bold block">Environments (-e)</span>
                <p className="text-slate-800 dark:text-zinc-300 font-bold">development | staging | production</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-500 font-normal">e.g. lit pull -e dev, lit pull -e prod</p>
              </div>
              <div className="p-3 bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1">
                <span className="text-[10px] uppercase text-slate-400 dark:text-zinc-500 font-bold block">Service Scopes (-s)</span>
                <p className="text-cyan-600 dark:text-cyan-400 font-bold">default | client | server | worker</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-500 font-normal">e.g. lit pull -e dev -s client</p>
              </div>
            </div>
          </div>

          {/* CLI Commands Section */}
          <div className="pt-10 border-t border-slate-200 dark:border-[#27272a]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-8 font-mono">
              Complete Command Reference
            </h2>
            <div className="space-y-8">
              {/* login */}
              <div className="flex gap-4 items-start">
                <div className="mt-1 flex-shrink-0 text-emerald-500">
                  <RxEnter className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold font-mono text-slate-900 dark:text-[#f4f4f5]">
                    lit login
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 mb-2 leading-relaxed">
                    Authenticate your local terminal session with the Lit platform to generate secure local auth tokens.
                  </p>
                  <pre className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] p-3 rounded-xl font-mono text-xs text-slate-800 dark:text-zinc-300 w-full sm:w-fit shadow-xs">
                    lit login
                  </pre>
                </div>
              </div>

              {/* select */}
              <div className="flex gap-4 items-start">
                <div className="mt-1 flex-shrink-0 text-amber-500">
                  <RxLayers className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold font-mono text-slate-900 dark:text-[#f4f4f5]">
                    lit select
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 mb-2 leading-relaxed">
                    Interactively switch active project workspace context.
                  </p>
                  <pre className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] p-3 rounded-xl font-mono text-xs text-slate-800 dark:text-zinc-300 w-full sm:w-fit shadow-xs">
                    lit select
                  </pre>
                </div>
              </div>

              {/* pull */}
              <div className="flex gap-4 items-start">
                <div className="mt-1 flex-shrink-0 text-blue-500">
                  <RxArrowDown className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold font-mono text-slate-900 dark:text-[#f4f4f5]">
                    lit pull [-e environment] [-s scope]
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 mb-2 leading-relaxed">
                    Decrypt and pull latest secrets from remote server into your local <code className="font-mono text-slate-800 dark:text-zinc-300">.env</code> file.
                  </p>
                  <pre className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] p-3 rounded-xl font-mono text-xs text-slate-800 dark:text-zinc-300 w-full sm:w-fit leading-relaxed shadow-xs">
                    lit pull{"\n"}# Specify environment:{"\n"}lit pull -e dev{"\n"}# Specify environment and scope:{"\n"}lit pull -e prod -s server
                  </pre>
                </div>
              </div>

              {/* push */}
              <div className="flex gap-4 items-start">
                <div className="mt-1 flex-shrink-0 text-indigo-500 dark:text-indigo-400">
                  <RxUpload className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold font-mono text-slate-900 dark:text-[#f4f4f5]">
                    lit push [-e environment] [-s scope]
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 mb-2 leading-relaxed">
                    Encrypt and push local <code className="font-mono text-slate-800 dark:text-zinc-300">.env</code> variables to the specified environment and scope vault.
                  </p>
                  <pre className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] p-3 rounded-xl font-mono text-xs text-slate-800 dark:text-zinc-300 w-full sm:w-fit leading-relaxed shadow-xs">
                    lit push{"\n"}lit push -e staging{"\n"}lit push -e dev -s client
                  </pre>
                </div>
              </div>

              {/* set */}
              <div className="flex gap-4 items-start">
                <div className="mt-1 flex-shrink-0 text-cyan-500 dark:text-cyan-400">
                  <RxPlus className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold font-mono text-slate-900 dark:text-[#f4f4f5]">
                    lit set KEY VALUE [--push] [-e env] [-s scope]
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 mb-2 leading-relaxed">
                    Set or update a variable key-value pair locally, with optional auto-push flag.
                  </p>
                  <pre className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] p-3 rounded-xl font-mono text-xs text-slate-800 dark:text-zinc-300 w-full sm:w-fit leading-relaxed shadow-xs">
                    lit set DATABASE_URL postgres://...{"\n"}# Auto push to production vault:{"\n"}lit set API_SECRET xxx --push -e prod
                  </pre>
                </div>
              </div>

              {/* update */}
              <div className="flex gap-4 items-start">
                <div className="mt-1 flex-shrink-0 text-rose-500 dark:text-rose-400">
                  <RxReload className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold font-mono text-slate-900 dark:text-[#f4f4f5]">
                    lit update
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 mb-2 leading-relaxed">
                    Check and automatically upgrade your local binary to the latest CLI release.
                  </p>
                  <pre className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] p-3 rounded-xl font-mono text-xs text-slate-800 dark:text-zinc-300 w-full sm:w-fit shadow-xs">
                    lit update
                  </pre>
                </div>
              </div>

              {/* version */}
              <div className="flex gap-4 items-start">
                <div className="mt-1 flex-shrink-0 text-slate-400 dark:text-zinc-500">
                  <RxCode className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold font-mono text-slate-900 dark:text-[#f4f4f5]">
                    lit version
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 mb-2 leading-relaxed">
                    Print active binary version and build info.
                  </p>
                  <pre className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] p-3 rounded-xl font-mono text-xs text-slate-800 dark:text-zinc-300 w-full sm:w-fit shadow-xs">
                    lit version
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
