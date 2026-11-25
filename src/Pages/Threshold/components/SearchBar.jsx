import React from 'react';
import './SearchBar.css';

const SearchBar = ({ value, onChange }) => (
  <div className="search-bar-container">
    <input
      type="search"
      className="search-bar-input"
      placeholder="Search"
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label="Search thresholds"
      autoComplete="off"
      spellCheck={false}
    />
    <svg
      className="search-bar-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

export default SearchBar;
