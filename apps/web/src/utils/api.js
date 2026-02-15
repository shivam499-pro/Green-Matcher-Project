/**
 * Green Matchers - API Utility (CORRECTED FOR YOUR BACKEND)
 * Handles all API communication with the backend
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

// Add auth token to requests if available
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
  (error) => {
    return Promise.reject(error);
  }
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

// ✅ FIXED: Auth API - Sends JSON as your backend expects
export const authAPI = {
  login: (credentials) => {
    // Your backend expects JSON with 'email' and 'password'
    return api.post('/api/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });
  },
  
  register: (userData) => api.post('/api/auth/register', userData),
  
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    return api.post('/api/auth/logout');
  },
};

export const usersAPI = {
  getCurrentUser: () => api.get('/api/users/me'),
  updateProfile: (userData) => api.put('/api/users/me', userData),
  updateSkills: (skills) => api.put('/api/users/me/skills', { skills }),
  getUserById: (userId) => api.get(`/api/users/${userId}`),
};

// Alias for Profile page
export const userAPI = {
  getProfile: () => api.get('/api/users/me'),
  updateProfile: (userData) => api.put('/api/users/me', userData),
  updateSkills: (skills) => api.put('/api/users/me/skills', { skills }),
  uploadResume: (formData) => api.post('/api/users/me/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const jobsAPI = {
  listJobs: (params) => api.get('/api/jobs', { params }),
  getJob: (jobId) => api.get(`/api/jobs/${jobId}`),
  createJob: (jobData) => api.post('/api/jobs', jobData),
  updateJob: (jobId, jobData) => api.put(`/api/jobs/${jobId}`, jobData),
  deleteJob: (jobId) => api.delete(`/api/jobs/${jobId}`),
};

export const careersAPI = {
  listCareers: (params) => api.get('/api/careers', { params }),
  getCareer: (careerId) => api.get(`/api/careers/${careerId}`),
  createCareer: (careerData) => api.post('/api/careers', careerData),
  updateCareer: (careerId, careerData) => api.put(`/api/careers/${careerId}`, careerData),
  deleteCareer: (careerId) => api.delete(`/api/careers/${careerId}`),
};

export const applicationsAPI = {
  listApplications: (params) => api.get('/api/applications', { params }),
  getApplication: (applicationId) => api.get(`/api/applications/${applicationId}`),
  createApplication: (applicationData) => api.post('/api/applications', applicationData),
  updateApplication: (applicationId, status) => api.put(`/api/applications/${applicationId}`, { status }),
  deleteApplication: (applicationId) => api.delete(`/api/applications/${applicationId}`),
};

export const analyticsAPI = {
  getOverview: () => api.get('/api/analytics/overview'),
  getCareerDemand: (params) => api.get('/api/analytics/career-demand', { params }),
  getSkillPopularity: (params) => api.get('/api/analytics/skill-popularity', { params }),
  getSalaryRanges: (params) => api.get('/api/analytics/salary-ranges', { params }),
  getSDGDistribution: () => api.get('/api/analytics/sdg-distribution'),
};

export const recommendationsAPI = {
  getCareerRecommendations: (params) => api.get('/api/ai/recommendations/careers', { params }),
  getJobRecommendations: (params) => api.get('/api/ai/recommendations/jobs', { params }),
};

export const savedJobsAPI = {
  saveJob: (jobId) => api.post(`/api/preferences/saved-jobs/${jobId}`),
  unsaveJob: (jobId) => api.delete(`/api/preferences/saved-jobs/${jobId}`),
  getSavedJobs: (page = 1, limit = 20) => api.get('/api/preferences/saved-jobs', { params: { page, limit } }),
  checkSaved: (jobId) => api.post(`/api/preferences/saved-jobs/check/${jobId}`),
};

// AI-powered features API
export const aiAPI = {
  getJobRecommendations: (limit = 10) => api.get('/api/ai/recommendations/jobs', { params: { limit } }),
  getCareerRecommendations: (skills, limit = 10) => api.get('/api/ai/recommendations/careers', { params: { skills, limit } }),
  matchJob: (jobId) => api.post(`/api/ai/match/job/${jobId}`),
  analyzeSkillGap: (jobId) => api.post(`/api/ai/skill-gap/${jobId}`),
  getLearningPath: (careerId) => api.get(`/api/ai/learning-path/${careerId}`),
  generateCoverLetter: (jobId, additionalInfo) => api.post('/api/ai/generate-cover-letter', null, { params: { job_id: jobId, additional_info: additionalInfo } }),
  getInterviewTips: (jobId) => api.get(`/api/ai/interview-tips/${jobId}`),
  semanticJobSearch: (query, limit = 20) => api.post('/api/ai/search/jobs', null, { params: { query, limit } }),
};

// Advanced search API
export const searchAPI = {
  searchJobs: (params) => api.get('/api/search/jobs', { params }),
  searchCareers: (params) => api.get('/api/search/careers', { params }),
  autocomplete: (q, type = 'jobs', limit = 10) => api.get('/api/search/autocomplete', { params: { q, type, limit } }),
  getSuggestions: () => api.get('/api/search/suggestions'),
};

// User preferences API
export const preferencesAPI = {
  // Job Alerts
  createJobAlert: (alertData) => api.post('/api/preferences/job-alerts', alertData),
  getJobAlerts: () => api.get('/api/preferences/job-alerts'),
  deleteJobAlert: (alertId) => api.delete(`/api/preferences/job-alerts/${alertId}`),
  
  // Browse History
  addToHistory: (jobId) => api.post(`/api/preferences/browse-history/${jobId}`),
  getBrowseHistory: (limit = 20) => api.get('/api/preferences/browse-history', { params: { limit } }),
  clearBrowseHistory: () => api.delete('/api/preferences/browse-history'),
  
  // Notifications
  getNotifications: (unreadOnly = false, page = 1, limit = 20) => 
    api.get('/api/preferences/notifications', { params: { unread_only: unreadOnly, page, limit } }),
  markNotificationRead: (notificationId) => api.post(`/api/preferences/notifications/${notificationId}/read`),
  deleteNotification: (notificationId) => api.delete(`/api/preferences/notifications/${notificationId}`),
  
  // User Settings
  getSettings: () => api.get('/api/preferences/settings'),
  updateSettings: (settings) => api.put('/api/preferences/settings', settings),
};

export default api;