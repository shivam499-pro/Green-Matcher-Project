/**
 * useAnalytics Hook
 * Manages analytics data fetching and state
 */
import { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '../utils/api';

export const useAnalytics = () => {
  const [overview, setOverview] = useState(null);
  const [careerDemand, setCareerDemand] = useState([]);
  const [skillPopularity, setSkillPopularity] = useState([]);
  const [salaryRanges, setSalaryRanges] = useState([]);
  const [sdgDistribution, setSdgDistribution] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch overview data
  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsAPI.getOverview();
      setOverview(response.data);
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch analytics overview';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch career demand data
  const fetchCareerDemand = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsAPI.getCareerDemand(params);
      setCareerDemand(response.data?.items || response.data || []);
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch career demand';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch skill popularity data
  const fetchSkillPopularity = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsAPI.getSkillPopularity(params);
      setSkillPopularity(response.data?.items || response.data || []);
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch skill popularity';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch salary ranges data
  const fetchSalaryRanges = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsAPI.getSalaryRanges(params);
      setSalaryRanges(response.data?.items || response.data || []);
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch salary ranges';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch SDG distribution data
  const fetchSdgDistribution = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsAPI.getSDGDistribution();
      setSdgDistribution(response.data?.items || response.data || []);
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch SDG distribution';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all analytics data
  const fetchAllAnalytics = useCallback(async () => {
    await Promise.all([
      fetchOverview(),
      fetchCareerDemand(),
      fetchSkillPopularity(),
      fetchSalaryRanges(),
      fetchSdgDistribution(),
    ]);
  }, [fetchOverview, fetchCareerDemand, fetchSkillPopularity, fetchSalaryRanges, fetchSdgDistribution]);

  // Initial fetch
  useEffect(() => {
    fetchOverview();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    overview,
    careerDemand,
    skillPopularity,
    salaryRanges,
    sdgDistribution,
    loading,
    error,
    
    // Fetch functions
    fetchOverview,
    fetchCareerDemand,
    fetchSkillPopularity,
    fetchSalaryRanges,
    fetchSdgDistribution,
    fetchAllAnalytics,
  };
};

export default useAnalytics;
