import React from "react";
import "./EmailTab.css";

const GroupSavedModal = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div className="modal-overlay success-modal-overlay">
      <div className="success-modal-content">
        <div className="success-icon">
          <div className="checkmark-circle">
            <div className="checkmark"></div>
          </div>
        </div>
        <h2 className="success-title">Group Saved</h2>
        <p className="success-message">Your email group has been saved successfully!</p>
        <div className="success-actions">
          <button className="success-btn" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default GroupSavedModal;
