import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '../configs/constants';
import { useAuth } from '../contexts/AuthContext';

interface AddVariableModalProps {
  projectId: string,
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
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [envVars, setEnvVars] = useState("")
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await axios.put(`${BACKEND_URL}/projects/update-env-data/${projectId}/`, {
      envData: JSON.stringify(envVars)
    }, {
      headers: {
        Authorization: `Bearer ${user?.token}`
      }
    })

    console.log(res.data);

    onSubmit(key, value);
    setKey('');
    setValue('');
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Add Environment Variable
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="envVar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Environment Variable
            </label>
            <textarea
              id="envVar"
              required
              value={envVars}
              onChange={(e) => setEnvVars(e.target.value)}
              rows={10}
              placeholder={`API_KEY=your-api-key-here\nDB_HOST=localhost\nDB_PASSWORD=super-secret\nJWT_SECRET=verysecretjwtkey\nNODE_ENV=production`}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono resize-none"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Paste a single .env-style variable (e.g., <code>API_KEY=your-secret</code>)
            </p>
          </div>

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
              disabled={isLoading || !envVars.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
