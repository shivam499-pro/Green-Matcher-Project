import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { careersAPI } from '../utils/api';

const Careers = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [careers, setCareers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      const response = await careersAPI.listCareers();
      setCareers(response.data.items || response.data || []);
    } catch (error) {
      console.error('Error fetching careers:', error);
      setError(t('careers.fetchError') || 'Failed to load careers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchCareers();
      return;
    }

    setLoading(true);
    try {
      const response = await careersAPI.listCareers({ query: searchQuery });
      setCareers(response.data.items || response.data || []);
    } catch (error) {
      console.error('Error searching careers:', error);
      setError(t('careers.searchError') || 'Failed to search careers');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('careers.title') || 'Green Careers'}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('careers.subtitle') || 'Explore sustainable career paths in the green economy'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('careers.searchPlaceholder') || 'Search careers by title, skills, or keywords...'}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium"
            >
              {t('careers.search') || 'Search'}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* No Results */}
        {!loading && careers.length === 0 && !error && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('careers.noCareers') || 'No careers found'}
            </h3>
            <p className="text-gray-600">
              {t('careers.noCareersHint') || 'Try adjusting your search or check back later'}
            </p>
          </div>
        )}

        {/* Careers List */}
        {!loading && careers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careers.map((career) => (
              <div
                key={career.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
                onClick={() => navigate(`/careers/${career.id}`)}
              >
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{career.title}</h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {career.description}
                  </p>

                  {/* Salary Range */}
                  {career.avg_salary_min && career.avg_salary_max && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ₹{career.avg_salary_min.toLocaleString()} - ₹{career.avg_salary_max.toLocaleString()}/year
                    </div>
                  )}

                  {/* SDG Tags */}
                  {career.sdg_tags && career.sdg_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
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
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        {t('careers.requiredSkills') || 'Required Skills'}
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {career.required_skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
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
                  {career.demand_score && (
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600 mr-2">
                        {t('careers.demandScore') || 'Demand Score'}:
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${career.demand_score * 100}%` }}
                        />
                      </div>
                      <span className="font-medium text-gray-900">
                        {Math.round(career.demand_score * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <button className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium">
                    {t('careers.viewDetails') || 'View Details'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && careers.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            {t('careers.showingResults', { count: careers.length }) || `Showing ${careers.length} careers`}
          </div>
        )}
      </div>
    </div>
  );
};

export default Careers;
