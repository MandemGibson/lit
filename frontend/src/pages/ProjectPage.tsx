import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Shield,
  Users,
  Terminal,
  Trash2,

} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import AddVariableModal from '../components/AddVariableModal';
import InviteUserModal from '../components/InviteUserModal';
import axios from 'axios';
import { BACKEND_URL } from '../configs/constants';
import { useAuth } from '../contexts/AuthContext';


interface TeamMember {
  id: string;
  email: string;

}



const ProjectPage: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[] | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false)
  const [deletingProject, setDeletingProject] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const project = location.state.project

  const handleAddVariable = (key: string, value: string) => {
  };



  const fetchUsers = async () => {
    try {
      setDeleting(true)
      const res = await axios.get(`${BACKEND_URL}/projects/collabs/${project.id}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      })
      setTeamMembers(res.data.data)
      setDeleting(false)
    } catch (error) {
      console.log(error);

      setDeleting(false)

    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      setDeletingProject(true)
      const res = await axios.delete(`${BACKEND_URL}/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      })
      navigate("/dashboard")
      setDeletingProject(false)
    } catch (error) {
      console.log(error);
      setDeletingProject(false)
    }
  };


  const removeCollab = async (userId: string) => {
    try {

      const res = await axios.delete(`${BACKEND_URL}/projects/${project.id}/collabs/${userId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      })
      setTeamMembers(res.data.data)

    } catch (error) {
      console.log(error);

    }
  };

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                {project.projectName}
                <Shield className="h-6 w-6 text-green-500 ml-2" />
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {project.description}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Users className="h-4 w-4 mr-2" />
              Invite
            </button>
            <button
              onClick={() => deleteProject(project.id)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              {deletingProject? "Deleting..." : "Delete"}
            </button>

          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-white items-center justify-center flex dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <Shield size={40} className=" text-green-500" />
            <p className="text-lg ml-2 font-medium text-gray-500 dark:text-gray-400 truncate">
              Variables Highly Encrypted
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Team Members
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {project.collaborators.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Terminal className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Last CLI Sync
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      1h ago
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Environment Variables Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Environment Variables
              </h2>
              {/*<div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <button
                  onClick={() => setShowEncrypted(!showEncrypted)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${showEncrypted
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}
                >
                  {showEncrypted ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Encrypted View
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Plain View
                    </>
                  )}
                </button>
              </div>
              */}
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className='px-7 py-8 overflow-hidden'>
              <textarea
                readOnly
                wrap="soft"
                className="w-full h-64 p-4 border text-gray-200 outline-none bg-gray-900 border-gray-700 rounded resize-none overflow-auto font-mono"
              >
                {project.dotEnvData}
              </textarea>
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Team Members
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {teamMembers?.map((member) => (
              <div key={member.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={`https://ui-avatars.com/api/?name=${member.email.split('@')[0]}&background=6366F1&color=fff`}
                  />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.email.split('@')[0]}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {member.email}
                    </div>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}>

                  {deleting ? <p>Deleting</p> : <Trash2 color='red' onClick={() => removeCollab(member.id)} />}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AddVariableModal
        projectId={project.id}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddVariable}
      />

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        projectId={project.id}
      />
    </DashboardLayout>
  );
};

export default ProjectPage;
