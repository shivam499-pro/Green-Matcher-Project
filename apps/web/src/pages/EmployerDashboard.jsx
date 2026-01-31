import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { jobsAPI, applicationsAPI } from '../utils/api';

const EmployerDashboard = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    salary_min: '',
    salary_max: '',
    location: '',
    sdg_tags: [],
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'jobs') {
        const response = await jobsAPI.listJobs({ employer_only: true });
        setJobs(response.data.items || response.data || []);
      } else if (activeTab === 'applications') {
        const response = await applicationsAPI.listApplications({ employer_view: true });
        setApplications(response.data.items || response.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(t('dashboard.fetchError') || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleJobFormChange = (e) => {
    const { name, value } = e.target;
    setJobForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSDGToggle = (sdg) => {
    setJobForm(prev => {
      const newTags = prev.sdg_tags.includes(sdg)
        ? prev.sdg_tags.filter(tag => tag !== sdg)
        : [...prev.sdg_tags, sdg];
      return { ...prev, sdg_tags: newTags };
    });
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await jobsAPI.createJob({
        ...jobForm,
        salary_min: parseInt(jobForm.salary_min),
        salary_max: parseInt(jobForm.salary_max),
      });
      setShowJobModal(false);
      setJobForm({
        title: '',
        description: '',
        requirements: '',
        salary_min: '',
        salary_max: '',
        location: '',
        sdg_tags: [],
      });
      fetchData();
    } catch (error) {
      console.error('Error creating job:', error);
      setError(t('dashboard.createJobError') || 'Failed to create job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm(t('dashboard.confirmDeleteJob') || 'Are you sure you want to delete this job?')) {
      return;
    }

    try {
      await jobsAPI.deleteJob(jobId);
      fetchData();
    } catch (error) {
      console.error('Error deleting job:', error);
      setError(t('dashboard.deleteJobError') || 'Failed to delete job');
    }
  };

  const handleUpdateApplicationStatus = async (applicationId, status) => {
    try {
      await applicationsAPI.updateApplication(applicationId, status);
      fetchData();
    } catch (error) {
      console.error('Error updating application:', error);
      setError(t('dashboard.updateApplicationError') || 'Failed to update application');
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

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'REVIEWED': 'bg-blue-100 text-blue-800',
      'ACCEPTED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const sdgTags = ['SDG 7', 'SDG 11', 'SDG 12', 'SDG 13', 'SDG 14', 'SDG 15'];

  const tabs = [
    { id: 'jobs', label: t('dashboard.myJobs') || 'My Jobs', count: jobs.length },
    { id: 'applications', label: t('dashboard.applications') || 'Applications', count: applications.length },
  ];

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('dashboard.employerTitle') || 'Employer Dashboard'}
            </h1>
            <p className="mt-2 text-gray-600">
              {t('dashboard.employerSubtitle') || 'Manage your job postings and applications'}
            </p>
          </div>
          {activeTab === 'jobs' && (
            <button
              onClick={() => setShowJobModal(true)}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium"
            >
              {t('dashboard.postJob') || 'Post New Job'}
            </button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600">{t('dashboard.activeJobs') || 'Active Jobs'}</p>
                <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
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
                <p className="text-sm text-gray-600">{t('dashboard.totalApplications') || 'Total Applications'}</p>
                <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600">{t('dashboard.pendingReview') || 'Pending Review'}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {applications.filter(app => app.status === 'PENDING').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                      {tab.count}
                    </span>
                  )}
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

        {/* Jobs Tab */}
        {!loading && activeTab === 'jobs' && (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('dashboard.noJobs') || 'No jobs posted yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('dashboard.noJobsHint') || 'Post your first job to start hiring'}
                </p>
                <button
                  onClick={() => setShowJobModal(true)}
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                >
                  {t('dashboard.postJob') || 'Post New Job'}
                </button>
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
                        </div>
                        {job.is_verified && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {t('dashboard.verified') || 'Verified'}
                          </span>
                        )}
                      </div>

                      {job.sdg_tags && job.sdg_tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
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

                      <p className="text-gray-600 text-sm line-clamp-2">
                        {job.description}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium"
                      >
                        {t('dashboard.view') || 'View'}
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                      >
                        {t('dashboard.delete') || 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Applications Tab */}
        {!loading && activeTab === 'applications' && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('dashboard.noApplications') || 'No applications yet'}
                </h3>
                <p className="text-gray-600">
                  {t('dashboard.noApplicationsHint') || 'Applications will appear here when candidates apply to your jobs'}
                </p>
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {app.applicant.full_name}
                          </h3>
                          <p className="text-gray-600 mb-2">{app.job.title}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">{app.applicant.email}</p>

                      {app.applicant.skills && app.applicant.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {app.applicant.skills.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {app.applicant.skills.length > 5 && (
                            <span className="px-2 py-1 text-xs text-gray-500">
                              +{app.applicant.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      {app.cover_letter && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {t('dashboard.coverLetter') || 'Cover Letter'}: {app.cover_letter}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {app.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateApplicationStatus(app.id, 'REVIEWED')}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                          >
                            {t('dashboard.markReviewed') || 'Mark Reviewed'}
                          </button>
                          <button
                            onClick={() => handleUpdateApplicationStatus(app.id, 'ACCEPTED')}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
                          >
                            {t('dashboard.accept') || 'Accept'}
                          </button>
                          <button
                            onClick={() => handleUpdateApplicationStatus(app.id, 'REJECTED')}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                          >
                            {t('dashboard.reject') || 'Reject'}
                          </button>
                        </>
                      )}
                      {app.status === 'REVIEWED' && (
                        <>
                          <button
                            onClick={() => handleUpdateApplicationStatus(app.id, 'ACCEPTED')}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
                          >
                            {t('dashboard.accept') || 'Accept'}
                          </button>
                          <button
                            onClick={() => handleUpdateApplicationStatus(app.id, 'REJECTED')}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                          >
                            {t('dashboard.reject') || 'Reject'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Job Modal */}
        {showJobModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {t('dashboard.postNewJob') || 'Post New Job'}
                  </h2>
                  <button
                    onClick={() => setShowJobModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleCreateJob}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('dashboard.jobTitle') || 'Job Title'}
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={jobForm.title}
                        onChange={handleJobFormChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('dashboard.jobDescription') || 'Job Description'}
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={jobForm.description}
                        onChange={handleJobFormChange}
                        rows={4}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('dashboard.jobRequirements') || 'Requirements'}
                      </label>
                      <textarea
                        id="requirements"
                        name="requirements"
                        value={jobForm.requirements}
                        onChange={handleJobFormChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="salary_min" className="block text-sm font-medium text-gray-700 mb-2">
                          {t('dashboard.minSalary') || 'Minimum Salary (₹/year)'}
                        </label>
                        <input
                          type="number"
                          id="salary_min"
                          name="salary_min"
                          value={jobForm.salary_min}
                          onChange={handleJobFormChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label htmlFor="salary_max" className="block text-sm font-medium text-gray-700 mb-2">
                          {t('dashboard.maxSalary') || 'Maximum Salary (₹/year)'}
                        </label>
                        <input
                          type="number"
                          id="salary_max"
                          name="salary_max"
                          value={jobForm.salary_max}
                          onChange={handleJobFormChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('dashboard.location') || 'Location'}
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={jobForm.location}
                        onChange={handleJobFormChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('dashboard.sdgTags') || 'SDG Tags'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {sdgTags.map((sdg) => (
                          <button
                            key={sdg}
                            type="button"
                            onClick={() => handleSDGToggle(sdg)}
                            className={`px-3 py-2 text-sm rounded-lg border transition ${
                              jobForm.sdg_tags.includes(sdg)
                                ? 'bg-primary-500 text-white border-primary-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500'
                            }`}
                          >
                            {sdg}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowJobModal(false)}
                      className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      {t('common.cancel') || 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                    >
                      {t('dashboard.postJob') || 'Post Job'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
