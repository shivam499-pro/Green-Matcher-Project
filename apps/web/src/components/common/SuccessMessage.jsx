/**
 * SuccessMessage Component
 * Displays success messages in a consistent format
 */
import React from 'react';

const SuccessMessage = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm">{message}</p>
        </div>
        {onDismiss && (
          <div className="ml-3">
            <button
              onClick={onDismiss}
              className="text-sm font-medium text-green-700 hover:text-green-600 focus:outline-none"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessMessage;
