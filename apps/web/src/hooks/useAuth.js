/**
 * useAuth Hook
 * Wrapper around AuthContext for backward compatibility
 * This hook now delegates to AuthContext for consistent state management
 */
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Custom hook to use auth context
 * This is now a wrapper around AuthContext for backward compatibility
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
