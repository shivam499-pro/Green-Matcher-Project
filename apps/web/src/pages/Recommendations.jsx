import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { recommendationsAPI } from '../utils/api';

const Recommendations = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await recommendationsAPI.getCareerRecommendations();
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError(t('recommendations.fetchError') || 'Failed to load recommendations');
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

  const getSimilarityColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('recommendations.title') || 'Career Recommendations'}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('recommendations.subtitle') || 'AI-powered career paths matched to your skills'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {/* No Recommendations */}
        {recommendations.length === 0 && !error && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('recommendations.noRecommendations') || 'No recommendations yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('recommendations.noRecommendationsHint') || 'Add your skills to get personalized career recommendations'}
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
            >
              {t('recommendations.updateProfile') || 'Update Your Profile'}
            </button>
          </div>
        )}

        {/* Recommendations List */}
        {recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <div
                key={rec.career.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {/* Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{rec.career.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSimilarityColor(rec.similarity_score)}`}>
                      {Math.round(rec.similarity_score * 100)}% match
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {rec.career.description}
                  </p>

                  {/* Salary Range */}
                  {rec.career.avg_salary_min && rec.career.avg_salary_max && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ₹{rec.career.avg_salary_min.toLocaleString()} - ₹{rec.career.avg_salary_max.toLocaleString()}/year
                    </div>
                  )}

                  {/* SDG Tags */}
                  {rec.career.sdg_tags && rec.career.sdg_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {rec.career.sdg_tags.map((sdg) => (
                        <span
                          key={sdg}
                          className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getSDGColor(sdg)}`}
                        >
                          {sdg}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Skills */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      {t('recommendations.requiredSkills') || 'Required Skills'}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {rec.career.required_skills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className={`px-2 py-1 text-xs rounded ${
                            rec.matched_skills.includes(skill)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                      {rec.career.required_skills.length > 5 && (
                        <span className="px-2 py-1 text-xs text-gray-500">
                          +{rec.career.required_skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  {rec.missing_skills && rec.missing_skills.length > 0 && (
                    <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                      <h4 className="text-sm font-medium text-orange-800 mb-2">
                        {t('recommendations.skillsToLearn') || 'Skills to Learn'}
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {rec.missing_skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {rec.missing_skills.length > 3 && (
                          <span className="px-2 py-1 text-xs text-orange-600">
                            +{rec.missing_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Demand Score */}
                  {rec.career.demand_score && (
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600 mr-2">
                        {t('recommendations.demandScore') || 'Demand Score'}:
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${rec.career.demand_score * 100}%` }}
                        />
                      </div>
                      <span className="font-medium text-gray-900">
                        {Math.round(rec.career.demand_score * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/careers/${rec.career.id}`)}
                    className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium"
                  >
                    {t('recommendations.viewDetails') || 'View Details'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Careers Link */}
        {recommendations.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/careers')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {t('recommendations.viewAllCareers') || 'View All Careers →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
