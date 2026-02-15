/**
 * Green Matchers - Auth Context
 * Provides authentication state and methods to the application
 * Integrates with I18nContext for language preference sync
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { useI18n } from './I18nContext';
import { STORAGE_KEYS } from '../config/constants';

const AuthContext = createContext(null);

/**
 * AuthProvider component that wraps the application
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setLanguage } = useI18n();

  /**
   * Initialize auth state from localStorage
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = authService.getStoredUser();
        const isAuth = authService.isAuthenticated();
        
        if (storedUser && isAuth) {
          setUser(storedUser);
          // Verify token is still valid by fetching fresh user data
          try {
            const freshUser = await authService.getCurrentUser();
            setUser(freshUser);
            
            // Sync language preference from user profile
            if (freshUser.language) {
              setLanguage(freshUser.language);
            }
            
            // Update stored user with fresh data
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(freshUser));
          } catch (err) {
            // Token invalid, logout
            authService.logout();
            setUser(null);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setLanguage]);

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { user } = await authService.login(email, password);
      setUser(user);
      
      // Sync language preference from user profile
      if (user.language) {
        setLanguage(user.language);
      }
      
      return user;
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLanguage]);

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user
   */
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.register(userData);
      return user;
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user
   */
  const updateProfile = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      
      // Update stored user
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      
      // Sync language preference if it was updated
      if (userData.language) {
        setLanguage(userData.language);
      }
      
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.detail || 'Update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLanguage]);

  /**
   * Update user skills
   * @param {string[]} skills - Array of skills
   * @returns {Promise<Object>} Updated user
   */
  const updateSkills = useCallback(async (skills) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await authService.updateSkills(skills);
      setUser(updatedUser);
      
      // Update stored user
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.detail || 'Update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check if user has specific role
   * @param {string[]} roles - Roles to check
   * @returns {boolean}
   */
  const hasRole = useCallback((roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh user data from backend
   * @returns {Promise<Object>} Updated user data
   */
  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await authService.getCurrentUser();
      setUser(freshUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(freshUser));
      return freshUser;
    } catch (err) {
      console.error('Failed to refresh user data:', err);
      throw err;
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    updateSkills,
    hasRole,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
