import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { applicationsService } from '../services';
import { useI18n } from '../contexts/I18nContext';

const ApplicantView = () => {
  
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch application with proper error handling
  const fetchApplication = useCallback(async () => {
    if (!applicationId) {
      setError(t('applicant_view.invalid_id', 'Invalid application ID'));
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await applicationsService.getApplicationById(applicationId);
      setApplication(response);
    } catch (err) {
      console.error('Error fetching application:', err);
      
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      if (err.response?.status === 403) {
        setError(t('applicant_view.not_authorized', 'You are not authorized to view this application.'));
        return;
      }
      if (err.response?.status === 404) {
        setError(t('applicant_view.not_found', 'Application not found.'));
        return;
      }
      setError(t('applicant_view.fetch_error', 'Failed to load application. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [applicationId, navigate, t]);

  // Fetch application data on mount
  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  // Handle application status update
  const handleStatusUpdate = async (newStatus) => {
    if (!application) return;
    
    setActionLoading(true);
    try {
      await applicationsService.updateApplicationStatus(application.id, newStatus);
      setApplication(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Error updating status:', err);
      setError(t('applicant_view.update_error', 'Failed to update application status.'));
    } finally {
      setActionLoading(false);
    }
  };

  // Derived helpers
  const isAccepted = application?.status === 'ACCEPTED';
  const isPending = application?.status === 'PENDING';
  const job = application?.job;
  const candidate = application?.candidate;

  // Loading spinner
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading', 'Loading application...')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !application) {
    return (
      <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg">
            <p>{error || t('applicant_view.not_found', 'Application not found')}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← {t('Back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('Back')}
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('Application Details')}
          </h1>
          <p className="text-gray-600 mt-1">{job?.title || 'Job Position'}</p>
        </div>

        {/* Application Status Badge */}
        <div className="mb-6">
          <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
            application.status === 'ACCEPTED' 
              ? 'bg-green-100 text-green-800'
              : application.status === 'REJECTED'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {application.status}
          </span>
        </div>

        {/* Candidate Profile Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-600">
                  {candidate?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {candidate?.full_name || t('Unknown')}
              </h2>
              
              {/* Skills - Always safe to show */}
              {Array.isArray(candidate?.skills) && candidate.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {candidate.skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information - ONLY if ACCEPTED */}
        {isAccepted && application.email && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('Contact Information')}
            </h3>
            
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${application.email}`} className="text-emerald-600 hover:text-emerald-700">
                  {application.email}
                </a>
              </div>

              {/* Phone - if exists */}
              {application.candidate_phone && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{application.candidate_phone}</span>
                </div>
              )}

              {/* Resume Download - if exists */}
              {application.resume_url && (
                <div className="mt-4">
                  <a
                    href={application.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t('Download Resume')}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Note when NOT ACCEPTED */}
        {!isAccepted && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <p className="text-yellow-800">
              {application.status === 'PENDING' 
                ? t('This application is pending review.')
                : t('This application was not selected.')
              }
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              {t('Contact information will be available if you accept this application.')}
            </p>
          </div>
        )}

        {/* Application Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('Application Details')}
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('Applied')}:</span>
              <span className="text-gray-900">
                {application.created_at 
                  ? new Date(application.created_at).toLocaleDateString()
                  : '-'
                }
              </span>
            </div>
            
            {application.decided_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">{t('Decision Made')}:</span>
                <span className="text-gray-900">
                  {new Date(application.decided_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ApplicantView;
