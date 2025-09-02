import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Form, Row, Col, InputGroup, Tab, Nav, OverlayTrigger, Tooltip } from "react-bootstrap";
import "./ZoneForm.css";
import { FaSearch } from "react-icons/fa";
import "./ServiceAreaModal.css";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MultiSelectDropdown from "../CommonComponents/MultiSelectDropDown";
import "../../Components/Styles/CustomButtons.css";

// Prefer environment variable for API base, fallback to known dev host
const API_BASE = import.meta.env.VITE_API_URL || "http://delbi2dev.deloptanalytics.com:3000";
const ZoneFormModal = ({ show, handleClose, onSave, editingZone, zones: parentZones }) => {
  const RequiredIcon = () => <span style={{ color: "red" }}> *</span>;
  // Reusable info tooltip icon (same style as Users module)
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

  const [entryOptions, setEntryOptions] = useState([]); // [{label, value}]
  const [exitOptions, setExitOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingZone, setLoadingZone] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // { type: 'create'|'edit', payload, values, helpers }
  const [vActive, setVActive] = useState("entry");
  const [vQ, setVQ] = useState("");
  // Always default to Entry tab when validation modal opens
  useEffect(() => {
    if (showValidationModal) {
      setVActive("entry");
      setVQ("");
    }
  }, [showValidationModal]);

  // Client-side check: fetch existing zones and test for a name collision (case-insensitive)
  const zoneNameExists = async (name) => {
    try {
      if (!name) return false;
      // Prefer parent-provided zones list if available (fast, avoids network)
      if (Array.isArray(parentZones)) {
        const lc = String(name).toLowerCase().trim();
        return parentZones.some((z) => String(z?.zoneName || "").toLowerCase().trim() === lc);
      }
      const token = sessionStorage.getItem("token");
      const vid = Number(sessionStorage.getItem("vid")) || 4;
      const res = await fetch(`${API_BASE}/settings/zones/getZones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ vid }),
      });
      if (!res.ok) return false;
      const data = await res.json().catch(() => ({}));
      const nested = Array.isArray(data?.zones) ? data.zones : [];
      const flat = nested.flat().filter(Boolean);
      const lc = String(name).toLowerCase().trim();
      return flat.some((item) => {
        const z = String(item?.["Zone(s)name"] || item?.zoneName || "").toLowerCase().trim();
        return z && z === lc;
      });
    } catch (err) {
      // On failure, be conservative and allow API to handle duplicates
      return false;
    }
  };

  // Build default initial values from editingZone/basic props
  const buildInitial = (src = {}) => ({
    zoneName: src?.zoneName || "",
    country: src?.country || "",
    city: src?.city || "",
    threshold: src?.threshold || "",
    capacity: src?.capacity || "",
  serviceAreaEntry: Array.isArray(src?.serviceAreaEntry)
      ? src.serviceAreaEntry
      : (typeof src?.serviceAreaEntry === "string" && src?.serviceAreaEntry)
        ? String(src.serviceAreaEntry)
            .split(",")
            .map((s) => {
              const str = String(s).trim();
        return { label: str, value: str };
            })
        : [],
  serviceAreaExit: Array.isArray(src?.serviceAreaExit)
      ? src.serviceAreaExit
      : (typeof src?.serviceAreaExit === "string" && src?.serviceAreaExit)
        ? String(src.serviceAreaExit)
            .split(",")
            .map((s) => {
              const str = String(s).trim();
        return { label: str, value: str };
            })
        : [],
    remarks: src?.remarks || "",
  });

  const [initialValuesState, setInitialValuesState] = useState(buildInitial(editingZone));

  // When modal opens, fetch available entry/exit once
  useEffect(() => {
    let cancelled = false;
    const fetchOptions = async () => {
      if (!show) return; // only when visible
      setLoadingOptions(true);
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(`${API_BASE}/settings/zones/getAvailableEntryExit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({}), // empty body per API contract
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Failed to load service areas (${res.status})`);
        }
        const data = await res.json();
        // Shape: { success, availableEntry: [[{ ServiceAreaEntry }]], availableExit: [[{ ServiceAreaExit }]] }
        const entryNested = Array.isArray(data?.availableEntry) ? data.availableEntry : [];
        const exitNested = Array.isArray(data?.availableExit) ? data.availableExit : [];
        // API can return different property names; try multiple keys
        const extractValue = (o) => {
          if (!o) return "";
          return (
            o.ServiceAreaEntry ??
            o.ServiceAreaExit ??
            o.ServiceAreaAvailableEntry ??
            o.ServiceAreaAvailableExit ??
            ""
          );
        };
        const entries = entryNested.flat().filter(Boolean).map((o) => String(extractValue(o)));
        const exits = exitNested.flat().filter(Boolean).map((o) => String(extractValue(o)));
        const toOptions = (arr) =>
          Array.from(new Set(arr.filter(Boolean))).map((s) => {
            const str = String(s);
            return { label: str, value: str };
          });
        if (!cancelled) {
          setEntryOptions(toOptions(entries));
          setExitOptions(toOptions(exits));
        }
      } catch (err) {
    console.error("Failed to load service area options:", err);
  if (!cancelled) toast.error(err?.message || "Failed to load service areas", { position: "top-right" });
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    };
    fetchOptions();
    return () => {
      cancelled = true;
    };
  }, [show]);

  // When editing, fetch full zone details to prefill (getZone)
  useEffect(() => {
    let cancelled = false;
    const loadZone = async () => {
      if (!show || !editingZone?.zoneName) return;
      setLoadingZone(true);
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(`${API_BASE}/settings/zones/getZone`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ zonename: editingZone.zoneName }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.success === false) {
          const msg = data?.message || `Failed to load zone (${res.status})`;
          throw new Error(msg);
        }
        const meta = Array.isArray(data?.metaData) && data.metaData[0] ? data.metaData[0] : {};
  const mappedEntry = Array.isArray(data?.mappedEntry) ? data.mappedEntry : [];
  const mappedExit = Array.isArray(data?.mappedExit) ? data.mappedExit : [];
  const availEntryFromZone = Array.isArray(data?.availableEntry) ? data.availableEntry : [];
  const availExitFromZone = Array.isArray(data?.availableExit) ? data.availableExit : [];
        const entryArr = mappedEntry
          .map((o) => String(o?.ServiceAreaMappedEntry || "").trim())
          .filter(Boolean);
        const exitArr = mappedExit
          .map((o) => String(o?.ServiceAreaMappedExit || "").trim())
          .filter(Boolean);
        // Some APIs may provide "available" lists along with mapped
        const availEntryArr = availEntryFromZone
          .map((o) => String(o?.ServiceAreaAvailableEntry || "").trim())
          .filter(Boolean);
        const availExitArr = availExitFromZone
          .map((o) => String(o?.ServiceAreaAvailableExit || "").trim())
          .filter(Boolean);
        const toLV = (arr) =>
          arr.map((s) => {
            const str = String(s);
            return { label: str, value: str };
          });
        const dedupeByValue = (opts) => {
          const seen = new Set();
          return opts.filter((o) => {
            const k = o.value;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
        };

        // Build comprehensive option lists (existing options + mapped + available)
        const entryOptionValues = [
          ...((entryOptions || []).map((o) => o.value)),
          ...entryArr,
          ...availEntryArr,
        ];
        const exitOptionValues = [
          ...((exitOptions || []).map((o) => o.value)),
          ...exitArr,
          ...availExitArr,
        ];
        const newEntryOptions = dedupeByValue(toLV(entryOptionValues));
        const newExitOptions = dedupeByValue(toLV(exitOptionValues));

        // For each mapped area (without '?'), try to find an option with matching prefix to include unique id in value
        const pickWithUnique = (area, options) => {
          const areaStr = String(area);
          const byExact = options.find((opt) => String(opt.value) === areaStr);
          if (byExact) return byExact;
          const byPrefix = options.find((opt) => String(opt.value).split("?")[0] === areaStr);
          return byPrefix || { label: areaStr, value: areaStr };
        };
        const selectedEntry = entryArr.map((a) => pickWithUnique(a, newEntryOptions));
        const selectedExit = exitArr.map((a) => pickWithUnique(a, newExitOptions));

        const newInit = buildInitial({
          zoneName: meta?.ZoneName || editingZone.zoneName,
          country: meta?.Country || editingZone?.country || "",
          city: meta?.City || editingZone?.city || "",
          threshold: meta?.Threshold ?? editingZone?.threshold ?? "",
          capacity: meta?.Capacity ?? editingZone?.capacity ?? "",
          serviceAreaEntry: selectedEntry,
          serviceAreaExit: selectedExit,
          remarks: editingZone?.remarks || "",
        });
        if (!cancelled) {
          setInitialValuesState(newInit);
          setEntryOptions(newEntryOptions);
          setExitOptions(newExitOptions);
        }
      } catch (err) {
  console.error("Failed to load zone details:", err);
  if (!cancelled) toast.error(err?.message || "Failed to load zone details", { position: "top-right" });
        // Still set defaults based on editingZone
        if (!cancelled) setInitialValuesState(buildInitial(editingZone));
      } finally {
        if (!cancelled) setLoadingZone(false);
      }
    };
    loadZone();
    return () => {
      cancelled = true;
    };
  }, [show, editingZone?.zoneName]);

  // Reset initial values baseline whenever opening or target zone changes
  useEffect(() => {
    if (!show) return;
    setInitialValuesState(buildInitial(editingZone));
  }, [show, editingZone?.zoneName]);

  const initialValues = initialValuesState;

  const validationSchema = Yup.object().shape({
    zoneName: Yup.string()
      .max(75, "Max 75 characters")
      .matches(/^[^\s]+$/, "No spaces allowed")
      .required("Zone Name is required"),
    country: Yup.string().required("Country is required"),
    city: Yup.string().required("City is required"),
    threshold: Yup.number()
      .typeError("Threshold must be a number")
      .required("Threshold is required")
      .min(1, "Must be between 1 and 100")
      .max(100, "Must be between 1 and 100"),
    capacity: Yup.number()
      .typeError("Capacity must be a number")
      .required("Capacity is required")
      .min(0, "Must be greater than or equal to 0"),
    serviceAreaEntry: Yup.array().min(1, "Service Area Entry is required"),
    serviceAreaExit: Yup.array().min(1, "Service Area Exit is required"),
  });

  return (
  <>
    <Modal show={show} onHide={handleClose} centered backdrop="static" size="lg" className="zone-form">
      <Formik
        key={show ? (editingZone?.zoneName || "add") : "hidden"}
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
  onSubmit={async (values, { resetForm, setSubmitting }) => {
          // shared helpers and payload building
          const token = sessionStorage.getItem("token");
          const vid = Number(sessionStorage.getItem("vid")) || 4;
          const username = sessionStorage.getItem("username") || "Occupancy";
          const parseSelections = (arr) => {
            const result = { areas: [], uniques: [] };
            for (const item of arr || []) {
              const raw = item?.value ?? item; // tolerate string or {label,value}
              const str = String(raw ?? "");
              if (!str) continue;
              const [area, uniq] = str.split("?");
              if (area) result.areas.push(area.trim());
              if (uniq) result.uniques.push(uniq.trim());
            }
            return result;
          };
          const entryParsed = parseSelections(values.serviceAreaEntry);
          const exitParsed = parseSelections(values.serviceAreaExit);
          const entryAreas = entryParsed.areas;
          const exitAreas = exitParsed.areas;
          // send separate unique id lists for entry and exit (API expects sentryuniqueid & sexituniqueid)
          const sentryuniqueid = entryParsed.uniques.filter(Boolean).join(",");
          const sexituniqueid = exitParsed.uniques.filter(Boolean).join(",");

          // Validation payload expects separate sentry/sexit unique ids
          const validationPayload = {
            vid,
            username,
            zonename: values.zoneName,
            country: values.country,
            city: values.city,
            threshold: Number(values.threshold),
            capacity: Number(values.capacity),
            remarks: values.remarks || "",
            serviceareaentry: entryAreas.join(","),
            sentryuniqueid: entryParsed.uniques.join(","),
            serviceareaexit: exitAreas.join(","),
            sexituniqueid: exitParsed.uniques.join(","),
          };

          // call validation API first
          try {
            const vres = await fetch(`${API_BASE}/settings/zones/validationZone`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify(validationPayload),
            });
            const vdata = await vres.json().catch(() => ({}));
            // if any mapped flags exist, show confirmation modal with details
            const hasMapped = !!(vdata?.mappedLineEntryFlag || vdata?.mappedLineExitFlag);
            if (hasMapped) {
              // store pending action and validation results, and show modal
              setValidationData(vdata);
              setPendingAction({ type: editingZone ? "edit" : "create", values, entryAreas, exitAreas, sentryuniqueid, sexituniqueid, helpers: { resetForm, setSubmitting } });
              // stop submitting; wait for user confirmation
              setShowValidationModal(true);
              setSubmitting(false);
              return;
            }
          } catch (err) {
            // validation failed but let user proceed if they want; show toast and continue
            console.error("Validation API failed:", err);
            toast.error(err?.message || "Validation check failed", { position: "top-right" });
          }

          // no mapping detected or validation errored: proceed with original create/edit flow
          // If editing, call editZone API
          if (editingZone) {
            try {
              // If the user changed the name to one that already exists (and it's not the same as original), block
              const nameChanged = String(values.zoneName || "").toLowerCase().trim() !== String(editingZone.zoneName || "").toLowerCase().trim();
              if (nameChanged) {
                const exists = await zoneNameExists(values.zoneName);
                if (exists) {
                  toast.error("Zone name already exists", { position: "top-right" });
                  setSubmitting(false);
                  return;
                }
              }
              setSubmitting(true);
              const editPayload = {
                vid,
                username,
                Oldzonename: editingZone.zoneName,
                Newzonename: values.zoneName,
                country: values.country,
                city: values.city,
                threshold: Number(values.threshold),
                capacity: Number(values.capacity),
                remarks: values.remarks || "",
                serviceareaentry: entryAreas.join(","),
                serviceareaexit: exitAreas.join(","),
                sentryuniqueid: entryParsed.uniques.join(","),
                sexituniqueid: exitParsed.uniques.join(","),
              };
              const res = await fetch(`${API_BASE}/settings/zones/editZone`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(editPayload),
              });
              const data = await res.json().catch(() => ({}));
              // Normalize message and treat any 'exist' text as an error (API sometimes returns success: true with a message)
              const serverMsg = String(data?.message || data?.Message || data?.msg || "");
              if (serverMsg && /exist/i.test(serverMsg)) {
                toast.error(serverMsg || "Zone already exists", { position: "top-right" });
                setSubmitting(false);
                return;
              }
              if (!res.ok || data?.success === false) {
                const msg = data?.message || `Failed to update zone (${res.status})`;
                throw new Error(msg);
              }
              toast.success(data?.message || "Zone updated successfully", { position: "top-right" });
              onSave({
                zoneName: values.zoneName,
                country: values.country,
                city: values.city,
                serviceAreaEntry: entryAreas.join(","),
                serviceAreaExit: exitAreas.join(","),
                threshold: Number(values.threshold),
                capacity: Number(values.capacity),
                remarks: values.remarks || "",
              });
              resetForm();
              handleClose();
              return;
            } catch (err) {
              toast.error(err?.message || "Failed to update zone", { position: "top-right" });
              setSubmitting(false);
              return;
            }
          }

          try {
            // Use createZone API for adding
            // Prevent creating if zone name already exists
            const exists = await zoneNameExists(values.zoneName);
            if (exists) {
              toast.error("Zone name already exists", { position: "top-right" });
              setSubmitting(false);
              return;
            }
            setSubmitting(true);
            const payload = {
              vid,
              username,
              zonename: values.zoneName,
              country: values.country,
              city: values.city,
              threshold: Number(values.threshold),
              capacity: Number(values.capacity),
              remarks: values.remarks || "",
              serviceareaentry: entryAreas.join(","),
              serviceareaexit: exitAreas.join(","),
              sentryuniqueid: entryParsed.uniques.join(","),
              sexituniqueid: exitParsed.uniques.join(","),
            };
            const res = await fetch(`${API_BASE}/settings/zones/createZone`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            // Normalize message and treat any 'exist' text as an error
            const serverMsg = String(data?.message || data?.Message || data?.msg || "");
            if (serverMsg && /exist/i.test(serverMsg)) {
              toast.error(serverMsg || "Zone already exists", { position: "top-right" });
              setSubmitting(false);
              return;
            }
            if (!res.ok || data?.success === false) {
              const msg = data?.message || `Failed to add zone (${res.status})`;
              throw new Error(msg);
            }
            toast.success(data?.message || "Zone created successfully", { position: "top-right" });
            // Optimistic add in parent list
            onSave({
              zoneName: values.zoneName,
              country: values.country,
              city: values.city,
              serviceAreaEntry: entryAreas.join(","),
              serviceAreaExit: exitAreas.join(","),
              threshold: Number(values.threshold),
              capacity: Number(values.capacity),
              remarks: values.remarks || "",
            });
            resetForm();
            handleClose();
          } catch (err) {
            toast.error(err?.message || "Failed to save zone", { position: "top-right" });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
          isSubmitting,
        }) => (
          <FormikForm noValidate onSubmit={handleSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>{editingZone ? "Edit Zone" : "Add Zone"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {loadingZone && (
                <div className="m-3 text-muted">Loading zone details...</div>
              )}
              {/* Details */}
              <h6 className=" ">Details</h6>
              <Row>
                <Form.Group as={Col} className="mb-3">
                  <Form.Label>
                    Zone Name <RequiredIcon />
                    <InfoTooltip id="tt-zone-name">
                      <div>
                        • Zone name should contain maximum 75 characters. 
                        <br />• It should not accept spaces.
                      </div>
                    </InfoTooltip>
                  </Form.Label>
                  <Form.Control
                    name="zoneName"
                    value={values.zoneName}
                    maxLength={75}
                    onChange={(e) => {
                      // Strip all whitespace characters and enforce 75 char limit
                      const cleaned = e.target.value.replace(/\s+/g, "").slice(0, 75);
                      e.target.value = cleaned;
                      handleChange(e);
                    }}
                    onBlur={(e) => {
                      // Final sanitize on blur
                      const cleaned = (e.target.value || "").replace(/\s+/g, "").slice(0, 75);
                      if (cleaned !== e.target.value) {
                        e.target.value = cleaned;
                        handleChange(e);
                      }
                      handleBlur(e);
                    }}
                    isInvalid={touched.zoneName && !!errors.zoneName}
                    style={{ wordBreak: 'break-word' }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.zoneName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>

              {/* Address */}
              <h6 className=" ">Address</h6>
              <Row>
                <Form.Group as={Col} className="mb-3">
                  <Form.Label>
                    Country <RequiredIcon />
                  </Form.Label>
                  <Form.Control
                    name="country"
                    value={values.country}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.country && !!errors.country}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.country}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} className="mb-3">
                  <Form.Label>
                    City <RequiredIcon />
                  </Form.Label>
                  <Form.Control
                    name="city"
                    value={values.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.city && !!errors.city}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.city}
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
              {/* Threshold */}
              <h6 className=" ">Threshold</h6>
              <Row>
                <Form.Group as={Col} className="mb-3">
                  <Form.Label>
                    Threshold <RequiredIcon />
                    <InfoTooltip id="tt-threshold">
                      <div>
                        • Allowed range 1 - 100
                        {/* <br />• No spinner controls */}
                      </div>
                    </InfoTooltip>
                  </Form.Label>
                  <InputGroup className="thresper-input">
                    <Form.Control
                      name="threshold"
                      type="number"
                      min={1}
                      max={100}
                      value={values.threshold}
                      onChange={(e) => {
                        let v = e.target.value.replace(/[^0-9]/g, '');
                        if (v) {
                          let num = Math.min(100, Math.max(1, Number(v)));
                          e.target.value = String(num);
                        }
                        handleChange(e);
                      }}
                      onBlur={(e) => {
                        let num = Number(e.target.value);
                        if (Number.isNaN(num) || num < 1) num = 1;
                        if (num > 100) num = 100;
                        if (String(num) !== e.target.value) {
                          e.target.value = String(num);
                          handleChange(e);
                        }
                        handleBlur(e);
                      }}
                      className="no-spinner"
                      isInvalid={touched.threshold && !!errors.threshold}
                    />
                    <InputGroup.Text>%</InputGroup.Text>
                    <Form.Control.Feedback type="invalid">
                      {errors.threshold}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group as={Col} className="mb-3">
                  <Form.Label>
                    Capacity <RequiredIcon />
                    <InfoTooltip id="tt-capacity">
                      <div>
                        • Must be a number &gt;= 0
                        {/* <br />• Spinner hidden */}
                      </div>
                    </InfoTooltip>
                  </Form.Label>
                  <Form.Control
                    name="capacity"
                    type="number"
                    min={0}
                    value={values.capacity}
                    onChange={(e) => {
                      let v = e.target.value.replace(/[^0-9]/g, '');
                      if (v) {
                        let num = Math.max(0, Number(v));
                        e.target.value = String(num);
                      }
                      handleChange(e);
                    }}
                    onBlur={(e) => {
                      let num = Number(e.target.value);
                      if (Number.isNaN(num) || num < 0) num = 0;
                      if (String(num) !== e.target.value) {
                        e.target.value = String(num);
                        handleChange(e);
                      }
                      handleBlur(e);
                    }}
                    className="no-spinner"
                    isInvalid={touched.capacity && !!errors.capacity}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.capacity}
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
              {/* Service Area */}
              <h6 className=" ">Service Area</h6>
              <Row>
                <Form.Group as={Col} className="mb-3">
                  <Form.Label>
                    Service Area Entry <RequiredIcon />
                  </Form.Label>
                  <MultiSelectDropdown
                    options={entryOptions}
                    value={values.serviceAreaEntry}
                    onChange={(val) => setFieldValue("serviceAreaEntry", val)}
                    placeholder={loadingOptions ? "Loading..." : "Select Service Area Entry"}
                    isInvalid={touched.serviceAreaEntry && !!errors.serviceAreaEntry}
                    error={errors.serviceAreaEntry}
                  />
                </Form.Group>
                <Form.Group as={Col} className="mb-3">
                  <Form.Label>
                    Service Area Exit <RequiredIcon />
                  </Form.Label>
                  <MultiSelectDropdown
                    options={exitOptions}
                    value={values.serviceAreaExit}
                    onChange={(val) => setFieldValue("serviceAreaExit", val)}
                    placeholder={loadingOptions ? "Loading..." : "Select Service Area Exit"}
                    isInvalid={touched.serviceAreaExit && !!errors.serviceAreaExit}
                    error={errors.serviceAreaExit}
                  />
                </Form.Group>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Remarks</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="remarks"
                  value={values.remarks}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-center">
              <Button
                className="btn btn-primary btn-sm"
                variant="secondary"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button className="btn btn-primary btn-sm actv" type="submit" variant="primary" disabled={isSubmitting}>
                Save
              </Button>
            </Modal.Footer>
          </FormikForm>
        )}
      </Formik>
    </Modal>
    {/* Confirmation modal for mapped entries/exits - styled like Service Area view */}
    <Modal show={showValidationModal} onHide={() => { setShowValidationModal(false); setPendingAction(null); }} centered backdrop="static" size="xl">
      <div className="sa-modal">
        <div className="sa-header">
          <div className="sa-zone">The line(s) are mapped with the another zone</div>
          <button className="sa-close" aria-label="Close" onClick={() => { setShowValidationModal(false); setPendingAction(null); }}>×</button>
        </div>

        <div className="sa-tabs">
          <Tab.Container activeKey={vActive} onSelect={(k) => { setVQ(""); setVActive(k || "entry"); }}>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="entry">Mapped Entry</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="exit">Mapped Exit</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content className="sa-content">
              <Tab.Pane eventKey="entry">
                <div className="sa-topline">
                  <div className="sa-section-title">Mapped Entry</div>
                  <div className="sa-count">Total: {(validationData?.mappedEntry || []).length}</div>
                </div>
                <div className="sa-search">
                  <FaSearch className="sa-search-icon" />
                  <input type="text" placeholder="Search" value={vQ} onChange={(e) => setVQ(e.target.value)} />
                </div>
                <div className="sa-list">
                  <div className="sa-list-head">MAPPED ENTRY</div>
                  <div className="sa-list-body">
                    {((validationData?.mappedEntry || []).filter((m) => String(m?.ServiceAreaEntry || "").toLowerCase().includes(vQ.toLowerCase())).map((m, idx) => (
                      <div key={`me-${idx}`} className="sa-row">{m.ServiceAreaEntry}</div>
                    ))) || <div className="sa-empty">No mapped entries</div>}
                  </div>
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="exit">
                <div className="sa-topline">
                  <div className="sa-section-title">Mapped Exit</div>
                  <div className="sa-count">Total: {(validationData?.mappedExit || []).length}</div>
                </div>
                <div className="sa-search">
                  <FaSearch className="sa-search-icon" />
                  <input type="text" placeholder="Search" value={vQ} onChange={(e) => setVQ(e.target.value)} />
                </div>
                <div className="sa-list">
                  <div className="sa-list-head">MAPPED EXIT</div>
                  <div className="sa-list-body">
                    {((validationData?.mappedExit || []).filter((m) => String(m?.ServiceAreaExit || "").toLowerCase().includes(vQ.toLowerCase())).map((m, idx) => (
                      <div key={`mx-${idx}`} className="sa-row">{m.ServiceAreaExit}</div>
                    ))) || <div className="sa-empty">No mapped exits</div>}
                  </div>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
  <div className="sa-continue-question">Do you want to continue?</div>

        <div className="reset-footer" style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
          <Button className="btn-soft-outline" variant="secondary" onClick={() => { setShowValidationModal(false); setPendingAction(null); }}>
            Cancel
          </Button>
          <Button className="btn-primary-gradient" onClick={async () => {
            // proceed with pending action
            setShowValidationModal(false);
            const act = pendingAction;
            if (!act) return;
            const { type, values, entryAreas, exitAreas, sentryuniqueid, sexituniqueid, helpers } = act;
            const token = sessionStorage.getItem("token");
            const vid = Number(sessionStorage.getItem("vid")) || 4;
            const username = sessionStorage.getItem("username") || "Occupancy";
            try {
              if (type === "edit") {
                // If name changed, check uniqueness client-side before proceeding
                const nameChanged = String(values.zoneName || "").toLowerCase().trim() !== String(editingZone.zoneName || "").toLowerCase().trim();
                if (nameChanged) {
                  const exists = await zoneNameExists(values.zoneName);
                  if (exists) {
                    toast.error("Zone name already exists", { position: "top-right" });
                    return;
                  }
                }
                helpers.setSubmitting(true);
                const editPayload = {
                  vid,
                  username,
                  Oldzonename: editingZone.zoneName,
                  Newzonename: values.zoneName,
                  country: values.country,
                  city: values.city,
                  threshold: Number(values.threshold),
                  capacity: Number(values.capacity),
                  remarks: values.remarks || "",
                  serviceareaentry: entryAreas.join(","),
                  serviceareaexit: exitAreas.join(","),
                  sentryuniqueid: sentryuniqueid || (entryAreas.join(",")),
                  sexituniqueid: sexituniqueid || (exitAreas.join(",")),
                };
                const res = await fetch(`${API_BASE}/settings/zones/editZone`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                  body: JSON.stringify(editPayload),
                });
                const data = await res.json().catch(() => ({}));
                const serverMsg = String(data?.message || data?.Message || data?.msg || "");
                if (serverMsg && /exist/i.test(serverMsg)) {
                  toast.error(serverMsg || "Zone already exists", { position: "top-right" });
                  helpers.setSubmitting(false);
                  return;
                }
                if (!res.ok || data?.success === false) {
                  const msg = data?.message || `Failed to update zone (${res.status})`;
                  throw new Error(msg);
                }
                toast.success(data?.message || "Zone updated successfully", { position: "top-right" });
                onSave({
                  zoneName: values.zoneName,
                  country: values.country,
                  city: values.city,
                  serviceAreaEntry: entryAreas.join(","),
                  serviceAreaExit: exitAreas.join(","),
                  threshold: Number(values.threshold),
                  capacity: Number(values.capacity),
                  remarks: values.remarks || "",
                });
                helpers.resetForm();
                handleClose();
                helpers.setSubmitting(false);
                setPendingAction(null);
                return;
              }

              if (type === "create") {
                // For create, block if name already exists
                const exists = await zoneNameExists(values.zoneName);
                if (exists) {
                  toast.error("Zone name already exists", { position: "top-right" });
                  return;
                }
                helpers.setSubmitting(true);
                const payload = {
                  vid,
                  username,
                  zonename: values.zoneName,
                  country: values.country,
                  city: values.city,
                  threshold: Number(values.threshold),
                  capacity: Number(values.capacity),
                  remarks: values.remarks || "",
                  serviceareaentry: entryAreas.join(","),
                  serviceareaexit: exitAreas.join(","),
                  sentryuniqueid: sentryuniqueid || (entryAreas.join(",")),
                  sexituniqueid: sexituniqueid || (exitAreas.join(",")),
                };
                const res = await fetch(`${API_BASE}/settings/zones/createZone`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                  body: JSON.stringify(payload),
                });
                const data = await res.json().catch(() => ({}));
                const serverMsg = String(data?.message || data?.Message || data?.msg || "");
                if (serverMsg && /exist/i.test(serverMsg)) {
                  toast.error(serverMsg || "Zone already exists", { position: "top-right" });
                  helpers.setSubmitting(false);
                  return;
                }
                if (!res.ok || data?.success === false) {
                  const msg = data?.message || `Failed to add zone (${res.status})`;
                  throw new Error(msg);
                }
                toast.success(data?.message || "Zone created successfully", { position: "top-right" });
                onSave({
                  zoneName: values.zoneName,
                  country: values.country,
                  city: values.city,
                  serviceAreaEntry: entryAreas.join(","),
                  serviceAreaExit: exitAreas.join(","),
                  threshold: Number(values.threshold),
                  capacity: Number(values.capacity),
                  remarks: values.remarks || "",
                });
                helpers.resetForm();
                handleClose();
                helpers.setSubmitting(false);
                setPendingAction(null);
                return;
              }
            } catch (err) {
              toast.error(err?.message || "Failed to perform action", { position: "top-right" });
              if (act?.helpers?.setSubmitting) act.helpers.setSubmitting(false);
            }
          }}>
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  </>
  );
};

export default ZoneFormModal;
