import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RxDownload,
  RxCode,
  RxLightningBolt,
  RxEnter,
  RxLayers,
  RxUpload,
  RxArrowDown,
  RxCopy,
  RxCheck,
  RxLockClosed
} from 'react-icons/rx';

const DocsPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const installCmd = 'curl -fsSL https://raw.githubusercontent.com/MandemGibson/lit/main/install.sh | sh';

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-zinc-800 pb-20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#09090b]/90 border-b border-[#27272a] backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="bg-[#18181b] p-1 rounded-md border border-[#27272a]">
              <RxLockClosed className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-[#f4f4f5]">
              Lit Envs
            </span>
          </Link>
          <Link
            to="/dashboard"
            className="px-3.5 py-1.5 bg-[#18181b] border border-[#27272a] text-zinc-300 hover:bg-zinc-900 text-xs font-semibold rounded-full transition-colors duration-150"
          >
            Go to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pt-16">
        <div className="border-b border-[#27272a] pb-8 mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-[#f4f4f5]">
            Lit CLI Documentation
          </h1>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed max-w-2xl">
            The Lit CLI helper is a secure developer binary designed to sync, encrypt, and pull environment configurations instantly inside local build environments.
          </p>
        </div>

        <div className="space-y-12">
          {/* Step 1: Install CLI */}
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#18181b] border border-[#27272a] text-zinc-400 rounded-lg flex-shrink-0">
              <RxDownload className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-[#f4f4f5] mb-1.5">1. Install the CLI</h2>
              <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                Run the following command in your terminal to automatically download, install, and path the Lit binary on macOS or Linux:
              </p>
              <div className="relative flex items-center bg-[#18181b] border border-[#27272a] p-4 rounded-xl font-mono text-xs text-zinc-350">
                <span className="select-all overflow-x-auto pr-12 font-mono">{installCmd}</span>
                <button
                  onClick={handleCopy}
                  className="absolute right-3 p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Copy command"
                >
                  {copied ? <RxCheck className="w-4 h-4 text-emerald-500" /> : <RxCopy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">
                Alternatively, you can manually download the binaries from the{' '}
                <a
                  href="https://github.com/MandemGibson/lit/releases"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  GitHub Releases
                </a>{' '}
                repository.
              </p>
            </div>
          </div>

          {/* Step 2: Path & Permissions */}
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#18181b] border border-[#27272a] text-zinc-400 rounded-lg flex-shrink-0">
              <RxCode className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-[#f4f4f5] mb-1.5">2. Make the Binary Executable (Manual Install Only)</h2>
              <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                If you manually downloaded the binary, you must grant execution permissions before launching it:
              </p>
              <pre className="bg-[#18181b] border border-[#27272a] p-4 rounded-xl text-xs font-mono text-zinc-300">
                chmod +x ./lit
              </pre>
              <p className="text-xs text-zinc-400 mt-3 mb-2 leading-relaxed">
                Run the local command to view option flags:
              </p>
              <pre className="bg-[#18181b] border border-[#27272a] p-4 rounded-xl text-xs font-mono text-zinc-300">
                ./lit --help
              </pre>
            </div>
          </div>

          {/* Step 3: Init */}
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#18181b] border border-[#27272a] text-zinc-400 rounded-lg flex-shrink-0">
              <RxLightningBolt className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-[#f4f4f5] mb-1.5">3. Initialize Your Project</h2>
              <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                Link your current development workspace with Lit Envs by running:
              </p>
              <pre className="bg-[#18181b] border border-[#27272a] p-4 rounded-xl text-xs font-mono text-zinc-300">
                lit init
              </pre>
              <p className="text-xs text-zinc-400 mt-3 mb-2 leading-relaxed">
                This creates a configuration directory and appends default ignored patterns to your <code className="p-0.5 bg-[#18181b] rounded text-zinc-300 font-mono">.gitignore</code> file:
              </p>
              <pre className="bg-[#18181b] border border-[#27272a] p-4 rounded-xl text-xs font-mono text-zinc-300 leading-relaxed">
                .env{'\n'}.lit/{'\n'}*.secret
              </pre>
            </div>
          </div>

          {/* CLI Commands Section */}
          <div className="pt-10 border-t border-[#27272a]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-450 mb-8">Available Commands</h2>
            <div className="space-y-8">
              {/* login */}
              <div className="flex gap-4 items-start">
                <div className="mt-1 flex-shrink-0 text-emerald-500">
                  <RxEnter className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold font-mono text-[#f4f4f5]">lit login</h3>
                  <p className="text-xs text-zinc-400 mt-1 mb-2 leading-relaxed">
                    Authenticate your local terminal session with the Lit backend to generate and persist auth tokens locally.
                  </p>
                  <pre className="bg-[#18181b] border border-[#27272a] p-3 rounded-xl font-mono text-xs text-zinc-300 w-full sm:w-fit">
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
                  <h3 className="text-xs font-bold font-mono text-[#f4f4f5]">lit select</h3>
                  <p className="text-xs text-zinc-400 mt-1 mb-2 leading-relaxed">
                    Interactively select or switch your active working project context.
                  </p>
                  <pre className="bg-[#18181b] border border-[#27272a] p-3 rounded-xl font-mono text-xs text-zinc-300 w-full sm:w-fit">
                    lit select
                  </pre>
                </div>
              </div>

              {/* push */}
              <div className="flex gap-4 items-start">
                <div className="mt-1 flex-shrink-0 text-indigo-400">
                  <RxUpload className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold font-mono text-[#f4f4f5]">lit push</h3>
                  <p className="text-xs text-zinc-400 mt-1 mb-2 leading-relaxed">
                    Pushes the local configurations to the cloud server, updating environment configurations securely.
                  </p>
                  <pre className="bg-[#18181b] border border-[#27272a] p-3 rounded-xl font-mono text-xs text-zinc-300 w-full sm:w-fit">
                    lit push
                  </pre>
                </div>
              </div>

              {/* pull */}
              <div className="flex gap-4 items-start">
                <div className="mt-1 flex-shrink-0 text-blue-500">
                  <RxArrowDown className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold font-mono text-[#f4f4f5]">lit pull</h3>
                  <p className="text-xs text-zinc-400 mt-1 mb-2 leading-relaxed">
                    Pulls latest environment variables from remote server for local runtime access.
                  </p>
                  <pre className="bg-[#18181b] border border-[#27272a] p-3 rounded-xl font-mono text-xs text-zinc-300 w-full sm:w-fit">
                    lit pull
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Go to Dashboard */}
        <div className="mt-16 text-center pt-8 border-t border-[#27272a]">
          <Link
            to="/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-[#f4f4f5] px-5 py-2 text-xs font-semibold rounded-full transition-colors duration-150"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
