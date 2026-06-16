import React, { useState, useEffect, useRef } from "react";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CarryForward.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://delbi2dev.deloptanalytics.com:3000";

const CarryForward = () => {
  const [loading, setLoading] = useState(true);
  const apiCalledRef = useRef(false);
  const [initialValues, setInitialValues] = useState({
    countFrom: "00:00",
    countTo: "23:59",
    dailyResetCounts: false,
    openMessage: "",
    closeMessage: "",
    subOpenMessage: "",
    subCloseMessage: "",
  });

  // Validation Schema
  const validationSchema = Yup.object({
    countFrom: Yup.string()
      .required("Count From time is required"),
    countTo: Yup.string()
      .required("Count To time is required")
      .test(
        "time-order",
        "Count To time must be after Count From time",
        function (value) {
          const { countFrom } = this.parent;
          if (!value || !countFrom) return true;
          return countFrom < value;
        }
      ),
    openMessage: Yup.string()
      .required("Open Message is required")
      .max(15, "Open Message must be 15 characters or less")
      .test(
        "no-numbers",
        "Open Message cannot contain numbers",
        (v) => (v ? !/\d/.test(v) : true)
      )
      .test(
        "not-whitespace-only",
        "Open Message cannot be empty or spaces only",
        (v) => (v || "").trim().length > 0
      ),
    closeMessage: Yup.string()
      .required("Close Message is required")
      .max(15, "Close Message must be 15 characters or less")
      .test(
        "no-numbers",
        "Close Message cannot contain numbers",
        (v) => (v ? !/\d/.test(v) : true)
      )
      .test(
        "not-whitespace-only",
        "Close Message cannot be empty or spaces only",
        (v) => (v || "").trim().length > 0
      ),
    subOpenMessage: Yup.string()
      .max(15, "Sub Open Message must be 15 characters or less")
      .test(
        "no-numbers",
        "Sub Open Message cannot contain numbers",
        (v) => (v ? !/\d/.test(v) : true)
      ),
    subCloseMessage: Yup.string()
      .max(15, "Sub Close Message must be 15 characters or less")
      .test(
        "no-numbers",
        "Sub Close Message cannot contain numbers",
        (v) => (v ? !/\d/.test(v) : true)
      ),
    dailyResetCounts: Yup.boolean(),
  });

  // Fetch data from API on component mount
  useEffect(() => {
    if (apiCalledRef.current) return;
    apiCalledRef.current = true;

    const fetchCarryForwardData = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("token");
        const vid = sessionStorage.getItem("vid");

        if (!token) {
          toast.error("Missing authentication token");
          setLoading(false);
          return;
        }

        if (!vid) {
          toast.error("Missing VID from session");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${API_BASE}/countcarry/getData?vid=${vid}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (data?.success && data?.data) {
          const apiData = data.data;
          setInitialValues({
            countFrom: apiData.FromTime || "00:00",
            countTo: apiData.ToTime || "23:59",
            dailyResetCounts: apiData.DailyReset === 0,
            openMessage: apiData.OpenMessage || "",
            closeMessage: apiData.CloseMessage || "",
            subOpenMessage: apiData.SubOpenMessage || "",
            subCloseMessage: apiData.SubCloseMessage || "",
          });
        } else {
          toast.info("No data found");
        }
      } catch (error) {
        console.error("Failed to fetch carry forward data:", error);
        toast.error(error.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchCarryForwardData();
  }, []);

  const handleSave = async (values, { setSubmitting }) => {
    try {
      const token = sessionStorage.getItem("token");
      const vid = sessionStorage.getItem("vid");

      if (!token) {
        toast.error("Missing authentication token");
        setSubmitting(false);
        return;
      }

      if (!vid) {
        toast.error("Missing VID from session");
        setSubmitting(false);
        return;
      }

      const payload = {
        vid: vid,
        fromtime: values.countFrom,
        totime: values.countTo,
        openmessage: values.openMessage,
        subopenmessage: values.subOpenMessage,
        closemessage: values.closeMessage,
        subclosemessage: values.subCloseMessage,
        dailyreset: values.dailyResetCounts ? 0 : 1,
      };

      console.log("Saving with payload:", payload);

      const response = await fetch(
        `${API_BASE}/countcarry/saveMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      console.log("Response status:", response.status);

      const data = await response.json();

      console.log("Response data:", data);

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to save settings");
      }

      const successMsg = data?.message || "Settings saved successfully";
      console.log("Showing success toast:", successMsg);
      toast.success(successMsg, { 
        position: "top-right", 
        autoClose: 3000 
      });
    } catch (error) {
      const errorMsg = error?.message || "Failed to save settings";
      console.log("Showing error toast:", errorMsg);
      toast.error(errorMsg);
      console.error("Save error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="cf-wrapper">
        <div className="cf-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cf-wrapper">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="cf-container">
        <h1 className="cf-title">Live Dashboard Settings</h1>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSave}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting, submitCount }) => {
            const showCountFromError = !!(errors.countFrom && (touched.countFrom || submitCount > 0));
            const showCountToError = !!(errors.countTo && (touched.countTo || submitCount > 0));
            const showOpenMessageError = !!(errors.openMessage && (touched.openMessage || submitCount > 0));
            const showCloseMessageError = !!(errors.closeMessage && (touched.closeMessage || submitCount > 0));
            const showSubOpenMessageError = !!(errors.subOpenMessage && (touched.subOpenMessage || submitCount > 0));
            const showSubCloseMessageError = !!(errors.subCloseMessage && (touched.subCloseMessage || submitCount > 0));

            return (
            <FormikForm className="cf-form">
              <div className="cf-form-content">
                {/* Left Column: Time Section & Checkbox */}
                <div className="cf-column cf-left-column">
                  {/* Time Section */}
                  <div className="cf-section">
                    <h3 className="cf-section-title">Time Settings</h3>
                    
                    <div className="cf-form-row">
                      <label>Count From</label>
                      <input
                        type="time"
                        name="countFrom"
                        value={values.countFrom}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={showCountFromError ? "error" : ""}
                      />
                      {showCountFromError && (
                        <div className="cf-error-message">{errors.countFrom}</div>
                      )}
                    </div>

                    <div className="cf-form-row">
                      <label>Count To</label>
                      <input
                        type="time"
                        name="countTo"
                        value={values.countTo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={showCountToError ? "error" : ""}
                      />
                      {showCountToError && (
                        <div className="cf-error-message">{errors.countTo}</div>
                      )}
                    </div>
                  </div>

                  {/* Checkbox Section */}
                  <div className="cf-section">
                    <h3 className="cf-section-title">Reset Counts</h3>
                    <div className="cf-checkbox-row">
                      <label className="cf-checkbox-label">
                        <input
                          type="checkbox"
                          name="dailyResetCounts"
                          checked={values.dailyResetCounts}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <span>Daily Reset Counts</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column: Messages */}
                <div className="cf-column cf-right-column">
                  <div className="cf-section">
                    <h3 className="cf-section-title">Messages</h3>

                    <div className="cf-form-row">
                      <label>
                        Open Message <span className="cf-required">*</span>
                      </label>
                      <input
                        type="text"
                        name="openMessage"
                        value={values.openMessage}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter open message"
                        className={showOpenMessageError ? "error" : ""}
                      />
                      {showOpenMessageError && (
                        <div className="cf-error-message">{errors.openMessage}</div>
                      )}
                    </div>

                    <div className="cf-form-row">
                      <label>
                        Close Message <span className="cf-required">*</span>
                      </label>
                      <input
                        type="text"
                        name="closeMessage"
                        value={values.closeMessage}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter close message"
                        className={showCloseMessageError ? "error" : ""}
                      />
                      {showCloseMessageError && (
                        <div className="cf-error-message">{errors.closeMessage}</div>
                      )}
                    </div>

                    <div className="cf-form-row">
                      <label>Sub Open Message</label>
                      <input
                        type="text"
                        name="subOpenMessage"
                        value={values.subOpenMessage}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter sub open message"
                        className={showSubOpenMessageError ? "error" : ""}
                      />
                      {showSubOpenMessageError && (
                        <div className="cf-error-message">{errors.subOpenMessage}</div>
                      )}
                    </div>

                    <div className="cf-form-row">
                      <label>Sub Close Message</label>
                      <input
                        type="text"
                        name="subCloseMessage"
                        value={values.subCloseMessage}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter sub close message"
                        className={showSubCloseMessageError ? "error" : ""}
                      />
                      {showSubCloseMessageError && (
                        <div className="cf-error-message">{errors.subCloseMessage}</div>
                      )}
                    </div>

                    <p className="cf-note">
                      Note: Add * in the sub message if you need to show number of
                      people allowed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Save button - Common for both columns */}
              <div className="cf-form-actions">
                <button
                  type="submit"
                  className="cf-save-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
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

export default CarryForward;
