import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import '../../SMS/PopupModal.css';
import './ThresholdForm.css';

const ThresholdForm = ({ open, onClose, onSave, initialData }) => {
  const [form, setForm] = useState(initialData || {
    name: '',
    description: '',
    start: '',
    end: '',
    duration: '',
    smsTemplate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [tplLoading, setTplLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [oldName, setOldName] = useState('');
  const API_BASE = useMemo(() => import.meta.env.VITE_API_URL || 'http://delbi2dev.deloptanalytics.com:3000', []);

  // Keep form in sync when switching between add/edit
  useEffect(() => {
    if (open) {
      setForm(initialData || {
        name: '',
        description: '',
        start: '',
        end: '',
        duration: '',
        smsTemplate: ''
      });
    }
  }, [open, initialData]);

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
          toast(`❌ ${err?.message || 'Failed to load SMS templates'}`, {
            position: 'top-center',
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
          setForm(prev => ({
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
          toast(`❌ ${err?.message || 'Failed to load existing threshold'}`, {
            position: 'top-center',
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

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      // If editing, call edit API
      if (initialData) {
        const token = sessionStorage.getItem('token');
        const username = sessionStorage.getItem('username') || 'Occupancy';
        if (!token) throw new Error('Missing auth token');

        const payload = {
          username,
          Oldthresholdname: String(oldName || initialData.name || ''),
          thresholdname: String(form.name || ''),
          description: String(form.description || ''),
          startTime: String(form.start ?? ''),
          endTime: String(form.end ?? ''),
          duration: String(form.duration ?? ''),
          smstemplate: String(form.smsTemplate || ''),
        };

        const res = await fetch(`${API_BASE}/settings/threshold/edit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          let msg = '';
          const ct = res.headers?.get?.('content-type') || '';
          try {
            if (ct.includes('application/json')) {
              const d = await res.json();
              msg = d?.message || d?.error || d?.detail || JSON.stringify(d);
            } else {
              msg = await res.text();
            }
          } catch (_) { /* ignore */ }
          if (!msg) msg = res.statusText || `Request failed (${res.status})`;
          throw new Error(msg);
        }

        const data = await res.json();
        const successMsg = data?.message || 'Threshold updated successfully';
        toast.success(`✅ ${successMsg}`, {
          position: 'top-center',
          autoClose: 3000,
          theme: 'light',
        });

        const normalized = {
          name: String(form.name || ''),
          description: String(form.description || ''),
          start: Number(form.start),
          end: Number(form.end),
          duration: Number(form.duration),
          smsTemplate: String(form.smsTemplate || ''),
        };
        onSave(normalized);
        return;
      }

      const token = sessionStorage.getItem('token');
      const username = sessionStorage.getItem('username') || 'Occupancy';
      if (!token) throw new Error('Missing auth token');

      const payload = {
        username,
        thresholdname: String(form.name || ''),
        description: String(form.description || ''),
        startTime: String(form.start ?? ''),
        endTime: String(form.end ?? ''),
        duration: String(form.duration ?? ''),
        smstemplate: String(form.smsTemplate || ''),
      };

      const res = await fetch(`${API_BASE}/settings/threshold/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = '';
        const ct = res.headers?.get?.('content-type') || '';
        try {
          if (ct.includes('application/json')) {
            const d = await res.json();
            msg = d?.message || d?.error || d?.detail || JSON.stringify(d);
          } else {
            msg = await res.text();
          }
        } catch (_) { /* ignore */ }
        if (!msg) msg = res.statusText || `Request failed (${res.status})`;
        throw new Error(msg);
      }

      const data = await res.json();
      const apiMsg = String(data?.message || '').trim();

      // If API says threshold already exists, show as error and stop
      if (/already exists/i.test(apiMsg)) {
        const errMsg = apiMsg.replace(/^✅\s*/u, '');
        toast.error(errMsg || 'Threshold already exists', {
          position: 'top-center',
          autoClose: 3000,
          theme: 'light',
        });
        return; // Do not proceed to update local list or close form
      }

      const successMsg = apiMsg || 'Threshold added successfully';
      toast.success(`✅ ${successMsg}`, {
        position: 'top-center',
        autoClose: 3000,
        theme: 'light',
      });

      // update parent list with normalized types
      const normalized = {
        name: String(form.name || ''),
        description: String(form.description || ''),
        start: Number(form.start),
        end: Number(form.end),
        duration: Number(form.duration),
        smsTemplate: String(form.smsTemplate || ''),
      };
      onSave(normalized);
    } catch (err) {
      console.error('Failed to create threshold:', err);
      toast(`❌ ${err?.message || 'Failed to create threshold'}`, {
        position: 'top-center',
        autoClose: 3000,
        theme: 'light',
      });
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
    <div className="popup-overlay" onKeyDown={handleKeyDown} tabIndex={-1} onClick={onClose}>
      <div
        className="popup-box threshold-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="popup-header">
          <h3>{initialData ? 'Edit Threshold' : 'Add Threshold'}</h3>
          <button aria-label="Close" className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="popup-body">
          <form onSubmit={handleSubmit} className="threshold-form">
            <div className="form-row">
              <div style={{ flex: 1 }}>
                <label>Threshold Name <span className="req">*</span></label>
                <input
                  name="name"
                  placeholder="Enter name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Description</label>
                <input
                  name="description"
                  placeholder="Optional description"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div style={{ flex: 1 }}>
                <label>Threshold Start <span className="req">*</span></label>
                <input
                  type="number"
                  name="start"
                  placeholder="e.g. 50"
                  value={form.start}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Threshold End <span className="req">*</span></label>
                <input
                  type="number"
                  name="end"
                  placeholder="e.g. 100"
                  value={form.end}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div style={{ flex: 1 }}>
                <label>Duration (Seconds) <span className="req">*</span></label>
                <input
                  type="number"
                  name="duration"
                  placeholder="e.g. 60"
                  value={form.duration}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div style={{ flex: 1 }}>
                <label>SMS Template <span className="req">*</span></label>
                <div className="threshold-email-template-select">
                  <select className="threshold-email-template-dropdown" name="smsTemplate" value={form.smsTemplate} onChange={handleChange} required disabled={tplLoading}>
                    <option value="">{tplLoading ? 'Loading…' : 'Select'}</option>
                    {templates.map((tpl) => (
                      <option key={tpl} value={tpl}>{tpl}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div className="popup-footer">
          <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary btn-sm actv" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default ThresholdForm;
