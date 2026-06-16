import React from 'react';
import PropTypes from 'prop-types';
import { toast } from "react-toastify";

const DateFilter = ({ value, onChange, onClear, onApply, disableClear, historical }) => {
  const handleApply = () => {
    if (!value) {
      // alert("Select date");
      toast.error("Please select custom date");
      return;
    }
    onApply();
  };
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000)  // subtract 24 hours
  .toISOString()
  .split('T')[0];
  return (
    <div className="date-filter">
      <label>Date</label>
      <input
        type="date"
        value={value}
        onChange={onChange}
        className="date-input"
        max={historical ? yesterday : today}
      />
      <button className="apply-btn" onClick={handleApply}>Apply</button>
      <button
        className="clear-btn"
        onClick={onClear}
        disabled={disableClear}
      >
        Clear
      </button>
    
    </div>
  );
};

DateFilter.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  disableClear: PropTypes.bool.isRequired,
};

export default DateFilter;