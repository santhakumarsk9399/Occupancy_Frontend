import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { Formik, Form as FormikForm } from 'formik';
import * as Yup from 'yup';
// import '../../SMS/PopupModal.css';
import './ThresholdForm.css';
import SingleSelectDropdown from '../../CommonComponents/SingleSelectDropdown';

const ThresholdForm = ({ open, onClose, onSave, initialData }) => {
  const [templates, setTemplates] = useState([]); // SMS templates list
  const [tplLoading, setTplLoading] = useState(false); // SMS templates loading state
  const [viewLoading, setViewLoading] = useState(false); // Editing: loading existing threshold details
  const [oldName, setOldName] = useState(''); // Keep original name for edit API
  const [initialValues, setInitialValues] = useState({
    name: '',
    description: '',
    start: '',
    end: '',
    duration: '',
    smsTemplate: ''
  });
  const API_BASE = useMemo(() => import.meta.env.VITE_API_URL || 'http://delbi2dev.deloptanalytics.com:3000', []);

  // Load SMS templates when modal opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const fetchTemplates = async () => {
      setTplLoading(true);
      try {
        const token = sessionStorage.getItem('token');
        if (!token) throw new Error('Missing auth token');
        let res = await fetch(`${API_BASE}/settings/threshold/smsTemplate`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        // Fallback to POST if GET is not supported
        if (!res.ok) {
          const tryPost = await fetch(`${API_BASE}/settings/threshold/smsTemplate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ username: sessionStorage.getItem('username') || 'Occupancy' }),
          });
          res = tryPost;
        }
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || `Failed to load SMS templates (${res.status})`);
        }
        const data = await res.json();
        const nested = Array.isArray(data?.smsTemplate) ? data.smsTemplate : [];
        const flat = nested.flat().filter(Boolean);
        const names = flat.map(it => it?.TemplateName).filter(Boolean);
        // unique preserve order
        const uniq = [...new Set(names)];
        if (!cancelled) setTemplates(uniq);
      } catch (err) {
        console.error('Failed to load SMS templates:', err);
        if (!cancelled) {
          setTemplates([]);
          toast(` ${err?.message || 'Failed to load SMS templates'}`, {
            position: 'top-right',
            autoClose: 3000,
            theme: 'light',
          });
        }
      } finally {
        if (!cancelled) setTplLoading(false);
      }
    };
    fetchTemplates();
    return () => {
      cancelled = true;
    };
  }, [open, API_BASE]);

  // When editing, fetch existing threshold details to hydrate the form fully
  useEffect(() => {
    if (!open || !initialData?.name) return;
    let cancelled = false;
    const loadExisting = async () => {
      try {
        setViewLoading(true);
        setOldName(initialData.name || '');
        const token = sessionStorage.getItem('token');
        const username = sessionStorage.getItem('username') || 'Occupancy';
        if (!token) throw new Error('Missing auth token');
        const res = await fetch(`${API_BASE}/settings/threshold/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username, thresholdname: initialData.name }),
        });
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || `Failed to load threshold (${res.status})`);
        }
        const data = await res.json();
        const item = Array.isArray(data?.thresHold) ? data.thresHold[0] : undefined;
        if (item && !cancelled) {
          setInitialValues(prev => ({
            name: item.threshold ?? prev.name ?? '',
            description: item.description ?? prev.description ?? '',
            start: String(item.startTime ?? prev.start ?? ''),
            end: String(item.endTime ?? prev.end ?? ''),
            duration: String(item.duration ?? prev.duration ?? ''),
            smsTemplate: item.smsTemplateName ?? prev.smsTemplate ?? '',
          }));
        }
      } catch (err) {
        console.error('Failed to view threshold:', err);
        if (!cancelled) {
          toast(` ${err?.message || 'Failed to load existing threshold'}`, {
            position: 'top-right',
            autoClose: 3000,
            theme: 'light',
          });
        }
      } finally {
        if (!cancelled) setViewLoading(false);
      }
    };
    loadExisting();
    return () => { cancelled = true; };
  }, [open, initialData, API_BASE]);

  // Formik + Yup validation schema
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required('Name is required')
      .max(75, 'Max 75 characters')
      .test('not-only-spaces', 'Name cannot be empty or only spaces', v => !!v && v.trim().length > 0),
  description: Yup.string().max(100, 'Max 100 characters').nullable(),
    start: Yup.number()
      .transform(v => (v === '' || v === null ? undefined : Number(v)))
      .typeError('Start must be a number')
      .required('Start is required')
      .min(1, 'Must be > 0'),
    end: Yup.number()
      .transform(v => (v === '' || v === null ? undefined : Number(v)))
      .typeError('End must be a number')
      .required('End is required')
      .min(1, 'Must be > 0')
      .test('gt-start', 'End must be greater than Start', function (value) {
        const { start } = this.parent;
        if (start === undefined || start === null || start === '' || value === undefined || value === null || value === '') return true; // other validators handle empties
        return Number(value) > Number(start);
      }),
    duration: Yup.number().typeError('Duration must be a number').required('Duration is required').min(1, 'Must be > 0'),
    smsTemplate: Yup.string().required('SMS Template is required'),
  });

  // Submit handler integrated with Formik
  const submitForm = async (values, { setSubmitting }) => {
    try {
      if (initialData) {
        // Edit flow
        const token = sessionStorage.getItem('token');
        const username = sessionStorage.getItem('username') || 'Occupancy';
        if (!token) throw new Error('Missing auth token');
        const payload = {
          username,
            Oldthresholdname: String(oldName || initialData.name || ''),
            thresholdname: String(values.name || ''),
            description: String(values.description || ''),
            startTime: String(values.start ?? ''),
            endTime: String(values.end ?? ''),
            duration: String(values.duration ?? ''),
            smstemplate: String(values.smsTemplate || ''),
        };
        const res = await fetch(`${API_BASE}/settings/threshold/edit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          let msg = '';
          const ct = res.headers?.get?.('content-type') || '';
          try {
            if (ct.includes('application/json')) {
              const d = await res.json();
              msg = d?.message || d?.error || d?.detail || JSON.stringify(d);
            } else { msg = await res.text(); }
          } catch (_) { /* ignore */ }
          if (!msg) msg = res.statusText || `Request failed (${res.status})`;
          throw new Error(msg);
        }
        const data = await res.json();
        toast.success(` ${data?.message || 'Threshold updated successfully'}`, { position: 'top-right', autoClose: 3000, theme: 'light' });
        onSave({
          name: String(values.name || ''),
          description: String(values.description || ''),
          start: Number(values.start),
          end: Number(values.end),
          duration: Number(values.duration),
          smsTemplate: String(values.smsTemplate || ''),
        });
        return;
      }
      // Create flow
      const token = sessionStorage.getItem('token');
      const username = sessionStorage.getItem('username') || 'Occupancy';
      if (!token) throw new Error('Missing auth token');
      const payload = {
        username,
        thresholdname: String(values.name || ''),
        description: String(values.description || ''),
        startTime: String(values.start ?? ''),
        endTime: String(values.end ?? ''),
        duration: String(values.duration ?? ''),
        smstemplate: String(values.smsTemplate || ''),
      };
      const res = await fetch(`${API_BASE}/settings/threshold/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let msg = '';
        const ct = res.headers?.get?.('content-type') || '';
        try {
          if (ct.includes('application/json')) { const d = await res.json(); msg = d?.message || d?.error || d?.detail || JSON.stringify(d); }
          else { msg = await res.text(); }
        } catch (_) { /* ignore */ }
        if (!msg) msg = res.statusText || `Request failed (${res.status})`;
        throw new Error(msg);
      }
      const data = await res.json();
      const apiMsg = String(data?.message || '').trim();
      if (/already exists/i.test(apiMsg)) {
        toast.error(apiMsg.replace(/^\s*/u, '') || 'Threshold already exists', { position: 'top-right', autoClose: 3000, theme: 'light' });
        return;
      }
      toast.success(` ${apiMsg || 'Threshold added successfully'}`, { position: 'top-right', autoClose: 3000, theme: 'light' });
      onSave({
        name: String(values.name || ''),
        description: String(values.description || ''),
        start: Number(values.start),
        end: Number(values.end),
        duration: Number(values.duration),
        smsTemplate: String(values.smsTemplate || ''),
      });
    } catch (err) {
      console.error('Threshold save failed:', err);
      toast(` ${err?.message || 'Failed to save threshold'}`, { position: 'top-right', autoClose: 3000, theme: 'light' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  // Close on ESC key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  const content = (
    <div className="popup-overlay" onKeyDown={handleKeyDown} tabIndex={-1}>
      <div className="popup-box threshold-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h3>{initialData ? 'Edit Threshold' : 'Add Threshold'}</h3>
          <button aria-label="Close" className="close-btn" onClick={onClose}>×</button>
        </div>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={submitForm}
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, setFieldTouched, validateField, isSubmitting }) => (
            <FormikForm className="threshold-form-wrapper">
              <div className="popup-body">
                <div className="threshold-form">
                  <div className="form-row">
                    <div style={{ flex: 1 }}>
                      <label>Threshold Name <span className="req">*</span></label>
                      <input
                        name="name"
                        value={values.name}
                        maxLength={75}
                        onChange={(e) => {
                          let v = e.target.value;
                          if (v.length > 75) v = v.slice(0,75);
                          setFieldValue('name', v);
                        }}
                        onBlur={(e) => {
                          // Trim leading/trailing spaces on blur but keep internal spaces
                          const trimmed = (e.target.value || '').trim();
                          setFieldValue('name', trimmed);
                          handleBlur(e);
                        }}
                        className={`form-control ${touched.name && errors.name ? 'is-invalid' : ''}`}
                      />
                      {touched.name && errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Description</label>
                      <input
                        name="description"
                        value={values.description}
                        maxLength={100}
                        onChange={(e) => {
                          let v = e.target.value || '';
                          if (v.length > 100) v = v.slice(0,100);
                          setFieldValue('description', v);
                        }}
                        onBlur={handleBlur}
                        className={`form-control ${touched.description && errors.description ? 'is-invalid' : ''}`}
                      />
                      {touched.description && errors.description && <div className="invalid-feedback d-block">{errors.description}</div>}
                      <div className="d-flex justify-content-between mt-1">
                        <small className="text-muted"></small>
                        <small className="text-muted">{(values.description || '').length}/100</small>
                      </div>
                    </div>
                  </div>
                  <div className="form-row">
                    <div style={{ flex: 1 }}>
                      <label>Threshold Start <span className="req">*</span></label>
                      <input
                        type="number"
                        name="start"
                        value={values.start}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val !== '' && Number(val) <= 0) {
                            setFieldValue('start', '');
                            return;
                          }
                          handleChange(e);
                          const newStart = val;
                          if (values.end !== '' && !isNaN(newStart) && !isNaN(values.end)) {
                            if (Number(values.end) <= Number(newStart)) {
                              setFieldTouched('end', true, false);
                            }
                          }
                        }}
                        onBlur={handleBlur}
                        className={`form-control no-spinner ${touched.start && errors.start ? 'is-invalid' : ''}`}
                      />
                      {touched.start && errors.start && <div className="invalid-feedback d-block">{errors.start}</div>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Threshold End <span className="req">*</span></label>
                      <input
                        type="number"
                        name="end"
                        value={values.end}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val !== '' && Number(val) <= 0) {
                            setFieldValue('end', '');
                            setFieldTouched('end', true, false);
                            validateField('end');
                            return;
                          }
                          handleChange(e);
                          setFieldTouched('end', true, false);
                          validateField('end');
                        }}
                        onBlur={(e)=>{handleBlur(e); validateField('end');}}
                        className={`form-control no-spinner ${touched.end && errors.end ? 'is-invalid' : ''}`}
                      />
                      {touched.end && errors.end && <div className="invalid-feedback d-block">{errors.end}</div>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div style={{ flex: 1 }}>
                      <label>Duration (Seconds) <span className="req">*</span></label>
                      <input
                        type="number"
                        name="duration"
                        value={values.duration}
                        onChange={(e)=>{
                          const val = e.target.value;
                          if (val !== '' && Number(val) <= 0) {
                            setFieldValue('duration','');
                            return;
                          }
                          handleChange(e);
                        }}
                        onBlur={handleBlur}
                        className={`form-control no-spinner ${touched.duration && errors.duration ? 'is-invalid' : ''}`}
                      />
                      {touched.duration && errors.duration && <div className="invalid-feedback d-block">{errors.duration}</div>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div style={{ flex: 1 }}>
                      <label>SMS Template <span className="req">*</span></label>
                      <div className="threshold-email-template-select">
                        <SingleSelectDropdown
                          options={[{ value: "", label: tplLoading ? "Loading…" : "Select" }, ...templates.map(t => ({ value: t, label: t }))]}
                          value={(() => {
                            if (!values.smsTemplate) return null;
                            return { value: values.smsTemplate, label: values.smsTemplate };
                          })()}
                          onChange={(opt) => {
                            const val = opt ? opt.value : "";
                            const synthetic = { target: { name: "smsTemplate", value: val } };
                            handleChange(synthetic);
                          }}
                          // placeholder={tplLoading ? "Loading…" : "Select"}
                          isInvalid={Boolean(touched.smsTemplate && errors.smsTemplate)}
                          usePortal={true}
                          portalZIndex={6000}
                        />
                        {touched.smsTemplate && errors.smsTemplate && <div className="invalid-feedback d-block">{errors.smsTemplate}</div>}
                      </div>
                    </div>
                  </div>
                  {viewLoading && <div className="loading-note">Loading existing threshold…</div>}
                </div>
              </div>
              <div className="popup-footer">
                <button type="button" className="btn btn-primary btn-sm" onClick={onClose} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm actv" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</button>
              </div>
            </FormikForm>
          )}
        </Formik>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default ThresholdForm;
