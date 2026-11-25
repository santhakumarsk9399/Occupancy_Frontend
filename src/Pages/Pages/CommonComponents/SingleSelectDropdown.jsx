import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "../../Components/Styles/Multiselectdropdown.css"; // custom styles

const SingleSelectDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  isInvalid,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle item selection
  const handleSelect = (option) => {
    onChange(option); // Pass selected option to parent
    setIsOpen(false); // Close the dropdown after selection
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // return (
  //   <div
  //     className={`custom-dropdown ${isInvalid ? "invalid" : ""}`}
  //     ref={dropdownRef}
  //   >
  //     {/* Dropdown header */}
  //     <div className="dropdown-header" onClick={() => setIsOpen(!isOpen)}>
  //       {value ? value.label : placeholder || "Select..."}
  //       <span className={`arrow ${isOpen ? "up" : ""}`}></span>
  //     </div>

  //     {/* Dropdown list */}
  //     {isOpen && (
  //       <div className="dropdown-list">
  //         {options.map((option) => (
  //           <div
  //             key={option.value}
  //             className={`dropdown-item ${
  //               value && value.value === option.value ? "selected" : ""
  //             }`}
  //             onClick={() => handleSelect(option)}
  //           >
  //             {option.label}
  //           </div>
  //         ))}
  //       </div>
  //     )}
  //   </div>
  // );
return (
  <div
    className={`custom-dropdown ${isInvalid ? "invalid" : ""} ${options.length <= 1 ? "disabled" : ""}`}
    ref={dropdownRef}
  >
    {/* Dropdown header */}
    <div
      className="dropdown-header"
      onClick={() => {
        if (options.length > 1) setIsOpen(!isOpen);
      }}
    >
      {value ? value.label : placeholder || "Select..."}
      {options.length > 1 && <span className={`arrow ${isOpen ? "up" : ""}`}></span>}
    </div>

    {/* Dropdown list */}
    {isOpen && options.length > 1 && (
      <div className="dropdown-list">
        {options.map((option) => (
          <div
            key={option.value}
            className={`dropdown-item ${
              value && value.value === option.value ? "selected" : ""
            }`}
            onClick={() => handleSelect(option)}
          >
            {option.label}
          </div>
        ))}
      </div>
    )}
  </div>
);
};

SingleSelectDropdown.propTypes = {
  options: PropTypes.array.isRequired,
  value: PropTypes.object, // The selected value
  onChange: PropTypes.func.isRequired, // Function to handle the selection
  placeholder: PropTypes.string, // Placeholder text when no option is selected
  isInvalid: PropTypes.bool, // Flag for invalid state
};

export default SingleSelectDropdown;
