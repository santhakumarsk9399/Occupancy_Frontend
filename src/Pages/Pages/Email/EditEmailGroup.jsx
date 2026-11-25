import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './EditEmailGroup.css';
import './EmailTab.css';
import { Formik, Form as FormikForm } from 'formik';
import * as Yup from 'yup';
import MultiSelectDropdown from '../CommonComponents/MultiSelectDropDown';

const API_BASE = import.meta.env.VITE_API_URL || 'http://delbi2dev.deloptanalytics.com:3000';
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// using shared MultiSelectDropdown (same as Add)

// Reusable info tooltip icon (same style as Users module)
const InfoTooltip = ({ id, children }) => (
  <OverlayTrigger
    placement="top"
    overlay={<Tooltip id={id}>{children}</Tooltip>}
    delay={{ show: 150, hide: 100 }}
  >
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

const EditEmailGroup = ({ groupId, groupName: initialGroupName, onClose, onSave }) => {
  const [groupName, setGroupName] = useState(initialGroupName || '');
  const [oldGroupName, setOldGroupName] = useState(initialGroupName || '');
  const [emails, setEmails] = useState([]);
  const [threshold, setThreshold] = useState('');
  const [zones, setZones] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [selectedEmailIndex, setSelectedEmailIndex] = useState(null);

  const [thresholdOptions, setThresholdOptions] = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState('');
  const [saving, setSaving] = useState(false);
  // form-level errors handled by Formik/Yup

  // Load existing group details and options
  useEffect(() => {
    const getSafeUsername = () => {
      const raw = (sessionStorage.getItem('username') ?? '').toString().trim();
      return raw.length > 0 ? raw : 'TestUser';
    };
    const fetchView = async () => {
      setOptionsError('');
      setOptionsLoading(true);
      try {
        const token = sessionStorage.getItem('token');
        const username = getSafeUsername();
        if (!token) throw new Error('Missing auth token in session');

        // Fetch current group details + all options
        const viewRes = await fetch(`${API_BASE}/settings/email/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username,
            groupName: (initialGroupName || groupName || '').toString().trim(),
            groupname: (initialGroupName || groupName || '').toString().trim(),
          }),
        });
        if (!viewRes.ok) {
          const text = await viewRes.text();
          throw new Error(text || `Request failed with ${viewRes.status}`);
        }
        const data = await viewRes.json();

        // Prefill form fields
        const meta = Array.isArray(data?.metaData) && data.metaData.length > 0 ? data.metaData[0] : null;
        if (meta) {
          const gname = meta.GroupName || initialGroupName || '';
          setGroupName(gname);
          setOldGroupName(gname);
          const emailsStr = (meta.EmailId || '').toString();
          const parsed = emailsStr
            .split(';')
            .map((e) => e.trim())
            .filter(Boolean);
          const uniq = Array.from(new Set(parsed));
          setEmails(uniq);
        }

        const mappedThreshold = Array.isArray(data?.mappedThreshold) && data.mappedThreshold[0]?.ThresholdName;
        const mappedZones = Array.isArray(data?.mappedZone)
          ? data.mappedZone.map((z) => z?.ZoneName).filter(Boolean)
          : [];
        if (mappedThreshold) setThreshold(mappedThreshold);
        if (mappedZones?.length) setZones(mappedZones.map((z) => ({ label: z, value: z })));

        // Set options from allThreshold/allZone if available
        let tOpts = Array.isArray(data?.allThreshold)
          ? data.allThreshold.map((t) => t?.ThresholdName).filter(Boolean)
          : [];
        let zOpts = Array.isArray(data?.allZone)
          ? data.allZone.map((z) => z?.ZoneName).filter(Boolean)
          : [];

        // Fallback to thresholdZone if not provided
        if (tOpts.length === 0 || zOpts.length === 0) {
          try {
            const tzRes = await fetch(`${API_BASE}/settings/sms/thresholdZone`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ username }),
            });
            if (tzRes.ok) {
              const tzData = await tzRes.json();
              if (tOpts.length === 0) {
                tOpts = Array.isArray(tzData?.threshold)
                  ? tzData.threshold.map((t) => t?.ThresholdName).filter(Boolean)
                  : [];
              }
              if (zOpts.length === 0) {
                zOpts = Array.isArray(tzData?.zone)
                  ? tzData.zone.map((z) => z?.ZoneName).filter(Boolean)
                  : [];
              }
            }
          } catch (e) {
            // ignore fallback errors; options may remain empty
          }
        }

  setThresholdOptions(tOpts);
  setZoneOptions(zOpts.map((z) => ({ label: z, value: z })));
      } catch (err) {
        console.error('Failed to load Email group view/options:', err);
        setOptionsError(err?.message || 'Failed to load group details');
      } finally {
        setOptionsLoading(false);
      }
    };

    if (initialGroupName || groupName) {
      fetchView();
    }
  }, [initialGroupName]);

  // Formik will manage adding/removing emails

  const handleRemoveEmail = () => {
    if (selectedEmailIndex !== null) {
      setEmails(emails.filter((_, i) => i !== selectedEmailIndex));
      setSelectedEmailIndex(null);
    }
  };

  const handleEmailClick = (index) => {
    setSelectedEmailIndex(selectedEmailIndex === index ? null : index);
  };

  const validationSchema = Yup.object({
    groupName: Yup.string()
      .required('Group Name is required')
      .max(75, 'Group Name must be 75 characters or less')
      .matches(/^[^\s]+$/, 'Group name should not contain spaces'),
    emails: Yup.array()
      .of(
        Yup.string()
          .test('no-spaces', 'Email cannot contain spaces', (v) => (v ? !/\s/.test(v) : true))
          .matches(emailRegex, 'Invalid email')
      )
      .min(1, 'Email ID is required'),
    threshold: Yup.string().required('Threshold is required'),
    zones: Yup.array().min(1, 'Zones is required'),
    emailInput: Yup.string().test('no-spaces-input', 'Email cannot contain spaces', (v) => (v ? !/\s/.test(v) : true)),
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content email-modal threshold-themed">
        <div className="modal-header">
          <h2 className="modal-title">Edit Email Group</h2>
          <button type="button" className="modal-close" onClick={onClose}>×</button>
        </div>
        <Formik
          enableReinitialize
          initialValues={{ groupName, emailInput, emails, threshold, zones }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            const username = sessionStorage.getItem('username') || 'TestUser';
            const token = sessionStorage.getItem('token');
            if (!token) {
              toast.error('Missing auth token. Please log in again.', { position: 'top-right' });
              return;
            }
            const payload = {
              username,
              oldgroupname: oldGroupName || values.groupName,
              groupname: String(values.groupName || '').trim(),
              email: Array.from(new Set((values.emails || []).map((e) => e.trim()))).filter(Boolean).join(';'),
              zone: Array.isArray(values.zones)
                ? Array.from(new Set(values.zones.map((z) => (z?.value ?? '').toString().trim()))).filter(Boolean).join(',')
                : '',
              threshold: String(values.threshold || '').trim(),
            };
            try {
              setSubmitting(true);
              setSaving(true);
              const res = await fetch(`${API_BASE}/settings/email/edit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
              });
              const raw = await res.text();
              let data = {};
              try { data = raw ? JSON.parse(raw) : {}; } catch {}
              if (!res.ok || data?.success === false) {
                throw new Error(data?.message || raw || `Edit failed with ${res.status}`);
              }
              toast.success(data?.message || 'Email group updated', { position: 'top-right' });
              onSave && onSave();
              onClose && onClose();
            } catch (err) {
              console.error('Edit Email group failed:', err);
              toast.error(err?.message || 'Failed to save changes', { position: 'top-right' });
            } finally {
              setSaving(false);
              setSubmitting(false);
            }
          }}
        >
          {({ values, errors, touched, setFieldValue, setFieldError, handleSubmit, isSubmitting, isValid, submitCount }) => {
            const showGroupNameError = !!(errors.groupName && (touched.groupName || submitCount > 0));
            const showEmailsError = !!(errors.emails && (touched.emails || submitCount > 0));
            const showThresholdError = !!(errors.threshold && (touched.threshold || submitCount > 0));
            const showZonesError = !!(errors.zones && (touched.zones || submitCount > 0));
            return (
            <FormikForm className="modal-form" noValidate onSubmit={handleSubmit}>
          {optionsError && (
            <div style={{ marginBottom: 8, color: '#b00020' }}>{optionsError}</div>
          )}
          {submitCount > 0 && !isValid && (
            <div     style={{ marginBottom: 8 }}>
              {/* Please fix the validation errors. */}
            </div>
          )}

          <div className="modal-row">
            <label>
              Group Name <span className="required">*</span>
              <InfoTooltip id="group-name-tooltip">
                Group name should not exceed 75 characters
              </InfoTooltip>
            </label>
            <div className={`field ${showGroupNameError ? 'has-error' : ''}`}>
              <input
                type="text"
                value={values.groupName}
                onChange={(e) => setFieldValue('groupName', e.target.value)}
                onKeyDown={(e) => { if (e.key === ' ') e.preventDefault(); }}
                maxLength={75}
                placeholder="Enter group name"
                className={showGroupNameError ? 'error' : ''}
              />
              {showGroupNameError && <span className="error-icon">i</span>}
            </div>
            {showGroupNameError && (
              <div className="error-message">{errors.groupName}</div>
            )}
          </div>
          <div className="modal-row">
            <label>Email ID <span className="required">*</span></label>
            <div className="email-input-section">
              <div className={`field ${showEmailsError ? 'has-error' : ''}`} style={{ flex: 1 }}>
                <input
                  type="text"
                  value={values.emailInput}
                  onChange={(e) => {
                    const val = (e.target.value || '').replace(/\s+/g, '');
                    setFieldValue('emailInput', val);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === ' ') e.preventDefault();
                  }}
                  onPaste={(e) => {
                    const text = (e.clipboardData?.getData('text') || '').replace(/\s+/g, '');
                    e.preventDefault();
                    setFieldValue('emailInput', `${values.emailInput || ''}${text}`);
                  }}
                  className={`email-input ${showEmailsError ? 'error' : ''}`}
                  placeholder="Enter email"
                />
                {showEmailsError && <span className="error-icon">i</span>}
              </div>
              <div className="email-buttons">
                <button
                  type="button"
                  className="email-add"
                  onClick={() => {
                    const raw = values.emailInput || '';
                    const parts = raw.split(';').map((s) => s.trim()).filter(Boolean);
                    if (parts.length === 0) return;
                    const invalid = parts.filter((e) => /\s/.test(e) || !emailRegex.test(e));
                    if (invalid.length > 0) {
                      setFieldError('emails', 'Email addresses cannot contain spaces and must be valid');
                      return;
                    }
                    const current = Array.isArray(values.emails) ? values.emails : [];
                    const validNew = parts.filter((e) => !current.includes(e));
                    if (validNew.length > 0) setFieldValue('emails', [...current, ...validNew]);
                    setFieldValue('emailInput', '');
                  }}
                  disabled={(function(){
                    const raw = (values.emailInput || '').trim();
                    if (!raw) return true;
                    const parts = raw.split(';').map((s)=>s.trim()).filter(Boolean);
                    if (parts.length === 0) return true;
                    return !parts.some((p)=> emailRegex.test(p) && !(values.emails||[]).includes(p) && !/\s/.test(p));
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
                      setFieldValue('emails', updated);
                      setSelectedEmailIndex(null);
                    }
                  }}
                  disabled={selectedEmailIndex === null}
                >
                  −
                </button>
              </div>
            </div>
            {showEmailsError && (
              <div className="error-message">{errors.emails}</div>
            )}
            {(values.emails || []).length > 0 && (
              <div className="email-list">
                {values.emails.map((email, idx) => (
                  <div
                    key={idx}
                    className={`email-item ${selectedEmailIndex === idx ? 'selected' : ''}`}
                    onClick={() => handleEmailClick(idx)}
                  >
                    {email}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-row">
            <label>Threshold <span className="required">*</span></label>
            <div className={`field ${showThresholdError ? 'has-error' : ''}`}>
              <select
                value={values.threshold}
                onChange={(e) => setFieldValue('threshold', e.target.value)}
                className={`custom-select ${showThresholdError ? 'error' : ''}`}
                disabled={optionsLoading || thresholdOptions.length === 0}
              >
                <option value="">{optionsLoading ? 'Loading...' : 'Select'}</option>
                {thresholdOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {showThresholdError && <span className="error-icon">i</span>}
            </div>
            {showThresholdError && (
              <div className="error-message">{errors.threshold}</div>
            )}
          </div>
          <div className="modal-row">
            <label>Zones <span className="required">*</span></label>
            <div className={`field ${showZonesError ? 'has-error' : ''}`}>
              <MultiSelectDropdown
                options={zoneOptions}
                value={values.zones}
                onChange={(newZones) => setFieldValue('zones', newZones)}
                placeholder={optionsLoading ? 'Loading...' : 'Select zones'}
                isInvalid={showZonesError}
                error={showZonesError ? String(errors.zones) : ''}
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="save-btn" disabled={saving || isSubmitting}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
            </FormikForm>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default EditEmailGroup;