import React, { useEffect, useMemo, useState } from "react";
import "./EmailTab.css";
import MultiSelectDropdown from "../CommonComponents/MultiSelectDropDown";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

// Prefer environment variable; fallback to known dev host
const API_BASE = import.meta.env.VITE_API_URL || "http://delbi2dev.deloptanalytics.com:3000";

// Validation schema similar approach to Threshold form
const validationSchema = Yup.object().shape({
  groupName: Yup.string()
    .required("Group Name is required")
    .max(75, "Max 75 characters")
    .test("not-only-spaces", "Group Name cannot be only spaces", (v) => !!v && v.trim().length > 0),
  contactName: Yup.string().max(75, "Max 75 characters").nullable(),
  threshold: Yup.string().required("Threshold is required"),
  contactInput: Yup.string().nullable(), // handled when adding
  contactNumbers: Yup.array()
    .of(
      Yup.string()
        .matches(/^\d+$/, "Digits only")
        .max(25, "Max 25 digits")
    )
    .min(1, "At least one contact number required"),
  zones: Yup.array().of(
    Yup.object({ label: Yup.string().required(), value: Yup.string().required() })
  ).min(1, "Select at least one Zone"),
});

const phoneRegex = /^\d{1,25}$/; // only digits up to 25

const AddSMSGroupModal = ({ show, onClose, onSubmit }) => {
  const [thresholdOptions, setThresholdOptions] = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState("");

  const initialValues = useMemo(() => ({
    groupName: "",
    contactName: "",
    contactInput: "",
    contactNumbers: [],
    threshold: "",
    zones: [],
  }), []);

  // Load threshold + zone options when opened
  useEffect(() => {
    if (!show) return;
    let cancelled = false;
    const run = async () => {
      setOptionsError("");
      setOptionsLoading(true);
      try {
        const tokenVal = sessionStorage.getItem("token");
        const username = sessionStorage.getItem("username") || "TestUser";
        if (!tokenVal) throw new Error("Missing auth token in session");
        const res = await fetch(`${API_BASE}/settings/sms/thresholdZone`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenVal}` },
          body: JSON.stringify({ username }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed with ${res.status}`);
        }
        const data = await res.json();
        const tOpts = Array.isArray(data?.threshold) ? data.threshold.map(t => t?.ThresholdName).filter(Boolean) : [];
        const zOpts = Array.isArray(data?.zone) ? data.zone.map(z => z?.ZoneName).filter(Boolean) : [];
        if (!cancelled) {
          setThresholdOptions(tOpts);
          setZoneOptions(zOpts.map(z => ({ label: z, value: z })));
        }
      } catch (err) {
        console.error("Failed to load threshold/zone options:", err);
        if (!cancelled) setOptionsError(err?.message || "Failed to load options");
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [show]);

  if (!show) return null;

  return (
    <div className="modal-overlay sms-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Add SMS Group</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              // Build final group data (dedupe numbers & zones)
              const contacts = Array.from(new Set(values.contactNumbers.map(c => c.trim()))).filter(Boolean);
              if (contacts.length === 0) {
                toast.error("Add at least one contact number", { position: "top-right" });
                return;
              }
              const zonesClean = Array.isArray(values.zones) ? values.zones.map(z => ({ label: z.label, value: z.value })) : [];
              const zoneValues = zonesClean.map(z => z.value);
              const groupData = {
                groupName: values.groupName.trim(),
                contactNumbers: contacts,
                contactName: values.contactName.trim(),
                threshold: values.threshold,
                zones: zoneValues,
              };
              onSubmit && (await onSubmit(groupData));
              toast.success("Group saved", { position: "top-right", autoClose: 2500 });
              resetForm();
            } catch (e) {
              console.error("Add SMS group submit failed:", e);
              toast.error(e?.message || "Failed to save group", { position: "top-right" });
            } finally {
              setSubmitting(false);
              onClose();
            }
          }}
        >
          {({ values, errors, touched, setFieldValue, isSubmitting }) => (
            <FormikForm className="modal-form">
              {optionsError && <div style={{ marginBottom: 8, color: '#b00020' }}>{optionsError}</div>}
              <div className="modal-row">
                <label>Group Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="groupName"
                  value={values.groupName}
                  maxLength={75}
                  onChange={(e) => setFieldValue("groupName", e.target.value.slice(0,75))}
                  onBlur={(e) => setFieldValue("groupName", (e.target.value || '').trim())}
                  className={touched.groupName && errors.groupName ? 'invalid' : ''}
                />
                {touched.groupName && errors.groupName && <div className="field-error">{errors.groupName}</div>}
              </div>
              <div className="modal-row" style={{ marginTop: 8 }}>
                <label>Contact Name</label>
                <input
                  type="text"
                  name="contactName"
                  value={values.contactName}
                  maxLength={75}
                  onChange={(e) => setFieldValue("contactName", e.target.value.slice(0,75))}
                  onBlur={(e) => setFieldValue("contactName", (e.target.value || '').trim())}
                  placeholder="Enter contact name"
                />
                {touched.contactName && errors.contactName && <div className="field-error">{errors.contactName}</div>}
              </div>
              <div className="modal-row">
                <label>Contact No <span className="required">*</span></label>
                <div className="email-input-section">
                  <input
                    type="tel"
                    value={values.contactInput}
                    placeholder="Enter contact number"
                    onChange={(e) => setFieldValue('contactInput', e.target.value)}
                    className="email-input"
                  />
                  <div className="email-buttons">
                    <button
                      type="button"
                      className="email-add"
                      onClick={() => {
                        const raw = (values.contactInput || '').trim();
                        if (!raw) return;
                        if (!phoneRegex.test(raw)) {
                          toast.error('Only digits allowed (max 25)', { position: 'top-right' });
                          return;
                        }
                        if (values.contactNumbers.includes(raw)) {
                          toast.warning('Number already added', { position: 'top-right' });
                          return;
                        }
                        setFieldValue('contactNumbers', [...values.contactNumbers, raw]);
                        setFieldValue('contactInput', '');
                      }}
                      disabled={!values.contactInput?.trim() || !phoneRegex.test(values.contactInput.trim()) || values.contactNumbers.includes(values.contactInput.trim())}
                    >+
                    </button>
                    <button
                      type="button"
                      className="email-remove"
                      onClick={() => {
                        const idx = values._selectedContactIndex ?? -1; // internal ephemeral
                        if (idx >= 0) {
                          const copy = [...values.contactNumbers];
                          copy.splice(idx,1);
                          setFieldValue('contactNumbers', copy);
                          setFieldValue('_selectedContactIndex', -1);
                        }
                      }}
                      disabled={(values._selectedContactIndex ?? -1) < 0}
                    >−
                    </button>
                  </div>
                </div>
                {values.contactNumbers.length > 0 && (
                  <div className="email-list">
                    {values.contactNumbers.map((contact, idx) => (
                      <div
                        key={idx}
                        className={`email-item ${(values._selectedContactIndex ?? -1) === idx ? 'selected' : ''}`}
                        onClick={() => setFieldValue('_selectedContactIndex', (values._selectedContactIndex ?? -1) === idx ? -1 : idx)}
                      >{contact}</div>
                    ))}
                  </div>
                )}
                {touched.contactNumbers && errors.contactNumbers && <div className="field-error">{errors.contactNumbers}</div>}
              </div>
              <div className="modal-row">
                <label>Threshold <span className="required">*</span></label>
                <select
                  name="threshold"
                  value={values.threshold}
                  onChange={(e) => setFieldValue('threshold', e.target.value)}
                  className={`custom-select ${touched.threshold && errors.threshold ? 'invalid' : ''}`}
                  disabled={optionsLoading || thresholdOptions.length === 0}
                >
                  <option value="">{optionsLoading ? 'Loading...' : 'Select'}</option>
                  {thresholdOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {touched.threshold && errors.threshold && <div className="field-error">{errors.threshold}</div>}
              </div>
              <div className="modal-row">
                <label>Zones <span className="required">*</span></label>
                <MultiSelectDropdown
                  options={zoneOptions}
                  value={values.zones}
                  onChange={(val) => setFieldValue('zones', val)}
                  placeholder={optionsLoading ? 'Loading...' : 'Select Entrance'}
                />
                {touched.zones && errors.zones && <div className="field-error">{errors.zones}</div>}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-primary btn-sm" onClick={onClose} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm actv" disabled={isSubmitting || optionsLoading}>{isSubmitting ? 'Saving…' : 'Save'}</button>
              </div>
            </FormikForm>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddSMSGroupModal;


