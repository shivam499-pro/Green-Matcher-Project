/**
 * Green Matchers - Jobs Service
 * Handles all job-related API calls
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

// Add auth token to requests
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

// Handle 401 errors
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
 * Get list of jobs with optional filters
 * @param {Object} params - Query parameters
 * @returns {Promise<Object[]>} List of jobs
 */
export const getJobs = async (params = {}) => {
  const response = await api.get(`/api/jobs`, { params });
  return response.data;
};

/**
 * Get single job by ID
 * @param {number} jobId - Job ID
 * @returns {Promise<Object>} Job details
 */
export const getJobById = async (jobId) => {
  const response = await api.get(`/api/jobs/${jobId}`);
  return response.data;
};

/**
 * Create new job posting
 * @param {Object} jobData - Job data
 * @returns {Promise<Object>} Created job
 */
export const createJob = async (jobData) => {
  const response = await api.post(`/api/jobs`, jobData);
  return response.data;
};

/**
 * Update existing job
 * @param {number} jobId - Job ID
 * @param {Object} jobData - Updated job data
 * @returns {Promise<Object>} Updated job
 */
export const updateJob = async (jobId, jobData) => {
  const response = await api.put(`/api/jobs/${jobId}`, jobData);
  return response.data;
};

/**
 * Delete job posting
 * @param {number} jobId - Job ID
 * @returns {Promise<void>}
 */
export const deleteJob = async (jobId) => {
  const response = await api.delete(`/api/jobs/${jobId}`);
  return response.data;
};

/**
 * Search jobs
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object[]>} Search results
 */
export const searchJobs = async (query, filters = {}) => {
  const response = await api.get(`/api/search/jobs`, {
    params: { q: query, ...filters },
  });
  return response.data;
};

/**
 * Get jobs by employer
 * @param {number} employerId - Employer ID
 * @returns {Promise<Object[]>} List of employer jobs
 */
export const getEmployerJobs = async (employerId) => {
  const response = await api.get(`/api/jobs`, {
    params: { employer_id: employerId },
  });
  return response.data;
};

/**
 * Get recommended jobs for current user (AI-powered)
 * @param {Object} options - Recommendation options
 * @returns {Promise<Object[]>} Recommended jobs
 */
export const getRecommendedJobs = async (options = {}) => {
  const response = await api.get(`/api/ai/recommendations/jobs`, { params: options });
  return response.data;
};

/**
 * Save job for later
 * @param {number} jobId - Job ID
 * @returns {Promise<Object>} Updated user data
 */
export const saveJob = async (jobId) => {
  const response = await api.post(`/api/preferences/saved-jobs/${jobId}`);
  return response.data;
};

/**
 * Unsave job
 * @param {number} jobId - Job ID
 * @returns {Promise<Object>} Updated user data
 */
export const unsaveJob = async (jobId) => {
  const response = await api.delete(`/api/preferences/saved-jobs/${jobId}`);
  return response.data;
};

/**
 * Check if job is saved
 * @param {number} jobId - Job ID
 * @returns {Promise<boolean>}
 */
export const checkJobSaved = async (jobId) => {
  const response = await api.post(`/api/preferences/saved-jobs/check/${jobId}`);
  return response.data.is_saved;
};

export default {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  searchJobs,
  getEmployerJobs,
  getRecommendedJobs,
  saveJob,
  unsaveJob,
  checkJobSaved,
};
