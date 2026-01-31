import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { usersAPI } from '../utils/api';

const EmployerProfile = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profile, setProfile] = useState({
    company_name: '',
    company_description: '',
    company_website: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await usersAPI.getCurrentUser();
      setProfile({
        company_name: response.data.company_name || '',
        company_description: response.data.company_description || '',
        company_website: response.data.company_website || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: t('employerProfile.fetchError') || 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await usersAPI.updateProfile({
        company_name: profile.company_name,
        company_description: profile.company_description,
        company_website: profile.company_website,
      });
      setMessage({ type: 'success', text: t('employerProfile.saveSuccess') || 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: t('employerProfile.saveError') || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('employerProfile.title') || 'Employer Profile'}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('employerProfile.subtitle') || 'Manage your company information'}
          </p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('employerProfile.companyInfo') || 'Company Information'}
            </h2>

            <div className="space-y-4">
              {/* Company Name */}
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('employerProfile.companyName') || 'Company Name'}
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={profile.company_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Company Description */}
              <div>
                <label htmlFor="company_description" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('employerProfile.companyDescription') || 'Company Description'}
                </label>
                <textarea
                  id="company_description"
                  name="company_description"
                  value={profile.company_description}
                  onChange={handleChange}
                  rows={4}
                  placeholder={t('employerProfile.companyDescriptionPlaceholder') || 'Tell us about your company and its mission...'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Company Website */}
              <div>
                <label htmlFor="company_website" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('employerProfile.companyWebsite') || 'Company Website'}
                </label>
                <input
                  type="url"
                  id="company_website"
                  name="company_website"
                  value={profile.company_website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('employerProfile.verificationStatus') || 'Verification Status'}
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {t('employerProfile.verified') || 'Verified Green Company'}
                </p>
                <p className="text-sm text-gray-600">
                  {t('employerProfile.verifiedDescription') || 'Your company is verified as a green employer'}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/employer-dashboard')}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (t('common.saving') || 'Saving...') : (t('common.save') || 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployerProfile;
