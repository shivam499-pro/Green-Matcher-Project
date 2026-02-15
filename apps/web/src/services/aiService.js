/**
 * Green Matchers - AI/ML Service
 * Handles all AI-powered features including recommendations and matching
 */
import axios from 'axios';
import { STORAGE_KEYS } from '@/config/constants';

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
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add language parameter from localStorage
    const language = localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en';
    if (config.params) {
      config.params = { ...config.params, language };
    } else {
      config.params = { language };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors (redirect to login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Get job recommendations based on user profile
 * @param {Object} options - Recommendation options
 * @returns {Promise<Object[]>} Recommended jobs
 */
export const getJobRecommendations = async (options = {}) => {
  const response = await api.get(`/api/ai/recommendations/jobs`, { params: options });
  return response.data;
};

/**
 * Get career recommendations based on user skills
 * @param {Object} options - Recommendation options
 * @returns {Promise<Object[]>} Recommended careers
 */
export const getCareerRecommendations = async (options = {}) => {
  const response = await api.get(`/api/ai/recommendations/careers`, { params: options });
  return response.data;
};

/**
 * Match user skills to jobs
 * @param {number} jobId - Job ID
 * @returns {Promise<Object>} Match analysis
 */
export const matchSkillsToJob = async (jobId) => {
  const response = await api.post(`/api/ai/match/job/${jobId}`);
  return response.data;
};

/**
 * Get skill gap analysis
 * @param {number} targetJobId - Target job ID
 * @returns {Promise<Object>} Skill gap analysis
 */
export const getSkillGapAnalysis = async (targetJobId) => {
  const response = await api.post(`/api/ai/skill-gap/${targetJobId}`);
  return response.data;
};

/**
 * Get learning path recommendations
 * @param {number} careerId - Target career ID
 * @returns {Promise<Object[]>} Learning path steps
 */
export const getLearningPath = async (careerId) => {
  const response = await api.get(`/api/ai/learning-path/${careerId}`);
  return response.data;
};

/**
 * Generate cover letter
 * @param {Object} params - Cover letter parameters
 * @returns {Promise<string>} Generated cover letter
 */
export const generateCoverLetter = async (params) => {
  const response = await api.post(`/api/ai/generate-cover-letter`, params);
  return response.data;
};

/**
 * Get interview preparation tips
 * @param {number} jobId - Job ID
 * @returns {Promise<Object>} Interview tips
 */
export const getInterviewTips = async (jobId) => {
  const response = await api.get(`/api/ai/interview-tips/${jobId}`);
  return response.data;
};

/**
 * Semantic job search using embeddings
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Object[]>} Search results
 */
export const semanticJobSearch = async (query, options = {}) => {
  const response = await api.post(`/api/ai/search/jobs`, { query, ...options });
  return response.data;
};

export default {
  getJobRecommendations,
  getCareerRecommendations,
  matchSkillsToJob,
  getSkillGapAnalysis,
  getLearningPath,
  generateCoverLetter,
  getInterviewTips,
  semanticJobSearch,
};
