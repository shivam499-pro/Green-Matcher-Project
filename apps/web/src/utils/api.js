/**
 * Green Matchers - API Utility
 * Handles all API communication with the backend
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

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add language parameter from localStorage
    const language = localStorage.getItem('green-matchers-language') || 'en';
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

// API functions
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (userData) => api.post('/api/auth/register', userData),
  logout: () => api.post('/api/auth/logout'),
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
  getCareerRecommendations: (params) => api.get('/api/users/me/recommendations', { params }),
  getJobRecommendations: (params) => api.get('/api/users/me/job-recommendations', { params }),
};

export default api;
