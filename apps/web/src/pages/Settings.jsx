/**
 * Green Matchers - Settings Page
 * User settings and preferences management
 */
import React from 'react';
import { useI18n } from '../contexts/I18nContext';
import UserSettings from '../components/common/UserSettings';
import JobAlertsManager from '../components/job-seeker/JobAlertsManager';

const Settings = () => {
  const { t } = useI18n();
  
  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>{t('settings.title', 'Settings & Preferences')}</h1>
        <p>{t('settings.subtitle', 'Manage your account settings, notifications, and job alerts')}</p>
      </div>

      <div className="settings-content">
        <div className="settings-grid">
          <section className="settings-section-wrapper">
            <UserSettings />
          </section>

          <section className="alerts-section-wrapper">
            <JobAlertsManager />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
