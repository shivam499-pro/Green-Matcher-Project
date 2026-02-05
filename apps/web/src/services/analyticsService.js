/**
 * Green Matchers - Analytics Service
 * Handles all analytics-related API calls
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Get analytics overview
 * @returns {Promise<Object>} Analytics overview data
 */
export const getAnalyticsOverview = async () => {
  const response = await api.get(`${API_URL}/analytics/overview`);
  return response.data;
};

/**
 * Get career demand analytics
 * @param {number} limit - Number of results
 * @returns {Promise<Object[]>} Career demand data
 */
export const getCareerDemand = async (limit = 10) => {
  const response = await api.get(`${API_URL}/analytics/career-demand`, { params: { limit } });
  return response.data;
};

/**
 * Get skill popularity analytics
 * @param {number} limit - Number of results
 * @returns {Promise<Object[]>} Skill popularity data
 */
export const getSkillPopularity = async (limit = 20) => {
  const response = await api.get(`${API_URL}/analytics/skill-popularity`, { params: { limit } });
  return response.data;
};

/**
 * Get salary range analytics
 * @param {number} careerId - Optional career filter
 * @param {number} limit - Number of results
 * @returns {Promise<Object[]>} Salary range data
 */
export const getSalaryRanges = async (careerId = null, limit = 20) => {
  const params = { limit };
  if (careerId) params.career_id = careerId;
  
  const response = await api.get(`${API_URL}/analytics/salary-ranges`, { params });
  return response.data;
};

/**
 * Get SDG distribution analytics
 * @returns {Promise<Object[]>} SDG distribution data
 */
export const getSDGDistribution = async () => {
  const response = await api.get(`${API_URL}/analytics/sdg-distribution`);
  return response.data;
};

/**
 * Get job market trends
 * @param {string} period - Time period (week, month, year)
 * @returns {Promise<Object>} Job market trends
 */
export const getJobMarketTrends = async (period = 'month') => {
  const response = await api.get(`${API_URL}/analytics/trends`, { params: { period } });
  return response.data;
};

/**
 * Get user activity analytics (admin)
 * @returns {Promise<Object>} User activity data
 */
export const getUserActivity = async () => {
  const response = await api.get(`${API_URL}/analytics/user-activity`);
  return response.data;
};

/**
 * Get application statistics
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Application stats
 */
export const getApplicationStats = async (params = {}) => {
  const response = await api.get(`${API_URL}/analytics/applications`, { params });
  return response.data;
};

/**
 * Get employer analytics (employer dashboard)
 * @param {number} employerId - Employer ID
 * @returns {Promise<Object>} Employer analytics
 */
export const getEmployerAnalytics = async (employerId) => {
  const response = await api.get(`${API_URL}/analytics/employer/${employerId}`);
  return response.data;
};

export default {
  getAnalyticsOverview,
  getCareerDemand,
  getSkillPopularity,
  getSalaryRanges,
  getSDGDistribution,
  getJobMarketTrends,
  getUserActivity,
  getApplicationStats,
  getEmployerAnalytics,
};
