import React, { useState } from 'react';
import { RxCross2, RxReload } from 'react-icons/rx';
import axios from 'axios';
import { BACKEND_URL } from '../configs/constants';
import { useAuth } from '../contexts/AuthContext';

interface AddVariableModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (key: string, value: string) => void;
}

const AddVariableModal: React.FC<AddVariableModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [envVars, setEnvVars] = useState("");
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.put(`${BACKEND_URL}/projects/update-env-data/${projectId}/`, {
        envData: envVars
      }, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });

      console.log(res.data);
      onSubmit('', '');
      setEnvVars('');
      setIsLoading(false);
      onClose();
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#27272a]">
          <h3 className="text-sm font-bold text-[#f4f4f5]">
            Add Environment Variables
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
            <label htmlFor="envVar" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              Environment Variables (.env block)
            </label>
            <textarea
              id="envVar"
              required
              value={envVars}
              onChange={(e) => setEnvVars(e.target.value)}
              rows={10}
              placeholder={`API_KEY=your-api-key-here\nDB_HOST=localhost\nDB_PASSWORD=super-secret`}
              className="block w-full px-3 py-2 border border-[#27272a] bg-[#09090b] text-xs rounded-lg text-[#f4f4f5] placeholder-zinc-650 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono resize-none"
            />
            <p className="mt-1.5 text-[11px] text-zinc-450">
              Paste standard <code className="p-0.5 bg-[#09090b] rounded text-zinc-300 font-mono">.env</code> formatted key-value pairs to merge/update.
            </p>
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
              disabled={isLoading || !envVars.trim()}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors duration-150"
            >
              {isLoading ? (
                <>
                  <RxReload className="h-3.5 w-3.5 mr-2 animate-spin text-white" />
                  Adding...
                </>
              ) : (
                'Add Variables'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVariableModal;
