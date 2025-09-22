import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g., 'ergonomic office chair' or 'sneakers'"
        disabled={isLoading}
        className="w-full pl-6 pr-36 py-4 text-lg bg-base-200 border-2 border-base-300 rounded-full focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all duration-300 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isLoading || !query.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 bg-brand-primary text-black font-semibold rounded-full hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-200 focus:ring-brand-primary transition-all duration-300 disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin -ml-1 mr-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </div>
        ) : 'Analyze'}
      </button>
    </form>
  );
};