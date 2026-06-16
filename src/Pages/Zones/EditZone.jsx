import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, InputGroup, OverlayTrigger, Tooltip, Tab, Nav } from "react-bootstrap";
import "./ZoneForm.css";
import "./ServiceAreaModal.css"; // reuse styling from Add zone validation popup
import { FaSearch } from "react-icons/fa";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MultiSelectDropdown from "../CommonComponents/MultiSelectDropDown";
import "../../Components/Styles/CustomButtons.css";

// Prefer environment variable for API base, fallback to known dev host
const API_BASE = import.meta.env.VITE_API_URL || "http://delbi2dev.deloptanalytics.com:3000";

const EditZone = ({ show, handleClose, onSave, editingZone }) => {
  const RequiredIcon = () => <span style={{ color: "red" }}> *</span>;
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

  const [entryOptions, setEntryOptions] = useState([]);
  const [exitOptions, setExitOptions] = useState([]);
  // Keep mapping from visible name (before '?') -> unique id (after '?')
  const [entryUniqueMap, setEntryUniqueMap] = useState({});
  const [exitUniqueMap, setExitUniqueMap] = useState({});
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingZone, setLoadingZone] = useState(false);
  // Validation popup state (mirror logic from AddZones for consistency)
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationData, setValidationData] = useState(null); // holds mapped entries/exits from validation API
  const [pendingAction, setPendingAction] = useState(null); // { values, entryAreas, exitAreas, sentryuniqueid, sexituniqueid, resetForm, setSubmitting }
  const [vActive, setVActive] = useState("entry");
  const [vQ, setVQ] = useState("");
  // Track original service areas to compare for changes
  const [originalServiceAreas, setOriginalServiceAreas] = useState({
    entry: [],
    exit: []
  });

  // Always reset validation modal tabs/search when opened
  useEffect(() => {
    if (showValidationModal) {
      setVActive("entry");
      setVQ("");
    }
  }, [showValidationModal]);

  const buildInitial = (src = {}) => ({
    zoneName: src?.zoneName || "",
    country: src?.country || "",
    city: src?.city || "",
    threshold: src?.threshold || "",
    capacity: src?.capacity || "",
  // Start / End time (0-23) support
  starttime: (src?.starttime ?? src?.Stime ?? src?.stime ?? ""),
  endtime: (src?.endtime ?? src?.Etime ?? src?.etime ?? ""),
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

  // Load available entry/exit when modal opens
  useEffect(() => {
    let cancelled = false;
    const fetchOptions = async () => {
      // When editing a zone, rely on getZone API for both available and mapped data
      if (!show || editingZone?.zoneName) return;
      setLoadingOptions(true);
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(`${API_BASE}/settings/zones/getAvailableEntryExit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({}),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Failed to load service areas (${res.status})`);
        }
        toast(`(${res.status})`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });

        const data = await res.json();
        const entryNested = Array.isArray(data?.availableEntry) ? data.availableEntry : [];
        const exitNested = Array.isArray(data?.availableExit) ? data.availableExit : [];
        // API sometimes returns service area under different keys; handle all common variants
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
        const entries = entryNested
          .flat()
          .filter(Boolean)
          .map((o) => String(extractValue(o)).trim())
          .filter(Boolean);
        const exits = exitNested
          .flat()
          .filter(Boolean)
          .map((o) => String(extractValue(o)).trim())
          .filter(Boolean);

        const toOptionsFull = (arr) => {
          const seen = new Set();
          const opts = [];
          for (const raw of arr) {
            const s = String(raw || "").trim();
            if (!s || seen.has(s)) continue; // dedupe only exact duplicates
            seen.add(s);
            opts.push({ label: s, value: s });
          }
          return opts;
        };

        if (!cancelled) {
          setEntryOptions(toOptionsFull(entries));
          setExitOptions(toOptionsFull(exits));
          // Optionally keep maps of full -> suffix for reference
          const toMap = (arr) => {
            const map = {};
            for (const s of arr) {
              const idx = s.indexOf("?");
              if (idx !== -1) map[s] = s.slice(idx + 1);
            }
            return map;
          };
          setEntryUniqueMap(toMap(entries));
          setExitUniqueMap(toMap(exits));
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

  // Load zone details for editing
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

        // Build full strings (no trimming before '?')
        const toFull = (arr, key) =>
          arr
            .map((o) => String(o?.[key] || "").trim())
            .filter(Boolean);
        const mappedEntryFull = toFull(mappedEntry, "ServiceAreaMappedEntry");
        const mappedExitFull = toFull(mappedExit, "ServiceAreaMappedExit");
        const availEntryFull = toFull(availEntryFromZone, "ServiceAreaAvailableEntry");
        const availExitFull = toFull(availExitFromZone, "ServiceAreaAvailableExit");

        const toLV = (arr) =>
          arr.map((s) => {
            const str = String(s);
            return { label: str, value: str };
          });

        const newInit = buildInitial({
          zoneName: meta?.ZoneName || editingZone.zoneName,
          country: meta?.Country || editingZone?.country || "",
          city: meta?.City || editingZone?.city || "",
          threshold: meta?.Threshold ?? editingZone?.threshold ?? "",
          capacity: meta?.Capacity ?? editingZone?.capacity ?? "",
          starttime: meta?.Stime ?? editingZone?.starttime ?? "",
          endtime: meta?.Etime ?? editingZone?.endtime ?? "",
          serviceAreaEntry: toLV(mappedEntryFull),
          serviceAreaExit: toLV(mappedExitFull),
          remarks: meta?.remarks || meta?.Remarks || editingZone?.remarks || "",
        });
        if (!cancelled) {
          // Build dropdown options from available (full strings) + ensure mapped present; dedupe exact duplicates only
          const dedupeLV = (names) => {
            const seen = new Set();
            const out = [];
            for (const n of names) {
              const k = String(n || "").trim();
              if (!k || seen.has(k)) continue;
              seen.add(k);
              out.push({ label: k, value: k });
            }
            return out;
          };
          const entryOptsBuilt = dedupeLV([...availEntryFull, ...mappedEntryFull]);
          const exitOptsBuilt = dedupeLV([...availExitFull, ...mappedExitFull]);
          setEntryOptions(entryOptsBuilt);
          setExitOptions(exitOptsBuilt);

          // Store original service areas for comparison
          setOriginalServiceAreas({
            entry: [...mappedEntryFull],
            exit: [...mappedExitFull]
          });

          // Rebuild unique maps keyed by full string -> suffix. Prefer mapped values over available.
          const rebuildMap = (available, mapped) => {
            const map = {};
            for (const s of available) {
              const idx = s.indexOf("?");
              if (idx !== -1) {
                const suffix = s.slice(idx + 1);
                if (!map[s]) map[s] = suffix;
              }
            }
            for (const s of mapped) {
              const idx = s.indexOf("?");
              if (idx !== -1) map[s] = s.slice(idx + 1);
            }
            return map;
          };
          setEntryUniqueMap(rebuildMap(availEntryFull, mappedEntryFull));
          setExitUniqueMap(rebuildMap(availExitFull, mappedExitFull));

          // After options & maps are ready, set initial selected values
          setInitialValuesState(newInit);
        }
      } catch (err) {
        console.error("Failed to load zone details:", err);
        if (!cancelled) toast.error(err?.message || "Failed to load zone details", { position: "top-right" });
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

  useEffect(() => {
    // For add mode (no editingZone), set baseline when modal opens.
    // In edit mode, getZone effect will set initial values; avoid overriding it here.
    if (!show || editingZone?.zoneName) return;
    setInitialValuesState(buildInitial(editingZone));
    // Reset original service areas for add mode
    setOriginalServiceAreas({
      entry: [],
      exit: []
    });
  }, [show, editingZone?.zoneName]);

  const initialValues = initialValuesState;

  // const validationSchema = Yup.object().shape({
  //   zoneName: Yup.string()
  //     .max(75, 'Max 75 characters')
  //     .matches(/^[^\s]+$/, 'No spaces allowed')
  //     .required("Zone Name is required"),
  //   country: Yup.string().required("Country is required"),
  //   city: Yup.string().required("City is required"),
  // threshold: Yup.number().typeError("Threshold must be a number").required("Threshold is required").min(1, "Must be between 1 and 100").max(100, "Must be between 1 and 100"),
  //   capacity: Yup.number().typeError("Capacity must be a number").required("Capacity is required").min(1, "Must be between 1 and 10000").max(10000, "Must be between 1 and 10000"),
  //   serviceAreaEntry: Yup.array().min(1, "Service Area Entry is required"),
  //   serviceAreaExit: Yup.array().min(1, "Service Area Exit is required"),
  // });
  const validationSchema = Yup.object().shape({
    zoneName: Yup.string()
      .max(75, "Max 75 characters")
      .matches(/^[^\s]+$/, "Zone name should not contain spaces")
      .required("Zone Name is required"),
    country: Yup.string().required("Country is required"),
    city: Yup.string().required("City is required"),
    threshold: Yup.number()
      .typeError("Threshold must be a number")
      .required("Threshold is required")
      .min(1, "Must be between 1 to 100")
      .max(100, "Must be between 1 to 100"),
    capacity: Yup.number()
      .typeError("Capacity must be a number")
      .required("Capacity is required")
      .min(1, "Must be between 1 to 10000")
      .max(10000, "Must be between 1 to 10000"),
    serviceAreaEntry: Yup.array().min(1, "Service Area Entry is required"),
    serviceAreaExit: Yup.array().min(1, "Service Area Exit is required"),
    starttime: Yup.number()
      .typeError("Start Time must be a number")
      .required("Start Time is required")
      .min(0, "Must be between 0 to 23")
      .max(23, "Must be between 0 to 23"),
    endtime: Yup.number()
      .typeError("End Time must be a number")
      .required("End Time is required")
      .min(0, "Must be between 0 to 23")
      .max(23, "Must be between 0 to 23")
      .test('is-greater', 'End Time must be greater than Start Time', function(value){
        const { starttime } = this.parent;
        if (starttime === '' || starttime === undefined || starttime === null) return true;
        if (value === '' || value === undefined || value === null) return true;
        return Number(value) > Number(starttime);
      }),
  });

  return (
    <Modal
      show={show}
      onHide={showValidationModal ? undefined : handleClose}
      centered
      backdrop="static"
      size="lg"
      className={`zone-form ${showValidationModal ? 'modal-faded' : ''}`}
    >
      {/* Hide the underlying edit form entirely while validation modal is visible */}
      <div
        className={showValidationModal ? 'modal-overlay-disabled' : ''}
        style={showValidationModal ? { display: 'none' } : {}}
        aria-hidden={showValidationModal ? 'true' : 'false'}
      >
        <Formik
          key={show ? (editingZone?.zoneName || "edit") : "hidden"}
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            const token = sessionStorage.getItem("token");
            const vid = Number(sessionStorage.getItem("vid")) || 4;
            const username = sessionStorage.getItem("username") || "Occupancy";
            const entryList = (values.serviceAreaEntry || []).map((o) => o.value);
            const exitList = (values.serviceAreaExit || []).map((o) => o.value);
            // Build trimmed areas (before '?') and collect unique ids (after '?')
            const parse = (arr) => {
              const areas = [];
              const uniques = [];
              for (const full of arr) {
                const str = String(full || "");
                if (!str) continue;
                const q = str.indexOf("?");
                if (q === -1) {
                  areas.push(str.trim());
                } else {
                  areas.push(str.slice(0, q).trim());
                  const suf = str.slice(q + 1).trim();
                  if (suf) uniques.push(suf);
                }
              }
              return { areas, uniques };
            };
            const entryParsed = parse(entryList);
            const exitParsed = parse(exitList);
            const sentryuniqueid = Array.from(new Set((entryParsed.uniques || []).filter(Boolean))).join(",");
            const sexituniqueid = Array.from(new Set((exitParsed.uniques || []).filter(Boolean))).join(",");

            // Build validation payload (API expects zonename field like Add flow)
            const validationPayload = {
              vid,
              username,
              zonename: values.zoneName,
              country: values.country,
              city: values.city,
              threshold: Number(values.threshold),
              capacity: Number(values.capacity),
              remarks: values.remarks || "",
              serviceareaentry: entryParsed.areas.join(","),
              sentryuniqueid,
              serviceareaexit: exitParsed.areas.join(","),
              sexituniqueid,
              Stime: Number(values.starttime),
              Etime: Number(values.endtime),
            };

            // Only run validation & show confirmation popup if entry/exit service areas changed
            try {
              // Normalize current & original (full strings including unique id if present)
              const currentEntryFull = Array.from(new Set((values.serviceAreaEntry || []).map(o => o.value))).sort();
              const currentExitFull = Array.from(new Set((values.serviceAreaExit || []).map(o => o.value))).sort();
              const originalEntryFull = Array.from(new Set(originalServiceAreas.entry || [])).sort();
              const originalExitFull = Array.from(new Set(originalServiceAreas.exit || [])).sort();
              const entryChanged = JSON.stringify(currentEntryFull) !== JSON.stringify(originalEntryFull);
              const exitChanged = JSON.stringify(currentExitFull) !== JSON.stringify(originalExitFull);
              if (entryChanged || exitChanged) {
                const vres = await fetch(`${API_BASE}/settings/zones/validationZone`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                  body: JSON.stringify(validationPayload),
                });
                const vdata = await vres.json().catch(() => ({}));
                const hasMapped = !!(vdata?.mappedLineEntryFlag || vdata?.mappedLineExitFlag);
                if (hasMapped) {
                  setValidationData(vdata);
                  // Fix: use correct exitAreas list (was entryParsed.areas duplicated)
                  setPendingAction({ values, entryAreas: entryParsed.areas, exitAreas: exitParsed.areas, sentryuniqueid, sexituniqueid, resetForm, setSubmitting });
                  setShowValidationModal(true);
                  setSubmitting(false);
                  return; // wait for user confirmation
                }
              }
            } catch (err) {
              console.error("Validation API failed:", err);
              toast.error(err?.message || "Validation check failed", { position: "top-right" });
              // proceed anyway
            }

            // Optional: if zone name changed, ensure uniqueness (client-side) before edit
            const nameChanged = String(values.zoneName || "").toLowerCase().trim() !== String(editingZone.zoneName || "").toLowerCase().trim();
            if (nameChanged) {
              // We don't have zone list here; server will likely handle duplicates. Could add fetch if needed.
            }

            try {
              setSubmitting(true);
              const body = {
                vid,
                username,
                Oldzonename: editingZone.zoneName,
                Newzonename: values.zoneName,
                country: values.country,
                city: values.city,
                threshold: Number(values.threshold),
                capacity: Number(values.capacity),
                remarks: values.remarks || "",
                serviceareaentry: entryParsed.areas.join(","),
                serviceareaexit: exitParsed.areas.join(","),
                sentryuniqueid,
                sexituniqueid,
                Stime: Number(values.starttime),
                Etime: Number(values.endtime),
              };
              const res = await fetch(`${API_BASE}/settings/zones/editZone`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(body),
              });
              const data = await res.json().catch(() => ({}));
              if (!res.ok || data?.success === false) {
                const msg = data?.message || `Failed to update zone (${res.status})`;
                throw new Error(msg);
              }
              toast.success(data?.message || "Zone updated successfully", { position: "top-right" });
              onSave({
                zoneName: values.zoneName,
                country: values.country,
                city: values.city,
                serviceAreaEntry: entryParsed.areas.join(","),
                serviceAreaExit: exitParsed.areas.join(","),
                threshold: Number(values.threshold),
                capacity: Number(values.capacity),
                starttime: Number(values.starttime),
                endtime: Number(values.endtime),
                remarks: values.remarks || "",
              });
              resetForm();
              handleClose();
            } catch (err) {
              toast.error(err?.message || "Failed to update zone", { position: "top-right" });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
            <FormikForm noValidate onSubmit={handleSubmit}>
              <Modal.Header closeButton className="pb-2">
                <Modal.Title>Edit Zone</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {loadingZone && <div className="m-3 text-muted">Loading zone details...</div>}
                <h6 className=" ">Details</h6>
                <Row>
                  <Form.Group as={Col} className="mb-4">
                    <Form.Label>
                      Zone Name <RequiredIcon />
                      <InfoTooltip id="tt-zone-name-edit">
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
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.zoneName && !!errors.zoneName}
                      style={{ wordBreak: 'break-word' }}
                    />
                    <Form.Control.Feedback type="invalid">{errors.zoneName}</Form.Control.Feedback>
                  </Form.Group>
                </Row>

                <h6 className="">Address</h6>
                <Row>
                  <Form.Group as={Col} className="mb-4">
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
                    <Form.Control.Feedback type="invalid">{errors.country}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} className="mb-4">
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
                    <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>
                  </Form.Group>
                </Row>

                <h6 className=" ">Timing</h6>
                <Row>
                  <Form.Group as={Col} className="mb-4">
                    <Form.Label>
                      Start Time <RequiredIcon />
                      <InfoTooltip id="tt-start-time-edit">
                        <div>• Must be a number between 0 to 23</div>
                      </InfoTooltip>
                    </Form.Label>
                    <Form.Control
                      name="starttime"
                      type="number"
                      min={0}
                      max={23}
                      maxLength={2}
                      value={values.starttime}
                      onChange={(e) => {
                        let value = e.target.value;
                        // Restrict to 2 digits
                        if (value && value.length > 2) value = value.slice(0, 2);
                        if (value && Number(value) > 23) value = "23";
                        if (value && Number(value) < 0) value = "0";
                        e.target.value = value;
                        handleChange(e);
                      }}
                      onBlur={handleBlur}
                      className="no-spinner"
                      isInvalid={touched.starttime && !!errors.starttime}
                    />
                    <Form.Control.Feedback type="invalid">{errors.starttime}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} className="mb-4">
                    <Form.Label>
                      End Time <RequiredIcon />
                      <InfoTooltip id="tt-end-time-edit">
                        <div>• Must be a number between 0 to 23 and greater than Start Time</div>
                      </InfoTooltip>
                    </Form.Label>
                    <Form.Control
                      name="endtime"
                      type="number"
                      min={0}
                      max={23}
                      maxLength={2}
                      value={values.endtime}
                      onChange={(e) => {
                        let value = e.target.value;
                        // Restrict to 2 digits
                        if (value && value.length > 2) value = value.slice(0, 2);
                        if (value && Number(value) > 23) value = "23";
                        if (value && Number(value) < 0) value = "0";
                        e.target.value = value;
                        handleChange(e);
                      }}
                      onBlur={handleBlur}
                      className="no-spinner"
                      isInvalid={touched.endtime && !!errors.endtime}
                    />
                    <Form.Control.Feedback type="invalid">{errors.endtime}</Form.Control.Feedback>
                  </Form.Group>
                </Row>

                <h6 className=" ">Threshold</h6>
                <Row>
                  <Form.Group as={Col} className="mb-4">
                    <Form.Label>
                      Threshold <RequiredIcon />
                      <InfoTooltip id="tt-threshold-edit">
                        <div>
                          • Must be a number between 1 to 100
                          {/* <br />• Spinner hidden */}
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
                          let value = e.target.value;
                          // Cap the value at 100 if it exceeds
                          if (value && Number(value) > 100) {
                            value = "100";
                          }
                          e.target.value = value;
                          handleChange(e);
                        }}
                        onBlur={handleBlur}
                        className="no-spinner"
                        isInvalid={touched.threshold && !!errors.threshold}
                      />
                      <InputGroup.Text>%</InputGroup.Text>
                      <Form.Control.Feedback type="invalid">{errors.threshold}</Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group as={Col} className="mb-4">
                    <Form.Label>
                      Capacity <RequiredIcon />
                      <InfoTooltip id="tt-capacity-edit">
                        <div>
                          • Must be a number between 1 to 10000
                          {/* <br />• Spinner hidden */}
                        </div>
                      </InfoTooltip>
                    </Form.Label>
                    <Form.Control
                      name="capacity"
                      type="number"
                      min={1}
                      max={10000}
                      value={values.capacity}
                      onChange={(e) => {
                        let value = e.target.value;
                        // Cap the value at 10000 if it exceeds
                        if (value && Number(value) > 10000) {
                          value = "10000";
                        }
                        e.target.value = value;
                        handleChange(e);
                      }}
                      onBlur={handleBlur}
                      className="no-spinner"
                      isInvalid={touched.capacity && !!errors.capacity}
                    />
                    <Form.Control.Feedback type="invalid">{errors.capacity}</Form.Control.Feedback>
                  </Form.Group>
                </Row>

                <h6 className=" ">Service Area</h6>
                <Row>
                  <Form.Group as={Col} className="mb-4">
                    <Form.Label>
                      Service Area Entry <RequiredIcon />
                    </Form.Label>
                    <MultiSelectDropdown
                      options={entryOptions.map(opt => {
                        const idx = opt.value.indexOf("?");
                        if (idx !== -1) {
                          const visible = opt.value.slice(0, idx);
                          const unique = opt.value.slice(idx + 1);
                          return { ...opt, label: `${visible} (ID: ${unique})` };
                        }
                        return opt;
                      })}
                      value={values.serviceAreaEntry.map(opt => {
                        if (!opt.value) return opt;
                        const idx = opt.value.indexOf("?");
                        if (idx !== -1) {
                          const visible = opt.value.slice(0, idx);
                          const unique = opt.value.slice(idx + 1);
                          return { ...opt, label: `${visible} (ID: ${unique})` };
                        }
                        return opt;
                      })}
                      onChange={(val) => setFieldValue("serviceAreaEntry", val)}
                      placeholder={loadingOptions ? "Loading..." : "Select Service Area Entry"}
                      isInvalid={touched.serviceAreaEntry && !!errors.serviceAreaEntry}
                      error={errors.serviceAreaEntry}
                    />
                  </Form.Group>
                  <Form.Group as={Col} className="mb-4">
                    <Form.Label>
                      Service Area Exit <RequiredIcon />
                    </Form.Label>
                    <MultiSelectDropdown
                      options={exitOptions.map(opt => {
                        const idx = opt.value.indexOf("?");
                        if (idx !== -1) {
                          const visible = opt.value.slice(0, idx);
                          const unique = opt.value.slice(idx + 1);
                          return { ...opt, label: `${visible} (ID: ${unique})` };
                        }
                        return opt;
                      })}
                      value={values.serviceAreaExit.map(opt => {
                        if (!opt.value) return opt;
                        const idx = opt.value.indexOf("?");
                        if (idx !== -1) {
                          const visible = opt.value.slice(0, idx);
                          const unique = opt.value.slice(idx + 1);
                          return { ...opt, label: `${visible} (ID: ${unique})` };
                        }
                        return opt;
                      })}
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
                    maxLength={100}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted"></small>
                    <small className="text-muted">
                      {values.remarks?.length || 0}/100
                    </small>
                  </div>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer className="d-flex justify-content-center">
                <Button className="btn btn-primary btn-sm" variant="secondary" onClick={handleClose} disabled={showValidationModal}>
                  Cancel
                </Button>
                <Button className="btn btn-primary btn-sm actv" type="submit" variant="primary" disabled={isSubmitting || showValidationModal}>
                  Save
                </Button>
              </Modal.Footer>
            </FormikForm>
          )}
        </Formik>
      </div>
      {/* Validation / confirmation popup for mapped entries or exits */}
      <Modal show={showValidationModal} onHide={() => { setShowValidationModal(false); setPendingAction(null); }} centered backdrop="static" size="lg">
        <div className="sa-modal">
          <div className="sa-header">
            {/* <div className="sa-zone">The line(s) are mapped with the another zone</div> */}
            <div className="sa-zone">The line(s) are mapped with the another zone<br /><span style={{ textAlign: "left" }}>Do you want to continue? </span></div>
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
          {/* <div className="sa-continue-question">The line(s) are mapped with the another zone.Do you want to continue?</div> */}
          <div className="reset-footer" style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
            <Button className="btn btn-primary btn-sm" variant="secondary" onClick={() => { setShowValidationModal(false); setPendingAction(null); }}>
              Cancel
            </Button>
            <Button className="btn btn-primary btn-sm actv" onClick={async () => {
              const act = pendingAction;
              if (!act) return;
              const { values, entryAreas, exitAreas, sentryuniqueid, sexituniqueid, resetForm, setSubmitting } = act;
              const token = sessionStorage.getItem("token");
              const vid = Number(sessionStorage.getItem("vid")) || 4;
              const username = sessionStorage.getItem("username") || "Occupancy";
              try {
                setSubmitting(true);
                const body = {
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
                  sentryuniqueid: sentryuniqueid || entryAreas.join(","),
                  sexituniqueid: sexituniqueid || exitAreas.join(","),
                  Stime: Number(values.starttime),
                  Etime: Number(values.endtime),
                };
                const res = await fetch(`${API_BASE}/settings/zones/editZone`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                  body: JSON.stringify(body),
                });
                const data = await res.json().catch(() => ({}));
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
                  starttime: Number(values.starttime),
                  endtime: Number(values.endtime),
                  remarks: values.remarks || "",
                });
                resetForm();
                setShowValidationModal(false);
                setPendingAction(null);
                handleClose();
              } catch (err) {
                toast.error(err?.message || "Failed to update zone", { position: "top-right" });
              } finally {
                setSubmitting(false);
              }
            }}>
              Continue
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
};

export default EditZone;


