/**
 * usePreferences Hook
 * Manages user preferences including job alerts, browse history, and notifications
 */
import { useState, useEffect, useCallback } from 'react';
import { preferencesAPI } from '../utils/api';

export const usePreferences = () => {
  const [jobAlerts, setJobAlerts] = useState([]);
  const [browseHistory, setBrowseHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==================== JOB ALERTS ====================
  
  // Fetch job alerts
  const fetchJobAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await preferencesAPI.getJobAlerts();
      setJobAlerts(response.data || []);
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch job alerts';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create job alert
  const createJobAlert = useCallback(async (alertData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await preferencesAPI.createJobAlert(alertData);
      await fetchJobAlerts(); // Refresh list
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to create job alert';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchJobAlerts]);

  // Delete job alert
  const deleteJobAlert = useCallback(async (alertId) => {
    try {
      setLoading(true);
      setError(null);
      
      await preferencesAPI.deleteJobAlert(alertId);
      setJobAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete job alert';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== BROWSE HISTORY ====================
  
  // Fetch browse history
  const fetchBrowseHistory = useCallback(async (limit = 20) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await preferencesAPI.getBrowseHistory(limit);
      setBrowseHistory(response.data?.items || response.data || []);
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch browse history';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Add to browse history
  const addToHistory = useCallback(async (jobId) => {
    try {
      await preferencesAPI.addToHistory(jobId);
      return { success: true };
    } catch (err) {
      // Silently fail for history tracking
      return { success: false };
    }
  }, []);

  // Clear browse history
  const clearBrowseHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await preferencesAPI.clearBrowseHistory();
      setBrowseHistory([]);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to clear browse history';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== NOTIFICATIONS ====================
  
  // Fetch notifications
  const fetchNotifications = useCallback(async (unreadOnly = false, page = 1, limit = 20) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await preferencesAPI.getNotifications(unreadOnly, page, limit);
      setNotifications(response.data?.items || response.data || []);
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch notifications';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markNotificationRead = useCallback(async (notificationId) => {
    try {
      await preferencesAPI.markNotificationRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to mark notification as read';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await preferencesAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete notification';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // ==================== SETTINGS ====================
  
  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await preferencesAPI.getSettings();
      setSettings(response.data);
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch settings';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (newSettings) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await preferencesAPI.updateSettings(newSettings);
      setSettings(response.data);
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to update settings';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchJobAlerts();
    fetchNotifications();
    fetchSettings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    jobAlerts,
    browseHistory,
    notifications,
    settings,
    loading,
    error,
    
    // Job Alerts
    fetchJobAlerts,
    createJobAlert,
    deleteJobAlert,
    
    // Browse History
    fetchBrowseHistory,
    addToHistory,
    clearBrowseHistory,
    
    // Notifications
    fetchNotifications,
    markNotificationRead,
    deleteNotification,
    
    // Settings
    fetchSettings,
    updateSettings,
  };
};

export default usePreferences;
