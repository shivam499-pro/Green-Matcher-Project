/**
 * Green Matchers - Skill Popularity Chart Component
 * Displays skill popularity analytics.
 */
import React from 'react';
import { useI18n } from '../../contexts/I18nContext';


const SkillPopularityChart = ({ skillPopularity }) => {
  const { t } = useI18n();

  if (!skillPopularity || skillPopularity.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Skill Popularity')}</h3>
        <p className="text-gray-500 text-center py-8">{t('No data available')}</p>
      </div>
    );
  }

  const maxCount = Math.max(...skillPopularity.map(s => s.count));

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <span className="text-green-500">↑</span>;
      case 'down':
        return <span className="text-red-500">↓</span>;
      default:
        return <span className="text-gray-400">→</span>;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'from-green-400 to-green-600';
      case 'down':
        return 'from-red-400 to-red-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('Skill Popularity')}</h3>
      <div className="space-y-4">
        {skillPopularity.map((skill, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 capitalize">{skill.skill}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{skill.count} {t('Users')}</span>
                {getTrendIcon(skill.trend)}
              </div>
            </div>
            <div className="relative">
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getTrendColor(skill.trend)} rounded-full transition-all duration-500`}
                  style={{ width: `${(skill.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillPopularityChart;
