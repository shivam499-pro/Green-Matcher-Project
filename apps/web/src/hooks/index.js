/**
 * Green Matchers - Custom React Hooks
 * Reusable hooks for common functionality
 */
import { useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';

// Re-export hooks from individual files
export { useAuth } from './useAuth';
export { useApi } from './useApi';
export { useApplications } from './useApplications';
export { useForm as useFormHook } from './useForm';
export { useJobs } from './useJobs';
export { useCareers } from './useCareers';
export { useSavedJobs } from './useSavedJobs';
export { useRecommendations } from './useRecommendations';
export { usePreferences } from './usePreferences';
export { useAnalytics } from './useAnalytics';

/**
 * Generic data fetching hook
 * @param {Function} fetchFn - Async function to fetch data
 * @param {Object} dependencies - Dependencies that trigger refetch
 * @returns {Object} { data, loading, error, refetch }
 */
export const useFetch = (fetchFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook for paginated data fetching
 * @param {Function} fetchFn - Async function with pagination params
 * @param {number} initialPage - Initial page number
 * @returns {Object} Pagination state and methods
 */
export const usePagination = (fetchFn, initialPage = 1) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchPage = useCallback(async (pageNum) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn({ skip: (pageNum - 1) * 20, limit: 20 });
      if (pageNum === 1) {
        setData(result);
      } else {
        setData((prev) => [...prev, ...result]);
      }
      setHasMore(result.length === 20);
      setTotal((prev) => prev + result.length);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      fetchPage(page + 1);
    }
  }, [loading, hasMore, page, fetchPage]);

  const reset = useCallback(() => {
    setPage(1);
    setData([]);
    setHasMore(true);
    setTotal(0);
    fetchPage(1);
  }, [fetchPage]);

  return { data, loading, error, page, hasMore, total, loadMore, reset, fetchPage: () => fetchPage(1) };
};

/**
 * Hook for debounced value
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for local storage state
 * @param {string} key - Local storage key
 * @param {any} initialValue - Initial value
 * @returns {Array} [value, setValue]
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

/**
 * Hook for handling form state
 * @param {Object} initialValues - Initial form values
 * @param {Function} validate - Validation function
 * @returns {Object} Form state and handlers
 */
export const useForm = (initialValues, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  }, [values, validate]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    try {
      if (validate) {
        const validationErrors = validate(values);
        setErrors(validationErrors);
        
        if (Object.keys(validationErrors).length > 0) {
          setIsSubmitting(false);
          return;
        }
      }
      
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    setFieldValue,
  };
};

/**
 * Hook for handling async operations
 * @returns {Object} Async state and handlers
 */
export const useAsync = () => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (asyncFunction) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await asyncFunction();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'An error occurred';
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
};

export default {
  useFetch,
  usePagination,
  useDebounce,
  useLocalStorage,
  useForm,
  useAsync,
};
