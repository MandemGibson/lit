import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  RxPlus,
  RxReader,
  RxMagnifyingGlass,
  RxArrowRight,
  RxChevronDown,
} from "react-icons/rx";
import DashboardLayout from "../components/Layout/DashboardLayout";
import CreateProjectModal from "../components/CreateProjectModal";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { BACKEND_URL } from "../configs/constants";

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "newest" | "oldest">("name");
  const { user } = useAuth();

  const {
    data: projects = [],
    isLoading: loading,
    refetch: refetchProjects,
  } = useQuery<Project[]>({
    queryKey: ["activeProjects"],
    queryFn: async () => {
      const res = await axios.get(`${BACKEND_URL}/projects/active-projects`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      return res.data.data || [];
    },
    enabled: !!user?.token,
  });

  const filteredProjects = projects.filter((project) =>
    project.projectName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === "name") {
      return a.projectName.localeCompare(b.projectName);
    }
    if (sortBy === "newest") {
      const dateA = a.createdOn ? new Date(a.createdOn).getTime() : 0;
      const dateB = b.createdOn ? new Date(b.createdOn).getTime() : 0;
      return dateB - dateA;
    }
    if (sortBy === "oldest") {
      const dateA = a.createdOn ? new Date(a.createdOn).getTime() : 0;
      const dateB = b.createdOn ? new Date(b.createdOn).getTime() : 0;
      return dateA - dateB;
    }
    return 0;
  });

  const handleCreateProject = () => {
    refetchProjects();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in text-[#f4f4f5]">
        {/* Page Title & New Project Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            className="inline-flex items-center px-4 py-2 btn-cyan-glossy text-white text-xs font-bold rounded-xl focus:outline-none w-fit whitespace-nowrap"
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
              className="block w-full pl-10 pr-4 py-2 border border-zinc-900 rounded-xl bg-[#121215]/40 text-xs placeholder-zinc-500 text-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/25 transition-all duration-200"
            />
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none inline-flex items-center pl-4 pr-10 py-2 border border-zinc-900 text-xs font-semibold rounded-xl text-zinc-350 bg-[#121215]/40 hover:bg-zinc-900/50 transition-colors shadow-sm focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/25 cursor-pointer"
            >
              <option value="name" className="bg-[#121215] text-zinc-350">
                Sort: Name (A-Z)
              </option>
              <option value="newest" className="bg-[#121215] text-zinc-350">
                Sort: Newest First
              </option>
              <option value="oldest" className="bg-[#121215] text-zinc-350">
                Sort: Oldest First
              </option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
              <RxChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Projects Cards Listing */}
        {loading ? (
          /* Visual Skeleton Cards */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-[#121215]/20 rounded-2xl p-6 space-y-4 animate-pulse"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-zinc-900 rounded-xl"></div>
                  <div className="h-4 w-24 bg-zinc-900 rounded-lg"></div>
                </div>
                <div className="h-3.5 w-full bg-zinc-900 rounded-lg"></div>
                <div className="pt-4 border-t border-zinc-900/40 flex justify-between">
                  <div className="h-3 w-12 bg-zinc-900 rounded-lg"></div>
                  <div className="h-3 w-16 bg-zinc-900 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-[#121215]/20 rounded-2xl animate-fade-in">
            <RxReader className="h-10 w-10 mx-auto text-zinc-700 mb-3" />
            <h3 className="text-xs font-semibold text-white">
              No projects found
            </h3>
            <p className="mt-1.5 text-[11px] text-zinc-550 font-medium">
              {searchTerm ? "" : "Start syncing secrets by creating a project."}
            </p>
            <div className="mt-5">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 btn-cyan-glossy text-white text-xs font-bold rounded-xl gap-1.5"
              >
                <RxPlus className="h-4 w-4" />
                {searchTerm ? `Create project "${searchTerm}"` : "New Project"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedProjects.map((project) => (
              <Link
                key={project.id}
                state={{ project }}
                to={`/project/${project.id}`}
                className="group block relative overflow-hidden bg-[#121215]/60 hover:bg-[#18181c]/60 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/25"
              >
                <div className="p-5 flex flex-col h-full justify-between">
                  <div>
                    {/* Header: Monogram & Name */}
                    <div className="flex items-center mb-3">
                      <div className="h-8 w-8 rounded-xl bg-zinc-950/80 border border-zinc-900/60 flex items-center justify-center text-[10px] font-black text-cyan-400 font-mono tracking-tight shadow-inner">
                        {project.projectName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors duration-250 uppercase tracking-wider font-mono">
                          {project.projectName}
                        </h3>
                      </div>
                    </div>

                    <p className="mt-1 text-[10.5px] text-zinc-500 line-clamp-2 leading-relaxed font-medium">
                      {project.description || "No description provided."}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-zinc-900/40 flex items-center justify-between text-[9.5px] text-zinc-550 font-semibold">
                    <div className="flex items-center space-x-2">
                      {/* Avatar Stack */}
                      <div className="flex -space-x-1 overflow-hidden">
                        <div className="shrink-0 h-5 w-5 rounded-full bg-zinc-900 border border-[#09090b] flex items-center justify-center text-[9px] font-bold text-zinc-400">
                          {user?.email?.substring(0, 1).toUpperCase() || "U"}
                        </div>
                        {project.collaborators &&
                          project.collaborators.length > 1 && (
                            <div className="shrink-0 h-5 w-5 rounded-full bg-zinc-800 border border-[#09090b] flex items-center justify-center text-[8px] font-bold text-zinc-300">
                              +{project.collaborators.length - 1}
                            </div>
                          )}
                      </div>

                      <span className="font-mono">
                        {project.collaborators
                          ? project.collaborators.length
                          : 1}{" "}
                        {!project.collaborators ||
                        project.collaborators.length <= 1
                          ? "member"
                          : "members"}
                      </span>
                    </div>

                    <div className="flex items-center text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0 font-bold font-mono">
                      <span className="mr-1">Open</span>
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
        fetchProjects={refetchProjects}
        initialName={searchTerm}
      />
    </DashboardLayout>
  );
};

export default DashboardPage;
