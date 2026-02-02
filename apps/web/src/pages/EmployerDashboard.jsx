import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { jobsAPI, applicationsAPI } from '../utils/api';
import { t } from '../utils/translations';

const EmployerDashboard = () => {
  
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    salary_min: '',
    salary_max: '',
    location: '',
    sdg_tags: [],
  });

  // Fetch data when tab changes
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Fetch data based on active tab
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'jobs') {
        const response = await jobsAPI.listJobs({ employer_only: true });
        setJobs(response?.data?.items || response?.data || []);
      } else if (activeTab === 'applications') {
        const response = await applicationsAPI.listApplications({ employer_view: true });
        setApplications(response?.data?.items || response?.data || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(t('dashboard.fetchError') || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleJobFormChange = (e) => {
    const { name, value } = e.target;
    setJobForm(prev => ({ ...prev, [name]: value }));
  };

  // Toggle SDG tag selection
  const handleSDGToggle = (sdg) => {
    setJobForm(prev => {
      const newTags = prev.sdg_tags.includes(sdg)
        ? prev.sdg_tags.filter(tag => tag !== sdg)
        : [...prev.sdg_tags, sdg];
      return { ...prev, sdg_tags: newTags };
    });
  };

  // Validate job form
  const validateJobForm = () => {
    if (!jobForm.title.trim()) {
      setError(t('dashboard.titleRequired') || 'Job title is required');
      return false;
    }
    if (!jobForm.description.trim()) {
      setError(t('dashboard.descriptionRequired') || 'Job description is required');
      return false;
    }
    if (!jobForm.location.trim()) {
      setError(t('dashboard.locationRequired') || 'Location is required');
      return false;
    }
    
    const minSalary = parseInt(jobForm.salary_min);
    const maxSalary = parseInt(jobForm.salary_max);
    
    if (isNaN(minSalary) || minSalary <= 0) {
      setError(t('dashboard.validMinSalary') || 'Please enter a valid minimum salary');
      return false;
    }
    if (isNaN(maxSalary) || maxSalary <= 0) {
      setError(t('dashboard.validMaxSalary') || 'Please enter a valid maximum salary');
      return false;
    }
    if (maxSalary < minSalary) {
      setError(t('dashboard.salaryRangeError') || 'Maximum salary must be greater than minimum salary');
      return false;
    }
    
    return true;
  };

  // Create a new job
  const handleCreateJob = async (e) => {
    e.preventDefault();
    
    if (!validateJobForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await jobsAPI.createJob({
        ...jobForm,
        salary_min: parseInt(jobForm.salary_min),
        salary_max: parseInt(jobForm.salary_max),
      });
      
      // Reset form and close modal
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
      
      // Refresh jobs list
      await fetchData();
    } catch (err) {
      console.error('Error creating job:', err);
      setError(t('dashboard.createJobError') || 'Failed to create job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete a job with confirmation
  const handleDeleteJob = async (jobId) => {
    const confirmed = window.confirm(
      t('dashboard.confirmDeleteJob') || 'Are you sure you want to delete this job? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    try {
      await jobsAPI.deleteJob(jobId);
      await fetchData();
    } catch (err) {
      console.error('Error deleting job:', err);
      setError(t('dashboard.deleteJobError') || 'Failed to delete job. Please try again.');
    }
  };

  // Update application status
  const handleUpdateApplicationStatus = async (applicationId, status) => {
    try {
      await applicationsAPI.updateApplication(applicationId, { status });
      await fetchData();
    } catch (err) {
      console.error('Error updating application:', err);
      setError(t('dashboard.updateApplicationError') || 'Failed to update application. Please try again.');
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

  // Get status color for applications
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

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  // Empty state component
  const EmptyState = ({ icon, title, description, action }) => (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <div className="w-16 h-16 text-gray-400 mx-auto mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      {action}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('dashboard.employerTitle') || 'Employer Dashboard'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {t('dashboard.employerSubtitle') || 'Manage your job postings and applications'}
            </p>
          </div>
          {activeTab === 'jobs' && (
            <button
              onClick={() => setShowJobModal(true)}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('dashboard.postJob') || 'Post New Job'}
            </button>
          )}
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t('dashboard.activeJobs') || 'Active Jobs'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t('dashboard.totalApplications') || 'Total Applications'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t('dashboard.pendingReview') || 'Pending Review'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.status === 'PENDING').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
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

        {/* Loading State */}
        {loading && <LoadingSpinner />}

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
                title={t('dashboard.noJobs') || 'No Jobs Posted Yet'}
                description={t('dashboard.noJobsHint') || 'Post your first job to start hiring talented candidates'}
                action={
                  <button
                    onClick={() => setShowJobModal(true)}
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium inline-flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('dashboard.postJob') || 'Post New Job'}
                  </button>
                }
              />
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
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
                        </div>
                        {job.is_verified && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded flex-shrink-0">
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

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {job.description}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:min-w-[120px]">
                      <button
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition font-medium"
                      >
                        {t('dashboard.view') || 'View'}
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 transition font-medium"
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
              <EmptyState
                icon={
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
                title={t('dashboard.noApplications') || 'No Applications Yet'}
                description={t('dashboard.noApplicationsHint') || 'Applications will appear here when candidates apply to your jobs'}
              />
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {app.applicant?.full_name || 'Applicant'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1">
                            {app.job?.title || 'Job Position'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {app.applicant?.email || 'No email provided'}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>

                      {app.applicant?.skills && app.applicant.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {app.applicant.skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
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
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            {t('dashboard.coverLetter') || 'Cover Letter'}:
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {app.cover_letter}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 sm:min-w-[140px]">
                      {app.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateApplicationStatus(app.id, 'REVIEWED')}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition font-medium"
                          >
                            {t('dashboard.markReviewed') || 'Mark Reviewed'}
                          </button>
                          <button
                            onClick={() => handleUpdateApplicationStatus(app.id, 'ACCEPTED')}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition font-medium"
                          >
                            {t('dashboard.accept') || 'Accept'}
                          </button>
                          <button
                            onClick={() => handleUpdateApplicationStatus(app.id, 'REJECTED')}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition font-medium"
                          >
                            {t('dashboard.reject') || 'Reject'}
                          </button>
                        </>
                      )}
                      {app.status === 'REVIEWED' && (
                        <>
                          <button
                            onClick={() => handleUpdateApplicationStatus(app.id, 'ACCEPTED')}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition font-medium"
                          >
                            {t('dashboard.accept') || 'Accept'}
                          </button>
                          <button
                            onClick={() => handleUpdateApplicationStatus(app.id, 'REJECTED')}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition font-medium"
                          >
                            {t('dashboard.reject') || 'Reject'}
                          </button>
                        </>
                      )}
                      {(app.status === 'ACCEPTED' || app.status === 'REJECTED') && (
                        <div className="text-sm text-gray-600 text-center py-2">
                          {t('dashboard.applicationProcessed') || 'Processed'}
                        </div>
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
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {t('dashboard.postNewJob') || 'Post New Job'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowJobModal(false);
                      setError(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleCreateJob}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('dashboard.jobTitle') || 'Job Title'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={jobForm.title}
                        onChange={handleJobFormChange}
                        required
                        placeholder="e.g., Senior Software Engineer"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('dashboard.jobDescription') || 'Job Description'} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={jobForm.description}
                        onChange={handleJobFormChange}
                        rows={4}
                        required
                        placeholder="Describe the role, responsibilities, and what you're looking for..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('dashboard.jobRequirements') || 'Requirements'}
                      </label>
                      <textarea
                        id="requirements"
                        name="requirements"
                        value={jobForm.requirements}
                        onChange={handleJobFormChange}
                        rows={3}
                        placeholder="List the qualifications, skills, and experience required..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="salary_min" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('dashboard.minSalary') || 'Minimum Salary (₹/year)'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          id="salary_min"
                          name="salary_min"
                          value={jobForm.salary_min}
                          onChange={handleJobFormChange}
                          required
                          min="0"
                          placeholder="300000"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="salary_max" className="block text-sm font-medium text-gray-700 mb-1">
                          {t('dashboard.maxSalary') || 'Maximum Salary (₹/year)'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          id="salary_max"
                          name="salary_max"
                          value={jobForm.salary_max}
                          onChange={handleJobFormChange}
                          required
                          min="0"
                          placeholder="800000"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('dashboard.location') || 'Location'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={jobForm.location}
                        onChange={handleJobFormChange}
                        required
                        placeholder="e.g., Bangalore, India (Remote available)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-500'
                            }`}
                          >
                            {sdg}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowJobModal(false);
                        setError(null);
                      }}
                      className="px-5 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                      disabled={submitting}
                    >
                      {t('common.cancel') || 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('common.posting') || 'Posting...'}
                        </>
                      ) : (
                        t('dashboard.postJob') || 'Post Job'
                      )}
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