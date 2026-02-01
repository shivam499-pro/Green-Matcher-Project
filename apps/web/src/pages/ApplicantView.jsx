import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { usersAPI } from '../utils/api';

const ApplicantView = () => {
  
  const { userId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [applicant, setApplicant] = useState(null);
  const [error, setError] = useState(null);

  // Fetch applicant data on mount or when userId changes
  useEffect(() => {
    if (userId) {
      fetchApplicant();
    } else {
      setError(t('applicantView.invalidId') || 'Invalid applicant ID');
      setLoading(false);
    }
  }, [userId]);

  // Fetch applicant profile
  const fetchApplicant = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await usersAPI.getUserById(userId);
      setApplicant(response?.data || null);
    } catch (err) {
      console.error('Error fetching applicant:', err);
      setError(
        err.response?.status === 404
          ? t('applicantView.notFound') || 'Applicant not found'
          : t('applicantView.fetchError') || 'Failed to load applicant profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle contact action
  const handleContact = () => {
    if (applicant?.email) {
      window.location.href = `mailto:${applicant.email}`;
    }
  };

  // Loading spinner component
  const LoadingState = () => (
    <div className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{t('Loading applicant profile...')}</p>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg">
          <div className="flex items-start">
            <svg className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-medium mb-1">{t('Error')}</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('Back')}
        </button>
      </div>
    </div>
  );

  // Info item component
  const InfoItem = ({ icon, label, value }) => {
    if (!value) return null;
    
    return (
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
          <p className="text-gray-900">{value}</p>
        </div>
      </div>
    );
  };

  // Section component
  const Section = ({ title, children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {title && (
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      )}
      {children}
    </div>
  );

  // Render loading state
  if (loading) {
    return <LoadingState />;
  }

  // Render error state
  if (error || !applicant) {
    return <ErrorState />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-primary-600 hover:text-primary-700 font-medium inline-flex items-center transition"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('Back')}
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('Applicant Profile')}
          </h1>
        </div>

        {/* Profile Card */}
        <Section className="mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-600">
                  {applicant.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {applicant.full_name || t('Unknown')}
              </h2>
              
              <div className="space-y-4">
                <InfoItem
                  icon={
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                  label={t('Email')}
                  value={applicant.email}
                />

                {applicant.location && (
                  <InfoItem
                    icon={
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                    label={t('Location')}
                    value={applicant.location}
                  />
                )}

                {applicant.language && (
                  <InfoItem
                    icon={
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                    }
                    label={t('Preferred Language')}
                    value={applicant.language}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {applicant.bio && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {t('About')}
              </h3>
              <p className="text-gray-900 leading-relaxed">{applicant.bio}</p>
            </div>
          )}
        </Section>

        {/* Skills */}
        {applicant.skills && applicant.skills.length > 0 && (
          <Section title={t('applicantView.skills') || 'Skills'} className="mb-6">
            <div className="flex flex-wrap gap-2">
              {applicant.skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Experience */}
        {applicant.experience && applicant.experience.length > 0 && (
          <Section title={t('applicantView.experience') || 'Experience'} className="mb-6">
            <div className="space-y-4">
              {applicant.experience.map((exp, index) => (
                <div key={index} className="border-l-2 border-emerald-500 pl-4">
                  <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                  <p className="text-sm text-gray-600">{exp.company}</p>
                  {exp.duration && (
                    <p className="text-sm text-gray-500 mt-1">{exp.duration}</p>
                  )}
                  {exp.description && (
                    <p className="text-gray-700 mt-2">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Education */}
        {applicant.education && applicant.education.length > 0 && (
          <Section title={t('applicantView.education') || 'Education'} className="mb-6">
            <div className="space-y-4">
              {applicant.education.map((edu, index) => (
                <div key={index} className="border-l-2 border-emerald-500 pl-4">
                  <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  {edu.year && (
                    <p className="text-sm text-gray-500 mt-1">{edu.year}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Resume & Actions */}
        <Section className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {applicant.resume_url && (
              <a
                href={applicant.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('Download Resume')}
              </a>
            )}
            
            <button
              onClick={handleContact}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t('Contact Applicant')}
            </button>
          </div>
        </Section>

        {/* Additional Info */}
        {(applicant.portfolio_url || applicant.linkedin_url || applicant.github_url) && (
          <Section title={t('applicantView.links') || 'Links'} className="mb-6">
            <div className="flex flex-wrap gap-3">
              {applicant.portfolio_url && (
                <a
                  href={applicant.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  {t('applicantView.portfolio') || 'Portfolio'}
                </a>
              )}
              
              {applicant.linkedin_url && (
                <a
                  href={applicant.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                  LinkedIn
                </a>
              )}
              
              {applicant.github_url && (
                <a
                  href={applicant.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </a>
              )}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
};

export default ApplicantView;