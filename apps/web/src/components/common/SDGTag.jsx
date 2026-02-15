/**
 * Green Matchers - SDG Tag Component
 * Displays SDG goal tags
 */
import React from 'react';
import { SDG_GOALS } from '@/config/constants';

/**
 * SDGTag component
 * @param {Object} props - Component props
 * @returns {JSX.Element}
 */
const SDGTag = ({ sdgId, size = 'md', showLabel = true, className = '' }) => {
  const sdg = SDG_GOALS.find((g) => g.id === sdgId);
  
  if (!sdg) return null;

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizes[size]} ${className}`}
      style={{
        backgroundColor: `${sdg.color}20`,
        color: sdg.color,
        border: `1px solid ${sdg.color}40`,
      }}
    >
      {showLabel && <span className="mr-1">{sdg.icon}</span>}
      SDG {sdg.id}
    </span>
  );
};

export default SDGTag;
