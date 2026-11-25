import React, { useEffect, useState } from "react";
import "./EmailTab.css";
import MultiSelectDropdown from "../CommonComponents/MultiSelectDropDown";

const API_BASE = "http://delbi2dev.deloptanalytics.com:3000";

// use shared MultiSelectDropdown

const AddSMSGroupModal = ({ show, onClose, onSubmit }) => {
  const [groupName, setGroupName] = useState("");
  const [contactInput, setContactInput] = useState("");
  const [contactNumbers, setContactNumbers] = useState([]);
  const [contactName, setContactName] = useState("");
  const [threshold, setThreshold] = useState("");
  const [zones, setZones] = useState([]); // array of {label,value}
  const [selectedContactIndex, setSelectedContactIndex] = useState(null);

  const [thresholdOptions, setThresholdOptions] = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState("");

  const phoneRegex = /^[\d\-+()\s]+$/;

  // Always call hooks regardless of show
  useEffect(() => {
    if (!show) return; // Only run fetch logic when open

    const fetchOptions = async () => {
      setOptionsError("");
      setOptionsLoading(true);
      try {
        const tokenVal = sessionStorage.getItem("token");
        const username = sessionStorage.getItem("username") || "TestUser";
        if (!tokenVal) throw new Error("Missing auth token in session");

        const res = await fetch(`${API_BASE}/settings/sms/thresholdZone`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenVal}`,
          },
          body: JSON.stringify({ username }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed with ${res.status}`);
        }

        const data = await res.json();
        const tOpts = Array.isArray(data?.threshold)
          ? data.threshold.map((t) => t?.ThresholdName).filter(Boolean)
          : [];
        const zOpts = Array.isArray(data?.zone)
          ? data.zone.map((z) => z?.ZoneName).filter(Boolean)
          : [];

        setThresholdOptions(tOpts);
        setZoneOptions(zOpts.map((z) => ({ label: z, value: z })));
      } catch (err) {
        console.error("Failed to load threshold/zone options:", err);
        setOptionsError(err?.message || "Failed to load options");
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchOptions();
  }, [show]);

  const handleAddContact = () => {
    const contact = contactInput.trim();
    if (contact && phoneRegex.test(contact) && !contactNumbers.includes(contact)) {
      setContactNumbers([...contactNumbers, contact]);
      setContactInput("");
    }
  };

  const handleRemoveContact = () => {
    if (selectedContactIndex !== null) {
      setContactNumbers(contactNumbers.filter((_, i) => i !== selectedContactIndex));
      setSelectedContactIndex(null);
    }
  };

  const handleContactClick = (index) => {
    setSelectedContactIndex(selectedContactIndex === index ? null : index);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupName || contactNumbers.length === 0 || !threshold || zones.length === 0) {
      alert("Please fill all required fields.");
      return;
    }
    const zoneValues = Array.isArray(zones)
      ? Array.from(new Set(zones.map((z) => (z?.value ?? "").toString().trim()))).filter(Boolean)
      : [];
    const groupData = {
      groupName: groupName.trim(),
      contactNumbers,
      contactName: contactName.trim(),
      threshold,
      zones: zoneValues,
    };
    onSubmit(groupData);
    handleClose();
  };

  const handleClose = () => {
    setGroupName("");
    setContactInput("");
    setContactNumbers([]);
    setContactName("");
    setThreshold("");
    setZones([]);
    setSelectedContactIndex(null);
    onClose();
  };

  if (!show) return null; // Safe to return after hooks

  return (
    <div className="modal-overlay sms-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Add SMS Group</h2>
          <button type="button" className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          {optionsError && (
            <div style={{ marginBottom: 8, color: "#b00020" }}>{optionsError}</div>
          )}



          <div className="modal-row">
            <label>
              Group Name <span className="required">*</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>
          <div className="modal-row" style={{ marginTop: 8 }}>
            <label>Contact Name</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Enter contact name"
            />
          </div>

          <div className="modal-row">
            <label>
              Contact No <span className="required">*</span>
            </label>
            <div className="email-input-section">
              <input
                type="tel"
                value={contactInput}
                onChange={(e) => setContactInput(e.target.value)}
                className="email-input"
                placeholder="Enter contact number"
              />
              <div className="email-buttons">
                <button
                  type="button"
                  className="email-add"
                  onClick={handleAddContact}
                  disabled={
                    !contactInput.trim() ||
                    contactNumbers.includes(contactInput.trim()) ||
                    !phoneRegex.test(contactInput.trim())
                  }
                >
                  +
                </button>
                <button
                  type="button"
                  className="email-remove"
                  onClick={handleRemoveContact}
                  disabled={selectedContactIndex === null}
                >
                  −
                </button>
              </div>
            </div>

            {contactNumbers.length > 0 && (
              <div className="email-list">
                {contactNumbers.map((contact, idx) => (
                  <div
                    key={idx}
                    className={`email-item ${selectedContactIndex === idx ? "selected" : ""}`}
                    onClick={() => handleContactClick(idx)}
                  >
                    {contact}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-row">
            <label>
              Threshold <span className="required">*</span>
            </label>
            <select
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              required
              className="custom-select"
              disabled={optionsLoading || thresholdOptions.length === 0}
            >
              <option value="">{optionsLoading ? "Loading..." : "Select"}</option>
              {thresholdOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-row">
            <label>
              Zones <span className="required">*</span>
            </label>
            <MultiSelectDropdown
              options={zoneOptions}
              value={zones}
              onChange={setZones}
              placeholder={optionsLoading ? "Loading..." : "Select Entrance"}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm actv">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSMSGroupModal;


