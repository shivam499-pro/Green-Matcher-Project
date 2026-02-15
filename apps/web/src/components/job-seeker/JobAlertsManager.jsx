/**
 * Green Matchers - Job Alerts Manager Component
 * Allows users to create, view, and delete job alerts
 */
import React, { useState, useEffect } from 'react';
import { preferencesAPI } from '../../utils/api';
import { useI18n } from '../../contexts/I18nContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const JobAlertsManager = () => {
  const { t } = useI18n();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    keywords: '',
    location: '',
    job_type: '',
    salary_min: '',
    salary_max: '',
    frequency: 'daily',
    sdg_tags: []
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await preferencesAPI.getJobAlerts();
      setAlerts(response.data.alerts || []);
      setError(null);
    } catch (err) {
      setError('Failed to load job alerts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      await preferencesAPI.createJobAlert({
        ...formData,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null
      });
      setShowForm(false);
      setFormData({
        keywords: '',
        location: '',
        job_type: '',
        salary_min: '',
        salary_max: '',
        frequency: 'daily',
        sdg_tags: []
      });
      fetchAlerts();
    } catch (err) {
      setError('Failed to create job alert');
      console.error(err);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;
    try {
      await preferencesAPI.deleteJobAlert(alertId);
      fetchAlerts();
    } catch (err) {
      setError('Failed to delete job alert');
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="job-alerts-manager">
      <div className="alerts-header">
        <h2>Job Alerts</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Create Alert'}
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {showForm && (
        <form className="alert-form card" onSubmit={handleCreateAlert}>
          <div className="form-group">
            <label>Keywords</label>
            <input
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleInputChange}
              placeholder="e.g., Solar, Wind, Renewable"
              className="form-control"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Mumbai, Delhi"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Job Type</label>
              <select
                name="job_type"
                value={formData.job_type}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="">Any</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Min Salary (₹)</label>
              <input
                type="number"
                name="salary_min"
                value={formData.salary_min}
                onChange={handleInputChange}
                placeholder="e.g., 300000"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Max Salary (₹)</label>
              <input
                type="number"
                name="salary_max"
                value={formData.salary_max}
                onChange={handleInputChange}
                placeholder="e.g., 500000"
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Frequency</label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            Create Alert
          </button>
        </form>
      )}

      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="no-alerts">
            <p>No job alerts created yet.</p>
            <p>Create an alert to get notified about new jobs matching your criteria.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="alert-card card">
              <div className="alert-info">
                <h4>{alert.keywords || 'All Jobs'}</h4>
                <div className="alert-details">
                  {alert.location && <span>📍 {alert.location}</span>}
                  {alert.job_type && <span>💼 {alert.job_type}</span>}
                  {alert.salary_min && alert.salary_max && (
                    <span>💰 ₹{alert.salary_min?.toLocaleString()} - ₹{alert.salary_max?.toLocaleString()}</span>
                  )}
                  <span>🔔 {alert.frequency}</span>
                </div>
                <div className="alert-meta">
                  <span className={`status ${alert.is_active ? 'active' : 'inactive'}`}>
                    {alert.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="created-date">
                    Created: {new Date(alert.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteAlert(alert.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JobAlertsManager;
