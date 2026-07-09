import React from "react";
import { Link } from "react-router-dom";
import logoImg from "../assets/logo.png";

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-zinc-800 pb-20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#09090b]/90 border-b border-[#27272a] backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="bg-[#18181b] p-0.5 rounded-md border border-[#27272a] flex items-center justify-center">
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
          <Link
            to="/"
            className="px-3.5 py-1.5 bg-[#18181b] border border-[#27272a] text-zinc-300 hover:bg-zinc-900 text-xs font-semibold rounded-full transition-colors duration-150"
          >
            Go Home
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pt-16">
        <div className="border-b border-[#27272a] pb-8 mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-[#f4f4f5]">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed max-w-2xl">
            Last Updated: July 9, 2026. This Privacy Policy describes how Lit Envs collects, uses, and handles your information when you use our client binaries, website, and dashboard tools.
          </p>
        </div>

        <div className="space-y-8 text-xs text-zinc-350 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-[#f4f4f5]">1. Zero-Knowledge Encryption</h2>
            <p>
              Your security and trust are our top priorities. Lit Envs uses client-side and rest encryption protocols (AES-256) to ensure that environment secrets and configuration values are encrypted prior to being transmitted or stored. We do not store or have access to your decryption keys in plain text.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-[#f4f4f5]">2. Information We Collect</h2>
            <p>
              We collect minimal information necessary to provide, manage, and authenticate access to your environment variable workspaces:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account Credentials:</strong> Basic contact details such as your email address when registering for an account.</li>
              <li><strong>Metadata Logs:</strong> Non-sensitive metadata about push, pull, and access events (e.g., timestamps, action type, client user-agents) for auditing.</li>
              <li><strong>CLI Identifiers:</strong> Secure tokens generated during client authentication to authorize terminal operations.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-[#f4f4f5]">3. How We Use Information</h2>
            <p>
              The information we collect is utilized strictly for the following purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To authenticating access to your workspace repositories and preventing unauthorized environment access.</li>
              <li>To displaying clinical audit logs within your dashboard, helping team administrators track security history.</li>
              <li>To sending security alerts, verification links, and critical system notifications.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-[#f4f4f5]">4. Data Sharing and Third Parties</h2>
            <p>
              We do not sell, rent, or distribute your email addresses or account metadata to third-party advertisers or data brokers. Data is shared exclusively with infrastructure sub-processors essential to hosting our application (e.g., secure database host providers, email dispatch systems) operating under strict confidentiality compliance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-[#f4f4f5]">5. Your Rights and Data Erasure</h2>
            <p>
              You hold complete control over your credentials and projects. You may delete environment workspaces or request permanent account erasure at any time directly through your account Settings. Upon erasure, all related vaults, metadata, and user information will be permanently purged from our active systems.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-[#f4f4f5]">6. Updates to this Policy</h2>
            <p>
              We may revise this Privacy Policy periodically. If any changes are material, we will post notice visible on our dashboard or contact you directly via your registered email address.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
