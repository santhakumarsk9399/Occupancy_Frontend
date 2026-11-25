import React, { useState } from "react";
import "./EmailTab.css";
import { ToastContainer, toast } from "react-toastify";

const API_BASE = "http://delbi2dev.deloptanalytics.com:3000";
const tokenVal = sessionStorage.getItem("token"); // token
const vid = sessionStorage.getItem("vid"); // vendor id
const username = sessionStorage.getItem("username"); // username

console.log("Token in sessionStorage:", sessionStorage.getItem("token"));

const SMSForm = () => {
  const [smsUrl, setSmsUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const payload = {
      username: username,
      url: smsUrl,
    };

    try {
      setSubmitting(true);

      // Always read latest token at submit time
      let bearer = sessionStorage.getItem("token") || tokenVal;

      // Call SMS API
      let res = await fetch(`${API_BASE}/settings/sms/SMSUrl`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearer}`,
        },
        body: JSON.stringify(payload),
      });

      // Retry once if unauthorized with a freshly read token
      if (res.status === 401) {
        const newToken = sessionStorage.getItem("token");
        if (newToken && newToken !== bearer) {
          bearer = newToken;
          res = await fetch(`${API_BASE}/settings/sms/SMSUrl`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${bearer}`,
            },
            body: JSON.stringify(payload),
          });
        }
      }

      if (!res.ok) {
        // Try to surface API-provided error message
        let errorMsg = "";
        const ct = res.headers?.get?.("content-type") || "";
        try {
          if (ct.includes("application/json")) {
            const data = await res.json();
            errorMsg = data?.message || data?.error || data?.detail || data?.msg || JSON.stringify(data);
          } else {
            errorMsg = await res.text();
          }
        } catch (_) {
          // Fall through to status text
        }
        if (!errorMsg) errorMsg = res.statusText || `Request failed with ${res.status}`;
        // setMessage(`❌ ${errorMsg}`);
        toast(`❌ ${errorMsg}`, {
                  position: "top-center",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light",
                });
        return;
      }

      // setMessage("✅ Saved successfully.");
           toast("✅ Saved successfully.", {
                  position: "top-center",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light",
                });
    } catch (err) {
      console.error("❌ Failed to save SMS URL", err);
      const msg = err?.message || "Failed to save. Please try again.";
      // setMessage(`❌ ${msg}`);
            toast(`❌ ${msg}`, {
                  position: "top-center",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light",
                });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSmsUrl("");
    setMessage("");
  };

  return (
    <>
       <ToastContainer />
    <div>
  <div className="ms_email-form-bg">
        <form onSubmit={handleSubmit} className="sms_email-form">
          <div className="form-row1">
            <div>
              <label>SMS URL *</label>
              <input
                type="text"
                value={smsUrl}
                onChange={(e) => setSmsUrl(e.target.value)}
                placeholder="Enter SMS URL"
              />
            </div>
          </div>
          {message && (
            <div
              style={{
                marginTop: 8,
                color: message.includes("Failed") ? "#b00020" : "#0a7c0a",
              }}
            >
              {message}
            </div>
          )}
          <div className="form-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm actv" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default SMSForm;
