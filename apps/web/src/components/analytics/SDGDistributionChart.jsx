/**
 * Green Matchers - SDG Distribution Chart Component
 * Displays SDG goal distribution across jobs.
 */
import React from 'react';


const SDG_COLORS = {
  1: '#E5243B',
  2: '#DDA63A',
  3: '#4C9F38',
  4: '#C5192D',
  5: '#FF3A21',
  6: '#26BDE2',
  7: '#FCC30B',
  8: '#A21942',
  9: '#FD6925',
  10: '#DD1367',
  11: '#FD9D24',
  12: '#BF8B2E',
  13: '#3F7E44',
  14: '#0A97D9',
  15: '#56C02B',
  16: '#00689D',
  17: '#19486A'
};

const SDGDistributionChart = ({ sdgDistribution }) => {
  

  if (!sdgDistribution || sdgDistribution.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('SDG Distribution')}</h3>
        <p className="text-gray-500 text-center py-8">{t('No data available')}</p>
      </div>
    );
  }

  const total = sdgDistribution.reduce((sum, sdg) => sum + sdg.count, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('SDG Distribution')}</h3>
      <div className="space-y-4">
        {sdgDistribution.map((sdg, index) => (
          <div key={index} className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: SDG_COLORS[sdg.sdg_goal] || '#666' }}
            >
              {sdg.sdg_goal}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{sdg.sdg_name}</span>
                <span className="text-sm text-gray-500">{sdg.percentage}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${sdg.percentage}%`,
                    backgroundColor: SDG_COLORS[sdg.sdg_goal] || '#666'
                  }}
                />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold text-gray-900">{sdg.count}</p>
              <p className="text-xs text-gray-500">{t('Jobs')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SDGDistributionChart;
