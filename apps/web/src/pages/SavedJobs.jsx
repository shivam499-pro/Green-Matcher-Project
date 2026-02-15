/**
 * Green Matchers - Saved Jobs Page
 * Displays user's saved jobs with actions
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { savedJobsAPI } from '../utils/api';
import { useI18n } from '../contexts/I18nContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const SavedJobs = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchSavedJobs();
  }, [page]);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const response = await savedJobsAPI.getSavedJobs(page, 10);
      setSavedJobs(response.data.saved_jobs || []);
      setTotal(response.data.total || 0);
      setError(null);
    } catch (err) {
      setError('Failed to load saved jobs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId) => {
    try {
      await savedJobsAPI.unsaveJob(jobId);
      fetchSavedJobs();
    } catch (err) {
      setError('Failed to remove job');
      console.error(err);
    }
  };

  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="saved-jobs-page">
      <div className="page-header">
        <h1>{t('saved_jobs.title', 'Saved Jobs')}</h1>
        <p>{t('saved_jobs.subtitle', 'Jobs you\'ve saved for later viewing')}</p>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <LoadingSpinner />
      ) : savedJobs.length === 0 ? (
        <div className="no-saved-jobs">
          <div className="empty-state">
            <span className="empty-icon">📌</span>
            <h3>{t('saved_jobs.empty_title', 'No Saved Jobs')}</h3>
            <p>{t('saved_jobs.empty_description', 'You haven\'t saved any jobs yet. Browse jobs and click the save button to add them here.')}</p>
            <button className="btn btn-primary" onClick={() => navigate('/jobs')}>
              {t('saved_jobs.browse_jobs', 'Browse Jobs')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="saved-jobs-list">
            {savedJobs.map((item, index) => (
              <div key={`${item.job?.id}-${index}`} className="saved-job-card card">
                <div className="job-main-info">
                  <h3>{item.job?.title}</h3>
                  <div className="job-meta">
                    {item.job?.employer?.company_name && (
                      <span className="company">🏢 {item.job.employer.company_name}</span>
                    )}
                    {item.job?.location && (
                      <span className="location">📍 {item.job.location}</span>
                    )}
                    {item.job?.salary_min && item.job?.salary_max && (
                      <span className="salary">
                        💰 ₹{item.job.salary_min?.toLocaleString()} - 
                        ₹{item.job.salary_max?.toLocaleString()}
                      </span>
                    )}
                    {item.job?.job_type && (
                      <span className="job-type">💼 {item.job.job_type}</span>
                    )}
                  </div>
                  {item.job?.required_skills?.length > 0 && (
                    <div className="skills">
                      {item.job.required_skills.slice(0, 5).map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                      {item.job.required_skills.length > 5 && (
                        <span className="more-skills">+{item.job.required_skills.length - 5} {t('common.more', 'more')}</span>
                      )}
                    </div>
                  )}
                  <div className="saved-date">
                    {t('saved_jobs.saved_on', 'Saved on')} {formatDate(item.saved_at)}
                  </div>
                </div>
                <div className="job-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleViewJob(item.job?.id)}
                  >
                    {t('saved_jobs.view_job', 'View Job')}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleUnsave(item.job?.id)}
                  >
                    {t('saved_jobs.remove', 'Remove')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                {t('common.previous', 'Previous')}
              </button>
              <span className="page-info">
                {t('common.page', 'Page')} {page} {t('common.of', 'of')} {totalPages}
              </span>
              <button
                className="btn btn-secondary"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                {t('common.next', 'Next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SavedJobs;
