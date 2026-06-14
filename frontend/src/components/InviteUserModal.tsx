import React, { useState } from 'react';
import { X, Loader2, Mail } from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '../configs/constants';
import { useAuth } from '../contexts/AuthContext';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('viewer');
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null)
  const { user } = useAuth()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log(projectId);

      const res = await axios.post(`${BACKEND_URL}/projects/invite`, {
        email: email,
        projectId: projectId
      }, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        },
      }
      )
      if (res.status == 200) {
        alert("Invitation sent")
      } else {

        setErr(res.data.message)
      }
    } catch (err: any) {
      //console.log(err);
      setErr(err.response.data.message)
      alert(err.response.data.message)

    }


    //onSubmit(email, role);
    setEmail('');
    setRole('viewer');
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Invite Team Member
          </h3>
          {err && <p className="text-lg font-medium text-gray-900 dark:text-white">
            {err}
          </p>}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <div className="mt-1 relative">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="colleague@example.com"
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="viewer"
                  checked={role === 'viewer'}
                  onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600"
                />
                <span className="ml-3">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Viewer
                  </span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">
                    Can view environment variables but cannot edit
                  </span>
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="editor"
                  checked={role === 'editor'}
                  onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600"
                />
                <span className="ml-3">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Editor
                  </span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">
                    Can view and edit environment variables
                  </span>
                </span>
              </label>
            </div>
          </div> */}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
