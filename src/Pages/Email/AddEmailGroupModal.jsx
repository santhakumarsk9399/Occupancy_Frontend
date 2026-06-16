import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "./EmailTab.css";
// Reuse Threshold form select styling for consistent dropdown look
import "../Threshold/components/ThresholdForm.css";
import MultiSelectDropdown from "../CommonComponents/MultiSelectDropDown";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import SingleSelectDropdown from "../CommonComponents/SingleSelectDropdown";

const API_BASE = import.meta.env.VITE_API_URL || "http://delbi2dev.deloptanalytics.com:3000";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const InfoTooltip = ({ id, children }) => (
  <OverlayTrigger placement="top" overlay={<Tooltip id={id}>{children}</Tooltip>} delay={{ show: 150, hide: 100 }}>
    <span
      role="img"
      aria-label="info"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 4,
        width: 14,
        height: 14,
        borderRadius: "50%",
        border: "1px solid #6c757d",
        fontSize: 10,
        lineHeight: 1,
        cursor: "help",
        userSelect: "none",
      }}
    >
      i
    </span>
  </OverlayTrigger>
);

const AddEmailGroupModal = ({ show, onClose, onSave }) => {
  const [thresholdOptions, setThresholdOptions] = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState("");
  const [selectedEmailIndex, setSelectedEmailIndex] = useState(null);

  // Load threshold and zone options when modal opens
  useEffect(() => {
    if (!show) return;
    const fetchOptions = async () => {
      setOptionsError("");
      setOptionsLoading(true);
      try {
        const token = sessionStorage.getItem("token");
        const username = sessionStorage.getItem("username") || "TestUser";
        if (!token) throw new Error("Missing auth token in session");

        const res = await fetch(`${API_BASE}/settings/sms/thresholdZone`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ username }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed with ${res.status}`);
        }
        const data = await res.json();
        const tOpts = Array.isArray(data?.threshold) ? data.threshold.map((t) => t?.ThresholdName).filter(Boolean) : [];
        const zOpts = Array.isArray(data?.zone) ? data.zone.map((z) => z?.ZoneName).filter(Boolean) : [];
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

  if (!show) return null;

  const validationSchema = Yup.object({
    groupName: Yup.string()
      .required("Group Name is required")
      .max(75, "Group Name must be 75 characters or less")
      .test(
        "not-whitespace-only",
        "Group name cannot be empty or spaces only",
        (v) => (v || "").trim().length > 0
      ),
    emails: Yup.array()
      .of(
        Yup.string()
          .test("no-spaces", "Email cannot contain spaces", (v) => (v ? !/\s/.test(v) : true))
          .matches(emailRegex, "Invalid email")
      )
      .min(1, "Email ID is required"),
    threshold: Yup.string().required("Threshold is required"),
    zones: Yup.array().min(1, "Zones is required"),
    emailInput: Yup.string()
      .test(
        "no-spaces-input",
        "Email cannot contain spaces",
        (v) => (v ? !/\s/.test(v) : true)
      )
      .test(
        "pending-add",
        "Click + to add it.",
        function (v) {
          const { emails } = this.parent;
            if (!v) return true; // nothing typed
            // Split by semicolons allowing bulk paste
            const parts = v.split(";").map((s) => s.trim()).filter(Boolean);
            if (parts.length === 0) return true;
            // If there exists at least one valid email not already added, trigger message
            const anyValidNotAdded = parts.some(
              (p) => emailRegex.test(p) && !(Array.isArray(emails) ? emails : []).includes(p)
            );
            // Only show the message if all parts are syntactically valid emails (avoid masking actual invalid entries)
            const allValid = parts.every((p) => emailRegex.test(p));
            if (allValid && anyValidNotAdded) return false;
            return true;
        }
      ),
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content email-modal threshold-themed sms-modal">
        <div className="modal-header">
          <h2 className="modal-title">Add Email Group</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {optionsError && <div style={{ marginBottom: 8, color: "#b00020" }}>{optionsError}</div>}

        <Formik
          enableReinitialize
          initialValues={{ groupName: "", emailInput: "", emails: [], threshold: "", zones: [] }}
          validationSchema={validationSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {

            const username = sessionStorage.getItem("username") || "TestUser";
            const token = sessionStorage.getItem("token");
            if (!token) {
              const emsg = "Missing auth token. Please log in again.";
              console.error(emsg);
              toast.error(emsg, { containerId: 'email-group', position: "top-right", autoClose: 3000 });
              return;
            }

            const payload = {
              username,
              groupname: values.groupName.trim(),
              email: Array.from(new Set((values.emails || []).map((e) => String(e).trim())))
                .filter(Boolean)
                .join(";"),
              zone: Array.isArray(values.zones)
                ? Array.from(new Set(values.zones.map((z) => (z?.value ?? "").toString().trim())))
                    .filter(Boolean)
                    .join(",")
                : "",
              threshold: String(values.threshold || "").trim(),
            };

            try {
              setSubmitting(true);
              let response = await fetch(`${API_BASE}/settings/email/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
              });
              if (response.status === 401) {
                const fresh = sessionStorage.getItem("token");
                if (fresh && fresh !== token) {
                  response = await fetch(`${API_BASE}/settings/email/create`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${fresh}` },
                    body: JSON.stringify(payload),
                  });
                }
              }
              const raw = await response.text();
              let data = {};
              try { data = raw ? JSON.parse(raw) : {}; } catch {}
              if (!response.ok || data?.success === false) {
                throw new Error(data?.message || raw || "Failed to add group");
              }
              const smsg = data?.message || 'Email group added';
              console.log('Toast success:', smsg);
              toast.success(smsg, { containerId: 'email-group', position: 'top-right', autoClose: 3000 });
              onSave && onSave();
              resetForm();
            } catch (err) {
              const emsg = err?.message || 'Failed to add group';
              console.error('Toast error:', emsg);
              toast.error(emsg, { containerId: 'email-group', position: 'top-right', autoClose: 3000 });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, errors, touched, setFieldValue, setFieldError, handleSubmit, isSubmitting, isValid, submitCount }) => {
            const showGroupNameError = !!(errors.groupName && (touched.groupName || submitCount > 0));
            const hasEmails = Array.isArray(values.emails) && values.emails.length > 0;
            // Only surface the "Email ID is required" error when there are no added emails.
            const emailListErrorVisible = !hasEmails && !!(errors.emails && (touched.emails || submitCount > 0));
            // Always allow showing the pending-add message for the input on blur or submit.
            const emailInputErrorVisible = !!(errors.emailInput && (touched.emailInput || submitCount > 0));
            const showEmailsError = emailListErrorVisible || emailInputErrorVisible;
            const showThresholdError = !!(errors.threshold && (touched.threshold || submitCount > 0));
            const showZonesError = !!(errors.zones && (touched.zones || submitCount > 0));
            return (
            <FormikForm className="modal-form" noValidate onSubmit={handleSubmit}>
              {/* Validation summary intentionally hidden (text-only design) */}
              <div className="modal-row">
                <label>
                  Group Name <span className="required">*</span>
                  <InfoTooltip id="group-name-tooltip">Group name should contain maximum 75 characters</InfoTooltip>
                </label>
                <input
                  type="text"
                  value={values.groupName}
                  onChange={(e) => setFieldValue("groupName", e.target.value)}
                  maxLength={75}
                  className={showGroupNameError ? "error" : ""}
                />
                {showGroupNameError && <div className="error-message">{errors.groupName}</div>}
              </div>

              <div className="modal-row">
                <label>
                  Email ID <span className="required">*</span>
                </label>
                <div className="email-input-section">
                  <input
                    type="text"
                    value={values.emailInput}
                    onChange={(e) => {
                      const val = (e.target.value || "").replace(/\s+/g, "");
                      setFieldValue("emailInput", val);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === " ") e.preventDefault();
                    }}
                    onPaste={(e) => {
                      const text = (e.clipboardData?.getData("text") || "").replace(/\s+/g, "");
                      e.preventDefault();
                      setFieldValue("emailInput", `${values.emailInput || ""}${text}`);
                    }}
                    className={`email-input ${showEmailsError ? "error" : ""}`}
                    // placeholder="Enter email "
                  />
                  <div className="email-buttons">
                    <button
                      type="button"
                      className="email-add"
                      onClick={() => {
                        const raw = values.emailInput || "";
                        const parts = raw.split(";").map((e) => e.trim()).filter(Boolean);
                        if (parts.length === 0) return;
                        const invalid = parts.filter((e) => /\s/.test(e) || !emailRegex.test(e));
                        if (invalid.length > 0) {
                          setFieldError("emails", "Email addresses cannot contain spaces and must be valid");
                          return;
                        }
                        const current = Array.isArray(values.emails) ? values.emails : [];
                        const validNew = parts.filter((e) => !current.includes(e));
                        if (validNew.length > 0) setFieldValue("emails", [...current, ...validNew]);
                        setFieldValue("emailInput", "");
                      }}
                      disabled={(function () {
                        const raw = (values.emailInput || "").trim();
                        if (!raw) return true;
                        const parts = raw.split(";").map((s) => s.trim()).filter(Boolean);
                        if (parts.length === 0) return true;
                        return !parts.some((p) => emailRegex.test(p) && !(values.emails || []).includes(p) && !/\s/.test(p));
                      })()}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="email-remove"
                      onClick={() => {
                        if (selectedEmailIndex !== null) {
                          const updated = (values.emails || []).filter((_, i) => i !== selectedEmailIndex);
                          setFieldValue("emails", updated);
                          setSelectedEmailIndex(null);
                        }
                      }}
                      disabled={selectedEmailIndex === null}
                    >
                      −
                    </button>
                  </div>
                </div>
                {showEmailsError && <div className="error-message">{errors.emailInput || errors.emails}</div>}
                {(values.emails || []).length > 0 && (
                  <div className="email-list">
                    {values.emails.map((email, idx) => (
                      <div
                        key={idx}
                        className={`email-item ${selectedEmailIndex === idx ? "selected" : ""}`}
                        onClick={() => setSelectedEmailIndex(selectedEmailIndex === idx ? null : idx)}
                      >
                        {email}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-row">
                <label>
                  Threshold <span className="required">*</span>
                </label>
                <div className="threshold-email-template-select">
                  <SingleSelectDropdown
                    options={[{ value: "", label: optionsLoading ? "Loading..." : "Select" }, ...thresholdOptions.map(t => ({ value: t, label: t }))]}
                    value={values.threshold ? { value: values.threshold, label: values.threshold } : null}
                    onChange={(opt) => setFieldValue("threshold", opt ? opt.value : "")}
                    isInvalid={showThresholdError}
                    usePortal={true}
                    portalZIndex={6000}
                  />
                </div>
                {showThresholdError && <div className="invalid-feedback d-block">{errors.threshold}</div>}
              </div>

              <div className="modal-row">
                <label>
                  Zones <span className="required">*</span>
                </label>
                <MultiSelectDropdown
                  options={zoneOptions}
                  value={values.zones}
                  onChange={(newZones) => setFieldValue("zones", newZones)}
                  placeholder={optionsLoading ? "Loading..." : "Select zones"}
                  isInvalid={showZonesError}
                  error={showZonesError ? String(errors.zones) : ""}
                />
              </div>

              <div className="modal-actions modal-actions-center">
                <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm actv" disabled={isSubmitting}>
                  Save
                </button>
              </div>
            </FormikForm>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default AddEmailGroupModal;