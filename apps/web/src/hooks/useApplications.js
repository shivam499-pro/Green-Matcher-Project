/**
 * useApplications Hook
 * Manages job application operations and state
 * Fully connected to backend via API utility
 */
import { useState, useEffect, useCallback } from 'react';
import { applicationsAPI } from '../utils/api';

export const useApplications = (initialParams = {}) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);
  const [total, setTotal] = useState(0);

  // Fetch applications
  const fetchApplications = useCallback(async (customParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await applicationsAPI.listApplications(customParams || params);
      // Handle both array response and object with items
      const appsData = response.data?.items || response.data || [];
      setApplications(Array.isArray(appsData) ? appsData : []);
      setTotal(response.data?.count || appsData.length || 0);
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch applications';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [params]);

  // Fetch single application
  const fetchApplication = useCallback(async (applicationId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await applicationsAPI.getApplication(applicationId);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch application';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create application (apply for job)
  const createApplication = useCallback(async (applicationData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await applicationsAPI.createApplication(applicationData);
      await fetchApplications(); // Refresh list
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to submit application';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchApplications]);

  // Update application status (employer/admin only)
  const updateApplicationStatus = useCallback(async (applicationId, status) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await applicationsAPI.updateApplication(applicationId, status);
      await fetchApplications(); // Refresh list
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to update application';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchApplications]);

  // Delete application (withdraw application)
  const deleteApplication = useCallback(async (applicationId) => {
    try {
      setLoading(true);
      setError(null);
      
      await applicationsAPI.deleteApplication(applicationId);
      await fetchApplications(); // Refresh list
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete application';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchApplications]);

  // Update search params
  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchApplications();
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    applications,
    loading,
    error,
    params,
    total,
    fetchApplications,
    fetchApplication,
    createApplication,
    updateApplicationStatus,
    deleteApplication,
    updateParams,
    clearError,
  };
};

export default useApplications;
