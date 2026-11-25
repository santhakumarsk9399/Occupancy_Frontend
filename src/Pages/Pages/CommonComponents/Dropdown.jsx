import React from 'react';
import Select from 'react-select';
import "../../Components/Styles/Dropdown.css"

const CommonMultiSelectDropdown = ({
  label,
  name,
  required = false,
  options = [],
  value = [],
  onChange,
  placeholder = 'Select',
}) => {
  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <Select
        isMulti
        name={name}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="custom-react-select"
        classNamePrefix="react-select"
      />
    </div>
  );
};

export default CommonMultiSelectDropdown;
