
import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../Components/Styles/CascadeMultiSelect.css";

const MultiSelectDropdown = ({
  options = [],
  value = [],
  onChange,
  labelKey = "label",
  valueKey = "value",
  placeholder = "",
  isInvalid = false,
  error = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // --- derived/filtered data ---
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const q = searchTerm.toLowerCase();
    return options.filter((o) => String(o[labelKey]).toLowerCase().includes(q));
  }, [options, searchTerm, labelKey]);

  const isAllVisibleSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((opt) =>
      value.some((v) => v[valueKey] === opt[valueKey])
    );

  // --- outside click closes ---
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // --- handlers ---
  const toggleOption = (option) => {
    const exists = value.some((v) => v[valueKey] === option[valueKey]);
    const next = exists
      ? value.filter((v) => v[valueKey] !== option[valueKey])
      : [...value, option];
    onChange(next);
  };

  // Select all *visible* items
  const handleSelectAllVisible = () => {
    const missing = filteredOptions.filter(
      (o) => !value.some((v) => v[valueKey] === o[valueKey])
    );
    if (missing.length === 0) return;
    onChange([...value, ...missing]);
  };

  // Clear selected items (clears ALL selections)
  const handleClearSelected = () => {
    if (value.length === 0) return;
    onChange([]);
  };

 
  const headerText =
    isAllVisibleSelected
      ? "All Selected"
      : value.length > 0
      ? `${value.length} Selected`
      : placeholder;
// console.log(headerText ,"headertext")
  return (
    <div
      className={`msd ${isInvalid ? "msd--invalid" : ""}`}
      ref={dropdownRef}
    >
      {/* Header */}
      <button
        type="button"
        className="msd__header"
        onClick={() => setIsOpen((p) => !p)}
        aria-expanded={isOpen}
      >
        <span className={`msd__placeholder ${value.length ? "has" : ""}`}>
          {headerText}
        </span>
        <span className={`msd__arrow ${isOpen ? "up" : ""}`} />
      </button>

      {/* Menu */}
      {isOpen && (
        <div className="msd__menu" role="listbox">
            <div className="msd__searchrow">
              <input
                type="text"
                className="msd__search"
                placeholder="Type to filter…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          <div className="msd__actionrow">
            {value.length > 0 ? (
              <button
                type="button"
                className="msd__action"
                onClick={handleClearSelected}
              >
                Clear Selected Items
              </button>
            ) : (
              <button
                type="button"
                className="msd__action"
                onClick={handleSelectAllVisible}
                disabled={filteredOptions.length === 0}
              >
                Select All
              </button>
            )}
          </div>

          {/* List */}
          <div className="msd__list">
            {filteredOptions.map((option, idx) => {
              const checked = value.some(
                (v) => v[valueKey] === option[valueKey]
              );
              return (
                <label key={`${option[valueKey]}-${idx}`} className="msd__item">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOption(option)}
                  />
                  <span className="msd__label">{option[labelKey]}</span>
                </label>
              );
            })}
            {filteredOptions.length === 0 && (
              <div className="msd__empty">No results</div>
            )}
          </div>
        </div>
      )}

      {/* Validation */}
      {isInvalid && error && <div className="msd__error">{error}</div>}
    </div>
  );
};

export default MultiSelectDropdown;
