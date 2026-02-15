/**
 * useRecommendations Hook
 * Manages AI-powered job and career recommendations
 */
import { useState, useEffect, useCallback } from 'react';
import { recommendationsAPI, aiAPI } from '../utils/api';

export const useRecommendations = () => {
  const [careerRecommendations, setCareerRecommendations] = useState([]);
  const [jobRecommendations, setJobRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch career recommendations
  const fetchCareerRecommendations = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await recommendationsAPI.getCareerRecommendations(params);
      setCareerRecommendations(response.data?.recommendations || response.data || []);
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch career recommendations';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch job recommendations
  const fetchJobRecommendations = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await recommendationsAPI.getJobRecommendations(params);
      setJobRecommendations(response.data?.recommendations || response.data || []);
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch job recommendations';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Match job (AI-powered)
  const matchJob = useCallback(async (jobId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiAPI.matchJob(jobId);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to match job';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Analyze skill gap
  const analyzeSkillGap = useCallback(async (jobId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiAPI.analyzeSkillGap(jobId);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to analyze skill gap';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get learning path
  const getLearningPath = useCallback(async (careerId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiAPI.getLearningPath(careerId);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to get learning path';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate cover letter
  const generateCoverLetter = useCallback(async (jobId, additionalInfo = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiAPI.generateCoverLetter(jobId, additionalInfo);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to generate cover letter';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get interview tips
  const getInterviewTips = useCallback(async (jobId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiAPI.getInterviewTips(jobId);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to get interview tips';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Semantic job search
  const semanticJobSearch = useCallback(async (query, limit = 20) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await aiAPI.semanticJobSearch(query, limit);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to search jobs';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all recommendations
  const fetchAllRecommendations = useCallback(async () => {
    await Promise.all([
      fetchCareerRecommendations(),
      fetchJobRecommendations(),
    ]);
  }, [fetchCareerRecommendations, fetchJobRecommendations]);

  // Initial fetch
  useEffect(() => {
    fetchAllRecommendations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    careerRecommendations,
    jobRecommendations,
    loading,
    error,
    fetchCareerRecommendations,
    fetchJobRecommendations,
    fetchAllRecommendations,
    matchJob,
    analyzeSkillGap,
    getLearningPath,
    generateCoverLetter,
    getInterviewTips,
    semanticJobSearch,
  };
};

export default useRecommendations;
