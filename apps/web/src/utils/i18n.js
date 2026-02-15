/**
 * Simple i18n utility for Green Matcher Project
 * This file provides a simple translation function for use outside of React components
 * For React components, use the useI18n hook from contexts/I18nContext
 */

import { STORAGE_KEYS } from '@/config/constants';

// Import translations from JSON files
import en from '../translations/en.json';
import hi from '../translations/hi.json';
import ta from '../translations/ta.json';

const translations = { en, hi, ta };

// Current language - can be set from localStorage or user preferences
let currentLanguage = 'en';

/**
 * Get the current language from localStorage or default to 'en'
 */
function getCurrentLanguage() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return saved && translations[saved] ? saved : 'en';
  }
  return 'en';
}

/**
 * Translation function
 * @param {string} keyPath - Dot-separated key path (e.g., 'nav.home')
 * @param {object} params - Parameters to replace in the translation
 * @returns {string} - Translated string
 */
export const t = (keyPath, params = {}) => {
  const language = currentLanguage || getCurrentLanguage();
  const keys = keyPath.split('.');
  
  // Try to get translation from current language
  let value = translations[language];
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      // Fallback to English
      value = translations.en;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return keyPath;
        }
      }
      break;
    }
  }
  
  // If value is not a string, return key path
  if (typeof value !== 'string') {
    return keyPath;
  }
  
  // Replace parameters
  let result = value;
  Object.keys(params).forEach(param => {
    result = result.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
  });
  
  return result;
};

/**
 * Set language
 * @param {string} lang - Language code (en, hi, ta)
 */
export const setLanguage = (lang) => {
  if (translations[lang]) {
    currentLanguage = lang;
    // Save to localStorage using the correct key
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    }
  }
};

/**
 * Get current language
 * @returns {string} - Current language code
 */
export const getLanguage = () => {
  return currentLanguage || getCurrentLanguage();
};

/**
 * Initialize language from localStorage if available
 */
export const initLanguage = () => {
  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (savedLang && translations[savedLang]) {
      currentLanguage = savedLang;
    }
  }
};

/**
 * Get all available languages
 * @returns {Array} - Array of language objects with code and name
 */
export const getAvailableLanguages = () => [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'ta', name: 'தமிழ்' },
];

/**
 * Check if a translation exists
 * @param {string} keyPath - Dot-separated key path
 * @param {string} lang - Language code (optional)
 * @returns {boolean} - Whether the translation exists
 */
export const hasTranslation = (keyPath, lang = null) => {
  const language = lang || currentLanguage || getCurrentLanguage();
  const keys = keyPath.split('.');
  let value = translations[language];
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return false;
    }
  }
  
  return typeof value === 'string';
};

/**
 * Get all translations for a specific language
 * @param {string} lang - Language code
 * @returns {object} - All translations for the language
 */
export const getTranslations = (lang = 'en') => {
  return translations[lang] || translations.en;
};

// Auto-initialize
initLanguage();

export default {
  t,
  setLanguage,
  getLanguage,
  initLanguage,
  getAvailableLanguages,
  hasTranslation,
  getTranslations,
};
