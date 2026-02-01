import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { usersAPI, jobsAPI, careersAPI, analyticsAPI } from '../utils/api';

const AdminDashboard = () => {
  
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [careers, setCareers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  // Fetch data when tab changes
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Fetch data based on active tab
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      switch (activeTab) {
        case 'overview':
          const analyticsResponse = await analyticsAPI.getOverview();
          setAnalytics(analyticsResponse?.data || null);
          break;
          
        case 'users':
          // Placeholder for user management - requires admin endpoint
          setUsers([]);
          break;
          
        case 'jobs':
          const jobsResponse = await jobsAPI.listJobs();
          setJobs(jobsResponse?.data?.items || jobsResponse?.data || []);
          break;
          
        case 'careers':
          const careersResponse = await careersAPI.listCareers();
          setCareers(careersResponse?.data?.items || careersResponse?.data || []);
          break;
          
        default:
          break;
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(t('admin.fetchError') || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify a job
  const handleVerifyJob = async (jobId) => {
    try {
      await jobsAPI.updateJob(jobId, { is_verified: true });
      await fetchData();
    } catch (err) {
      console.error('Error verifying job:', err);
      setError(t('admin.verifyJobError') || 'Failed to verify job. Please try again.');
    }
  };

  // Delete a job with confirmation
  const handleDeleteJob = async (jobId) => {
    const confirmed = window.confirm(
      t('admin.confirmDeleteJob') || 'Are you sure you want to delete this job? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    try {
      await jobsAPI.deleteJob(jobId);
      await fetchData();
    } catch (err) {
      console.error('Error deleting job:', err);
      setError(t('admin.deleteJobError') || 'Failed to delete job. Please try again.');
    }
  };

  // Delete a career with confirmation
  const handleDeleteCareer = async (careerId) => {
    const confirmed = window.confirm(
      t('admin.confirmDeleteCareer') || 'Are you sure you want to delete this career? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    try {
      await careersAPI.deleteCareer(careerId);
      await fetchData();
    } catch (err) {
      console.error('Error deleting career:', err);
      setError(t('admin.deleteCareerError') || 'Failed to delete career. Please try again.');
    }
  };

  // Get SDG color based on SDG number
  const getSDGColor = (sdg) => {
    const colors = {
      'SDG 7': 'bg-yellow-500',
      'SDG 11': 'bg-orange-500',
      'SDG 12': 'bg-red-500',
      'SDG 13': 'bg-green-500',
      'SDG 14': 'bg-blue-500',
      'SDG 15': 'bg-green-600',
    };
    return colors[sdg] || 'bg-gray-500';
  };

  // Tab configuration
  const tabs = [
    { id: 'overview', label: t('admin.overview') || 'Overview', icon: 'chart' },
    { id: 'users', label: t('admin.users') || 'Users', icon: 'users' },
    { id: 'jobs', label: t('admin.jobs') || 'Jobs', icon: 'briefcase' },
    { id: 'careers', label: t('admin.careers') || 'Careers', icon: 'trending' },
  ];

  // Stat card component
  const StatCard = ({ title, value, icon, colorClass }) => (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value || 0}</p>
        </div>
        <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  // Empty state component
  const EmptyState = ({ icon, title, description }) => (
    <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
      <div className="w-16 h-16 text-gray-400 mx-auto mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );

  return (
    <div className="flex-1 bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('Admin Dashboard')}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {t('Manage users, jobs, and platform content')}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start">
            <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-3 flex-shrink-0 text-red-600 hover:text-red-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg mb-6 border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Loading State */}
        {loading && <LoadingSpinner />}

        {/* Overview Tab */}
        {!loading && activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title={t('Total Users')}
                value={analytics?.total_users}
                colorClass="bg-blue-100"
                icon={
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              />
              
              <StatCard
                title={t('Total Jobs')}
                value={analytics?.total_jobs}
                colorClass="bg-emerald-100"
                icon={
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />
              
              <StatCard
                title={t('Total Careers')}
                value={analytics?.total_careers}
                colorClass="bg-green-100"
                icon={
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
              />
              
              <StatCard
                title={t('Total Applications')}
                value={analytics?.total_applications}
                colorClass="bg-purple-100"
                icon={
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
            </div>

            {/* Pending Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Jobs */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('Pending Job Verification')}
                </h2>
                {jobs.filter(job => !job.is_verified).length === 0 ? (
                  <p className="text-sm text-gray-600">{t('No pending jobs')}</p>
                ) : (
                  <div className="space-y-3">
                    {jobs.filter(job => !job.is_verified).slice(0, 5).map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{job.title}</p>
                          <p className="text-sm text-gray-600 truncate">
                            {job.employer?.company_name || 'Company'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleVerifyJob(job.id)}
                          className="ml-3 px-3 py-1 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex-shrink-0"
                        >
                          {t('Verify')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Companies */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('Pending Company Verification')}
                </h2>
                <p className="text-sm text-gray-600">
                  {t('No pending companies')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {!loading && activeTab === 'users' && (
          <EmptyState
            icon={
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            title={t('User Management')}
            description={t('User management features coming soon')}
          />
        )}

        {/* Jobs Tab */}
        {!loading && activeTab === 'jobs' && (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
                title={t('No Jobs Found')}
                description={t('Jobs will appear here when employers post them')}
              />
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg border border-gray-200 hover:border-emerald-500 transition-colors p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {job.employer?.company_name || 'Company'}
                          </p>
                        </div>
                        {job.is_verified ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded flex-shrink-0">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {t('Verified')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded flex-shrink-0">
                            {t('Pending')}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                        {job.location && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location}
                          </span>
                        )}
                        {job.salary_min && job.salary_max && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ₹{job.salary_min.toLocaleString()} - ₹{job.salary_max.toLocaleString()}/year
                          </span>
                        )}
                      </div>

                      {job.sdg_tags && job.sdg_tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.sdg_tags.map((sdg) => (
                            <span
                              key={sdg}
                              className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getSDGColor(sdg)}`}
                            >
                              {sdg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 sm:min-w-[120px]">
                      {!job.is_verified && (
                        <button
                          onClick={() => handleVerifyJob(job.id)}
                          className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                        >
                          {t('Verify')}
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                      >
                        {t('View')}
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 transition-colors font-medium"
                      >
                        {t('Delete')}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Careers Tab */}
        {!loading && activeTab === 'careers' && (
          <div className="space-y-4">
            {careers.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
                title={t('No Careers Found')}
                description={t('Careers will appear here when added by admins')}
              />
            ) : (
              careers.map((career) => (
                <div key={career.id} className="bg-white rounded-lg border border-gray-200 hover:border-emerald-500 transition-colors p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{career.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {career.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                        {career.avg_salary_min && career.avg_salary_max && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ₹{career.avg_salary_min.toLocaleString()} - ₹{career.avg_salary_max.toLocaleString()}/year
                          </span>
                        )}
                        {career.demand_score && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            {Math.round(career.demand_score * 100)}% demand
                          </span>
                        )}
                      </div>

                      {career.sdg_tags && career.sdg_tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {career.sdg_tags.map((sdg) => (
                            <span
                              key={sdg}
                              className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getSDGColor(sdg)}`}
                            >
                              {sdg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 sm:min-w-[120px]">
                      <button
                        onClick={() => navigate(`/careers/${career.id}`)}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                      >
                        {t('View')}
                      </button>
                      <button
                        onClick={() => handleDeleteCareer(career.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 transition-colors font-medium"
                      >
                        {t('Delete')}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
