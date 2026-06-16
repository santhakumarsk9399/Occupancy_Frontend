import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "./EmailTab.css";
import PopupModal from "./PopupModal";

const EmailForm = () => {
  const [form, setForm] = useState({
    smtpServer: "",
    smtpPort: "",
    email: "",
    username: "",
    password: "",
    ssl: false,
  });
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [saving, setSaving] = useState(false); // track save in-progress to prevent premature popup perception
  // Inline field errors (client + server) keyed by field name; unknown server errors fallback to _global
  const [fieldErrors, setFieldErrors] = useState({});
  // Hostname (RFC 1035-ish) or IPv4 regex. Each label 1-63 chars, total <=253.
  // Allows letters, digits, hyphens (not starting/ending a label). Also allows IPv4.
  const hostnameRegex = /^(?=.{1,253}$)(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(?:\.(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?))+)$/;
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3})$/;
  const token = sessionStorage.getItem("token");
  const MainUsername = sessionStorage.getItem("username") || "Occupancy";

  // Fetch existing SMTP settings
  const fetchSMTP = async () => {
    try {
      const res = await axios.post(
        "http://delbi2dev.deloptanalytics.com:3000/settings/email/getSMTP",
        { username: MainUsername },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const d = res?.data || {};
      // API returns: { success, message, smtpData: [ { "SMTP server": ..., "SMTP Port": ..., ... } ] }
      const item = Array.isArray(d.smtpData) && d.smtpData.length > 0 ? d.smtpData[0] : null;
      if (!item) {
        console.log('Toast info: No SMTP settings found');
        toast.info("No SMTP settings found");
        return;
      }

      const smtpserver = item["SMTP server"] ?? item.smtpserver ?? item.smtpServer ?? "";
      const port = item["SMTP Port"] ?? item.port ?? item.smtpPort ?? "";
      const email = item["Email"] ?? item.email ?? "";
      const eusername = item["UserName"] ?? item.eusername ?? item.username ?? "";
      const pwd = item["Password"] ?? "";
      const sslVal = item["SSL"] ?? item.ssl ?? false; // may be 0/1 or boolean

      setForm((prev) => ({
        ...prev,
        smtpServer: smtpserver || "",
        smtpPort: port !== undefined && port !== null ? String(port) : "",
        email: email || "",
        username: eusername || "",
        password: typeof pwd === "string" ? pwd : "",
  ssl: typeof sslVal === "number" ? Boolean(sslVal) : Boolean(sslVal),
      }));
    } catch (err) {
      console.error(err);
      console.error('Toast error: Failed to load SMTP settings');
      toast.error("Failed to load SMTP settings");
    }
  };

  useEffect(() => {
    if (!token) {
      console.error('Toast error: Missing auth token');
      toast.error("Missing auth token");
      return;
    }
    fetchSMTP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "smtpPort") {
      let onlyDigits = value.replace(/\D+/g, "");
      if (onlyDigits.length > 5) onlyDigits = onlyDigits.slice(0, 5);
      if (onlyDigits) {
        const num = parseInt(onlyDigits, 10);
        if (num > 65535) {
          onlyDigits = "65535"; // cap
        }
      }
      setForm((prev) => ({ ...prev, smtpPort: onlyDigits }));
      return;
    }
    if (name === "smtpServer") {
      // Disallow spaces and invalid chars (allow letters, digits, hyphen, dot)
      const cleaned = value.replace(/\s+/g, "").replace(/[^a-zA-Z0-9.-]/g, "");
      setForm((prev) => ({ ...prev, smtpServer: cleaned }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    const errs = {};
    // SMTP Server
    if (!form.smtpServer.trim()) {
      errs.smtpServer = "SMTP Server is required";
    } else {
      if (/\s/.test(form.smtpServer)) {
        errs.smtpServer = "SMTP Server cannot contain spaces";
      } else if (!(hostnameRegex.test(form.smtpServer) || ipv4Regex.test(form.smtpServer))) {
        errs.smtpServer = "Invalid SMTP Server format";
      }
    }
    // Port
    if (!form.smtpPort.trim()) {
      errs.smtpPort = "SMTP Port is required";
    } else if (!/^\d+$/.test(form.smtpPort) || +form.smtpPort <= 0 || +form.smtpPort > 65535) {
      errs.smtpPort = "SMTP Port must be 1-65535";
    }
    // Email
    if (!form.email.trim()) {
      errs.email = "Email is required";
      setSaving(false);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Email is invalid";
    }
    // Username
    if (!form.username.trim()) {
      errs.username = "User Name is required";
    }
    // Password
    if (!form.password.trim()) {
      errs.password = "Password is required";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    saveSMTP();
  };

  // Map a server-side message to a specific field (best-effort keyword match)
  const mapServerMessageToField = (msg = "") => {
    const m = msg.toLowerCase();
    if (m.includes("host") || m.includes("server")) return "smtpServer";
    if (m.includes("port")) return "smtpPort";
    if (m.includes("email")) return "email";
    if (m.includes("user name") || m.includes("username") || m.includes("user")) return "username";
    if (m.includes("password") || m.includes("auth")) return "password";
    return null;
  };

  const saveSMTP = async () => {
    // Save/Update SMTP settings
    setSaving(true);
    try {
      if (!token) {
        toast.error("Missing auth token");
        return;
      }
  // Ensure stale popup isn't visible from previous attempt
  setShowTestModal(false);
      const payload = {
        username: MainUsername,
        smtpserver: form.smtpServer.trim(),
        port: Number(form.smtpPort),
        email: form.email.trim(),
        eusername: form.username.trim(),
        euserpwd: form.password,
        ssl: form.ssl,
      };
      const res = await axios.post(
        "http://delbi2dev.deloptanalytics.com:3000/settings/email/saveSMTP",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res?.data || {};
      // Normalize success detection strictly (require explicit success truthy)
      let success = false;
      let msg = '';
      const normalizeBool = (val) => {
        if (typeof val === 'boolean') return val;
        if (typeof val === 'number') return val === 1;
        if (typeof val === 'string') return ['true','1','ok','success'].includes(val.toLowerCase());
        return false;
      };
      if (Object.prototype.hasOwnProperty.call(data,'success')) {
        success = normalizeBool(data.success);
        msg = data.message || '';
      }
      // New API shape: { message:'Invalid credentials', response:{ success:false, message:'SMTP socket error' } }
      if (data.response && Object.prototype.hasOwnProperty.call(data.response,'success')) {
        success = normalizeBool(data.response.success);
        // Prefer inner response message if present
        msg = data.response.message || msg || data.message || '';
      }
      if (!success && data.message && typeof data.message === 'object' && Object.prototype.hasOwnProperty.call(data.message,'success')) {
        success = normalizeBool(data.message.success);
        msg = data.message.message || data.message.error || msg;
      }
      if (!success) {
        // Combine outer + inner messages if distinct
        if (data.message && typeof data.message === 'string' && data.response?.message && data.response.message !== data.message) {
          msg = `${data.message} - ${data.response.message}`;
        }
        // Show error as toast per new requirement
        if (msg) {
          console.error('Toast error:', msg);
          toast.error(msg, { toastId: 'smtp-save-error' });
        } else {
          console.error('Toast error: Failed to save SMTP settings');
          toast.error('Failed to save SMTP settings', { toastId: 'smtp-save-error' });
        }
        const field = mapServerMessageToField(msg || "");
        if (field) {
          setFieldErrors((prev) => ({ ...prev, [field]: msg || 'Failed to save SMTP settings' }));
        } else {
          setFieldErrors((prev) => ({ ...prev, _global: msg || 'Failed to save SMTP settings' }));
        }
        return; // Do not show popup
      }
      // Success: no toast per requirement
      await fetchSMTP(); // wait for refresh
      setShowTestModal(true);
    } catch (err) {
      console.error(err);
      const emsg = err?.response?.data?.message || err?.message || 'Failed to save SMTP settings';
      const field = mapServerMessageToField(emsg);
      if (field) setFieldErrors((prev) => ({ ...prev, [field]: emsg }));
      else setFieldErrors((prev) => ({ ...prev, _global: emsg }));
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    const trimmed = testEmail.trim();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return; // inline validation in popup handles errors
    try {
      setSendingTest(true);
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Missing auth token");
      const res = await axios.post(
        "http://delbi2dev.deloptanalytics.com:3000/settings/email/acknowledgementSMTP",
        { username: MainUsername, useremail: trimmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const msg = res?.data?.message || "SMTP acknowledgement email successfully";
  console.log('Toast success:', msg);
  toast.success(msg, { toastId: "smtp-ack" });
      setShowTestModal(false);
      setTestEmail("");
    } catch (err) {
      console.error(err);
      const emsg = err?.response?.data?.message || err?.message || "Failed to send acknowledgement email";
  console.error('Toast error:', emsg);
  toast.error(emsg, { toastId: emsg });
    } finally {
      setSendingTest(false);
    }
  };

  return (
  <div>
      <div className="email-form-bg">
        <form onSubmit={handleSubmit} className="email-form" noValidate>
          <div className="form-row">
            <div className="col">
              <label>SMTP Server <span className="required">*</span></label>
              <input
                type="text"
                name="smtpServer"
                value={form.smtpServer}
                onChange={updateField}
                className={fieldErrors.smtpServer ? 'input-error' : ''}
              />
              {fieldErrors.smtpServer && <div className="field-error">{fieldErrors.smtpServer}</div>}
            </div>
            <div className="col">
              <label>SMTP Port <span className="required">*</span></label>
              <input
                type="text"
                name="smtpPort"
                inputMode="numeric"
                maxLength={5}
                pattern="^\\d{1,5}$"
                // placeholder="1-65535"
                value={form.smtpPort}
                onChange={updateField}
                className={fieldErrors.smtpPort ? 'input-error' : ''}
              />
              {fieldErrors.smtpPort && <div className="field-error">{fieldErrors.smtpPort}</div>}
            </div>
          </div>
          <div className="form-row">
            <div className="col">
              <label>Email <span className="required">*</span></label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={updateField}
                className={fieldErrors.email ? 'input-error' : ''}
              />
              {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
            </div>
            <div className="col">
              <label>User Name <span className="required">*</span></label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={updateField}
                className={fieldErrors.username ? 'input-error' : ''}
              />
              {fieldErrors.username && <div className="field-error">{fieldErrors.username}</div>}
            </div>
          </div>
          <div className="form-row">
           
            <div className="col">
              <label>Password <span className="required">*</span></label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={updateField}
                className={fieldErrors.password ? 'input-error' : ''}
              />
              {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
            </div>

            <div className="col">
              <div className="ssl-checkbox">
                <input
                  type="checkbox"
                  id="ssl"
                  name="ssl"
                  checked={form.ssl}
                  onChange={updateField}
                />
                <label htmlFor="ssl">Enable SSL</label>
              </div>
            </div>

          </div>
          {fieldErrors._global && <div className="field-error" role="alert">{fieldErrors._global}</div>}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setForm({
                  smtpServer: "",
                  smtpPort: "",
                  email: "",
                  username: "",
                  password: "",
                  ssl: false,
                });
                setFieldErrors({}); // reset all validation messages
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm actv" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
  {/* Toasts are handled by the global ToasterContainer in App.jsx */}
      <PopupModal
        show={showTestModal}
        onClose={() => { if(!sendingTest){ setShowTestModal(false); } }}
        onSubmit={handleSendTestEmail}
        value={testEmail}
        onChange={setTestEmail}
        submitting={sendingTest}
      />
    </div>
  );
};

export default EmailForm;
