// import React, { useEffect, useRef, useState } from "react";
// import dayjs from "dayjs";

// import "../../Styles/mallwiseTV.css";

// import {
//   getDashboardWidgets,
//   getHeatmapFilter1,
//   getHeatmapMallandZoneDashboard,
//   getLiveOccupancy,
// } from "../../api/HeatmapDashboardApis";

// import TVSidebar from "./TVSidebar";
// import TVFooter from "./TVFooter";

// import { FiMapPin, FiShoppingBag, FiLayers, FiUser } from "react-icons/fi";

// import Select from "react-select";

// import "../../Styles/LoaderOverlay.css";
// import { Spinner } from "react-bootstrap";

// import OccupancyOverview from "./Overview";

// import ZoneHeatmapCanvasTV from "../../CommonComponents/ZoneHeatmapCanvasTV";

// import { AlertCircle } from "lucide-react";

// import "../../../../Components/Styles/NoData.css";

// // ============================================================
// // Zonewise TV
// // ============================================================

// const ZonewiseTV = () => {
//   // ==========================================================
//   // STATE
//   // ==========================================================

//   const [loading, setLoading] = useState(false);

//   const [noDataAvailable, setNoDataAvailable] = useState(false);

//   const [dashboardData, setDashboardData] = useState([]);

//   const [selectedMall, setSelectedMall] = useState(null);

//   const [selectedFloor, setSelectedFloor] = useState(null);

//   const [selectedZone, setSelectedZone] = useState(null);

//   // ==========================================================
//   // DASHBOARD KPI CARDS
//   // ==========================================================

//   const [cards, setCards] = useState({
//     widget1: {},
//     widget2: {},
//     widget3: {},
//     widget4: {},
//   });

//   // ==========================================================
//   // LIVE OCCUPANCY
//   //
//   // Current Occupancy + Capacity
//   // comes from separate API
//   // ==========================================================

//   const [liveOccupancy, setLiveOccupancy] = useState({
//     totalOccupancy: 0,
//     totalCapacities: 0,
//   });

//   // ==========================================================
//   // DASHBOARD PAYLOAD
//   //
//   // Used only for heatmap/floor data
//   // ==========================================================

//   const [dashboardPayload, setDashboardPayload] = useState(null);

//   const [filtersLoaded, setFiltersLoaded] = useState(false);

//   const [filterData, setFilterData] = useState([]);

//   // ==========================================================
//   // SESSION DATA
//   // ==========================================================

//   const username = sessionStorage.getItem("username");

//   const role = sessionStorage.getItem("role");

//   const token = sessionStorage.getItem("token");

//   const vid = sessionStorage.getItem("vid");

//   // ==========================================================
//   // REFS
//   // ==========================================================

//   const selectedMallRef = useRef(null);

//   const selectedFloorRef = useRef(null);

//   const selectedZoneRef = useRef(null);

//   const dashboardDataRef = useRef([]);

//   // ==========================================================
//   // AUTO ROTATION INDEX
//   // ==========================================================

//   const autoRotateRef = useRef({
//     mallIndex: 0,
//     floorIndex: 0,
//     zoneIndex: 0,
//   });

//   // ==========================================================
//   // LOAD FILTER DATA
//   // ==========================================================

//   const loadFilters = async () => {
//     setLoading(true);

//     try {
//       const res = await getHeatmapFilter1(username);

//       console.log("Heatmap Filter API Response:", res);

//       const responseData = res?.savedFilter || [];

//       const apiData = res?.data || [];

//       // ======================================================
//       // NO DATA
//       // ======================================================

//       if (!apiData.length && !responseData.length) {
//         console.log("No heatmap data or saved filters available");

//         setNoDataAvailable(true);

//         setFilterData([]);

//         setDashboardData([]);

//         setSelectedMall(null);

//         setSelectedFloor(null);

//         setSelectedZone(null);

//         setFiltersLoaded(false);

//         return;
//       }

//       // ======================================================
//       // DATA AVAILABLE
//       // ======================================================

//       setNoDataAvailable(false);

//       setFilterData(responseData);

//       // ======================================================
//       // DEFAULT MALL
//       // ======================================================

//       const firstMall = responseData?.[0] || null;

//       // ======================================================
//       // DEFAULT FLOOR
//       // ======================================================

//       const firstFloor = firstMall?.floors?.[0] || null;

//       // ======================================================
//       // DEFAULT ZONE
//       // ======================================================

//       const firstZone = firstFloor?.zones?.[0] || null;

//       setSelectedMall(firstMall);

//       setSelectedFloor(firstFloor);

//       setSelectedZone(firstZone);

//       // ======================================================
//       // UPDATE REFS
//       // ======================================================

//       selectedMallRef.current = firstMall;

//       selectedFloorRef.current = firstFloor;

//       selectedZoneRef.current = firstZone;

//       // ======================================================
//       // HEATMAP DASHBOARD PAYLOAD
//       //
//       // All configured zones are required for the heatmap
//       // ======================================================

//       const newDashboardPayload = {
//         inputDate: dayjs().format("YYYY-MM-DD"),

//         filters: responseData.flatMap((mall) =>
//           (mall.floors || []).flatMap((floor) =>
//             (floor.zones || []).map((zone) => ({
//               mallName: mall.mallName,

//               floorName: floor.floorName,

//               zoneName: zone.zoneName,
//             })),
//           ),
//         ),
//       };

//       setDashboardPayload(newDashboardPayload);

//       console.log("Zonewise Heatmap Dashboard Payload:", newDashboardPayload);

//       setFiltersLoaded(true);
//     } catch (error) {
//       console.error("Error loading filters:", error);

//       setNoDataAvailable(true);

//       setFiltersLoaded(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==========================================================
//   // LIVE OCCUPANCY API
//   //
//   // Current selected zone ONLY
//   //
//   // POST /heatmapConfig/liveOccupancy
//   //
//   // Payload:
//   //
//   // {
//   //   username: "Occupancy",
//   //   selectedZones: "Office-Entrance"
//   // }
//   // ==========================================================

//   const loadLiveOccupancy = async (zone) => {
//     try {
//       if (!zone) {
//         return;
//       }

//       const payload = {
//         username: "Occupancy",

//         selectedZones: zone?.zoneName || "",
//       };

//       console.log("==========================================");

//       console.log("Zonewise Live Occupancy Payload:", payload);

//       console.log("==========================================");

//       const response = await getLiveOccupancy(payload);

//       console.log("Zonewise Live Occupancy Response:", response);

//       // ======================================================
//       // SUCCESS
//       // ======================================================

//       if (response?.success) {
//         setLiveOccupancy({
//           totalOccupancy: response?.totalOccupancy ?? 0,

//           totalCapacities: response?.totalCapacities ?? 0,
//         });
//       } else {
//         setLiveOccupancy({
//           totalOccupancy: 0,

//           totalCapacities: 0,
//         });
//       }
//     } catch (error) {
//       console.error("Zonewise Live Occupancy API Error:", error);
//     }
//   };

//   // ==========================================================
//   // ZONEWISE KPI API
//   //
//   // Total Visitors
//   // Peak Occupancy
//   // Peak Hour
//   //
//   // Only CURRENT selected zone
//   // ==========================================================

//   const loadZoneKPIs = async (mall, floor, zone) => {
//     try {
//       if (!mall || !floor || !zone) {
//         return;
//       }

//       const payload = {
//         mallname: mall.mallName,

//         floorname: floor.floorName,

//         zonename: zone.zoneName,

//         inputDate: dayjs().format("YYYY-MM-DD"),
//       };

//       console.log("==========================================");

//       console.log("Zonewise KPI Payload:", payload);

//       console.log("==========================================");

//       const widgets = await getDashboardWidgets(payload);

//       console.log("Zonewise KPI Response:", widgets);

//       setCards(
//         widgets || {
//           widget1: {},
//           widget2: {},
//           widget3: {},
//           widget4: {},
//         },
//       );
//     } catch (error) {
//       console.error("Zonewise KPI API Error:", error);
//     }
//   };

//   // ==========================================================
//   // LOAD CURRENT ZONE DATA
//   //
//   // This is the main function for KPI refresh.
//   //
//   // API 1:
//   // liveOccupancy
//   //
//   // API 2:
//   // getDashboardWidgets
//   // ==========================================================

//   const loadCurrentZoneData = async (mall, floor, zone) => {
//     if (!mall || !floor || !zone) {
//       return;
//     }

//     console.log("==========================================");

//     console.log("Loading Current Zone Data");

//     console.log("Mall:", mall.mallName);

//     console.log("Floor:", floor.floorName);

//     console.log("Zone:", zone.zoneName);

//     console.log("==========================================");

//     await Promise.all([
//       // ------------------------------------------
//       // Current Occupancy + Capacity
//       // ------------------------------------------

//       loadLiveOccupancy(zone),

//       // ------------------------------------------
//       // Total Visitors + Peak Occupancy + Peak Hour
//       // ------------------------------------------

//       loadZoneKPIs(mall, floor, zone),
//     ]);
//   };

//   // ==========================================================
//   // LOAD HEATMAP DASHBOARD
//   //
//   // This API loads floor/zone map data.
//   //
//   // KPI APIs are NOT called with all zones here.
//   // KPI APIs are handled separately using current zone.
//   // ==========================================================

//   const loadDashboard = async (showLoader = true) => {
//     try {
//       if (!dashboardPayload) {
//         return;
//       }

//       if (showLoader) {
//         setLoading(true);
//       }

//       // ======================================================
//       // HEATMAP API ONLY
//       // ======================================================

//       const requestPayload = {
//         ...dashboardPayload,
//         inputDate: dayjs().format("YYYY-MM-DD"),
//       };

//       console.log("[TV] Heatmap API date:", requestPayload.inputDate);
//       console.log("[TV] Heatmap API payload:", requestPayload);

//       const dashboard = await getHeatmapMallandZoneDashboard(
//         requestPayload
//       );

//       console.log("[TV] Heatmap API response:", dashboard);
      
//       // const dashboard = await getHeatmapMallandZoneDashboard(dashboardPayload);

//       // console.log("Zonewise Heatmap Response:", dashboard);

//       // ======================================================
//       // NORMALIZE DATA
//       // ======================================================

//       const malls = (dashboard?.malls || []).map((mall) => ({
//         ...mall,

//         floors: (mall?.floors || []).map((floor) => ({
//           ...floor,

//           zones: (floor?.zones || []).map((zone) => ({
//             ...zone,

//             points: zone?.points?.points || [],
//           })),
//         })),
//       }));

//       // ======================================================
//       // NO DATA
//       // ======================================================

//       if (!malls.length) {
//         console.log("Dashboard API returned no malls");

//         setNoDataAvailable(true);

//         setDashboardData([]);

//         setSelectedMall(null);

//         setSelectedFloor(null);

//         setSelectedZone(null);

//         dashboardDataRef.current = [];

//         return;
//       }

//       setNoDataAvailable(false);

//       // ======================================================
//       // STORE DASHBOARD DATA
//       // ======================================================

//       setDashboardData(malls);

//       dashboardDataRef.current = malls;

//       // ======================================================
//       // PRESERVE CURRENT MALL
//       // ======================================================

//       const currentMall =
//         malls.find((mall) => mall.mallId === selectedMallRef.current?.mallId) ||
//         malls[0];

//       // ======================================================
//       // PRESERVE CURRENT FLOOR
//       // ======================================================

//       const currentFloor =
//         currentMall?.floors?.find(
//           (floor) => floor.floorId === selectedFloorRef.current?.floorId,
//         ) ||
//         currentMall?.floors?.[0] ||
//         null;

//       // ======================================================
//       // PRESERVE CURRENT ZONE
//       // ======================================================

//       const currentZone =
//         currentFloor?.zones?.find(
//           (zone) => zone.zoneId === selectedZoneRef.current?.zoneId,
//         ) ||
//         currentFloor?.zones?.[0] ||
//         null;

//       // ======================================================
//       // UPDATE STATE
//       // ======================================================

//       setSelectedMall(currentMall);

//       setSelectedFloor(currentFloor);

//       setSelectedZone(currentZone);

//       // ======================================================
//       // UPDATE REFS IMMEDIATELY
//       // ======================================================

//       selectedMallRef.current = currentMall;

//       selectedFloorRef.current = currentFloor;

//       selectedZoneRef.current = currentZone;

//       // ======================================================
//       // LOAD KPI DATA FOR CURRENT ZONE
//       // ======================================================

//       await loadCurrentZoneData(currentMall, currentFloor, currentZone);

//       // ======================================================
//       // UPDATE ROTATION INDEX
//       // ======================================================

//       const currentMallIndex = malls.findIndex(
//         (mall) => mall.mallId === currentMall?.mallId,
//       );

//       const currentFloorIndex = currentMall?.floors?.findIndex(
//         (floor) => floor.floorId === currentFloor?.floorId,
//       );

//       const currentZoneIndex = currentFloor?.zones?.findIndex(
//         (zone) => zone.zoneId === currentZone?.zoneId,
//       );

//       autoRotateRef.current = {
//         mallIndex: Math.max(0, currentMallIndex),

//         floorIndex: Math.max(0, currentFloorIndex),

//         zoneIndex: Math.max(0, currentZoneIndex),
//       };
//     } catch (error) {
//       console.error("Zonewise dashboard error:", error);
//     } finally {
//       if (showLoader) {
//         setLoading(false);
//       }
//     }
//   };

//   // ==========================================================
//   // INITIAL FILTER LOAD
//   // ==========================================================

//   useEffect(() => {
//     loadFilters();
//   }, []);

//   // ==========================================================
//   // KEEP MALL REF UPDATED
//   // ==========================================================

//   useEffect(() => {
//     selectedMallRef.current = selectedMall;
//   }, [selectedMall]);

//   // ==========================================================
//   // KEEP FLOOR REF UPDATED
//   // ==========================================================

//   useEffect(() => {
//     selectedFloorRef.current = selectedFloor;
//   }, [selectedFloor]);

//   // ==========================================================
//   // KEEP ZONE REF UPDATED
//   // ==========================================================

//   useEffect(() => {
//     selectedZoneRef.current = selectedZone;
//   }, [selectedZone]);

//   // ==========================================================
//   // INITIAL LOAD + 15 SECOND REFRESH
//   //
//   // Every 15 seconds:
//   //
//   // 1. Heatmap refresh
//   // 2. Current zone KPI refresh
//   // 3. Live Occupancy refresh
//   // ==========================================================

//   useEffect(() => {
//     if (!filtersLoaded) {
//       return;
//     }

//     // ========================================================
//     // INITIAL LOAD
//     // ========================================================

//     loadDashboard(true);

//     // ========================================================
//     // 15 SECOND REFRESH
//     // ========================================================

//     const interval = setInterval(async () => {
//       const malls = dashboardDataRef.current;

//       if (!malls.length) {
//         return;
//       }

//       let { mallIndex, floorIndex, zoneIndex } = autoRotateRef.current;

//       // ====================================================
//       // CURRENT MALL
//       // ====================================================

//       const mall = malls[mallIndex];

//       if (!mall) {
//         return;
//       }

//       // ====================================================
//       // CURRENT FLOOR
//       // ====================================================

//       const floor = mall?.floors?.[floorIndex];

//       if (!floor) {
//         return;
//       }

//       // ====================================================
//       // NEXT ZONE
//       // ====================================================

//       if (zoneIndex < floor.zones.length - 1) {
//         zoneIndex++;
//       } else {
//         zoneIndex = 0;

//         // ================================================
//         // NEXT FLOOR
//         // ================================================

//         if (floorIndex < mall.floors.length - 1) {
//           floorIndex++;
//         } else {
//           floorIndex = 0;

//           // ==============================================
//           // NEXT MALL
//           // ==============================================

//           if (mallIndex < malls.length - 1) {
//             mallIndex++;
//           } else {
//             mallIndex = 0;
//           }
//         }
//       }

//       // ====================================================
//       // NEXT MALL / FLOOR / ZONE
//       // ====================================================

//       const nextMall = malls[mallIndex];

//       const nextFloor = nextMall?.floors?.[floorIndex];

//       const nextZone = nextFloor?.zones?.[zoneIndex];

//       if (!nextMall || !nextFloor || !nextZone) {
//         return;
//       }

//       // ====================================================
//       // UPDATE DISPLAY
//       // ====================================================

//       setSelectedMall(nextMall);

//       setSelectedFloor(nextFloor);

//       setSelectedZone(nextZone);

//       // ====================================================
//       // UPDATE REFS IMMEDIATELY
//       // ====================================================

//       selectedMallRef.current = nextMall;

//       selectedFloorRef.current = nextFloor;

//       selectedZoneRef.current = nextZone;

//       // ====================================================
//       // UPDATE ROTATION INDEX
//       // ====================================================

//       autoRotateRef.current = {
//         mallIndex,

//         floorIndex,

//         zoneIndex,
//       };

//       // ====================================================
//       // REFRESH HEATMAP
//       //
//       // This refreshes the heatmap data.
//       // ====================================================

//       try {
//         const requestPayload = {
//           ...dashboardPayload,
//           inputDate: dayjs().format("YYYY-MM-DD"),
//         };

//         console.log("[TV] 15-second refresh date:", requestPayload.inputDate);

//         const dashboard = await getHeatmapMallandZoneDashboard(
//           requestPayload
//         );

//         const mallsUpdated = (dashboard?.malls || []).map((mall) => ({
//           ...mall,

//           floors: (mall?.floors || []).map((floor) => ({
//             ...floor,

//             zones: (floor?.zones || []).map((zone) => ({
//               ...zone,

//               points: zone?.points?.points || [],
//             })),
//           })),
//         }));

//         if (mallsUpdated.length) {
//           setDashboardData(mallsUpdated);

//           dashboardDataRef.current = mallsUpdated;
//         }
//       } catch (error) {
//         console.error("15s Heatmap Refresh Error:", error);
//       }

//       // ====================================================
//       // REFRESH CURRENT ZONE KPI
//       //
//       // IMPORTANT:
//       // Uses nextZone, NOT all zones.
//       // ====================================================

//       await loadCurrentZoneData(nextMall, nextFloor, nextZone);
//     }, 15000);

//     return () => {
//       clearInterval(interval);
//     };
//   }, [filtersLoaded, dashboardPayload]);

//   // ==========================================================
//   // CURRENT MALL
//   // ==========================================================

//   const dashboardMall = dashboardData.find(
//     (mall) => mall.mallId === selectedMall?.mallId,
//   );

//   // ==========================================================
//   // CURRENT FLOOR
//   // ==========================================================

//   const dashboardFloor = dashboardMall?.floors?.find(
//     (floor) => floor.floorId === selectedFloor?.floorId,
//   );

//   // ==========================================================
//   // CURRENT ZONE
//   // ==========================================================

//   const dashboardZone = dashboardFloor?.zones?.find(
//     (zone) => zone.zoneId === selectedZone?.zoneId,
//   );

//   // ==========================================================
//   // WIDGET DATA
//   // ==========================================================

//   const widget1 = cards?.widget1?.data?.[0] || {};

//   const widget2 = cards?.widget2?.data?.[0] || {};

//   const widget3 = cards?.widget3?.data?.[0] || {};

//   const widget4 = cards?.widget4?.data?.[0] || {};

//   // ==========================================================
//   // MALL OPTIONS
//   // ==========================================================

//   const mallOptions = dashboardData.map((mall) => ({
//     value: mall.mallId,

//     label: mall.mallName,
//   }));

//   // ==========================================================
//   // FLOOR OPTIONS
//   // ==========================================================

//   const floorOptions =
//     dashboardMall?.floors?.map((floor) => ({
//       value: floor.floorId,

//       label: floor.floorName,
//     })) || [];

//   // ==========================================================
//   // ZONE OPTIONS
//   // ==========================================================

//   const zoneOptions =
//     dashboardFloor?.zones?.map((zone) => ({
//       value: zone.zoneId,

//       label: zone.zoneName,
//     })) || [];

//   // ==========================================================
//   // RENDER
//   // ==========================================================

//   return (
//     <div className="tv-page">
//       {/* =====================================================
//           HEADER
//           ===================================================== */}

//       <div className="tv-header">
//         {/* ===================================================
//             HEADER TITLE
//             =================================================== */}

//         <div className="tv-header-left">
//           <h2>Heatmap Dashboard - Zonewise</h2>
//         </div>

//         {/* ===================================================
//             LOADER
//             =================================================== */}

//         {loading && (
//           <div className="loader-overlay">
//             <Spinner animation="border" variant="primary" />

//             <p>Loading heatmap data...</p>
//           </div>
//         )}

//         {/* ===================================================
//             HEADER RIGHT
//             =================================================== */}

//         <div className="tv-header-right">
//           {/* =================================================
//               MALL / FLOOR / ZONE FILTERS
//               ================================================= */}

//           {!noDataAvailable && !loading && (
//             <>
//               {/* ==========================================
//                     MALL
//                     ========================================== */}

//               <div className="filter-group-horizontal">
//                 <label className="filter-inline-label">Mall :</label>

//                 <div className="tv-filter-card">
//                   <div className="tv-select-box">
//                     <FiShoppingBag className="tv-icon" />

//                     <Select
//                       className="tv-react-select"
//                       classNamePrefix="tv-select"
//                       isSearchable={false}
//                       options={mallOptions}
//                       value={
//                         mallOptions.find(
//                           (mall) => mall.value === selectedMall?.mallId,
//                         ) || null
//                       }
//                       onChange={async (option) => {
//                         if (!option) {
//                           return;
//                         }

//                         const mallIndex = dashboardData.findIndex(
//                           (mall) => mall.mallId === option.value,
//                         );

//                         if (mallIndex === -1) {
//                           return;
//                         }

//                         const mall = dashboardData[mallIndex];

//                         const floor = mall?.floors?.[0] || null;

//                         const zone = floor?.zones?.[0] || null;

//                         if (!mall || !floor || !zone) {
//                           return;
//                         }

//                         // --------------------------------
//                         // UPDATE STATE
//                         // --------------------------------

//                         setSelectedMall(mall);

//                         setSelectedFloor(floor);

//                         setSelectedZone(zone);

//                         // --------------------------------
//                         // UPDATE REFS
//                         // --------------------------------

//                         selectedMallRef.current = mall;

//                         selectedFloorRef.current = floor;

//                         selectedZoneRef.current = zone;

//                         // --------------------------------
//                         // RESET ROTATION
//                         // --------------------------------

//                         autoRotateRef.current = {
//                           mallIndex,

//                           floorIndex: 0,

//                           zoneIndex: 0,
//                         };

//                         // --------------------------------
//                         // LOAD CURRENT ZONE KPI
//                         // --------------------------------

//                         await loadCurrentZoneData(mall, floor, zone);
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* ==========================================
//                     FLOOR
//                     ========================================== */}

//               <div className="filter-group-horizontal">
//                 <label className="filter-inline-label">Floor :</label>

//                 <div className="tv-filter-card">
//                   <div className="tv-select-box">
//                     <FiLayers className="tv-icon" />

//                     <Select
//                       className="tv-react-select"
//                       classNamePrefix="tv-select"
//                       isSearchable={false}
//                       options={floorOptions}
//                       value={
//                         floorOptions.find(
//                           (floor) => floor.value === selectedFloor?.floorId,
//                         ) || null
//                       }
//                       onChange={async (option) => {
//                         if (!option) {
//                           return;
//                         }

//                         const floorIndex = dashboardMall?.floors?.findIndex(
//                           (floor) => floor.floorId === option.value,
//                         );

//                         if (floorIndex === -1 || floorIndex === undefined) {
//                           return;
//                         }

//                         const floor = dashboardMall?.floors?.[floorIndex];

//                         const zone = floor?.zones?.[0] || null;

//                         if (!floor || !zone) {
//                           return;
//                         }

//                         // --------------------------------
//                         // UPDATE STATE
//                         // --------------------------------

//                         setSelectedFloor(floor);

//                         setSelectedZone(zone);

//                         // --------------------------------
//                         // UPDATE REFS
//                         // --------------------------------

//                         selectedFloorRef.current = floor;

//                         selectedZoneRef.current = zone;

//                         // --------------------------------
//                         // RESET ZONE ROTATION
//                         // --------------------------------

//                         autoRotateRef.current = {
//                           mallIndex: autoRotateRef.current.mallIndex,

//                           floorIndex,

//                           zoneIndex: 0,
//                         };

//                         // --------------------------------
//                         // LOAD CURRENT ZONE KPI
//                         // --------------------------------

//                         await loadCurrentZoneData(selectedMall, floor, zone);
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* ==========================================
//                     ZONE
//                     ========================================== */}

//               <div className="filter-group-horizontal">
//                 <label className="filter-inline-label">Zone :</label>

//                 <div className="tv-filter-card">
//                   <div className="tv-select-box">
//                     <FiMapPin className="tv-icon" />

//                     <Select
//                       className="tv-react-select"
//                       classNamePrefix="tv-select"
//                       isSearchable={false}
//                       options={zoneOptions}
//                       value={
//                         zoneOptions.find(
//                           (zone) => zone.value === selectedZone?.zoneId,
//                         ) || null
//                       }
//                       onChange={async (option) => {
//                         if (!option) {
//                           return;
//                         }

//                         const zone = dashboardFloor?.zones?.find(
//                           (zone) => zone.zoneId === option.value,
//                         );

//                         if (!zone) {
//                           return;
//                         }

//                         const zoneIndex = dashboardFloor?.zones?.findIndex(
//                           (item) => item.zoneId === zone.zoneId,
//                         );

//                         // --------------------------------
//                         // UPDATE STATE
//                         // --------------------------------

//                         setSelectedZone(zone);

//                         // --------------------------------
//                         // UPDATE REF
//                         // --------------------------------

//                         selectedZoneRef.current = zone;

//                         // --------------------------------
//                         // UPDATE ROTATION INDEX
//                         // --------------------------------

//                         autoRotateRef.current = {
//                           ...autoRotateRef.current,

//                           zoneIndex,
//                         };

//                         // --------------------------------
//                         // LOAD CURRENT ZONE KPI
//                         // --------------------------------

//                         await loadCurrentZoneData(
//                           selectedMall,
//                           selectedFloor,
//                           zone,
//                         );
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}

//           {/* =================================================
//               USER PROFILE
//               ================================================= */}

//           <div className="tv-user-profile">
//             <div className="tv-user-icon">
//               <FiUser />
//             </div>

//             <div className="tv-user-details">
//               <span className="tv-user-name" title={username || "User"}>
//                 {username || "User"}
//               </span>

//               <span className="tv-user-role">{role || "User"}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* =====================================================
//           MAIN CONTENT
//           ===================================================== */}

//       <div className="tv-content">
//         {noDataAvailable ? (
//           <div className="no-data-Heatmap_quickLinks_dashboard">
//             <AlertCircle className="no-data-icon" />

//             <h2>No Data Available</h2>

//             <p>Please configure a zone(s) in Settings → Heatmap.</p>
//           </div>
//         ) : (
//           <>
//             {/* =================================================
//                 LEFT KPI SIDEBAR
//                 ================================================= */}

//             <TVSidebar
//               widget2={widget2}
//               widget3={widget3}
//               widget4={widget4}
//               liveOccupancy={liveOccupancy}
//             />

//             {/* =================================================
//                 ZONE HEATMAP
//                 ================================================= */}

//             <div className="tv-map-container">
//               {dashboardFloor && (
//                 <ZoneHeatmapCanvasTV
//                   selectedFloor={dashboardFloor}
//                   selectedZone={dashboardZone || selectedZone}
//                 />
//               )}
//             </div>

//             {/* =================================================
//                 OCCUPANCY OVERVIEW
//                 ================================================= */}

//             <OccupancyOverview
//               selectedMall={selectedMall}
//               selectedFloor={selectedFloor}
//               capacity={822}
//             />
//           </>
//         )}
//       </div>

//       {/* =====================================================
//           FOOTER
//           ===================================================== */}

//       <TVFooter
//         rotationText={
//           noDataAvailable ? "" : "🟢 LIVE | 🔄 15s Zone Rotation & Data Refresh"
//         }
//       />
//     </div>
//   );
// };

// export default ZonewiseTV;


import React, { useEffect, useRef, useState } from "react";

import "../../Styles/mallwiseTV.css";

import {
  getDashboardWidgets,
  getHeatmapFilter1,
  getHeatmapMallandZoneDashboard,
  getLiveOccupancy,
} from "../../api/HeatmapDashboardApis";

import TVSidebar from "./TVSidebar";
import TVFooter from "./TVFooter";

import { FiMapPin, FiShoppingBag, FiLayers, FiUser } from "react-icons/fi";

import Select from "react-select";

import "../../Styles/LoaderOverlay.css";
import { Spinner } from "react-bootstrap";

import OccupancyOverview from "./Overview";

import ZoneHeatmapCanvasTV from "../../CommonComponents/ZoneHeatmapCanvasTV";

import { AlertCircle } from "lucide-react";

import "../../../../Components/Styles/NoData.css";

// Use the browser's local calendar date.
// JavaScript Date represents the current instant (UTC internally), while these
// local getters convert that instant using the viewer's browser/device timezone.
// Therefore each viewer rolls over at midnight in their own country/timezone.
const getDashboardInputDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// ============================================================
// Zonewise TV
// ============================================================

const ZonewiseTV = () => {
  // ==========================================================
  // STATE
  // ==========================================================

  const [loading, setLoading] = useState(false);

  const [noDataAvailable, setNoDataAvailable] = useState(false);

  const [dashboardData, setDashboardData] = useState([]);

  const [selectedMall, setSelectedMall] = useState(null);

  const [selectedFloor, setSelectedFloor] = useState(null);

  const [selectedZone, setSelectedZone] = useState(null);

  // ==========================================================
  // DASHBOARD KPI CARDS
  // ==========================================================

  const [cards, setCards] = useState({
    widget1: {},
    widget2: {},
    widget3: {},
    widget4: {},
  });

  // ==========================================================
  // LIVE OCCUPANCY
  //
  // Current Occupancy + Capacity
  // comes from separate API
  // ==========================================================

  const [liveOccupancy, setLiveOccupancy] = useState({
    totalOccupancy: 0,
    totalCapacities: 0,
  });

  // ==========================================================
  // DASHBOARD PAYLOAD
  //
  // Used only for heatmap/floor data
  // ==========================================================

  const [dashboardPayload, setDashboardPayload] = useState(null);

  const [filtersLoaded, setFiltersLoaded] = useState(false);

  const [filterData, setFilterData] = useState([]);

  // ==========================================================
  // SESSION DATA
  // ==========================================================

  const username = sessionStorage.getItem("username");

  const role = sessionStorage.getItem("role");

  const token = sessionStorage.getItem("token");

  const vid = sessionStorage.getItem("vid");

  // ==========================================================
  // REFS
  // ==========================================================

  const selectedMallRef = useRef(null);

  const selectedFloorRef = useRef(null);

  const selectedZoneRef = useRef(null);

  const dashboardDataRef = useRef([]);

  // Prevent overlapping 15-second API refresh cycles.
  const refreshInProgressRef = useRef(false);

  // Remember the last date requested using this viewer’s browser timezone.
  const lastRequestedDateRef = useRef(getDashboardInputDate());

  // ==========================================================
  // AUTO ROTATION INDEX
  // ==========================================================

  const autoRotateRef = useRef({
    mallIndex: 0,
    floorIndex: 0,
    zoneIndex: 0,
  });

  // ==========================================================
  // LOAD FILTER DATA
  // ==========================================================

  const loadFilters = async () => {
    setLoading(true);

    try {
      const res = await getHeatmapFilter1(username);

      console.log("Heatmap Filter API Response:", res);

      const responseData = res?.savedFilter || [];

      const apiData = res?.data || [];

      // ======================================================
      // NO DATA
      // ======================================================

      if (!apiData.length && !responseData.length) {
        console.log("No heatmap data or saved filters available");

        setNoDataAvailable(true);

        setFilterData([]);

        setDashboardData([]);

        setSelectedMall(null);

        setSelectedFloor(null);

        setSelectedZone(null);

        setFiltersLoaded(false);

        return;
      }

      // ======================================================
      // DATA AVAILABLE
      // ======================================================

      setNoDataAvailable(false);

      setFilterData(responseData);

      // ======================================================
      // DEFAULT MALL
      // ======================================================

      const firstMall = responseData?.[0] || null;

      // ======================================================
      // DEFAULT FLOOR
      // ======================================================

      const firstFloor = firstMall?.floors?.[0] || null;

      // ======================================================
      // DEFAULT ZONE
      // ======================================================

      const firstZone = firstFloor?.zones?.[0] || null;

      setSelectedMall(firstMall);

      setSelectedFloor(firstFloor);

      setSelectedZone(firstZone);

      // ======================================================
      // UPDATE REFS
      // ======================================================

      selectedMallRef.current = firstMall;

      selectedFloorRef.current = firstFloor;

      selectedZoneRef.current = firstZone;

      // ======================================================
      // HEATMAP DASHBOARD PAYLOAD
      //
      // All configured zones are required for the heatmap
      // ======================================================

      const newDashboardPayload = {
        inputDate: getDashboardInputDate(),

        filters: responseData.flatMap((mall) =>
          (mall.floors || []).flatMap((floor) =>
            (floor.zones || []).map((zone) => ({
              mallName: mall.mallName,

              floorName: floor.floorName,

              zoneName: zone.zoneName,
            })),
          ),
        ),
      };

      setDashboardPayload(newDashboardPayload);

      console.log("Zonewise Heatmap Dashboard Payload:", newDashboardPayload);

      setFiltersLoaded(true);
    } catch (error) {
      console.error("Error loading filters:", error);

      setNoDataAvailable(true);

      setFiltersLoaded(false);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // LIVE OCCUPANCY API
  //
  // Current selected zone ONLY
  //
  // POST /heatmapConfig/liveOccupancy
  //
  // Payload:
  //
  // {
  //   username: "Occupancy",
  //   selectedZones: "Office-Entrance"
  // }
  // ==========================================================

  const loadLiveOccupancy = async (zone) => {
    try {
      if (!zone) {
        return;
      }

      const payload = {
        username: "Occupancy",

        selectedZones: zone?.zoneName || "",
      };

      console.log("==========================================");

      console.log("Zonewise Live Occupancy Payload:", payload);

      console.log("==========================================");

      const response = await getLiveOccupancy(payload);

      console.log("Zonewise Live Occupancy Response:", response);

      // ======================================================
      // SUCCESS
      // ======================================================

      if (response?.success) {
        setLiveOccupancy({
          totalOccupancy: response?.totalOccupancy ?? 0,

          totalCapacities: response?.totalCapacities ?? 0,
        });
      } else {
        setLiveOccupancy({
          totalOccupancy: 0,

          totalCapacities: 0,
        });
      }
    } catch (error) {
      console.error("Zonewise Live Occupancy API Error:", error);
    }
  };

  // ==========================================================
  // ZONEWISE KPI API
  //
  // Total Visitors
  // Peak Occupancy
  // Peak Hour
  //
  // Only CURRENT selected zone
  // ==========================================================

  const loadZoneKPIs = async (mall, floor, zone, inputDate = getDashboardInputDate()) => {
    try {
      if (!mall || !floor || !zone) {
        return;
      }

      const payload = {
        mallname: mall.mallName,

        floorname: floor.floorName,

        zonename: zone.zoneName,

        inputDate,
      };

      console.log("==========================================");

      console.log("Zonewise KPI Payload:", payload);

      console.log("==========================================");

      const widgets = await getDashboardWidgets(payload);

      console.log("Zonewise KPI Response:", widgets);

      setCards(
        widgets || {
          widget1: {},
          widget2: {},
          widget3: {},
          widget4: {},
        },
      );
    } catch (error) {
      console.error("Zonewise KPI API Error:", error);
    }
  };

  // ==========================================================
  // LOAD CURRENT ZONE DATA
  //
  // This is the main function for KPI refresh.
  //
  // API 1:
  // liveOccupancy
  //
  // API 2:
  // getDashboardWidgets
  // ==========================================================

  const loadCurrentZoneData = async (mall, floor, zone, inputDate = getDashboardInputDate()) => {
    if (!mall || !floor || !zone) {
      return;
    }

    console.log("==========================================");

    console.log("Loading Current Zone Data");

    console.log("Mall:", mall.mallName);

    console.log("Floor:", floor.floorName);

    console.log("Zone:", zone.zoneName);

    console.log("==========================================");

    await Promise.all([
      // ------------------------------------------
      // Current Occupancy + Capacity
      // ------------------------------------------

      loadLiveOccupancy(zone),

      // ------------------------------------------
      // Total Visitors + Peak Occupancy + Peak Hour
      // ------------------------------------------

      loadZoneKPIs(mall, floor, zone, inputDate),
    ]);
  };

  // ==========================================================
  // LOAD HEATMAP DASHBOARD
  //
  // This API loads floor/zone map data.
  //
  // KPI APIs are NOT called with all zones here.
  // KPI APIs are handled separately using current zone.
  // ==========================================================

  const loadDashboard = async (showLoader = true, inputDate = getDashboardInputDate()) => {
    try {
      if (!dashboardPayload) {
        return;
      }

      if (showLoader) {
        setLoading(true);
      }

      // ======================================================
      // HEATMAP API ONLY
      // ======================================================

      const requestPayload = {
        ...dashboardPayload,
        inputDate,
      };

      console.log("[TV] Browser-local dashboard date:", requestPayload.inputDate);
      console.log("[TV] Heatmap API payload:", requestPayload);

      const dashboard = await getHeatmapMallandZoneDashboard(
        requestPayload
      );

      console.log("[TV] Heatmap API response:", dashboard);
      
      // const dashboard = await getHeatmapMallandZoneDashboard(dashboardPayload);

      // console.log("Zonewise Heatmap Response:", dashboard);

      // ======================================================
      // NORMALIZE DATA
      // ======================================================

      const malls = (dashboard?.malls || []).map((mall) => ({
        ...mall,

        floors: (mall?.floors || []).map((floor) => ({
          ...floor,

          zones: (floor?.zones || []).map((zone) => ({
            ...zone,

            points: zone?.points?.points || [],
          })),
        })),
      }));

      // ======================================================
      // NO DATA
      // ======================================================

      if (!malls.length) {
        console.log("Dashboard API returned no malls");

        setNoDataAvailable(true);

        setDashboardData([]);

        setSelectedMall(null);

        setSelectedFloor(null);

        setSelectedZone(null);

        dashboardDataRef.current = [];

        return;
      }

      setNoDataAvailable(false);

      // ======================================================
      // STORE DASHBOARD DATA
      // ======================================================

      setDashboardData(malls);

      dashboardDataRef.current = malls;

      // ======================================================
      // PRESERVE CURRENT MALL
      // ======================================================

      const currentMall =
        malls.find((mall) => mall.mallId === selectedMallRef.current?.mallId) ||
        malls[0];

      // ======================================================
      // PRESERVE CURRENT FLOOR
      // ======================================================

      const currentFloor =
        currentMall?.floors?.find(
          (floor) => floor.floorId === selectedFloorRef.current?.floorId,
        ) ||
        currentMall?.floors?.[0] ||
        null;

      // ======================================================
      // PRESERVE CURRENT ZONE
      // ======================================================

      const currentZone =
        currentFloor?.zones?.find(
          (zone) => zone.zoneId === selectedZoneRef.current?.zoneId,
        ) ||
        currentFloor?.zones?.[0] ||
        null;

      // ======================================================
      // UPDATE STATE
      // ======================================================

      setSelectedMall(currentMall);

      setSelectedFloor(currentFloor);

      setSelectedZone(currentZone);

      // ======================================================
      // UPDATE REFS IMMEDIATELY
      // ======================================================

      selectedMallRef.current = currentMall;

      selectedFloorRef.current = currentFloor;

      selectedZoneRef.current = currentZone;

      // ======================================================
      // LOAD KPI DATA FOR CURRENT ZONE
      // ======================================================

      await loadCurrentZoneData(currentMall, currentFloor, currentZone, requestPayload.inputDate);

      // ======================================================
      // UPDATE ROTATION INDEX
      // ======================================================

      const currentMallIndex = malls.findIndex(
        (mall) => mall.mallId === currentMall?.mallId,
      );

      const currentFloorIndex = currentMall?.floors?.findIndex(
        (floor) => floor.floorId === currentFloor?.floorId,
      );

      const currentZoneIndex = currentFloor?.zones?.findIndex(
        (zone) => zone.zoneId === currentZone?.zoneId,
      );

      autoRotateRef.current = {
        mallIndex: Math.max(0, currentMallIndex),

        floorIndex: Math.max(0, currentFloorIndex),

        zoneIndex: Math.max(0, currentZoneIndex),
      };
    } catch (error) {
      console.error("Zonewise dashboard error:", error);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  // ==========================================================
  // INITIAL FILTER LOAD
  // ==========================================================

  useEffect(() => {
    loadFilters();
  }, []);

  // ==========================================================
  // KEEP MALL REF UPDATED
  // ==========================================================

  useEffect(() => {
    selectedMallRef.current = selectedMall;
  }, [selectedMall]);

  // ==========================================================
  // KEEP FLOOR REF UPDATED
  // ==========================================================

  useEffect(() => {
    selectedFloorRef.current = selectedFloor;
  }, [selectedFloor]);

  // ==========================================================
  // KEEP ZONE REF UPDATED
  // ==========================================================

  useEffect(() => {
    selectedZoneRef.current = selectedZone;
  }, [selectedZone]);

  // ==========================================================
  // INITIAL LOAD + 15 SECOND REFRESH + MIDNIGHT DATE ROLLOVER
  //
  // Every 15 seconds:
  // 1. Read the current date in the viewer’s browser timezone.
  // 2. Refresh the heatmap using that date.
  // 3. Refresh KPI APIs using the same date.
  // 4. Preserve the selected zone on date rollover; otherwise rotate.
  // ==========================================================

  useEffect(() => {
    if (!filtersLoaded || !dashboardPayload) return;

    loadDashboard(true, getDashboardInputDate());

    const interval = setInterval(async () => {
      if (refreshInProgressRef.current) return;

      refreshInProgressRef.current = true;

      try {
        const currentDate = getDashboardInputDate();
        const dateChanged = currentDate !== lastRequestedDateRef.current;

        if (dateChanged) {
          console.log(
            "[TV] Browser-local date rollover detected:",
            lastRequestedDateRef.current,
            "->",
            currentDate
          );
          lastRequestedDateRef.current = currentDate;
        }

        // Always refresh the heatmap first. The KPI request below uses
        // the exact same date value, so popup and KPI data stay in sync.
        const requestPayload = {
          ...dashboardPayload,
          inputDate: currentDate,
        };

        console.log("[TV] 15-second refresh date:", currentDate);

        const dashboard = await getHeatmapMallandZoneDashboard(requestPayload);

        const mallsUpdated = (dashboard?.malls || []).map((mall) => ({
          ...mall,
          floors: (mall?.floors || []).map((floor) => ({
            ...floor,
            zones: (floor?.zones || []).map((zone) => ({
              ...zone,
              points: zone?.points?.points || [],
            })),
          })),
        }));

        if (!mallsUpdated.length) {
          console.warn("[TV] No heatmap data returned during refresh");
          return;
        }

        setNoDataAvailable(false);
        setDashboardData(mallsUpdated);
        dashboardDataRef.current = mallsUpdated;

        let mallIndex = autoRotateRef.current.mallIndex;
        let floorIndex = autoRotateRef.current.floorIndex;
        let zoneIndex = autoRotateRef.current.zoneIndex;

        let nextMall;
        let nextFloor;
        let nextZone;

        if (dateChanged) {
          // At midnight, keep the currently displayed mall/floor/zone.
          // Only replace its data with the new day's API response.
          nextMall =
            mallsUpdated.find(
              (item) => String(item.mallId) === String(selectedMallRef.current?.mallId)
            ) || mallsUpdated[0];

          nextFloor =
            nextMall?.floors?.find(
              (item) => String(item.floorId) === String(selectedFloorRef.current?.floorId)
            ) || nextMall?.floors?.[0];

          nextZone =
            nextFloor?.zones?.find(
              (item) => String(item.zoneId) === String(selectedZoneRef.current?.zoneId)
            ) || nextFloor?.zones?.[0];

          mallIndex = Math.max(0, mallsUpdated.findIndex((item) => item.mallId === nextMall?.mallId));
          floorIndex = Math.max(0, nextMall?.floors?.findIndex((item) => item.floorId === nextFloor?.floorId) ?? 0);
          zoneIndex = Math.max(0, nextFloor?.zones?.findIndex((item) => item.zoneId === nextZone?.zoneId) ?? 0);

          console.log("[TV] Refreshing selected zone for new date:", currentDate);
        } else {
          // Normal 15-second cycle: rotate to the next zone using the
          // latest refreshed dashboard response (not stale state).
          const currentMall = mallsUpdated[mallIndex] || mallsUpdated[0];
          if (!currentMall) return;

          const currentFloor = currentMall.floors?.[floorIndex] || currentMall.floors?.[0];
          if (!currentFloor) return;

          if (zoneIndex < (currentFloor.zones?.length || 0) - 1) {
            zoneIndex += 1;
          } else {
            zoneIndex = 0;
            if (floorIndex < (currentMall.floors?.length || 0) - 1) {
              floorIndex += 1;
            } else {
              floorIndex = 0;
              mallIndex = mallIndex < mallsUpdated.length - 1 ? mallIndex + 1 : 0;
            }
          }

          nextMall = mallsUpdated[mallIndex];
          nextFloor = nextMall?.floors?.[floorIndex];
          nextZone = nextFloor?.zones?.[zoneIndex];
        }

        if (!nextMall || !nextFloor || !nextZone) return;

        setSelectedMall(nextMall);
        setSelectedFloor(nextFloor);
        setSelectedZone(nextZone);

        selectedMallRef.current = nextMall;
        selectedFloorRef.current = nextFloor;
        selectedZoneRef.current = nextZone;

        autoRotateRef.current = { mallIndex, floorIndex, zoneIndex };

        // KPI APIs receive the same date used by the heatmap request.
        await loadCurrentZoneData(nextMall, nextFloor, nextZone, currentDate);
      } catch (error) {
        console.error("[TV] 15-second / date rollover refresh failed:", error);
      } finally {
        refreshInProgressRef.current = false;
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [filtersLoaded, dashboardPayload]);

  // ==========================================================
  // CURRENT MALL
  // ==========================================================

  const dashboardMall = dashboardData.find(
    (mall) => mall.mallId === selectedMall?.mallId,
  );

  // ==========================================================
  // CURRENT FLOOR
  // ==========================================================

  const dashboardFloor = dashboardMall?.floors?.find(
    (floor) => floor.floorId === selectedFloor?.floorId,
  );

  // ==========================================================
  // CURRENT ZONE
  // ==========================================================

  const dashboardZone = dashboardFloor?.zones?.find(
    (zone) => zone.zoneId === selectedZone?.zoneId,
  );

  // ==========================================================
  // WIDGET DATA
  // ==========================================================

  const widget1 = cards?.widget1?.data?.[0] || {};

  const widget2 = cards?.widget2?.data?.[0] || {};

  const widget3 = cards?.widget3?.data?.[0] || {};

  const widget4 = cards?.widget4?.data?.[0] || {};

  // ==========================================================
  // MALL OPTIONS
  // ==========================================================

  const mallOptions = dashboardData.map((mall) => ({
    value: mall.mallId,

    label: mall.mallName,
  }));

  // ==========================================================
  // FLOOR OPTIONS
  // ==========================================================

  const floorOptions =
    dashboardMall?.floors?.map((floor) => ({
      value: floor.floorId,

      label: floor.floorName,
    })) || [];

  // ==========================================================
  // ZONE OPTIONS
  // ==========================================================

  const zoneOptions =
    dashboardFloor?.zones?.map((zone) => ({
      value: zone.zoneId,

      label: zone.zoneName,
    })) || [];

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="tv-page">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="tv-header">
        {/* ===================================================
            HEADER TITLE
            =================================================== */}

        <div className="tv-header-left">
          <h2>Heatmap Dashboard - Zonewise</h2>
        </div>

        {/* ===================================================
            LOADER
            =================================================== */}

        {loading && (
          <div className="loader-overlay">
            <Spinner animation="border" variant="primary" />

            <p>Loading heatmap data...</p>
          </div>
        )}

        {/* ===================================================
            HEADER RIGHT
            =================================================== */}

        <div className="tv-header-right">
          {/* =================================================
              MALL / FLOOR / ZONE FILTERS
              ================================================= */}

          {!noDataAvailable && !loading && (
            <>
              {/* ==========================================
                    MALL
                    ========================================== */}

              <div className="filter-group-horizontal">
                <label className="filter-inline-label">Mall :</label>

                <div className="tv-filter-card">
                  <div className="tv-select-box">
                    <FiShoppingBag className="tv-icon" />

                    <Select
                      className="tv-react-select"
                      classNamePrefix="tv-select"
                      isSearchable={false}
                      options={mallOptions}
                      value={
                        mallOptions.find(
                          (mall) => mall.value === selectedMall?.mallId,
                        ) || null
                      }
                      onChange={async (option) => {
                        if (!option) {
                          return;
                        }

                        const mallIndex = dashboardData.findIndex(
                          (mall) => mall.mallId === option.value,
                        );

                        if (mallIndex === -1) {
                          return;
                        }

                        const mall = dashboardData[mallIndex];

                        const floor = mall?.floors?.[0] || null;

                        const zone = floor?.zones?.[0] || null;

                        if (!mall || !floor || !zone) {
                          return;
                        }

                        // --------------------------------
                        // UPDATE STATE
                        // --------------------------------

                        setSelectedMall(mall);

                        setSelectedFloor(floor);

                        setSelectedZone(zone);

                        // --------------------------------
                        // UPDATE REFS
                        // --------------------------------

                        selectedMallRef.current = mall;

                        selectedFloorRef.current = floor;

                        selectedZoneRef.current = zone;

                        // --------------------------------
                        // RESET ROTATION
                        // --------------------------------

                        autoRotateRef.current = {
                          mallIndex,

                          floorIndex: 0,

                          zoneIndex: 0,
                        };

                        // --------------------------------
                        // LOAD CURRENT ZONE KPI
                        // --------------------------------

                        await loadCurrentZoneData(mall, floor, zone);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ==========================================
                    FLOOR
                    ========================================== */}

              <div className="filter-group-horizontal">
                <label className="filter-inline-label">Floor :</label>

                <div className="tv-filter-card">
                  <div className="tv-select-box">
                    <FiLayers className="tv-icon" />

                    <Select
                      className="tv-react-select"
                      classNamePrefix="tv-select"
                      isSearchable={false}
                      options={floorOptions}
                      value={
                        floorOptions.find(
                          (floor) => floor.value === selectedFloor?.floorId,
                        ) || null
                      }
                      onChange={async (option) => {
                        if (!option) {
                          return;
                        }

                        const floorIndex = dashboardMall?.floors?.findIndex(
                          (floor) => floor.floorId === option.value,
                        );

                        if (floorIndex === -1 || floorIndex === undefined) {
                          return;
                        }

                        const floor = dashboardMall?.floors?.[floorIndex];

                        const zone = floor?.zones?.[0] || null;

                        if (!floor || !zone) {
                          return;
                        }

                        // --------------------------------
                        // UPDATE STATE
                        // --------------------------------

                        setSelectedFloor(floor);

                        setSelectedZone(zone);

                        // --------------------------------
                        // UPDATE REFS
                        // --------------------------------

                        selectedFloorRef.current = floor;

                        selectedZoneRef.current = zone;

                        // --------------------------------
                        // RESET ZONE ROTATION
                        // --------------------------------

                        autoRotateRef.current = {
                          mallIndex: autoRotateRef.current.mallIndex,

                          floorIndex,

                          zoneIndex: 0,
                        };

                        // --------------------------------
                        // LOAD CURRENT ZONE KPI
                        // --------------------------------

                        await loadCurrentZoneData(selectedMall, floor, zone);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ==========================================
                    ZONE
                    ========================================== */}

              <div className="filter-group-horizontal">
                <label className="filter-inline-label">Zone :</label>

                <div className="tv-filter-card">
                  <div className="tv-select-box">
                    <FiMapPin className="tv-icon" />

                    <Select
                      className="tv-react-select"
                      classNamePrefix="tv-select"
                      isSearchable={false}
                      options={zoneOptions}
                      value={
                        zoneOptions.find(
                          (zone) => zone.value === selectedZone?.zoneId,
                        ) || null
                      }
                      onChange={async (option) => {
                        if (!option) {
                          return;
                        }

                        const zone = dashboardFloor?.zones?.find(
                          (zone) => zone.zoneId === option.value,
                        );

                        if (!zone) {
                          return;
                        }

                        const zoneIndex = dashboardFloor?.zones?.findIndex(
                          (item) => item.zoneId === zone.zoneId,
                        );

                        // --------------------------------
                        // UPDATE STATE
                        // --------------------------------

                        setSelectedZone(zone);

                        // --------------------------------
                        // UPDATE REF
                        // --------------------------------

                        selectedZoneRef.current = zone;

                        // --------------------------------
                        // UPDATE ROTATION INDEX
                        // --------------------------------

                        autoRotateRef.current = {
                          ...autoRotateRef.current,

                          zoneIndex,
                        };

                        // --------------------------------
                        // LOAD CURRENT ZONE KPI
                        // --------------------------------

                        await loadCurrentZoneData(
                          selectedMall,
                          selectedFloor,
                          zone,
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =================================================
              USER PROFILE
              ================================================= */}

          <div className="tv-user-profile">
            <div className="tv-user-icon">
              <FiUser />
            </div>

            <div className="tv-user-details">
              <span className="tv-user-name" title={username || "User"}>
                {username || "User"}
              </span>

              <span className="tv-user-role">{role || "User"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <div className="tv-content">
        {noDataAvailable ? (
          <div className="no-data-Heatmap_quickLinks_dashboard">
            <AlertCircle className="no-data-icon" />

            <h2>No Data Available</h2>

            <p>Please configure a zone(s) in Settings → Heatmap.</p>
          </div>
        ) : (
          <>
            {/* =================================================
                LEFT KPI SIDEBAR
                ================================================= */}

            <TVSidebar
              widget2={widget2}
              widget3={widget3}
              widget4={widget4}
              liveOccupancy={liveOccupancy}
            />

            {/* =================================================
                ZONE HEATMAP
                ================================================= */}

            <div className="tv-map-container">
              {dashboardFloor && (
                <ZoneHeatmapCanvasTV
                  selectedFloor={dashboardFloor}
                  selectedZone={dashboardZone || selectedZone}
                />
              )}
            </div>

            {/* =================================================
                OCCUPANCY OVERVIEW
                ================================================= */}

            <OccupancyOverview
              selectedMall={selectedMall}
              selectedFloor={selectedFloor}
              capacity={822}
            />
          </>
        )}
      </div>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <TVFooter
        rotationText={
          noDataAvailable ? "" : "🟢 LIVE | 🔄 15s Zone Rotation & Data Refresh"
        }
      />
    </div>
  );
};

export default ZonewiseTV;
