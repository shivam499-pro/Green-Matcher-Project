/**
 * Green Matchers - Constants
 * Application-wide constants
 */

// Application Information
export const APP_NAME = 'Green Matchers';
export const APP_VERSION = '1.0.0';

// User Roles
export const USER_ROLES = {
  USER: 'USER',
  EMPLOYER: 'EMPLOYER',
  ADMIN: 'ADMIN',
};

// Application Status
export const APPLICATION_STATUS = {
  PENDING: 'PENDING',
  REVIEWING: 'REVIEWING',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW: 'INTERVIEW',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
};

// SDG Goals Configuration
export const SDG_GOALS = [
  { id: 1, name: 'No Poverty', color: '#E5243B', icon: '💰' },
  { id: 2, name: 'Zero Hunger', color: '#DDA63A', icon: '🍽️' },
  { id: 3, name: 'Good Health and Well-being', color: '#4C9F38', icon: '❤️' },
  { id: 4, name: 'Quality Education', color: '#C5192D', icon: '📚' },
  { id: 5, name: 'Gender Equality', color: '#FF3A21', icon: '⚖️' },
  { id: 6, name: 'Clean Water and Sanitation', color: '#26BDE2', icon: '💧' },
  { id: 7, name: 'Affordable and Clean Energy', color: '#FCC30B', icon: '⚡' },
  { id: 8, name: 'Decent Work and Economic Growth', color: '#A21942', icon: '💼' },
  { id: 9, name: 'Industry, Innovation and Infrastructure', color: '#FD6925', icon: '🏭' },
  { id: 10, name: 'Reduced Inequalities', color: '#DD1367', icon: '🤝' },
  { id: 11, name: 'Sustainable Cities and Communities', color: '#FD9D24', icon: '🏙️' },
  { id: 12, name: 'Responsible Consumption and Production', color: '#BF8B2E', icon: '♻️' },
  { id: 13, name: 'Climate Action', color: '#3F7E44', icon: '🌍' },
  { id: 14, name: 'Life Below Water', color: '#0A97D9', icon: '🌊' },
  { id: 15, name: 'Life on Land', color: '#56C02B', icon: '🌳' },
  { id: 16, name: 'Peace, Justice and Strong Institutions', color: '#00689D', icon: '⚖️' },
  { id: 17, name: 'Partnerships for the Goals', color: '#19486A', icon: '🌐' },
];

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  JOBS: '/jobs',
  CAREERS: '/careers',
  APPLICATIONS: '/applications',
  ANALYTICS: '/analytics',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'green-matchers-token',
  USER: 'green-matchers-user',
  LANGUAGE: 'green-matchers-language',
  THEME: 'green-matchers-theme',
  SAVED_JOBS: 'green-matchers-saved-jobs',
};

// Toast Messages
export const TOAST_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'You have been logged out.',
  REGISTER_SUCCESS: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  JOB_CREATED: 'Job posted successfully!',
  JOB_UPDATED: 'Job updated successfully!',
  JOB_DELETED: 'Job deleted successfully!',
  APPLICATION_SUBMITTED: 'Application submitted successfully!',
  APPLICATION_WITHDRAWN: 'Application withdrawn.',
  ERROR_OCCURRED: 'An error occurred. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
};

export default {
  APP_NAME,
  APP_VERSION,
  USER_ROLES,
  APPLICATION_STATUS,
  SDG_GOALS,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  API_ENDPOINTS,
  STORAGE_KEYS,
  TOAST_MESSAGES,
};
