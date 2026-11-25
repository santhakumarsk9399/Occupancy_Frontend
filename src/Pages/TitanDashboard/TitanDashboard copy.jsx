// import React from "react";
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
// } from "recharts";

// import { titanDashboardData } from "./titanDashboardData";
// import "./TitanDashboard.css";
// import { Building2, Warehouse, UserRound, UsersRound } from "lucide-react";
// // ======================================================
// // ASSET IMPORTS
// // Change these paths if your assets are stored elsewhere
// // ======================================================

// import titanLogo from "../../Components/Assets/Titan/titan-logo.png";
// import titanLogo2 from "../../Components/Assets/Titan/titan-logo2.avif";
// import factoryImage from "../../Components/Assets/Titan/factory-image.jpeg";
// import Footer from "../CommonComponents/Footer";
// import footerlogo from "../../Components/Assets/footer-logo.svg";

// // ======================================================
// // DONUT COLORS
// // ======================================================

// const distributionColors = [
//   "#6652D9", // NB
//   "#9A65D6", // OB
//   "#FFB23E", // Others
//   "#20BFAF", // WH
//   "#FF7959", // CBC
// ];

// const TitanDashboard = () => {
//   // ====================================================
//   // MOCK API RESPONSE
//   // Later this will come from your API
//   // ====================================================

//   const response = titanDashboardData;

//   const data = response?.data || {};

//   const topCards = data?.topCards || {};

//   const occupancyDistribution = data?.occupancyDistribution || {};

//   const distributionData = occupancyDistribution?.data || [];

//   const occupancyByLocation = data?.occupancyByLocation || [];

//   const bottomCards = data?.bottomCards || {};

//   // ====================================================
//   // TOTAL OCCUPANTS
//   // ====================================================

//   const totalOccupants = occupancyDistribution?.totalOccupants || 0;

//   // ====================================================
//   // CALCULATE DONUT PERCENTAGE
//   // ====================================================

//   const getPercentage = (value) => {
//     if (!totalOccupants) {
//       return 0;
//     }

//     return Math.round((Number(value) / Number(totalOccupants)) * 100);
//   };

//   // Recharts needs an actual percentage field for LabelList.
//   // Keep an API/mock percentage when one is already supplied.
//   const distributionChartData = distributionData.map((item) => ({
//     ...item,
//     percentage:
//       item?.percentage !== undefined && item?.percentage !== null
//         ? String(item.percentage).includes("%")
//           ? String(item.percentage)
//           : `${item.percentage}%`
//         : `${getPercentage(item?.value)}%`,
//   }));

//   // ====================================================
//   // RENDER
//   // ====================================================

//   return (
//     <div className="titan-dashboard">
//       {/* ==================================================
//           BACKGROUND WATERMARK
//       ================================================== */}

//       <div className="titan-background">
//         {/* Factory background image */}

//         {/* <img
//                     src={factoryImage}
//                     alt=""
//                     className="titan-factory-watermark"
//                 /> */}

//         {/* Titan logo watermark */}

//               <img src={titanLogo} alt="" className="titan-factory-watermark" />
//       </div>

//       {/* ==================================================
//           MAIN DASHBOARD CONTENT
//       ================================================== */}

//       <div className="titan-dashboard-content">
//         {/* =================================================
//             HEADER
//         ================================================= */}

//         <header className="titan-header">
//           {/* -----------------------------------------------
//               LEFT HEADER
//           ------------------------------------------------ */}

//           <div className="titan-header-left">
//             {/* Titan logo */}

//             <img src={titanLogo2} alt="Titan" className="titan-header-logo" />

//             {/* Title */}

//             <div>
//               <h1>Factory Occupancy Overview</h1>

//               <p>Live occupancy status across all locations</p>
//             </div>
//           </div>

//           {/* -----------------------------------------------
//               RIGHT HEADER
//           ------------------------------------------------ */}

//           <div className="titan-header-right">


//                         <div className="titan-live">

//                             <span className="titan-live-dot"></span>

//                             <span>
//                                 LIVE
//                             </span>

//                         </div>


//                         <span className="titan-header-line">
//                             |
//                         </span>


//                         <span>
//                             01 Sep 2026
//                         </span>


//                         <span className="titan-header-line">
//                             |
//                         </span>


//                         <span>
//                             10:30 AM
//                         </span>

//                     </div>
//         </header>

//         {/* =================================================
//             TOP KPI CARDS
//         ================================================= */}

//         <section className="titan-kpi-grid">
//           {/* ===============================================
//               NEW BUILDING
//           =============================================== */}

//           <div className="titan-kpi-card titan-kpi-new">
//             <div className="titan-kpi-icon">
//               <Building2 size={25} strokeWidth={1.7} />
//             </div>

//             <div className="titan-kpi-info">
//               <span className="titan-kpi-label">New Building</span>

//               <strong className="titan-kpi-value">
//                 {topCards.newBuilding ?? 0}
//               </strong>
//             </div>
//           </div>

//           {/* ===============================================
//               OLD BUILDING
//           =============================================== */}

//           <div className="titan-kpi-card titan-kpi-old">
//             <div className="titan-kpi-icon">
//               <Building2 size={25} strokeWidth={1.7} />
//             </div>
//             <div className="titan-kpi-info">
//               <span className="titan-kpi-label">Old Building</span>

//               <strong className="titan-kpi-value">
//                 {topCards.oldBuilding ?? 0}
//               </strong>
//             </div>
//           </div>

//           {/* ===============================================
//               CBC
//           =============================================== */}

//           <div className="titan-kpi-card titan-kpi-cbc">
//             <div className="titan-kpi-icon">
//               <Building2 size={25} strokeWidth={1.7} />
//             </div>

//             <div className="titan-kpi-info">
//               <span className="titan-kpi-label">CBC</span>

//               <strong className="titan-kpi-value">{topCards.cbc ?? 0}</strong>
//             </div>
//           </div>

//           {/* ===============================================
//               WAREHOUSE
//           =============================================== */}

//           <div className="titan-kpi-card titan-kpi-warehouse">
//             <div className="titan-kpi-icon">
//                           <Building2 size={25} strokeWidth={1.7} />
//             </div>

//             <div className="titan-kpi-info">
//               <span className="titan-kpi-label">Warehouse</span>

//               <strong className="titan-kpi-value">
//                 {topCards.warehouse ?? 0}
//               </strong>
//             </div>
//           </div>
//         </section>

//         {/* =================================================
//             CHART SECTION
//         ================================================= */}

//         <section className="titan-chart-grid">
         

//           <div className="titan-chart-card">
//             <h2>Occupancy Distribution</h2>

//             <div className="titan-distribution-body">
             
//               <div className="titan-donut-wrapper">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie
//                       data={distributionChartData}
//                       dataKey="value"
//                       nameKey="zone"
//                       cx="50%"
//                       cy="50%"
//                       innerRadius="40%"
//                       outerRadius="80%"
//                       paddingAngle={0}
//                       stroke="#ffffff"
//                       strokeWidth={4}
//                       labelLine={false}
//                       label={({
//                         cx,
//                         cy,
//                         midAngle,
//                         innerRadius,
//                         outerRadius,
//                         index,
//                       }) => {
//                         const RADIAN = Math.PI / 180;

//                         const radius =
//                           innerRadius + (outerRadius - innerRadius) * 0.5;

//                         const x = cx + radius * Math.cos(-midAngle * RADIAN);

//                         const y = cy + radius * Math.sin(-midAngle * RADIAN);

//                         const item = distributionChartData[index];

//                         return (
//                           <text
//                             x={x}
//                             y={y}
//                             fill="#ffffff"
//                             textAnchor="middle"
//                             dominantBaseline="central"
//                             fontSize={17}
//                             fontWeight={700}
//                           >
//                             {item?.percentage}
//                           </text>
//                         );
//                       }}
//                     >
//                       {distributionChartData.map((item, index) => (
//                         <Cell
//                           key={`cell-${index}`}
//                           fill={
//                             distributionColors[
//                               index % distributionColors.length
//                             ]
//                           }
//                         />
//                       ))}
//                     </Pie>
//                   </PieChart>
//                 </ResponsiveContainer>


//                 <div className="titan-donut-center">
//                   <strong>{totalOccupants}</strong>

//                   <span>Total Occupants</span>
//                 </div>
//               </div>


//               <div className="titan-distribution-legend">
//                 {distributionData.map((item, index) => {
//                   const percentage = getPercentage(item.value);

//                   return (
//                     <div
//                       className="titan-distribution-item"
//                       key={`${item.zone}-legend`}
//                     >
//                       <span
//                         className="titan-distribution-dot"
//                         style={{
//                           backgroundColor:
//                             distributionColors[
//                               index % distributionColors.length
//                             ],
//                         }}
//                       />

//                       <span className="titan-distribution-zone">
//                         {item.zone}
//                       </span>

//                       <span className="titan-distribution-percent">
//                         ({percentage}%)
//                       </span>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

         
//           <div className="titan-chart-card">
//             <h2>
//               Occupancy by Location
//               <span> (Gents / Ladies)</span>
//             </h2>


//             <div className="titan-location-chart">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart
//                   data={occupancyByLocation}
//                   margin={{
//                     top: 30,
//                     right: 10,
//                     left: 10,
//                     bottom: 10,
//                   }}
//                   barCategoryGap="28%"
//                 >
           

//                   <CartesianGrid
//                     vertical={false}
//                     stroke="#e5ebf3"
//                     strokeDasharray="0"
//                   />

//                   <XAxis
//                     dataKey="zone"
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{
//                       fill: "#17234D",
//                       fontSize: 13,
//                       fontWeight: 600,
//                     }}
//                   />

               

//                   <YAxis
//                     domain={[0, 250]}
//                     ticks={[0, 50, 100, 150, 200, 250]}
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{
//                       fill: "#63739B",
//                       fontSize: 11,
//                     }}
//                     label={{
//                       value: "Occupants",
//                       angle: -90,
//                       position: "insideLeft",
//                       fill: "#63739B",
//                       fontSize: 11,
//                     }}
//                   />


//                   <Bar dataKey="gents" stackId="occupancy" fill="#6652D9">
//                     <LabelList
//                       dataKey="gents"
//                       position="center"
//                       fill="#ffffff"
//                       fontSize={12}
//                       fontWeight={500}
//                     />
//                   </Bar>


//                   <Bar
//                     dataKey="ladies"
//                     stackId="occupancy"
//                     fill="#2CC398"
//                     radius={[3, 3, 0, 0]}
//                   >
         

//                     <LabelList
//                       dataKey="ladies"
//                       position="center"
//                       fill="#ffffff"
//                       fontSize={12}
//                       fontWeight={500}
//                     />


//                     <LabelList
//                       dataKey="total"
//                       position="top"
//                       fill="#17234D"
//                       fontSize={13}
//                       fontWeight={700}
//                     />
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>


//             <div className="titan-location-legend">
//               <div>
//                 <span className="titan-gents-dot"></span>

//                 <span>Gents</span>
//               </div>

//               <div>
//                 <span className="titan-ladies-dot"></span>

//                 <span>Ladies</span>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* =================================================
//             BOTTOM SUMMARY
//         ================================================= */}

//         <section className="titan-summary">

//           <div className="titan-summary-item">
//             <div className="titan-summary-icon purple">
//               <UserRound size={48} strokeWidth={1.5} />
//             </div>
//             <div>
//               <span>Gents</span>

//               <strong>{bottomCards.gents ?? 0}</strong>
//             </div>
//           </div>

//           <div className="titan-summary-divider"></div>

//           <div className="titan-summary-item">
//             <div className="titan-summary-icon green">
//               <UserRound size={48} strokeWidth={1.5} />
//             </div>

//             <div>
//               <span>Ladies</span>

//               <strong>{bottomCards.ladies ?? 0}</strong>
//             </div>
//           </div>


//           <div className="titan-summary-divider"></div>


//           <div className="titan-summary-item">
        
//             <div className="titan-summary-icon orange">
//               <UsersRound size={48} strokeWidth={1.5} />
//             </div>

//             <div>
//               <span>Total Occupants</span>

//               <strong>{bottomCards.totalOccupants ?? 0}</strong>
//             </div>
//           </div>

       

//           <div className="titan-summary-divider"></div>

//           <div className="titan-summary-item titan-overall">
//             <div>
//               <span>Overall Occupancy</span>

//               <strong>{bottomCards.overallOccupancy ?? 0}%</strong>
//             </div>


//             <div className="titan-progress-ring">
//               <svg width="55" height="55" viewBox="0 0 55 55">
             

//                 <circle cx="27.5" cy="27.5" r="21" className="titan-ring-bg" />


//                 <circle
//                   cx="27.5"
//                   cy="27.5"
//                   r="21"
//                   className="titan-ring-progress"
//                   strokeDasharray="131.95"
//                   strokeDashoffset={
//                     131.95 -
//                     (131.95 * (bottomCards.overallOccupancy || 0)) / 100
//                   }
//                 />
//               </svg>
//             </div>
//           </div>
//         </section>

//         {/* =================================================
//             FOOTER
//         ================================================= */}


//         <footer className="titan-footer">
//           <div className="titan-footer-left">
//             {/* <div className="footer-copy">
//               Copyright © {new Date().getFullYear()} All Rights Reserved
//               <img
//                 src={footerlogo}
//                 alt="footerlogo"
//                 className="footer_logo"
//                 width={130}
//                 height={35}
//               />
//             </div> */}
//           </div>

//           <div className="titan-footer-right">
//             <div className="footer-copy">
//               Copyright © {new Date().getFullYear()} All Rights Reserved
//               <img
//                 src={footerlogo}
//                 alt="footerlogo"
//                 className="footer_logo"
//                 width={130}
//                 height={35}
//               />
//             </div>
//           </div>
//         </footer>
//       </div>
//     </div>
//   );
// };

// export default TitanDashboard;
// import React from "react";
// import {
//     PieChart,
//     Pie,
//     Cell,
//     ResponsiveContainer,
//     BarChart,
//     Bar,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     LabelList,
// } from "recharts";

// import { titanDashboardData } from "./titanDashboardData";
// import "./TitanDashboard.css";
// import { Building2, Warehouse, UserRound, UsersRound } from "lucide-react";
// // ======================================================
// // ASSET IMPORTS
// // Change these paths if your assets are stored elsewhere
// // ======================================================

// import titanLogo2 from "../../Components/Assets/Titan/titan-logo2.avif";
// import factoryImage from "../../Components/Assets/Titan/factory-image.jpeg";
// import titanLogo from "../../Components/Assets/Titan/titan-logo.png"
// import Footer from "../CommonComponents/Footer";
// import footerlogo from "../../Components/Assets/footer-logo.svg";

// // ======================================================
// // DONUT COLORS
// // ======================================================

// const distributionColors = [
//     "#6652D9", // NB
//     "#9A65D6", // OB
//     "#FFB23E", // Others
//     "#20BFAF", // WH
//     "#FF7959", // CBC
// ];

// const TitanDashboard = () => {
//     // ====================================================
//     // MOCK API RESPONSE
//     // Later this will come from your API
//     // ====================================================

//     const response = titanDashboardData;

//     const data = response?.data || {};

//     const topCards = data?.topCards || {};

//     const occupancyDistribution = data?.occupancyDistribution || {};

//     const distributionData = occupancyDistribution?.data || [];

//     const occupancyByLocation = data?.occupancyByLocation || [];

//     const bottomCards = data?.bottomCards || {};

//     // ====================================================
//     // TOTAL OCCUPANTS
//     // ====================================================

//     const totalOccupants = occupancyDistribution?.totalOccupants || 0;

//     // ====================================================
//     // CALCULATE DONUT PERCENTAGE
//     // ====================================================

//     const getPercentage = (value) => {
//         if (!totalOccupants) {
//             return 0;
//         }

//         return Math.round((Number(value) / Number(totalOccupants)) * 100);
//     };

//     // Recharts needs an actual percentage field for LabelList.
//     // Keep an API/mock percentage when one is already supplied.
//     const distributionChartData = distributionData.map((item) => ({
//         ...item,
//         percentage:
//             item?.percentage !== undefined && item?.percentage !== null
//                 ? String(item.percentage).includes("%")
//                     ? String(item.percentage)
//                     : `${item.percentage}%`
//                 : `${getPercentage(item?.value)}%`,
//     }));

//     // ====================================================
//     // RENDER
//     // ====================================================

//     return (
//         <div className="titan-dashboard">
//             {/* ==================================================
//           BACKGROUND WATERMARK
//       ================================================== */}

//             <div className="titan-background">
//                 <img
//                     src={factoryImage}
//                     alt=""
//                     className="titan-factory-watermark"
//                 />
//             </div>

//             {/* ==================================================
//           MAIN DASHBOARD CONTENT
//       ================================================== */}

//             <div className="titan-dashboard-content">
//                 {/* =================================================
//             HEADER
//         ================================================= */}

//                 <header className="titan-header">
//                     {/* -----------------------------------------------
//               LEFT HEADER
//           ------------------------------------------------ */}

//                     <div className="titan-header-left">
//                         {/* Titan logo */}

//                         <img src={titanLogo2} alt="Titan" className="titan-header-logo" />

//                         {/* Title */}

//                         <div>
//                             <h1>Factory Occupancy Overview</h1>

//                             <p>Live occupancy status across all locations</p>
//                         </div>
//                     </div>

//                     {/* -----------------------------------------------
//               RIGHT HEADER
//           ------------------------------------------------ */}

//                     <div className="titan-header-right">


//                         <div className="titan-live">

//                             <span className="titan-live-dot"></span>

//                             <span>
//                                 LIVE
//                             </span>

//                         </div>


//                         <span className="titan-header-line">
//                             |
//                         </span>


//                         <span>
//                             01 Sep 2026
//                         </span>


//                         <span className="titan-header-line">
//                             |
//                         </span>


//                         <span>
//                             10:30 AM
//                         </span>

//                     </div>
//                 </header>

//                 {/* =================================================
//             TOP KPI CARDS
//         ================================================= */}

//                 <section className="titan-kpi-grid">
//                     {/* ===============================================
//               NEW BUILDING
//           =============================================== */}

//                     <div className="titan-kpi-card titan-kpi-new">
//                         <div className="titan-kpi-icon">
//                             <Building2 size={25} strokeWidth={1.7} />
//                         </div>

//                         <div className="titan-kpi-info">
//                             <span className="titan-kpi-label">New Building</span>

//                             <strong className="titan-kpi-value">
//                                 {topCards.newBuilding ?? 0}
//                             </strong>
//                         </div>
//                     </div>

//                     {/* ===============================================
//               OLD BUILDING
//           =============================================== */}

//                     <div className="titan-kpi-card titan-kpi-old">
//                         <div className="titan-kpi-icon">
//                             <Building2 size={25} strokeWidth={1.7} />
//                         </div>
//                         <div className="titan-kpi-info">
//                             <span className="titan-kpi-label">Old Building</span>

//                             <strong className="titan-kpi-value">
//                                 {topCards.oldBuilding ?? 0}
//                             </strong>
//                         </div>
//                     </div>

//                     {/* ===============================================
//               CBC
//           =============================================== */}

//                     <div className="titan-kpi-card titan-kpi-cbc">
//                         <div className="titan-kpi-icon">
//                             <Building2 size={25} strokeWidth={1.7} />
//                         </div>

//                         <div className="titan-kpi-info">
//                             <span className="titan-kpi-label">CBC</span>

//                             <strong className="titan-kpi-value">{topCards.cbc ?? 0}</strong>
//                         </div>
//                     </div>

//                     {/* ===============================================
//               WAREHOUSE
//           =============================================== */}

//                     <div className="titan-kpi-card titan-kpi-warehouse">
//                         <div className="titan-kpi-icon">
//                             <Building2 size={25} strokeWidth={1.7} />
//                         </div>

//                         <div className="titan-kpi-info">
//                             <span className="titan-kpi-label">Warehouse</span>

//                             <strong className="titan-kpi-value">
//                                 {topCards.warehouse ?? 0}
//                             </strong>
//                         </div>
//                     </div>
//                 </section>

//                 {/* =================================================
//             CHART SECTION
//         ================================================= */}

//                 <section className="titan-chart-grid">


//                     <div className="titan-chart-card">
//                         <h2>Occupancy Distribution</h2>

//                         <div className="titan-distribution-body">

//                             <div className="titan-donut-wrapper">
//                                 <ResponsiveContainer width="100%" height="100%">
//                                     <PieChart>
//                                         <Pie
//                                             data={distributionChartData}
//                                             dataKey="value"
//                                             nameKey="zone"
//                                             cx="50%"
//                                             cy="50%"
//                                             innerRadius="40%"
//                                             outerRadius="80%"
//                                             paddingAngle={0}
//                                             stroke="#ffffff"
//                                             strokeWidth={4}
//                                             labelLine={false}
//                                             label={({
//                                                 cx,
//                                                 cy,
//                                                 midAngle,
//                                                 innerRadius,
//                                                 outerRadius,
//                                                 index,
//                                             }) => {
//                                                 const RADIAN = Math.PI / 180;

//                                                 const radius =
//                                                     innerRadius + (outerRadius - innerRadius) * 0.5;

//                                                 const x = cx + radius * Math.cos(-midAngle * RADIAN);

//                                                 const y = cy + radius * Math.sin(-midAngle * RADIAN);

//                                                 const item = distributionChartData[index];

//                                                 return (
//                                                     <text
//                                                         x={x}
//                                                         y={y}
//                                                         fill="#ffffff"
//                                                         textAnchor="middle"
//                                                         dominantBaseline="central"
//                                                         fontSize={17}
//                                                         fontWeight={700}
//                                                     >
//                                                         {item?.percentage}
//                                                     </text>
//                                                 );
//                                             }}
//                                         >
//                                             {distributionChartData.map((item, index) => (
//                                                 <Cell
//                                                     key={`cell-${index}`}
//                                                     fill={
//                                                         distributionColors[
//                                                         index % distributionColors.length
//                                                         ]
//                                                     }
//                                                 />
//                                             ))}
//                                         </Pie>
//                                     </PieChart>
//                                 </ResponsiveContainer>


//                                 <div className="titan-donut-center">
//                                     <strong>{totalOccupants}</strong>

//                                     <span>Total Occupants</span>
//                                 </div>
//                             </div>


//                             <div className="titan-distribution-legend">
//                                 {distributionData.map((item, index) => {
//                                     const percentage = getPercentage(item.value);

//                                     return (
//                                         <div
//                                             className="titan-distribution-item"
//                                             key={`${item.zone}-legend`}
//                                         >
//                                             <span
//                                                 className="titan-distribution-dot"
//                                                 style={{
//                                                     backgroundColor:
//                                                         distributionColors[
//                                                         index % distributionColors.length
//                                                         ],
//                                                 }}
//                                             />

//                                             <span className="titan-distribution-zone">
//                                                 {item.zone}
//                                             </span>

//                                             <span className="titan-distribution-percent">
//                                                 ({percentage}%)
//                                             </span>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         </div>
//                     </div>


//                     <div className="titan-chart-card">
//                         <h2>
//                             Occupancy by Location
//                             <span> (Gents / Ladies)</span>
//                         </h2>


//                         <div className="titan-location-chart">
//                             <ResponsiveContainer width="100%" height="100%">
//                                 <BarChart
//                                     data={occupancyByLocation}
//                                     margin={{
//                                         top: 30,
//                                         right: 10,
//                                         left: 10,
//                                         bottom: 10,
//                                     }}
//                                     barCategoryGap="28%"
//                                 >


//                                     <CartesianGrid
//                                         vertical={false}
//                                         stroke="#e5ebf3"
//                                         strokeDasharray="0"
//                                     />

//                                     <XAxis
//                                         dataKey="zone"
//                                         axisLine={false}
//                                         tickLine={false}
//                                         tick={{
//                                             fill: "#17234D",
//                                             fontSize: 13,
//                                             fontWeight: 600,
//                                         }}
//                                     />



//                                     <YAxis
//                                         domain={[0, 250]}
//                                         ticks={[0, 50, 100, 150, 200, 250]}
//                                         axisLine={false}
//                                         tickLine={false}
//                                         tick={{
//                                             fill: "#63739B",
//                                             fontSize: 11,
//                                         }}
//                                         label={{
//                                             value: "Occupants",
//                                             angle: -90,
//                                             position: "insideLeft",
//                                             fill: "#63739B",
//                                             fontSize: 11,
//                                         }}
//                                     />


//                                     <Bar dataKey="gents" stackId="occupancy" fill="#6652D9">
//                                         <LabelList
//                                             dataKey="gents"
//                                             position="center"
//                                             fill="#ffffff"
//                                             fontSize={12}
//                                             fontWeight={500}
//                                         />
//                                     </Bar>


//                                     <Bar
//                                         dataKey="ladies"
//                                         stackId="occupancy"
//                                         fill="#2CC398"
//                                         radius={[3, 3, 0, 0]}
//                                     >


//                                         <LabelList
//                                             dataKey="ladies"
//                                             position="center"
//                                             fill="#ffffff"
//                                             fontSize={12}
//                                             fontWeight={500}
//                                         />


//                                         <LabelList
//                                             dataKey="total"
//                                             position="top"
//                                             fill="#17234D"
//                                             fontSize={13}
//                                             fontWeight={700}
//                                         />
//                                     </Bar>
//                                 </BarChart>
//                             </ResponsiveContainer>
//                         </div>


//                         <div className="titan-location-legend">
//                             <div>
//                                 <span className="titan-gents-dot"></span>

//                                 <span>Gents</span>
//                             </div>

//                             <div>
//                                 <span className="titan-ladies-dot"></span>

//                                 <span>Ladies</span>
//                             </div>
//                         </div>
//                     </div>
//                 </section>

//                 {/* =================================================
//             BOTTOM SUMMARY
//         ================================================= */}

//                 <section className="titan-summary">

//                     {/* <div className="titan-summary-item">
//                         <div className="titan-summary-icon purple">
//                             <UserRound size={48} strokeWidth={1.5} />
//                         </div>
//                         <div>
//                             <span>Gents</span>

//                             <strong>{bottomCards.gents ?? 0}</strong>
//                         </div>
//                     </div>

//                     <div className="titan-summary-divider"></div>

//                     <div className="titan-summary-item">
//                         <div className="titan-summary-icon green">
//                             <UserRound size={48} strokeWidth={1.5} />
//                         </div>

//                         <div>
//                             <span>Ladies</span>

//                             <strong>{bottomCards.ladies ?? 0}</strong>
//                         </div>
//                     </div>


//                     <div className="titan-summary-divider"></div> */}


//                     <div className="titan-summary-item">

//                         <div className="titan-summary-icon orange">
//                             <UsersRound size={48} strokeWidth={1.5} />
//                         </div>

//                         <div>
//                             <span>Total Occupants</span>

//                             <strong>{bottomCards.totalOccupants ?? 0}</strong>
//                         </div>
//                     </div>



//                     <div className="titan-summary-divider"></div>

//                     <div className="titan-summary-item titan-overall">
//                         <div>
//                             <span>Overall Occupancy</span>

//                             <strong>{bottomCards.overallOccupancy ?? 0}%</strong>
//                         </div>


//                         <div className="titan-progress-ring">
//                             <svg width="55" height="55" viewBox="0 0 55 55">


//                                 <circle cx="27.5" cy="27.5" r="21" className="titan-ring-bg" />


//                                 <circle
//                                     cx="27.5"
//                                     cy="27.5"
//                                     r="21"
//                                     className="titan-ring-progress"
//                                     strokeDasharray="131.95"
//                                     strokeDashoffset={
//                                         131.95 -
//                                         (131.95 * (bottomCards.overallOccupancy || 0)) / 100
//                                     }
//                                 />
//                             </svg>
//                         </div>
//                     </div>
//                 </section>

//                 {/* =================================================
//             FOOTER
//         ================================================= */}


//                 <footer className="titan-footer">
//                     <div className="titan-footer-left">
//                         {/* <div className="footer-copy">
//               Copyright © {new Date().getFullYear()} All Rights Reserved
//               <img
//                 src={footerlogo}
//                 alt="footerlogo"
//                 className="footer_logo"
//                 width={130}
//                 height={35}
//               />
//             </div> */}
//                     </div>

//                     <div className="titan-footer-right">
//                         <div className="footer-copy">
//                             Copyright © {new Date().getFullYear()} All Rights Reserved
//                             <img
//                                 src={footerlogo}
//                                 alt="footerlogo"
//                                 className="footer_logo"
//                                 width={130}
//                                 height={35}
//                             />
//                         </div>
//                     </div>
//                 </footer>
//             </div>
//         </div>
//     );
// };

// export default TitanDashboard;

// import React from "react";
// import {
//     PieChart,
//     Pie,
//     Cell,
//     ResponsiveContainer,
//     BarChart,
//     Bar,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     LabelList,
//     Tooltip,
// } from "recharts";
// import {
//     Building2,
//     UsersRound,
//     CalendarDays,
//     Clock3,
// } from "lucide-react";

// import { titanDashboardData } from "./titanDashboardData";
// import "./TitanDashboard.css";

// import titanLogo2 from "../../Components/Assets/Titan/titan-logo2.avif";
// import factoryImage from "../../Components/Assets/Titan/factory-image.jpeg";
// import footerlogo from "../../Components/Assets/footer-logo.svg";

// const distributionColors = [
//     "#6652D9",
//     "#9A65D6",
//     "#FFB23E",
//     "#20BFAF",
//     "#FF7959",
// ];


// const DonutTooltip = ({ active, payload }) => {
//     if (!active || !payload?.length) return null;

//     const item = payload[0]?.payload || {};
//     const value = Number(item?.value || 0);
//     const percentage =
//         item?.percentage !== undefined
//             ? String(item.percentage).replace("%", "")
//             : "";

//     return (
//         <div className="titan-chart-tooltip">
//             <div className="titan-tooltip-title">{item?.zone || "Location"}</div>
//             <div className="titan-tooltip-row">
//                 <span>Occupants</span>
//                 <strong>{value}</strong>
//             </div>
//             <div className="titan-tooltip-row">
//                 <span>Share</span>
//                 <strong>{percentage}%</strong>
//             </div>
//         </div>
//     );
// };

// const LocationTooltip = ({ active, payload, label }) => {
//     if (!active || !payload?.length) return null;

//     const gents = Number(payload.find((item) => item.dataKey === "gents")?.value || 0);
//     const ladies = Number(payload.find((item) => item.dataKey === "ladies")?.value || 0);
//     const total = gents + ladies;

//     return (
//         <div className="titan-chart-tooltip">
//             <div className="titan-tooltip-title">{label || "Location"}</div>

//             <div className="titan-tooltip-row">
//                 <span>
//                     <i className="titan-tooltip-dot titan-tooltip-gents" />
//                     Gents
//                 </span>
//                 <strong>{gents}</strong>
//             </div>

//             <div className="titan-tooltip-row">
//                 <span>
//                     <i className="titan-tooltip-dot titan-tooltip-ladies" />
//                     Ladies
//                 </span>
//                 <strong>{ladies}</strong>
//             </div>

//             <div className="titan-tooltip-total">
//                 Total <strong>{total}</strong>
//             </div>
//         </div>
//     );
// };

// const TitanDashboard = () => {
//     const response = titanDashboardData;
//     const data = response?.data || {};

//     const topCards = data?.topCards || {};
//     const occupancyDistribution = data?.occupancyDistribution || {};
//     const distributionData = occupancyDistribution?.data || [];
//     const occupancyByLocation = data?.occupancyByLocation || [];
//     const bottomCards = data?.bottomCards || {};

//     const totalOccupants = Number(
//         occupancyDistribution?.totalOccupants ??
//         bottomCards?.totalOccupants ??
//         0
//     );

//     const getPercentage = (value) => {
//         if (!totalOccupants) return 0;
//         return Math.round((Number(value || 0) / totalOccupants) * 100);
//     };

//     const distributionChartData = distributionData.map((item) => ({
//         ...item,
//         percentage:
//             item?.percentage !== undefined && item?.percentage !== null
//                 ? String(item.percentage).includes("%")
//                     ? String(item.percentage)
//                     : `${item.percentage}%`
//                 : `${getPercentage(item?.value)}%`,
//     }));

//     const occupancy = Math.max(
//         0,
//         Math.min(100, Number(bottomCards?.overallOccupancy || 0))
//     );

//     const ringCircumference = 131.95;
//     const ringOffset =
//         ringCircumference - (ringCircumference * occupancy) / 100;

//     return (
//         <div className="titan-dashboard">
//             {/* Background */}
//             <div className="titan-background">
//                 <img
//                     src={factoryImage}
//                     alt=""
//                     className="titan-factory-watermark"
//                 />
//             </div>

//             <main className="titan-dashboard-content">
//                 {/* Header */}
//                 <header className="titan-header">
//                     <div className="titan-header-left">
//                         <img
//                             src={titanLogo2}
//                             alt="Tanishq"
//                             className="titan-header-logo"
//                         />

//                         <div className="titan-title-block">
//                             <h1>Factory Occupancy Overview</h1>
//                             <p>Live occupancy status across all locations</p>
//                         </div>
//                     </div>

//                     <div className="titan-header-right">
//                         <div className="titan-live">
//                             <span className="titan-live-dot" />
//                             <span>LIVE</span>
//                         </div>

//                         <span className="titan-header-line" />

//                         <div className="titan-header-meta">
//                             <CalendarDays size={15} strokeWidth={1.8} />
//                             <span>01 Sep 2026</span>
//                         </div>

//                         <span className="titan-header-line" />

//                         <div className="titan-header-meta">
//                             <Clock3 size={15} strokeWidth={1.8} />
//                             <span>10:30 AM</span>
//                         </div>
//                     </div>
//                 </header>

//                 {/* KPI Cards */}
//                 <section className="titan-kpi-grid">
//                     <div className="titan-kpi-card titan-kpi-new">
//                         <div className="titan-kpi-icon">
//                             <Building2 size={25} strokeWidth={1.7} />
//                         </div>
//                         <div className="titan-kpi-info">
//                             <span className="titan-kpi-label">New Building</span>
//                             <strong className="titan-kpi-value">
//                                 {topCards.newBuilding ?? 0}
//                             </strong>
//                             <span className="titan-kpi-status">Current occupancy</span>
//                         </div>
//                     </div>

//                     <div className="titan-kpi-card titan-kpi-old">
//                         <div className="titan-kpi-icon">
//                             <Building2 size={25} strokeWidth={1.7} />
//                         </div>
//                         <div className="titan-kpi-info">
//                             <span className="titan-kpi-label">Old Building</span>
//                             <strong className="titan-kpi-value">
//                                 {topCards.oldBuilding ?? 0}
//                             </strong>
//                             <span className="titan-kpi-status">Current occupancy</span>
//                         </div>
//                     </div>

//                     <div className="titan-kpi-card titan-kpi-cbc">
//                         <div className="titan-kpi-icon">
//                             <Building2 size={25} strokeWidth={1.7} />
//                         </div>
//                         <div className="titan-kpi-info">
//                             <span className="titan-kpi-label">CBC</span>
//                             <strong className="titan-kpi-value">
//                                 {topCards.cbc ?? 0}
//                             </strong>
//                             <span className="titan-kpi-status">Current occupancy</span>
//                         </div>
//                     </div>

//                     <div className="titan-kpi-card titan-kpi-warehouse">
//                         <div className="titan-kpi-icon">
//                             <Building2 size={25} strokeWidth={1.7} />
//                         </div>
//                         <div className="titan-kpi-info">
//                             <span className="titan-kpi-label">Warehouse</span>
//                             <strong className="titan-kpi-value">
//                                 {topCards.warehouse ?? 0}
//                             </strong>
//                             <span className="titan-kpi-status">Current occupancy</span>
//                         </div>
//                     </div>
//                 </section>

//                 {/* Charts */}
//                 <section className="titan-chart-grid">
//                     {/* Distribution */}
//                     <div className="titan-chart-card">
//                         <div className="titan-chart-heading">
//                             <div>
//                                 <h2>Occupancy Distribution</h2>
//                                 <p>Current occupant distribution by location</p>
//                             </div>
//                             <button className="titan-more-button" aria-label="More options">
//                                 <span />
//                                 <span />
//                                 <span />
//                             </button>
//                         </div>

//                         <div className="titan-distribution-body">
//                             <div className="titan-donut-wrapper">
//                                 <ResponsiveContainer width="100%" height="100%">
//                                     <PieChart>
//                                         <Tooltip
//                                             content={<DonutTooltip />}
//                                             cursor={false}
//                                             wrapperStyle={{ outline: "none" }}
//                                         />
//                                         <Pie
//                                             data={distributionChartData}
//                                             dataKey="value"
//                                             nameKey="zone"
//                                             cx="50%"
//                                             cy="50%"
//                                             innerRadius="42%"
//                                             outerRadius="78%"
//                                             paddingAngle={0}
//                                             stroke="#ffffff"
//                                             strokeWidth={4}
//                                             labelLine={false}
//                                             label={({
//                                                 cx,
//                                                 cy,
//                                                 midAngle,
//                                                 innerRadius,
//                                                 outerRadius,
//                                                 index,
//                                             }) => {
//                                                 const RADIAN = Math.PI / 180;
//                                                 const radius =
//                                                     innerRadius +
//                                                     (outerRadius - innerRadius) * 0.5;
//                                                 const x =
//                                                     cx + radius * Math.cos(-midAngle * RADIAN);
//                                                 const y =
//                                                     cy + radius * Math.sin(-midAngle * RADIAN);
//                                                 const item = distributionChartData[index];

//                                                 return (
//                                                     <text
//                                                         x={x}
//                                                         y={y}
//                                                         fill="#ffffff"
//                                                         textAnchor="middle"
//                                                         dominantBaseline="central"
//                                                         fontSize={16}
//                                                         fontWeight={700}
//                                                     >
//                                                         {item?.percentage}
//                                                     </text>
//                                                 );
//                                             }}
//                                         >
//                                             {distributionChartData.map((item, index) => (
//                                                 <Cell
//                                                     key={`distribution-${index}`}
//                                                     fill={
//                                                         distributionColors[
//                                                         index % distributionColors.length
//                                                         ]
//                                                     }
//                                                 />
//                                             ))}
//                                         </Pie>
//                                     </PieChart>
//                                 </ResponsiveContainer>

//                                 <div className="titan-donut-center">
//                                     <strong>{totalOccupants}</strong>
//                                     <span>Total Occupants</span>
//                                 </div>
//                             </div>

//                             <div className="titan-distribution-legend">
//                                 {distributionData.map((item, index) => {
//                                     const percentage = getPercentage(item?.value);

//                                     return (
//                                         <div
//                                             className="titan-distribution-item"
//                                             key={`${item?.zone}-${index}`}
//                                         >
//                                             <span
//                                                 className="titan-distribution-dot"
//                                                 style={{
//                                                     backgroundColor:
//                                                         distributionColors[
//                                                         index % distributionColors.length
//                                                         ],
//                                                 }}
//                                             />
//                                             <span className="titan-distribution-zone">
//                                                 {item?.zone}
//                                             </span>
//                                             <span className="titan-distribution-percent">
//                                                 ({percentage}%)
//                                             </span>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Location */}
//                     <div className="titan-chart-card">
//                         <div className="titan-chart-heading">
//                             <div>
//                                 <h2>
//                                     Occupancy by Location{" "}
//                                     <span>(Gents / Ladies)</span>
//                                 </h2>
//                                 <p>Occupancy count across all locations</p>
//                             </div>
//                             <button className="titan-more-button" aria-label="More options">
//                                 <span />
//                                 <span />
//                                 <span />
//                             </button>
//                         </div>

//                         <div className="titan-location-chart">
//                             <ResponsiveContainer width="100%" height="100%">
//                                 <BarChart
//                                     data={occupancyByLocation}
//                                     margin={{
//                                         top: 28,
//                                         right: 10,
//                                         left: 10,
//                                         bottom: 10,
//                                     }}
//                                     barCategoryGap="30%"
//                                 >
//                                     <Tooltip
//                                         content={<LocationTooltip />}
//                                         cursor={{
//                                             fill: "rgba(83, 103, 143, 0.045)",
//                                             radius: 8,
//                                         }}
//                                         wrapperStyle={{ outline: "none" }}
//                                     />
//                                     <CartesianGrid
//                                         vertical={false}
//                                         stroke="#dce5ef"
//                                         strokeDasharray="0"
//                                     />

//                                     <XAxis
//                                         dataKey="zone"
//                                         axisLine={false}
//                                         tickLine={false}
//                                         tick={{
//                                             fill: "#17234D",
//                                             fontSize: 13,
//                                             fontWeight: 650,
//                                         }}
//                                     />

//                                     <YAxis
//                                         domain={[0, 250]}
//                                         ticks={[0, 50, 100, 150, 200, 250]}
//                                         axisLine={false}
//                                         tickLine={false}
//                                         tick={{
//                                             fill: "#63739B",
//                                             fontSize: 11,
//                                         }}
//                                         label={{
//                                             value: "Occupants",
//                                             angle: -90,
//                                             position: "insideLeft",
//                                             fill: "#63739B",
//                                             fontSize: 11,
//                                         }}
//                                     />

//                                     <Bar
//                                         dataKey="gents"
//                                         stackId="occupancy"
//                                         fill="#6652D9"
//                                     >
//                                         <LabelList
//                                             dataKey="gents"
//                                             position="center"
//                                             fill="#ffffff"
//                                             fontSize={12}
//                                             fontWeight={600}
//                                         />
//                                     </Bar>

//                                     <Bar
//                                         dataKey="ladies"
//                                         stackId="occupancy"
//                                         fill="#2CC398"
//                                         radius={[4, 4, 0, 0]}
//                                     >
//                                         <LabelList
//                                             dataKey="ladies"
//                                             position="center"
//                                             fill="#ffffff"
//                                             fontSize={12}
//                                             fontWeight={600}
//                                         />
//                                         <LabelList
//                                             dataKey="total"
//                                             position="top"
//                                             fill="#17234D"
//                                             fontSize={13}
//                                             fontWeight={700}
//                                         />
//                                     </Bar>
//                                 </BarChart>
//                             </ResponsiveContainer>
//                         </div>

//                         <div className="titan-location-legend">
//                             <div>
//                                 <span className="titan-gents-dot" />
//                                 <span>Gents</span>
//                             </div>
//                             <div>
//                                 <span className="titan-ladies-dot" />
//                                 <span>Ladies</span>
//                             </div>
//                         </div>
//                     </div>
//                 </section>

//                 {/* Summary - only two items */}
//                 <section className="titan-summary">
//                     <div className="titan-summary-item">
//                         <div className="titan-summary-icon orange">
//                             <UsersRound size={46} strokeWidth={1.6} />
//                         </div>
//                         <div>
//                             <span>Total Occupants</span>
//                             <strong>{bottomCards.totalOccupants ?? totalOccupants}</strong>
//                         </div>
//                     </div>

//                     <div className="titan-summary-divider" />

//                     <div className="titan-summary-item titan-overall">
//                         <div>
//                             <span>Overall Occupancy</span>
//                             <strong>{occupancy}%</strong>
//                         </div>

//                         <div className="titan-progress-ring">
//                             <svg width="55" height="55" viewBox="0 0 55 55">
//                                 <circle
//                                     cx="27.5"
//                                     cy="27.5"
//                                     r="21"
//                                     className="titan-ring-bg"
//                                 />
//                                 <circle
//                                     cx="27.5"
//                                     cy="27.5"
//                                     r="21"
//                                     className="titan-ring-progress"
//                                     strokeDasharray={ringCircumference}
//                                     strokeDashoffset={ringOffset}
//                                 />
//                             </svg>
//                         </div>
//                     </div>
//                 </section>

//                 {/* Footer */}
//                 <footer className="titan-footer">
//                     <div className="titan-footer-right">
//                         <span className="titan-footer-copyright">
//                             Copyright © {new Date().getFullYear()} All Rights Reserved
//                         </span>
//                         <img
//                             src={footerlogo}
//                             alt="Delopt"
//                             className="footer_logo"
//                         />
//                     </div>
//                 </footer>
//             </main>
//         </div>
//     );
// };

// export default TitanDashboard;


// import React, { useEffect, useState, useCallback } from "react";
// import {
//     PieChart,
//     Pie,
//     Cell,
//     ResponsiveContainer,
//     BarChart,
//     Bar,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     LabelList,
//     Tooltip,
// } from "recharts";
// import {
//     Building2,
//     UsersRound,
//     CalendarDays,
//     Clock3,
// } from "lucide-react";

// import "./TitanDashboard.css";

// /*
//  * Titan Dashboard API
//  *
//  * Add this to your .env file:
//  * VITE_TITAN_DASHBOARD_API_URL=https://your-server-url/your-endpoint
//  *
//  * Expected API response:
//  * {
//  *   "success": true,
//  *   "data": {
//  *     "topCards": {
//  *       "newBuilding": 150,
//  *       "oldBuilding": 120,
//  *       "cbc": 80,
//  *       "warehouse": 25
//  *     },
//  *     "occupancyDistribution": {
//  *       "totalOccupants": 375,
//  *       "data": []
//  *     },
//  *     "occupancyByLocation": [],
//  *     "bottomCards": {
//  *       "totalOccupants": 375,
//  *       "overallOccupancy": 68
//  *     }
//  *   }
//  * }
//  */
// const TITAN_API_URL =
//     import.meta.env.VITE_TITAN_DASHBOARD_API_URL || "/api/titanDashboard";

// import titanLogo2 from "../../Components/Assets/Titan/titan-logo2.avif";
// import factoryImage from "../../Components/Assets/Titan/factory-image.jpeg";
// import footerlogo from "../../Components/Assets/footer-logo.svg";

// const distributionColors = [
//     "#6652D9",
//     "#9A65D6",
//     "#FFB23E",
//     "#20BFAF",
//     "#FF7959",
// ];


// const DonutTooltip = ({ active, payload }) => {
//     if (!active || !payload?.length) return null;

//     const item = payload[0]?.payload || {};
//     const value = Number(item?.value || 0);
//     const percentage =
//         item?.percentage !== undefined
//             ? String(item.percentage).replace("%", "")
//             : "";

//     return (
//         <div className="titan-chart-tooltip">
//             <div className="titan-tooltip-title">{item?.zone || "Location"}</div>
//             <div className="titan-tooltip-row">
//                 <span>Occupants</span>
//                 <strong>{value}</strong>
//             </div>
//             <div className="titan-tooltip-row">
//                 <span>Share</span>
//                 <strong>{percentage}%</strong>
//             </div>
//         </div>
//     );
// };

// const LocationTooltip = ({ active, payload, label }) => {
//     if (!active || !payload?.length) return null;

//     const gents = Number(payload.find((item) => item.dataKey === "gents")?.value || 0);
//     const ladies = Number(payload.find((item) => item.dataKey === "ladies")?.value || 0);
//     const total = gents + ladies;

//     return (
//         <div className="titan-chart-tooltip">
//             <div className="titan-tooltip-title">{label || "Location"}</div>

//             <div className="titan-tooltip-row">
//                 <span>
//                     <i className="titan-tooltip-dot titan-tooltip-gents" />
//                     Gents
//                 </span>
//                 <strong>{gents}</strong>
//             </div>

//             <div className="titan-tooltip-row">
//                 <span>
//                     <i className="titan-tooltip-dot titan-tooltip-ladies" />
//                     Ladies
//                 </span>
//                 <strong>{ladies}</strong>
//             </div>

//             <div className="titan-tooltip-total">
//                 Total <strong>{total}</strong>
//             </div>
//         </div>
//     );
// };

// const TitanDashboard = () => {
//     const [dashboardData, setDashboardData] = useState(null);
//     const [currentDateTime, setCurrentDateTime] = useState(new Date());
//     const [apiError, setApiError] = useState("");

//     // Fetch data immediately and refresh it every 15 seconds.
//     const fetchDashboardData = useCallback(async (signal) => {
//         try {
//             const response = await fetch(TITAN_API_URL, {
//                 method: "GET",
//                 headers: {
//                     Accept: "application/json",
//                 },
//                 signal,
//             });

//             if (!response.ok) {
//                 throw new Error(`API request failed: ${response.status}`);
//             }

//             const result = await response.json();

//             if (result?.success === false) {
//                 throw new Error(result?.message || "API returned an error");
//             }

//             setDashboardData(result);
//             setApiError("");
//         } catch (error) {
//             if (error?.name === "AbortError") return;

//             console.error("Titan Dashboard API error:", error);
//             setApiError("Unable to refresh dashboard data");
//         }
//     }, []);

//     useEffect(() => {
//         const controller = new AbortController();

//         // Initial load
//         fetchDashboardData(controller.signal);

//         // Refresh API data every 15 seconds
//         const refreshTimer = setInterval(() => {
//             fetchDashboardData(controller.signal);
//         }, 15000);

//         return () => {
//             controller.abort();
//             clearInterval(refreshTimer);
//         };
//     }, [fetchDashboardData]);

//     // Update the header clock every second.
//     useEffect(() => {
//         const clockTimer = setInterval(() => {
//             setCurrentDateTime(new Date());
//         }, 1000);

//         return () => clearInterval(clockTimer);
//     }, []);

//     const data = dashboardData?.data || {};

//     const topCards = data?.topCards || {};
//     const occupancyDistribution = data?.occupancyDistribution || {};
//     const distributionData = Array.isArray(occupancyDistribution?.data)
//         ? occupancyDistribution.data
//         : [];
//     const occupancyByLocation = Array.isArray(data?.occupancyByLocation)
//         ? data.occupancyByLocation
//         : [];
//     const bottomCards = data?.bottomCards || {};

//     const totalOccupants = Number(
//         occupancyDistribution?.totalOccupants ??
//         bottomCards?.totalOccupants ??
//         0
//     );

//     const getPercentage = (value) => {
//         if (!totalOccupants) return 0;
//         return Math.round((Number(value || 0) / totalOccupants) * 100);
//     };

//     const distributionChartData = distributionData.map((item) => ({
//         ...item,
//         percentage:
//             item?.percentage !== undefined && item?.percentage !== null
//                 ? String(item.percentage).includes("%")
//                     ? String(item.percentage)
//                     : `${item.percentage}%`
//                 : `${getPercentage(item?.value)}%`,
//     }));

//     const occupancy = Math.max(
//         0,
//         Math.min(100, Number(bottomCards?.overallOccupancy || 0))
//     );

//     const ringCircumference = 131.95;
//     const ringOffset =
//         ringCircumference - (ringCircumference * occupancy) / 100;

//     const formattedDate = new Intl.DateTimeFormat("en-IN", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//         timeZone: "Asia/Kolkata",
//     }).format(currentDateTime);

//     const formattedTime = new Intl.DateTimeFormat("en-IN", {
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//         hour12: true,
//         timeZone: "Asia/Kolkata",
//     }).format(currentDateTime);

//     return (
//         <div className="titan-dashboard">
//             {/* Background */}
//             <div className="titan-background">
//                 <img
//                     src={factoryImage}
//                     alt=""
//                     className="titan-factory-watermark"
//                 />
//             </div>

//             <main className="titan-dashboard-content">
//                 {/* Header */}
//                 <header className="titan-header">
//                     <div className="titan-header-left">
//                         <img
//                             src={titanLogo2}
//                             alt="Tanishq"
//                             className="titan-header-logo"
//                         />

//                         <div className="titan-title-block">
//                             <h1>Factory Occupancy Overview</h1>
//                             <p>Live occupancy status across all locations</p>
//                         </div>
//                     </div>

//                     <div className="titan-header-right">
//                         <div className="titan-live">
//                             <span className="titan-live-dot" />
//                             <span>LIVE</span>
//                         </div>

//                         <span className="titan-header-line" />

//                         <div className="titan-header-meta">
//                             <CalendarDays size={15} strokeWidth={1.8} />
//                             <span>{formattedDate}</span>
//                         </div>

//                         <span className="titan-header-line" />

//                         <div className="titan-header-meta">
//                             <Clock3 size={15} strokeWidth={1.8} />
//                             <span>{formattedTime}</span>
//                         </div>
//                     </div>
//                 </header>

//                 {apiError && (
//                     <div className="titan-api-status" role="status">
//                         {apiError} — showing the last available data
//                     </div>
//                 )}

//                 {/* KPI Cards */}
//                 <section className="titan-kpi-grid">
//                     <div className="titan-kpi-card titan-kpi-new">
//                         <div className="titan-kpi-icon">
//                             <Building2 size={25} strokeWidth={1.7} />
//                         </div>
//                         <div className="titan-kpi-info">
//                             <span className="titan-kpi-label">New Building</span>
//                             <strong className="titan-kpi-value">
//                                 {topCards.newBuilding ?? 0}
//                             </strong>
//                             <span className="titan-kpi-status">Current occupancy</span>
//                         </div>
//                     </div>

//                     <div className="titan-kpi-card titan-kpi-old">
//                         <div className="titan-kpi-icon">
//                             <Building2 size={25} strokeWidth={1.7} />
//                         </div>
//                         <div className="titan-kpi-info">
//                             <span className="titan-kpi-label">Old Building</span>
//                             <strong className="titan-kpi-value">
//                                 {topCards.oldBuilding ?? 0}
//                             </strong>
//                             <span className="titan-kpi-status">Current occupancy</span>
//                         </div>
//                     </div>

//                     <div className="titan-kpi-card titan-kpi-cbc">
//                         <div className="titan-kpi-icon">
//                             <Building2 size={25} strokeWidth={1.7} />
//                         </div>
//                         <div className="titan-kpi-info">
//                             <span className="titan-kpi-label">CBC</span>
//                             <strong className="titan-kpi-value">
//                                 {topCards.cbc ?? 0}
//                             </strong>
//                             <span className="titan-kpi-status">Current occupancy</span>
//                         </div>
//                     </div>

//                     <div className="titan-kpi-card titan-kpi-warehouse">
//                         <div className="titan-kpi-icon">
//                             <Building2 size={25} strokeWidth={1.7} />
//                         </div>
//                         <div className="titan-kpi-info">
//                             <span className="titan-kpi-label">Warehouse</span>
//                             <strong className="titan-kpi-value">
//                                 {topCards.warehouse ?? 0}
//                             </strong>
//                             <span className="titan-kpi-status">Current occupancy</span>
//                         </div>
//                     </div>
//                 </section>

//                 {/* Charts */}
//                 <section className="titan-chart-grid">
//                     {/* Distribution */}
//                     <div className="titan-chart-card">
//                         <div className="titan-chart-heading">
//                             <div>
//                                 <h2>Occupancy Distribution</h2>
//                                 <p>Current occupant distribution by location</p>
//                             </div>
//                             <button className="titan-more-button" aria-label="More options">
//                                 <span />
//                                 <span />
//                                 <span />
//                             </button>
//                         </div>

//                         <div className="titan-distribution-body">
//                             <div className="titan-donut-wrapper">
//                                 <ResponsiveContainer width="100%" height="100%">
//                                     <PieChart>
//                                         <Tooltip
//                                             content={<DonutTooltip />}
//                                             cursor={false}
//                                             wrapperStyle={{ outline: "none" }}
//                                         />
//                                         <Pie
//                                             data={distributionChartData}
//                                             dataKey="value"
//                                             nameKey="zone"
//                                             cx="50%"
//                                             cy="50%"
//                                             innerRadius="42%"
//                                             outerRadius="78%"
//                                             paddingAngle={0}
//                                             stroke="#ffffff"
//                                             strokeWidth={4}
//                                             labelLine={false}
//                                             label={({
//                                                 cx,
//                                                 cy,
//                                                 midAngle,
//                                                 innerRadius,
//                                                 outerRadius,
//                                                 index,
//                                             }) => {
//                                                 const RADIAN = Math.PI / 180;
//                                                 const radius =
//                                                     innerRadius +
//                                                     (outerRadius - innerRadius) * 0.5;
//                                                 const x =
//                                                     cx + radius * Math.cos(-midAngle * RADIAN);
//                                                 const y =
//                                                     cy + radius * Math.sin(-midAngle * RADIAN);
//                                                 const item = distributionChartData[index];

//                                                 return (
//                                                     <text
//                                                         x={x}
//                                                         y={y}
//                                                         fill="#ffffff"
//                                                         textAnchor="middle"
//                                                         dominantBaseline="central"
//                                                         fontSize={16}
//                                                         fontWeight={700}
//                                                     >
//                                                         {item?.percentage}
//                                                     </text>
//                                                 );
//                                             }}
//                                         >
//                                             {distributionChartData.map((item, index) => (
//                                                 <Cell
//                                                     key={`distribution-${index}`}
//                                                     fill={
//                                                         distributionColors[
//                                                         index % distributionColors.length
//                                                         ]
//                                                     }
//                                                 />
//                                             ))}
//                                         </Pie>
//                                     </PieChart>
//                                 </ResponsiveContainer>

//                                 <div className="titan-donut-center">
//                                     <strong>{totalOccupants}</strong>
//                                     <span>Total Occupants</span>
//                                 </div>
//                             </div>

//                             <div className="titan-distribution-legend">
//                                 {distributionData.map((item, index) => {
//                                     const percentage = getPercentage(item?.value);

//                                     return (
//                                         <div
//                                             className="titan-distribution-item"
//                                             key={`${item?.zone}-${index}`}
//                                         >
//                                             <span
//                                                 className="titan-distribution-dot"
//                                                 style={{
//                                                     backgroundColor:
//                                                         distributionColors[
//                                                         index % distributionColors.length
//                                                         ],
//                                                 }}
//                                             />
//                                             <span className="titan-distribution-zone">
//                                                 {item?.zone}
//                                             </span>
//                                             <span className="titan-distribution-percent">
//                                                 ({percentage}%)
//                                             </span>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Location */}
//                     <div className="titan-chart-card">
//                         <div className="titan-chart-heading">
//                             <div>
//                                 <h2>
//                                     Occupancy by Location{" "}
//                                     <span>(Gents / Ladies)</span>
//                                 </h2>
//                                 <p>Occupancy count across all locations</p>
//                             </div>
//                             <button className="titan-more-button" aria-label="More options">
//                                 <span />
//                                 <span />
//                                 <span />
//                             </button>
//                         </div>

//                         <div className="titan-location-chart">
//                             <ResponsiveContainer width="100%" height="100%">
//                                 <BarChart
//                                     data={occupancyByLocation}
//                                     margin={{
//                                         top: 28,
//                                         right: 10,
//                                         left: 10,
//                                         bottom: 10,
//                                     }}
//                                     barCategoryGap="30%"
//                                 >
//                                     <Tooltip
//                                         content={<LocationTooltip />}
//                                         cursor={{
//                                             fill: "rgba(83, 103, 143, 0.045)",
//                                             radius: 8,
//                                         }}
//                                         wrapperStyle={{ outline: "none" }}
//                                     />
//                                     <CartesianGrid
//                                         vertical={false}
//                                         stroke="#dce5ef"
//                                         strokeDasharray="0"
//                                     />

//                                     <XAxis
//                                         dataKey="zone"
//                                         axisLine={false}
//                                         tickLine={false}
//                                         tick={{
//                                             fill: "#17234D",
//                                             fontSize: 13,
//                                             fontWeight: 650,
//                                         }}
//                                     />

//                                     <YAxis
//                                         domain={[0, 250]}
//                                         ticks={[0, 50, 100, 150, 200, 250]}
//                                         axisLine={false}
//                                         tickLine={false}
//                                         tick={{
//                                             fill: "#63739B",
//                                             fontSize: 11,
//                                         }}
//                                         label={{
//                                             value: "Occupants",
//                                             angle: -90,
//                                             position: "insideLeft",
//                                             fill: "#63739B",
//                                             fontSize: 11,
//                                         }}
//                                     />

//                                     <Bar
//                                         dataKey="gents"
//                                         stackId="occupancy"
//                                         fill="#6652D9"
//                                     >
//                                         <LabelList
//                                             dataKey="gents"
//                                             position="center"
//                                             fill="#ffffff"
//                                             fontSize={12}
//                                             fontWeight={600}
//                                         />
//                                     </Bar>

//                                     <Bar
//                                         dataKey="ladies"
//                                         stackId="occupancy"
//                                         fill="#2CC398"
//                                         radius={[4, 4, 0, 0]}
//                                     >
//                                         <LabelList
//                                             dataKey="ladies"
//                                             position="center"
//                                             fill="#ffffff"
//                                             fontSize={12}
//                                             fontWeight={600}
//                                         />
//                                         <LabelList
//                                             dataKey="total"
//                                             position="top"
//                                             fill="#17234D"
//                                             fontSize={13}
//                                             fontWeight={700}
//                                         />
//                                     </Bar>
//                                 </BarChart>
//                             </ResponsiveContainer>
//                         </div>

//                         <div className="titan-location-legend">
//                             <div>
//                                 <span className="titan-gents-dot" />
//                                 <span>Gents</span>
//                             </div>
//                             <div>
//                                 <span className="titan-ladies-dot" />
//                                 <span>Ladies</span>
//                             </div>
//                         </div>
//                     </div>
//                 </section>

//                 {/* Summary - only two items */}
//                 <section className="titan-summary">
//                     <div className="titan-summary-item">
//                         <div className="titan-summary-icon orange">
//                             <UsersRound size={46} strokeWidth={1.6} />
//                         </div>
//                         <div>
//                             <span>Total Occupants</span>
//                             <strong>{bottomCards.totalOccupants ?? totalOccupants}</strong>
//                         </div>
//                     </div>

//                     <div className="titan-summary-divider" />

//                     <div className="titan-summary-item titan-overall">
//                         <div>
//                             <span>Overall Occupancy</span>
//                             <strong>{occupancy}%</strong>
//                         </div>

//                         <div className="titan-progress-ring">
//                             <svg width="55" height="55" viewBox="0 0 55 55">
//                                 <circle
//                                     cx="27.5"
//                                     cy="27.5"
//                                     r="21"
//                                     className="titan-ring-bg"
//                                 />
//                                 <circle
//                                     cx="27.5"
//                                     cy="27.5"
//                                     r="21"
//                                     className="titan-ring-progress"
//                                     strokeDasharray={ringCircumference}
//                                     strokeDashoffset={ringOffset}
//                                 />
//                             </svg>
//                         </div>
//                     </div>
//                 </section>

//                 {/* Footer */}
//                 <footer className="titan-footer">
//                     <div className="titan-footer-right">
//                         <span className="titan-footer-copyright">
//                             Copyright © {new Date().getFullYear()} All Rights Reserved
//                         </span>
//                         <img
//                             src={footerlogo}
//                             alt="Delopt"
//                             className="footer_logo"
//                         />
//                     </div>
//                 </footer>
//             </main>
//         </div>
//     );
// };

// export default TitanDashboard;


// import React, { useEffect, useState, useCallback, memo } from "react";
// import {
//     PieChart,
//     Pie,
//     Cell,
//     ResponsiveContainer,
//     BarChart,
//     Bar,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     LabelList,
//     Tooltip,
// } from "recharts";
// import {
//     Building2,
//     UsersRound,
//     CalendarDays,
//     Clock3,
// } from "lucide-react";
// import { titanDashboardData } from "./titanDashboardData";
// import "./TitanDashboard.css";

// import titanLogo2 from "../../Components/Assets/Titan/titan-logo2.avif";
// import factoryImage from "../../Components/Assets/Titan/factory-image.jpeg";
// import footerlogo from "../../Components/Assets/footer-logo.svg";

// const TITAN_API_URL =
//     import.meta.env.VITE_TITAN_DASHBOARD_API_URL || "/api/titanDashboard";

// const distributionColors = [
//     "#6652D9",
//     "#9A65D6",
//     "#FFB23E",
//     "#20BFAF",
//     "#FF7959",
// ];

// const DonutTooltip = ({ active, payload }) => {
//     if (!active || !payload?.length) return null;

//     const item = payload[0]?.payload || {};

//     const value = Number(item?.value || 0);

//     const percentage =
//         item?.percentage !== undefined
//             ? String(item.percentage).replace("%", "")
//             : "";

//     return (
//         <div className="titan-donut-tooltip">
//             <div className="titan-tooltip-title">
//                 {item?.zone || "Location"}
//             </div>

//             <div className="titan-tooltip-row">
//                 <span>Occupants</span>
//                 <strong>{value}</strong>
//             </div>

//             <div className="titan-tooltip-row">
//                 <span>Share</span>
//                 <strong>{percentage}%</strong>
//             </div>
//         </div>
//     );
// };

// const LocationTooltip = ({ active, payload, label }) => {
//     if (!active || !payload?.length) return null;

//     const gents = Number(payload.find((item) => item.dataKey === "gents")?.value || 0);
//     const ladies = Number(payload.find((item) => item.dataKey === "ladies")?.value || 0);
//     const total = gents + ladies;

//     return (
//         <div className="titan-chart-tooltip">
//             <div className="titan-tooltip-title">{label || "Location"}</div>

//             <div className="titan-tooltip-row">
//                 <span>
//                     <i className="titan-tooltip-dot titan-tooltip-gents" />
//                     Gents
//                 </span>
//                 <strong>{gents}</strong>
//             </div>

//             <div className="titan-tooltip-row">
//                 <span>
//                     <i className="titan-tooltip-dot titan-tooltip-ladies" />
//                     Ladies
//                 </span>
//                 <strong>{ladies}</strong>
//             </div>

//             <div className="titan-tooltip-total">
//                 Total <strong>{total}</strong>
//             </div>
//         </div>
//     );
// };

// const TitanDashboardData = memo(function TitanDashboardData({ data }) {
//     const topCards = data?.topCards || {};
//     const occupancyDistribution = data?.occupancyDistribution || {};
//     const distributionData = Array.isArray(occupancyDistribution?.data)
//         ? occupancyDistribution.data
//         : [];
//     const occupancyByLocation = Array.isArray(data?.occupancyByLocation)
//         ? data.occupancyByLocation
//         : [];
//     const bottomCards = data?.bottomCards || {};

//     const totalOccupants = Number(
//         occupancyDistribution?.totalOccupants ??
//         bottomCards?.totalOccupants ??
//         0
//     );

//     const getPercentage = (value) => {
//         if (!totalOccupants) return 0;
//         return Math.round((Number(value || 0) / totalOccupants) * 100);
//     };

//     const distributionChartData = distributionData.map((item) => ({
//         ...item,
//         percentage:
//             item?.percentage !== undefined && item?.percentage !== null
//                 ? String(item.percentage).includes("%")
//                     ? String(item.percentage)
//                     : `${item.percentage}%`
//                 : `${getPercentage(item?.value)}%`,
//     }));

//     const occupancy = Math.max(
//         0,
//         Math.min(100, Number(bottomCards?.overallOccupancy || 0))
//     );

//     const ringCircumference = 131.95;
//     const ringOffset =
//         ringCircumference - (ringCircumference * occupancy) / 100;

//     return (
//         <>
//             {/* KPI Cards */}
//             <section className="titan-kpi-grid">
//                 <div className="titan-kpi-card titan-kpi-new">
//                     <div className="titan-kpi-icon">
//                         <Building2 size={25} strokeWidth={1.7} />
//                     </div>
//                     <div className="titan-kpi-info">
//                         <span className="titan-kpi-label">New Building</span>
//                         <strong className="titan-kpi-value">
//                             {topCards.newBuilding ?? 0}
//                         </strong>
//                         <span className="titan-kpi-status">Current occupancy</span>
//                     </div>
//                 </div>

//                 <div className="titan-kpi-card titan-kpi-old">
//                     <div className="titan-kpi-icon">
//                         <Building2 size={25} strokeWidth={1.7} />
//                     </div>
//                     <div className="titan-kpi-info">
//                         <span className="titan-kpi-label">Old Building</span>
//                         <strong className="titan-kpi-value">
//                             {topCards.oldBuilding ?? 0}
//                         </strong>
//                         <span className="titan-kpi-status">Current occupancy</span>
//                     </div>
//                 </div>

//                 <div className="titan-kpi-card titan-kpi-cbc">
//                     <div className="titan-kpi-icon">
//                         <Building2 size={25} strokeWidth={1.7} />
//                     </div>
//                     <div className="titan-kpi-info">
//                         <span className="titan-kpi-label">CBC</span>
//                         <strong className="titan-kpi-value">
//                             {topCards.cbc ?? 0}
//                         </strong>
//                         <span className="titan-kpi-status">Current occupancy</span>
//                     </div>
//                 </div>

//                 <div className="titan-kpi-card titan-kpi-warehouse">
//                     <div className="titan-kpi-icon">
//                         <Building2 size={25} strokeWidth={1.7} />
//                     </div>
//                     <div className="titan-kpi-info">
//                         <span className="titan-kpi-label">Warehouse</span>
//                         <strong className="titan-kpi-value">
//                             {topCards.warehouse ?? 0}
//                         </strong>
//                         <span className="titan-kpi-status">Current occupancy</span>
//                     </div>
//                 </div>
//             </section>

//             {/* Charts */}
//             <section className="titan-chart-grid">
//                 {/* Distribution */}
//                 <div className="titan-chart-card">
//                     <div className="titan-chart-heading">
//                         <div>
//                             <h2>Occupancy Distribution</h2>
//                             <p>Current occupant distribution by location</p>
//                         </div>
//                         <button className="titan-more-button" aria-label="More options">
//                             <span />
//                             <span />
//                             <span />
//                         </button>
//                     </div>

//                     <div className="titan-distribution-body">
//                         <div className="titan-donut-wrapper">
//                             <ResponsiveContainer width="100%" height="100%">
//                                 <PieChart>
//                                     <Tooltip
//                                         content={<DonutTooltip />}
//                                         cursor={false}
//                                         offset={15}
//                                         wrapperStyle={{
//                                             outline: "none",
//                                             zIndex: 1000,
//                                             pointerEvents: "none",
//                                         }}
//                                     />
//                                     <Pie
//                                         data={distributionChartData}
//                                         dataKey="value"
//                                         nameKey="zone"
//                                         cx="50%"
//                                         cy="50%"
//                                         innerRadius="42%"
//                                         outerRadius="78%"
//                                         paddingAngle={0}
//                                         stroke="#ffffff"
//                                         strokeWidth={4}
//                                         labelLine={false}
//                                         label={({
//                                             cx,
//                                             cy,
//                                             midAngle,
//                                             innerRadius,
//                                             outerRadius,
//                                             index,
//                                         }) => {
//                                             const RADIAN = Math.PI / 180;
//                                             const radius =
//                                                 innerRadius +
//                                                 (outerRadius - innerRadius) * 0.5;
//                                             const x =
//                                                 cx + radius * Math.cos(-midAngle * RADIAN);
//                                             const y =
//                                                 cy + radius * Math.sin(-midAngle * RADIAN);
//                                             const item = distributionChartData[index];

//                                             return (
//                                                 <text
//                                                     x={x}
//                                                     y={y}
//                                                     fill="#ffffff"
//                                                     textAnchor="middle"
//                                                     dominantBaseline="central"
//                                                     fontSize={16}
//                                                     fontWeight={700}
//                                                 >
//                                                     {item?.percentage}
//                                                 </text>
//                                             );
//                                         }}
//                                     >
//                                         {distributionChartData.map((item, index) => (
//                                             <Cell
//                                                 key={`distribution-${index}`}
//                                                 fill={
//                                                     distributionColors[
//                                                     index % distributionColors.length
//                                                     ]
//                                                 }
//                                             />
//                                         ))}
//                                     </Pie>
//                                 </PieChart>
//                             </ResponsiveContainer>

//                             <div className="titan-donut-center">
//                                 <strong>{totalOccupants}</strong>
//                                 <span>Total Occupants</span>
//                             </div>
//                         </div>

//                         <div className="titan-distribution-legend">
//                             {distributionData.map((item, index) => {
//                                 const percentage = getPercentage(item?.value);

//                                 return (
//                                     <div
//                                         className="titan-distribution-item"
//                                         key={`${item?.zone}-${index}`}
//                                     >
//                                         <span
//                                             className="titan-distribution-dot"
//                                             style={{
//                                                 backgroundColor:
//                                                     distributionColors[
//                                                     index % distributionColors.length
//                                                     ],
//                                             }}
//                                         />
//                                         <span className="titan-distribution-zone">
//                                             {item?.zone}
//                                         </span>
//                                         <span className="titan-distribution-percent">
//                                             ({percentage}%)
//                                         </span>
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Location */}
//                 <div className="titan-chart-card">
//                     <div className="titan-chart-heading">
//                         <div>
//                             <h2>
//                                 Occupancy by Location{" "}
//                                 <span>(Gents / Ladies)</span>
//                             </h2>
//                             <p>Occupancy count across all locations</p>
//                         </div>
//                         <button className="titan-more-button" aria-label="More options">
//                             <span />
//                             <span />
//                             <span />
//                         </button>
//                     </div>

//                     <div className="titan-location-chart">
//                         <ResponsiveContainer width="100%" height="100%">
//                             <BarChart
//                                 data={occupancyByLocation}
//                                 margin={{
//                                     top: 28,
//                                     right: 10,
//                                     left: 10,
//                                     bottom: 10,
//                                 }}
//                                 barCategoryGap="30%"
//                             >
//                                 <Tooltip
//                                     content={<LocationTooltip />}
//                                     cursor={{
//                                         fill: "rgba(83, 103, 143, 0.045)",
//                                         radius: 8,
//                                     }}
//                                     wrapperStyle={{ outline: "none" }}
//                                 />
//                                 <CartesianGrid
//                                     vertical={false}
//                                     stroke="#dce5ef"
//                                     strokeDasharray="0"
//                                 />

//                                 <XAxis
//                                     dataKey="zone"
//                                     axisLine={false}
//                                     tickLine={false}
//                                     tick={{
//                                         fill: "#17234D",
//                                         fontSize: 13,
//                                         fontWeight: 650,
//                                     }}
//                                 />

//                                 <YAxis
//                                     domain={[0, 250]}
//                                     ticks={[0, 50, 100, 150, 200, 250]}
//                                     axisLine={false}
//                                     tickLine={false}
//                                     tick={{
//                                         fill: "#63739B",
//                                         fontSize: 11,
//                                     }}
//                                     label={{
//                                         value: "Occupants",
//                                         angle: -90,
//                                         position: "insideLeft",
//                                         fill: "#63739B",
//                                         fontSize: 11,
//                                     }}
//                                 />

//                                 <Bar
//                                     dataKey="gents"
//                                     stackId="occupancy"
//                                     fill="#6652D9"
//                                 >
//                                     <LabelList
//                                         dataKey="gents"
//                                         position="center"
//                                         fill="#ffffff"
//                                         fontSize={12}
//                                         fontWeight={600}
//                                     />
//                                 </Bar>

//                                 <Bar
//                                     dataKey="ladies"
//                                     stackId="occupancy"
//                                     fill="#2CC398"
//                                     radius={[4, 4, 0, 0]}
//                                 >
//                                     <LabelList
//                                         dataKey="ladies"
//                                         position="center"
//                                         fill="#ffffff"
//                                         fontSize={12}
//                                         fontWeight={600}
//                                     />
//                                     <LabelList
//                                         dataKey="total"
//                                         position="top"
//                                         fill="#17234D"
//                                         fontSize={13}
//                                         fontWeight={700}
//                                     />
//                                 </Bar>
//                             </BarChart>
//                         </ResponsiveContainer>
//                     </div>

//                     <div className="titan-location-legend">
//                         <div>
//                             <span className="titan-gents-dot" />
//                             <span>Gents</span>
//                         </div>
//                         <div>
//                             <span className="titan-ladies-dot" />
//                             <span>Ladies</span>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* Summary - only two items */}
//             <section className="titan-summary">
//                 <div className="titan-summary-item">
//                     <div className="titan-summary-icon orange">
//                         <UsersRound size={46} strokeWidth={1.6} />
//                     </div>
//                     <div>
//                         <span>Total Occupants</span>
//                         <strong>{bottomCards.totalOccupants ?? totalOccupants}</strong>
//                     </div>
//                 </div>

//                 <div className="titan-summary-divider" />

//                 <div className="titan-summary-item titan-overall">
//                     <div>
//                         <span>Overall Occupancy</span>
//                         <strong>{occupancy}%</strong>
//                     </div>

//                     <div className="titan-progress-ring">
//                         <svg width="55" height="55" viewBox="0 0 55 55">
//                             <circle
//                                 cx="27.5"
//                                 cy="27.5"
//                                 r="21"
//                                 className="titan-ring-bg"
//                             />
//                             <circle
//                                 cx="27.5"
//                                 cy="27.5"
//                                 r="21"
//                                 className="titan-ring-progress"
//                                 strokeDasharray={ringCircumference}
//                                 strokeDashoffset={ringOffset}
//                             />
//                         </svg>
//                     </div>
//                 </div>
//             </section>


//         </>
//     );
// });

// const TitanDashboard = () => {
//     const [dashboardData, setDashboardData] = useState(null);
//     const [currentDateTime, setCurrentDateTime] = useState(new Date());
//     const [apiError, setApiError] = useState("");

//     // Fetch dashboard data immediately and refresh it every 15 seconds.
//     const fetchDashboardData = useCallback(async (signal) => {
//         try {
//             const response = await fetch(TITAN_API_URL, {
//                 method: "GET",
//                 headers: {
//                     Accept: "application/json",
//                 },
//                 signal,
//             });

//             if (!response.ok) {
//                 throw new Error(`API request failed: ${response.status}`);
//             }

//             const result = await response.json();

//             if (result?.success !== true) {
//                 throw new Error(
//                     result?.message || "API returned an unsuccessful response"
//                 );
//             }

//             setDashboardData(result);
//             setApiError("");
//         } catch (error) {
//             if (error?.name === "AbortError") return;

//             console.error("Titan Dashboard API error:", error);
//             setApiError("Unable to refresh dashboard data");
//         }
//     }, []);

//     // Dashboard data: API call every 15 seconds.
//     useEffect(() => {
//         const controller = new AbortController();

//         fetchDashboardData(controller.signal);

//         const refreshTimer = setInterval(() => {
//             fetchDashboardData(controller.signal);
//         }, 15000);

//         return () => {
//             controller.abort();
//             clearInterval(refreshTimer);
//         };
//     }, [fetchDashboardData]);

//     // Clock: update only the date/time every second.
//     useEffect(() => {
//         const clockTimer = setInterval(() => {
//             setCurrentDateTime(new Date());
//         }, 1000);

//         return () => clearInterval(clockTimer);
//     }, []);

//     // const data = dashboardData?.data || {};
//     const data = titanDashboardData?.data || {};
//     // titanDashboardData
//     const formattedDate = new Intl.DateTimeFormat("en-IN", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//         timeZone: "Asia/Kolkata",
//     }).format(currentDateTime);

//     const formattedTime = new Intl.DateTimeFormat("en-IN", {
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//         hour12: true,
//         timeZone: "Asia/Kolkata",
//     }).format(currentDateTime);

//     return (
//         <div className="titan-dashboard">
//             <div className="titan-background">
//                 <img
//                     src={factoryImage}
//                     alt=""
//                     className="titan-factory-watermark"
//                 />
//             </div>

//             <main className="titan-dashboard-content">
//                 {/* Header */}
//                 <header className="titan-header">
//                     <div className="titan-header-left">
//                         <img
//                             src={titanLogo2}
//                             alt="Tanishq"
//                             className="titan-header-logo"
//                         />

//                         <div className="titan-title-block">
//                             <h1>Factory Occupancy Overview</h1>
//                             <p>Live occupancy status across all locations</p>
//                         </div>
//                     </div>

//                     <div className="titan-header-right">
//                         <div className="titan-live">
//                             <span className="titan-live-dot" />
//                             <span>LIVE</span>
//                         </div>

//                         <span className="titan-header-line" />

//                         <div className="titan-header-meta">
//                             <CalendarDays size={15} strokeWidth={1.8} />
//                             <span>{formattedDate}</span>
//                         </div>

//                         <span className="titan-header-line" />

//                         <div className="titan-header-meta">
//                             <Clock3 size={15} strokeWidth={1.8} />
//                             <span>{formattedTime}</span>
//                         </div>
//                     </div>
//                 </header>


//                 {/* {apiError && (
//                     <div className="titan-api-status" role="status">
//                         {apiError}
//                     </div>
//                 )} */}

//                 <TitanDashboardData data={data} />

//                 {/* Footer */}
//                 <footer className="titan-footer">
//                     <div className="titan-footer-right">
//                         <span className="titan-footer-copyright">
//                             Copyright © {new Date().getFullYear()} All Rights Reserved
//                         </span>
//                         <img
//                             src={footerlogo}
//                             alt="Delopt"
//                             className="footer_logo"
//                         />
//                     </div>
//                 </footer>
//             </main>
//         </div>
//     );
// };

// export default TitanDashboard;