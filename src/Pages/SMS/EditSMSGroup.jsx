import React, { useState, useEffect, useMemo } from "react";
import "./EmailTab.css";
import MultiSelectDropdown from "../CommonComponents/MultiSelectDropDown";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

// Environment aware base
const API_BASE = import.meta.env.VITE_API_URL || "http://delbi2dev.deloptanalytics.com:3000";

const phoneRegex = /^\d{1,25}$/; // digits only up to 25

const validationSchema = Yup.object().shape({
  groupName: Yup.string().required("Group Name is required").max(75, "Max 75 chars").test('not-spaces', 'Cannot be only spaces', v => !!v && v.trim().length>0),
  contactName: Yup.string().required("Contact Name is required").max(75, "Max 75 chars"),
  contactNumbers: Yup.array().of(
    Yup.string()
      .matches(/^\d+$/, 'Digits only')
      .max(25, 'Max 25 digits')
  ).min(1, 'At least one contact number required'),
  threshold: Yup.string().required("Threshold is required"),
  zones: Yup.array().of(Yup.object({ label: Yup.string().required(), value: Yup.string().required() })).min(1, 'Select at least one Zone'),
});

const EditSMSGroup = ({ show, group, onClose, onSubmit }) => {
  const [thresholdOptions, setThresholdOptions] = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState("");
  const [oldGroupName, setOldGroupName] = useState("");

  const targetGroupName = useMemo(() => {
    if (!group) return "";
    if (typeof group === 'string') return group;
    return group?.name || group?.groupName || group?.GroupName || '';
  }, [group]);

  const initialValues = useMemo(() => ({
    groupName: "",
    contactName: "",
    contactInput: "",
    contactNumbers: [],
    threshold: "",
    zones: [],
  }), [targetGroupName]);

  useEffect(() => {
    if (!show || !targetGroupName) return;
    let cancelled = false;
    const load = async () => {
      setOptionsError("");
      setOptionsLoading(true);
      try {
        const token = sessionStorage.getItem('token');
        const username = sessionStorage.getItem('username') || 'TestUser';
        if (!token) throw new Error('Missing auth token in session');
        const res = await fetch(`${API_BASE}/settings/sms/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ username, groupName: targetGroupName })
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed with ${res.status}`);
        }
        const data = await res.json();
        const smsArr = Array.isArray(data?.smsGroup) ? data.smsGroup : [];
        const sms = smsArr[0] || null;
        const mappedThreshold = Array.isArray(data?.mappedthreshold) && data.mappedthreshold[0]?.ThresholdName;
        const mappedZones = Array.isArray(data?.mappedzone) ? data.mappedzone.map(z => z?.zonename).filter(Boolean) : [];
        const tOpts = Array.isArray(data?.threshold) ? data.threshold.map(t => t?.ThresholdName).filter(Boolean) : [];
        const zOpts = Array.isArray(data?.zone) ? data.zone.map(z => z?.ZoneName).filter(Boolean) : [];
        if (cancelled) return;
        setThresholdOptions(tOpts);
        setZoneOptions(zOpts.map(z => ({ label: z, value: z })));
        if (sms) setOldGroupName(sms.GroupName || targetGroupName); else setOldGroupName(targetGroupName);
        // Prime form values via Formik setFieldValue after mount by custom event dispatch
        const collected = smsArr.map(it => (it?.ContactNo ?? '').toString()).filter(Boolean);
        let contacts = collected.length > 0 ? collected : [];
        if (contacts.length === 1 && contacts[0].includes(',')) contacts = contacts[0].split(',');
        contacts = Array.from(new Set(contacts.map(c => c.trim()))).filter(Boolean);
        // dispatch a custom event carrying payload for form to consume
        const detail = {
          groupName: sms?.GroupName || targetGroupName || '',
          contactName: sms?.ContactName || '',
          contactNumbers: contacts,
          threshold: mappedThreshold || '',
          zones: (mappedZones || []).map(z => ({ label: z, value: z })),
        };
        window.dispatchEvent(new CustomEvent('edit-sms-group-prefill', { detail }));
      } catch (err) {
        console.error('Failed to load SMS group view:', err);
        if (!cancelled) setOptionsError(err?.message || 'Failed to load group details');
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [show, targetGroupName]);

  if (!show) return null;

  return (
    <div className="modal-overlay sms-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Edit SMS Group</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values,{ setSubmitting, resetForm }) => {
            try {
              const token = sessionStorage.getItem('token');
              const username = sessionStorage.getItem('username') || 'TestUser';
              if (!token) throw new Error('Missing auth token in session');
              const contacts = Array.from(new Set(values.contactNumbers.map(c => c.trim()))).filter(Boolean);
              const zones = Array.isArray(values.zones) ? values.zones.map(z => z.value) : [];
              const payload = {
                username,
                oldgroupname: oldGroupName || values.groupName,
                groupname: values.groupName.trim(),
                contactno: contacts.join(','),
                contactname: values.contactName.trim(),
                zone: zones.join(','),
                threshold: values.threshold,
              };
              const res = await fetch(`${API_BASE}/settings/sms/edit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
              });
              if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Edit failed (${res.status})`);
              }
              const data = await res.json().catch(()=>null);
              if (data && data.success === false) throw new Error(data.message || 'Edit failed');
              toast.success('Group updated', { position: 'top-right', autoClose: 2500 });
              onSubmit && onSubmit({ ...payload, zones: values.zones, contactNumbers: contacts });
              resetForm();
              onClose();
            } catch (err) {
              console.error('Edit SMS group failed:', err);
              toast.error(err?.message || 'Failed to save changes', { position: 'top-right' });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, errors, touched, setFieldValue, isSubmitting }) => {
            // Listen for prefill
            useEffect(() => {
              const handler = (ev) => {
                const d = ev.detail || {};
                if (d.groupName !== undefined) setFieldValue('groupName', d.groupName, false);
                if (d.contactName !== undefined) setFieldValue('contactName', d.contactName, false);
                if (d.contactNumbers !== undefined) setFieldValue('contactNumbers', d.contactNumbers, false);
                if (d.threshold !== undefined) setFieldValue('threshold', d.threshold, false);
                if (d.zones !== undefined) setFieldValue('zones', d.zones, false);
              };
              window.addEventListener('edit-sms-group-prefill', handler);
              return () => window.removeEventListener('edit-sms-group-prefill', handler);
            }, [setFieldValue]);
            return (
              <FormikForm className="modal-form">
                {optionsError && <div style={{ marginBottom: 8, color: '#b00020' }}>{optionsError}</div>}
                <div className="modal-row">
                  <label>Group Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="groupName"
                    value={values.groupName}
                    maxLength={75}
                    onChange={(e) => setFieldValue('groupName', e.target.value.slice(0,75))}
                    onBlur={(e) => setFieldValue('groupName', (e.target.value||'').trim())}
                    className={touched.groupName && errors.groupName ? 'invalid' : ''}
                  />
                  {touched.groupName && errors.groupName && <div className="field-error">{errors.groupName}</div>}
                </div>
                <div className="modal-row" style={{ marginTop: 8 }}>
                  <label>Contact Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="contactName"
                    value={values.contactName}
                    maxLength={75}
                    onChange={(e) => setFieldValue('contactName', e.target.value.slice(0,75))}
                    onBlur={(e) => setFieldValue('contactName', (e.target.value||'').trim())}
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
                          if (!phoneRegex.test(raw)) { toast.error('Only digits allowed (max 25)', { position: 'top-right'}); return; }
                          if (values.contactNumbers.includes(raw)) { toast.warning('Number already added', { position: 'top-right'}); return; }
                          setFieldValue('contactNumbers', [...values.contactNumbers, raw]);
                          setFieldValue('contactInput','');
                        }}
                        disabled={!values.contactInput?.trim() || !phoneRegex.test(values.contactInput.trim()) || values.contactNumbers.includes(values.contactInput.trim())}
                      >+
                      </button>
                      <button
                        type="button"
                        className="email-remove"
                        onClick={() => {
                          const idx = values._selectedContactIndex ?? -1;
                          if (idx >= 0) {
                            const copy = [...values.contactNumbers]; copy.splice(idx,1);
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
                      {values.contactNumbers.map((c,idx) => (
                        <div
                          key={idx}
                          className={`email-item ${(values._selectedContactIndex ?? -1) === idx ? 'selected' : ''}`}
                          onClick={() => setFieldValue('_selectedContactIndex', (values._selectedContactIndex ?? -1) === idx ? -1 : idx)}
                        >{c}</div>
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
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default EditSMSGroup;
