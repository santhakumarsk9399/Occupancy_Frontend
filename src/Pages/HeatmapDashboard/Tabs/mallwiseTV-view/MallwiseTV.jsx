// import React, { useEffect, useRef, useState } from "react";
// import dayjs from "dayjs";
// import "../../Styles/mallwiseTV.css";
// import HeatmapCanvasTV from "../../CommonComponents/HeatmapCanvasTV";
// import HeatmapLegend from "../../CommonComponents/HeatmapLegend";
// import {
//   getDashboardWidgets,
//   getHeatmapFilter1,
//   getHeatmapMallandZoneDashboard,
// } from "../../api/HeatmapDashboardApis";
// import useHeatmap from "../../hooks/useHeatmap";
// import TVSidebar from "./TVSidebar";
// import TVFooter from "./TVFooter";
// import {
//   FiMapPin,
//   FiShoppingBag,
//   FiLayers,
//   FiUser,
//   FiChevronDown,
// } from "react-icons/fi";
// import Select from "react-select";
// import "../../Styles/LoaderOverlay.css";
// import { Spinner } from "react-bootstrap";
// import OccupancyOverview from "./Overview";
// import { AlertCircle } from "lucide-react";
// import "../../../../Components/Styles/NoData.css"
// const MallWiseTV = () => {
//   // ==========================================
//   // Component State Management
//   // ==========================================

//   const [loading, setLoading] = useState(false);
//   const [dashboardData, setDashboardData] = useState([]);
//   const [selectedMall, setSelectedMall] = useState(null);
//   const [selectedFloor, setSelectedFloor] = useState(null);
//   const [cards, setCards] = useState({
//     widget1: {},
//     widget2: {},
//     widget3: {},
//     widget4: {},
//   });

//   const [widgetPayload, setWidgetPayload] = useState(null);
//   const [dashboardPayload, setDashboardPayload] = useState(null);
//   const [filtersLoaded, setFiltersLoaded] = useState(false);
//   const [filterData, setFilterData] = useState([]);
//   const [noDataAvailable, setNoDataAvailable] = useState(false);

//   const userData = JSON.parse(sessionStorage.getItem("userData"));
//   const token = userData?.token;
//   const username = userData?.user?.username;
//   const vid = userData?.user?.vid;
//   const role = userData?.user?.role;

//   const selectedMallRef = useRef(null);
//   const selectedFloorRef = useRef(null);
//   const dashboardDataRef = useRef([]);
//   const autoRotateRef = useRef({
//     mallIndex: 0,
//     floorIndex: 0,
//   });
//   // ==========================================
//   // Load Filter Data and Prepare Request Payloads
//   // ==========================================

//   // const loadFilters = async () => {
//   //   try {
//   //     const res = await getHeatmapFilter1(username);
//   //     const responseData = res?.savedFilter || [];
//   //     console.log(responseData, "responseData");
//   //     if (!responseData.length) return;

//   //     // Dropdown Data

//   //     setFilterData(responseData);
//   //     setSelectedMall(responseData[0]);
//   //     setSelectedFloor(responseData[0].floors[0]);

//   //     // Widget Payload
//   //     setWidgetPayload({
//   //       mallname: responseData.map((m) => m.mallName).join(","),
//   //       floorname: responseData
//   //         .flatMap((m) => m.floors)
//   //         .map((f) => f.floorName)
//   //         .join(","),
//   //       zonename: responseData
//   //         .flatMap((m) => m.floors)
//   //         .flatMap((f) => f.zones)
//   //         .map((z) => z.zoneName)
//   //         .join(","),
//   //       inputDate: dayjs().format("YYYY-MM-DD"),
//   //     });

//   //     // Dashboard Payload
//   //     setDashboardPayload({
//   //       inputDate: dayjs().format("YYYY-MM-DD"),
//   //       filters: responseData.flatMap((m) =>
//   //         m.floors.flatMap((f) =>
//   //           f.zones.map((z) => ({
//   //             mallName: m.mallName,
//   //             floorName: f.floorName,
//   //             zoneName: z.zoneName,
//   //           })),
//   //         ),
//   //       ),
//   //     });

//   //     setFiltersLoaded(true);
//   //   } catch (err) {
//   //     console.log(err);
//   //   }
//   // };
//   const loadFilters = async () => {
//     setLoading(true);

//     try {
//       const res = await getHeatmapFilter1(username);

//       console.log("Heatmap Filter API Response:", res);

//       const responseData = res?.savedFilter || [];
//       const apiData = res?.data || [];

//       // No data available
//       if (!apiData.length && !responseData.length) {
//         console.log("No heatmap data or saved filters available");

//         setNoDataAvailable(true);
//         setFilterData([]);
//         setDashboardData([]);
//         setSelectedMall(null);
//         setSelectedFloor(null);
//         setFiltersLoaded(false);

//         return;
//       }

//       // Data available
//       setNoDataAvailable(false);

//       setFilterData(responseData);

//       setSelectedMall(responseData[0]);
//       setSelectedFloor(responseData[0]?.floors?.[0] || null);

//       setWidgetPayload({
//         mallname: responseData.map((m) => m.mallName).join(","),
//         floorname: responseData
//           .flatMap((m) => m.floors)
//           .map((f) => f.floorName)
//           .join(","),
//         zonename: responseData
//           .flatMap((m) => m.floors)
//           .flatMap((f) => f.zones)
//           .map((z) => z.zoneName)
//           .join(","),
//         inputDate: dayjs().format("YYYY-MM-DD"),
//       });

//       setDashboardPayload({
//         inputDate: dayjs().format("YYYY-MM-DD"),
//         filters: responseData.flatMap((m) =>
//           m.floors.flatMap((f) =>
//             f.zones.map((z) => ({
//               mallName: m.mallName,
//               floorName: f.floorName,
//               zoneName: z.zoneName,
//             })),
//           ),
//         ),
//       });

//       setFiltersLoaded(true);
//     } catch (err) {
//       console.error("Error loading filters:", err);

//       setNoDataAvailable(true);
//       setFiltersLoaded(false);
//     } finally {
//       setLoading(false);
//     }
//   };
//   // ==========================================
//   // Load Dashboard Widgets and Heatmap Data
//   // ==========================================

//   const loadDashboard = async (showLoader = true) => {
//     try {
//       if (!widgetPayload || !dashboardPayload) return;

//       if (showLoader) {
//         setLoading(true);
//       }

//       const [widgets, dashboard] = await Promise.all([
//         getDashboardWidgets(widgetPayload),
//         getHeatmapMallandZoneDashboard(dashboardPayload),
//       ]);

//       const malls = (dashboard.malls || []).map((mall) => ({
//         ...mall,
//         floors: mall.floors.map((floor) => ({
//           ...floor,
//           zones: floor.zones.map((zone) => ({
//             ...zone,
//             points: zone.points?.points || [],
//           })),
//         })),
//       }));

//       setDashboardData(malls);
//       setCards(widgets);
//       dashboardDataRef.current = malls;
//       // Preserve selected mall/floor

//       const currentMall =
//         malls.find((m) => m.mallId === selectedMallRef.current?.mallId) ||
//         malls[0];
//       setSelectedMall(currentMall);
//       const currentFloor =
//         currentMall?.floors.find(
//           (f) => f.floorId === selectedFloorRef.current?.floorId,
//         ) || currentMall?.floors?.[0];
//       setSelectedFloor(currentFloor);

//       const currentMallIndex = malls.findIndex(
//         (m) => m.mallId === currentMall?.mallId,
//       );

//       const currentFloorIndex = currentMall?.floors.findIndex(
//         (f) => f.floorId === currentFloor?.floorId,
//       );

//       autoRotateRef.current = {
//         mallIndex: Math.max(0, currentMallIndex),
//         floorIndex: Math.max(0, currentFloorIndex),
//       };
//     } catch (err) {
//       console.log(err);
//     } finally {
//       if (showLoader) {
//         setLoading(false);
//       }
//     }
//   };
//   // ==========================================
//   // Load Filter Data on Component Mount
//   // ==========================================

//   useEffect(() => {
//     loadFilters();
//   }, []);

//   useEffect(() => {
//     selectedMallRef.current = selectedMall;
//   }, [selectedMall]);

//   useEffect(() => {
//     selectedFloorRef.current = selectedFloor;
//   }, [selectedFloor]);
//   // ==========================================
//   // Auto Refresh Dashboard Every 15 Seconds
//   // ==========================================

//   useEffect(() => {
//     if (!filtersLoaded) return;

//     // Initial Load (show loader)
//     loadDashboard(true);

//     const interval = setInterval(() => {
//       // Background refresh (no loader)
//       loadDashboard(false);
//     }, 15000);

//     return () => clearInterval(interval);
//   }, [filtersLoaded]);

//   // ==========================================
//   // Auto Rotate the floors Every 30 Seconds
//   // ==========================================
//   useEffect(() => {
//     if (!filtersLoaded) return;

//     const interval = setInterval(() => {
//       const malls = dashboardDataRef.current;

//       if (!malls.length) return;

//       const currentMall = selectedMallRef.current;
//       const currentFloor = selectedFloorRef.current;

//       if (!currentMall || !currentFloor) return;

//       const mallIndex = malls.findIndex((m) => m.mallId === currentMall.mallId);

//       if (mallIndex === -1) return;

//       const mall = malls[mallIndex];

//       const floorIndex = mall.floors.findIndex(
//         (f) => f.floorId === currentFloor.floorId,
//       );

//       let nextMall = mall;
//       let nextFloor = null;

//       // Next floor in same mall
//       if (floorIndex < mall.floors.length - 1) {
//         nextFloor = mall.floors[floorIndex + 1];
//       } else {
//         // Move to next mall
//         const nextMallIndex =
//           mallIndex === malls.length - 1 ? 0 : mallIndex + 1;

//         nextMall = malls[nextMallIndex];
//         nextFloor = nextMall.floors[0];
//       }

//       setSelectedMall(nextMall);
//       setSelectedFloor(nextFloor);
//     }, 30000);

//     return () => clearInterval(interval);
//   }, [filtersLoaded]);
//   // ==========================================
//   // Get Selected Mall and Floor from Dashboard Data
//   // ==========================================

//   const dashboardMall = dashboardData.find(
//     (m) => m.mallId === selectedMall?.mallId,
//   );

//   const dashboardFloor = dashboardMall?.floors.find(
//     (f) => f.floorId === selectedFloor?.floorId,
//   );

//   // ==========================================
//   // Prepare Heatmap Data for Rendering
//   // ==========================================

//   const { zonesToRender } = useHeatmap({
//     mode: "tv",
//     selectedFloor: dashboardFloor,
//   });

//   // ==========================================
//   // Extract Widget Data for Sidebar Cards
//   // ==========================================

//   const widget1 = cards?.widget1?.data?.[0] || {};
//   const widget2 = cards?.widget2?.data?.[0] || {};
//   const widget3 = cards?.widget3?.data?.[0] || {};
//   const widget4 = cards?.widget4?.data?.[0] || {};

//   // ==========================================
//   //  Data for Mall Dropdown Options
//   // ==========================================

//   const mallOptions = dashboardData.map((mall) => ({
//     value: mall.mallId,
//     label: mall.mallName,
//   }));

//   // ==========================================
//   // Data for Floor Dropdown Options
//   // ==========================================

//   const floorOptions =
//     dashboardMall?.floors.map((floor) => ({
//       value: floor.floorId,
//       label: floor.floorName,
//     })) || [];
//   return (
//     <div className="tv-page">
//       {/*==========================================
//                  Header Section
//         ========================================== */}

//       <div className="tv-header">

//         {/* Header Title */}
//         <div className="tv-header-left">
//           <h2>Heatmap Dashboard - Mallwise</h2>
//         </div>

//         {/* Loader */}
//         {loading && (
//           <div className="loader-overlay">
//             <Spinner animation="border" variant="primary" />
//             <p>Loading heatmap data...</p>
//           </div>
//         )}

//         <div className="tv-header-right">

//           {/* Mall + Floor dropdowns */}
//           {!noDataAvailable && (
//             <>
//               {/* Mall */}
//               <div className="filter-group-horizontal">
//                 <label className="filter-inline-label">
//                   Mall :
//                 </label>

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
//                           (m) =>
//                             m.value === selectedMall?.mallId
//                         ) || null
//                       }
//                       onChange={(option) => {
//                         const mallIndex =
//                           dashboardData.findIndex(
//                             (m) =>
//                               m.mallId === option.value
//                           );

//                         if (mallIndex === -1) return;

//                         const mall =
//                           dashboardData[mallIndex];

//                         setSelectedMall(mall);

//                         setSelectedFloor(
//                           mall.floors?.[0] || null
//                         );

//                         autoRotateRef.current = {
//                           mallIndex,
//                           floorIndex: 0,
//                         };
//                       }}
//                     />

//                   </div>
//                 </div>
//               </div>

//               {/* Floor */}
//               <div className="filter-group-horizontal">
//                 <label className="filter-inline-label">
//                   Floor :
//                 </label>

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
//                           (f) =>
//                             f.value ===
//                             selectedFloor?.floorId
//                         ) || null
//                       }
//                       onChange={(option) => {
//                         const floorIndex =
//                           dashboardMall?.floors.findIndex(
//                             (f) =>
//                               f.floorId === option.value
//                           );

//                         if (floorIndex === -1) return;

//                         const floor =
//                           dashboardMall.floors[
//                           floorIndex
//                           ];

//                         setSelectedFloor(floor);

//                         autoRotateRef.current = {
//                           mallIndex:
//                             autoRotateRef.current
//                               .mallIndex,
//                           floorIndex,
//                         };
//                       }}
//                     />

//                   </div>
//                 </div>
//               </div>
//             </>
//           )}

//  {/* ================================
//       USER PROFILE
//      ================================ */}

//           <div className="tv-user-profile">

//             <div className="tv-user-icon">
//               <FiUser />
//             </div>

//             <div className="tv-user-details">
//               <span className="tv-user-name">
//                 {username || "User"}
//               </span>

//               <span className="tv-user-role">
//                 {role || "User"}
//               </span>
//             </div>

//           </div>

//         </div>
//       </div>

//       {/* ==========================================
//                   Sidebar Widgets
//         ========================================== */}

//       <div className="tv-content">

//         {noDataAvailable ? (
//           <div className="no-data-Heatmap_quickLinks_dashboard">
//             {/* <div className="no-data-icon">📊</div> */}
//             <AlertCircle className="no-data-icon" />
//             <h2>No Data Available</h2>

//             <p>
//               Please configure a zone(s) in Settings → Heatmap.
//             </p>

//           </div>

//         ) : (
//           <>
//         <TVSidebar widget2={widget2} widget3={widget3} widget4={widget4} />

//         {/* ==========================================
//                   Heatmap Canvas
//            ========================================== */}

//         <div className="tv-map-container">
//           {dashboardFloor && (
//             <HeatmapCanvasTV
//               selectedFloor={dashboardFloor}
//               zones={zonesToRender}
//             />
//           )}
//         </div>
//         <OccupancyOverview
//           // occupancy={occupancy}
//           // inside={inside}
//           selectedMall={selectedMall}
//           selectedFloor={selectedFloor}
//           capacity={822}
//               />
//              </>
//         )}
//       </div>

//       {/* ==========================================
//                Footer Section
//           ========================================== */}

//       <TVFooter
//         rotationText={
//           noDataAvailable
//             ? ""
//             : "🟢 LIVE | 🔄 30s Floor Rotation | 📡 15s Data Refresh"
//         }
//       />
//     </div>
//   );
// };

// export default MallWiseTV;

import React, { useEffect, useRef, useState } from "react";

import dayjs from "dayjs";

import "../../Styles/mallwiseTV.css";

import HeatmapCanvasTV from "../../CommonComponents/HeatmapCanvasTV";

import {
  getDashboardWidgets,
  getHeatmapFilter1,
  getHeatmapMallandZoneDashboard,
  getLiveOccupancy,
} from "../../api/HeatmapDashboardApis";

import useHeatmap from "../../hooks/useHeatmap";

import TVSidebar from "./TVSidebar";
import TVFooter from "./TVFooter";

import { FiShoppingBag, FiLayers, FiUser } from "react-icons/fi";

import Select from "react-select";

import "../../Styles/LoaderOverlay.css";

import { Spinner } from "react-bootstrap";

import OccupancyOverview from "./Overview";

import { AlertCircle } from "lucide-react";

import "../../../../Components/Styles/NoData.css";

const MallWiseTV = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [loading, setLoading] = useState(false);

  const [dashboardData, setDashboardData] = useState([]);

  const [selectedMall, setSelectedMall] = useState(null);

  const [selectedFloor, setSelectedFloor] = useState(null);

  // Existing dashboard widgets
  const [cards, setCards] = useState({
    widget1: {},
    widget2: {},
    widget3: {},
    widget4: {},
  });

  // NEW:
  // Current Occupancy comes from separate API
  const [liveOccupancy, setLiveOccupancy] = useState({
    totalOccupancy: 0,
    totalCapacities: 0,
  });

  const [dashboardPayload, setDashboardPayload] = useState(null);

  const [filtersLoaded, setFiltersLoaded] = useState(false);

  const [filterData, setFilterData] = useState([]);

  const [noDataAvailable, setNoDataAvailable] = useState(false);

  // =========================================================
  // SESSION DATA
  // =========================================================

  const userData = JSON.parse(sessionStorage.getItem("userData"));

  const token = userData?.token;

  const username = userData?.user?.username;

  const vid = userData?.user?.vid;

  const role = userData?.user?.role;

  // =========================================================
  // REFS
  // =========================================================

  const selectedMallRef = useRef(null);

  const selectedFloorRef = useRef(null);

  const dashboardDataRef = useRef([]);

  const autoRotateRef = useRef({
    mallIndex: 0,
    floorIndex: 0,
  });

  // =========================================================
  // LOAD FILTER DATA
  // =========================================================

  const loadFilters = async () => {
    setLoading(true);

    try {
      const res = await getHeatmapFilter1(username);

      console.log("Heatmap Filter API Response:", res);

      const responseData = res?.savedFilter || [];

      const apiData = res?.data || [];

      // =====================================================
      // NO DATA
      // =====================================================

      if (!apiData.length && !responseData.length) {
        console.log("No heatmap data or saved filters available");

        setNoDataAvailable(true);

        setFilterData([]);

        setDashboardData([]);

        setSelectedMall(null);

        setSelectedFloor(null);

        setFiltersLoaded(false);

        return;
      }

      // =====================================================
      // DATA AVAILABLE
      // =====================================================

      setNoDataAvailable(false);

      setFilterData(responseData);

      // =====================================================
      // DEFAULT MALL
      // =====================================================

      const firstMall = responseData[0] || null;

      // =====================================================
      // DEFAULT FLOOR
      // =====================================================

      const firstFloor = firstMall?.floors?.[0] || null;

      setSelectedMall(firstMall);

      setSelectedFloor(firstFloor);

      // =====================================================
      // UPDATE REFS
      // =====================================================

      selectedMallRef.current = firstMall;

      selectedFloorRef.current = firstFloor;

      // =====================================================
      // HEATMAP PAYLOAD
      //
      // This contains all configured zones.
      // It is only used to get heatmap/floor data.
      // =====================================================

      const newDashboardPayload = {
        inputDate: dayjs().format("YYYY-MM-DD"),

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

      console.log("Heatmap Dashboard Payload:", newDashboardPayload);

      setFiltersLoaded(true);
    } catch (err) {
      console.error("Error loading filters:", err);

      setNoDataAvailable(true);

      setFiltersLoaded(false);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD CURRENT OCCUPANCY
  //
  // API:
  // POST /heatmapConfig/liveOccupancy
  //
  // Payload:
  // {
  //   username: "Occupancy",
  //   selectedZones: "Zone1,Zone2,..."
  // }
  // =========================================================

  const loadLiveOccupancy = async (mall, floor) => {
    try {
      if (!mall || !floor) {
        return;
      }

      // =====================================================
      // Get ALL zones of CURRENT FLOOR
      // =====================================================

      const selectedZones = (floor?.zones || [])
        .map((zone) => zone.zoneName)
        .filter(Boolean)
        .join(",");

      // =====================================================
      // LIVE OCCUPANCY PAYLOAD
      // =====================================================

      const payload = {
        username: username,

        selectedZones: selectedZones,
      };

      console.log("==========================================");

      console.log("Live Occupancy Payload:", payload);

      console.log("==========================================");

      const response = await getLiveOccupancy(payload);

      console.log("Live Occupancy Response:", response);

      // =====================================================
      // UPDATE CURRENT OCCUPANCY
      // =====================================================

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
      console.error("Live Occupancy API Error:", error);
    }
  };

  // =========================================================
  // LOAD OTHER KPI WIDGETS
  //
  // Current Occupancy is NOT loaded here.
  //
  // These remain:
  // - Total Visitors
  // - Yesterday Visitors
  // - Peak Occupancy
  // - Peak Hour
  // =========================================================

  const loadMallFloorWidgets = async (mall, floor) => {
    try {
      if (!mall || !floor) {
        return;
      }

      // =====================================================
      // Get zones belonging to CURRENT FLOOR
      // =====================================================

      const selectedZones = (floor?.zones || [])
        .map((zone) => zone.zoneName)
        .filter(Boolean);

      const zoneNames = selectedZones.join(",");

      // =====================================================
      // EXISTING DASHBOARD WIDGET PAYLOAD
      // =====================================================

      const mallFloorWidgetPayload = {
        mallname: mall.mallName,

        floorname: floor.floorName,

        zonename: zoneNames,

        inputDate: dayjs().format("YYYY-MM-DD"),
      };

      console.log("==========================================");

      console.log("Mallwise KPI Payload:", mallFloorWidgetPayload);

      console.log("==========================================");

      const widgets = await getDashboardWidgets(mallFloorWidgetPayload);

      console.log("Mallwise KPI Response:", widgets);

      setCards(
        widgets || {
          widget1: {},
          widget2: {},
          widget3: {},
          widget4: {},
        },
      );
    } catch (error) {
      console.error("Dashboard Widgets API Error:", error);
    }
  };

  // =========================================================
  // LOAD ALL DATA FOR CURRENT MALL + FLOOR
  //
  // Two API groups:
  //
  // 1. Heatmap API
  // 2. KPI APIs
  //
  // Current Occupancy:
  //     /liveOccupancy
  //
  // Other KPI:
  //     getDashboardWidgets
  // =========================================================

  const loadCurrentMallFloorData = async (mall, floor) => {
    if (!mall || !floor) {
      return;
    }

    await Promise.all([
      // Current Occupancy
      loadLiveOccupancy(mall, floor),

      // Other KPI cards
      loadMallFloorWidgets(mall, floor),
    ]);
  };

  // =========================================================
  // LOAD DASHBOARD
  //
  // This is primarily responsible for refreshing
  // the heatmap data.
  //
  // KPI values are then loaded for the CURRENT
  // Mall + Floor.
  // =========================================================

  const loadDashboard = async (showLoader = true) => {
    try {
      if (!dashboardPayload) {
        return;
      }

      if (showLoader) {
        setLoading(true);
      }

      // =====================================================
      // HEATMAP API
      // =====================================================

      const dashboard = await getHeatmapMallandZoneDashboard(dashboardPayload);

      // =====================================================
      // NORMALIZE DASHBOARD DATA
      // =====================================================

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

      // =====================================================
      // NO DATA
      // =====================================================

      if (!malls.length) {
        console.log("Dashboard API returned no malls");

        setNoDataAvailable(true);

        setDashboardData([]);

        setSelectedMall(null);

        setSelectedFloor(null);

        dashboardDataRef.current = [];

        return;
      }

      setNoDataAvailable(false);

      // =====================================================
      // STORE DASHBOARD DATA
      // =====================================================

      setDashboardData(malls);

      dashboardDataRef.current = malls;

      // =====================================================
      // PRESERVE CURRENT MALL
      // =====================================================

      const currentMall =
        malls.find((mall) => mall.mallId === selectedMallRef.current?.mallId) ||
        malls[0];

      // =====================================================
      // PRESERVE CURRENT FLOOR
      // =====================================================

      const currentFloor =
        currentMall?.floors?.find(
          (floor) => floor.floorId === selectedFloorRef.current?.floorId,
        ) ||
        currentMall?.floors?.[0] ||
        null;

      // =====================================================
      // UPDATE STATE
      // =====================================================

      setSelectedMall(currentMall);

      setSelectedFloor(currentFloor);

      // =====================================================
      // UPDATE REFS IMMEDIATELY
      // =====================================================

      selectedMallRef.current = currentMall;

      selectedFloorRef.current = currentFloor;

      // =====================================================
      // LOAD KPI FOR CURRENT MALL + FLOOR
      // =====================================================

      await loadCurrentMallFloorData(currentMall, currentFloor);

      // =====================================================
      // UPDATE ROTATION INDEX
      // =====================================================

      const currentMallIndex = malls.findIndex(
        (mall) => mall.mallId === currentMall?.mallId,
      );

      const currentFloorIndex = currentMall?.floors?.findIndex(
        (floor) => floor.floorId === currentFloor?.floorId,
      );

      autoRotateRef.current = {
        mallIndex: Math.max(0, currentMallIndex),

        floorIndex: Math.max(0, currentFloorIndex),
      };
    } catch (err) {
      console.error("Mallwise dashboard error:", err);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  // =========================================================
  // INITIAL FILTER LOAD
  // =========================================================

  useEffect(() => {
    loadFilters();
  }, []);

  // =========================================================
  // KEEP MALL REF UPDATED
  // =========================================================

  useEffect(() => {
    selectedMallRef.current = selectedMall;
  }, [selectedMall]);

  // =========================================================
  // KEEP FLOOR REF UPDATED
  // =========================================================

  useEffect(() => {
    selectedFloorRef.current = selectedFloor;
  }, [selectedFloor]);

  // =========================================================
  // DATA REFRESH EVERY 15 SECONDS
  //
  // This refreshes:
  //
  // 1. Heatmap
  // 2. Current Occupancy API
  // 3. Other KPI APIs
  // =========================================================

  useEffect(() => {
    if (!filtersLoaded) {
      return;
    }

    // Initial load
    loadDashboard(true);

    // Every 15 seconds
    const interval = setInterval(() => {
      loadDashboard(false);
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [filtersLoaded]);

  // =========================================================
  // FLOOR ROTATION EVERY 30 SECONDS
  // =========================================================

  useEffect(() => {
    if (!filtersLoaded) {
      return;
    }

    const interval = setInterval(async () => {
      const malls = dashboardDataRef.current;

      if (!malls.length) {
        return;
      }

      const currentMall = selectedMallRef.current;

      const currentFloor = selectedFloorRef.current;

      if (!currentMall || !currentFloor) {
        return;
      }

      // ===================================================
      // CURRENT MALL INDEX
      // ===================================================

      const mallIndex = malls.findIndex(
        (mall) => mall.mallId === currentMall.mallId,
      );

      if (mallIndex === -1) {
        return;
      }

      const mall = malls[mallIndex];

      // ===================================================
      // CURRENT FLOOR INDEX
      // ===================================================

      const floorIndex = mall?.floors?.findIndex(
        (floor) => floor.floorId === currentFloor.floorId,
      );

      if (floorIndex === -1 || floorIndex === undefined) {
        return;
      }

      let nextMall = mall;

      let nextFloor = null;

      // ===================================================
      // NEXT FLOOR IN SAME MALL
      // ===================================================

      if (floorIndex < mall.floors.length - 1) {
        nextFloor = mall.floors[floorIndex + 1];
      } else {
        // =================================================
        // LAST FLOOR
        // MOVE TO NEXT MALL
        // =================================================

        const nextMallIndex =
          mallIndex === malls.length - 1 ? 0 : mallIndex + 1;

        nextMall = malls[nextMallIndex];

        nextFloor = nextMall?.floors?.[0] || null;
      }

      if (!nextMall || !nextFloor) {
        return;
      }

      // ===================================================
      // UPDATE CURRENT DISPLAY
      // ===================================================

      setSelectedMall(nextMall);

      setSelectedFloor(nextFloor);

      // ===================================================
      // UPDATE REFS IMMEDIATELY
      // ===================================================

      selectedMallRef.current = nextMall;

      selectedFloorRef.current = nextFloor;

      // ===================================================
      // UPDATE ROTATION INDEX
      // ===================================================

      const nextMallIndex = malls.findIndex(
        (mallItem) => mallItem.mallId === nextMall.mallId,
      );

      const nextFloorIndex = nextMall?.floors?.findIndex(
        (floor) => floor.floorId === nextFloor.floorId,
      );

      autoRotateRef.current = {
        mallIndex: Math.max(0, nextMallIndex),

        floorIndex: Math.max(0, nextFloorIndex),
      };

      // ===================================================
      // IMPORTANT:
      // LOAD BOTH KPI API GROUPS IMMEDIATELY
      // FOR THE NEW FLOOR
      // ===================================================

      await loadCurrentMallFloorData(nextMall, nextFloor);
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [filtersLoaded]);

  // =========================================================
  // CURRENT MALL FROM DASHBOARD DATA
  // =========================================================

  const dashboardMall = dashboardData.find(
    (mall) => mall.mallId === selectedMall?.mallId,
  );

  // =========================================================
  // CURRENT FLOOR FROM DASHBOARD DATA
  // =========================================================

  const dashboardFloor = dashboardMall?.floors?.find(
    (floor) => floor.floorId === selectedFloor?.floorId,
  );

  // =========================================================
  // HEATMAP
  // =========================================================

  const { zonesToRender } = useHeatmap({
    mode: "tv",

    selectedFloor: dashboardFloor,
  });

  // =========================================================
  // WIDGET DATA
  // =========================================================

  const widget1 = cards?.widget1?.data?.[0] || {};

  const widget2 = cards?.widget2?.data?.[0] || {};

  const widget3 = cards?.widget3?.data?.[0] || {};

  const widget4 = cards?.widget4?.data?.[0] || {};

  // =========================================================
  // MALL OPTIONS
  // =========================================================

  const mallOptions = dashboardData.map((mall) => ({
    value: mall.mallId,

    label: mall.mallName,
  }));

  // =========================================================
  // FLOOR OPTIONS
  // =========================================================

  const floorOptions =
    dashboardMall?.floors?.map((floor) => ({
      value: floor.floorId,

      label: floor.floorName,
    })) || [];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="tv-page">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="tv-header">
        {/* ===================================================
            TITLE
            =================================================== */}

        <div className="tv-header-left">
          <h2>Heatmap Dashboard - Mallwise</h2>
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

        <div className="tv-header-right">
          {/* =================================================
              MALL + FLOOR FILTERS
              ================================================= */}

          {!noDataAvailable && (
            <>
              {/* =============================================
                  MALL
                  ============================================= */}

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
                      onChange={(option) => {
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

                        const firstFloor = mall?.floors?.[0] || null;

                        // Update state

                        setSelectedMall(mall);

                        setSelectedFloor(firstFloor);

                        // Update refs

                        selectedMallRef.current = mall;

                        selectedFloorRef.current = firstFloor;

                        // Reset rotation

                        autoRotateRef.current = {
                          mallIndex,

                          floorIndex: 0,
                        };

                        // =================================
                        // Immediately update BOTH KPI APIs
                        // =================================

                        loadCurrentMallFloorData(mall, firstFloor);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* =============================================
                  FLOOR
                  ============================================= */}

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
                      onChange={(option) => {
                        if (!option) {
                          return;
                        }

                        const floorIndex = dashboardMall?.floors?.findIndex(
                          (floor) => floor.floorId === option.value,
                        );

                        if (floorIndex === -1) {
                          return;
                        }

                        const floor = dashboardMall?.floors?.[floorIndex];

                        if (!floor) {
                          return;
                        }

                        // Update state

                        setSelectedFloor(floor);

                        // Update ref

                        selectedFloorRef.current = floor;

                        // Update rotation

                        autoRotateRef.current = {
                          mallIndex: autoRotateRef.current.mallIndex,

                          floorIndex,
                        };

                        // =================================
                        // Immediately update BOTH KPI APIs
                        // =================================

                        loadCurrentMallFloorData(selectedMall, floor);
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
              <span className="tv-user-name">{username || "User"}</span>

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
                HEATMAP
                ================================================= */}

            <div className="tv-map-container">
              {dashboardFloor && (
                <HeatmapCanvasTV
                  selectedFloor={dashboardFloor}
                  zones={zonesToRender}
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
          noDataAvailable
            ? ""
            : "🟢 LIVE | 🔄 30s Floor Rotation | 📡 15s Data Refresh"
        }
      />
    </div>
  );
};

export default MallWiseTV;
