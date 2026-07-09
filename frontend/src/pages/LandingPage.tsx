import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  RxLockClosed,
  RxPerson,
  RxCode,
  RxGlobe,
  RxCheckCircled,
  RxArrowRight,
  RxHamburgerMenu,
  RxCross1,
  RxStarFilled,
  RxGithubLogo,
  RxCopy,
  RxCheck,
  RxChevronDown,
  RxChevronUp,
} from "react-icons/rx";
import { useAuth } from "../contexts/AuthContext";
import dashboardMockup from "../assets/dashboard_mockup.png";
import logoImg from "../assets/logo.png";
import Footer from "../components/landing/Footer";

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const { user } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--mouse-x", `${x}px`);
    el.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--mouse-opacity", "1");
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--mouse-opacity", "0");
  };

  const handleCopyInstall = () => {
    navigator.clipboard.writeText(
      "curl -fsSL https://raw.githubusercontent.com/MandemGibson/lit/main/install.sh | sh",
    );
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  const features = [
    {
      icon: RxLockClosed,
      title: "AES-256 Encryption",
      description:
        "Your environment secrets are securely encrypted at rest and in transit.",
    },
    {
      icon: RxPerson,
      title: "Granular Access",
      description:
        "Invite collaborators to sync environment variables with absolute safety.",
    },
    {
      icon: RxCode,
      title: "Powerful CLI Tool",
      description: "Run syncs and pulls directly from local terminal prompts.",
    },
    {
      icon: RxGlobe,
      title: "Multi-Environment",
      description:
        "Switch between Development, Staging, and Production environments instantly.",
    },
    {
      icon: RxCheckCircled,
      title: "Clinical Audit Logs",
      description:
        "Monitor every single push, pull, and access event in real-time.",
    },
    {
      icon: RxLockClosed,
      title: "Zero-Knowledge Storage",
      description:
        "We store encrypted byte strings and never see keys in plain text.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Lead Developer, TechCorp",
      content:
        "Lit Envs transformed how we sync project variables. The CLI is incredibly fast and secure.",
    },
    {
      name: "Marcus Rodriguez",
      role: "DevOps Lead, StartupXYZ",
      content:
        "Finally, a clean vault interface that shares secrets without complex cloud setups.",
    },
    {
      name: "Emily Watson",
      role: "CTO, InnovateLabs",
      content:
        "Best workflow tool for setting up local development environments. Minimalist and robust.",
    },
    {
      name: "David K.",
      role: "Senior Engineer, Vercel",
      content:
        "The client-side decryption is seamless. No keys are ever exposed in plain text to third parties.",
    },
    {
      name: "Liam Vance",
      role: "Frontend Architect, Supabase",
      content:
        "Replacing heavy secret management portals with simple CLI pushes saved hours of onboarding.",
    },
    {
      name: "Sophia Martinez",
      role: "Security Specialist, SecOps",
      content:
        "Standard compliance auditing out-of-the-box. We finally have a clinical record of secret logs.",
    },
    {
      name: "Alex Thompson",
      role: "Fullstack Developer, Freelance",
      content:
        "Having a zero-knowledge local environment vault is a game changer for freelance handoffs.",
    },
    {
      name: "Jessica Park",
      role: "Product Engineer, Stripe",
      content:
        "Simple, elegant, and extremely robust. The onboarding of new developers took less than five minutes.",
    },
  ];

  const testimonialsRow1 = testimonials.filter((_, idx) => idx % 2 === 0);
  const testimonialsRow2 = testimonials.filter((_, idx) => idx % 2 !== 0);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-zinc-800 transition-colors duration-200">
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.15;
            transform: scale(1) translate(0px, 0px) translate3d(0, 0, 0);
          }
          50% {
            opacity: 0.25;
            transform: scale(1.1) translate(10px, -10px) translate3d(0, 0, 0);
          }
        }
        @keyframes float-glow {
          0%, 100% {
            transform: translate(0px, 0px) translate3d(0, 0, 0);
          }
          50% {
            transform: translate(-15px, 15px) translate3d(0, 0, 0);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 10s ease-in-out infinite;
        }
        .animate-float-glow {
          animation: float-glow 15s ease-in-out infinite;
        }
        .grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          background-position: center center;
        }
        .cursor-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(
            600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(6, 182, 212, 0.15),
            transparent 80%
          );
          opacity: var(--mouse-opacity, 0);
          transition: opacity 0.5s ease;
        }
      `}</style>
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
            <a
              href="#features"
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="/docs"
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Docs
            </a>
            <Link
              to="/pricing"
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <span className="w-px h-4 bg-[#27272a]"></span>

            {!user?.email ? (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-zinc-450 hover:text-white transition-colors"
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

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-b border-[#27272a] bg-[#09090b] px-6 py-4 space-y-3 flex flex-col">
            <a
              href="#features"
              onClick={() => setIsMenuOpen(false)}
              className="text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Features
            </a>
            <a
              href="/docs"
              onClick={() => setIsMenuOpen(false)}
              className="text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Docs
            </a>
            <Link
              to="/pricing"
              onClick={() => setIsMenuOpen(false)}
              className="text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Pricing
            </Link>
            <div className="h-px bg-[#27272a] my-2"></div>
            {!user?.email ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-2 bg-[#f4f4f5] hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-full text-center"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="px-3 py-2 bg-[#f4f4f5] hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-full text-center"
              >
                Dashboard
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative overflow-hidden py-20 md:py-28"
      >
        {/* Background Animation & Glows */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
          {/* Subtle repeating grid overlay */}
          <div className="absolute inset-0 grid-pattern opacity-60" />

          {/* Soft multi-layered animated glow centers */}
          <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-[120px] animate-pulse-glow" />

          {/* Interactive cursor-following cyan gradient */}
          <div className="cursor-glow" />

          <div
            className="absolute top-[35%] right-[20%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[110px] animate-pulse-glow"
            style={{ animationDelay: "-5s" }}
          />

          {/* Linear blend to match base theme background */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#09090b] to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-8 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-[#18181b] border border-[#27272a] px-3 py-1 rounded-full">
              <RxStarFilled className="h-3.5 w-3.5 text-yellow-500" />
              <span className="text-[10px] font-bold text-zinc-350 tracking-wide uppercase">
                Used by developer teams
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Sync your environment secrets.
              <span className="block text-zinc-500 font-normal mt-1">
                Simple, clinical security.
              </span>
            </h1>

            <p className="text-sm text-zinc-450 leading-relaxed max-w-lg">
              Store, collaborate, and push/pull configuration variables with
              zero-knowledge AES-256 cloud encryption. Integrate your terminal
              directly using our clean binaries.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <Link
                to="/signup"
                className="px-4 py-2 bg-[#f4f4f5] hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-full transition-colors inline-flex items-center shadow-sm"
              >
                Get Started for Free{" "}
                <RxArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
              <a
                target="_blank"
                rel="noreferrer"
                href="https://github.com/MandemGibson/lit"
                className="px-4 py-2 bg-[#18181b] hover:bg-zinc-900 border border-[#27272a] text-zinc-350 text-xs font-semibold rounded-full transition-colors inline-flex items-center"
              >
                <RxGithubLogo className="mr-2 h-3.5 w-3.5" /> View GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Terminal Command Line Section */}
      <section className="bg-[#18181b]/30 py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5 space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">
              One-Line installation
            </h2>
            <p className="text-xs text-zinc-450 leading-relaxed">
              Install the Lit Envs command-line tool instantly. Access
              environment sync options across Darwin, Linux, or Windows
              terminals.
            </p>
            <div className="pt-2 flex flex-col space-y-2">
              <div className="flex items-center text-[11px] text-zinc-400">
                <RxCheckCircled className="text-emerald-500 mr-2 h-4.5 w-4.5" />{" "}
                Automatic client-side encryption
              </div>
              <div className="flex items-center text-[11px] text-zinc-400">
                <RxCheckCircled className="text-emerald-500 mr-2 h-4.5 w-4.5" />{" "}
                Zero dependencies needed
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="bg-[#09090b] rounded-xl border border-[#27272a] shadow-lg overflow-hidden">
              <div className="bg-[#18181b] px-4 py-2 flex items-center justify-between border-b border-[#27272a]">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-zinc-800 rounded-full border border-zinc-700"></div>
                  <div className="w-2.5 h-2.5 bg-zinc-800 rounded-full border border-zinc-700"></div>
                  <div className="w-2.5 h-2.5 bg-zinc-800 rounded-full border border-zinc-700"></div>
                  <span className="text-[10px] font-mono text-zinc-500 ml-2">
                    zsh
                  </span>
                </div>
                <button
                  onClick={handleCopyInstall}
                  className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
                  title="Copy command"
                >
                  {copiedInstall ? (
                    <RxCheck className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <RxCopy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <div className="p-5 font-mono text-xs leading-relaxed text-zinc-300 space-y-1 overflow-x-auto select-all">
                <div>
                  <span className="text-blue-500">$</span> curl -fsSL
                  https://raw.githubusercontent.com/MandemGibson/lit/main/install.sh
                  | sh
                </div>
                <div className="text-zinc-500">
                  ✓ Lit CLI installed successfully to ~/.lit/bin/lit
                </div>
                <div>
                  <span className="text-blue-500">$</span> lit login
                </div>
                <div className="text-zinc-500">
                  ✓ Authenticated successfully as developer
                </div>
                <div>
                  <span className="text-blue-500">$</span> lit select
                </div>
                <div className="text-zinc-500">
                  ✓ Project selected: Alpha-Vault
                </div>
                <div>
                  <span className="text-blue-500">$</span> lit pull
                </div>
                <div className="text-emerald-500">
                  ✓ Environment variables written to .env
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="max-w-6xl mx-auto px-6 py-20 space-y-10"
      >
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Built for security, refined for simplicity
          </h2>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            No complex configurations. Standard developer flow focusing on
            secret safety.
          </p>
        </div>

        {/* Dashboard Mockup Screenshot */}
        <div className="max-w-4xl mx-auto rounded-xl overflow-hidden border border-[#27272a] bg-[#18181b]/20 p-2 shadow-2xl relative">
          <div className="bg-[#18181b] px-4 py-2 flex items-center justify-between border-b border-[#27272a] rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-zinc-850 border border-zinc-700"></div>
              <div className="w-2 h-2 rounded-full bg-zinc-850 border border-zinc-700"></div>
              <div className="w-2 h-2 rounded-full bg-zinc-850 border border-zinc-700"></div>
              <span className="text-[9px] font-bold text-zinc-500 ml-2 uppercase tracking-wider">
                Lit Envs Dashboard
              </span>
            </div>
          </div>
          <img
            src={dashboardMockup}
            alt="Lit Envs Dashboard Mockup"
            className="w-full h-auto object-cover rounded-b-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-zinc-900/40 backdrop-blur-md shadow-xl rounded-xl p-6 space-y-3"
              >
                <Icon className="h-6 w-6 text-zinc-300" />
                <h3 className="text-sm font-bold text-white">
                  {feature.title}
                </h3>
                <p className="text-xs text-zinc-450 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#18181b]/20 py-24 overflow-hidden relative">
        <div className="space-y-16">
          <div className="text-center space-y-2 max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Developer feedback
            </h2>
          </div>

          <div className="space-y-6 w-full h-full relative">
            {/* Row 1: Moving Left */}
            <div className="flex overflow-x-hidden w-full relative">
              {/* Fade overlays for Row 1 */}
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#09090b] via-[#09090b]/85 to-transparent z-20 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#09090b] via-[#09090b]/85 to-transparent z-20 pointer-events-none" />
              <div className="animate-marquee-left hover:pause-marquee flex space-x-6 pr-6 min-w-full flex-shrink-0">
                {testimonialsRow1.map((test, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-900/30 backdrop-blur-md rounded-2xl p-6 w-[320px] sm:w-[380px] flex-shrink-0 flex flex-col justify-between transition-all duration-300 hover:bg-zinc-900/40 relative overflow-hidden group select-none"
                  >
                    <div>
                      <div className="text-3xl font-serif text-cyan-500/20 leading-none h-4 select-none mb-1">
                        “
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-normal relative z-10 whitespace-normal">
                        {test.content}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-800/40 flex items-center">
                      <div className="h-8 w-8 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[10px] font-semibold text-zinc-400 mr-3 flex-shrink-0">
                        {test.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-none">
                          {test.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500 mt-1 leading-none">
                          {test.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Duplicate Row 1 */}
                {testimonialsRow1.map((test, idx) => (
                  <div
                    key={`dup1-${idx}`}
                    className="bg-zinc-900/30 backdrop-blur-md rounded-2xl p-6 w-[320px] sm:w-[380px] flex-shrink-0 flex flex-col justify-between transition-all duration-300 hover:bg-zinc-900/40 relative overflow-hidden group select-none"
                  >
                    <div>
                      <div className="text-3xl font-serif text-cyan-500/20 leading-none h-4 select-none mb-1">
                        “
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-normal relative z-10 whitespace-normal">
                        {test.content}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-800/40 flex items-center">
                      <div className="h-8 w-8 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[10px] font-semibold text-zinc-400 mr-3 flex-shrink-0">
                        {test.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-none">
                          {test.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500 mt-1 leading-none">
                          {test.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2: Moving Right */}
            <div className="flex overflow-x-hidden w-full relative">
              {/* Fade overlays for Row 2 */}
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#09090b] via-[#09090b]/85 to-transparent z-20 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#09090b] via-[#09090b]/85 to-transparent z-20 pointer-events-none" />
              <div className="animate-marquee-right hover:pause-marquee flex space-x-6 pr-6 min-w-full flex-shrink-0">
                {testimonialsRow2.map((test, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-900/30 backdrop-blur-md rounded-2xl p-6 w-[320px] sm:w-[380px] flex-shrink-0 flex flex-col justify-between transition-all duration-300 hover:bg-zinc-900/40 relative overflow-hidden group select-none"
                  >
                    <div>
                      <div className="text-3xl font-serif text-cyan-500/20 leading-none h-4 select-none mb-1">
                        “
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-normal relative z-10 whitespace-normal">
                        {test.content}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-800/40 flex items-center">
                      <div className="h-8 w-8 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[10px] font-semibold text-zinc-400 mr-3 flex-shrink-0">
                        {test.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-none">
                          {test.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500 mt-1 leading-none">
                          {test.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Duplicate Row 2 */}
                {testimonialsRow2.map((test, idx) => (
                  <div
                    key={`dup2-${idx}`}
                    className="bg-zinc-900/30 backdrop-blur-md rounded-2xl p-6 w-[320px] sm:w-[380px] flex-shrink-0 flex flex-col justify-between transition-all duration-300 hover:bg-zinc-900/40 relative overflow-hidden group select-none"
                  >
                    <div>
                      <div className="text-3xl font-serif text-cyan-500/20 leading-none h-4 select-none mb-1">
                        “
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-normal relative z-10 whitespace-normal">
                        {test.content}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-800/40 flex items-center">
                      <div className="h-8 w-8 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[10px] font-semibold text-zinc-400 mr-3 flex-shrink-0">
                        {test.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-none">
                          {test.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500 mt-1 leading-none">
                          {test.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-3xl mx-auto space-y-8 py-20 px-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-zinc-500">
            Everything you need to know about Lit Envs credentials, limits, and security.
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
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
