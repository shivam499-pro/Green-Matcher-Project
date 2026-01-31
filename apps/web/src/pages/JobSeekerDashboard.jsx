import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { applicationsAPI, jobsAPI, recommendationsAPI } from '../utils/api';

const JobSeekerDashboard = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'applications') {
        const response = await applicationsAPI.listApplications();
        setApplications(response.data.items || response.data || []);
      } else if (activeTab === 'saved') {
        // Saved jobs would be a separate API endpoint
        // For now, we'll use a placeholder
        setSavedJobs([]);
      } else if (activeTab === 'recommendations') {
        const response = await recommendationsAPI.getJobRecommendations();
        setRecommendations(response.data.recommendations || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(t('dashboard.fetchError') || 'Failed to load data');
    } finally {
      setLoading(false);
    }
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
    { id: 'applications', label: t('dashboard.myApplications') || 'My Applications', count: applications.length },
    { id: 'saved', label: t('dashboard.savedJobs') || 'Saved Jobs', count: savedJobs.length },
    { id: 'recommendations', label: t('dashboard.recommended') || 'Recommended', count: recommendations.length },
  ];

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('dashboard.title') || 'Dashboard'}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('dashboard.subtitle') || 'Manage your job search journey'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600">{t('dashboard.totalApplications') || 'Total Applications'}</p>
                <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600">{t('dashboard.savedJobs') || 'Saved Jobs'}</p>
                <p className="text-3xl font-bold text-gray-900">{savedJobs.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600">{t('dashboard.recommendedJobs') || 'Recommended Jobs'}</p>
                <p className="text-3xl font-bold text-gray-900">{recommendations.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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

        {/* Applications Tab */}
        {!loading && activeTab === 'applications' && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('dashboard.noApplications') || 'No applications yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('dashboard.noApplicationsHint') || 'Start applying to jobs to track your progress'}
                </p>
                <button
                  onClick={() => navigate('/jobs')}
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                >
                  {t('dashboard.browseJobs') || 'Browse Jobs'}
                </button>
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 cursor-pointer"
                  onClick={() => navigate(`/jobs/${app.job.id}`)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{app.job.title}</h3>
                          <p className="text-gray-600 mb-2">{app.job.employer?.company_name || 'Company'}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        {app.job.location && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {app.job.location}
                          </span>
                        )}
                        {app.job.salary_min && app.job.salary_max && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ₹{app.job.salary_min.toLocaleString()} - ₹{app.job.salary_max.toLocaleString()}/year
                          </span>
                        )}
                      </div>

                      {app.cover_letter && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {t('dashboard.coverLetter') || 'Cover Letter'}: {app.cover_letter}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Saved Jobs Tab */}
        {!loading && activeTab === 'saved' && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('dashboard.noSavedJobs') || 'No saved jobs yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('dashboard.noSavedJobsHint') || 'Save jobs you\'re interested in to review later'}
            </p>
            <button
              onClick={() => navigate('/jobs')}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
            >
              {t('dashboard.browseJobs') || 'Browse Jobs'}
            </button>
          </div>
        )}

        {/* Recommendations Tab */}
        {!loading && activeTab === 'recommendations' && (
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('dashboard.noRecommendations') || 'No recommendations yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('dashboard.noRecommendationsHint') || 'Update your profile to get personalized job recommendations'}
                </p>
                <button
                  onClick={() => navigate('/profile')}
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                >
                  {t('dashboard.updateProfile') || 'Update Profile'}
                </button>
              </div>
            ) : (
              recommendations.map((rec) => (
                <div
                  key={rec.job.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 cursor-pointer"
                  onClick={() => navigate(`/jobs/${rec.job.id}`)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{rec.job.title}</h3>
                          <p className="text-gray-600 mb-2">{rec.job.employer?.company_name || 'Company'}</p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {Math.round(rec.similarity_score * 100)}% match
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        {rec.job.location && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {rec.job.location}
                          </span>
                        )}
                        {rec.job.salary_min && rec.job.salary_max && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ₹{rec.job.salary_min.toLocaleString()} - ₹{rec.job.salary_max.toLocaleString()}/year
                          </span>
                        )}
                      </div>

                      {rec.job.sdg_tags && rec.job.sdg_tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {rec.job.sdg_tags.map((sdg) => (
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

export default JobSeekerDashboard;
