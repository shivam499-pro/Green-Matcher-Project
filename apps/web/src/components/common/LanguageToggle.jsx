import { useState, useRef, useEffect } from 'react';
import { useI18n, languageNames } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * LanguageToggle Component
 * Allows users to switch between English, Hindi, and Tamil
 * Syncs language preference with backend when user is authenticated
 */
function LanguageToggle() {
  const { language, setLanguageWithSync, getAvailableLanguages } = useI18n();
  const { isAuthenticated, updateProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef(null);

  const availableLanguages = getAvailableLanguages();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle language selection
  const handleLanguageChange = async (langCode) => {
    setIsUpdating(true);
    
    try {
      // If user is authenticated, sync with backend
      if (isAuthenticated && updateProfile) {
        await setLanguageWithSync(langCode, updateProfile);
      } else {
        // Just update locally if not authenticated
        setLanguageWithSync(langCode);
      }
    } catch (error) {
      console.error('Failed to update language preference:', error);
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  // Get current language display name
  const currentLanguageName = languageNames[language] || languageNames.en;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        {/* Globe Icon */}
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
        
        {/* Current Language */}
        <span className="hidden sm:inline">
          {isUpdating ? '...' : currentLanguageName}
        </span>
        
        {/* Chevron Icon */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          role="listbox"
          aria-label="Available languages"
        >
          <div className="py-1">
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                disabled={isUpdating}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between disabled:opacity-50 ${
                  language === lang.code
                    ? 'text-emerald-600 font-medium bg-emerald-50'
                    : 'text-gray-700'
                }`}
                role="option"
                aria-selected={language === lang.code}
              >
                <span>{lang.name}</span>
                {language === lang.code && (
                  <svg
                    className="w-4 h-4 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
          
          {/* Language Info */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 rounded-b-lg">
            <p className="text-xs text-gray-500">
              {language === 'en' && 'English is the default language'}
              {language === 'hi' && 'हिंदी - भारत की राजभाषा'}
              {language === 'ta' && 'தமிழ் - தென்னிந்திய மொழி'}
            </p>
            {isAuthenticated && (
              <p className="text-xs text-emerald-600 mt-1">
                Synced to your profile
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguageToggle;
