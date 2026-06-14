import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Users,
  Terminal,
  Zap,
  Globe,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Star,
  Github,
  Twitter,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import landingImg from "../assets/Animation - 1750827748544.json"
import Lottie from 'lottie-react';
//import { useTheme } from '../contexts/ThemeContext';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEncrypted, setShowEncrypted] = useState(false);
  //const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth()

  const features = [
    {
      icon: Shield,
      title: 'Military-Grade Encryption',
      description: 'Your environment variables are encrypted at rest and in transit using AES-256 encryption.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite team members with granular permissions. Control who can view, edit, or manage your secrets.'
    },
    {
      icon: Terminal,
      title: 'CLI Integration',
      description: 'Seamlessly sync your environment variables with our powerful CLI tool. Deploy with confidence.'
    },
    {
      icon: Globe,
      title: 'Multi-Environment',
      description: 'Manage variables across development, staging, and production environments effortlessly.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built for performance. Access your variables instantly with our global CDN infrastructure.'
    },
    {
      icon: Lock,
      title: 'Zero-Knowledge',
      description: 'We never see your secrets in plain text. Your data is encrypted before it reaches our servers.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Lead Developer at TechCorp',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=3B82F6&color=fff',
      content: 'SecureEnv transformed how we manage secrets across our microservices. The CLI integration is seamless.'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'DevOps Engineer at StartupXYZ',
      avatar: 'https://ui-avatars.com/api/?name=Marcus+Rodriguez&background=10B981&color=fff',
      content: 'Finally, a secure way to share environment variables with the team. The encryption gives us peace of mind.'
    },
    {
      name: 'Emily Watson',
      role: 'CTO at InnovateLabs',
      avatar: 'https://ui-avatars.com/api/?name=Emily+Watson&background=F59E0B&color=fff',
      content: 'The best investment we made for our security infrastructure. Simple, secure, and developer-friendly.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Developer',
      price: 'Free',
      description: 'Perfect for personal projects',
      features: [
        '3 projects',
        '50 environment variables',
        'Basic encryption',
        'CLI access',
        'Community support'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Team',
      price: '$29',
      period: '/month',
      description: 'Great for small teams',
      features: [
        'Unlimited projects',
        '1,000 environment variables',
        'Advanced encryption',
        'Team collaboration',
        'Priority support',
        'Audit logs'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: [
        'Everything in Team',
        'Unlimited variables',
        'SSO integration',
        'Advanced compliance',
        'Dedicated support',
        'Custom integrations'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Lit Envs
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Features
              </a>
              <a href="/docs" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Docs
              </a>
              <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Testimonials
              </a>

              {!user?.email ?
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
                :
                <Link
                  to="/dashboard"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </Link>
              }
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Features
                </a>
                <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Pricing
                </a>
                <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Testimonials
                </a>
                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div>
              <div>
                <div className="flex justify-center mb-8">
                  <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium">
                    <Star className="h-4 w-4" />
                    <span>Trusted by 10,000+ developers</span>
                  </div>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                  Secure and Sync Development Environment
                  <br />
                  <span className="text-blue-600">Variables in the Cloud</span>
                </h1>

                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Store, manage, and deploy your environment variables with military-grade encryption.
                  Collaborate securely with your team and integrate seamlessly with your workflow.
                </p>
                <div className="mb-16">
                  <Lottie animationData={landingImg} loop autoplay />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start For Free
              </Link>
              <Link target='_blank' to={"https://github.com/ethenkem/lit-source-codes/tree/main"} className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center">
                <Github className="h-5 w-5 mr-2" />
                View on GitHub
              </Link>
            </div>

            {/* Demo Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Environment Variables
                </h3>
                <button
                  onClick={() => setShowEncrypted(!showEncrypted)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${showEncrypted
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}
                >
                  {showEncrypted ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Encrypted View
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Plain View
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="font-mono text-sm text-gray-900 dark:text-white">DATABASE_URL</span>
                  </div>
                  <code className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                    {showEncrypted ? 'a94f8fe3e8422ef2c7b6d5a9f1b2c3d4...' : 'postgresql://user:pass@localhost:5432/mydb'}
                  </code>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="font-mono text-sm text-gray-900 dark:text-white">API_SECRET_KEY</span>
                  </div>
                  <code className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                    {showEncrypted ? 'b5c8f2e9a1d4e7b0c3f6a9d2e5f8b1c4...' : 'sk_live_abcd1234efgh5678ijkl9012mnop3456'}
                  </code>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="font-mono text-sm text-gray-900 dark:text-white">JWT_SECRET</span>
                  </div>
                  <code className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                    {showEncrypted ? 'c6d9f3e0b2e5f8c1d4f7b0e3f6c9d2f5...' : 'super-secret-jwt-key-for-token-signing'}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to secure your secrets
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Built by developers, for developers. SecureEnv provides enterprise-grade security
              with the simplicity your team needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-6">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CLI Demo Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Seamless CLI Integration
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Deploy with confidence using our powerful CLI tool. Sync your environment
                variables across all environments with a single command.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">One-command deployment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Automatic encryption</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Multi-environment support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Real-time synchronization</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-400 text-sm ml-2">Terminal</span>
              </div>

              <div className="font-mono text-sm space-y-2">
                <div className="text-green-400">$ npm install -g @secureenv/cli</div>
                <div className="text-gray-400">✓ SecureEnv CLI installed successfully</div>
                <div className="text-green-400">$ secureenv login</div>
                <div className="text-gray-400">✓ Authenticated successfully</div>
                <div className="text-green-400">$ secureenv push production</div>
                <div className="text-gray-400">🔒 Encrypting variables...</div>
                <div className="text-gray-400">📤 Uploading to production...</div>
                <div className="text-blue-400">✓ 24 variables synced successfully</div>
                <div className="text-gray-400">🚀 Ready to deploy!</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by developers worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See what teams are saying about SecureEnv
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to secure your environment variables?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of developers who trust LitEnvs with their most sensitive data.
            Start your free trial today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              Start For Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link target='_blank' to={"https://github.com/ethenkem/lit-source-codes/tree/main"} className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center">
              <Github className="h-5 w-5 mr-2" />
              Contribute
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">Lit Envs</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The most secure way to manage environment variables in the cloud.
                Built by developers, for developers.
              </p>
              <div className="flex space-x-4">
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Github className="h-6 w-6" />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CLI Tool</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a target='_blank' href="https://github.com/ethenkem/lit-source-codes/blob/main/README.md" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 SecureEnv. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Security
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
