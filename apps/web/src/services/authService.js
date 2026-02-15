/**
 * Green Matchers - Auth Service
 * Handles all authentication-related API calls
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

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data and auth token
 */
export const login = async (email, password) => {
  const response = await api.post(`/api/auth/login`, { email, password });
  const { access_token, ...user } = response.data;
  
  if (access_token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, access_token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }
  
  return { user, token: access_token };
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user data
 */
export const register = async (userData) => {
  const response = await api.post(`/api/auth/register`, userData);
  return response.data;
};

/**
 * Logout current user
 */
export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

/**
 * Get current user profile
 * @returns {Promise<Object>} Current user data
 */
export const getCurrentUser = async () => {
  const response = await api.get(`/api/users/me`);
  return response.data;
};

/**
 * Update current user profile
 * @param {Object} userData - User update data
 * @returns {Promise<Object>} Updated user data
 */
export const updateProfile = async (userData) => {
  const response = await api.put(`/api/users/me`, userData);
  return response.data;
};

/**
 * Update user skills
 * @param {string[]} skills - Array of skills
 * @returns {Promise<Object>} Updated user data
 */
export const updateSkills = async (skills) => {
  const response = await api.put(`/api/users/me/skills`, { skills });
  return response.data;
};

/**
 * Get stored user data
 * @returns {Object|null} User data or null
 */
export const getStoredUser = () => {
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return !!token;
};

/**
 * Get user role
 * @returns {string|null}
 */
export const getUserRole = () => {
  const user = getStoredUser();
  return user?.role || null;
};

/**
 * Check if user has specific role
 * @param {string[]} roles - Array of roles to check
 * @returns {boolean}
 */
export const hasRole = (roles) => {
  const userRole = getUserRole();
  return roles.includes(userRole);
};

/**
 * Update user language preference
 * @param {string} language - Language code
 * @returns {Promise<Object>} Updated user data
 */
export const updateLanguage = async (language) => {
  const response = await api.put(`/api/users/me`, { language });
  return response.data;
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  updateProfile,
  updateSkills,
  getStoredUser,
  isAuthenticated,
  getUserRole,
  hasRole,
  updateLanguage,
};
