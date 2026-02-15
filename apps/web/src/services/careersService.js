/**
 * Green Matchers - Careers Service
 * Handles all career-related API calls
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
 * Get list of careers with optional filters
 * @param {Object} params - Query parameters
 * @returns {Promise<Object[]>} List of careers
 */
export const getCareers = async (params = {}) => {
  const response = await api.get(`/api/careers`, { params });
  return response.data;
};

/**
 * Get single career by ID
 * @param {number} careerId - Career ID
 * @returns {Promise<Object>} Career details
 */
export const getCareerById = async (careerId) => {
  const response = await api.get(`/api/careers/${careerId}`);
  return response.data;
};

/**
 * Create new career (admin only)
 * @param {Object} careerData - Career data
 * @returns {Promise<Object>} Created career
 */
export const createCareer = async (careerData) => {
  const response = await api.post(`/api/careers`, careerData);
  return response.data;
};

/**
 * Update existing career (admin only)
 * @param {number} careerId - Career ID
 * @param {Object} careerData - Updated career data
 * @returns {Promise<Object>} Updated career
 */
export const updateCareer = async (careerId, careerData) => {
  const response = await api.put(`/api/careers/${careerId}`, careerData);
  return response.data;
};

/**
 * Delete career (admin only)
 * @param {number} careerId - Career ID
 * @returns {Promise<void>}
 */
export const deleteCareer = async (careerId) => {
  const response = await api.delete(`/api/careers/${careerId}`);
  return response.data;
};

/**
 * Search careers
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object[]>} Search results
 */
export const searchCareers = async (query, filters = {}) => {
  const response = await api.get(`/api/search/careers`, {
    params: { q: query, ...filters },
  });
  return response.data;
};

/**
 * Get career paths matching user skills (AI-powered)
 * @param {string[]} userSkills - User skills
 * @returns {Promise<Object[]>} Matching career paths
 */
export const getMatchingCareers = async (userSkills) => {
  const response = await api.get(`/api/ai/recommendations/careers`, {
    params: { skills: userSkills.join(',') },
  });
  return response.data;
};

/**
 * Get careers by SDG goal
 * @param {number} sdgGoal - SDG goal number (1-17)
 * @returns {Promise<Object[]>} List of careers
 */
export const getCareersBySDG = async (sdgGoal) => {
  const response = await api.get(`/api/careers`, {
    params: { sdg_tag: sdgGoal },
  });
  return response.data;
};

/**
 * Get trending careers
 * @param {number} limit - Number of results
 * @returns {Promise<Object[]>} Trending careers
 */
export const getTrendingCareers = async (limit = 10) => {
  const response = await api.get(`/api/careers`, {
    params: { limit, order_by: 'demand_score' },
  });
  return response.data;
};

export default {
  getCareers,
  getCareerById,
  createCareer,
  updateCareer,
  deleteCareer,
  searchCareers,
  getMatchingCareers,
  getCareersBySDG,
  getTrendingCareers,
};
