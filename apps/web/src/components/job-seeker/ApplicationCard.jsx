/**
 * ApplicationCard Component
 * Displays application card for job seekers
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationsAPI } from '../../utils/api';
import Card from '../common/Card';
import Button from '../common/Button';

const ApplicationCard = ({ application, onWithdraw }) => {
  const navigate = useNavigate();
  const [withdrawing, setWithdrawing] = useState(false);

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      REVIEWING: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Under Review' },
      SHORTLISTED: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Shortlisted' },
      INTERVIEWED: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Interviewed' },
      ACCEPTED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Accepted' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    };
    return badges[status] || badges.PENDING;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const statusInfo = getStatusBadge(application.status);
  const job = application.job;

  return (
    <Card hover className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 
            className="text-xl font-semibold text-gray-900 mb-1 hover:text-emerald-600 cursor-pointer transition-colors"
            onClick={() => navigate(`/jobs/${job.id}`)}
          >
            {job.title}
          </h3>
          {job.employer && (
            <p className="text-gray-600">{job.employer.company_name || job.employer.full_name}</p>
          )}
        </div>
        <span className={`px-3 py-1 ${statusInfo.bg} ${statusInfo.text} rounded-full text-xs font-medium`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {job.location}
        </span>
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Applied on {formatDate(application.created_at)}
        </span>
      </div>

      {application.cover_letter && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-2">{application.cover_letter}</p>
        </div>
      )}

      {application.match_score && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Match Score</span>
            <span className="font-medium text-emerald-600">{Math.round(application.match_score * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-emerald-600 h-2 rounded-full transition-all"
              style={{ width: `${application.match_score * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <Button size="sm" variant="outline" onClick={() => navigate(`/jobs/${job.id}`)}>
          View Job
        </Button>
        {application.status === 'PENDING' && (
          <Button size="sm" variant="ghost">
            Withdraw Application
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ApplicationCard;
