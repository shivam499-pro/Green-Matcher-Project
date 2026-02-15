/**
 * Green Matchers - Applications Service
 * Handles all application-related API calls
 */

import api from '../utils/api';

const APPLICATION_ENDPOINT = '/api/applications';

/**
 * Get list of applications
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Response with items and total
 */
export const getApplications = async (params = {}) => {
  const response = await api.get(APPLICATION_ENDPOINT, { params });
  return response.data;
};

/**
 * Get single application by ID
 * @param {number} applicationId - Application ID
 * @returns {Promise<Object>} Application details
 */
export const getApplicationById = async (applicationId) => {
  const response = await api.get(`${APPLICATION_ENDPOINT}/${applicationId}`);
  return response.data;
};

/**
 * Create new application
 * @param {Object} applicationData - Application data
 * @returns {Promise<Object>} Created application
 */
export const createApplication = async (applicationData) => {
  const response = await api.post(APPLICATION_ENDPOINT, applicationData);
  return response.data;
};

/**
 * Accept an application (employer only)
 * @param {number} applicationId - Application ID
 * @returns {Promise<Object>} Updated application
 */
export const acceptApplication = async (applicationId) => {
  const response = await api.post(`${APPLICATION_ENDPOINT}/${applicationId}/accept`);
  return response.data;
};

/**
 * Reject an application (employer only)
 * @param {number} applicationId - Application ID
 * @returns {Promise<Object>} Updated application
 */
export const rejectApplication = async (applicationId) => {
  const response = await api.post(`${APPLICATION_ENDPOINT}/${applicationId}/reject`);
  return response.data;
};

/**
 * Update application status (employer only)
 * @param {number} applicationId - Application ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated application
 */
export const updateApplicationStatus = async (applicationId, status) => {
  const response = await api.put(`${APPLICATION_ENDPOINT}/${applicationId}/status`, { status });
  return response.data;
};

/**
 * Withdraw own application (job seeker only)
 * @param {number} applicationId - Application ID
 * @returns {Promise<void>}
 */
export const withdrawApplication = async (applicationId) => {
  await api.delete(`${APPLICATION_ENDPOINT}/${applicationId}`);
};

/**
 * Get applications for a specific job (employer only)
 * @param {number} jobId - Job ID
 * @returns {Promise<Object[]>} List of applications
 */
export const getJobApplications = async (jobId) => {
  const response = await api.get(APPLICATION_ENDPOINT, {
    params: { job_id: jobId },
  });
  return response.data;
};

/**
 * Get my applications (job seeker)
 * @returns {Promise<Object[]>} List of applications
 */
export const getMyApplications = async () => {
  const response = await api.get(`${APPLICATION_ENDPOINT}/me`);
  return response.data;
};

/**
 * Get applications for employer's jobs
 * @param {Object} params - Query parameters (status, job_id)
 * @returns {Promise<Object[]>} List of applications
 */
export const getEmployerApplications = async (params = {}) => {
  const response = await api.get(`${APPLICATION_ENDPOINT}/employer`, { params });
  return response.data;
};

export default {
  getApplications,
  getApplicationById,
  createApplication,
  acceptApplication,
  rejectApplication,
  updateApplicationStatus,
  withdrawApplication,
  getJobApplications,
  getMyApplications,
  getEmployerApplications,
};
