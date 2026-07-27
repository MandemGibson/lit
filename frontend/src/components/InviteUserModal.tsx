import React, { useState } from "react";
import { RxCross2, RxReload, RxEnvelopeClosed } from "react-icons/rx";
import axios from "axios";
import { BACKEND_URL } from "../configs/constants";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

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
  const [emailInput, setEmailInput] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  React.useEffect(() => {
    if (isOpen) {
      setEmailInput("");
      setCollaborators([]);
      setErr(null);
    }
  }, [isOpen]);

  const handleAddCollaborator = () => {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return;
    }

    if (collaborators.includes(trimmed)) {
      return;
    }

    setCollaborators([...collaborators, trimmed]);
    setEmailInput("");
  };

  const handleRemoveCollaborator = (email: string) => {
    setCollaborators(collaborators.filter((c) => c !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErr(null);
    try {
      const emailsToSend = [...collaborators];
      if (emailInput.trim()) {
        const trimmedInput = emailInput.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (
          emailRegex.test(trimmedInput) &&
          !emailsToSend.includes(trimmedInput)
        ) {
          emailsToSend.push(trimmedInput);
        }
      }

      if (emailsToSend.length === 0) {
        setIsLoading(false);
        return;
      }

      await Promise.all(
        emailsToSend.map((email) =>
          axios.post(
            `${BACKEND_URL}/projects/invite`,
            { email, projectId },
            { headers: { Authorization: `Bearer ${user?.token}` } },
          ),
        ),
      );

      showToast("Invitations sent successfully!", "success");
      setEmailInput("");
      setCollaborators([]);
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || "Failed to send invitations";
      setErr(errMsg);
      showToast(errMsg, "error");
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
          <h3 className="text-base font-bold text-white">
            Invite Team Members
          </h3>
          <p className="text-xs text-zinc-500 font-medium">
            Invite colleagues to collaborate on this project namespace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {err && (
            <div className="bg-red-950/20 border border-red-900/40 text-red-400 px-4 py-2.5 rounded-xl text-xs font-semibold">
              {err}
            </div>
          )}

          {/* Email Input Field with "Add" Action */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-400">
              Email Address
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1 flex items-center">
                <div className="absolute left-3.5 text-zinc-550 flex items-center justify-center shrink-0 select-none">
                  <RxEnvelopeClosed className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="block w-full pl-12 pr-4 py-2.5 bg-[#121215]/60 focus:bg-[#16161a]/60 text-xs rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
                  placeholder="collaborator@example.com"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCollaborator();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleAddCollaborator}
                className="px-4 py-2.5 bg-zinc-950 border border-zinc-900/60 hover:bg-zinc-900 hover:text-white text-zinc-450 rounded-xl text-xs font-bold transition-all"
              >
                Add
              </button>
            </div>
          </div>

          {/* Render Queue pills */}
          {collaborators.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">
                Queue ({collaborators.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {collaborators.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#121215]/80 text-[10px] font-medium font-mono text-zinc-450 border border-zinc-900/40"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => handleRemoveCollaborator(email)}
                      className="ml-1 text-zinc-650 hover:text-red-400 transition-colors"
                    >
                      <RxCross2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer Row */}
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
              disabled={
                isLoading || (collaborators.length === 0 && !emailInput.trim())
              }
              className="px-5 py-2.5 text-xs font-bold text-white btn-cyan-glossy rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all"
            >
              {isLoading ? (
                <>
                  <RxReload className="h-3.5 w-3.5 mr-2 animate-spin text-white" />
                  Sending...
                </>
              ) : (
                "Send Invitations"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;
