import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Import all translation files
import enTranslations from '../translations/en.json';
import hiTranslations from '../translations/hi.json';
import taTranslations from '../translations/ta.json';
import teTranslations from '../translations/te.json';
import bnTranslations from '../translations/bn.json';
import mrTranslations from '../translations/mr.json';

// Translation files mapping
const translations = {
  en: enTranslations,
  hi: hiTranslations,
  ta: taTranslations,
  te: teTranslations,
  bn: bnTranslations,
  mr: mrTranslations,
};

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

// Default language
const DEFAULT_LANGUAGE = 'en';

// Local storage key
const LANGUAGE_STORAGE_KEY = 'green-matchers-language';

// Get initial language from localStorage or default
const getInitialLanguage = () => {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && translations[stored]) {
      return stored;
    }
  } catch (error) {
    console.error('Error reading language from localStorage:', error);
  }
  return DEFAULT_LANGUAGE;
};

// Create I18n Context
const I18nContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key, params = {}) => key,
  changeLanguage: (langCode) => {},
});

// I18n Provider Component
export const I18nProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getInitialLanguage());

  // Save language to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.error('Error saving language to localStorage:', error);
    }
  }, [language]);

  // Translation function
  const t = useCallback((key, params = {}) => {
    const currentTranslations = translations[language] || translations[DEFAULT_LANGUAGE];
    
    // Split key by dots to access nested objects (e.g., 'common.welcome')
    const keys = key.split('.');
    let value = currentTranslations;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }
    
    // If key not found, return the key itself
    if (value === undefined) {
      console.warn(`Translation key "${key}" not found for language "${language}"`);
      return key;
    }
    
    // Replace parameters in the translation string
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return Object.keys(params).reduce((str, paramKey) => {
        return str.replace(new RegExp(`{${paramKey}}`, 'g'), params[paramKey]);
      }, value);
    }
    
    return value;
  }, [language]);

  // Change language function
  const changeLanguage = useCallback((langCode) => {
    if (translations[langCode]) {
      setLanguageState(langCode);
    } else {
      console.warn(`Language "${langCode}" is not supported`);
    }
  }, []);

  const value = {
    language,
    setLanguage: setLanguageState,
    t,
    changeLanguage,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

// Custom hook to use I18n context
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};

// Helper function to get current language name
export const getLanguageName = (code) => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang ? lang.name : code;
};

// Helper function to get current language native name
export const getLanguageNativeName = (code) => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang ? lang.nativeName : code;
};
