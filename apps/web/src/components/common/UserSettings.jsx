/**
 * Green Matchers - User Settings Component
 * Allows users to manage their preferences and settings
 */
import React, { useState, useEffect } from 'react';
import { preferencesAPI } from '../../utils/api';
import { useI18n } from '../../contexts/I18nContext';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';

const UserSettings = () => {
  const { t } = useI18n();
  const [settings, setSettings] = useState({
    email_notifications: true,
    job_alerts: true,
    application_updates: true,
    profile_visibility: 'public',
    language: 'en',
    timezone: 'UTC',
    theme: 'light'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await preferencesAPI.getSettings();
      setSettings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await preferencesAPI.updateSettings(settings);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save settings');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="user-settings">
      <h2>Settings</h2>
      
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      {/* Notification Settings */}
      <section className="settings-section card">
        <h3>Notification Preferences</h3>
        
        <div className="setting-item">
          <div className="setting-info">
            <label>Email Notifications</label>
            <p>Receive email notifications about important updates</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.email_notifications}
              onChange={() => handleToggle('email_notifications')}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Job Alerts</label>
            <p>Get notified when new jobs match your preferences</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.job_alerts}
              onChange={() => handleToggle('job_alerts')}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Application Updates</label>
            <p>Receive updates about your job applications</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.application_updates}
              onChange={() => handleToggle('application_updates')}
            />
            <span className="slider"></span>
          </label>
        </div>
      </section>

      {/* Privacy Settings */}
      <section className="settings-section card">
        <h3>Privacy</h3>
        
        <div className="setting-item">
          <div className="setting-info">
            <label>Profile Visibility</label>
            <p>Control who can see your profile</p>
          </div>
          <select
            value={settings.profile_visibility}
            onChange={(e) => handleChange('profile_visibility', e.target.value)}
            className="form-control"
          >
            <option value="public">Public - Visible to all employers</option>
            <option value="private">Private - Only visible to employers you apply to</option>
            <option value="hidden">Hidden - Not visible to anyone</option>
          </select>
        </div>
      </section>

      {/* Appearance Settings */}
      <section className="settings-section card">
        <h3>Appearance</h3>
        
        <div className="setting-item">
          <div className="setting-info">
            <label>Language</label>
            <p>Choose your preferred language</p>
          </div>
          <select
            value={settings.language}
            onChange={(e) => handleChange('language', e.target.value)}
            className="form-control"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="mr">मराठी (Marathi)</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Timezone</label>
            <p>Set your local timezone</p>
          </div>
          <select
            value={settings.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="form-control"
          >
            <option value="UTC">UTC</option>
            <option value="Asia/Kolkata">India (IST)</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <label>Theme</label>
            <p>Choose your preferred theme</p>
          </div>
          <select
            value={settings.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            className="form-control"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System Default</option>
          </select>
        </div>
      </section>

      <div className="settings-actions">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default UserSettings;
