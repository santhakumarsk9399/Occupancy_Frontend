// import React, { useState, useEffect, useMemo } from "react";
// import { Modal } from "react-bootstrap";
// import axios from "axios";
// import "./UnitDetailsModal.css";
// import NoData from "../CommonComponents/NoDataAvailable";

// const ZoneDetailsModal = ({ show, onHide, zone, onUnitClick }) => {
//   const API_URL = import.meta.env.VITE_API_URL || "http://delbi2dev.deloptanalytics.com:3000";

//   const [unitsData, setUnitsData] = useState([]);
//   const [filterText, setFilterText] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const token = sessionStorage.getItem("token");
//   const vid = sessionStorage.getItem("vid");
//   const username = sessionStorage.getItem("username");

//   useEffect(() => {
//     if (show && zone) {
//       const fetchZoneUnits = async () => {
//         try {
//           setIsLoading(true);
//           let response;

//           if (zone.status === "online") {
//             // Fetch online device status
//             response = await axios.post(
//               `${API_URL}/healthDashboard/onlineDeviceStatus`,
//               {
//                 vid: vid || "52",
//                 username: username || "Occupancy",
//                 zonename: zone.name
//               },
//               {
//                 headers: {
//                   Authorization: `Bearer ${token}`,
//                   "Content-Type": "application/json",
//                 },
//               }
//             );

//             if (response.data?.success && response.data?.onlineDeviceStatus) {
//               const units = response.data.onlineDeviceStatus.map((item, idx) => ({
//                 id: idx + 1,
//                 name: item.UNITNAME,
//                 status: item.STATUS,
//                 lastFileReceived: item.LASTFILERECEIVED,
//               }));
//               setUnitsData(units);
//             } else {
//               setUnitsData([]);
//             }
//           } else if (zone.status === "offline") {
//             // Fetch offline device status
//             response = await axios.post(
//               `${API_URL}/healthDashboard/offlineDeviceStatus`,
//               {
//                 vid: vid || "52",
//                 username: username || "Occupancy",
//                 mallname: zone.name
//               },
//               {
//                 headers: {
//                   Authorization: `Bearer ${token}`,
//                   "Content-Type": "application/json",
//                 },
//               }
//             );

//             if (response.data?.success && response.data?.offlineDeviceStatus) {
//               const units = response.data.offlineDeviceStatus.map((item, idx) => ({
//                 id: idx + 1,
//                 name: item.UNITNAME,
//                 status: item.STATUS,
//                 lastFileReceived: item.LASTFILERECEIVED,
//               }));
//               setUnitsData(units);
//             } else {
//               setUnitsData([]);
//             }
//           } else {
//             // Fetch general zone units
//             response = await axios.post(
//               `${API_URL}/healthDashboard/zoneUnits`,
//               { zoneName: zone.name },
//               {
//                 headers: {
//                   Authorization: `Bearer ${token}`,
//                   "Content-Type": "application/json",
//                 },
//               }
//             );

//             if (response.data?.success && response.data?.data) {
//               const units = response.data.data.map((item, idx) => ({
//                 id: idx + 1,
//                 vid: item.VID || item.vid || item.UNITID || item.unitId || idx + 1,
//                 name: item.UNITNAME || item.name || "",
//                 status: item.STATUS || "Online",
//                 lastFileReceived: item.LASTFILERECEIVED || item.lastFileReceived || "",
//               }));
//               setUnitsData(units);
//             } else {
//               setUnitsData([
//                 {
//                   id: 1,
//                   vid: 1,
//                   name: `${zone.name}-Chinatower:06S08`,
//                   status: "Online",
//                   lastFileReceived: new Date().toISOString().split("T")[0],
//                 }
//               ]);
//             }
//           }
//         } catch (error) {
//           console.error("Error fetching zone units:", error);
//           setUnitsData([
//             {
//               id: 1,
//               vid: 1,
//               name: `${zone.name}-Chinatower:06S08`,
//               status: "Online",
//               lastFileReceived: new Date().toISOString().split("T")[0],
//             }
//           ]);
//         } finally {
//           setIsLoading(false);
//         }
//       };

//       fetchZoneUnits();
//     }
//   }, [show, zone, vid, username, token]);

//   const filteredUnits = useMemo(() => {
//     if (!filterText) return unitsData;
//     return unitsData.filter((unit) =>
//       unit.name.toLowerCase().includes(filterText.toLowerCase())
//     );
//   }, [filterText, unitsData]);

//   const handleUnitRowClick = (unit) => {
//     if (onUnitClick) {
//       onUnitClick(unit);
//     }
//   };

//   if (!zone) return null;

//   return (
//     <Modal
//       show={show}
//       onHide={onHide}
//       size="xl"
//       centered
//       className="unit-details-modal"
//     >
//       <Modal.Header closeButton>
//         <div className="mall-details-header">
//           <div>
//             <div className="mall-details-title">Mall Name</div>
//             <div className="mall-details-name">{zone.name}</div>
//           </div>
//           <div className="mall-status-chip">
//             <span className={`mall-status-dot ${zone.status === "online" ? "online" : zone.status === "offline" ? "offline" : "unknown"}`}></span>
//             <span className="mall-status-text">Mall Health Status - {zone.status?.charAt(0).toUpperCase() + zone.status?.slice(1)}</span>
//           </div>
//         </div>
//       </Modal.Header>
//       <Modal.Body>
//         <div className="unit-details-content">
//           <div className="health-filter-input-wrapper" style={{ marginBottom: "16px" }}>
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="16"
//               height="16"
//               fill="currentColor"
//               viewBox="0 0 16 16"
//               className="filter-icon"
//             >
//               <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
//             </svg>
//             <input
//               type="text"
//               className="health-filter-input"
//               placeholder="Filter units"
//               value={filterText}
//               onChange={(e) => setFilterText(e.target.value)}
//             />
//           </div>

//           <div className="health-table-container">
//             <table className="health-table">
//               <thead>
//                 <tr>
//                   <th>SL</th>
//                   <th>UNIT NAME</th>
//                   <th>STATUS</th>
//                   <th>LAST FILE RECEIVED</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {isLoading ? (
//                   <tr>
//                     <td colSpan="4" className="loading-state" style={{ textAlign: "center", padding: "20px" }}>
//                       <div className="spinner" style={{ display: "inline-block" }}>
//                         Loading units...
//                       </div>
//                     </td>
//                   </tr>
//                 ) : filteredUnits.length > 0 ? (
//                   filteredUnits.map((unit, index) => (
//                     <tr
//                       key={unit.id}
//                       onClick={() => handleUnitRowClick(unit)}
//                       style={{ cursor: "pointer" }}
//                     >
//                       <td>{index + 1}</td>
//                       <td>{unit.name}</td>
//                       <td>{unit.status}</td>
//                       <td>{unit.lastFileReceived}</td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
//                       <NoData name="no-results" />
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </Modal.Body>
//     </Modal>
//   );
// };

// export default ZoneDetailsModal;


import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "react-bootstrap";
import axios from "axios";
import "./UnitDetailsModal.css";
import NoData from "../CommonComponents/NoDataAvailable";

const ZoneDetailsModal = ({ show, onHide, zone, onUnitClick }) => {
  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://delbi2dev.deloptanalytics.com:3000";

  const [unitsData,  setUnitsData]  = useState([]);
  const [filterText, setFilterText] = useState("");
  const [isLoading,  setIsLoading]  = useState(false);

  const token    = sessionStorage.getItem("token");
  const vid      = sessionStorage.getItem("vid");
  const username = sessionStorage.getItem("username");

  useEffect(() => {
    if (show && zone) {
      const fetchZoneUnits = async () => {
        try {
          setIsLoading(true);
          let response;

          if (zone.status === "online") {
            response = await axios.post(
              `${API_URL}/healthDashboard/onlineDeviceStatus`,
              { vid: vid || "52", username: username || "Occupancy", zonename: zone.name },
              { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
            );
            if (response.data?.success && response.data?.onlineDeviceStatus) {
              setUnitsData(
                response.data.onlineDeviceStatus.map((item, idx) => ({
                  id: idx + 1,
                  name: item.UNITNAME,
                  status: item.STATUS,
                  lastFileReceived: item.LASTFILERECEIVED,
                }))
              );
            } else {
              setUnitsData([]);
            }

          } else if (zone.status === "offline") {
            response = await axios.post(
              `${API_URL}/healthDashboard/offlineDeviceStatus`,
              { vid: vid || "52", username: username || "Occupancy", mallname: zone.name },
              { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
            );
            if (response.data?.success && response.data?.offlineDeviceStatus) {
              setUnitsData(
                response.data.offlineDeviceStatus.map((item, idx) => ({
                  id: idx + 1,
                  name: item.UNITNAME,
                  status: item.STATUS,
                  lastFileReceived: item.LASTFILERECEIVED,
                }))
              );
            } else {
              setUnitsData([]);
            }

          } else {
            response = await axios.post(
              `${API_URL}/healthDashboard/zoneUnits`,
              { zoneName: zone.name },
              { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
            );
            if (response.data?.success && response.data?.data) {
              setUnitsData(
                response.data.data.map((item, idx) => ({
                  id: idx + 1,
                  vid: item.VID || item.vid || item.UNITID || item.unitId || idx + 1,
                  name: item.UNITNAME || item.name || "",
                  status: item.STATUS || "Online",
                  lastFileReceived: item.LASTFILERECEIVED || item.lastFileReceived || "",
                }))
              );
            } else {
              setUnitsData([]);
            }
          }
        } catch (error) {
          console.error("Error fetching zone units:", error);
          setUnitsData([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchZoneUnits();
    }
  }, [show, zone, vid, username, token]);

  const filteredUnits = useMemo(() => {
    if (!filterText) return unitsData;
    return unitsData.filter((unit) =>
      unit.name.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [filterText, unitsData]);

  const handleUnitRowClick = (unit) => {
    if (onUnitClick) onUnitClick(unit);
  };

  const statusLabel = zone?.status
    ? zone.status.charAt(0).toUpperCase() + zone.status.slice(1)
    : "Unknown";

  const statusClass =
    zone?.status === "online"  ? "online"  :
    zone?.status === "offline" ? "offline" : "unknown";

  if (!zone) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      className="unit-details-modal"   /* ← same class = same size */
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <div className="mall-details-header">
            <div>
              <div className="mall-details-title">Mall Name</div>
              <div className="mall-details-name">{zone.name}</div>
            </div>
            <div className="mall-status-chip">
              <span className={`mall-status-dot ${statusClass}`} />
              <span className="mall-status-text">
                Mall Health Status — {statusLabel}
              </span>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="unit-details-content">

          {/* Filter */}
          <div className="health-filter-input-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
              className="filter-icon"
            >
              <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
            </svg>
            <input
              type="text"
              className="health-filter-input"
              placeholder="Filter units…"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>

          {/* Table — flex:1 makes it fill all remaining height */}
          <div className="health-table-container">
            <table className="health-table">
              <thead>
                <tr>
                  <th>SL</th>
                  <th>Unit Name</th>
                  <th>Status</th>
                  <th>Last File Received</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "28px" }}>
                      <div
                        className="spinner-border spinner-border-sm"
                        role="status"
                        style={{ color: "#4361ee" }}
                      >
                        <span className="visually-hidden">Loading…</span>
                      </div>
                      <span style={{ marginLeft: 10, fontSize: 13, color: "#6b7280" }}>
                        Loading units…
                      </span>
                    </td>
                  </tr>
                ) : filteredUnits.length > 0 ? (
                  filteredUnits.map((unit, index) => (
                    <tr
                      key={unit.id}
                      onClick={() => handleUnitRowClick(unit)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{index + 1}</td>
                      <td>{unit.name}</td>
                      <td>
                        <span
                          style={{
                            color:
                              unit.status?.toLowerCase() === "online"
                                ? "#16a34a"
                                : unit.status?.toLowerCase() === "offline"
                                ? "#dc2626"
                                : "#6b7280",
                            fontWeight: 400,
                          }}
                        >
                          {unit.status}
                        </span>
                      </td>
                      <td>{unit.lastFileReceived}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "28px" }}>
                      <NoData name="no-results" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ZoneDetailsModal;