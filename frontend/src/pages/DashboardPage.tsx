import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Folder,
  Users,
  Shield,
  Clock,
  Terminal,
  Search,
  Filter,
  ArrowRight,
  Lock
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import CreateProjectModal from '../components/CreateProjectModal';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { BACKEND_URL } from '../configs/constants';

interface Project {
  id?: string;
  projectName: string;
  dotEnvData?: string;
  members?: any[];
  collaborators?: string[];
  lastUpdated?: string;
  createdOn?: string;
  description?: string;
  cliActivity?: string;
}

const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const filteredProjects = projects.filter(project =>
    project.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = () => {
    fetchProjects();
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/projects/active-projects`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setProjects(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Your Projects
            </h1>
            <p className="mt-1 text-sm text-gray-505 dark:text-slate-400">
              Manage and synchronize your secure environment variables across teams.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow shadow-blue-500/10 focus:outline-none"
          >
            <Plus className="h-4.5 w-4.5 mr-2" />
            New Project
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search projects by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-250 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-450 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-250 dark:border-slate-800 text-sm font-semibold rounded-lg text-gray-700 dark:text-slate-350 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-850 transition-colors shadow-sm">
            <Filter className="h-4 w-4 mr-2 text-gray-400" />
            Filter
          </button>
        </div>

        {/* Projects Listing */}
        {loading ? (
          /* Skeleton Card Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 rounded-xl p-6 space-y-4 animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
                  <div className="h-4 w-20 bg-gray-250 dark:bg-slate-850 rounded"></div>
                </div>
                <div className="h-5 w-2/3 bg-gray-200 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-full bg-gray-200 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-4/5 bg-gray-200 dark:bg-slate-800 rounded"></div>
                <div className="pt-2 border-t border-gray-100 dark:border-slate-850 flex justify-between">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-4 w-24 bg-gray-205 dark:bg-slate-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#111827] border border-gray-200/50 dark:border-slate-800/50 rounded-xl shadow-sm">
            <Folder className="h-12 w-12 mx-auto text-gray-300 dark:text-slate-650 mb-3" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              No projects found
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new environment sync project.'}
            </p>
            {!searchTerm && (
              <div className="mt-5">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  New Project
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                state={{ project }}
                to={`/project/${project.id}`}
                className="group block bg-white dark:bg-[#111827] rounded-xl border border-gray-200/70 dark:border-slate-805 hover:border-blue-300 dark:hover:border-blue-700/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="p-6 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-105 transition-transform duration-200">
                        <Folder className="h-5 w-5" />
                      </div>
                      
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/30">
                        <Lock className="h-2.5 w-2.5 mr-1" /> Encrypted
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150">
                      {project.projectName}
                    </h3>
                    
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {project.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-850 flex items-center justify-between text-xs text-gray-400 dark:text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3.5 w-3.5" />
                      <span className="font-semibold text-gray-600 dark:text-slate-400 ml-1">
                        {project.collaborators ? project.collaborators.length : 1}
                      </span>
                      <span>{project.collaborators && project.collaborators.length === 1 ? 'member' : 'members'}</span>
                    </div>

                    <div className="flex items-center text-blue-550 dark:text-blue-450 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="font-semibold mr-1">View secrets</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        fetchProjects={fetchProjects}
      />
    </DashboardLayout>
  );
};

export default DashboardPage;

