/**
 * JobCard Component (Job Seeker View)
 * Displays job posting card for job seekers
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';

const JobCard = ({ job, onApply, hasApplied = false }) => {
  const navigate = useNavigate();

  const getEmploymentTypeLabel = (type) => {
    const labels = {
      FULL_TIME: 'Full Time',
      PART_TIME: 'Part Time',
      CONTRACT: 'Contract',
      INTERNSHIP: 'Internship',
    };
    return labels[type] || type;
  };

  const formatSalary = (min, max) => {
    if (!min || !max) return 'Salary not disclosed';
    return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L/year`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <Card hover onClick={() => navigate(`/jobs/${job.id}`)} className="p-6">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-emerald-600 transition-colors">
            {job.title}
          </h3>
          {job.employer && (
            <p className="text-gray-700 font-medium mb-2">{job.employer.company_name || job.employer.full_name}</p>
          )}
        </div>
        {hasApplied && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            Applied
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {job.location}
        </span>
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {getEmploymentTypeLabel(job.employment_type)}
        </span>
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {job.created_at && formatDate(job.created_at)}
        </span>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

      {/* SDG Tags */}
      {job.sdg_tags && job.sdg_tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {job.sdg_tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs">
              {tag}
            </span>
          ))}
          {job.sdg_tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              +{job.sdg_tags.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm font-medium text-emerald-600">
          {formatSalary(job.min_salary, job.max_salary)}
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button 
            size="sm" 
            onClick={() => navigate(`/jobs/${job.id}`)}
            variant="outline"
          >
            View Details
          </Button>
          {!hasApplied && onApply && (
            <Button size="sm" onClick={() => onApply(job)}>
              Apply Now
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default JobCard;
