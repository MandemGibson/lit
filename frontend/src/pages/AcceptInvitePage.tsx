
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, ShieldCheck } from 'lucide-react';
import { BACKEND_URL } from '../configs/constants';

const AcceptInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const acceptInvite = async () => {
      const projectId = searchParams.get('projectId');
      const userId = searchParams.get('userId');

      if (!projectId || !userId) {
        setStatus('error');
        setMessage('Invalid or missing invitation link parameters.');
        return;
      }

      try {
        await axios.post(`${BACKEND_URL}/projects/accept-invite`, {
           projectId, 
           userId 
        });

        setStatus('success');
        setMessage('You have been added as a collaborator! Redirecting to your dashboard...');
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (error) {
        const err = error as any;
        setStatus('error');
        setMessage(err?.response?.data?.message || 'Failed to accept the invitation.');
      }
    };

    acceptInvite();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <ShieldCheck className="h-12 w-12 text-blue-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Accepting Invitation...
        </h2>

        {status === 'loading' && (
          <div className="flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processing your invitation</span>
          </div>
        )}

        {status === 'success' && (
          <div className="text-green-600 dark:text-green-400">{message}</div>
        )}

        {status === 'error' && (
          <div className="text-red-600 dark:text-red-400">{message}</div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitePage;
