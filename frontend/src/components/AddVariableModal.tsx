import React, { useState } from "react";
import { RxCross2, RxReload } from "react-icons/rx";
import axios from "axios";
import { BACKEND_URL } from "../configs/constants";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

interface AddVariableModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (key: string, value: string) => void;
  environment?: string;
  scope?: string;
}

const AddVariableModal: React.FC<AddVariableModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onSubmit,
  environment = "development",
  scope = "default",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [envVars, setEnvVars] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  React.useEffect(() => {
    if (isOpen) {
      setEnvVars("");
      setErr(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!envVars.trim()) return;
    setIsLoading(true);
    setErr(null);

    try {
      await axios.put(
        `${BACKEND_URL}/projects/update-env-data/${projectId}/`,
        {
          envData: envVars,
          environment,
          scope,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        },
      );

      onSubmit("", "");
      setEnvVars("");
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      console.error(err);
      const errMsg =
        err.response?.data?.message || "Failed to import environment variables";
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
            Bulk Import Environment Variables
          </h3>
          <p className="text-xs text-zinc-500 font-medium">
            Paste key-value pairs formatted as a standard{" "}
            <code className="text-zinc-300 font-mono">.env</code> file.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {err && (
            <div className="bg-red-950/20 border border-red-900/40 text-red-400 px-4 py-2.5 rounded-xl text-xs font-semibold">
              {err}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="envVar"
              className="block text-xs font-semibold text-zinc-400"
            >
              Environment Variables (.env block)
            </label>
            <textarea
              id="envVar"
              required
              value={envVars}
              onChange={(e) => setEnvVars(e.target.value)}
              rows={9}
              placeholder={`API_KEY=your-api-key-here\nDB_HOST=localhost\nDB_PASSWORD=super-secret`}
              className="block w-full px-4 py-3 bg-[#121215]/60 focus:bg-[#16161a]/60 text-xs rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono border border-zinc-900/40 resize-none leading-relaxed"
            />
            <p className="text-xs text-zinc-500 font-medium">
              Standard key=value pairs will be parsed and encrypted automatically.
            </p>
          </div>

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
              disabled={isLoading || !envVars.trim()}
              className="px-5 py-2.5 text-xs font-bold text-white btn-cyan-glossy rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all"
            >
              {isLoading ? (
                <>
                  <RxReload className="h-3.5 w-3.5 mr-2 animate-spin text-white" />
                  Importing...
                </>
              ) : (
                "Import Variables"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVariableModal;
