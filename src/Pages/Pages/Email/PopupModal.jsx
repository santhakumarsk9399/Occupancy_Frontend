// src/components/PopupModal.jsx
import React, { useState, useEffect } from "react";
import "./PopupModal.css"; // Reuse same styles + overrides

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PopupModal = ({ show, onClose, onSubmit, value, onChange, submitting }) => {
  const [touched, setTouched] = useState(false);
  useEffect(() => { if (!show) { setTouched(false); } }, [show]);
  if (!show) return null;
  const trimmed = (value || '').trim();
  const invalid = trimmed.length > 0 && !emailRegex.test(trimmed);
  const showError = touched && (invalid || trimmed.length === 0);
  const errorMsg = trimmed.length === 0 ? 'Email is required' : (invalid ? 'Invalid email format' : '');
  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <div className="popup-header">
          <h3>DELBI 2.0</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="popup-body">
          <label htmlFor="popup-email">Enter Email ID <span style={{color:'#D92D20'}}>*</span></label>
          <input
            id="popup-email"
            type="email"
            placeholder="Enter Email ID"
            value={value}
            onChange={(e) => { onChange?.(e.target.value.replace(/\s+/g,'') ); if (!touched) setTouched(true); }}
            onBlur={() => setTouched(true)}
            disabled={submitting}
            className={`${showError ? 'input-error' : ''}`}
            autoComplete="off"
          />
          {showError && <div className="field-error" role="alert">{errorMsg}</div>}
          <p className="hint">Enter the Email ID to receive the acknowledgement email.</p>
        </div>
        { /* Reuse form button styles: cancel-btn & save-btn */ }
        <div className="popup-footer">
          <button onClick={onClose} type="button" className="cancel-btn" disabled={submitting}>Cancel</button>
          <button
            type="button"
            className="save-btn"
            disabled={submitting || showError || trimmed.length === 0}
            onClick={() => { if (!showError && trimmed.length) onSubmit(); else setTouched(true); }}
          >
            {submitting ? 'Sending...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
