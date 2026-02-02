import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { careersAPI } from '../utils/api';
import { t } from '../utils/translations';

const Careers = () => {
  
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [careers, setCareers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSDG, setSelectedSDG] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCareers();
  }, []);

  // Fetch careers from API
  const fetchCareers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await careersAPI.listCareers();
      setCareers(response?.data?.items || response?.data || []);
    } catch (err) {
      console.error('Error fetching careers:', err);
      setError(t('careers.fetchError') || 'Failed to load careers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim() && !selectedSDG) {
      fetchCareers();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery;
      if (selectedSDG) params.sdg_tag = selectedSDG;
      
      const response = await careersAPI.listCareers(params);
      setCareers(response?.data?.items || response?.data || []);
    } catch (err) {
      console.error('Error searching careers:', err);
      setError(t('careers.searchError') || 'Failed to search careers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSDG('');
    fetchCareers();
  };

  // Get SDG color based on SDG number
  const getSDGColor = (sdg) => {
    const colors = {
      'SDG 7': 'bg-yellow-500',
      'SDG 11': 'bg-orange-500',
      'SDG 12': 'bg-red-500',
      'SDG 13': 'bg-green-500',
      'SDG 14': 'bg-blue-500',
      'SDG 15': 'bg-green-600',
    };
    return colors[sdg] || 'bg-gray-500';
  };

  const sdgOptions = [
    { value: '', label: t('careers.allSDGs') || 'All SDGs' },
    { value: 'SDG 7', label: 'SDG 7 - Affordable & Clean Energy' },
    { value: 'SDG 11', label: 'SDG 11 - Sustainable Cities' },
    { value: 'SDG 12', label: 'SDG 12 - Responsible Consumption' },
    { value: 'SDG 13', label: 'SDG 13 - Climate Action' },
    { value: 'SDG 14', label: 'SDG 14 - Life Below Water' },
    { value: 'SDG 15', label: 'SDG 15 - Life on Land' },
  ];

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {t('No Careers Found')}
      </h3>
      <p className="text-gray-600 mb-4">
        {searchQuery || selectedSDG
          ? t('Try adjusting your filters or search criteria')
          : t('No careers available at the moment')}
      </p>
      {(selectedSDG) && (
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
        >
          {t('Clear Filters')}
        </button>
      )}
    </div>
  );

  // Career card component
  const CareerCard = ({ career }) => (
    <div
      className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/careers/${career.id}`)}
    >
      <div className="p-6">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition">
          {career.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
          {career.description}
        </p>

        {/* Salary Range */}
        {career.avg_salary_min && career.avg_salary_max && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <svg className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>₹{career.avg_salary_min.toLocaleString()} - ₹{career.avg_salary_max.toLocaleString()}/year</span>
          </div>
        )}

        {/* SDG Tags */}
        {career.sdg_tags && career.sdg_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {career.sdg_tags.map((sdg) => (
              <span
                key={sdg}
                className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getSDGColor(sdg)}`}
              >
                {sdg}
              </span>
            ))}
          </div>
        )}

        {/* Required Skills */}
        {career.required_skills && career.required_skills.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2">
              {t('Required Skills')}
            </h4>
            <div className="flex flex-wrap gap-1">
              {career.required_skills.slice(0, 4).map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                >
                  {skill}
                </span>
              ))}
              {career.required_skills.length > 4 && (
                <span className="px-2 py-1 text-xs text-gray-500">
                  +{career.required_skills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Demand Score */}
        {career.demand_score !== undefined && career.demand_score !== null && (
          <div className="flex items-center text-sm">
            <span className="text-xs text-gray-600 mr-2 flex-shrink-0">
              {t('Career Demand')}:
            </span>
            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(career.demand_score * 100, 100)}%` }}
              />
            </div>
            <span className="font-medium text-gray-900 text-xs">
              {Math.round(career.demand_score * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium group-hover:bg-emerald-700">
          {t('View Details')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('Green Careers')}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {t('Explore sustainable career paths in the green economy')}
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Input */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('careers.searchPlaceholder') || 'Search careers by title, skills, or keywords...'}
                  className="w-full px-4 py-2.5 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* SDG Filter */}
              <div className="w-full sm:w-64">
                <select
                  value={selectedSDG}
                  onChange={(e) => setSelectedSDG(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {sdgOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
              >
                {t('Search')}
              </button>
              {(searchQuery || selectedSDG) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  {t('Clear Filters')}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start">
            <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-3 flex-shrink-0 text-red-600 hover:text-red-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingSpinner />}

        {/* Empty State */}
        {!loading && careers.length === 0 && !error && <EmptyState />}

        {/* Careers Grid */}
        {!loading && careers.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {careers.map((career) => (
                <CareerCard key={career.id} career={career} />
              ))}
            </div>

            {/* Results Count */}
            <div className="text-center text-sm text-gray-600">
              {t('careers.showingResults', { count: careers.length }) || 
                `Showing ${careers.length} career${careers.length !== 1 ? 's' : ''}`}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Careers;