/**
 * Green Matchers - Salary Range Chart Component
 * Displays salary range analytics by career.
 */
import React from 'react';
import { useI18n } from '../../contexts/I18nContext';


const SalaryRangeChart = ({ salaryRanges }) => {
  const { t } = useI18n();

  if (!salaryRanges || salaryRanges.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('analytics.salaryRanges')}</h3>
        <p className="text-gray-500 text-center py-8">{t('No data available')}</p>
      </div>
    );
  }

  const formatSalary = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('Salary Ranges')}</h3>
      <div className="space-y-4">
        {salaryRanges.map((range, index) => (
          <div key={index} className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{range.career_title}</h4>
                <p className="text-sm text-gray-500">{range.job_count} {t('Jobs')}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-green-600">
                  {formatSalary(range.avg_salary)}
                </p>
                <p className="text-xs text-gray-500">{t('Average Salary')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                  style={{ width: '100%' }}
                />
              </div>
              <div className="flex gap-4 text-xs text-gray-600">
                <span>{formatSalary(range.min_salary)}</span>
                <span>{formatSalary(range.max_salary)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalaryRangeChart;
