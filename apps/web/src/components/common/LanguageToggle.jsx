import React from 'react';
import { useI18n, SUPPORTED_LANGUAGES, getLanguageNativeName } from '../../contexts/I18nContext';

/**
 * LanguageToggle Component
 * Allows users to switch between supported languages
 * Persists selection to localStorage
 */
const LanguageToggle = () => {
  const { language, changeLanguage } = useI18n();

  return (
    <div className="relative">
      <label htmlFor="language-select" className="sr-only">
        Select Language
      </label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-emerald-500 focus:ring-emerald-500 sm:text-sm rounded-md"
        aria-label="Select language"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName} ({lang.name})
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageToggle;
