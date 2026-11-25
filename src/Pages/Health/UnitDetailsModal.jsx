import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal } from "react-bootstrap";
import axios from "axios";
import "./UnitDetailsModal.css";

import { FiLogOut, FiClock, FiWifi, FiLogIn } from "react-icons/fi";

// ── Constants ────────────────────────────────────────────────────────────────

const BAR_GAP = 1;

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmtISO = (iso) => {
  if (!iso) return "";

  const d = new Date(iso);

  let h = d.getHours();
  const m = d.getMinutes();

  const ap = h >= 12 ? "PM" : "AM";

  h = h % 12 || 12;

  return `${h}:${String(m).padStart(2, "0")} ${ap}`;
};

// const fmtHHMM = (hhmm) => {
//   if (!hhmm) return "";

//   const [hStr, mStr] = hhmm.split(":");

//   let h = parseInt(hStr, 10);
//   const m = parseInt(mStr, 10);

//   const ap = h >= 12 ? "PM" : "AM";

//   h = h % 12 || 12;

//   return `${h}:${String(m).padStart(2, "0")} ${ap}`;
// };
const fmtHHMM = (hhmm) => {
  if (!hhmm) return "";

  const [hStr, mStr] = hhmm.split(":");

  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);

  const ap = h >= 12 ? "PM" : "AM";

  h = h === 0 ? 12 : h > 12 ? h - 12 : h;  // ✅ explicit midnight fix

  return `${h}:${String(m).padStart(2, "0")} ${ap}`;
};
const extractHHMM = (apiTime) => {
  if (!apiTime) return "";

  const value = String(apiTime).trim();

  // If already in HH:MM or HH:MM:SS, return first 5 chars
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) {
    const normalized = value.split(":").slice(0, 2).join(":");
    return normalized.padStart(5, "0");
  }

  // If a bare hour value is provided, normalize to HH:00
  if (/^\d{1,2}$/.test(value)) {
    return `${value.padStart(2, "0")}:00`;
  }

  // If value already contains AM/PM, normalize it to HH:MM
  const ampmMatch = value.match(/^\s*(\d{1,2})(?::(\d{2}))?\s*([AaPp][Mm])\s*$/);
  if (ampmMatch) {
    const rawHour = parseInt(ampmMatch[1], 10);
    const rawMin = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const meridiem = ampmMatch[3].toUpperCase();
    const hour = rawHour === 0 ? 12 : rawHour;
    return `${String(hour).padStart(2, "0")}:${String(rawMin).padStart(2, "0")}`;
  }

  // ISO format: YYYY-MM-DDTHH:MM:SS or with timezone
  if (value.includes("T")) {
    const parts = value.split("T");
    const timePart = parts[1] || "";
    return timePart.slice(0, 5);
  }

  // If space-separated date time, try to find time token
  const tokens = value.split(" ");
  for (const t of tokens) {
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(t)) {
      const normalized = t.split(":").slice(0, 2).join(":");
      return normalized.padStart(5, "0");
    }
  }

  // Fallback: return full string
  return value;
};

const formatAPITimeTo12 = (apiTime) => {
  const hhmm = extractHHMM(apiTime);

  if (/^\d{2}:\d{2}$/.test(hhmm)) {
    return fmtHHMM(hhmm);
  }

  return hhmm;
};

const fmtDate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const getLabelInterval = (barCount, barWidth) => {
  const pixelsPerLabel = 70;

  const step = Math.max(1, Math.round(pixelsPerLabel / (barWidth + BAR_GAP)));

  const niceSteps = [1, 2, 4, 8, 12, 24, 48];

  return niceSteps.find((n) => n >= step) ?? step;
};

// ─────────────────────────────────────────────────────────────────────────────

const UnitDetailsModal = ({ show, onHide, unit }) => {
  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://delbi2dev.deloptanalytics.com:3000";

  const [scheduleData, setScheduleData] = useState([]);
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("map");
  const [tooltip, setTooltip] = useState(null);

  const [stats, setStats] = useState({
    visitorsIn: "0",
    visitorsOut: "0",
    processTime: "00:00:00 - 00:00:00",
    macAddress: "N/A",
    location: "No Location",
    updatedOn: "",
  });

  const tooltipRef = useRef(null);
  const todayDate = fmtDate(new Date());

  // ── Device Health Status API ──────────────────────────────────────────────

  const fetchDeviceHealthStatus = async (uniqueId) => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) return null;

      const response = await axios({
        method: "POST",
        url: `${API_URL}/dashboard/healthDashboard/deviceHealthStatus`,
        data: { uniqueid: uniqueId },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (
        response.data?.success &&
        response.data?.deviceHealthStatus?.length > 0
      ) {
        const h = response.data.deviceHealthStatus[0];

        return {
          visitorsIn: h.TotalIn || "0",
          visitorsOut: h.TotalOut || "0",
          processTime: h.ProcessTime || "00:00:00 - 00:00:00",
          macAddress: h.MacAddress || "N/A",
          location: h.Location || "No Location",
          updatedOn: h.Updated_ON || "",
        };
      }

      return null;
    } catch (err) {
      console.error(
        "deviceHealthStatus error:",
        err?.response?.data || err.message
      );

      return null;
    }
  };

  // ── Schedule Chart API ────────────────────────────────────────────────────

  const fetchScheduleData = async (vid, currentUnitName) => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) return [];

      // IMPORTANT FIX
      // Backend expects:
      // {
      //   "vid": "70",
      //   "unitname": "STRIDE:09c96"
      // }

      const payload = {
        vid: String(vid),
        unitname: currentUnitName,
      };

      console.log("Schedule Payload:", payload);

      const response = await axios.post(
        `${API_URL}/dashboard/healthDashboard/healthTrackerScheduleChart`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Schedule Response:", response.data);

      const chartData =
        response.data?.healthTrackerScheduleChart || [];

      return chartData.map((entry) => {
        const time = formatAPITimeTo12(entry.StartTime);

        return {
          time,

          starttime: entry.StartTime,
          endtime: entry.EndTime,

          reason: entry.Reason,
          status: entry.Reason,

          noInfo: entry.Reason === "No Info",

          color: entry.Color || "RoyalBlue",
        };
      });
    } catch (err) {
      console.error(
        "fetchScheduleData error:",
        err?.response?.data || err.message
      );

      return [];
    }
  };

  // ── Effect ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (show && unit) {
      setIsLoading(true);

      setIsScheduleExpanded(false);

      setTooltip(null);

      // IMPORTANT FIX
      const vid = sessionStorage.getItem("vid") || "70";

      // IMPORTANT FIX
      const unitName =
        unit?.UnitName ||
        unit?.UNIT_NAME ||
        unit?.unitname ||
        unit?.name ||
        "";

      const uniqueId =
        unit?.uniqueId ||
        unit?.UniqueID ||
        unit?.name ||
        unit?.UNIT_NAME ||
        unit?.UnitName ||
        "";

      console.log("Selected Unit Object:", unit);
      console.log("Sending vid:", vid);
      console.log("Sending unitname:", unitName);

      // Device Health API

      if (uniqueId) {
        fetchDeviceHealthStatus(uniqueId).then((h) => {
          if (h) setStats(h);
        });
      }

      // Schedule Chart API

      fetchScheduleData(vid, unitName).then((data) => {
        console.log("Mapped Schedule Data:", data);

        setScheduleData(data);

        setIsLoading(false);
      });
    }
  }, [show, unit]);

  // ── Tooltip ───────────────────────────────────────────────────────────────

  const showTooltip = useCallback((e, entry) => {
    setTooltip({
      x: e.clientX,
      y: e.clientY,

      // Format API-provided timestamps to 12-hour AM/PM without timezone conversion
      start: formatAPITimeTo12(entry.starttime) || "",
      end: formatAPITimeTo12(entry.endtime) || "",

      reason: entry.reason,
      color: entry.color,
    });
  }, []);

  const moveTooltip = useCallback((e) => {
    setTooltip((prev) =>
      prev
        ? {
            ...prev,
            x: e.clientX,
            y: e.clientY,
          }
        : null
    );
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  if (!unit) return null;

  // ── Chart ─────────────────────────────────────────────────────────────────

  const totalBars = scheduleData.length;

  const labelInterval = getLabelInterval(totalBars, 14);

  const reasons = Array.from(new Set(scheduleData.map((e) => e.reason)));

  const legendItems = reasons.map((reason) => {
    const entry = scheduleData.find((e) => e.reason === reason);

    return {
      reason,
      color: entry ? entry.color : "#4361ee",
    };
  });

  const renderBars = (filterFn) => {
    return (
      <div className="schedule-bars-row">
        {scheduleData.map((entry, i) => (
          <div
            key={i}
            className="schedule-bar"
            style={{
              backgroundColor: filterFn(entry)
                ? entry.color
                : "transparent",
            }}
            onMouseEnter={(e) => showTooltip(e, entry)}
            onMouseMove={moveTooltip}
            onMouseLeave={hideTooltip}
          />
        ))}
      </div>
    );
  };

  const renderAxis = () => (
    <div className="schedule-axis-row">
      {scheduleData.map((entry, i) => {
        if (i % labelInterval !== 0) return null;

        const pct =
          totalBars > 1
            ? ((i + 0.5) / totalBars) * 100
            : 0;

        return (
          <span
            key={i}
            className="schedule-axis-label"
            style={{ left: `${pct}%` }}
          >
            {entry.time}
          </span>
        );
      })}
    </div>
  );

  // ── Map ───────────────────────────────────────────────────────────────────

  const locationQuery =
    unit?.location ||
    stats.location ||
    unit?.Location ||
    unit?.LocationName ||
    "India";

  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    locationQuery
  )}&output=embed`;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Tooltip */}

      {tooltip && (
        <div
          ref={tooltipRef}
          className="schedule-tooltip"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 60,
          }}
        >
          <div
            className="tooltip-dot"
            style={{ backgroundColor: tooltip.color }}
          />

          <div className="tooltip-body">
            <span className="tooltip-time">
              {tooltip.start} – {tooltip.end}
            </span>

            <span className="tooltip-reason">
              {tooltip.reason}
            </span>
          </div>
        </div>
      )}

      <Modal
        show={show}
        onHide={onHide}
        size="xl"
        centered
        className="unit-details-modal"
      >
        {/* Header */}

        <Modal.Header closeButton>
          <Modal.Title>
            {`${unit.name || unit.uniqueId || unit.UniqueID || "Device"} (${todayDate})`}
          </Modal.Title>
        </Modal.Header>

        {/* Body */}

        <Modal.Body>
          <div className="unit-details-content">

            {/* Stats Cards */}

            <div className="unit-stats-cards">

              <div className="unit-stat-card visitors-in">
                <div className="stat-icon-top">
                  <span>
                    <FiLogIn size={22} />
                  </span>
                </div>

                <div className="stat-value">
                  {stats.visitorsIn}
                </div>

                <div className="stat-label">
                  Visitors In
                </div>
              </div>

              <div className="unit-stat-card visitors-out">
                <div className="stat-icon-top">
                  <span>
                    <FiLogOut size={22} />
                  </span>
                </div>

                <div className="stat-value">
                  {stats.visitorsOut}
                </div>

                <div className="stat-label">
                  Visitors Out
                </div>
              </div>

              <div className="unit-stat-card process-time">
                <div className="stat-icon-top">
                  <span>
                    <FiClock size={22} />
                  </span>
                </div>

                <div className="stat-value stat-value--sm">
                  {stats.processTime}
                </div>

                <div className="stat-label">
                  Process Time
                </div>
              </div>

              <div className="unit-stat-card mac-address">
                <div className="stat-icon-top">
                  <span>
                    <FiWifi size={22} />
                  </span>
                </div>

                <div className="stat-value stat-value--sm">
                  {stats.macAddress}
                </div>

                <div className="stat-label">
                  MAC Address
                </div>
              </div>
            </div>

            {/* Schedule Section */}

            <div className="unit-schedule-section">

              {/* Legend */}

              <div className="schedule-legend-row">
                {legendItems.map((item, index) => (
                  <span
                    key={index}
                    className="legend-item"
                  >
                    <span
                      className="legend-color"
                      style={{
                        backgroundColor: item.color,
                      }}
                    />

                    {item.reason}
                  </span>
                ))}
              </div>

              {/* Loading */}

              {isLoading ? (
                <div className="schedule-loading">
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span className="visually-hidden">
                      Loading...
                    </span>
                  </div>

                  <p>Loading schedule data…</p>
                </div>
              ) : scheduleData.length === 0 ? (
                <div className="schedule-empty">
                  No schedule data available
                </div>
              ) : (
                <div className="schedule-chart-outer">

                  {/* Labels */}

                  <div className="schedule-labels-col">

                    <div
                      className="schedule-row-label clickable"
                      onClick={() =>
                        setIsScheduleExpanded((v) => !v)
                      }
                    >
                      Status
                    </div>

                    {isScheduleExpanded &&
                      reasons.map((reason) => (
                        <div
                          key={reason}
                          className="schedule-row-label"
                        >
                          {reason}
                        </div>
                      ))}

                    <div className="schedule-axis-spacer-label" />
                  </div>

                  {/* Chart */}

                  <div className="schedule-scroll-area">
                    <div className="schedule-scroll-inner">

                      {renderBars(() => true)}

                      {isScheduleExpanded &&
                        reasons.map((reason) =>
                          renderBars(
                            (e) => e.reason === reason
                          )
                        )}

                      {renderAxis()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Map */}

            <div className="unit-map-section">

              <div className="map-tabs">

                <button
                  className={`map-tab ${
                    activeTab === "map"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveTab("map")
                  }
                >
                  Map
                </button>

                <button
                  className={`map-tab ${
                    activeTab === "satellite"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveTab("satellite")
                  }
                >
                  Satellite
                </button>
              </div>

              <div className="map-container">

                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Unit Location"
                />
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default UnitDetailsModal;