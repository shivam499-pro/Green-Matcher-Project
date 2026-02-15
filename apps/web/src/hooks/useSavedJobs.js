/**
 * useSavedJobs Hook
 * Manages saved jobs operations and state
 */
import { useState, useEffect, useCallback } from 'react';
import { savedJobsAPI } from '../utils/api';

export const useSavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch saved jobs
  const fetchSavedJobs = useCallback(async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await savedJobsAPI.getSavedJobs(page, limit);
      setSavedJobs(response.data?.items || response.data || []);
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch saved jobs';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Save a job
  const saveJob = useCallback(async (jobId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await savedJobsAPI.saveJob(jobId);
      await fetchSavedJobs(); // Refresh list
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to save job';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchSavedJobs]);

  // Unsave a job
  const unsaveJob = useCallback(async (jobId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await savedJobsAPI.unsaveJob(jobId);
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to unsave job';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if job is saved
  const checkSaved = useCallback(async (jobId) => {
    try {
      const response = await savedJobsAPI.checkSaved(jobId);
      return { success: true, isSaved: response.data?.is_saved || false };
    } catch (err) {
      return { success: false, isSaved: false };
    }
  }, []);

  // Toggle save status
  const toggleSave = useCallback(async (jobId, isCurrentlySaved) => {
    if (isCurrentlySaved) {
      return await unsaveJob(jobId);
    } else {
      return await saveJob(jobId);
    }
  }, [saveJob, unsaveJob]);

  // Initial fetch
  useEffect(() => {
    fetchSavedJobs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    savedJobs,
    loading,
    error,
    fetchSavedJobs,
    saveJob,
    unsaveJob,
    checkSaved,
    toggleSave,
  };
};

export default useSavedJobs;
