/**
 * Green Matchers - Analytics Overview Component
 * Displays key metrics overview.
 */
import React from 'react';
import { useI18n } from '../../contexts/I18nContext';


const AnalyticsOverview = ({ overview }) => {
  const { t } = useI18n();

  const metrics = [
    {
      label: t('analytics.totalUsers'),
      value: overview?.total_users || 0,
      icon: '👥',
      color: 'bg-blue-500'
    },
    {
      label: t('analytics.totalJobs'),
      value: overview?.total_jobs || 0,
      icon: '💼',
      color: 'bg-green-500'
    },
    {
      label: t('analytics.totalCareers'),
      value: overview?.total_careers || 0,
      icon: '🎯',
      color: 'bg-purple-500'
    },
    {
      label: t('analytics.totalApplications'),
      value: overview?.total_applications || 0,
      icon: '📝',
      color: 'bg-orange-500'
    },
    {
      label: t('analytics.verifiedCompanies'),
      value: overview?.verified_companies || 0,
      icon: '✅',
      color: 'bg-teal-500'
    },
    {
      label: t('analytics.activeJobs30Days'),
      value: overview?.active_jobs_last_30_days || 0,
      icon: '🔥',
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{metric.label}</p>
              <p className="text-3xl font-bold text-gray-900">{metric.value.toLocaleString()}</p>
            </div>
            <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center text-2xl`}>
              {metric.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsOverview;
