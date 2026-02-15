/**
 * Green Matchers - Utils
 * Utility modules for the frontend
 */

// API utilities
export { 
  api,
  authAPI,
  usersAPI,
  userAPI,
  jobsAPI,
  careersAPI,
  applicationsAPI,
  analyticsAPI,
  recommendationsAPI,
  savedJobsAPI,
  aiAPI,
  searchAPI,
  preferencesAPI,
} from './api';

// Translation utilities
export { 
  t, 
  getTranslations, 
  hasTranslation, 
  getAvailableLanguages 
} from './translations';

// i18n utilities
export { 
  t as translate,
  setLanguage,
  getLanguage,
  initLanguage,
  getAvailableLanguages as getLanguages,
  hasTranslation as hasKey,
  getTranslations as getAllTranslations,
} from './i18n';
