/**
 * useJobs Hook
 * Manages job-related operations and state
 * Fully connected to backend via API utility
 */
import { useState, useEffect, useCallback } from 'react';
import { jobsAPI } from '../utils/api';

export const useJobs = (initialParams = {}) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);
  const [total, setTotal] = useState(0);

  // Fetch jobs
  const fetchJobs = useCallback(async (customParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobsAPI.listJobs(customParams || params);
      // Handle both array response and object with items
      const jobsData = response.data?.items || response.data || [];
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setTotal(response.data?.count || jobsData.length || 0);
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch jobs';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [params]);

  // Fetch single job
  const fetchJob = useCallback(async (jobId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobsAPI.getJob(jobId);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch job';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create job (employer only)
  const createJob = useCallback(async (jobData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobsAPI.createJob(jobData);
      await fetchJobs(); // Refresh list
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to create job';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchJobs]);

  // Update job (employer only)
  const updateJob = useCallback(async (jobId, jobData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobsAPI.updateJob(jobId, jobData);
      await fetchJobs(); // Refresh list
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to update job';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchJobs]);

  // Delete job (employer only)
  const deleteJob = useCallback(async (jobId) => {
    try {
      setLoading(true);
      setError(null);
      
      await jobsAPI.deleteJob(jobId);
      await fetchJobs(); // Refresh list
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete job';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchJobs]);

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
    fetchJobs();
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    jobs,
    loading,
    error,
    params,
    total,
    fetchJobs,
    fetchJob,
    createJob,
    updateJob,
    deleteJob,
    updateParams,
    clearError,
  };
};

export default useJobs;
