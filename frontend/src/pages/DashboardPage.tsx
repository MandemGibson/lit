import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RxPlus,
  RxReader,
  RxPerson,
  RxCode,
  RxMagnifyingGlass,
  RxMixerHorizontal,
  RxArrowRight,
  RxLockClosed,
  RxReload,
  RxChevronDown
} from 'react-icons/rx';
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
  const [sortBy, setSortBy] = useState<'name' | 'newest' | 'oldest'>('name');
  const { user } = useAuth();

  const filteredProjects = projects.filter(project =>
    project.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'name') {
      return a.projectName.localeCompare(b.projectName);
    }
    if (sortBy === 'newest') {
      const dateA = a.createdOn ? new Date(a.createdOn).getTime() : 0;
      const dateB = b.createdOn ? new Date(b.createdOn).getTime() : 0;
      return dateB - dateA;
    }
    if (sortBy === 'oldest') {
      const dateA = a.createdOn ? new Date(a.createdOn).getTime() : 0;
      const dateB = b.createdOn ? new Date(b.createdOn).getTime() : 0;
      return dateA - dateB;
    }
    return 0;
  });

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
      <div className="space-y-8 animate-fade-in text-[#f4f4f5]">
        {/* Page Title & New Project Button */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Projects
            </h1>
            <p className="mt-1 text-xs text-zinc-500">
              Manage your environment secrets across all projects.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-3.5 py-1.5 bg-[#f4f4f5] hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-full transition-colors focus:outline-none shadow-sm"
          >
            <RxPlus className="h-4 w-4 mr-1.5" />
            New Project
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <RxMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-1.5 border border-[#27272a] rounded-full bg-[#18181b] text-xs placeholder-zinc-550 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none inline-flex items-center pl-4 pr-9 py-1.5 border border-[#27272a] text-xs font-semibold rounded-full text-zinc-300 bg-[#18181b] hover:bg-zinc-900 transition-colors shadow-sm focus:outline-none cursor-pointer"
            >
              <option value="name" className="bg-[#18181b] text-zinc-300">Sort: Name (A-Z)</option>
              <option value="newest" className="bg-[#18181b] text-zinc-300">Sort: Newest First</option>
              <option value="oldest" className="bg-[#18181b] text-zinc-300">Sort: Oldest First</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-550">
              <RxChevronDown className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        {/* Projects Cards Listing */}
        {loading ? (
          /* Visual Skeleton Cards */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 space-y-4 animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div className="h-8 w-8 bg-zinc-800 rounded"></div>
                  <div className="h-3 w-16 bg-zinc-800 rounded-full"></div>
                </div>
                <div className="h-4 w-2/3 bg-zinc-800 rounded"></div>
                <div className="h-3.5 w-full bg-zinc-800 rounded"></div>
                <div className="pt-2 border-t border-zinc-850 flex justify-between">
                  <div className="h-3 w-12 bg-zinc-800 rounded"></div>
                  <div className="h-3 w-16 bg-zinc-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-[#18181b] border border-[#27272a] rounded-xl">
            <RxReader className="h-10 w-10 mx-auto text-zinc-600 mb-3" />
            <h3 className="text-xs font-semibold text-white">
              No projects found
            </h3>
            <p className="mt-1 text-[11px] text-zinc-500">
              {searchTerm ? 'Adjust your search fields.' : 'Start syncing secrets by creating a project.'}
            </p>
            {!searchTerm && (
              <div className="mt-4">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center px-3.5 py-1.5 bg-[#f4f4f5] hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-full transition-colors"
                >
                  <RxPlus className="h-4 w-4 mr-1.5" />
                  New Project
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedProjects.map((project) => (
              <Link
                key={project.id}
                state={{ project }}
                to={`/project/${project.id}`}
                className="group block relative overflow-hidden bg-gradient-to-b from-[#18181b] to-[#121214] rounded-xl border border-[#27272a] hover:border-zinc-700/80 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-black/20"
              >
                {/* Subtle top light sheen on hover */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="p-5 flex flex-col h-full justify-between">
                  <div>
                    {/* <div className="flex items-center justify-between mb-3.5"> */}
                      {/* Monogram Badge */}
                      {/* <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#27272a] to-[#18181b] border border-[#3f3f46]/50 text-zinc-200 flex items-center justify-center text-[9px] font-extrabold tracking-wider shadow-sm group-hover:from-blue-600/10 group-hover:to-purple-600/10 group-hover:border-blue-500/30 transition-all duration-300">
                        {project.projectName.substring(0, 2).toUpperCase()}
                      </div> */}
                      
                      {/* Secure Badge */}
                      {/* <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8.5px] font-bold bg-[#09090b]/40 text-zinc-400 border border-[#27272a]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                        Encrypted
                      </span> */}
                    {/* </div> */}

                    <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors duration-200">
                      {project.projectName}
                    </h3>
                    
                    <p className="mt-1 text-[10.5px] text-zinc-550 line-clamp-2 leading-relaxed">
                      {project.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-[#27272a]/50 flex items-center justify-between text-[9.5px] text-zinc-500">
                    <div className="flex items-center space-x-2">
                      {/* Avatar Stack */}
                      <div className="flex -space-x-1 overflow-hidden">
                        <div className="inline-block shrink-0 h-5 w-5 rounded-full bg-zinc-800 border border-[#121214] flex items-center justify-center text-[9px] font-bold text-zinc-400">
                          {user?.email?.substring(0, 1).toUpperCase() || 'U'}
                        </div>
                        {project.collaborators && project.collaborators.length > 1 && (
                          <div className="inline-block shrink-0 h-5 w-5 rounded-full bg-zinc-700 border border-[#121214] flex items-center justify-center text-[8px] font-bold text-zinc-300">
                            +{project.collaborators.length - 1}
                          </div>
                        )}
                      </div>
                      
                      <span>
                        {project.collaborators ? project.collaborators.length : 1} {(!project.collaborators || project.collaborators.length <= 1) ? 'member' : 'members'}
                      </span>
                    </div>

                    <div className="flex items-center text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-350 transform translate-x-1 group-hover:translate-x-0">
                      <span className="font-semibold mr-1">Open</span>
                      <RxArrowRight className="h-3 w-3 transform group-hover:translate-x-0.5 transition-transform" />
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
