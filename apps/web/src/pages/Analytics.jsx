/**
 * Green Matchers - Analytics Page
 * Displays all analytics and insights.
 */
import React, { useState, useEffect, useCallback } from 'react';

import AnalyticsOverview from '../components/analytics/AnalyticsOverview';
import CareerDemandChart from '../components/analytics/CareerDemandChart';
import SkillPopularityChart from '../components/analytics/SkillPopularityChart';
import SalaryRangeChart from '../components/analytics/SalaryRangeChart';
import SDGDistributionChart from '../components/analytics/SDGDistributionChart';
import { useI18n } from '../contexts/I18nContext';
import {
  getAnalyticsOverview,
  getCareerDemand,
  getSkillPopularity,
  getSalaryRanges,
  getSDGDistribution
} from '../services/analyticsService';

const Analytics = () => {
  
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [careerDemand, setCareerDemand] = useState([]);
  const [skillPopularity, setSkillPopularity] = useState([]);
  const [salaryRanges, setSalaryRanges] = useState([]);
  const [sdgDistribution, setSdgDistribution] = useState([]);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewData, demandData, skillData, salaryData, sdgData] = await Promise.all([
        getAnalyticsOverview(),
        getCareerDemand(10),
        getSkillPopularity(20),
        getSalaryRanges(null, 20),
        getSDGDistribution()
      ]);

      setOverview(overviewData);
      setCareerDemand(demandData);
      setSkillPopularity(skillData);
      setSalaryRanges(salaryData);
      setSdgDistribution(sdgData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(t('analytics.load_error', 'Error loading analytics data'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('analytics.loading', 'Loading analytics data...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            {t('common.retry', 'Retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('analytics.title', 'Analytics')}</h1>
              <p className="text-gray-600 mt-1">{t('analytics.subtitle', 'View platform insights and trends')}</p>
              {lastUpdated && (
                <p className="text-sm text-gray-400 mt-1">
                  {t('analytics.last_updated', 'Last updated')}: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('analytics.refresh', 'Refresh')}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview */}
        <div className="mb-8">
          <AnalyticsOverview overview={overview} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CareerDemandChart careerDemand={careerDemand} />
          <SkillPopularityChart skillPopularity={skillPopularity} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalaryRangeChart salaryRanges={salaryRanges} />
          <SDGDistributionChart sdgDistribution={sdgDistribution} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
