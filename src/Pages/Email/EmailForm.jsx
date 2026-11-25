import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { showSuccess, showError, showInfo } from "../CommonComponents/Toaster";
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
  const API_BASE = import.meta.env.VITE_API_URL

  // Fetch existing SMTP settings
  const fetchSMTP = async () => {
    try {
      const res = await axios.post(
        `${API_BASE}/settings/email/getSMTP`,
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
        /*toast.info("No SMTP settings found", { 
          position: "top-right",
          autoClose: 3000 
        });*/
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
      toast.error("Failed to load SMTP settings", { 
        position: "top-right",
        autoClose: 3000 
      });
    }
  };

  useEffect(() => {
    if (!token) {
      console.error('Toast error: Missing auth token');
      toast.error("Missing auth token", { 
        position: "top-right",
        autoClose: 3000 
      });
      return;
    }
    fetchSMTP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear field-specific error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
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
      errs.smtpServer = "SMTP server is required";
    } else {
      if (/\s/.test(form.smtpServer)) {
        errs.smtpServer = "SMTP server cannot contain spaces";
      } else if (!(hostnameRegex.test(form.smtpServer) || ipv4Regex.test(form.smtpServer))) {
        errs.smtpServer = "SMTP server is invalid";
      }
    }
    // Port
    if (!form.smtpPort.trim()) {
      errs.smtpPort = "Port is required";
    } else if (!/^\d+$/.test(form.smtpPort)) {
      errs.smtpPort = "Port is invalid";
    } else if (+form.smtpPort <= 0 || +form.smtpPort > 65535) {
      errs.smtpPort = "Port is invalid";
    }
    // Email
    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Email is invalid";
    }
    // Username
    if (!form.username.trim()) {
      errs.username = "Username is required";
    } else if (form.username.trim().length < 3) {
      errs.username = "Username is invalid";
    }
    // Password
    if (!form.password.trim()) {
      errs.password = "Password is required";
    } else if (form.password.length < 6) {
      errs.password = "Password is invalid";
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
    if (m.includes("host") || m.includes("server") || m.includes("smtp")) return "smtpServer";
    if (m.includes("port")) return "smtpPort";
    if (m.includes("email") || m.includes("mail")) return "email";
    if (m.includes("user name") || m.includes("username") || m.includes("user")) return "username";
    if (m.includes("password") || m.includes("auth") || m.includes("credential")) return "password";
    return null;
  };

  // Get specific error message based on field and server response
  const getSpecificErrorMessage = (field, serverMessage = "") => {
    const msg = serverMessage.toLowerCase();
    
    switch (field) {
      case "smtpServer":
        if (msg.includes("timeout") || msg.includes("connect") || msg.includes("unreachable")) {
          return "SMTP server is invalid";
        }
        if (msg.includes("host") || msg.includes("server")) {
          return "SMTP server is invalid";
        }
        return "SMTP server is invalid";
        
      case "smtpPort":
        if (msg.includes("port") || msg.includes("connection")) {
          return "Port is invalid";
        }
        return "Port is invalid";
        
      case "email":
        if (msg.includes("email") || msg.includes("mail")) {
          return "Email is invalid";
        }
        return "Email is invalid";
        
      case "username":
        if (msg.includes("user") || msg.includes("auth")) {
          return "Username is invalid";
        }
        return "Username is invalid";
        
      case "password":
        if (msg.includes("password") || msg.includes("auth") || msg.includes("credential")) {
          return "Password is invalid";
        }
        return "Password is invalid";
        
      default:
        return serverMessage || "Invalid input";
    }
  };

  const saveSMTP = async () => {
    // Save/Update SMTP settings
    setSaving(true);
    try {
      if (!token) {
        toast.error("Missing auth token", { 
          position: "top-right",
          autoClose: 3000 
        });
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
        `${API_BASE}/settings/email/saveSMTP`,
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
        
        const field = mapServerMessageToField(msg || "");
        if (field) {
          // Show field-specific validation error (no toast)
          const specificErrorMsg = getSpecificErrorMessage(field, msg);
          setFieldErrors((prev) => ({ ...prev, [field]: specificErrorMsg }));
        } else {
          // Show toast for general/unknown errors
          if (msg) {
            console.error('Toast error:', msg);
            toast.error(msg, { 
              toastId: 'smtp-save-error',
              position: "top-right",
              autoClose: 5000 
            });
          } else {
            console.error('Toast error: Failed to save SMTP settings');
            toast.error('Failed to save SMTP settings', { 
              toastId: 'smtp-save-error',
              position: "top-right",
              autoClose: 5000 
            });
          }
          setFieldErrors((prev) => ({ ...prev, _global: msg || 'Failed to save SMTP settings' }));
        }
        return; // Do not show popup
      }
      // Success: show success toast
      toast.success("SMTP settings saved successfully!", { 
        position: "top-right",
        autoClose: 3000 
      });
      await fetchSMTP(); // wait for refresh
      setShowTestModal(true);
    } catch (err) {
      console.error(err);
      const emsg = err?.response?.data?.message || err?.message || 'Failed to save SMTP settings';
      const field = mapServerMessageToField(emsg);
      if (field) {
        // Show field-specific validation error (no toast)
        const specificErrorMsg = getSpecificErrorMessage(field, emsg);
        setFieldErrors((prev) => ({ ...prev, [field]: specificErrorMsg }));
      } else {
        // Show toast for general/network errors
        toast.error(emsg, { 
          position: "top-right",
          autoClose: 5000 
        });
        setFieldErrors((prev) => ({ ...prev, _global: emsg }));
      }
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
        `${API_BASE}/settings/email/acknowledgementSMTP`,
        { username: MainUsername, useremail: trimmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const msg = res?.data?.message || "SMTP acknowledgement email successfully";
      console.log('Toast success:', msg);
	 
		  toast.success(msg, { 
			toastId: "smtp-ack",
			position: "top-right",
			autoClose: 3000 
		  });
      setShowTestModal(false);
      setTestEmail("");
    } catch (err) {
      console.error(err);
      const emsg = err?.response?.data?.message || err?.message || "Failed to send acknowledgement email";
      console.error('Toast error:', emsg);
      toast.error(emsg, { 
        toastId: "smtp-test-error",
        position: "top-right",
        autoClose: 5000 
      });
    } finally {
      setSendingTest(false);
    }
  };

  return (
  <div>
    <ToastContainer position="top-right" />
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
