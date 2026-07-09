import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  RxCheckCircled,
  RxChevronDown,
  RxChevronUp,
  RxHamburgerMenu,
  RxCross1,
  RxGithubLogo,
  RxArrowRight,
} from "react-icons/rx";
import { useAuth } from "../contexts/AuthContext";
import logoImg from "../assets/logo.png";
import Footer from "../components/landing/Footer";

const PricingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<
    "developer" | "team_monthly" | "team_annual"
  >("team_annual");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);
  const { user } = useAuth();

  const plans = [
    {
      id: "developer",
      name: "Developer",
      price: "$0",
      priceSub: "/mo",
      billingSub: "billed $0 forever",
      pillText: "Flexible",
      pillType: "normal",
      badge: null,
    },
    {
      id: "team_monthly",
      name: "Team Monthly",
      price: "$29",
      priceSub: "/mo",
      billingSub: "billed monthly",
      pillText: "Standard",
      pillType: "normal",
      badge: null,
    },
    {
      id: "team_annual",
      name: "Team Annual",
      price: "$23",
      priceSub: "/mo",
      billingSub: "$276 billed yearly",
      pillText: "Save 20%",
      pillType: "save",
      badge: "Best Value",
    },
  ];

  const planFeatures: Record<string, string[]> = {
    developer: [
      "3 active projects",
      "50 variables per project",
      "Zero-knowledge AES-256 encryption",
      "CLI push/pull access",
      "Community GitHub support",
    ],
    team_monthly: [
      "Unlimited projects & variables",
      "Clinical compliance audit logs",
      "Team sharing & access policies",
      "Workspace encryption keys",
      "Priority Slack & email support",
    ],
    team_annual: [
      "Everything in Team Monthly",
      "Discounted rate of $23/mo",
      "Unlimited projects & variables",
      "Clinical compliance audit logs",
      "Priority Slack & email support",
    ],
  };

  const faqs = [
    {
      q: "How does the zero-knowledge encryption model work?",
      a: "All project secrets are encrypted client-side using AES-256-GCM before they leave your computer. The encryption key resides in your local environment profile and is never sent to our servers. We host only raw encrypted byte arrays and can never decrypt or read your secrets.",
    },
    {
      q: "Can we self-host Lit Envs?",
      a: "Yes! Our CLI and orchestration servers are engineered with self-hosting in mind. For Teams accounts, we provide official Helm charts and Docker Compose templates, together with staging migration support.",
    },
    {
      q: "What happens if our team exceeds the project or variable limits?",
      a: "We never block runtime requests or builds. If you hit variable or project limit thresholds, we notify you and provide a 14-day grace period to adjust your setup or transition plans.",
    },
    {
      q: "Can I invite team members on the Free plan?",
      a: "The Developer plan is optimized for individual workflows. To invite team members, share dashboard keys, and establish access controls, you will need the Team plan.",
    },
    {
      q: "Is there a discount for annual billing?",
      a: "Yes! Choosing annual billing gives you a discount of over 20% compared to standard monthly billing. Annual plans are invoiced yearly.",
    },
  ];

  const toggleFaq = (idx: number) => {
    setOpenFaqIdx(openFaqIdx === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-zinc-800 transition-colors duration-200">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#09090b]/90 border-b border-[#27272a] backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
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

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/#features"
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              to="/docs"
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Docs
            </Link>
            <Link
              to="/pricing"
              className="text-xs font-semibold text-white transition-colors"
            >
              Pricing
            </Link>
            <span className="w-px h-4 bg-[#27272a]"></span>

            {!user?.email ? (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 bg-[#f4f4f5] hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-full transition-colors"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="px-3.5 py-1.5 bg-[#f4f4f5] hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-full transition-colors"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Mobile Nav Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-1 text-zinc-400 hover:text-white focus:outline-none"
          >
            {isMenuOpen ? (
              <RxCross1 className="h-5 w-5" />
            ) : (
              <RxHamburgerMenu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#09090b] border-b border-[#27272a] px-6 py-4 flex flex-col space-y-4">
            <Link
              to="/#features"
              onClick={() => setIsMenuOpen(false)}
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              to="/docs"
              onClick={() => setIsMenuOpen(false)}
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Docs
            </Link>
            <Link
              to="/pricing"
              onClick={() => setIsMenuOpen(false)}
              className="text-xs font-semibold text-white transition-colors"
            >
              Pricing
            </Link>
            <hr className="border-[#27272a]" />
            {!user?.email ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 bg-[#f4f4f5] hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-full text-center transition-colors"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 bg-[#f4f4f5] hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-full text-center transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-16 md:py-20 space-y-16">
        {/* Page Hero */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Choose your plan
          </h1>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Manage your environment variables securely with zero-knowledge
            encryption. Select a subscription below.
          </p>
        </div>

        {/* Interactive Selection Flow Wrapper */}
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex justify-between items-end">
            <h2 className="text-sm font-bold text-zinc-350 uppercase tracking-wide">
              Select Tier
            </h2>
          </div>

          {/* Grid of Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((p) => {
              const isSelected = selectedPlan === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id as any)}
                  className={`relative rounded-2xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 select-none bg-[#131316]/90 border min-h-[175px] ${
                    isSelected
                      ? "border-cyan-600/70 shadow-[0_0_25px_-5px_rgba(8,145,178,0.1)] z-10"
                      : "border-zinc-800/80 hover:border-zinc-700/80"
                  }`}
                >
                  {p.badge && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-bold bg-[#0c2a35] text-cyan-400 border border-cyan-800/40 uppercase tracking-wider shadow-sm whitespace-nowrap">
                      {p.badge}
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <span className="text-sm font-semibold text-zinc-300">
                      {p.name}
                    </span>
                    <div className="mt-0.5">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full border-2 border-cyan-600 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-zinc-700 flex items-center justify-center" />
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-black text-white tracking-tight">
                        {p.price}
                      </span>
                      {p.priceSub && (
                        <span className="text-xs text-zinc-500 ml-1 font-semibold">
                          {p.priceSub}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1 font-medium leading-none">
                      {p.billingSub}
                    </p>
                  </div>

                  <div className="mt-5">
                    {p.pillType === "save" ? (
                      <span className="bg-emerald-950/20 text-[#10b981] border border-emerald-900/30 px-3 py-1 rounded-full text-[10px] font-bold">
                        {p.pillText}
                      </span>
                    ) : (
                      <span className="bg-zinc-800/40 text-zinc-400 border border-zinc-700/30 px-3 py-1 rounded-full text-[10px] font-bold">
                        {p.pillText}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Plan Details Accordion-Box */}
          <div className="bg-[#131316]/50 rounded-2xl border border-zinc-800/60 p-6 transition-all duration-300">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
              Included in the {plans.find((p) => p.id === selectedPlan)?.name}{" "}
              Plan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {planFeatures[selectedPlan].map((feature, i) => (
                <div key={i} className="flex items-start text-xs text-zinc-300">
                  <RxCheckCircled className="mr-2.5 h-4 w-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Continue CTA Button */}
          <div className="pt-2">
            <Link
              to={
                selectedPlan === "developer"
                  ? "/signup?plan=dev"
                  : `/signup?plan=${selectedPlan}`
              }
              className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2 text-sm shadow-[0_4px_20px_rgba(8,145,178,0.1)] hover:shadow-[0_4px_25px_rgba(8,145,178,0.2)]"
            >
              <span>Continue</span>
              <RxArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-[11px] text-zinc-500 text-center block mt-3 select-none">
              Cancel anytime.
            </span>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="max-w-3xl mx-auto space-y-8 pt-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-zinc-500">
              Everything you need to know about Lit Envs credentials, limits,
              and security.
            </p>
          </div>

          <div className="divide-y divide-[#27272a] border-t border-b border-[#27272a]">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between text-left focus:outline-none group"
                  >
                    <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors pr-4">
                      {faq.q}
                    </span>
                    <span className="text-zinc-500 group-hover:text-zinc-350 transition-colors flex-shrink-0">
                      {isOpen ? (
                        <RxChevronUp className="h-4 w-4" />
                      ) : (
                        <RxChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100 mt-2.5"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs text-zinc-400 leading-relaxed pl-1 pb-1">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PricingPage;
