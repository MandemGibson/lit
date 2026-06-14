import React, { useState } from 'react';
import { RxCross2, RxReload } from 'react-icons/rx';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { BACKEND_URL } from '../configs/constants';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
  fetchProjects: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  fetchProjects
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/projects/create`, { projectName: name, description }, { headers: { Authorization: `Bearer ${user?.token}` } });
      console.log(res.data);
      onSubmit(name, description);
      setName('');
      setDescription('');
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#27272a]">
          <h3 className="text-sm font-bold text-[#f4f4f5]">
            Create New Project
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1 rounded-full hover:bg-zinc-800"
          >
            <RxCross2 className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label htmlFor="name" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              Project Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-3 py-1.5 border border-[#27272a] bg-[#09090b] text-xs rounded-lg text-[#f4f4f5] placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="My Awesome Project"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full px-3 py-1.5 border border-[#27272a] bg-[#09090b] text-xs rounded-lg text-[#f4f4f5] placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Brief description of your project..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-[#27272a]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-zinc-300 bg-[#09090b] border border-[#27272a] rounded-full hover:bg-zinc-900 transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors duration-150"
            >
              {isLoading ? (
                <>
                  <RxReload className="h-3.5 w-3.5 mr-2 animate-spin text-white" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
