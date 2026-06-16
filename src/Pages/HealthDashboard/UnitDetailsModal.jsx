// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { Modal } from "react-bootstrap";
// import axios from "axios";
// import "./UnitDetailsModal.css";
// // import mac_icon from "../../Components/Assets/mac_address_icon.png";
// // import process_icon from "../../Components/Assets/process_time_icon.png";
// import {
//   FiLogOut,
//   FiClock,
//   FiWifi,
//   FiLogIn
// } from "react-icons/fi";

// import { BiTime } from "react-icons/bi";
// // ── Constants ────────────────────────────────────────────────────────────────
// const BAR_GAP = 1;

// // ── Helpers ──────────────────────────────────────────────────────────────────

// const fmtISO = (iso) => {
//   if (!iso) return "";
//   const d  = new Date(iso);
//   let h    = d.getHours();
//   const m  = d.getMinutes();
//   const ap = h >= 12 ? "PM" : "AM";
//   h        = h % 12 || 12;
//   return `${h}:${String(m).padStart(2, "0")} ${ap}`;
// };

// const fmtHHMM = (hhmm) => {
//   if (!hhmm) return "";
//   const [hStr, mStr] = hhmm.split(":");
//   let h  = parseInt(hStr, 10);
//   const m = parseInt(mStr, 10);
//   const ap = h >= 12 ? "PM" : "AM";
//   h = h % 12 || 12;
//   return `${h}:${String(m).padStart(2, "0")} ${ap}`;
// };

// const getLabelInterval = (barCount, barWidth) => {
//   const pixelsPerLabel = 70;
//   const step = Math.max(1, Math.round(pixelsPerLabel / (barWidth + BAR_GAP)));
//   const niceSteps = [1, 2, 4, 8, 12, 24, 48];
//   return niceSteps.find((n) => n >= step) ?? step;
// };

// // ─────────────────────────────────────────────────────────────────────────────

// const UnitDetailsModal = ({ show, onHide, unit }) => {
//   const API_URL =
//     import.meta.env.VITE_API_URL ||
//     "http://delbi2dev.deloptanalytics.com:3000";

//   const [scheduleData,       setScheduleData]       = useState([]);
//   const [isScheduleExpanded, setIsScheduleExpanded] = useState(false);
//   const [isLoading,          setIsLoading]          = useState(false);
//   const [activeTab,          setActiveTab]          = useState("map");
//   const [tooltip,            setTooltip]            = useState(null);

//   const [stats, setStats] = useState({
//     visitorsIn:  "0",
//     visitorsOut: "0",
//     processTime: "00:00:00 - 00:00:00",
//     macAddress:  "N/A",
//     location:    "No Location",
//     updatedOn:   "",
//   });

//   const tooltipRef = useRef(null);

//   // ── API ─────────────────────────────────────────────────────────────────────

//   const fetchDeviceHealthStatus = async (uniqueId) => {
//     try {
//       const token = sessionStorage.getItem("token");
//       if (!token) return null;

//       const response = await axios({
//         method: "POST",
//         url:    `${API_URL}/healthDashboard/deviceHealthStatus`,
//         data:   { uniqueid: uniqueId },
//         headers: {
//           Authorization:  `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (
//         response.data?.success &&
//         response.data?.deviceHealthStatus?.length > 0
//       ) {
//         const h = response.data.deviceHealthStatus[0];
//         return {
//           visitorsIn:  h.TotalIn     || "0",
//           visitorsOut: h.TotalOut    || "0",
//           processTime: h.ProcessTime || "00:00:00 - 00:00:00",
//           macAddress:  h.MacAddress  || "N/A",
//           location:    h.Location    || "No Location",
//           updatedOn:   h.Updated_ON  || "",
//         };
//       }
//       return null;
//     } catch (err) {
//       console.error("deviceHealthStatus error:", err?.response?.data || err.message);
//       return null;
//     }
//   };

//   const fetchScheduleData = async (vid, currentUnitName) => {
//     try {
//       const token = sessionStorage.getItem("token");
//       if (!token) return [];

//       const response = await axios.post(
//         `${API_URL}/healthDashboard/healthTrackerScheduleChart`,
//         { vid },
//         { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
//       );

//       const chartData    = response.data?.healthTrackerScheduleChart || [];
//       const filteredData = currentUnitName
//         ? chartData.filter((e) => e.UnitName === currentUnitName)
//         : chartData;

//       return filteredData.map((entry) => {
//         const s     = new Date(entry.starttime);
//         const hours = String(s.getHours()).padStart(2, "0");
//         const mins  = String(s.getMinutes()).padStart(2, "0");
//         return {
//           time:      `${hours}:${mins}`,
//           starttime: entry.starttime,
//           endtime:   entry.endtime,
//           status:    entry.reason === "No Info" ? "offline" : "online",
//           noInfo:    entry.reason === "No Info",
//           reason:    entry.reason,
//           color:     entry.color || "RoyalBlue",
//         };
//       });
//     } catch (err) {
//       console.error("fetchScheduleData error:", err);
//       return [];
//     }
//   };

//   // ── Effect ──────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (show && unit) {
//       setIsLoading(true);
//       setIsScheduleExpanded(false);
//       setTooltip(null);

//       const vid      = sessionStorage.getItem("vid") || "70";
//       const unitName = unit?.name || unit?.uniqueId || unit?.UniqueID || unit?.UnitName || unit?.UNIT_NAME || "";
//       const uniqueId = unit?.uniqueId || unit?.UniqueID || unit?.name || unit?.UNIT_NAME || unit?.UnitName || "";

//       if (uniqueId) {
//         fetchDeviceHealthStatus(uniqueId).then((h) => { if (h) setStats(h); });
//       }

//       fetchScheduleData(vid, unitName).then((data) => {
//         setScheduleData(data);
//         setIsLoading(false);
//       });
//     }
//   }, [show, unit]);

//   // ── Tooltip ─────────────────────────────────────────────────────────────────
//   const showTooltip = useCallback((e, entry) => {
//     setTooltip({
//       x:      e.clientX,
//       y:      e.clientY,
//       start:  fmtISO(entry.starttime),
//       end:    fmtISO(entry.endtime),
//       reason: entry.reason,
//       color:  entry.color,
//     });
//   }, []);

//   const moveTooltip = useCallback((e) => {
//     setTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
//   }, []);

//   const hideTooltip = useCallback(() => setTooltip(null), []);

//   if (!unit) return null;

//   // ── Chart ───────────────────────────────────────────────────────────────────
//   const totalBars     = scheduleData.length;
//   const labelInterval = getLabelInterval(totalBars, 14);
//   const hasNoInfo     = scheduleData.some((e) => e.noInfo);
//   const hasOnline     = scheduleData.some((e) => !e.noInfo);

//   const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30258.123456789!2d72.8777!3d19.0760!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA0JzMzLjYiTiA3MsKwNTInMzkuNyJF!5e0!3m2!1sen!2sin!4v1234567890`;

//   const renderBars = (filterFn) => (
//     <div className="schedule-bars-row">
//       {scheduleData.map((entry, i) => (
//         <div
//           key={i}
//           className="schedule-bar"
//           style={{ backgroundColor: filterFn(entry) ? entry.color : "transparent" }}
//           onMouseEnter={(e) => showTooltip(e, entry)}
//           onMouseMove={moveTooltip}
//           onMouseLeave={hideTooltip}
//         />
//       ))}
//     </div>
//   );

//   const renderAxis = () => (
//     <div className="schedule-axis-row">
//       {scheduleData.map((entry, i) => {
//         if (i % labelInterval !== 0) return null;
//         const pct = totalBars > 1 ? ((i + 0.5) / totalBars) * 100 : 0;
//         return (
//           <span key={i} className="schedule-axis-label" style={{ left: `${pct}%` }}>
//             {fmtHHMM(entry.time)}
//           </span>
//         );
//       })}
//     </div>
//   );
//   const formatDate = (date) => {
//     return date.split("-").reverse().join("-");
//   };


//   return (
//     <>
//       {tooltip && (
//         <div
//           ref={tooltipRef}
//           className="schedule-tooltip"
//           style={{ left: tooltip.x + 12, top: tooltip.y - 60 }}
//         >
//           <div className="tooltip-dot" style={{ backgroundColor: tooltip.color }} />
//           <div className="tooltip-body">
//             <span className="tooltip-time">{tooltip.start} – {tooltip.end}</span>
//             <span className="tooltip-reason">{tooltip.reason}</span>
//           </div>
//         </div>
//       )}

//       <Modal show={show} onHide={onHide} size="xl" centered className="unit-details-modal">
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {unit.name || unit.uniqueId || unit.UniqueID}
//             {/* <span className="modal-date">
//               {" "}({(unit.lastFileReceived?.split(" | ")[0] || "").split(" ")[0] || "11/05/2026"})
//             </span> */}

//             <span className="modal-date">
//               {" "}
//               (
//               {(() => {
//                 const rawDate =
//                   (unit.lastFileReceived?.split(" | ")[0] || "")
//                     .split(" ")[0] || "2026-05-11";

//                 return rawDate.includes("-")
//                   ? rawDate.split("-").reverse().join("-")
//                   : rawDate;
//               })()}
//               )
//             </span>
//           </Modal.Title>
//         </Modal.Header>

//         <Modal.Body>
//           <div className="unit-details-content">

//             {/* Stats */}
//             <div className="unit-stats-cards">
//               <div className="unit-stat-card visitors-in">
//                 <div className="stat-icon-top">
//                   {/* <img src="/in.png" alt="Visitors In" className="stat-icon-img" /> */}
//                   <span><FiLogIn size={22}/></span>
//                 </div>
//                 <div className="stat-value">{stats.visitorsIn}</div>
//                 <div className="stat-label">Visitors In</div>
//               </div>
//               <div className="unit-stat-card visitors-out">
//                 <div className="stat-icon-top">
//                   <span><FiLogOut size={22} /></span>
//                 </div>
//                 <div className="stat-value">{stats.visitorsOut}</div>
//                 <div className="stat-label">Visitors Out</div>
//               </div>

//               <div className="unit-stat-card process-time">
//                 <div className="stat-icon-top">
//                   <span><FiClock size={22} /></span>
//                 </div>
//                 <div className="stat-value stat-value--sm">{stats.processTime}</div>
//                 <div className="stat-label">Process Time</div>
//               </div>

//               <div className="unit-stat-card mac-address">
//                 <div className="stat-icon-top">
//                   <span><FiWifi size={22} /></span>
//                 </div>
//                 <div className="stat-value stat-value--sm">{stats.macAddress}</div>
//                 <div className="stat-label">MAC Address</div>
//               </div>
//             </div>

//             {/* Schedule */}
//             <div className="unit-schedule-section">
//               <div className="schedule-legend-row">
//                 <span className="legend-item">
//                   <span className="legend-color no-info" />No Info
//                 </span>
//                 {/* <span className="legend-item">
//                   <span className="legend-color online" />Online
//                 </span> */}
//               </div>

//               {isLoading ? (
//                 <div className="schedule-loading">
//                   <div className="spinner-border spinner-border-sm" role="status">
//                     <span className="visually-hidden">Loading...</span>
//                   </div>
//                   <p>Loading schedule data…</p>
//                 </div>
//               ) : scheduleData.length === 0 ? (
//                 <div className="schedule-empty">No schedule data available</div>
//               ) : (
//                 <div className="schedule-chart-outer">
//                   <div className="schedule-labels-col">
//                     <div
//                       className="schedule-row-label clickable"
//                       onClick={() => setIsScheduleExpanded((v) => !v)}
//                       title="Click to expand"
//                     >
//                       Status
//                     </div>
//                     {isScheduleExpanded && hasNoInfo && (
//                       <div className="schedule-row-label no-info-label">No Info</div>
//                     )}
//                     {isScheduleExpanded && hasOnline && (
//                       <div className="schedule-row-label">Online</div>
//                     )}
//                     <div className="schedule-axis-spacer-label" />
//                   </div>

//                   <div className="schedule-scroll-area">
//                     <div className="schedule-scroll-inner">
//                       {renderBars(() => true)}
//                       {isScheduleExpanded && hasNoInfo && renderBars((e) => e.noInfo)}
//                       {isScheduleExpanded && hasOnline && renderBars((e) => !e.noInfo)}
//                       {renderAxis()}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Map */}
//             <div className="unit-map-section">
//               <div className="map-tabs">
//                 <button
//                   className={`map-tab ${activeTab === "map" ? "active" : ""}`}
//                   onClick={() => setActiveTab("map")}
//                 >
//                   Map
//                 </button>
//                 <button
//                   className={`map-tab ${activeTab === "satellite" ? "active" : ""}`}
//                   onClick={() => setActiveTab("satellite")}
//                 >
//                   Satellite
//                 </button>
//               </div>
//               <div className="map-container">
//                 <iframe
//                   src={mapUrl}
//                   width="100%"
//                   height="100%"
//                   style={{ border: 0 }}
//                   allowFullScreen=""
//                   loading="lazy"
//                   referrerPolicy="no-referrer-when-downgrade"
//                   title="Unit Location"
//                 />
//               </div>
//             </div>

//           </div>
//         </Modal.Body>
//       </Modal>
//     </>
//   );
// };

// export default UnitDetailsModal;


import React, { useState, useEffect, useRef, useCallback } from "react";

import { Modal } from "react-bootstrap";

import axios from "axios";

import "./UnitDetailsModal.css";

// import mac_icon from "../../Components/Assets/mac_address_icon.png";

// import process_icon from "../../Components/Assets/process_time_icon.png";

import {

  FiLogOut,

  FiClock,

  FiWifi,

  FiLogIn

} from "react-icons/fi";



import { BiTime } from "react-icons/bi";

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



const fmtHHMM = (hhmm) => {

  if (!hhmm) return "";

  const [hStr, mStr] = hhmm.split(":");

  let h = parseInt(hStr, 10);

  const m = parseInt(mStr, 10);

  const ap = h >= 12 ? "PM" : "AM";

  h = h % 12 || 12;

  return `${h}:${String(m).padStart(2, "0")} ${ap}`;

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



  // ── API ─────────────────────────────────────────────────────────────────────



  const fetchDeviceHealthStatus = async (uniqueId) => {

    try {

      const token = sessionStorage.getItem("token");

      if (!token) return null;



      const response = await axios({

        method: "POST",

        url: `${API_URL}/healthDashboard/deviceHealthStatus`,

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

      console.error("deviceHealthStatus error:", err?.response?.data || err.message);

      return null;

    }

  };



  const fetchScheduleData = async (vid, currentUnitName) => {

    try {

      const token = sessionStorage.getItem("token");

      if (!token) return [];



      const response = await axios.post(

        `${API_URL}/healthDashboard/healthTrackerScheduleChart`,

        { vid },

        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }

      );



      const chartData = response.data?.healthTrackerScheduleChart || [];

      const filteredData = currentUnitName

        ? chartData.filter((e) => e.UnitName === currentUnitName)

        : chartData;



      return filteredData.map((entry) => {

        const s = new Date(entry.starttime);

        const hours = String(s.getHours()).padStart(2, "0");

        const mins = String(s.getMinutes()).padStart(2, "0");

        return {

          time: `${hours}:${mins}`,

          starttime: entry.starttime,

          endtime: entry.endtime,

          status: entry.reason,

          noInfo: entry.reason === "No Info",

          reason: entry.reason,

          color: entry.color || "RoyalBlue",

        };

      });

    } catch (err) {

      console.error("fetchScheduleData error:", err);

      return [];

    }

  };



  // ── Effect ──────────────────────────────────────────────────────────────────

  useEffect(() => {

    if (show && unit) {

      setIsLoading(true);

      setIsScheduleExpanded(false);

      setTooltip(null);



      const vid = sessionStorage.getItem("vid") || "70";

      const unitName = unit?.name || unit?.uniqueId || unit?.UniqueID || unit?.UnitName || unit?.UNIT_NAME || "";

      const uniqueId = unit?.uniqueId || unit?.UniqueID || unit?.name || unit?.UNIT_NAME || unit?.UnitName || "";



      if (uniqueId) {

        fetchDeviceHealthStatus(uniqueId).then((h) => { if (h) setStats(h); });

      }



      fetchScheduleData(vid, unitName).then((data) => {

        setScheduleData(data);

        setIsLoading(false);

      });

    }

  }, [show, unit]);



  // ── Tooltip ─────────────────────────────────────────────────────────────────

  const showTooltip = useCallback((e, entry) => {

    setTooltip({

      x: e.clientX,

      y: e.clientY,

      start: fmtISO(entry.starttime),

      end: fmtISO(entry.endtime),

      reason: entry.reason,

      color: entry.color,

    });

  }, []);



  const moveTooltip = useCallback((e) => {

    setTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);

  }, []);



  const hideTooltip = useCallback(() => setTooltip(null), []);



  if (!unit) return null;



  // ── Chart ───────────────────────────────────────────────────────────────────

  const totalBars = scheduleData.length;

  const labelInterval = getLabelInterval(totalBars, 14);



  // Compute unique reasons from API data

  const reasons = Array.from(new Set(scheduleData.map(e => e.reason)));



  // Compute unique legend items from API data

  const legendItems = reasons.map(reason => {

    const entry = scheduleData.find(e => e.reason === reason);

    return { reason, color: entry ? entry.color : "#4361ee" };

  });



  const renderBars = (filterFn) => {

    return (

      <div className="schedule-bars-row">

        {scheduleData.map((entry, i) => (

          <div

            key={i}

            className="schedule-bar"

            style={{ backgroundColor: filterFn(entry) ? entry.color : "transparent" }}

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

        const pct = totalBars > 1 ? ((i + 0.5) / totalBars) * 100 : 0;

        return (

          <span key={i} className="schedule-axis-label" style={{ left: `${pct}%` }}>

            {fmtHHMM(entry.time)}

          </span>

        );

      })}

    </div>

  );



  const locationQuery =

    unit?.location || stats.location || unit?.Location || unit?.LocationName || "India";

  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(locationQuery)}&output=embed`;



  const formatDate = (date) => {

    return date.split("-").reverse().join("-");

  };





  return (

    <>

      {tooltip && (

        <div

          ref={tooltipRef}

          className="schedule-tooltip"

          style={{ left: tooltip.x + 12, top: tooltip.y - 60 }}

        >

          <div className="tooltip-dot" style={{ backgroundColor: tooltip.color }} />

          <div className="tooltip-body">

            <span className="tooltip-time">{tooltip.start} – {tooltip.end}</span>

            <span className="tooltip-reason">{tooltip.reason}</span>

          </div>

        </div>

      )}



      <Modal show={show} onHide={onHide} size="xl" centered className="unit-details-modal">

        <Modal.Header closeButton>

          <Modal.Title>

            {unit.name || unit.uniqueId || unit.UniqueID}

            {/* <span className="modal-date">

              {" "}({(unit.lastFileReceived?.split(" | ")[0] || "").split(" ")[0] || "11/05/2026"})

            </span> */}



            <span className="modal-date">

              {" "}

              (

              {(() => {

                const rawDate =

                  (unit.lastFileReceived?.split(" | ")[0] || "")

                    .split(" ")[0] || "2026-05-11";



                return rawDate.includes("-")

                  ? rawDate.split("-").reverse().join("-")

                  : rawDate;

              })()}

              )

            </span>

          </Modal.Title>

        </Modal.Header>



        <Modal.Body>

          <div className="unit-details-content">



            {/* Stats */}

            <div className="unit-stats-cards">

              <div className="unit-stat-card visitors-in">

                <div className="stat-icon-top">

                  {/* <img src="/in.png" alt="Visitors In" className="stat-icon-img" /> */}

                  <span><FiLogIn size={22} /></span>

                </div>

                <div className="stat-value">{stats.visitorsIn}</div>

                <div className="stat-label">Visitors In</div>

              </div>

              <div className="unit-stat-card visitors-out">

                <div className="stat-icon-top">

                  <span><FiLogOut size={22} /></span>

                </div>

                <div className="stat-value">{stats.visitorsOut}</div>

                <div className="stat-label">Visitors Out</div>

              </div>



              <div className="unit-stat-card process-time">

                <div className="stat-icon-top">

                  <span><FiClock size={22} /></span>

                </div>

                <div className="stat-value stat-value--sm">{stats.processTime}</div>

                <div className="stat-label">Process Time</div>

              </div>



              <div className="unit-stat-card mac-address">

                <div className="stat-icon-top">

                  <span><FiWifi size={22} /></span>

                </div>

                <div className="stat-value stat-value--sm">{stats.macAddress}</div>

                <div className="stat-label">MAC Address</div>

              </div>

            </div>



            {/* Schedule */}

            <div className="unit-schedule-section">

              <div className="schedule-legend-row">

                {legendItems.map((item, index) => (

                  <span key={index} className="legend-item">

                    <span className="legend-color" style={{ backgroundColor: item.color }} />

                    {item.reason}

                  </span>

                ))}

              </div>



              {isLoading ? (

                <div className="schedule-loading">

                  <div className="spinner-border spinner-border-sm" role="status">

                    <span className="visually-hidden">Loading...</span>

                  </div>

                  <p>Loading schedule data…</p>

                </div>

              ) : scheduleData.length === 0 ? (

                <div className="schedule-empty">No schedule data available</div>

              ) : (

                <div className="schedule-chart-outer">

                  <div className="schedule-labels-col">

                    <div

                      className="schedule-row-label clickable"

                      onClick={() => setIsScheduleExpanded((v) => !v)}

                      title="Click to expand"

                    >

                      Status

                    </div>

                    {isScheduleExpanded && reasons.map(reason => (

                      <div key={reason} className="schedule-row-label">{reason}</div>

                    ))}

                    <div className="schedule-axis-spacer-label" />

                  </div>



                  <div className="schedule-scroll-area">

                    <div className="schedule-scroll-inner">

                      {renderBars(() => true)}

                      {isScheduleExpanded && reasons.map(reason => renderBars((e) => e.reason === reason))}

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

                  className={`map-tab ${activeTab === "map" ? "active" : ""}`}

                  onClick={() => setActiveTab("map")}

                >

                  Map

                </button>

                <button

                  className={`map-tab ${activeTab === "satellite" ? "active" : ""}`}

                  onClick={() => setActiveTab("satellite")}

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

