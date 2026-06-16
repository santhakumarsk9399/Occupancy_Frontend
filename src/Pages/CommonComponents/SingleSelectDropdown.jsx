import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import "../../Components/Styles/Multiselectdropdown.css"; // custom styles

const SingleSelectDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  isInvalid,
  usePortal = true,
  portalZIndex = 5000,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, width: 0 });

  // Handle item selection
  const handleSelect = (option) => {
    onChange(option); // Pass selected option to parent
    setIsOpen(false); // Close the dropdown after selection
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
  const inTrigger = dropdownRef.current && dropdownRef.current.contains(event.target);
  const inMenu = menuRef.current && menuRef.current.contains(event.target);
  if (!inTrigger && !inMenu) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Recalculate menu position when opened and on window resize/scroll
  useEffect(() => {
    if (!isOpen || !usePortal) return;
    const updatePos = () => {
      const el = headerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setMenuStyle({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    };
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [isOpen, usePortal]);

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
  const list = (
    <div
      className="dropdown-list"
  ref={menuRef}
      style={usePortal ? {
        position: "absolute",
        top: menuStyle.top,
        left: menuStyle.left,
        width: menuStyle.width,
        maxHeight: 220,
        overflowY: "auto",
        zIndex: portalZIndex,
      } : undefined}
    >
      {options.map((option, idx) => (
        <div
          key={option.value + String(idx)}
          className={`dropdown-item ${
            value && value.value === option.value ? "selected" : ""
          } ${idx === 0 && (option.value === "" || option.disabled) ? "placeholder" : ""}`}
          onClick={() => handleSelect(option)}
        >
          {option.label}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`custom-dropdown ${isInvalid ? "invalid" : ""} ${options.length <= 1 ? "disabled" : ""}`}
      ref={dropdownRef}
    >
      {/* Dropdown header */}
      <div
        className="dropdown-header"
        ref={headerRef}
        onClick={() => {
          if (options.length > 1) setIsOpen(!isOpen);
        }}
      >
        {value ? value.label : placeholder || "Select..."}
        {options.length > 1 && <span className={`arrow ${isOpen ? "up" : ""}`}></span>}
      </div>

      {/* Dropdown list */}
      {isOpen && options.length > 1 && (
        usePortal ? createPortal(list, document.body) : list
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
  usePortal: PropTypes.bool,
  portalZIndex: PropTypes.number,
};

export default SingleSelectDropdown;
