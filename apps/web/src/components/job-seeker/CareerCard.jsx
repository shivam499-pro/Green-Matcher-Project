/**
 * CareerCard Component
 * Displays career path card for job seekers
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';

const CareerCard = ({ career, matchScore }) => {
  const navigate = useNavigate();

  const getMatchScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <Card hover className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{career.title}</h3>
          {career.industry && (
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Industry:</span> {career.industry}
            </p>
          )}
        </div>
        {matchScore !== undefined && matchScore !== null && (
          <div className="text-center">
            <div className={`text-2xl font-bold ${getMatchScoreColor(matchScore)}`}>
              {Math.round(matchScore * 100)}%
            </div>
            <div className="text-xs text-gray-500">Match</div>
          </div>
        )}
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3">{career.description}</p>

      {/* Skills Required */}
      {career.skills_required && career.skills_required.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Key Skills:</p>
          <div className="flex flex-wrap gap-2">
            {career.skills_required.slice(0, 5).map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs">
                {skill}
              </span>
            ))}
            {career.skills_required.length > 5 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                +{career.skills_required.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Salary Range and Growth */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        {career.avg_salary && (
          <div>
            <p className="text-gray-600">Avg. Salary</p>
            <p className="font-semibold text-emerald-600">
              ₹{(career.avg_salary / 100000).toFixed(1)}L/year
            </p>
          </div>
        )}
        {career.growth_potential && (
          <div>
            <p className="text-gray-600">Growth Potential</p>
            <p className="font-semibold text-gray-900">{career.growth_potential}</p>
          </div>
        )}
      </div>

      {/* SDG Tags */}
      {career.sdg_tags && career.sdg_tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {career.sdg_tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <Button size="sm" fullWidth>
          Explore Career
        </Button>
      </div>
    </Card>
  );
};

export default CareerCard;
