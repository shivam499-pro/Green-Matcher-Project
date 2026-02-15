/**
 * SearchBar Component
 * Reusable search bar with filters
 */
import React, { useState } from 'react';
import Button from './Button';

const SearchBar = ({ onSearch, placeholder = 'Search...', filters = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});

  const handleSearch = () => {
    onSearch({ searchTerm, filters: selectedFilters });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (filterName, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {filters.map((filter) => (
            <div key={filter.name} className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {filter.label}
              </label>
              {filter.type === 'select' ? (
                <select
                  value={selectedFilters[filter.name] || ''}
                  onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">All</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={filter.type || 'text'}
                  value={selectedFilters[filter.name] || ''}
                  onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
