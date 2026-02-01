import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

/**
 * Navigation Component
 * Provides navigation based on user authentication status and role
 */
const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  // Navigation items based on user role
  const publicNavItems = [
    { path: '/', label: 'Home' },
    { path: '/jobs', label: 'Browse Jobs' },
    { path: '/careers', label: 'Explore Careers' },
  ];

  const jobSeekerNavItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/jobs', label: 'Browse Jobs' },
    { path: '/careers', label: 'Explore Careers' },
    { path: '/recommendations', label: 'Recommendations' },
    { path: '/profile', label: 'Profile' },
  ];

  const employerNavItems = [
    { path: '/employer-dashboard', label: 'Dashboard' },
    { path: '/jobs', label: 'My Jobs' },
    { path: '/employer-profile', label: 'Company Profile' },
  ];

  const adminNavItems = [
    { path: '/admin-dashboard', label: 'Dashboard' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/jobs', label: 'Jobs' },
    { path: '/careers', label: 'Careers' },
  ];

  // Get navigation items based on user role
  const getNavItems = () => {
    if (!user) return publicNavItems;
    if (user.role === 'USER') return jobSeekerNavItems;
    if (user.role === 'EMPLOYER') return employerNavItems;
    if (user.role === 'ADMIN') return adminNavItems;
    return publicNavItems;
  };

  const navItems = getNavItems();

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsMenuOpen(false);
    navigate('/');
  };

  // Check if link is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-emerald-600">Green Matchers</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'border-emerald-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side - Auth */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Signed in as {user.full_name}
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-600 hover:text-emerald-700 hover:bg-gray-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-600 hover:text-emerald-700 hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                  isActive(item.path)
                    ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-4 border-t border-gray-200">
            {user ? (
              <div className="space-y-1">
                <div className="px-4 py-2 text-sm text-gray-700">
                  Signed in as {user.full_name}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-base font-medium text-emerald-600 hover:text-emerald-700 hover:bg-gray-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-base font-medium text-emerald-600 hover:text-emerald-700 hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-base font-medium text-emerald-600 hover:text-emerald-700 hover:bg-gray-50"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
