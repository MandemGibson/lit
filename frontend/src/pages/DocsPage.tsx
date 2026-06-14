import React from 'react';
import { Download, Terminal, Zap, LogIn, Upload, ArrowDown, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

const DocsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Lit CLI Documentation
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          The Lit CLI helps you securely manage and sync environment variables across teams. Here's how to install and use it.
        </p>

        <div className="space-y-12">

          {/* Step 1: Download Binary */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">1. Download the CLI Binary</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Visit the{' '}
                <Link
                  to="https://github.com/ethenkem/lit-envs-source-code/releases"
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  GitHub Releases
                </Link>{' '}
                page and download the latest binary for your operating system.
                Save the binary named <code>lit</code> in your project directory or somewhere in your system's <code>$PATH</code>.
              </p>
            </div>
          </div>

          {/* Step 2: Make Executable */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Terminal className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">2. Make the Binary Executable</h2>
              <p className="text-gray-600 dark:text-gray-300">
                On Unix-based systems (Linux/macOS), you must give the binary execution permissions:
              </p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono text-gray-900 dark:text-white mt-2">
                chmod +x ./lit
              </pre>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                You can now use it like this:
              </p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono text-gray-900 dark:text-white mt-2">
                ./lit [command]
              </pre>
            </div>
          </div>

          {/* Step 3: Init */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">3. Initialize Your Project</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Now that the CLI is ready, run the initialization command:
              </p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mt-2 text-sm font-mono text-gray-900 dark:text-white">
                ./lit init
              </pre>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                This command sets up the `.lit/` configuration folder and generates a `.gitignore` file
                containing common secure patterns like:
              </p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mt-2 text-sm font-mono text-gray-900 dark:text-white">
                .env{'\n'}.lit/{'\n'}*.secret
              </pre>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                You’ll also be prompted to enter the project name, environment (dev/prod), and encryption settings.
              </p>
            </div>
          </div>

          {/* CLI Commands Section */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Available Commands</h2>
            <div className="space-y-10">

              {/* login */}
              <div className="flex gap-4 items-start">
                <LogIn className="text-green-500 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">login</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Authenticate your CLI session with the Lit backend. This stores your session token locally so
                    you can securely run push/pull operations. Login may use a username/password, token, or OAuth.
                  </p>
                  <pre className="mt-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono text-sm text-gray-900 dark:text-white">
                    ./lit login
                  </pre>
                </div>
              </div>

              {/* choose-project */}
              <div className="flex gap-4 items-start">
                <Layers className="text-yellow-500 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">choose-project</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Switch between different projects associated with your account. This updates the `.lit` folder
                    to use a different project's configuration.
                  </p>
                  <pre className="mt-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono text-sm text-gray-900 dark:text-white">
                    ./lit select
                  </pre>
                </div>
              </div>

              {/* push */}
              <div className="flex gap-4 items-start">
                <Upload className="text-purple-500 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">push</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Encrypts your local `.env` and securely pushes it to the Lit server. This allows other team members
                    to retrieve consistent and safe environment configurations.
                  </p>
                  <pre className="mt-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono text-sm text-gray-900 dark:text-white">
                    ./lit push
                  </pre>
                </div>
              </div>

              {/* pull */}
              <div className="flex gap-4 items-start">
                <ArrowDown className="text-blue-500 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">pull</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Retrieves the latest `.env` from the Lit cloud for the current project. Use this to stay in sync
                    with your team or to configure a new development machine.
                  </p>
                  <pre className="mt-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono text-sm text-gray-900 dark:text-white">
                    ./lit pull
                  </pre>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Go to Dashboard */}
        <div className="mt-20 text-center">
          <Link
            to="/dashboard"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
