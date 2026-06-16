import React, { useState } from 'react';
import { RxCross2, RxReload, RxEnvelopeClosed } from 'react-icons/rx';
import axios from 'axios';
import { BACKEND_URL } from '../configs/constants';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErr(null);
    try {
      console.log(projectId);
      const res = await axios.post(`${BACKEND_URL}/projects/invite`, {
        email: email,
        projectId: projectId
      }, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        },
      });

      if (res.status === 200) {
        showToast("Invitation sent successfully!", "success");
        setEmail('');
        setIsLoading(false);
        onClose();
      } else {
        setErr(res.data.message);
        setIsLoading(false);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to send invitation';
      setErr(errMsg);
      showToast(errMsg, "error");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#27272a]">
          <h3 className="text-sm font-bold text-[#f4f4f5]">
            Invite Team Member
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1 rounded-full hover:bg-zinc-800"
          >
            <RxCross2 className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {err && (
            <div className="bg-red-950/20 border border-red-900 text-red-400 px-3 py-2 rounded-lg text-xs font-semibold">
              {err}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-1.5 border border-[#27272a] bg-[#09090b] text-xs rounded-lg text-[#f4f4f5] placeholder-zinc-650 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                placeholder="colleague@example.com"
              />
              <RxEnvelopeClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            </div>
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
              disabled={isLoading || !email.trim()}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors duration-150"
            >
              {isLoading ? (
                <>
                  <RxReload className="h-3.5 w-3.5 mr-2 animate-spin text-white" />
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;
