import React, { useState } from "react";
import { RxCross2, RxReload } from "react-icons/rx";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { BACKEND_URL } from "../configs/constants";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
  fetchProjects: () => void;
  initialName?: string;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  fetchProjects,
  initialName = "",
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDescription("");
      setInviteEmail("");
      setCollaborators([]);
    }
  }, [isOpen, initialName]);

  const handleAddCollaborator = () => {
    const trimmed = inviteEmail.trim().toLowerCase();
    if (!trimmed) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return;
    }

    if (collaborators.includes(trimmed)) {
      return;
    }

    setCollaborators([...collaborators, trimmed]);
    setInviteEmail("");
  };

  const handleRemoveCollaborator = (email: string) => {
    setCollaborators(collaborators.filter((c) => c !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/projects/create`,
        { projectName: name.trim(), description: description.trim() },
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );

      const newProjectId = res.data.data?.id;

      if (newProjectId && collaborators.length > 0) {
        await Promise.all(
          collaborators.map((email) =>
            axios.post(
              `${BACKEND_URL}/projects/invite`,
              { email, projectId: newProjectId },
              { headers: { Authorization: `Bearer ${user?.token}` } },
            ),
          ),
        );
      }

      onSubmit(name.trim(), description.trim());
      setName("");
      setDescription("");
      setCollaborators([]);
      setIsLoading(false);
      onClose();
      fetchProjects();
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#09090b]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-transparent rounded-2xl max-w-lg w-full overflow-hidden p-8 relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-zinc-650 hover:text-white transition-colors p-1.5 rounded-lg"
        >
          <RxCross2 className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Create Project</h3>
          <p className="text-xs text-zinc-500 font-medium">
            Set up an environment namespace and invite your teammates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project Name & Dynamic Monogram Input */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-zinc-400"
            >
              Project Name
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 h-6 w-6 rounded-lg bg-zinc-950 border border-zinc-900/60 flex items-center justify-center text-[9px] font-black text-cyan-400 font-mono tracking-tight shrink-0 select-none">
                {name ? name.substring(0, 2).toUpperCase() : "??"}
              </div>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-12 pr-4 py-2.5 bg-[#121215]/60 focus:bg-[#16161a]/60 text-xs rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
                placeholder="my-awesome-project"
              />
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-xs font-semibold text-zinc-400"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full px-4 py-2.5 bg-[#121215]/60 focus:bg-[#16161a]/60 text-xs rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 resize-none transition-all"
              placeholder="Brief description of your project..."
            />
          </div>

          {/* Collaborators Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-400">
              Invite Collaborators
            </label>
            <div className="flex space-x-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="block flex-1 px-4 py-2.5 bg-[#121215]/60 focus:bg-[#16161a]/60 text-xs rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
                placeholder="collaborator@example.com"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCollaborator();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCollaborator}
                className="px-4 py-2 bg-zinc-950 border border-zinc-900/60 hover:bg-zinc-900 hover:text-white text-zinc-450 rounded-xl text-xs font-bold transition-all"
              >
                Add
              </button>
            </div>

            {/* Render queue as small modern pill tags */}
            {collaborators.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {collaborators.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#121215]/80 text-[10px] font-medium font-mono text-zinc-450 border border-zinc-900/40"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => handleRemoveCollaborator(email)}
                      className="ml-1 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <RxCross2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer Action Row (No border separators, completely seamless!) */}
          <div className="flex justify-end items-center space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-550 hover:text-white text-xs font-bold transition-all py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="px-5 py-2.5 text-xs font-bold text-white btn-cyan-glossy rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all"
            >
              {isLoading ? (
                <>
                  <RxReload className="h-3.5 w-3.5 mr-2 animate-spin text-white" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
