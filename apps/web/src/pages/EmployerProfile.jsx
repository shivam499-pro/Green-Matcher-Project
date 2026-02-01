import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { usersAPI } from '../utils/api';

const EmployerProfile = () => {
  
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isVerified, setIsVerified] = useState(false);
  const [profile, setProfile] = useState({
    company_name: '',
    company_description: '',
    company_website: '',
    industry: '',
    company_size: '',
    location: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch profile data
  const fetchProfile = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await usersAPI.getCurrentUser();
      const userData = response?.data || {};
      
      setProfile({
        company_name: userData.company_name || '',
        company_description: userData.company_description || '',
        company_website: userData.company_website || '',
        industry: userData.industry || '',
        company_size: userData.company_size || '',
        location: userData.location || '',
      });
      
      setIsVerified(userData.is_verified || false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setMessage({ 
        type: 'error', 
        text: t('employerProfile.fetchError') || 'Failed to load profile. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    // Clear message when user starts editing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  // Validate form
  const validateForm = () => {
    if (!profile.company_name.trim()) {
      setMessage({ 
        type: 'error', 
        text: t('employerProfile.companyNameRequired') || 'Company name is required' 
      });
      return false;
    }

    if (profile.company_website && !isValidUrl(profile.company_website)) {
      setMessage({ 
        type: 'error', 
        text: t('employerProfile.invalidWebsite') || 'Please enter a valid website URL' 
      });
      return false;
    }

    return true;
  };

  // Validate URL
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await usersAPI.updateProfile({
        company_name: profile.company_name,
        company_description: profile.company_description,
        company_website: profile.company_website,
        industry: profile.industry,
        company_size: profile.company_size,
        location: profile.location,
      });
      
      setMessage({ 
        type: 'success', 
        text: t('employerProfile.saveSuccess') || 'Profile updated successfully!' 
      });
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ 
        type: 'error', 
        text: t('employerProfile.saveError') || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setSaving(false);
    }
  };

  // Company size options
  const companySizeOptions = [
    { value: '', label: t('employerProfile.selectSize') || 'Select company size' },
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' },
  ];

  // Industry options
  const industryOptions = [
    { value: '', label: t('employerProfile.selectIndustry') || 'Select industry' },
    { value: 'renewable-energy', label: t('employerProfile.renewableEnergy') || 'Renewable Energy' },
    { value: 'sustainable-agriculture', label: t('employerProfile.sustainableAgriculture') || 'Sustainable Agriculture' },
    { value: 'green-construction', label: t('employerProfile.greenConstruction') || 'Green Construction' },
    { value: 'waste-management', label: t('employerProfile.wasteManagement') || 'Waste Management' },
    { value: 'water-conservation', label: t('employerProfile.waterConservation') || 'Water Conservation' },
    { value: 'environmental-consulting', label: t('employerProfile.environmentalConsulting') || 'Environmental Consulting' },
    { value: 'clean-technology', label: t('employerProfile.cleanTechnology') || 'Clean Technology' },
    { value: 'sustainable-transportation', label: t('employerProfile.sustainableTransportation') || 'Sustainable Transportation' },
    { value: 'other', label: t('employerProfile.other') || 'Other' },
  ];

  // Loading state component
  const LoadingState = () => (
    <div className="flex-1 flex items-center justify-center bg-gray-50 py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{t('common.loading') || 'Loading...'}</p>
      </div>
    </div>
  );

  // Render loading state
  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('employerProfile.title') || 'Employer Profile'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {t('employerProfile.subtitle') || 'Manage your company information and settings'}
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-start ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <svg 
              className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              {message.type === 'success' ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              )}
            </svg>
            <div className="flex-1">
              <p className="font-medium">{message.text}</p>
            </div>
            <button
              onClick={() => setMessage({ type: '', text: '' })}
              className={`ml-3 flex-shrink-0 ${
                message.type === 'success' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('employerProfile.companyInfo') || 'Company Information'}
            </h2>

            <div className="space-y-4">
              {/* Company Name */}
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('employerProfile.companyName') || 'Company Name'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={profile.company_name}
                  onChange={handleChange}
                  required
                  placeholder={t('employerProfile.companyNamePlaceholder') || 'Enter your company name'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Company Description */}
              <div>
                <label htmlFor="company_description" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('employerProfile.companyDescription') || 'Company Description'}
                </label>
                <textarea
                  id="company_description"
                  name="company_description"
                  value={profile.company_description}
                  onChange={handleChange}
                  rows={4}
                  placeholder={t('employerProfile.companyDescriptionPlaceholder') || 'Tell us about your company, mission, and green initiatives...'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Industry and Company Size - Side by side on larger screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Industry */}
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('employerProfile.industry') || 'Industry'}
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={profile.industry}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {industryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Company Size */}
                <div>
                  <label htmlFor="company_size" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('employerProfile.companySize') || 'Company Size'}
                  </label>
                  <select
                    id="company_size"
                    name="company_size"
                    value={profile.company_size}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {companySizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('employerProfile.location') || 'Location'}
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  placeholder={t('employerProfile.locationPlaceholder') || 'City, State, Country'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Company Website */}
              <div>
                <label htmlFor="company_website" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('employerProfile.companyWebsite') || 'Company Website'}
                </label>
                <input
                  type="url"
                  id="company_website"
                  name="company_website"
                  value={profile.company_website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t('employerProfile.websiteHint') || 'Include https:// or http://'}
                </p>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('employerProfile.verificationStatus') || 'Verification Status'}
            </h2>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isVerified ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                <svg 
                  className={`w-6 h-6 ${isVerified ? 'text-green-600' : 'text-yellow-600'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  {isVerified ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
              </div>
              <div>
                <p className="text-base font-medium text-gray-900">
                  {isVerified 
                    ? (t('employerProfile.verified') || 'Verified Green Company')
                    : (t('employerProfile.pendingVerification') || 'Verification Pending')
                  }
                </p>
                <p className="text-sm text-gray-600">
                  {isVerified
                    ? (t('employerProfile.verifiedDescription') || 'Your company is verified as a green employer')
                    : (t('employerProfile.pendingDescription') || 'Your verification is under review')
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/employer-dashboard')}
              className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common.saving') || 'Saving...'}
                </>
              ) : (
                t('common.save') || 'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployerProfile;