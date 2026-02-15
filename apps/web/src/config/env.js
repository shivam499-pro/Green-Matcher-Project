/**
 * Green Matchers - Environment Configuration
 * Centralized environment variable management
 */

const ENV = {
  // API Configuration
  VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  VITE_API_TIMEOUT: import.meta.env.VITE_API_TIMEOUT || 30000,
  
  // Feature Flags
  VITE_ENABLE_AI_FEATURES: import.meta.env.VITE_ENABLE_AI_FEATURES === 'true',
  VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
  VITE_ENABLE_MULTI_LANGUAGE: import.meta.env.VITE_ENABLE_MULTI_LANGUAGE !== 'false',
  
  // App Configuration
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'Green Matchers',
  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Pagination
  VITE_DEFAULT_PAGE_SIZE: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20,
  VITE_MAX_PAGE_SIZE: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE) || 100,
  
  // SDG Goals Configuration
  VITE_SDG_GOALS: [
    { id: 1, name: 'No Poverty', color: '#E5243B' },
    { id: 2, name: 'Zero Hunger', color: '#DDA63A' },
    { id: 3, name: 'Good Health and Well-being', color: '#4C9F38' },
    { id: 4, name: 'Quality Education', color: '#C5192D' },
    { id: 5, name: 'Gender Equality', color: '#FF3A21' },
    { id: 6, name: 'Clean Water and Sanitation', color: '#26BDE2' },
    { id: 7, name: 'Affordable and Clean Energy', color: '#FCC30B' },
    { id: 8, name: 'Decent Work and Economic Growth', color: '#A21942' },
    { id: 9, name: 'Industry, Innovation and Infrastructure', color: '#FD6925' },
    { id: 10, name: 'Reduced Inequalities', color: '#DD1367' },
    { id: 11, name: 'Sustainable Cities and Communities', color: '#FD9D24' },
    { id: 12, name: 'Responsible Consumption and Production', color: '#BF8B2E' },
    { id: 13, name: 'Climate Action', color: '#3F7E44' },
    { id: 14, name: 'Life Below Water', color: '#0A97D9' },
    { id: 15, name: 'Life on Land', color: '#56C02B' },
    { id: 16, name: 'Peace, Justice and Strong Institutions', color: '#00689D' },
    { id: 17, name: 'Partnerships for the Goals', color: '#19486A' },
  ],
  
  // User Roles
  VITE_USER_ROLES: {
    USER: 'USER',
    EMPLOYER: 'EMPLOYER',
    ADMIN: 'ADMIN',
  },
  
  // Application Status
  VITE_APPLICATION_STATUS: {
    PENDING: 'PENDING',
    REVIEWING: 'REVIEWING',
    SHORTLISTED: 'SHORTLISTED',
    INTERVIEW: 'INTERVIEW',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    WITHDRAWN: 'WITHDRAWN',
  },
};

/**
 * Check if environment is development
 * @returns {boolean}
 */
export const isDevelopment = () => import.meta.env.DEV;

/**
 * Check if environment is production
 * @returns {boolean}
 */
export const isProduction = () => import.meta.env.PROD;

export default ENV;
