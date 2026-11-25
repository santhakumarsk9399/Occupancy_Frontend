import React from "react";
import "./DeleteEmailGroup.css";
import DeleteIcon from "./DeleteIcon.png";

const DeleteSMSGroup = ({ show, group, onClose, onConfirm }) => {
  // Keep the original check for `show`; allow rendering even if `group` isn't passed
  if (!show) return null;

  return (
    <div className="delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-sms-title">
      {/* Header with title and close (X) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 id="delete-sms-title" style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#1f2937" }}>
          Delete SMS Group
        </h2>
        <button className="close-btn" aria-label="Close" onClick={onClose}>
          ×
        </button>
      </div>

      {/* Illustration */}
      <div className="icon" aria-hidden="true">
        <span className="trash-icon">
          <img src={DeleteIcon} alt="Delete" />
        </span>
      </div>

      {/* Prompt text */}
      <h3 style={{ marginTop: 0 }}>Do you want to delete this SMS Group?</h3>

      {/* Buttons */}
      <div className="button-group">
        <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm delete btn-danger"
          onClick={() => onConfirm && onConfirm(group)}
          disabled={!group}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default DeleteSMSGroup;
