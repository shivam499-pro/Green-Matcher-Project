/**
 * Green Matchers - Browse History Component
 * Displays recently viewed jobs by the user
 */
import React, { useState, useEffect } from 'react';
import { preferencesAPI } from '../../utils/api';
import { useI18n } from '../../contexts/I18nContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const BrowseHistory = ({ onSelectJob }) => {
  const { t } = useI18n();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await preferencesAPI.getBrowseHistory(20);
      setHistory(response.data.browse_history || []);
      setError(null);
    } catch (err) {
      setError('Failed to load browse history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all browse history?')) return;
    try {
      await preferencesAPI.clearBrowseHistory();
      setHistory([]);
    } catch (err) {
      setError('Failed to clear browse history');
      console.error(err);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="browse-history">
      <div className="history-header">
        <h2>Browse History</h2>
        {history.length > 0 && (
          <button className="btn btn-danger btn-sm" onClick={handleClearHistory}>
            Clear All
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="history-list">
        {history.length === 0 ? (
          <div className="no-history">
            <p>No browse history yet.</p>
            <p>Jobs you view will appear here for quick access.</p>
          </div>
        ) : (
          history.map((item, index) => (
            <div
              key={`${item.job.id}-${index}`}
              className="history-item card"
              onClick={() => onSelectJob && onSelectJob(item.job.id)}
            >
              <div className="job-info">
                <h4>{item.job.title}</h4>
                <div className="job-meta">
                  {item.job.location && <span>📍 {item.job.location}</span>}
                  {item.job.salary_min && item.job.salary_max && (
                    <span>
                      💰 ₹{item.job.salary_min?.toLocaleString()} - 
                      ₹{item.job.salary_max?.toLocaleString()}
                    </span>
                  )}
                </div>
                <span className="viewed-time">
                  Viewed {formatTimeAgo(item.viewed_at)}
                </span>
              </div>
              <div className="job-actions">
                <button className="btn btn-primary btn-sm">View Again</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BrowseHistory;
