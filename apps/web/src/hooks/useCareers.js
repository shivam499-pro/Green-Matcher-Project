/**
 * useCareers Hook
 * Manages career-related operations and state
 */
import { useState, useEffect, useCallback } from 'react';
import { careersAPI } from '../utils/api';

export const useCareers = (initialParams = {}) => {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  // Fetch careers
  const fetchCareers = useCallback(async (customParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await careersAPI.listCareers(customParams || params);
      setCareers(response.data?.items || response.data || []);
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch careers';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [params]);

  // Fetch single career
  const fetchCareer = useCallback(async (careerId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await careersAPI.getCareer(careerId);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch career';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create career (admin only)
  const createCareer = useCallback(async (careerData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await careersAPI.createCareer(careerData);
      await fetchCareers(); // Refresh list
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to create career';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchCareers]);

  // Update career (admin only)
  const updateCareer = useCallback(async (careerId, careerData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await careersAPI.updateCareer(careerId, careerData);
      await fetchCareers(); // Refresh list
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to update career';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchCareers]);

  // Delete career (admin only)
  const deleteCareer = useCallback(async (careerId) => {
    try {
      setLoading(true);
      setError(null);
      
      await careersAPI.deleteCareer(careerId);
      await fetchCareers(); // Refresh list
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete career';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchCareers]);

  // Update search params
  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCareers();
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    careers,
    loading,
    error,
    params,
    fetchCareers,
    fetchCareer,
    createCareer,
    updateCareer,
    deleteCareer,
    updateParams,
  };
};

export default useCareers;
