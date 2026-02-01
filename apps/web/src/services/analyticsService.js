/**
 * Green Matchers - Analytics API Service
 * Handles all analytics-related API calls.
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get analytics overview
 */
export const getAnalyticsOverview = async () => {
  const response = await axios.get(`${API_BASE_URL}/analytics/overview`, {
    headers: getAuthHeader()
  });
  return response.data;
};

/**
 * Get career demand analytics
 */
export const getCareerDemand = async (limit = 10) => {
  const response = await axios.get(`${API_BASE_URL}/analytics/career-demand`, {
    headers: getAuthHeader(),
    params: { limit }
  });
  return response.data;
};

/**
 * Get skill popularity analytics
 */
export const getSkillPopularity = async (limit = 20) => {
  const response = await axios.get(`${API_BASE_URL}/analytics/skill-popularity`, {
    headers: getAuthHeader(),
    params: { limit }
  });
  return response.data;
};

/**
 * Get salary range analytics
 */
export const getSalaryRanges = async (careerId = null, limit = 20) => {
  const response = await axios.get(`${API_BASE_URL}/analytics/salary-ranges`, {
    headers: getAuthHeader(),
    params: { career_id: careerId, limit }
  });
  return response.data;
};

/**
 * Get SDG distribution analytics
 */
export const getSDGDistribution = async () => {
  const response = await axios.get(`${API_BASE_URL}/analytics/sdg-distribution`, {
    headers: getAuthHeader()
  });
  return response.data;
};

/**
 * Get a specific analytics metric
 */
export const getAnalyticsMetric = async (metricName) => {
  const response = await axios.get(`${API_BASE_URL}/analytics/metrics/${metricName}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

/**
 * Recompute an analytics metric (admin only)
 */
export const recomputeAnalyticsMetric = async (metricName) => {
  const response = await axios.post(`${API_BASE_URL}/analytics/metrics/${metricName}/recompute`, {}, {
    headers: getAuthHeader()
  });
  return response.data;
};
