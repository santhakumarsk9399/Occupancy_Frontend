// src/components/PopupModal.jsx
import React from "react";
import "./PopupModal.css"; // Reuse same styles

const PopupModal = ({ show, onClose, onSubmit }) => {
  if (!show) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <div className="popup-header">
          <h3>DELBI 2.0</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="popup-body">
          <label>Enter Email ID</label>
          <input type="email" placeholder="Enter Email ID" />
          <p>Enter the Email ID to receive the test mail</p>
        </div>
        <div className="popup-footer">
          <button onClick={onClose} className="cancel-btn">Cancel</button>
          <button onClick={onSubmit} className="submit-btn">Submit</button>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
