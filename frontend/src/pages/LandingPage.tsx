import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  RxCheck
} from 'react-icons/rx';
import { useAuth } from '../contexts/AuthContext';
import dashboardMockup from '../assets/dashboard_mockup.png';
import logoImg from '../assets/logo.png';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const { user } = useAuth();

  const handleCopyInstall = () => {
    navigator.clipboard.writeText('curl -fsSL https://raw.githubusercontent.com/MandemGibson/lit/main/install.sh | sh');
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  const features = [
    {
      icon: RxLockClosed,
      title: 'AES-256 Encryption',
      description: 'Your environment secrets are securely encrypted at rest and in transit.'
    },
    {
      icon: RxPerson,
      title: 'Granular Access',
      description: 'Invite collaborators to sync environment variables with absolute safety.'
    },
    {
      icon: RxCode,
      title: 'Powerful CLI Tool',
      description: 'Run syncs and pulls directly from local terminal prompts.'
    },
    {
      icon: RxGlobe,
      title: 'Multi-Environment',
      description: 'Switch between Development, Staging, and Production environments instantly.'
    },
    {
      icon: RxCheckCircled,
      title: 'Clinical Audit Logs',
      description: 'Monitor every single push, pull, and access event in real-time.'
    },
    {
      icon: RxLockClosed,
      title: 'Zero-Knowledge Storage',
      description: 'We store encrypted byte strings and never see keys in plain text.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Lead Developer, TechCorp',
      content: 'Lit Envs transformed how we sync project variables. The CLI is incredibly fast and secure.'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'DevOps Lead, StartupXYZ',
      content: 'Finally, a clean vault interface that shares secrets without complex cloud setups.'
    },
    {
      name: 'Emily Watson',
      role: 'CTO, InnovateLabs',
      content: 'Best workflow tool for setting up local development environments. Minimalist and robust.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Developer',
      price: 'Free',
      description: 'For personal projects',
      features: ['3 projects', '50 variables', 'AES encryption', 'CLI access'],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Team',
      price: '$29',
      period: '/mo',
      description: 'For active startups',
      features: ['Unlimited projects', '1,000 variables', 'Advanced audit logs', 'Team sharing'],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For compliance environments',
      features: ['Unlimited variables', 'Dedicated support', 'SSO authentication', 'Custom API access'],
      cta: 'Contact Sales',
      popular: false
    }
  ];

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
      `}</style>
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#09090b]/90 border-b border-[#27272a] backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="bg-[#18181b] p-0.5 rounded-md border border-[#27272a] flex items-center justify-center">
              <img src={logoImg} alt="Lit Envs Logo" className="h-5 w-5 object-contain" />
            </div>
            <span className="text-sm font-bold tracking-tight text-[#f4f4f5]">
              Lit Envs
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="/docs" className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors">Docs</a>
            <a href="#pricing" className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors">Pricing</a>
            <span className="w-px h-4 bg-[#27272a]"></span>
            
            {!user?.email ? (
              <>
                <Link to="/login" className="text-xs font-semibold text-zinc-450 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="px-3.5 py-1.5 bg-[#f4f4f5] hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-full transition-colors">
                  Get Started
                </Link>
              </>
            ) : (
              <Link to="/dashboard" className="px-3.5 py-1.5 bg-[#f4f4f5] hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-full transition-colors">
                Dashboard
              </Link>
            )}
          </nav>

          {/* Mobile Nav Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-1 text-zinc-400 hover:text-white focus:outline-none"
          >
            {isMenuOpen ? <RxCross1 className="h-5 w-5" /> : <RxHamburgerMenu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-b border-[#27272a] bg-[#09090b] px-6 py-4 space-y-3 flex flex-col">
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-xs font-semibold text-zinc-400 hover:text-white">Features</a>
            <a href="/docs" onClick={() => setIsMenuOpen(false)} className="text-xs font-semibold text-zinc-400 hover:text-white">Docs</a>
            <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-xs font-semibold text-zinc-400 hover:text-white">Pricing</a>
            <div className="h-px bg-[#27272a] my-2"></div>
            {!user?.email ? (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-xs font-semibold text-zinc-400 hover:text-white">
                  Sign In
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 bg-[#f4f4f5] hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-full text-center">
                  Get Started
                </Link>
              </>
            ) : (
              <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 bg-[#f4f4f5] hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-full text-center">
                Dashboard
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#27272a] py-20 md:py-28">
        {/* Background Animation & Glows */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
          {/* Subtle repeating grid overlay */}
          <div className="absolute inset-0 grid-pattern opacity-60" />
          
          {/* Soft multi-layered animated glow centers */}
          <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-[120px] animate-pulse-glow" />
          <div className="absolute top-[10%] left-[25%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] animate-float-glow" />
          <div className="absolute top-[35%] right-[20%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[110px] animate-pulse-glow" style={{ animationDelay: '-5s' }} />

          {/* Linear blend to match base theme background */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#09090b] to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-8 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-[#18181b] border border-[#27272a] px-3 py-1 rounded-full">
              <RxStarFilled className="h-3.5 w-3.5 text-yellow-500" />
              <span className="text-[10px] font-bold text-zinc-350 tracking-wide uppercase">Used by developer teams</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Sync your environment secrets.
              <span className="block text-zinc-500 font-normal mt-1">Simple, clinical security.</span>
            </h1>
            
            <p className="text-sm text-zinc-450 leading-relaxed max-w-lg">
              Store, collaborate, and push/pull configuration variables with zero-knowledge AES-256 cloud encryption. Integrate your terminal directly using our clean binaries.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <Link to="/signup" className="px-4 py-2 bg-[#f4f4f5] hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-full transition-colors inline-flex items-center shadow-sm">
                Get Started for Free <RxArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
              <a target="_blank" rel="noreferrer" href="https://github.com/MandemGibson/lit" className="px-4 py-2 bg-[#18181b] hover:bg-zinc-900 border border-[#27272a] text-zinc-350 text-xs font-semibold rounded-full transition-colors inline-flex items-center">
                <RxGithubLogo className="mr-2 h-3.5 w-3.5" /> View GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Terminal Command Line Section */}
      <section className="bg-[#18181b]/30 border-y border-[#27272a] py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5 space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">One-Line installation</h2>
            <p className="text-xs text-zinc-450 leading-relaxed">
              Install the Lit Envs command-line tool instantly. Access environment sync options across Darwin, Linux, or Windows terminals.
            </p>
            <div className="pt-2 flex flex-col space-y-2">
              <div className="flex items-center text-[11px] text-zinc-400">
                <RxCheckCircled className="text-emerald-500 mr-2 h-4.5 w-4.5" /> Automatic client-side encryption
              </div>
              <div className="flex items-center text-[11px] text-zinc-400">
                <RxCheckCircled className="text-emerald-500 mr-2 h-4.5 w-4.5" /> Zero dependencies needed
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
                  <span className="text-[10px] font-mono text-zinc-500 ml-2">zsh</span>
                </div>
                <button
                  onClick={handleCopyInstall}
                  className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
                  title="Copy command"
                >
                  {copiedInstall ? <RxCheck className="h-3.5 w-3.5 text-emerald-500" /> : <RxCopy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="p-5 font-mono text-xs leading-relaxed text-zinc-300 space-y-1 overflow-x-auto select-all">
                <div><span className="text-blue-500">$</span> curl -fsSL https://raw.githubusercontent.com/MandemGibson/lit/main/install.sh | sh</div>
                <div className="text-zinc-500">✓ Lit CLI installed successfully to ~/.lit/bin/lit</div>
                <div><span className="text-blue-500">$</span> lit login</div>
                <div className="text-zinc-500">✓ Authenticated successfully as developer</div>
                <div><span className="text-blue-500">$</span> lit select</div>
                <div className="text-zinc-500">✓ Project selected: Alpha-Vault</div>
                <div><span className="text-blue-500">$</span> lit pull</div>
                <div className="text-emerald-500">✓ Environment variables written to .env</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">Built for security, refined for simplicity</h2>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">No complex configurations. Standard developer flow focusing on secret safety.</p>
        </div>

        {/* Dashboard Mockup Screenshot */}
        <div className="max-w-4xl mx-auto rounded-xl overflow-hidden border border-[#27272a] bg-[#18181b]/20 p-2 shadow-2xl relative">
          <div className="bg-[#18181b] px-4 py-2 flex items-center justify-between border-b border-[#27272a] rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-zinc-850 border border-zinc-700"></div>
              <div className="w-2 h-2 rounded-full bg-zinc-850 border border-zinc-700"></div>
              <div className="w-2 h-2 rounded-full bg-zinc-850 border border-zinc-700"></div>
              <span className="text-[9px] font-bold text-zinc-500 ml-2 uppercase tracking-wider">Lit Envs Dashboard</span>
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
              <div key={idx} className="bg-[#18181b]/30 border border-[#27272a] rounded-xl p-6 space-y-3">
                <div className="p-2 bg-[#18181b] border border-[#27272a] rounded-lg w-fit text-zinc-300">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-bold text-white">{feature.title}</h3>
                <p className="text-xs text-zinc-450 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Grid */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20 space-y-12 border-t border-[#27272a]">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">Simple Pricing</h2>
          <p className="text-xs text-zinc-500">Always free for individual developers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {pricingPlans.map((plan, idx) => {
            return (
              <div
                key={idx}
                className={`border rounded-xl p-6 flex flex-col justify-between ${
                  plan.popular
                    ? 'bg-[#18181b]/50 border-blue-500/50'
                    : 'bg-[#18181b]/20 border-[#27272a]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">{plan.name}</span>
                    {plan.popular && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-950 text-blue-400 border border-blue-900/50">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline mb-2">
                    <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                    {plan.period && <span className="text-xs text-zinc-550 ml-1">{plan.period}</span>}
                  </div>
                  <p className="text-[11px] text-zinc-500 mb-6">{plan.description}</p>
                  
                  <ul className="space-y-2.5 mb-8">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center text-xs text-zinc-400">
                        <RxCheckCircled className="text-zinc-500 mr-2 h-4 w-4 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to="/signup"
                  className={`w-full py-1.5 text-xs font-bold rounded-full text-center transition-colors block ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow shadow-blue-500/10'
                      : 'bg-[#18181b] hover:bg-zinc-900 border border-[#27272a] text-zinc-300'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#18181b]/20 border-t border-[#27272a] py-20">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Developer feedback</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test, idx) => {
              return (
                <div key={idx} className="bg-[#18181b]/30 border border-[#27272a] rounded-xl p-6 flex flex-col justify-between">
                  <p className="text-xs italic text-zinc-300 leading-relaxed">"{test.content}"</p>
                  <div className="mt-5 border-t border-[#27272a] pt-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{test.name}</span>
                    <span className="text-[10px] text-zinc-500">{test.role}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#27272a] bg-[#09090b] py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center space-x-2.5">
            <div className="bg-[#18181b] p-0.5 rounded border border-[#27272a] flex items-center justify-center">
              <img src={logoImg} alt="Lit Envs Logo" className="h-4 w-4 object-contain" />
            </div>
            <span className="font-semibold text-zinc-350">Lit Envs</span>
            <span>© 2026 Lit Envs. All rights reserved.</span>
          </div>

          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a target="_blank" rel="noreferrer" href="https://github.com/MandemGibson/lit" className="hover:text-white transition-colors flex items-center">
              <RxGithubLogo className="mr-1.5 h-3.5 w-3.5" /> GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
