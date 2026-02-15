import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { userAPI } from '../utils/api';

const Profile = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useI18n();
  const { user, updateProfile, updateSkills, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    bio: '',
    location: '',
    skills: [],
    resume_url: '',
    language: 'en',
  });

  // Initialize profile from user data in AuthContext
  useEffect(() => {
    if (user) {
      setProfile({
        full_name: user.full_name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        skills: user.skills || [],
        resume_url: user.resume_url || '',
        language: user.language || language || 'en',
      });
    }
  }, [user, language]);

  // Available skills for selection
  const availableSkills = [
    // Technical Skills
    'Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Data Analysis',
    'Machine Learning', 'Cloud Computing', 'DevOps', 'Docker', 'Kubernetes',
    'AWS', 'Azure', 'GCP', 'Linux', 'Git', 'REST APIs', 'GraphQL',

    // Green Skills
    'Solar Energy', 'Wind Energy', 'Hydro Power', 'Biomass', 'Geothermal',
    'Energy Efficiency', 'Carbon Footprint Analysis', 'ESG Reporting',
    'Sustainable Design', 'Green Building', 'LEED Certification',
    'Waste Management', 'Recycling', 'Water Conservation',
    'Environmental Impact Assessment', 'Climate Change Mitigation',
    'Renewable Energy Systems', 'Electric Vehicles', 'Battery Technology',
    'Smart Grid', 'Energy Storage', 'Carbon Trading', 'Sustainability Consulting',

    // Soft Skills
    'Communication', 'Leadership', 'Problem Solving', 'Teamwork',
    'Project Management', 'Critical Thinking', 'Adaptability',
    'Time Management', 'Creativity', 'Analytical Skills',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillToggle = (skill) => {
    setProfile(prev => {
      const newSkills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills: newSkills };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Update profile using AuthContext
      await updateProfile({
        full_name: profile.full_name,
        language: profile.language,
      });

      // Update skills separately
      if (profile.skills.length > 0) {
        await updateSkills(profile.skills);
      }

      // Sync language with I18nContext if changed
      if (profile.language !== language) {
        setLanguage(profile.language);
      }

      setMessage({ type: 'success', text: t('profile.updateSuccess', 'Profile updated successfully!') });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: t('profile.updateFailed', 'Failed to update profile') });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await userAPI.uploadResume(formData);
      setProfile(prev => ({ ...prev, resume_url: response.data.resume_url }));
      setMessage({ type: 'success', text: t('profile.resumeUploadSuccess', 'Resume uploaded successfully!') });
    } catch (error) {
      console.error('Error uploading resume:', error);
      setMessage({ type: 'error', text: t('profile.resumeUploadFailed', 'Failed to upload resume') });
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('profile.title', 'My Profile')}</h1>
          <p className="mt-2 text-gray-600">{t('profile.subtitle', 'Manage your profile and skills')}</p>
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
          {/* Basic Information */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('profile.basicInfo', 'Basic Information')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.fullName', 'Full Name')}
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.email', 'Email Address')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.location', 'Location')}
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  placeholder={t('profile.locationPlaceholder', 'e.g., Mumbai, India')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Language */}
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('profile.preferredLanguage', 'Preferred Language')}
                </label>
                <select
                  id="language"
                  name="language"
                  value={profile.language}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                </select>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.aboutMe', 'About Me')}
              </label>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                rows={4}
                placeholder={t('profile.bioPlaceholder', 'Tell us about yourself...')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('profile.skills', 'Skills')}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {t('profile.skillsDescription', 'Select your skills from the list below')}
            </p>

            {/* Selected Skills */}
            {profile.skills.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {t('profile.selectedSkills', 'Selected Skills')} ({profile.skills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleSkillToggle(skill)}
                        className="ml-2 text-emerald-600 hover:text-emerald-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Available Skills */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {t('profile.availableSkills', 'Available Skills')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {availableSkills.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      profile.skills.includes(skill)
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-500'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resume */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('profile.resume', 'Resume')}
            </h2>

            {profile.resume_url ? (
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-800">{t('profile.resumeUploaded', 'Resume uploaded')}</p>
                    <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline">
                      {t('profile.viewResume', 'View resume')}
                    </a>
                  </div>
                </div>
                <label className="cursor-pointer px-4 py-2 bg-white text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors">
                  {t('profile.updateResume', 'Update Resume')}
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-600 mb-4">{t('profile.uploadResume', 'Upload your resume')}</p>
                <label className="cursor-pointer px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                  {t('profile.chooseFile', 'Choose File')}
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                </label>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? t('common.saving', 'Saving...') : t('profile.saveProfile', 'Save Profile')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
