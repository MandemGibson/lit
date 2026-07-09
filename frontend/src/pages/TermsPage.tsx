import React from "react";
import { Link } from "react-router-dom";
import logoImg from "../assets/logo.png";

const TermsPage: React.FC = () => {
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
            Terms of Service
          </h1>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed max-w-2xl">
            Last Updated: July 9, 2026. Please read these Terms of Service ("Terms") carefully before using the Lit Envs CLI binaries, website, and management software.
          </p>
        </div>

        <div className="space-y-8 text-xs text-zinc-355 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-[#f4f4f5]">1. Acceptance of Terms</h2>
            <p>
              By accessing, installing, or executing the Lit Envs binaries (including command line tools) or accessing the online dashboard, you agree to be bound by these Terms. If you do not agree, you must terminate usage immediately and uninstall all client integrations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-[#f4f4f5]">2. Account Security and Authentication</h2>
            <p>
              You are responsible for keeping your local CLI authentication tokens and workspace credentials secure. You agree to notify us immediately of any unauthorized access, breach, or leak of secrets. Lit Envs cannot and will not be liable for any losses or exposure resulting from your failure to safeguard local credentials or keys.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-[#f4f4f5]">3. Acceptable Use and Restrictions</h2>
            <p>
              You agree not to use the service to store or transmit malware, content violating active copyright regulations, or data that violates standard security laws. You may not attempt to reverse engineer, disrupt, or bypass the decryption walls, access controls, or rate limit headers of the Lit Envs backend servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-[#f4f4f5]">4. Subscription Fees and Billing</h2>
            <p>
              Individual developer plans are free. Commercial team plans are billed on a recurring monthly subscription model. All fees are non-refundable. We reserve the right to modify pricing schedules with 30 days notice to active accounts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-[#f4f4f5]">5. Disclaimer of Warranties</h2>
            <p>
              LIT ENVS IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT SECRET DATA WILL NEVER BE LOST OR EXPOSED DUE TO CLIENT MISCONFIGURATION OR KEY COMPROMISE.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-[#f4f4f5]">6. Limitation of Liability</h2>
            <p>
              IN NO EVENT SHALL LIT ENVS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOSS OF REVENUE, PROFITS, OR CONFIGURATION DATA, ARISING FROM OR IN CONNECTION WITH THE SERVICES, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-[#f4f4f5]">7. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction of execution, without regard to its conflict of law principles.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
