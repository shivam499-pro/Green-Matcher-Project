import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { jobsAPI, applicationsAPI } from '../utils/api';
import { t } from '../utils/translations';

const JobDetail = () => {
  
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applicationMessage, setApplicationMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await jobsAPI.getJob(id);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
      setError(t('jobDetail.fetchError') || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    setApplicationMessage({ type: '', text: '' });

    try {
      await applicationsAPI.createApplication({
        job_id: parseInt(id),
        cover_letter: coverLetter,
      });
      setApplicationMessage({
        type: 'success',
        text: t('jobDetail.applySuccess') || 'Application submitted successfully!'
      });
      setShowApplyModal(false);
      setCoverLetter('');
    } catch (error) {
      console.error('Error applying:', error);
      const errorMessage = error.response?.data?.detail || 
                        error.message || 
                        (t('jobDetail.applyError') || 'Failed to submit application');
      setApplicationMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setApplying(false);
    }
  };

  const getSDGColor = (sdgId) => {
    const colors = {
      7: 'bg-yellow-500',
      11: 'bg-orange-500',
      12: 'bg-red-500',
      13: 'bg-green-500',
      14: 'bg-blue-500',
      15: 'bg-green-600',
    };
    return colors[sdgId] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('Loading...')}</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 text-red-800 p-6 rounded-lg border border-red-200">
            {error || t('Job not found')}
          </div>
          <button
            onClick={() => navigate('/jobs')}
            className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← {t('Back to Jobs')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Application Message */}
        {applicationMessage.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            applicationMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {applicationMessage.text}
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => navigate('/jobs')}
          className="mb-6 text-emerald-600 hover:text-emerald-700 font-medium flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('Back to Jobs')}
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                {job.is_verified && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t('Verified')}
                  </span>
                )}
              </div>
              <p className="text-xl text-gray-600 mb-4">{job.employer?.company_name || 'Company'}</p>

              {/* Location and Salary */}
              <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-4">
                {job.location && (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </span>
                )}
                {job.salary_min && job.salary_max && (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ₹{job.salary_min.toLocaleString()} - ₹{job.salary_max.toLocaleString()}/year
                  </span>
                )}
              </div>

              {/* SDG Tags */}
              {job.sdg_tags && job.sdg_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {job.sdg_tags.map((sdg) => (
                    <span
                      key={sdg}
                      className={`px-3 py-1 text-sm font-medium text-white rounded-full ${getSDGColor(sdg)}`}
                    >
                      {sdg}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Apply Button */}
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium whitespace-nowrap"
            >
              {t('Apply Now')}
            </button>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('Job Description')}
          </h2>
          <div className="prose prose-gray max-w-none text-gray-700 whitespace-pre-line">
            {job.description}
          </div>
        </div>

        {/* Requirements */}
        {job.requirements && (
          <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('Requirements')}
            </h2>
            <div className="prose prose-gray max-w-none text-gray-700 whitespace-pre-line">
              {job.requirements}
            </div>
          </div>
        )}

        {/* Company Info */}
        {job.employer && (
          <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('About Company')}
            </h2>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {job.employer.company_name}
                </h3>
                {job.employer.company_description && (
                  <p className="text-gray-600 mb-3">{job.employer.company_description}</p>
                )}
                {job.employer.company_website && (
                  <a
                    href={job.employer.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    {t('Visit Website →')}
                  </a>
                )}
              </div>
              {job.employer.is_verified && (
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {t('Verified Green Company')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Apply Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {t( `Apply for ${job.title}`)}
                  </h2>
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleApply}>
                  <div className="mb-4">
                    <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('Cover Letter (Optional)')}
                    </label>
                    <textarea
                      id="coverLetter"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={6}
                      placeholder={t('Tell us why you\'re a great fit for this role...')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {t('Cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={applying}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {applying ? (t('Submitting...')) : (t('Submit Application'))}
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

export default JobDetail;
