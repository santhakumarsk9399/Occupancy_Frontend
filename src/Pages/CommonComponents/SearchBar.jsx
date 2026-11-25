import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import '../../Components/Styles/SearchBar.css'; // optional if using custom CSS

const SearchBar = ({ placeholder = "Search", onSearch }) => {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder={placeholder}
        className="search-input"
        onChange={(e) => onSearch(e.target.value)}
      />
      <FontAwesomeIcon icon={faSearch} className="search-icon" />

    </div>
  );
};

export default SearchBar;
