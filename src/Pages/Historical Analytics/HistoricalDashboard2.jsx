// import React, { useState, useCallback, useEffect } from "react";
// import CustomCard from "../CommonComponents/Card";
// import "../../Components/Styles/Table.css";
// import "../../Components/Styles/Dashboard2.css";
// import "../../Components/Styles/Dashboard3.css";
// import axios from "axios";
// import { useSpring, animated } from "@react-spring/web";
// import { Tab, Nav, Spinner } from "react-bootstrap";
// import Icon from "../CommonComponents/icon";
// import Loader from "../CommonComponents/Loader";
// import FilterBar from "./FilterBar";
// import SingleSelectDropdown from "../CommonComponents/SingleSelectDropdown";
// import LowOccupancy from "../../Components/Assets/dashboard/sv_peakoccupancy.svg";
// import LowHour from "../../Components/Assets/dashboard/sv_peakhour.svg";
// import PeakOccupancy from "../../Components/Assets/dashboard/peakoccupancy.svg";
// import PeakHour from "../../Components/Assets/dashboard/peakHour.svg";
// import OccupancyIcon from "../../Components/Assets/dashboard/sv_occupancy.svg";
// import HistoricalAnalyticsDash2Chart from "./HistoricalDash2Chart";
// import ZoomInIcon2 from "../../Components/Assets/ZoomIn.svg";
// import CalenderIcon from "../../Components/Assets/calender-icon.svg";
// import "../Historical Analytics/HistoricalChart.css";
// import NoData from "../CommonComponents/NoDataAvailable";

// // ---------------- Helpers ----------------
// const formatDate = (date) => {
//   const d = new Date(date);
//   const day = String(d.getDate()).padStart(2, "0");
//   const month = String(d.getMonth() + 1).padStart(2, "0");
//   const year = d.getFullYear();
//   return `${day}-${month}-${year}`;
// };

// const getYesterday = () => {
//   const d = new Date();
//   d.setDate(d.getDate() - 1);
//   return formatDate(d);
// };

// const today = new Date();
// const yesterdayDate = new Date(today);
// yesterdayDate.setDate(today.getDate() - 1);
// const yesterdayStr = formatDate(yesterdayDate);

// // ---------------- Main Component ----------------
// const HistoricalDashboard2 = ({
//   isActive = false,
//   filterVersion,
//   zonesFromParent,
// }) => {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false); // main table loader
//   const [modalLoading, setModalLoading] = useState(false); // ✅ separate loader for modal
//   const [error, setError] = useState(null);
//   const [exportallData, setExportData] = useState(null);
//   const [modalZoneId, setModalZoneId] = useState(null);
//   const [modalData, setModalData] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   const [filter, setFilter] = useState("Yesterday");
//   const [zoneNames, setZoneNames] = useState([]);
//   const [selectedFilterValue, setSelectedFilterValue] = useState(yesterdayStr);

//   const token = sessionStorage.getItem("token");
//   const vid = sessionStorage.getItem("vid");
//   const username = sessionStorage.getItem("username");
//   const API_URL = import.meta.env.VITE_API_URL;

//   // --- Fetch List Data ---
//   const fetchData = useCallback(
//     async (zonesInput, fromDate) => {
//       const zonesString = Array.isArray(zonesInput)
//         ? zonesInput.map((z) => (typeof z === "object" ? z.label : z)).join(",")
//         : zonesInput;

//       if (!zonesString || !fromDate) return;

//       setLoading(true);
//       setError(null);

//       try {
//         const endpoint = `${API_URL}/dashboard/getHistoricalDashboard2Data`;
//         const res = await axios.get(endpoint, {
//           headers: { Authorization: token ? `Bearer ${token}` : undefined },
//           params: { zoneName: zonesString, fromDate },
//         });

//         let payload = res.data?.data || [];
//         setExportData(payload)
//         console.log(payload)
//         const transformed = payload.map((r) => ({
//           id: r.ZoneName,
//           zone: r.ZoneName,
//           totalVisitors: r.TotalVisitors,
//           peak: r.PeakOccupancy,
//           peakHour: r.PeakHour,
//           low: r.Lowoccupancy,
//           capacity: r.Capacity,
//         }));

//         setRows(transformed);
//       } catch (e) {
//         setError(
//           e.response?.data?.message || e.message || "Error fetching data"
//         );
//         setRows([]);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [API_URL, token]
//   );

//   // --- Fetch Selected Zones on Initial Load ---
//   const getSelectedZones = useCallback(async () => {
//     try {
//       const payload = { vid, username, country: "", city: "", zone: "" };
//       const response = await axios.get(
//         `${API_URL}/dashboard/dashboardFilter/getSelectedZones`,
//         { headers: { Authorization: `Bearer ${token}` }, params: payload }
//       );

//       const rawData = response.data?.data || [];
//       let zonesArray = [];

//       if (Array.isArray(rawData) && rawData[0]?.selectedZones) {
//         zonesArray = rawData[0].selectedZones.map((z) => String(z));
//       } else if (rawData.selectedZones) {
//         zonesArray = rawData.selectedZones.map((z) => String(z));
//       }

//       setZoneNames(zonesArray);
//       fetchData(zonesArray, getYesterday());
//     } catch (e) {
//       console.error("Error fetching zones:", e);
//       setZoneNames([]);
//     }
//   }, [API_URL, token, fetchData]);

//   // --- Fetch Modal Data ---
//   const fetchModalData = useCallback(
//     async (zoneId, fromDate) => {
//       if (!zoneId || !fromDate) return;
//       setModalLoading(true); // ✅ start modal loader
//       try {
//         const endpoint = `${API_URL}/dashboard/getHistoricalDashboard2HourlyTrends`;
//         const res = await axios.get(endpoint, {
//           headers: { Authorization: token ? `Bearer ${token}` : undefined },
//           params: { zoneName: zoneId, fromDate },
//         });
//         console.log(res?.data);
//         setModalData(res?.data || null);
//       } catch (e) {
//         setError(
//           e.response?.data?.message ||
//             e.message ||
//             "Error fetching zone details"
//         );
//         setModalData(null);
//       } finally {
//         setModalLoading(false); // ✅ stop modal loader
//       }
//     },
//     [API_URL, token]
//   );

//   // --- Effect: Initial Zones Load ---
//   useEffect(() => {
//     getSelectedZones();
//   }, [getSelectedZones]);

//   // --- Effect: Refetch Table Data on Filter Change ---
//   useEffect(() => {
//     if (!zoneNames.length) return;
//     fetchData(zoneNames, selectedFilterValue);
//   }, [filter, zoneNames, fetchData, selectedFilterValue]);

//   // --- Effect: Modal Data Fetch ---
//   useEffect(() => {
//     if (modalZoneId) {
//       fetchModalData(modalZoneId, selectedFilterValue);
//     }
//   }, [modalZoneId, selectedFilterValue, fetchModalData]);

//   useEffect(() => {
//     if (filterVersion > 0) {
//       if (zonesFromParent?.length > 0) {
//         fetchData(zonesFromParent, selectedFilterValue);
//         setZoneNames(zonesFromParent);
//       } else {
//         getSelectedZones();
//       }
//     }
//   }, [
//     filterVersion,
//     zonesFromParent,
//     selectedFilterValue,
//     fetchData,
//     getSelectedZones,
//   ]);
//   // --- Handlers ---
//   const handleApply = (dateValue, selectedZones) => {
//     const finalDate = dateValue || selectedFilterValue;
//     const finalZonesArray = selectedZones?.length ? selectedZones : zoneNames;
//     setSelectedFilterValue(finalDate);
//     setZoneNames(finalZonesArray);
//     fetchData(finalZonesArray, finalDate);
//   };

//   const handleClear = () => {
//     setSelectedFilterValue(yesterdayStr);
//     fetchData(zoneNames, yesterdayStr);
//   };

//   const handleRowClick = (zoneName) => {
//     setModalZoneId(zoneName);
//     setShowModal(true);
//   };
//   console.log(exportallData)
//   // let exportData = res.data?.data || [];
//   // ---------------- Render ----------------
//   return (
//     <div className="dash2-container historical-dash2">
//       <FilterBar filter={filter} onApply={handleApply} onClear={handleClear} ExportData={exportallData || []} isDash2={true} />
//       {loading ? (
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             justifyContent: "center",
//             alignItems: "center",
//             height: "70vh",
//             borderRadius: "12px",
//           }}
//         >
//           <div
//             className="spinner-border text-primary"
//             role="status"
//             style={{ width: "2rem", height: "2rem" }}
//           />
//           <p className="mt-3 text-muted">Loading data...</p>
//         </div>
//       ) : error ? (
//         <div style={{ color: "red" }}>{error}</div>
//       ) : rows && rows.length > 0 ? (
//         <CustomCard size="md" className="p-0">
//           <div className="dash2-table">
//             <div className="dash2-table-head">
//               <div>Zone Name</div>
//               <div>Total Visitors</div>
//               <div>Peak Occupancy</div>
//               <div>Peak Hour</div>
//               <div>Capacity</div>
//             </div>
//             <div className="dash2-row-list">
//               {rows.map((row, index) => (
//                 <div
//                   key={`${row.id}-${index}`}
//                   className="dash2-row dash3-clickable"
//                   onClick={() => handleRowClick(row.zone)}
//                 >
//                   <div>{row.zone}</div>
//                   <div>{row.totalVisitors}</div>
//                   <div>{row.peak}</div>
//                   <div>{row.peakHour}</div>
//                   <div>{row.capacity}</div>
//                   <div className="historical-dash2-icon">
//                     <Icon
//                       img={ZoomInIcon2}
//                       Img_width="20px"
//                       Img_height="20px"
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </CustomCard>
//       ) : (
//         <NoData name="no-data-Historical_dashboard" />
//       )}

//       {/* --- Modal --- */}
//       {showModal && (
//         <div className="dash3-modal-overlay historical-dash2-modal">
//           <div className="dash3-modal historicalData">
//             <div className="dash3-modal-header">
//               <div className="selectedDate">
//                 <p className="mb-0">
//                   <img className="cal-icon" src={CalenderIcon} alt="calendar" />
//                   <span className="date-label">Selected Date :</span>{" "}
//                   <span className="date-val">{selectedFilterValue}</span>
//                 </p>
//               </div>

//               <div className="selectedZone">
//                 <h2>{modalZoneId}</h2>
//               </div>

//               <div className="dash3-header-controls">
//                 <span className="zone-label">Zone :</span>
//                 <SingleSelectDropdown
//                   options={rows.map((r) => ({ label: r.zone, value: r.zone }))}
//                   value={
//                     modalZoneId
//                       ? { value: modalZoneId, label: modalZoneId }
//                       : null
//                   }
//                   onChange={(option) => option && setModalZoneId(option.value)}
//                   placeholder="Select Zone"
//                 />
//                 {/* <button
//                   className="btn-close"
//                   onClick={() => setShowModal(false)}
//                 /> */}
//                 <button
//                   type="button"
//                   className="historical-modal-close"
//                   onClick={() => setShowModal(false)}
//                   aria-label="Close"
//                 >
//                   ×
//                 </button>
//               </div>
//             </div>

//             {/* --- Modal Content --- */}
//             {modalLoading ? (
//               <div
//                 style={{
//                   display: "flex",
//                   flexDirection: "column",
//                   justifyContent: "center",
//                   alignItems: "center",
//                   height: "69vh",
//                   borderRadius: "12px",
//                 }}
//               >
//                 <Spinner
//                   animation="border"
//                   variant="primary"
//                   style={{ width: "2rem", height: "2rem" }}
//                 />
//                 <p className="mt-3 text-muted">Loading chart...</p>
//               </div>
//             ) : modalData ? (
//               <div>
//                 {/* Stat cards */}
//                 <div className="container-fluid mt-3 px-0">
//                   <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
//                     <div className="col">
//                       <StatCard
//                         icon={OccupancyIcon}
//                         value={modalData.totalVisitors}
//                         label="Total Visitors"
//                       />
//                     </div>
//                     <div className="col">
//                       <StatCard
//                         icon={PeakOccupancy}
//                         value={modalData.peakOccupancy}
//                         label="Peak Occupancy"
//                       />
//                     </div>
//                     <div className="col">
//                       <StatCard
//                         icon={PeakHour}
//                         value={modalData.peakHour}
//                         label="Peak Hour"
//                         isHour
//                       />
//                     </div>
//                   </div>
//                 </div>
//                 {/* Chart */}
//                 <div className="histChartSec">
//                   <div className="analytics-header histor_dash2">
//                     <h5 className="analytics-header histor_dash2_label">
//                       Hourly Trends
//                     </h5>
//                   </div>
//                   <HistoricalAnalyticsDash2Chart data={modalData?.data || []} />
//                   {/* <HistoricalAnalyticsDash2Chart data={dummydata1 || []} /> */}
//                 </div>
//               </div>
//             ) : (
//               <div
//                 className="Dash2_NoDataTopsection"
//                 style={{ height: "75vh" }}
//               >
//                 <NoData name="no-data-container" />
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ---------------- StatCard ----------------
// const StatCard = ({ icon, value, label, isHour = false }) => {
//   const props = useSpring({ val: Number(value) || 0, from: { val: 0 } });
//   return (
//     <div className="dash3-stat-card">
//       <div className="cardsec1">
//         <Icon img={icon} Img_width="32px" Img_height="32px" />
//         <div className="dash3-stat-main">
//           {isHour ? (
//             <span>
//               {value}
//               <span className="hrtext">Hr</span>
//             </span>
//           ) : (
//             <animated.span>{props.val.to((n) => Math.floor(n))}</animated.span>
//           )}
//         </div>
//       </div>
//       <div className="dash3-stat-label">{label}</div>
//     </div>
//   );
// };

// export default HistoricalDashboard2;

import React, { useState, useCallback, useEffect } from "react";
import CustomCard from "../CommonComponents/Card";
import "../../Components/Styles/Table.css";
import "../../Components/Styles/Dashboard2.css";
import "../../Components/Styles/Dashboard3.css";
import axios from "axios";
import { useSpring, animated } from "@react-spring/web";
import { Tab, Nav, Spinner } from "react-bootstrap";
import Icon from "../CommonComponents/icon";
import Loader from "../CommonComponents/Loader";
import FilterBar from "./FilterBar";
import SingleSelectDropdown from "../CommonComponents/SingleSelectDropdown";

import LowOccupancy from "../../Components/Assets/dashboard/sv_peakoccupancy.svg";
import LowHour from "../../Components/Assets/dashboard/sv_peakhour.svg";
import PeakOccupancy from "../../Components/Assets/dashboard/peakoccupancy.svg";
import PeakHour from "../../Components/Assets/dashboard/peakHour.svg";
import OccupancyIcon from "../../Components/Assets/dashboard/sv_occupancy.svg";

import HistoricalAnalyticsDash2Chart from "./HistoricalDash2Chart";
import ZoomInIcon2 from "../../Components/Assets/ZoomIn.svg";
import CalenderIcon from "../../Components/Assets/calender-icon.svg";

import "../Historical Analytics/HistoricalChart.css";
import NoData from "../CommonComponents/NoDataAvailable";

// ---------------- Helpers ----------------

const formatDate = (date) => {
  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);

  return formatDate(d);
};

const today = new Date();
const yesterdayDate = new Date(today);
yesterdayDate.setDate(today.getDate() - 1);

const yesterdayStr = formatDate(yesterdayDate);

// ---------------- Main Component ----------------

const HistoricalDashboard2 = ({
  isActive = false,
  filterVersion,
  zonesFromParent,
}) => {
  // Dashboard states
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState(null);

  const [exportallData, setExportData] = useState(null);

  // Modal states
  const [modalZoneId, setModalZoneId] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter states
  const [filter, setFilter] = useState("Yesterday");

  const [zoneNames, setZoneNames] = useState([]);

  const [selectedFilterValue, setSelectedFilterValue] = useState(yesterdayStr);

  // Stores applied custom start and end time
  const [appliedDateTime, setAppliedDateTime] = useState(null);

  // Session and API details
  const token = sessionStorage.getItem("token");
  const vid = sessionStorage.getItem("vid");
  const username = sessionStorage.getItem("username");

  const API_URL = import.meta.env.VITE_API_URL;

  // ==================================================
  // 1. FETCH DASHBOARD 2 TABLE DATA
  // ==================================================

  const fetchData = useCallback(
    async (zonesInput, fromDate, dateTimeFilter = null) => {
      // Convert selected zones into comma-separated string
      const zonesString = Array.isArray(zonesInput)
        ? zonesInput.map((z) => (typeof z === "object" ? z.label : z)).join(",")
        : zonesInput;

      if (!zonesString || !fromDate) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Default full-day time range for predefined filters
        const startTime = dateTimeFilter ? dateTimeFilter.startTime : "00:00";

        const endTime = dateTimeFilter ? dateTimeFilter.endTime : "23:59";

        // Prepare API payload
        const payload = {
          zoneName: zonesString,
          fromDate: fromDate
          // startDate: `${fromDate}, ${startTime}:00`,

          // endDate: `${fromDate}, ${endTime}:59`,
        };

        console.log("========== DASHBOARD 2 API ==========");
        console.log(
          "API URL:",
          `${API_URL}/dashboard/getHistoricalDashboard2Data`,
        );
        console.log("Selected Zones:", zonesString);
        console.log("Selected Date:", fromDate);
        console.log("Selected Date Time:", dateTimeFilter);
        console.log("Complete API Payload:", payload);
        console.log("=====================================");

        const endpoint = `${API_URL}/dashboard/getHistoricalDashboard2Data`;

        const res = await axios.get(endpoint, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          params: payload,
        });

        console.log("Dashboard 2 API Response:", res.data);

        // Store original response for export
        const responseData = res.data?.data || [];

        setExportData(responseData);

        // Transform API response for table
        const transformed = responseData.map((r) => ({
          id: r.ZoneName,
          zone: r.ZoneName,
          totalVisitors: r.TotalVisitors,
          peak: r.PeakOccupancy,
          peakHour: r.PeakHour,
          low: r.Lowoccupancy,
          capacity: r.Capacity,
        }));

        setRows(transformed);
      } catch (e) {
        console.error("Dashboard 2 API Error:", e);

        setError(
          e.response?.data?.message || e.message || "Error fetching data",
        );

        setRows([]);
        setExportData([]);
      } finally {
        setLoading(false);
      }
    },
    [API_URL, token],
  );

  // ==================================================
  // 2. FETCH SELECTED ZONES
  // ==================================================

  const getSelectedZones = useCallback(async () => {
    try {
      const payload = {
        vid,
        username,
        country: "",
        city: "",
        zone: "",
      };

      const response = await axios.get(
        `${API_URL}/dashboard/dashboardFilter/getSelectedZones`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: payload,
        },
      );

      const rawData = response.data?.data || [];

      let zonesArray = [];

      if (Array.isArray(rawData) && rawData[0]?.selectedZones) {
        zonesArray = rawData[0].selectedZones.map((z) => String(z));
      } else if (rawData.selectedZones) {
        zonesArray = rawData.selectedZones.map((z) => String(z));
      }

      console.log("Selected Zones:", zonesArray);

      // Updating zones triggers the table data effect
      setZoneNames(zonesArray);
    } catch (e) {
      console.error("Error fetching selected zones:", e);

      setZoneNames([]);
      setRows([]);
    }
  }, [API_URL, token, vid, username]);

  // ==================================================
  // 3. FETCH MODAL HOURLY TREND DATA
  // ==================================================

  const fetchModalData = useCallback(
    async (zoneId, fromDate) => {
      if (!zoneId || !fromDate) return;

      setModalLoading(true);

      try {
        const endpoint = `${API_URL}/dashboard/getHistoricalDashboard2HourlyTrends`;

        const res = await axios.get(endpoint, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },

          // Existing modal API parameters preserved
          params: {
            zoneName: zoneId,
            fromDate,
          },
        });

        console.log("Modal API Response:", res.data);

        setModalData(res.data || null);
      } catch (e) {
        console.error("Modal API Error:", e);

        setError(
          e.response?.data?.message ||
            e.message ||
            "Error fetching zone details",
        );

        setModalData(null);
      } finally {
        setModalLoading(false);
      }
    },
    [API_URL, token],
  );

  // ==================================================
  // 4. INITIAL ZONES LOAD / PARENT ZONE CHANGES
  // ==================================================

  useEffect(() => {
    if (filterVersion > 0 && zonesFromParent?.length > 0) {
      console.log("Zones received from parent:", zonesFromParent);

      setZoneNames([...zonesFromParent]);
    } else {
      getSelectedZones();
    }
  }, [filterVersion, zonesFromParent, getSelectedZones]);

  // ==================================================
  // 5. FETCH TABLE DATA WHEN FILTERS CHANGE
  // ==================================================

  useEffect(() => {
    if (!zoneNames.length) return;

    fetchData(zoneNames, selectedFilterValue, appliedDateTime);
  }, [zoneNames, selectedFilterValue, appliedDateTime, fetchData]);

  // ==================================================
  // 6. FETCH MODAL DATA WHEN ZONE / DATE CHANGES
  // ==================================================

  useEffect(() => {
    if (modalZoneId) {
      fetchModalData(modalZoneId, selectedFilterValue);
    }
  }, [modalZoneId, selectedFilterValue, fetchModalData]);

  // ==================================================
  // 7. APPLY FILTER
  // ==================================================

  // FilterBar sends:
  // First argument  = selected date
  // Second argument = dateTimeFilter object or null

  const handleApply = (dateValue, dateTimeFilter = null) => {
    const finalDate = dateValue || selectedFilterValue;

    // Zones are maintained in Dashboard 2 state
    const finalZonesArray = zoneNames;

    console.log("========== DASHBOARD 2 FILTER ==========");
    console.log("Selected Zones:", finalZonesArray);
    console.log("Selected Date:", finalDate);
    console.log("Selected Date Time:", dateTimeFilter);
    console.log("========================================");

    setSelectedFilterValue(finalDate);

    setAppliedDateTime(dateTimeFilter);

    // API call happens through the filter useEffect
  };

  // ==================================================
  // 8. CLEAR FILTER
  // ==================================================

  const handleClear = () => {
    console.log("Clearing Dashboard 2 filters");

    setSelectedFilterValue(yesterdayStr);

    setAppliedDateTime(null);

    // API call happens through the filter useEffect
  };

  // ==================================================
  // 9. TABLE ROW CLICK
  // ==================================================

  const handleRowClick = (zoneName) => {
    setModalZoneId(zoneName);

    setShowModal(true);
  };

  // ==================================================
  // 10. RENDER
  // ==================================================

  return (
    <div className="dash2-container historical-dash2">
      {/* FILTER BAR */}

      <FilterBar
        filter={filter}
        onApply={handleApply}
        onClear={handleClear}
        ExportData={exportallData || []}
        isDash2={true}
      />

      {/* TABLE LOADING */}

      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "70vh",
            borderRadius: "12px",
          }}
        >
          <div
            className="spinner-border text-primary"
            role="status"
            style={{
              width: "2rem",
              height: "2rem",
            }}
          />

          <p className="mt-3 text-muted">Loading data...</p>
        </div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : rows && rows.length > 0 ? (
        <CustomCard size="md" className="p-0">
          <div className="dash2-table">
            <div className="dash2-table-head">
              <div>Zone Name</div>

              <div>Total Visitors</div>

              <div>Peak Occupancy</div>

              <div>Peak Hour</div>

              <div>Capacity</div>
            </div>

            <div className="dash2-row-list">
              {rows.map((row, index) => (
                <div
                  key={`${row.id}-${index}`}
                  className="dash2-row dash3-clickable"
                  onClick={() => handleRowClick(row.zone)}
                >
                  <div>{row.zone}</div>

                  <div>{row.totalVisitors}</div>

                  <div>{row.peak}</div>

                  <div>{row.peakHour}</div>

                  <div>{row.capacity}</div>

                  <div className="historical-dash2-icon">
                    <Icon
                      img={ZoomInIcon2}
                      Img_width="20px"
                      Img_height="20px"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CustomCard>
      ) : (
        <NoData name="no-data-Historical_dashboard" />
      )}

      {/* ==================================================
          MODAL
      ================================================== */}

      {showModal && (
        <div className="dash3-modal-overlay historical-dash2-modal">
          <div className="dash3-modal historicalData">
            {/* MODAL HEADER */}

            <div className="dash3-modal-header">
              <div className="selectedDate">
                <p className="mb-0">
                  <img className="cal-icon" src={CalenderIcon} alt="calendar" />
                  <span className="date-label">Selected Date :</span>{" "}
                  <span className="date-val">{selectedFilterValue}</span>
                </p>
              </div>

              <div className="selectedZone">
                <h2>{modalZoneId}</h2>
              </div>

              <div className="dash3-header-controls">
                <span className="zone-label">Zone :</span>

                <SingleSelectDropdown
                  options={rows.map((r) => ({
                    label: r.zone,
                    value: r.zone,
                  }))}
                  value={
                    modalZoneId
                      ? {
                          value: modalZoneId,
                          label: modalZoneId,
                        }
                      : null
                  }
                  onChange={(option) => option && setModalZoneId(option.value)}
                  placeholder="Select Zone"
                />

                <button
                  type="button"
                  className="historical-modal-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* MODAL CONTENT */}

            {modalLoading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "69vh",
                  borderRadius: "12px",
                }}
              >
                <Spinner
                  animation="border"
                  variant="primary"
                  style={{
                    width: "2rem",
                    height: "2rem",
                  }}
                />

                <p className="mt-3 text-muted">Loading chart...</p>
              </div>
            ) : modalData ? (
              <div>
                {/* STAT CARDS */}

                <div className="container-fluid mt-3 px-0">
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                    <div className="col">
                      <StatCard
                        icon={OccupancyIcon}
                        value={modalData.totalVisitors}
                        label="Total Visitors"
                      />
                    </div>

                    <div className="col">
                      <StatCard
                        icon={PeakOccupancy}
                        value={modalData.peakOccupancy}
                        label="Peak Occupancy"
                      />
                    </div>

                    <div className="col">
                      <StatCard
                        icon={PeakHour}
                        value={modalData.peakHour}
                        label="Peak Hour"
                        isHour
                      />
                    </div>
                  </div>
                </div>

                {/* HOURLY TREND CHART */}

                <div className="histChartSec">
                  <div className="analytics-header histor_dash2">
                    <h5 className="analytics-header histor_dash2_label">
                      Hourly Trends
                    </h5>
                  </div>

                  <HistoricalAnalyticsDash2Chart data={modalData?.data || []} />
                </div>
              </div>
            ) : (
              <div
                className="Dash2_NoDataTopsection"
                style={{ height: "75vh" }}
              >
                <NoData name="no-data-container" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================================================
// STAT CARD COMPONENT
// ==================================================

const StatCard = ({ icon, value, label, isHour = false }) => {
  const props = useSpring({
    val: Number(value) || 0,
    from: { val: 0 },
  });

  return (
    <div className="dash3-stat-card">
      <div className="cardsec1">
        <Icon img={icon} Img_width="32px" Img_height="32px" />

        <div className="dash3-stat-main">
          {isHour ? (
            <span>
              {value}
              <span className="hrtext">Hr</span>
            </span>
          ) : (
            <animated.span>{props.val.to((n) => Math.floor(n))}</animated.span>
          )}
        </div>
      </div>

      <div className="dash3-stat-label">{label}</div>
    </div>
  );
};

export default HistoricalDashboard2;
