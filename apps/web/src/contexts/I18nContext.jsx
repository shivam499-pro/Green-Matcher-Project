import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from '../translations/en.json';
import hi from '../translations/hi.json';
import ta from '../translations/ta.json';
import { STORAGE_KEYS } from '../config/constants';

/**
 * Green Matchers - Internationalization Context
 * Provides multi-language support for English, Hindi, and Tamil
 * Syncs language preference with backend when user is authenticated
 */

// Available translations
const translations = {
  en,
  hi,
  ta,
};

// Language names for display
export const languageNames = {
  en: 'English',
  hi: 'हिंदी',
  ta: 'தமிழ்',
};

// Language codes for HTML lang attribute
export const languageCodes = {
  en: 'en',
  hi: 'hi',
  ta: 'ta',
};

// Create context
const I18nContext = createContext(null);

/**
 * I18n Provider Component
 * Wraps the app to provide translation functionality
 */
export function I18nProvider({ children }) {
  // Initialize language from localStorage or default to English
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return saved && translations[saved] ? saved : 'en';
  });

  // Cache for translations
  const [currentTranslations, setCurrentTranslations] = useState(translations[language]);

  // Update localStorage and translations when language changes
  const setLanguage = useCallback((newLanguage) => {
    if (translations[newLanguage]) {
      setLanguageState(newLanguage);
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLanguage);
      setCurrentTranslations(translations[newLanguage]);
      
      // Update HTML lang attribute
      document.documentElement.lang = languageCodes[newLanguage];
    }
  }, []);

  /**
   * Set language and sync with backend if user is authenticated
   * @param {string} newLanguage - Language code to set
   * @param {Function} updateProfile - Optional function to update user profile in backend
   */
  const setLanguageWithSync = useCallback(async (newLanguage, updateProfile = null) => {
    if (translations[newLanguage]) {
      setLanguageState(newLanguage);
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLanguage);
      setCurrentTranslations(translations[newLanguage]);
      
      // Update HTML lang attribute
      document.documentElement.lang = languageCodes[newLanguage];
      
      // Sync with backend if updateProfile function is provided (user is authenticated)
      if (updateProfile) {
        try {
          await updateProfile({ language: newLanguage });
        } catch (error) {
          console.error('Failed to sync language preference with backend:', error);
          // Language is still changed locally even if backend sync fails
        }
      }
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    document.documentElement.lang = languageCodes[language];
  }, [language]);

  /**
   * Get translation by key path (e.g., 'nav.home', 'jobs.title')
   * Supports nested keys and fallback to English if key not found
   */
  const t = useCallback((keyPath, params = {}) => {
    // Split the key path (e.g., 'nav.home' -> ['nav', 'home'])
    const keys = keyPath.split('.');
    
    // Try to get translation from current language
    let value = currentTranslations;
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
            // Return key path if not found
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
    
    // Replace parameters (e.g., '{count}' -> actual count)
    let result = value;
    Object.keys(params).forEach(param => {
      result = result.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
    });
    
    return result;
  }, [currentTranslations]);

  /**
   * Check if a key exists in translations
   */
  const hasTranslation = useCallback((keyPath) => {
    const keys = keyPath.split('.');
    let value = currentTranslations;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return false;
      }
    }
    return typeof value === 'string';
  }, [currentTranslations]);

  /**
   * Get current language name for display
   */
  const getLanguageName = useCallback((langCode = language) => {
    return languageNames[langCode] || languageNames.en;
  }, [language]);

  /**
   * Get all available languages
   */
  const getAvailableLanguages = useCallback(() => {
    return Object.keys(translations).map(code => ({
      code,
      name: languageNames[code],
    }));
  }, []);

  const value = {
    language,
    setLanguage,
    setLanguageWithSync,
    t,
    hasTranslation,
    getLanguageName,
    getAvailableLanguages,
    isRTL: false, // None of our languages are RTL
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Custom hook to use i18n context
 */
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

/**
 * Higher-order component to add i18n to a component
 */
export function withI18n(Component) {
  return function I18nComponent(props) {
    const i18n = useI18n();
    return <Component {...props} i18n={i18n} />;
  };
}

export default I18nContext;
