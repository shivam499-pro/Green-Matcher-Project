/**
 * JobCard Component
 * Displays job posting card for employers
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';

const JobCard = ({ job, onEdit, onDelete, onViewApplicants }) => {
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

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
      DRAFT: 'bg-yellow-100 text-yellow-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card hover className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
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
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(job.status)}`}>
          {job.status}
        </span>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">
          <span className="font-medium text-gray-900">{job.applications_count || 0}</span> applications
        </div>
        <div className="text-sm font-medium text-emerald-600">
          ₹{(job.min_salary / 100000).toFixed(1)}L - ₹{(job.max_salary / 100000).toFixed(1)}L/year
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onViewApplicants(job)}>
          View Applicants
        </Button>
        <Button size="sm" variant="outline" onClick={() => onEdit(job)}>
          Edit
        </Button>
        <Button size="sm" variant="outline" onClick={() => navigate(`/jobs/${job.id}`)}>
          View Details
        </Button>
        {job.status !== 'CLOSED' && (
          <Button size="sm" variant="danger" onClick={() => onDelete(job.id)}>
            Delete
          </Button>
        )}
      </div>
    </Card>
  );
};

export default JobCard;
