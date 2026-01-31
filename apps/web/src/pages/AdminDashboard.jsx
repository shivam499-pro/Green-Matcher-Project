import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { usersAPI, jobsAPI, careersAPI, analyticsAPI } from '../utils/api';

const AdminDashboard = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [careers, setCareers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'overview') {
        const response = await analyticsAPI.getOverview();
        setAnalytics(response.data);
      } else if (activeTab === 'users') {
        const response = await usersAPI.getCurrentUser();
        // This would need a different endpoint for admin to list all users
        // For now, we'll use placeholder data
        setUsers([]);
      } else if (activeTab === 'jobs') {
        const response = await jobsAPI.listJobs();
        setJobs(response.data.items || response.data || []);
      } else if (activeTab === 'careers') {
        const response = await careersAPI.listCareers();
        setCareers(response.data.items || response.data || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError(t('admin.fetchError') || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyJob = async (jobId) => {
    try {
      await jobsAPI.updateJob(jobId, { is_verified: true });
      fetchData();
    } catch (error) {
      console.error('Error verifying job:', error);
      setError(t('admin.verifyJobError') || 'Failed to verify job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm(t('admin.confirmDeleteJob') || 'Are you sure you want to delete this job?')) {
      return;
    }

    try {
      await jobsAPI.deleteJob(jobId);
      fetchData();
    } catch (error) {
      console.error('Error deleting job:', error);
      setError(t('admin.deleteJobError') || 'Failed to delete job');
    }
  };

  const handleVerifyCompany = async (userId) => {
    try {
      await usersAPI.updateProfile({ is_verified: true });
      fetchData();
    } catch (error) {
      console.error('Error verifying company:', error);
      setError(t('admin.verifyCompanyError') || 'Failed to verify company');
    }
  };

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

  const tabs = [
    { id: 'overview', label: t('admin.overview') || 'Overview' },
    { id: 'users', label: t('admin.users') || 'Users' },
    { id: 'jobs', label: t('admin.jobs') || 'Jobs' },
    { id: 'careers', label: t('admin.careers') || 'Careers' },
  ];

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('admin.title') || 'Admin Dashboard'}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('admin.subtitle') || 'Manage users, jobs, and platform content'}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Overview Tab */}
        {!loading && activeTab === 'overview' && analytics && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{t('admin.totalUsers') || 'Total Users'}</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.total_users || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{t('admin.totalJobs') || 'Total Jobs'}</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.total_jobs || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{t('admin.totalCareers') || 'Total Careers'}</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.total_careers || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{t('admin.totalApplications') || 'Total Applications'}</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.total_applications || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('admin.pendingJobs') || 'Pending Job Verification'}
                </h2>
                {jobs.filter(job => !job.is_verified).length === 0 ? (
                  <p className="text-gray-600">{t('admin.noPendingJobs') || 'No pending jobs'}</p>
                ) : (
                  <div className="space-y-3">
                    {jobs.filter(job => !job.is_verified).slice(0, 5).map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{job.title}</p>
                          <p className="text-sm text-gray-600">{job.employer?.company_name || 'Company'}</p>
                        </div>
                        <button
                          onClick={() => handleVerifyJob(job.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                        >
                          {t('admin.verify') || 'Verify'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('admin.pendingCompanies') || 'Pending Company Verification'}
                </h2>
                <p className="text-gray-600">{t('admin.noPendingCompanies') || 'No pending companies'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {!loading && activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('admin.usersManagement') || 'User Management'}
            </h3>
            <p className="text-gray-600">
              {t('admin.usersManagementHint') || 'User management features coming soon'}
            </p>
          </div>
        )}

        {/* Jobs Tab */}
        {!loading && activeTab === 'jobs' && (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('admin.noJobs') || 'No jobs found'}
                </h3>
                <p className="text-gray-600">
                  {t('admin.noJobsHint') || 'Jobs will appear here when employers post them'}
                </p>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
                          <p className="text-gray-600 mb-2">{job.employer?.company_name || 'Company'}</p>
                        </div>
                        {job.is_verified ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {t('admin.verified') || 'Verified'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                            {t('admin.pending') || 'Pending'}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        {job.location && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location}
                          </span>
                        )}
                        {job.salary_min && job.salary_max && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                    <div className="flex flex-col gap-2">
                      {!job.is_verified && (
                        <button
                          onClick={() => handleVerifyJob(job.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
                        >
                          {t('admin.verify') || 'Verify'}
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium"
                      >
                        {t('admin.view') || 'View'}
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                      >
                        {t('admin.delete') || 'Delete'}
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
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('admin.noCareers') || 'No careers found'}
                </h3>
                <p className="text-gray-600">
                  {t('admin.noCareersHint') || 'Careers will appear here when added by admins'}
                </p>
              </div>
            ) : (
              careers.map((career) => (
                <div
                  key={career.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{career.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {career.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        {career.avg_salary_min && career.avg_salary_max && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ₹{career.avg_salary_min.toLocaleString()} - ₹{career.avg_salary_max.toLocaleString()}/year
                          </span>
                        )}
                        {career.demand_score && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => navigate(`/careers/${career.id}`)}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium"
                      >
                        {t('admin.view') || 'View'}
                      </button>
                      <button
                        onClick={() => careersAPI.deleteCareer(career.id).then(fetchData)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                      >
                        {t('admin.delete') || 'Delete'}
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
