import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { STORAGE_KEYS } from '../config/constants';

/**
 * Register Page
 * User registration with role selection (Job Seeker or Employer)
 */
const Register = () => {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const { register, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    language: language || 'en',
  });
  const [localError, setLocalError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Calculate password strength
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear errors when user types
    if (localError) setLocalError('');
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setLocalError(t('errors.passwordMismatch', 'Passwords do not match'));
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setLocalError(t('errors.passwordTooShort', 'Password must be at least 8 characters'));
      return;
    }

    try {
      // Prepare registration data - backend expects 'full_name' not 'fullName'
      const registrationData = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        language: formData.language,
      };

      await register(registrationData);

      // Registration successful - redirect to login
      navigate('/login', { state: { message: t('auth.registrationSuccess', 'Registration successful! Please log in.') } });
    } catch (err) {
      setLocalError(err.response?.data?.detail || t('errors.somethingWentWrong', 'Something went wrong'));
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('auth.register', 'Register')}
          </h1>
          <p className="text-gray-600 mb-8">
            {t('auth.signup_subtitle', 'Create your account')}
          </p>
        </div>

        {displayError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.full_name', 'Full Name')}
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.email', 'Email Address')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.password', 'Password')}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="••••••••"
            />
            {formData.password && (
              <div className="mt-2">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('auth.passwordStrength', 'Password strength')}: {
                    passwordStrength <= 25 ? t('auth.weak', 'Weak') :
                    passwordStrength <= 50 ? t('auth.fair', 'Fair') :
                    passwordStrength <= 75 ? t('auth.good', 'Good') :
                    t('auth.strong', 'Strong')
                  }
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.confirmPassword', 'Confirm Password')}
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.preferredLanguage', 'Preferred Language')}
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? t('common.loading', 'Loading...') : t('auth.signUp', 'Sign Up')}
          </button>
        </form>

        <div className="text-center mt-6 space-y-4">
          <p className="text-sm text-gray-600">
            {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
            <Link to="/login" className="text-emerald-600 hover:underline font-medium">
              {t('auth.loginHere', 'Login here')}
            </Link>
          </p>
          <p className="text-sm text-gray-500">
            <Link to="/" className="text-gray-600 hover:underline">
              ← {t('common.backToHome', 'Back to Home')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
