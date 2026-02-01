/**
 * Green Matchers - Career Demand Chart Component
 * Displays career demand analytics.
 */
import React from 'react';


const CareerDemandChart = ({ careerDemand }) => {
  

  if (!careerDemand || careerDemand.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('analytics.careerDemand')}</h3>
        <p className="text-gray-500 text-center py-8">{t('No data available')}</p>
      </div>
    );
  }

  const maxScore = Math.max(...careerDemand.map(c => c.demand_score));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('Career Demand')}</h3>
      <div className="space-y-4">
        {careerDemand.map((career, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{career.career_title}</span>
              <span className="text-sm text-gray-500">
                {career.application_count} {t('Applications ')} • {career.job_count} {t('Jobs')}
              </span>
            </div>
            <div className="relative">
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                  style={{ width: `${(career.demand_score / maxScore) * 100}%` }}
                />
              </div>
              <span className="absolute right-0 top-4 text-xs font-semibold text-green-600">
                {career.demand_score.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerDemandChart;
