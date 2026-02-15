/**
 * ProtectedRoute Component
 * Protects routes based on authentication and role
 * Uses AuthContext for consistent authentication state
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { STORAGE_KEYS } from '../../config/constants';

const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole) {
    if (user.role !== requiredRole) {
      // Redirect to appropriate dashboard based on actual role
      if (user.role === 'USER') {
        return <Navigate to="/dashboard" replace />;
      } else if (user.role === 'EMPLOYER') {
        return <Navigate to="/employer-dashboard" replace />;
      } else if (user.role === 'ADMIN') {
        return <Navigate to="/admin-dashboard" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
