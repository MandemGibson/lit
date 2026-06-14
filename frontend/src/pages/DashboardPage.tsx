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
  RxReload
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
          <button className="inline-flex items-center px-4 py-1.5 border border-[#27272a] text-xs font-semibold rounded-full text-zinc-350 bg-[#18181b] hover:bg-zinc-900 transition-colors shadow-sm">
            <RxMixerHorizontal className="h-3.5 w-3.5 mr-2 text-zinc-500" />
            Filter
          </button>
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                state={{ project }}
                to={`/project/${project.id}`}
                className="group block bg-[#18181b] rounded-xl border border-[#27272a] hover:border-zinc-700 transition-all duration-150"
              >
                <div className="p-6 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-[#09090b] border border-[#27272a] text-zinc-300 rounded-lg group-hover:bg-[#27272a] transition-colors duration-150">
                        <RxReader className="h-4.5 w-4.5" />
                      </div>
                      
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#27272a] text-zinc-300 border border-[#3f3f46]">
                        <RxLockClosed className="h-2.5 w-2.5 mr-1" /> Encrypted
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-blue-450 transition-colors">
                      {project.projectName}
                    </h3>
                    
                    <p className="mt-1.5 text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                      {project.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-850 flex items-center justify-between text-[10px] text-zinc-500">
                    <div className="flex items-center">
                      <RxPerson className="h-3.5 w-3.5 mr-1 text-zinc-655" />
                      <span>{project.collaborators ? project.collaborators.length : 1} {project.collaborators && project.collaborators.length === 1 ? 'member' : 'members'}</span>
                    </div>

                    <div className="flex items-center text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="font-semibold mr-1">Open</span>
                      <RxArrowRight className="h-3 w-3" />
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
