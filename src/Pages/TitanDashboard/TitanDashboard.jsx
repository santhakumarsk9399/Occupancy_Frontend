// import React, { useEffect, useState, useCallback, memo } from "react";

// import {
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   LabelList,
//   Tooltip,
// } from "recharts";

// import {
//   Building2,
//   UsersRound,
//   Gauge,
//   CalendarDays,
//   Clock3,
// } from "lucide-react";

// import "./TitanDashboard.css";

// import titanLogo2 from "../../Components/Assets/Titan/titan-logo2.avif";
// import titanLogo from "../../Components/Assets/Titan/titan-logo.png";
// import factoryImage5 from "../../Components/Assets/Titan/factory-image5.png";
// import footerlogo from "../../Components/Assets/footer-logo.svg";

// import axios from "axios";

// /* =========================================================
//    DISTRIBUTION COLORS
// ========================================================= */

// const distributionColors = [
//   "#6652D9",
//   "#9A65D6",
//   "#FFB23E",
//   "#20BFAF",
//   "#FF7959",
// ];

// /* =========================================================
//    DONUT DISPLAY FORMAT
//    API returns whole-number occupancy values.
//    Display the exact API number without decimal places.
//    Example: 59 -> 59%
// ========================================================= */

// const formatDonutValue = (value) => {
//   const number = Number(value ?? 0);

//   if (!Number.isFinite(number)) {
//     return "0";
//   }

//   return String(Math.round(number));
// };

// /* =========================================================
//    DONUT TOOLTIP
//    IMPORTANT:
//    Shows API value directly.
//    No percentage calculation.
// ========================================================= */

// // const DonutTooltip = ({ active, payload }) => {
// //   if (!active || !payload?.length) {
// //     return null;
// //   }

// //   const item = payload[0]?.payload || {};

// //   const value = Number(item?.value ?? 0);

// //   return (
// //     <div className="titan-donut-tooltip">
// //       <div className="titan-tooltip-title">{item?.zone || "Location"}</div>

// //       <div className="titan-tooltip-row">
// //         <span>Occupancy</span>

// //         <strong>{value}</strong>
// //       </div>
// //     </div>
// //   );
// // };
// const DonutTooltip = ({ active, payload }) => {
//   if (!active || !payload?.length) {
//     return null;
//   }

//   const item = payload[0]?.payload || {};

//   const zone = item?.zone || item?.Zone || "Location";

//   const value = Number(item?.value ?? 0);

//   return (
//     <div className="titan-donut-tooltip">
//       <div className="titan-tooltip-title">{zone}</div>

//       <div className="titan-tooltip-row">
//         <span>Occupancy</span>

//         <strong>{formatDonutValue(value)}%</strong>
//       </div>
//     </div>
//   );
// };
// /* =========================================================
//    LOCATION TOOLTIP
// ========================================================= */

// const LocationTooltip = ({ active, payload, label }) => {
//   if (!active || !payload?.length) {
//     return null;
//   }

//   const gents = Number(
//     payload.find((item) => item.dataKey === "gents")?.value ?? 0,
//   );

//   const ladies = Number(
//     payload.find((item) => item.dataKey === "ladies")?.value ?? 0,
//   );

//   const total = gents + ladies;

//   return (
//     <div className="titan-chart-tooltip">
//       <div className="titan-tooltip-title">{label || "Location"}</div>

//       <div className="titan-tooltip-row">
//         <span>
//           <i className="titan-tooltip-dot titan-tooltip-gents" />
//           Gents
//         </span>

//         <strong>{gents}</strong>
//       </div>

//       <div className="titan-tooltip-row">
//         <span>
//           <i className="titan-tooltip-dot titan-tooltip-ladies" />
//           Ladies
//         </span>

//         <strong>{ladies}</strong>
//       </div>

//       <div className="titan-tooltip-total">
//         Total
//         <strong>{total}</strong>
//       </div>
//     </div>
//   );
// };

// /* =========================================================
//    NO DATA COMPONENT
// ========================================================= */

// const NoDataAvailable = ({ message = "Data is not available." }) => {
//   return (
//     <div className="titan-no-data" role="status" aria-label="No data available">
//       <div className="titan-no-data-icon">
//         <Building2 size={30} strokeWidth={1.5} />
//       </div>

//       <strong>No Data Available</strong>

//       <span>{message}</span>
//     </div>
//   );
// };

// /* =========================================================
//    DASHBOARD CONTENT
// ========================================================= */

// const TitanDashboardData = memo(function TitanDashboardData({ data }) {
//   /* =====================================================
//        SAFE DATA EXTRACTION
//     ===================================================== */

//   const topCards = data?.topcards || data?.topCards || {};

//   const occupancyDistribution = data?.occupancyDistribution || {};

//   const bottomCards = data?.bottomCards || {};

//   /* =====================================================
//        OCCUPANCY DISTRIBUTION DATA

//        API example:

//        {
//          "Zone": "NB",
//          "value": 13
//        }

//        We use "value" directly.
//        No frontend calculation.
//     ===================================================== */

//   const rawDistributionData = Array.isArray(occupancyDistribution?.data)
//     ? occupancyDistribution.data
//     : [];

//   const distributionData = rawDistributionData.map((item) => ({
//     ...item,

//     zone: item?.Zone ?? item?.zone ?? "",

//     value: Number(item?.value ?? 0),
//   }));

//   /* =====================================================
//        OCCUPANCY BY LOCATION

//        Used by the Gents / Ladies bar chart.
//     ===================================================== */

//   const rawOccupancyByLocation = Array.isArray(data?.occupancyByLocation)
//     ? data.occupancyByLocation
//     : [];

//   const occupancyByLocation = rawOccupancyByLocation.map((item) => ({
//     ...item,

//     zone: item?.Zone ?? item?.zone ?? "",

//     gents: Number(item?.gents ?? 0),

//     ladies: Number(item?.ladies ?? 0),

//     total: Number(
//       item?.value ?? Number(item?.gents ?? 0) + Number(item?.ladies ?? 0),
//     ),
//   }));

//   /* =====================================================
//        TOTAL OCCUPANTS

//        API value used directly.
//     ===================================================== */

//   const totalOccupants = Number(
//     occupancyDistribution?.totalOccupants ?? bottomCards?.totalOccupants ?? 0,
//   );

//   const distributionChartData = distributionData.map((item) => ({
//     ...item,

//     value: Number(item?.value ?? 0),
//   }));

//   const occupancy = Number(bottomCards?.overallOccupancy ?? 0);
//   const occupancyProgressWidth = Math.min(Math.max(occupancy, 0), 100);

//   return (
//     <>
//       {/* =================================================
//               KPI CARDS
//         ================================================= */}

//       <section className="titan-kpi-grid">
//         {/* =================================================
//                 NEW BUILDING
//           ================================================= */}

//         <div className="titan-kpi-card titan-kpi-new">
//           <div className="titan-kpi-icon">
//             <Building2 size={25} strokeWidth={1.7} />
//           </div>

//           <div className="titan-kpi-info">
//             <span className="titan-kpi-label">New Building</span>

//             <strong className="titan-kpi-value">
//               {topCards.newBuilding ?? 0}
//             </strong>

//             <span className="titan-kpi-status">Current occupancy</span>
//           </div>
//         </div>

//         {/* =================================================
//                 OLD BUILDING
//           ================================================= */}

//         <div className="titan-kpi-card titan-kpi-old">
//           <div className="titan-kpi-icon">
//             <Building2 size={25} strokeWidth={1.7} />
//           </div>

//           <div className="titan-kpi-info">
//             <span className="titan-kpi-label">Old Building</span>

//             <strong className="titan-kpi-value">
//               {topCards.oldBuilding ?? 0}
//             </strong>

//             <span className="titan-kpi-status">Current occupancy</span>
//           </div>
//         </div>

//         {/* =================================================
//                 CBC
//           ================================================= */}

//         <div className="titan-kpi-card titan-kpi-cbc">
//           <div className="titan-kpi-icon">
//             <Building2 size={25} strokeWidth={1.7} />
//           </div>

//           <div className="titan-kpi-info">
//             <span className="titan-kpi-label">CBC</span>

//             <strong className="titan-kpi-value">{topCards.cbc ?? 0}</strong>

//             <span className="titan-kpi-status">Current occupancy</span>
//           </div>
//         </div>

//         {/* =================================================
//                 WAREHOUSE
//           ================================================= */}

//         <div className="titan-kpi-card titan-kpi-warehouse">
//           <div className="titan-kpi-icon">
//             <Building2 size={25} strokeWidth={1.7} />
//           </div>

//           <div className="titan-kpi-info">
//             <span className="titan-kpi-label">Warehouse</span>

//             <strong className="titan-kpi-value">
//               {topCards.warehouse ?? 0}
//             </strong>

//             <span className="titan-kpi-status">Current occupancy</span>
//           </div>
//         </div>

//         <div className="titan-kpi-card titan-kpi-cbc">
//           <div className="titan-kpi-icon">
//             <Building2 size={25} strokeWidth={1.7} />
//           </div>

//           <div className="titan-kpi-info">
//             <span className="titan-kpi-label">Others</span>

//             <strong className="titan-kpi-value">{topCards.cbc ?? 0}</strong>

//             <span className="titan-kpi-status">Current occupancy</span>
//           </div>
//         </div>
//       </section>

//       {/* =================================================
//               MAIN ANALYTICS GRID
//         ================================================= */}

//       <section className="titan-main-grid">
//         {/* =================================================
//                 LEFT COLUMN
//           ================================================= */}

//         <div className="titan-left-column">
//           {/* =================================================
//                   OCCUPANCY DISTRIBUTION
//             ================================================= */}

//           <div className="titan-chart-card titan-distribution-card">
//             <div className="titan-chart-heading">
//               <div>
//                 <h2>Occupancy Distribution</h2>

//                 <p>Current occupancy distribution by location</p>
//               </div>
//             </div>

//             <div className="titan-distribution-body">
//               {distributionData.length > 0 ? (
//                 <>
//                   {/* =================================================
//                           DONUT CHART
//                     ================================================= */}

//                   <div className="titan-donut-wrapper">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <PieChart>
//                         <Tooltip
//                           content={<DonutTooltip />}
//                           cursor={false}
//                           allowEscapeViewBox={{
//                             x: true,
//                             y: true,
//                           }}
//                           wrapperStyle={{
//                             zIndex: 9999,
//                             pointerEvents: "none",
//                           }}
//                         />

//                         <Pie
//                           data={distributionChartData}
//                           dataKey="value"
//                           nameKey="zone"
//                           cx="50%"
//                           cy="50%"
//                           innerRadius="42%"
//                           outerRadius="78%"
//                           paddingAngle={2}
//                           stroke="#ffffff"
//                           strokeWidth={3}
//                           labelLine={({ points }) => {
//                             if (!points || points.length < 2) {
//                               return null;
//                             }

//                             return (
//                               <polyline
//                                 points={points
//                                   .map((point) => `${point.x},${point.y}`)
//                                   .join(" ")}
//                                 fill="none"
//                                 stroke="#AAB6C8"
//                                 strokeWidth={1.5}
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                               />
//                             );
//                           }}
//                           isAnimationActive={false}
//                           label={({ cx, cy, midAngle, outerRadius, index }) => {
//                             const item = distributionChartData[index];
//                             const value = Number(item?.value ?? 0);

//                             const RADIAN = Math.PI / 180;

//                             // Put the percentage outside the donut.
//                             // The extra distance keeps the text away from the arc.
//                             const labelRadius = outerRadius + 24;

//                             const x =
//                               cx + labelRadius * Math.cos(-midAngle * RADIAN);

//                             const y =
//                               cy + labelRadius * Math.sin(-midAngle * RADIAN);

//                             const textAnchor = x >= cx ? "start" : "end";

//                             return (
//                               <text
//                                 x={x}
//                                 y={y}
//                                 fill="#17234D"
//                                 textAnchor={textAnchor}
//                                 dominantBaseline="central"
//                                 fontSize={13}
//                                 fontWeight={700}
//                                 className="titan-donut-outside-label"
//                               >
//                                 {formatDonutValue(value)}%
//                               </text>
//                             );
//                           }}
//                         >
//                           {distributionChartData.map((item, index) => (
//                             <Cell
//                               key={`distribution-${index}`}
//                               fill={
//                                 distributionColors[
//                                   index % distributionColors.length
//                                 ]
//                               }
//                             />
//                           ))}
//                         </Pie>
//                       </PieChart>
//                     </ResponsiveContainer>

//                     {/* CENTER VALUE */}

//                     <div className="titan-donut-center">
//                       <strong>{totalOccupants}</strong>

//                       <span>Total Occupancy</span>
//                     </div>
//                   </div>

//                   {/* =================================================
//                           DONUT LEGEND

//                           IMPORTANT:
//                           Shows API value directly.
//                     ================================================= */}

//                   <div className="titan-distribution-legend">
//                     {distributionData.map((item, index) => {
//                       const value = Number(item?.value ?? 0);

//                       return (
//                         <div
//                           className="titan-distribution-item"
//                           key={`${item?.zone}-${index}`}
//                         >
//                           <span
//                             className="titan-distribution-dot"
//                             style={{
//                               backgroundColor:
//                                 distributionColors[
//                                   index % distributionColors.length
//                                 ],
//                               opacity: value === 0 ? 0.65 : 1,
//                             }}
//                           />

//                           <span className="titan-distribution-zone">
//                             {item?.zone}
//                           </span>

//                           <span className="titan-distribution-percent">
//                             ({formatDonutValue(value)}%)
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </>
//               ) : (
//                 <NoDataAvailable message="Occupancy distribution data is not available." />
//               )}
//             </div>
//           </div>

//           {/* =================================================
//                   BOTTOM SUMMARY
//             ================================================= */}

       
//         </div>

//         {/* =================================================
//                 RIGHT COLUMN
//           ================================================= */}

//         <div className="titan-right-column">
//           {/* =================================================
//                   OCCUPANCY BY LOCATION
//             ================================================= */}

//           <div className="titan-chart-card titan-location-card">
//             <div className="titan-chart-heading">
//               <div>
//                 <h2>
//                   Occupancy by Zones <span>(Gents / Ladies)</span>
//                 </h2>

//                 <p>Occupancy count across all locations</p>
//               </div>
//             </div>

//             {occupancyByLocation.length > 0 ? (
//               <>
//                 {/* =================================================
//                         BAR CHART
//                   ================================================= */}

//                 <div className="titan-location-chart">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart
//                       data={occupancyByLocation}
//                       margin={{
//                         top: 28,
//                         right: 10,
//                         left: 10,
//                         bottom: 10,
//                       }}
//                       barCategoryGap="30%"
//                     >
//                       <Tooltip
//                         content={<LocationTooltip />}
//                         cursor={false}
//                         wrapperStyle={{
//                           outline: "none",
//                         }}
//                       />

//                       <CartesianGrid
//                         stroke="#D9E1EC"
//                         strokeDasharray="3 3"
//                         vertical={false}
//                       />

//                       <XAxis
//                         dataKey="zone"
//                         axisLine={{
//                           stroke: "#D9E1EC",
//                           strokeWidth: 1,
//                           strokeDasharray: "3 3",
//                         }}
//                         tickLine={false}
//                         tick={{
//                           fill: "#17234D",
//                           fontSize: 13,
//                           fontWeight: 650,
//                         }}
//                         label={{
//                           value: "Zones",
//                           position: "bottom",
//                           offset: 0,
//                           fill: "#63739B",
//                           fontSize: 13,
//                         }}
//                       />

//                       <YAxis
//                         domain={[0, 250]}
//                         ticks={[0, 50, 100, 150, 200, 250]}
//                         axisLine={false}
//                         tickLine={false}
//                         tick={{
//                           fill: "#63739B",
//                           fontSize: 11,
//                         }}
//                         label={{
//                           value: "Occupancy",
//                           angle: -90,
//                           position: "insideLeft",
//                           fill: "#63739B",
//                           fontSize: 13,
//                         }}
//                       />

//                       {/* =================================================
//                               GENTS
//                         ================================================= */}

//                       <Bar dataKey="gents" stackId="occupancy" fill="#6652D9">
//                         <LabelList
//                           dataKey="gents"
//                           position="center"
//                           fill="#ffffff"
//                           fontSize={12}
//                           fontWeight={600}
//                         />
//                       </Bar>

//                       {/* =================================================
//                               LADIES
//                         ================================================= */}

//                       <Bar
//                         dataKey="ladies"
//                         stackId="occupancy"
//                         fill="#2CC398"
//                         radius={[4, 4, 0, 0]}
//                       >
//                         <LabelList
//                           dataKey="ladies"
//                           position="center"
//                           fill="#ffffff"
//                           fontSize={12}
//                           fontWeight={600}
//                         />

//                         <LabelList
//                           dataKey="total"
//                           position="top"
//                           fill="#17234D"
//                           fontSize={13}
//                           fontWeight={700}
//                         />
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>

//                 {/* =================================================
//                         BAR LEGEND
//                   ================================================= */}

//                 <div className="titan-location-legend">
//                   <div>
//                     <span className="titan-gents-dot" />

//                     <span>Gents</span>
//                   </div>

//                   <div>
//                     <span className="titan-ladies-dot" />

//                     <span>Ladies</span>
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <NoDataAvailable message="Zone occupancy data is not available." />
//             )}
//           </div>
//         </div>
//       </section>
//       <section className="titan-summary">
//         {/* =================================================
//                     TOTAL OCCUPANCY
//               ================================================= */}

//         <div className="titan-summary-item">
//           <div className="titan-summary-icon orange">
//             <UsersRound size={32} strokeWidth={1.7} />
//           </div>

//           <div className="titan-summary-content">
//             <span>Total Occupancy</span>

//             <strong>
//               {bottomCards?.totalOccupants ?? totalOccupants ?? 0}
//             </strong>

//             <small>People currently inside</small>
//           </div>
//         </div>

//         <div className="titan-summary-divider" />

//         {/* =================================================
//                     OVERALL OCCUPANCY
//               ================================================= */}

//         <div className="titan-summary-item titan-overall">
//           <div className="titan-summary-icon green">
//             <Gauge size={32} strokeWidth={1.7} />
//           </div>

//           <div className="titan-summary-content">
//             <span>Overall Occupancy</span>

//             {/* =================================================
//                         API VALUE DIRECTLY

//                         Example:
//                         API = 126.2

//                         Display = 126.2%
//                   ================================================= */}

//             <strong>{occupancy}%</strong>

//             {/* =================================================
//                         PROGRESS BAR

//                         Only visual width is capped.
//                   ================================================= */}

//             {/* <div
//                   className="titan-summary-progress"
//                   aria-label={`Overall occupancy ${occupancy}%`}
//                 >
//                   <div
//                     className="titan-summary-progress-fill"
//                     style={{
//                       width: `${occupancyProgressWidth}%`,
//                     }}
//                   />
//                 </div> */}
//           </div>
//         </div>
//         <div className="titan-summary-divider" />
//         {/* =================================================
//                     Eployee Entry
//               ================================================= */}

//         <div className="titan-summary-item">
//           {/* Employee Entry */}
//           <div className="titan-summary-icon employee">
//             <UsersRound size={32} strokeWidth={1.7} />
//           </div>

//           <div className="titan-summary-content">
//             <span>Employee Entry</span>

//             <strong>
//               {bottomCards?.totalOccupants ?? totalOccupants ?? 0}
//             </strong>

//             {/* <small>People currently inside</small> */}
//           </div>
//         </div>

//         <div className="titan-summary-divider" />
//         {/* =================================================
//                     contract Employee entry
//               ================================================= */}

//         <div className="titan-summary-item">
//           {/* Contract Employee Entry */}
//           <div className="titan-summary-icon contract">
//             <UsersRound size={32} strokeWidth={1.7} />
//           </div>

//           <div className="titan-summary-content">
//             <span>Contract Employee Entry</span>

//             <strong>
//               {bottomCards?.totalOccupants ?? totalOccupants ?? 0}
//             </strong>

//             {/* <small>People currently inside</small> */}
//           </div>
//         </div>
//       </section>
//     </>
//   );
// });

// /* =========================================================
//    MAIN DASHBOARD
// ========================================================= */

// const TitanDashboard = () => {
//   /* =====================================================
//        DASHBOARD STATE
//   ===================================================== */

//   const [dashboardData, setDashboardData] = useState(null);

//   const [currentDateTime, setCurrentDateTime] = useState(new Date());

//   const [apiError, setApiError] = useState("");

//   /*
//    * Loader is only used during
//    * the initial API request.
//    */

//   const [isInitialLoading, setIsInitialLoading] = useState(true);

//   const API_URL = import.meta.env.VITE_API_URL;

//   const token = sessionStorage.getItem("token") || "";

//   const UserName = sessionStorage.getItem("username") || "";

//   /* =====================================================
//        API REQUEST
//   ===================================================== */

//   const getTitanDashData = async () => {
//     try {
//       const response = await axios.get(
//         `${API_URL}/dashboard/getTtianCustomDashboardData`,
//         {
//           params: {
//             username: UserName,
//           },

//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       console.log("Titan Dashboard API Response:", response.data);

//       return response.data;
//     } catch (error) {
//       console.error(
//         "Titan Dashboard API Error:",
//         error?.response?.data || error,
//       );

//       throw error;
//     }
//   };

//   /* =====================================================
//        FETCH DASHBOARD DATA
//   ===================================================== */

//   const fetchDashboardData = useCallback(async () => {
//     try {
//       const result = await getTitanDashData();

//       console.log("Titan Dashboard API Response:", result);

//       /* =============================================
//                API SUCCESS VALIDATION
//           ============================================= */

//       if (result?.success !== true) {
//         throw new Error(
//           result?.message || "API returned an unsuccessful response",
//         );
//       }

//       /* =============================================
//                UPDATE DATA
//           ============================================= */

//       setDashboardData(result);

//       setApiError("");
//     } catch (error) {
//       console.error("Titan Dashboard API error:", error);

//       setApiError(error?.message || "Unable to refresh dashboard data");
//     } finally {
//       setIsInitialLoading(false);
//     }
//   }, []);

//   /* =====================================================
//        INITIAL LOAD + 15 SECOND REFRESH
//   ===================================================== */

//   useEffect(() => {
//     fetchDashboardData();

//     const refreshTimer = setInterval(() => {
//       fetchDashboardData();
//     }, 15000);

//     return () => {
//       clearInterval(refreshTimer);
//     };
//   }, [fetchDashboardData]);

//   /* =====================================================
//        CLOCK
//   ===================================================== */

//   useEffect(() => {
//     const clockTimer = setInterval(() => {
//       setCurrentDateTime(new Date());
//     }, 1000);

//     return () => {
//       clearInterval(clockTimer);
//     };
//   }, []);

//   /* =====================================================
//        API DATA
//   ===================================================== */

//   const data = dashboardData?.data || {};

//   /* =====================================================
//        DATE
//   ===================================================== */

//   const formattedDate = new Intl.DateTimeFormat("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//     timeZone: "Asia/Kolkata",
//   }).format(currentDateTime);

//   /* =====================================================
//        TIME
//   ===================================================== */

//   const formattedTime = new Intl.DateTimeFormat("en-IN", {
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: true,
//     timeZone: "Asia/Kolkata",
//   }).format(currentDateTime);

//   /* =====================================================
//        RENDER
//   ===================================================== */

//   return (
//     <div className="titan-dashboard">
//       {/* =================================================
//             BACKGROUND
//       ================================================= */}

//       <div className="titan-background">
//         <img src={factoryImage5} alt="" className="titan-factory-watermark" />
//       </div>

//       {/* =================================================
//             INITIAL PAGE LOADER
//       ================================================= */}

//       {isInitialLoading && (
//         <div className="titan-initial-loader" role="status" aria-live="polite">
//           <div className="titan-loader-spinner" />

//           <span>Loading dashboard...</span>
//         </div>
//       )}

//       {/* =================================================
//             MAIN CONTENT
//       ================================================= */}

//       <main className="titan-dashboard-content">
//         {/* =================================================
//               HEADER
//         ================================================= */}

//         <header className="titan-header">
//           {/* =================================================
//                 LEFT HEADER
//           ================================================= */}

//           <div className="titan-header-left">
//             {/* =================================================
//                   BRAND LOGOS
//             ================================================= */}

//             <div className="titan-brand-logos">
//               {/* TANISHQ */}

//               <div className="titan-brand-item tanishq-brand">
//                 <img
//                   src={titanLogo2}
//                   alt="Tanishq"
//                   className="titan-logo-image tanishq-logo-image"
//                   loading="eager"
//                 />
//               </div>

//               {/* DIVIDER */}

//               <span className="titan-brand-divider" />

//               {/* TITAN COMPANY */}

//               <div className="titan-brand-item titan-company-brand">
//                 <img
//                   src={titanLogo}
//                   alt="Titan Company"
//                   className="titan-logo-image titan-company-logo-image"
//                   loading="eager"
//                 />
//               </div>
//             </div>

//             {/* =================================================
//                   TITLE
//             ================================================= */}

//             <div className="titan-title-block">
//               <h1>Factory Occupancy Overview</h1>
//             </div>
//           </div>

//           {/* =================================================
//                 RIGHT HEADER
//           ================================================= */}

//           <div className="titan-header-right">
//             {/* LIVE */}

//             <div className="titan-live">
//               <span className="titan-live-dot" />

//               <span>LIVE</span>
//             </div>

//             {/* DIVIDER */}

//             <span className="titan-header-line" />

//             {/* DATE */}

//             <div className="titan-header-meta">
//               <CalendarDays size={15} strokeWidth={1.8} />

//               <span>{formattedDate}</span>
//             </div>

//             {/* DIVIDER */}

//             <span className="titan-header-line" />

//             {/* TIME */}

//             <div className="titan-header-meta">
//               <Clock3 size={15} strokeWidth={1.8} />

//               <span>{formattedTime}</span>
//             </div>
//           </div>
//         </header>

//         {/* =================================================
//               OPTIONAL API ERROR
//         ================================================= */}

//         {/*
//         {apiError && (
//           <div
//             className="titan-api-status"
//             role="status"
//           >
//             {apiError}
//           </div>
//         )}
//         */}

//         {/* =================================================
//               DASHBOARD DATA
//         ================================================= */}

//         <TitanDashboardData data={data} />

//         {/* =================================================
//               FOOTER
//         ================================================= */}

//         <footer className="titan-dashboard-footer">
//           {/* LEFT */}

//           <div className="titan-dashboard-footer-note">
//             <span className="titan-dashboard-footer-note-icon">i</span>

//             <span className="titan-dashboard-footer-note-text">
//               Note : Counts are updated every 15 secs.
//             </span>
//           </div>

//           {/* RIGHT */}

//           <div className="titan-dashboard-footer-right">
//             <span className="titan-dashboard-footer-copyright">
//               Copyright © {new Date().getFullYear()} All Rights Reserved
//             </span>

//             <img
//               src={footerlogo}
//               alt="Delopt"
//               className="titan-dashboard-footer-logo"
//               loading="eager"
//             />
//           </div>
//         </footer>
//       </main>
//     </div>
//   );
// };

// export default TitanDashboard;


// import React, { useEffect, useState, useCallback, memo } from "react";

// import {
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   LabelList,
//   Tooltip,
// } from "recharts";

// import {
//   Building2,
//   UsersRound,
//   Gauge,
//   CalendarDays,
//   Clock3,
// } from "lucide-react";

// import "./TitanDashboard.css";

// import titanLogo2 from "../../Components/Assets/Titan/titan-logo2.avif";
// import titanLogo from "../../Components/Assets/Titan/titan-logo.png";
// import factoryImage5 from "../../Components/Assets/Titan/factory-image5.png";
// import footerlogo from "../../Components/Assets/footer-logo.svg";

// import axios from "axios";

// /* =========================================================
//    DISTRIBUTION COLORS
// ========================================================= */

// const distributionColors = [
//   "#6652D9",
//   "#9A65D6",
//   "#FFB23E",
//   "#20BFAF",
//   "#FF7959",
// ];

// /* =========================================================
//    DONUT DISPLAY FORMAT
//    API returns whole-number occupancy values.
//    Display the exact API number without decimal places.
//    Example: 59 -> 59%
// ========================================================= */

// const formatDonutValue = (value) => {
//   const number = Number(value ?? 0);

//   if (!Number.isFinite(number)) {
//     return "0";
//   }

//   return String(Math.round(number));
// };


// const DonutTooltip = ({ active, payload }) => {
//   if (!active || !payload?.length) {
//     return null;
//   }

//   const item = payload[0]?.payload || {};

//   const zone = item?.zone || item?.Zone || "Location";

//   const value = Number(item?.value ?? 0);

//   return (
//     <div className="titan-donut-tooltip">
//       <div className="titan-tooltip-title">{zone}</div>

//       <div className="titan-tooltip-row">
//         <span>Occupancy</span>

//         <strong>{formatDonutValue(value)}%</strong>
//       </div>
//     </div>
//   );
// };
// /* =========================================================
//    LOCATION TOOLTIP
// ========================================================= */

// // const LocationTooltip = ({ active, payload, label }) => {
// //   if (!active || !payload?.length) {
// //     return null;
// //   }

// //   const gents = Number(
// //     payload.find((item) => item.dataKey === "gents")?.value ?? 0,
// //   );

// //   const ladies = Number(
// //     payload.find((item) => item.dataKey === "ladies")?.value ?? 0,
// //   );

// //   const total = gents + ladies;

// //   return (
// //     <div className="titan-chart-tooltip">
// //       <div className="titan-tooltip-title">{label || "Location"}</div>

// //       <div className="titan-tooltip-row">
// //         <span>
// //           <i className="titan-tooltip-dot titan-tooltip-gents" />
// //           Gents
// //         </span>

// //         <strong>{gents}</strong>
// //       </div>

// //       <div className="titan-tooltip-row">
// //         <span>
// //           <i className="titan-tooltip-dot titan-tooltip-ladies" />
// //           Ladies
// //         </span>

// //         <strong>{ladies}</strong>
// //       </div>

// //       <div className="titan-tooltip-total">
// //         Total
// //         <strong>{total}</strong>
// //       </div>
// //     </div>
// //   );
// // };
// const LocationTooltip = ({ active, payload, label }) => {
//   if (!active || !payload?.length) {
//     return null;
//   }

//   const row = payload[0]?.payload || {};

//   const zone = row?.zone || label || "Location";

//   const isOthers = zone.toLowerCase() === "others";

//   const gents = Number(row?.gents ?? 0);
//   const ladies = Number(row?.ladies ?? 0);
//   const others = Number(row?.others ?? 0);

//   return (
//     <div className="titan-chart-tooltip">

//       <div className="titan-tooltip-title">
//         {zone}
//       </div>

//       {isOthers ? (
//         <>
//           {/* ONLY OTHERS */}
//           <div className="titan-tooltip-row">
//             <span>
//               <i
//                 className="titan-tooltip-dot"
//                 style={{ backgroundColor: "#F59E0B" }}
//               />
//               Others
//             </span>

//             <strong>{others}</strong>
//           </div>

//           <div className="titan-tooltip-total">
//             Total
//             <strong>{others}</strong>
//           </div>
//         </>
//       ) : (
//         <>
//           {/* GENTS */}
//           <div className="titan-tooltip-row">
//             <span>
//               <i className="titan-tooltip-dot titan-tooltip-gents" />
//               Gents
//             </span>

//             <strong>{gents}</strong>
//           </div>

//           {/* LADIES */}
//           <div className="titan-tooltip-row">
//             <span>
//               <i className="titan-tooltip-dot titan-tooltip-ladies" />
//               Ladies
//             </span>

//             <strong>{ladies}</strong>
//           </div>

//           {/* TOTAL */}
//           <div className="titan-tooltip-total">
//             Total
//             <strong>{gents + ladies}</strong>
//           </div>
//         </>
//       )}

//     </div>
//   );
// };
// /* =========================================================
//    NO DATA COMPONENT
// ========================================================= */

// const NoDataAvailable = ({ message = "Data is not available." }) => {
//   return (
//     <div className="titan-no-data" role="status" aria-label="No data available">
//       <div className="titan-no-data-icon">
//         <Building2 size={30} strokeWidth={1.5} />
//       </div>

//       <strong>No Data Available</strong>

//       <span>{message}</span>
//     </div>
//   );
// };

// /* =========================================================
//    DASHBOARD CONTENT
// ========================================================= */

// const TitanDashboardData = memo(function TitanDashboardData({ data }) {
//   /* =====================================================
//        SAFE DATA EXTRACTION
//     ===================================================== */

//   const topCards = data?.topcards || data?.topCards || {};

//   const occupancyDistribution = data?.occupancyDistribution || {};

//   const bottomCards = data?.bottomCards || {};

 

//   const rawDistributionData = Array.isArray(occupancyDistribution?.data)
//     ? occupancyDistribution.data
//     : [];

//   const distributionData = rawDistributionData.map((item) => ({
//     ...item,

//     zone: item?.Zone ?? item?.zone ?? "",

//     value: Number(item?.value ?? 0),
//   }));

//   /* =====================================================
//        OCCUPANCY BY LOCATION

//        Used by the Gents / Ladies bar chart.
//     ===================================================== */

//   const rawOccupancyByLocation = Array.isArray(data?.occupancyByLocation)
//     ? data.occupancyByLocation
//     : [];

//   // const occupancyByLocation = rawOccupancyByLocation.map((item) => ({
//   //   ...item,

//   //   zone: item?.Zone ?? item?.zone ?? "",

//   //   gents: Number(item?.gents ?? 0),

//   //   ladies: Number(item?.ladies ?? 0),

//   //   total: Number(
//   //     item?.value ?? Number(item?.gents ?? 0) + Number(item?.ladies ?? 0),
//   //   ),
//   // }));
//   const occupancyByLocation = rawOccupancyByLocation.map((item) => {
//     const zone = item?.Zone ?? item?.zone ?? "";
//     const isOthers = zone.toLowerCase() === "others";

//     return {
//       ...item,

//       zone,

//       // Normal zones
//       gents: isOthers ? 0 : Number(item?.gents ?? 0),
//       ladies: isOthers ? 0 : Number(item?.ladies ?? 0),

//       // Others zone
//       others: isOthers
//         ? Number(item?.Others ?? item?.others ?? item?.value ?? 0)
//         : 0,

//       total: Number(item?.value ?? 0),
//     };
//   });
//   /* =====================================================
//        TOTAL OCCUPANTS

//        API value used directly.
//     ===================================================== */

//   const totalOccupants = Number(
//     occupancyDistribution?.totalOccupants ?? bottomCards?.totalOccupants ?? 0,
//   );

//   const distributionChartData = distributionData.map((item) => ({
//     ...item,

//     value: Number(item?.value ?? 0),
//   }));

//   const occupancy = Number(bottomCards?.overallOccupancy ?? 0);
//   const occupancyProgressWidth = Math.min(Math.max(occupancy, 0), 100);

//   return (
//     <>
//       {/* =================================================
//               KPI CARDS
//         ================================================= */}

//       <section className="titan-kpi-grid">
//         {/* =================================================
//                 NEW BUILDING
//           ================================================= */}

//         <div className="titan-kpi-card titan-kpi-new">
//           <div className="titan-kpi-icon">
//             <Building2 size={25} strokeWidth={1.7} />
//           </div>

//           <div className="titan-kpi-info">
//             <span className="titan-kpi-label">Studded Jewellery</span>

//             <strong className="titan-kpi-value">
//               {topCards.newBuilding ?? 0}
//             </strong>

//             <span className="titan-kpi-status">Current occupancy</span>
//           </div>
//         </div>

//         {/* =================================================
//                 OLD BUILDING
//           ================================================= */}

//         <div className="titan-kpi-card titan-kpi-old">
//           <div className="titan-kpi-icon">
//             <Building2 size={25} strokeWidth={1.7} />
//           </div>

//           <div className="titan-kpi-info">
//             <span className="titan-kpi-label">Gold Jewellery</span>

//             <strong className="titan-kpi-value">
//               {topCards.oldBuilding ?? 0}
//             </strong>

//             <span className="titan-kpi-status">Current occupancy</span>
//           </div>
//         </div>

//         {/* =================================================
//                 CBC
//           ================================================= */}

//         <div className="titan-kpi-card titan-kpi-cbc">
//           <div className="titan-kpi-icon">
//             <Building2 size={25} strokeWidth={1.7} />
//           </div>

//           <div className="titan-kpi-info">
//             <span className="titan-kpi-label">CBC</span>

//             <strong className="titan-kpi-value">{topCards.cbc ?? 0}</strong>

//             <span className="titan-kpi-status">Current occupancy</span>
//           </div>
//         </div>

//         {/* =================================================
//                 WAREHOUSE
//           ================================================= */}

//         <div className="titan-kpi-card titan-kpi-warehouse">
//           <div className="titan-kpi-icon">
//             <Building2 size={25} strokeWidth={1.7} />
//           </div>

//           <div className="titan-kpi-info">
//             <span className="titan-kpi-label">Warehouse</span>

//             <strong className="titan-kpi-value">
//               {topCards.warehouse ?? 0}
//             </strong>

//             <span className="titan-kpi-status">Current occupancy</span>
//           </div>
//         </div>
//         {/* =================================================
//                 OTHERS
//           ================================================= */}

//         <div className="titan-kpi-card titan-kpi-others">
//           <div className="titan-kpi-icon">
//             <Building2 size={25} strokeWidth={1.7} />
//           </div>

//           <div className="titan-kpi-info">
//             <span className="titan-kpi-label">Others</span>

//             <strong className="titan-kpi-value">
//               {topCards.others ?? 0}
//             </strong>

//             <span className="titan-kpi-status">Current occupancy</span>
//           </div>
//         </div>
//       </section>

//       {/* =================================================
//               MAIN ANALYTICS GRID
//         ================================================= */}

//       <section className="titan-main-grid">
//         {/* =================================================
//                 LEFT COLUMN
//           ================================================= */}

//         <div className="titan-left-column">
//           {/* =================================================
//                   OCCUPANCY DISTRIBUTION
//             ================================================= */}

//           <div className="titan-chart-card titan-distribution-card">
//             <div className="titan-chart-heading">
//               <div>
//                 <h2>Occupancy Distribution</h2>

//                 <p>Current occupancy distribution by location</p>
//               </div>
//             </div>

//             <div className="titan-distribution-body">
//               {distributionData.length > 0 ? (
//                 <>
//                   {/* =================================================
//                           DONUT CHART
//                     ================================================= */}

//                   <div className="titan-donut-wrapper">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <PieChart>
//                         <Tooltip
//                           content={<DonutTooltip />}
//                           cursor={false}
//                           allowEscapeViewBox={{
//                             x: true,
//                             y: true,
//                           }}
//                           wrapperStyle={{
//                             zIndex: 9999,
//                             pointerEvents: "none",
//                           }}
//                         />

//                         <Pie
//                           data={distributionChartData}
//                           dataKey="value"
//                           nameKey="zone"
//                           cx="50%"
//                           cy="50%"
//                           innerRadius="42%"
//                           outerRadius="78%"
//                           paddingAngle={2}
//                           stroke="#ffffff"
//                           strokeWidth={3}
//                           labelLine={({ points }) => {
//                             if (!points || points.length < 2) {
//                               return null;
//                             }

//                             return (
//                               <polyline
//                                 points={points
//                                   .map((point) => `${point.x},${point.y}`)
//                                   .join(" ")}
//                                 fill="none"
//                                 stroke="#AAB6C8"
//                                 strokeWidth={1.5}
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                               />
//                             );
//                           }}
//                           isAnimationActive={false}
//                           label={({ cx, cy, midAngle, outerRadius, index }) => {
//                             const item = distributionChartData[index];
//                             const value = Number(item?.value ?? 0);

//                             const RADIAN = Math.PI / 180;

//                             // Put the percentage outside the donut.
//                             // The extra distance keeps the text away from the arc.
//                             const labelRadius = outerRadius + 24;

//                             const x =
//                               cx + labelRadius * Math.cos(-midAngle * RADIAN);

//                             const y =
//                               cy + labelRadius * Math.sin(-midAngle * RADIAN);

//                             const textAnchor = x >= cx ? "start" : "end";

//                             return (
//                               <text
//                                 x={x}
//                                 y={y}
//                                 fill="#17234D"
//                                 textAnchor={textAnchor}
//                                 dominantBaseline="central"
//                                 fontSize={13}
//                                 fontWeight={700}
//                                 className="titan-donut-outside-label"
//                               >
//                                 {formatDonutValue(value)}%
//                               </text>
//                             );
//                           }}
//                         >
//                           {distributionChartData.map((item, index) => (
//                             <Cell
//                               key={`distribution-${index}`}
//                               fill={
//                                 distributionColors[
//                                 index % distributionColors.length
//                                 ]
//                               }
//                             />
//                           ))}
//                         </Pie>
//                       </PieChart>
//                     </ResponsiveContainer>

//                     {/* CENTER VALUE */}

//                     <div className="titan-donut-center">
//                       <strong>{totalOccupants}</strong>

//                       <span>Total Occupancy</span>
//                     </div>
//                   </div>

//                   {/* =================================================
//                           DONUT LEGEND

//                           IMPORTANT:
//                           Shows API value directly.
//                     ================================================= */}

//                   <div className="titan-distribution-legend">
//                     {distributionData.map((item, index) => {
//                       const value = Number(item?.value ?? 0);

//                       return (
//                         <div
//                           className="titan-distribution-item"
//                           key={`${item?.zone}-${index}`}
//                         >
//                           <span
//                             className="titan-distribution-dot"
//                             style={{
//                               backgroundColor:
//                                 distributionColors[
//                                 index % distributionColors.length
//                                 ],
//                               opacity: value === 0 ? 0.65 : 1,
//                             }}
//                           />

//                           <span className="titan-distribution-zone">
//                             {item?.zone}
//                           </span>

//                           <span className="titan-distribution-percent">
//                             ({formatDonutValue(value)}%)
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </>
//               ) : (
//                 <NoDataAvailable message="Occupancy distribution data is not available." />
//               )}
//             </div>
//           </div>

//           {/* =================================================
//                   BOTTOM SUMMARY
//             ================================================= */}


//         </div>

//         {/* =================================================
//                 RIGHT COLUMN
//           ================================================= */}

//         <div className="titan-right-column">
//           {/* =================================================
//                   OCCUPANCY BY LOCATION
//             ================================================= */}

//           <div className="titan-chart-card titan-location-card">
//             <div className="titan-chart-heading">
//               <div>
//                 <h2>
//                   Occupancy by Zones <span>(Gents / Ladies / Others)</span>
//                 </h2>
//                 <p>Occupancy count across all locations</p>
//               </div>
//             </div>

//             {occupancyByLocation.length > 0 ? (
//               <>
//                 {/* =================================================
//                         BAR CHART
//                   ================================================= */}

//                 <div className="titan-location-chart">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart
//                       data={occupancyByLocation}
//                       margin={{
//                         top: 28,
//                         right: 10,
//                         left: 10,
//                         bottom: 10,
//                       }}
//                       barCategoryGap="30%"
//                     >
//                       <Tooltip
//                         content={<LocationTooltip />}
//                         cursor={false}
//                         wrapperStyle={{
//                           outline: "none",
//                         }}
//                       />

//                       <CartesianGrid
//                         stroke="#D9E1EC"
//                         strokeDasharray="3 3"
//                         vertical={false}
//                       />

//                       <XAxis
//                         dataKey="zone"
//                         axisLine={{
//                           stroke: "#D9E1EC",
//                           strokeWidth: 1,
//                           strokeDasharray: "3 3",
//                         }}
//                         tickLine={false}
//                         tick={{
//                           fill: "#17234D",
//                           fontSize: 13,
//                           fontWeight: 650,
//                         }}
//                         label={{
//                           value: "Zones",
//                           position: "bottom",
//                           offset: 0,
//                           fill: "#63739B",
//                           fontSize: 13,
//                         }}
//                       />

//                       <YAxis
//                         domain={[0, 250]}
//                         ticks={[0, 50, 100, 150, 200, 250]}
//                         axisLine={false}
//                         tickLine={false}
//                         tick={{
//                           fill: "#63739B",
//                           fontSize: 11,
//                         }}
//                         label={{
//                           value: "Occupancy",
//                           angle: -90,
//                           position: "insideLeft",
//                           fill: "#63739B",
//                           fontSize: 13,
//                         }}
//                       />

//                       {/* =================================================
//                               GENTS
//                         ================================================= */}

//                      <Bar
//                         dataKey="gents"
//                         stackId="occupancy"
//                         fill="#6652D9"
//                       >
//                         <LabelList
//                           dataKey="gents"
//                           position="center"
//                           fill="#ffffff"
//                           fontSize={12}
//                           fontWeight={600}
//                         />
//                       </Bar>

//                       {/* =================================================
//                               LADIES
//                         ================================================= */}

//                         <Bar
//                         dataKey="ladies"
//                         stackId="occupancy"
//                         fill="#2CC398"
//                       >
//                         <LabelList
//                           dataKey="ladies"
//                           position="center"
//                           fill="#ffffff"
//                           fontSize={12}
//                           fontWeight={600}
//                         />
//                       </Bar>
//                       {/* =================================================
//                               Others and Total
//                         ================================================= */}
//                       <Bar
//                         dataKey="others"
//                         stackId="occupancy"
//                         fill="#F59E0B"
//                         radius={[4, 4, 0, 0]}
//                       >
//                         <LabelList
//                           dataKey="others"
//                           position="center"
//                           fill="#ffffff"
//                           fontSize={12}
//                           fontWeight={600}
//                         />

//                         <LabelList
//                           dataKey="total"
//                           position="top"
//                           fill="#17234D"
//                           fontSize={13}
//                           fontWeight={700}
//                         />
//                       </Bar>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>

//                 {/* =================================================
//                         BAR LEGEND
//                   ================================================= */}

//                 <div className="titan-location-legend">

//                   <div>
//                     <span className="titan-gents-dot" />
//                     <span>Gents</span>
//                   </div>

//                   <div>
//                     <span className="titan-ladies-dot" />
//                     <span>Ladies</span>
//                   </div>

//                   <div>
//                     <span
//                       className="titan-others-dot"
//                       style={{ backgroundColor: "#F59E0B" }}
//                     />
//                     <span>Others</span>
//                   </div>

//                 </div>
//               </>
//             ) : (
//               <NoDataAvailable message="Zone occupancy data is not available." />
//             )}
//           </div>
//         </div>
//       </section>
//       <section className="titan-summary">
//         {/* =================================================
//                     TOTAL OCCUPANCY
//               ================================================= */}

//         <div className="titan-summary-item">
//           <div className="titan-summary-icon orange">
//             <UsersRound size={32} strokeWidth={1.7} />
//           </div>

//           <div className="titan-summary-content">
//             <span>Total Occupancy</span>

//             <strong>
//               {bottomCards?.totalOccupants ?? totalOccupants ?? 0}
//             </strong>

//             <small>People currently inside</small>
//           </div>
//         </div>

//         <div className="titan-summary-divider" />


//         {/* =================================================
//                     Employee Entry
//               ================================================= */}

//         <div className="titan-summary-item">


//           <div className="titan-summary-icon employee">
//             <UsersRound size={32} strokeWidth={1.7} />
//           </div>
//           <div className="titan-summary-content">
//             <span>Employee Entry</span>

//             <strong>
//               {bottomCards?.main ?? 0}
//             </strong>

//             {/* <small>People currently inside</small> */}
//           </div>
//         </div>

//         <div className="titan-summary-divider" />
//         {/* =================================================
//                     contract Employee entry
//               ================================================= */}

//         <div className="titan-summary-item">

//           {/* Contract Employee Entry */}
//           <div className="titan-summary-icon contract">
//             <UsersRound size={32} strokeWidth={1.7} />
//           </div>

//           <div className="titan-summary-content">
//             <span>Contract Employee Entry</span>

//             <strong>
//               {bottomCards?.contract ?? 0}
//             </strong>

//             {/* <small>People currently inside</small> */}
//           </div>
//         </div>
//         <div className="titan-summary-divider" />

//         {/* =================================================
//                     OVERALL OCCUPANCY
//               ================================================= */}

//         <div className="titan-summary-item titan-overall">
//           <div className="titan-summary-icon green">
//             <Gauge size={32} strokeWidth={1.7} />
//           </div>

//           <div className="titan-summary-content">
//             <span>Overall Occupancy</span>


//             <strong>{occupancy}%</strong>

//           </div>
//         </div>
//       </section>
//     </>
//   );
// });

// /* =========================================================
//    MAIN DASHBOARD
// ========================================================= */

// const TitanDashboard = () => {
//   /* =====================================================
//        DASHBOARD STATE
//   ===================================================== */

//   const [dashboardData, setDashboardData] = useState(null);

//   const [currentDateTime, setCurrentDateTime] = useState(new Date());

//   const [apiError, setApiError] = useState("");

//   /*
//    * Loader is only used during
//    * the initial API request.
//    */

//   const [isInitialLoading, setIsInitialLoading] = useState(true);

//   const API_URL = import.meta.env.VITE_API_URL;


//   // const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");

//   // const token = userData?.token || "";
//   // const UserName = userData?.user?.username || "";


//     const token = sessionStorage.getItem("token") || "";

//     const UserName = sessionStorage.getItem("username") || "";

//   /* =====================================================
//        API REQUEST
//   ===================================================== */

//   const getTitanDashData = async () => {
//     try {
//       const response = await axios.get(
//         `${API_URL}/dashboard/getTtianCustomDashboardData`,
//         {
//           params: {
//             username: UserName,
//           },

//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       console.log("Titan Dashboard API Response:", response.data);

//       return response.data;
//     } catch (error) {
//       console.error(
//         "Titan Dashboard API Error:",
//         error?.response?.data || error,
//       );

//       throw error;
//     }
//   };

//   /* =====================================================
//        FETCH DASHBOARD DATA
//   ===================================================== */

//   const fetchDashboardData = useCallback(async () => {
//     try {
//       const result = await getTitanDashData();

//       console.log("Titan Dashboard API Response:", result);

//       /* =============================================
//                API SUCCESS VALIDATION
//           ============================================= */

//       if (result?.success !== true) {
//         throw new Error(
//           result?.message || "API returned an unsuccessful response",
//         );
//       }

//       /* =============================================
//                UPDATE DATA
//           ============================================= */

//       setDashboardData(result);

//       setApiError("");
//     } catch (error) {
//       console.error("Titan Dashboard API error:", error);

//       setApiError(error?.message || "Unable to refresh dashboard data");
//     } finally {
//       setIsInitialLoading(false);
//     }
//   }, []);

//   /* =====================================================
//        INITIAL LOAD + 15 SECOND REFRESH
//   ===================================================== */

//   useEffect(() => {
//     fetchDashboardData();

//     const refreshTimer = setInterval(() => {
//       fetchDashboardData();
//     }, 10000);

//     return () => {
//       clearInterval(refreshTimer);
//     };
//   }, [fetchDashboardData]);

//   /* =====================================================
//        CLOCK
//   ===================================================== */

//   useEffect(() => {
//     const clockTimer = setInterval(() => {
//       setCurrentDateTime(new Date());
//     }, 1000);

//     return () => {
//       clearInterval(clockTimer);
//     };
//   }, []);

//   /* =====================================================
//        API DATA
//   ===================================================== */

//   const data = dashboardData?.data || {};

//   /* =====================================================
//        DATE
//   ===================================================== */

//   const formattedDate = new Intl.DateTimeFormat("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//     timeZone: "Asia/Kolkata",
//   }).format(currentDateTime);

//   /* =====================================================
//        TIME
//   ===================================================== */

//   const formattedTime = new Intl.DateTimeFormat("en-IN", {
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: true,
//     timeZone: "Asia/Kolkata",
//   }).format(currentDateTime);

//   /* =====================================================
//        RENDER
//   ===================================================== */

//   return (
//     <div className="titan-dashboard">
//       {/* =================================================
//             BACKGROUND
//       ================================================= */}

//       <div className="titan-background">
//         <img src={factoryImage5} alt="" className="titan-factory-watermark" />
//       </div>

//       {/* =================================================
//             INITIAL PAGE LOADER
//       ================================================= */}

//       {isInitialLoading && (
//         <div className="titan-initial-loader" role="status" aria-live="polite">
//           <div className="titan-loader-spinner" />

//           <span>Loading dashboard...</span>
//         </div>
//       )}

//       {/* =================================================
//             MAIN CONTENT
//       ================================================= */}

//       <main className="titan-dashboard-content">
//         {/* =================================================
//               HEADER
//         ================================================= */}

//         <header className="titan-header">
//           {/* =================================================
//                 LEFT HEADER
//           ================================================= */}

//           <div className="titan-header-left">
//             {/* =================================================
//                   BRAND LOGOS
//             ================================================= */}

//             <div className="titan-brand-logos">
//               {/* TANISHQ */}

//               <div className="titan-brand-item tanishq-brand">
//                 <img
//                   src={titanLogo2}
//                   alt="Tanishq"
//                   className="titan-logo-image tanishq-logo-image"
//                   loading="eager"
//                 />
//               </div>

//               {/* DIVIDER */}

//               <span className="titan-brand-divider" />

//               {/* TITAN COMPANY */}

//               <div className="titan-brand-item titan-company-brand">
//                 <img
//                   src={titanLogo}
//                   alt="Titan Company"
//                   className="titan-logo-image titan-company-logo-image"
//                   loading="eager"
//                 />
//               </div>
//             </div>

//             {/* =================================================
//                   TITLE
//             ================================================= */}

//             <div className="titan-title-block">
//               <h1>Factory Occupancy Overview</h1>
//             </div>
//           </div>

//           {/* =================================================
//                 RIGHT HEADER
//           ================================================= */}

//           <div className="titan-header-right">
//             {/* LIVE */}

//             <div className="titan-live">
//               <span className="titan-live-dot" />

//               <span>LIVE</span>
//             </div>

//             {/* DIVIDER */}

//             <span className="titan-header-line" />

//             {/* DATE */}

//             <div className="titan-header-meta">
//               <CalendarDays size={15} strokeWidth={1.8} />

//               <span>{formattedDate}</span>
//             </div>

//             {/* DIVIDER */}

//             <span className="titan-header-line" />

//             {/* TIME */}

//             <div className="titan-header-meta">
//               <Clock3 size={15} strokeWidth={1.8} />

//               <span>{formattedTime}</span>
//             </div>
//           </div>
//         </header>

//         {/* =================================================
//               OPTIONAL API ERROR
//         ================================================= */}

//         {/*
//         {apiError && (
//           <div
//             className="titan-api-status"
//             role="status"
//           >
//             {apiError}
//           </div>
//         )}
//         */}

//         {/* =================================================
//               DASHBOARD DATA
//         ================================================= */}

//         <TitanDashboardData data={data} />

//         {/* =================================================
//               FOOTER
//         ================================================= */}

//         <footer className="titan-dashboard-footer">
//           {/* LEFT */}

//           <div className="titan-dashboard-footer-note">
//             <span className="titan-dashboard-footer-note-icon">i</span>

//             <span className="titan-dashboard-footer-note-text">
//               Note : Counts are updated every 10 secs.
//             </span>
//           </div>

//           {/* RIGHT */}

//           <div className="titan-dashboard-footer-right">
//             <span className="titan-dashboard-footer-copyright">
//               Copyright © {new Date().getFullYear()} All Rights Reserved
//             </span>

//             <img
//               src={footerlogo}
//               alt="Delopt"
//               className="titan-dashboard-footer-logo"
//               loading="eager"
//             />
//           </div>
//         </footer>
//       </main>
//     </div>
//   );
// };

// export default TitanDashboard;

import React, { useEffect, useState, useCallback, memo } from "react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  Tooltip,
} from "recharts";

import {
  Building2,
  UsersRound,
  Gauge,
  CalendarDays,
  Clock3,
} from "lucide-react";

import "./TitanDashboard.css";

import titanLogo2 from "../../Components/Assets/Titan/titan-logo2.avif";
import titanLogo from "../../Components/Assets/Titan/titan-logo.png";
import factoryImage5 from "../../Components/Assets/Titan/factory-image5.png";
import footerlogo from "../../Components/Assets/footer-logo.svg";

import axios from "axios";

// import myVideo from "../../components/Assets/intro1.mp4"; 

/* =========================================================
   DISTRIBUTION COLORS
========================================================= */

const distributionColors = [
  "#6652D9",
  "#9A65D6",
  "#FFB23E",
  "#20BFAF",
  "#FF7959",
];

/* =========================================================
   DONUT DISPLAY FORMAT
   API returns whole-number occupancy values.
   Display the exact API number without decimal places.
   Example: 59 -> 59%
========================================================= */

const formatDonutValue = (value) => {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return String(Math.round(number));
};

/* =========================================================
   DONUT TOOLTIP
   IMPORTANT:
   Shows API value directly.
   No percentage calculation.
========================================================= */

// const DonutTooltip = ({ active, payload }) => {
//   if (!active || !payload?.length) {
//     return null;
//   }

//   const item = payload[0]?.payload || {};

//   const value = Number(item?.value ?? 0);

//   return (
//     <div className="titan-donut-tooltip">
//       <div className="titan-tooltip-title">{item?.zone || "Location"}</div>

//       <div className="titan-tooltip-row">
//         <span>Occupancy</span>

//         <strong>{value}</strong>
//       </div>
//     </div>
//   );
// };
const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload || {};

  const zone = item?.zone || item?.Zone || "Location";

  const value = Number(item?.value ?? 0);

  return (
    <div className="titan-donut-tooltip">
      <div className="titan-tooltip-title">{zone}</div>

      <div className="titan-tooltip-row">
        <span>Occupancy</span>

        <strong>{formatDonutValue(value)}%</strong>
      </div>
    </div>
  );
};
/* =========================================================
   LOCATION TOOLTIP
========================================================= */
const LocationTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0]?.payload || {};

  const zone = row?.zone || label || "Location";

  const isOthers = zone.toLowerCase() === "others";

  const gents = Number(row?.gents ?? 0);
  const ladies = Number(row?.ladies ?? 0);
  const others = Number(row?.others ?? 0);

  return (
    <div className="titan-chart-tooltip">

      <div className="titan-tooltip-title">
        {zone}
      </div>

      {isOthers ? (
        <>
          {/* ONLY OTHERS */}
          <div className="titan-tooltip-row">
            <span>
              <i
                className="titan-tooltip-dot"
                style={{ backgroundColor: "#F59E0B" }}
              />
              Others
            </span>

            <strong>{others}</strong>
          </div>

          <div className="titan-tooltip-total">
            Total
            <strong>{others}</strong>
          </div>
        </>
      ) : (
        <>
          {/* GENTS */}
          <div className="titan-tooltip-row">
            <span>
              <i className="titan-tooltip-dot titan-tooltip-gents" />
              Gents
            </span>

            <strong>{gents}</strong>
          </div>

          {/* LADIES */}
          <div className="titan-tooltip-row">
            <span>
              <i className="titan-tooltip-dot titan-tooltip-ladies" />
              Ladies
            </span>

            <strong>{ladies}</strong>
          </div>

          {/* TOTAL */}
          <div className="titan-tooltip-total">
            Total
            <strong>{gents + ladies}</strong>
          </div>
        </>
      )}

    </div>
  );
};
/* =========================================================
   NO DATA COMPONENT
========================================================= */

const LocationTotalLabel = ({ x, y, width, value }) => {
  const total = Number(value ?? 0);

  if (!Number.isFinite(total) || total <= 0) {
    return null;
  }

  return (
    <text
      x={x + width / 2}
      y={y - 8}
      textAnchor="middle"
      fill="#17234D"
      fontSize={13}
      fontWeight={700}
    >
      {total}
    </text>
  );
};

/* =========================================================
   NO DATA COMPONENT
========================================================= */

const NoDataAvailable = ({ message = "Data is not available." }) => {
  return (
    <div className="titan-no-data" role="status" aria-label="No data available">
      <div className="titan-no-data-icon">
        <Building2 size={30} strokeWidth={1.5} />
      </div>

      <strong>No Data Available</strong>

      <span>{message}</span>
    </div>
  );
};

/* =========================================================
   DASHBOARD CONTENT
========================================================= */

const TitanDashboardData = memo(function TitanDashboardData({ data }) {
  /* =====================================================
       SAFE DATA EXTRACTION
    ===================================================== */

  const topCards = data?.topcards || data?.topCards || {};

  const occupancyDistribution = data?.occupancyDistribution || {};

  const bottomCards = data?.bottomCards || {};

  /* =====================================================
       OCCUPANCY DISTRIBUTION DATA

       API example:

       {
         "Zone": "NB",
         "value": 13
       }

       We use "value" directly.
       No frontend calculation.
    ===================================================== */

  const rawDistributionData = Array.isArray(occupancyDistribution?.data)
    ? occupancyDistribution.data
    : [];

  const distributionData = rawDistributionData.map((item) => ({
    ...item,

    zone: item?.Zone ?? item?.zone ?? "",

    value: Number(item?.value ?? 0),
  }));

  /* =====================================================
       OCCUPANCY BY LOCATION

       Used by the Gents / Ladies bar chart.
    ===================================================== */

  const rawOccupancyByLocation = Array.isArray(data?.occupancyByLocation)
    ? data.occupancyByLocation
    : [];

const occupancyByLocation = rawOccupancyByLocation.map((item) => {
  const zone = item?.Zone ?? item?.zone ?? "";
  const isOthers = String(zone).toLowerCase() === "others";

  const gents = Number(item?.gents ?? 0);
  const ladies = Number(item?.ladies ?? 0);
  const others = Number(
    item?.Others ?? item?.others ?? item?.value ?? 0
  );

  return {
    ...item,

    zone,

    // Normal zones
    gents: isOthers ? 0 : gents,
    ladies: isOthers ? 0 : ladies,

    // Only Others zone
    others: isOthers ? others : 0,

    // Total
    total: isOthers
      ? others
      : Number(item?.value ?? gents + ladies),
  };
});  /* =====================================================
       TOTAL OCCUPANTS

       API value used directly.
    ===================================================== */

  const totalOccupants = Number(
    occupancyDistribution?.totalOccupants ?? bottomCards?.totalOccupants ?? 0,
  );

  const distributionChartData = distributionData.map((item) => ({
    ...item,

    value: Number(item?.value ?? 0),
  }));

  const occupancy = Number(bottomCards?.overallOccupancy ?? 0);
  const occupancyProgressWidth = Math.min(Math.max(occupancy, 0), 100);

  return (
    <>
      {/* =================================================
              KPI CARDS
        ================================================= */}

      <section className="titan-kpi-grid">
        {/* =================================================
                NEW BUILDING
          ================================================= */}

        <div className="titan-kpi-card titan-kpi-new">
          <div className="titan-kpi-icon">
            <Building2 size={25} strokeWidth={1.7} />
          </div>

          <div className="titan-kpi-info">
            <span className="titan-kpi-label">Studded Jewellery</span>

            <strong className="titan-kpi-value">
              {topCards.newBuilding ?? 0}
            </strong>

            <span className="titan-kpi-status">Current occupancy</span>
          </div>
        </div>

        {/* =================================================
                OLD BUILDING
          ================================================= */}

        <div className="titan-kpi-card titan-kpi-old">
          <div className="titan-kpi-icon">
            <Building2 size={25} strokeWidth={1.7} />
          </div>

          <div className="titan-kpi-info">
            <span className="titan-kpi-label">Gold Jewellery</span>

            <strong className="titan-kpi-value">
              {topCards.oldBuilding ?? 0}
            </strong>

            <span className="titan-kpi-status">Current occupancy</span>
          </div>
        </div>

        {/* =================================================
                CBC
          ================================================= */}

        <div className="titan-kpi-card titan-kpi-cbc">
          <div className="titan-kpi-icon">
            <Building2 size={25} strokeWidth={1.7} />
          </div>

          <div className="titan-kpi-info">
            <span className="titan-kpi-label">CBC</span>

            <strong className="titan-kpi-value">{topCards.cbc ?? 0}</strong>

            <span className="titan-kpi-status">Current occupancy</span>
          </div>
        </div>

        {/* =================================================
                WAREHOUSE
          ================================================= */}

        <div className="titan-kpi-card titan-kpi-warehouse">
          <div className="titan-kpi-icon">
            <Building2 size={25} strokeWidth={1.7} />
          </div>

          <div className="titan-kpi-info">
            <span className="titan-kpi-label">Warehouse</span>

            <strong className="titan-kpi-value">
              {topCards.warehouse ?? 0}
            </strong>

            <span className="titan-kpi-status">Current occupancy</span>
          </div>
        </div>
 {/* =================================================
                OTHERS
          ================================================= */}

<div className="titan-kpi-card titan-kpi-others">
  <div className="titan-kpi-icon">
    <Building2 size={25} strokeWidth={1.7} />
  </div>

  <div className="titan-kpi-info">
    <span className="titan-kpi-label">Others</span>

    <strong className="titan-kpi-value">
      {topCards.others ?? 0}
    </strong>

    <span className="titan-kpi-status">Current occupancy</span>
  </div>
</div>
      </section>

      {/* =================================================
              MAIN ANALYTICS GRID
        ================================================= */}

      <section className="titan-main-grid">
        {/* =================================================
                LEFT COLUMN
          ================================================= */}

        <div className="titan-left-column">
          {/* =================================================
                  OCCUPANCY DISTRIBUTION
            ================================================= */}

          <div className="titan-chart-card titan-distribution-card">
            <div className="titan-chart-heading">
              <div>
                <h2>Occupancy Distribution</h2>

                <p>Current occupancy distribution by location</p>
              </div>
            </div>

            <div className="titan-distribution-body">
              {distributionData.length > 0 ? (
                <>
                  {/* =================================================
                          DONUT CHART
                    ================================================= */}

                  <div className="titan-donut-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          content={<DonutTooltip />}
                          cursor={false}
                          allowEscapeViewBox={{
                            x: true,
                            y: true,
                          }}
                          wrapperStyle={{
                            zIndex: 9999,
                            pointerEvents: "none",
                          }}
                        />

                        <Pie
                          data={distributionChartData}
                          dataKey="value"
                          nameKey="zone"
                          cx="50%"
                          cy="50%"
                          innerRadius="42%"
                          outerRadius="78%"
                          paddingAngle={2}
                          stroke="#ffffff"
                          strokeWidth={3}
                          labelLine={({ points }) => {
                            if (!points || points.length < 2) {
                              return null;
                            }

                            return (
                              <polyline
                                points={points
                                  .map((point) => `${point.x},${point.y}`)
                                  .join(" ")}
                                fill="none"
                                stroke="#AAB6C8"
                                strokeWidth={1.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            );
                          }}
                          isAnimationActive={false}
                          label={({ cx, cy, midAngle, outerRadius, index }) => {
                            const item = distributionChartData[index];
                            const value = Number(item?.value ?? 0);

                            const RADIAN = Math.PI / 180;

                            // Put the percentage outside the donut.
                            // The extra distance keeps the text away from the arc.
                            const labelRadius = outerRadius + 24;

                            const x =
                              cx + labelRadius * Math.cos(-midAngle * RADIAN);

                            const y =
                              cy + labelRadius * Math.sin(-midAngle * RADIAN);

                            const textAnchor = x >= cx ? "start" : "end";

                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#17234D"
                                textAnchor={textAnchor}
                                dominantBaseline="central"
                                fontSize={13}
                                fontWeight={700}
                                className="titan-donut-outside-label"
                              >
                                {formatDonutValue(value)}%
                              </text>
                            );
                          }}
                        >
                          {distributionChartData.map((item, index) => (
                            <Cell
                              key={`distribution-${index}`}
                              fill={
                                distributionColors[
                                  index % distributionColors.length
                                ]
                              }
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* CENTER VALUE */}

                    <div className="titan-donut-center">
                      <strong>{totalOccupants}</strong>

                      <span>Total Occupancy</span>
                    </div>
                  </div>

                  {/* =================================================
                          DONUT LEGEND

                          IMPORTANT:
                          Shows API value directly.
                    ================================================= */}

                  <div className="titan-distribution-legend">
                    {distributionData.map((item, index) => {
                      const value = Number(item?.value ?? 0);

                      return (
                        <div
                          className="titan-distribution-item"
                          key={`${item?.zone}-${index}`}
                        >
                          <span
                            className="titan-distribution-dot"
                            style={{
                              backgroundColor:
                                distributionColors[
                                  index % distributionColors.length
                                ],
                              opacity: value === 0 ? 0.65 : 1,
                            }}
                          />

                          <span className="titan-distribution-zone">
                            {item?.zone}
                          </span>

                          <span className="titan-distribution-percent">
                            ({formatDonutValue(value)}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <NoDataAvailable message="Occupancy distribution data is not available." />
              )}
            </div>
          </div>

          {/* =================================================
                  BOTTOM SUMMARY
            ================================================= */}

         
        </div>

        {/* =================================================
                RIGHT COLUMN
          ================================================= */}

        <div className="titan-right-column">
          {/* =================================================
                  OCCUPANCY BY LOCATION
            ================================================= */}

          <div className="titan-chart-card titan-location-card">
            <div className="titan-chart-heading">
              <div>
                <h2>
                  Occupancy by Zones <span>(Gents / Ladies / Others)</span>
                </h2>

                <p>Occupancy count across all locations</p>
              </div>
            </div>

            {occupancyByLocation.length > 0 ? (
              <>
                {/* =================================================
                        BAR CHART
                  ================================================= */}

                <div className="titan-location-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={occupancyByLocation}
                      margin={{
                        top: 28,
                        right: 10,
                        left: 10,
                        bottom: 10,
                      }}
                      barCategoryGap="30%"
                    >
                      <Tooltip
                        content={<LocationTooltip />}
                        cursor={false}
                        wrapperStyle={{
                          outline: "none",
                        }}
                      />

                      <CartesianGrid
                        stroke="#D9E1EC"
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="zone"
                        axisLine={{
                          stroke: "#D9E1EC",
                          strokeWidth: 1,
                          strokeDasharray: "3 3",
                        }}
                        tickLine={false}
                        tick={{
                          fill: "#17234D",
                          fontSize: 13,
                          fontWeight: 650,
                        }}
                        label={{
                          value: "Zones",
                          position: "bottom",
                          offset: 0,
                          fill: "#63739B",
                          fontSize: 13,
                        }}
                      />

<YAxis
  domain={[0, "dataMax + 50"]}
  tickCount={6}
  axisLine={false}
  tickLine={false}
  tick={{
    fill: "#63739B",
    fontSize: 11,
  }}
  label={{
    value: "Occupancy",
    angle: -90,
    position: "insideLeft",
    fill: "#63739B",
    fontSize: 13,
  }}
/>

                    {/* =================================================
        GENTS
  ================================================= */}

<Bar
  dataKey="gents"
  stackId="occupancy"
  fill="#6652D9"
>
  <LabelList
    dataKey="gents"
    position="center"
    fill="#ffffff"
    fontSize={12}
    fontWeight={600}
  />
</Bar>


{/* =================================================
        LADIES
  ================================================= */}

<Bar
  dataKey="ladies"
  stackId="occupancy"
  fill="#2CC398"
  radius={[4, 4, 0, 0]}
>
  <LabelList
    dataKey="ladies"
    position="center"
    fill="#ffffff"
    fontSize={12}
    fontWeight={600}
  />

  {/* Total centered on the actual Ladies bar */}
  <LabelList
    dataKey="total"
    content={<LocationTotalLabel />}
  />
</Bar>


{/* =================================================
        OTHERS
  ================================================= */}

<Bar
  dataKey="others"
  stackId="occupancy"
  fill="#F59E0B"
  radius={[4, 4, 0, 0]}
>
  <LabelList
    dataKey="others"
    position="center"
    fill="#ffffff"
    fontSize={12}
    fontWeight={600}
  />

  {/* Total centered on the actual Others bar */}
  <LabelList
    dataKey="total"
    content={<LocationTotalLabel />}
  />
</Bar>

                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* =================================================
                        BAR LEGEND
                  ================================================= */}

         <div className="titan-location-legend">

  <div>
    <span className="titan-gents-dot" />
    <span>Gents</span>
  </div>

  <div>
    <span className="titan-ladies-dot" />
    <span>Ladies</span>
  </div>

  <div>
    <span
      className="titan-others-dot"
      style={{
        width: "10px",
        height: "10px",
        minWidth: "10px",
        borderRadius: "50%",
        display: "inline-block",
        backgroundColor: "#F59E0B",
      }}
    />
    <span>Others</span>
  </div>

</div>
              </>
            ) : (
              <NoDataAvailable message="Zone occupancy data is not available." />
            )}
          </div>
        </div>
      </section>
      <section className="titan-summary">
        {/* =================================================
                    TOTAL OCCUPANCY
              ================================================= */}

        <div className="titan-summary-item">
          <div className="titan-summary-icon orange">
            <UsersRound size={32} strokeWidth={1.7} />
          </div>

          <div className="titan-summary-content">
            <span>Total Occupancy</span>

            <strong>
              {bottomCards?.totalOccupants ?? totalOccupants ?? 0}
            </strong>

            <small>People currently inside</small>
          </div>
        </div>

        <div className="titan-summary-divider" />

      
        {/* =================================================
                    Employee Entry
              ================================================= */}

        <div className="titan-summary-item">
      

<div className="titan-summary-icon employee">
    <UsersRound size={32} strokeWidth={1.7} />
</div>
          <div className="titan-summary-content">
            <span>Employee Entry</span>

            <strong>
              {bottomCards?.main ?? 0}
            </strong>

            {/* <small>People currently inside</small> */}
          </div>
        </div>

        <div className="titan-summary-divider" />
        {/* =================================================
                    contract Employee entry
              ================================================= */}

        <div className="titan-summary-item">
         
{/* Contract Employee Entry */}
<div className="titan-summary-icon contract">
    <UsersRound size={32} strokeWidth={1.7} />
</div>

          <div className="titan-summary-content">
            <span>Contract Employee Entry</span>

            <strong>
              {bottomCards?.contract ?? 0}
            </strong>

            {/* <small>People currently inside</small> */}
          </div>
        </div>
        <div className="titan-summary-divider" />

  {/* =================================================
                    OVERALL OCCUPANCY
              ================================================= */}

        <div className="titan-summary-item titan-overall">
          <div className="titan-summary-icon green">
            <Gauge size={32} strokeWidth={1.7} />
          </div>

          <div className="titan-summary-content">
            <span>Overall Occupancy</span>


            <strong>{occupancy}%</strong>

          </div>
      {/* <div className="small-video-wrapper" style={{ maxWidth: '100px', margin: '1px 0' }}>
        <video width="100%" height="auto" autoPlay muted loop playsInline controls style={{ borderRadius: '8px' }}>

          <source src={myVideo.default || myVideo} type="video/mp4" />

          Your browser does not support the video tag.
        </video>
      </div> */}
        </div>

      </section>
    </>

  );
});

/* =========================================================
   MAIN DASHBOARD
========================================================= */

const TitanDashboard = () => {
  /* =====================================================
       DASHBOARD STATE
  ===================================================== */

  const [dashboardData, setDashboardData] = useState(null);

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [apiError, setApiError] = useState("");

  /*
   * Loader is only used during
   * the initial API request.
   */

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

 
const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
 
const token = userData?.token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc5MDc0Njg2MiwiZXhwIjoxODIyMjgyODYyfQ.JyZHrk8KjN35Z9zCGZuSHrca00orO-_NQfgUZzpFqTg";
const UserName = userData?.user?.username || "Titan-Admin";
  

  /* =====================================================
       API REQUEST
  ===================================================== */

  const getTitanDashData = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/dashboard/getTtianCustomDashboardData`,
        {
          params: {
            username: UserName,
          },

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Titan Dashboard API Response:", response.data);

      return response.data;
    } catch (error) {
      console.error(
        "Titan Dashboard API Error:",
        error?.response?.data || error,
      );

      throw error;
    }
  };

  /* =====================================================
       FETCH DASHBOARD DATA
  ===================================================== */

  const fetchDashboardData = useCallback(async () => {
    try {
      const result = await getTitanDashData();

      console.log("Titan Dashboard API Response:", result);

      /* =============================================
               API SUCCESS VALIDATION
          ============================================= */

      if (result?.success !== true) {
        throw new Error(
          result?.message || "API returned an unsuccessful response",
        );
      }

      /* =============================================
               UPDATE DATA
          ============================================= */

      setDashboardData(result);

      setApiError("");
    } catch (error) {
      console.error("Titan Dashboard API error:", error);

      setApiError(error?.message || "Unable to refresh dashboard data");
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  /* =====================================================
       INITIAL LOAD + 15 SECOND REFRESH
  ===================================================== */

  useEffect(() => {
    fetchDashboardData();

    const refreshTimer = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    return () => {
      clearInterval(refreshTimer);
    };
  }, [fetchDashboardData]);

  /* =====================================================
       CLOCK
  ===================================================== */

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => {
      clearInterval(clockTimer);
    };
  }, []);

  /* =====================================================
       API DATA
  ===================================================== */

  const data = dashboardData?.data || {};

  /* =====================================================
       DATE
  ===================================================== */

  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(currentDateTime);

  /* =====================================================
       TIME
  ===================================================== */

  const formattedTime = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(currentDateTime);

  /* =====================================================
       RENDER
  ===================================================== */

  return (
    <div className="titan-dashboard">
      {/* =================================================
            BACKGROUND
      ================================================= */}

      <div className="titan-background">
        <img src={factoryImage5} alt="" className="titan-factory-watermark" />
      </div>

      {/* =================================================
            INITIAL PAGE LOADER
      ================================================= */}

      {isInitialLoading && (
        <div className="titan-initial-loader" role="status" aria-live="polite">
          <div className="titan-loader-spinner" />

          <span>Loading dashboard...</span>
        </div>
      )}

      {/* =================================================
            MAIN CONTENT
      ================================================= */}

      <main className="titan-dashboard-content">
        {/* =================================================
              HEADER
        ================================================= */}

        <header className="titan-header">
          {/* =================================================
                LEFT HEADER
          ================================================= */}

          <div className="titan-header-left">
            {/* =================================================
                  BRAND LOGOS
            ================================================= */}

            <div className="titan-brand-logos">
              {/* TANISHQ */}

              <div className="titan-brand-item tanishq-brand">
                <img
                  src={titanLogo2}
                  alt="Tanishq"
                  className="titan-logo-image tanishq-logo-image"
                  loading="eager"
                />
              </div>

              {/* DIVIDER */}

              <span className="titan-brand-divider" />

              {/* TITAN COMPANY */}

              <div className="titan-brand-item titan-company-brand">
                <img
                  src={titanLogo}
                  alt="Titan Company"
                  className="titan-logo-image titan-company-logo-image"
                  loading="eager"
                />
              </div>
            </div>

            {/* =================================================
                  TITLE
            ================================================= */}

            <div className="titan-title-block">
              <h1>Factory Occupancy Overview</h1>
            </div>
          </div>

          {/* =================================================
                RIGHT HEADER
          ================================================= */}

          <div className="titan-header-right">
            {/* LIVE */}

            <div className="titan-live">
              <span className="titan-live-dot" />

              <span>LIVE</span>
            </div>

            {/* DIVIDER */}

            <span className="titan-header-line" />

            {/* DATE */}

            <div className="titan-header-meta">
              <CalendarDays size={15} strokeWidth={1.8} />

              <span>{formattedDate}</span>
            </div>

            {/* DIVIDER */}

            <span className="titan-header-line" />

            {/* TIME */}

            <div className="titan-header-meta">
              <Clock3 size={15} strokeWidth={1.8} />

              <span>{formattedTime}</span>
            </div>
          </div>
        </header>

        {/* =================================================
              OPTIONAL API ERROR
        ================================================= */}

        {/*
        {apiError && (
          <div
            className="titan-api-status"
            role="status"
          >
            {apiError}
          </div>
        )}
        */}

        {/* =================================================
              DASHBOARD DATA
        ================================================= */}

        <TitanDashboardData data={data} />

        {/* =================================================
              FOOTER
        ================================================= */}

        <footer className="titan-dashboard-footer">
          {/* LEFT */}

          <div className="titan-dashboard-footer-note">
            <span className="titan-dashboard-footer-note-icon">i</span>

            <span className="titan-dashboard-footer-note-text">
              Note : Counts are updated every 10 secs.
            </span>
          </div>

          {/* RIGHT */}

          <div className="titan-dashboard-footer-right">
            <span className="titan-dashboard-footer-copyright">
              Copyright © {new Date().getFullYear()} All Rights Reserved
            </span>

            <img
              src={footerlogo}
              alt="Delopt"
              className="titan-dashboard-footer-logo"
              loading="eager"
            />
          </div>
        </footer>		

      </main>
    </div>
  );
};

export default TitanDashboard;