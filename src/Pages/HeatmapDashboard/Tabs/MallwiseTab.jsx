// import React, {
//   useEffect,
//   useRef,
//   useState,
// } from "react";

// import simpleheat from "simpleheat";

// import "../Styles/mallwiseTab.css";

// import { IoMdHome } from "react-icons/io";
// import {
//   FiHome,
//   FiGrid,
// } from "react-icons/fi";
// import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
// import { MdOutlineDashboardCustomize } from "react-icons/md";
// import HeatmapStatsCard
//   from "../Components/HeatmapStatsCard";

// import {
//   FiUsers,
//   FiLogIn,
//   FiClock,
//   FiActivity,
//   FiAlertCircle,
// } from "react-icons/fi";
// import { mallsData } from "../data/MallsMockData";


// /* =========================================================
//    HELPERS
// ========================================================= */

// const MAX_OCCUPANCY = 2000

// function getIntensity(count) {

//   const MIN = 100;
//   const MAX = 2000;

//   const normalized =
//     (
//       Math.log(count) -
//       Math.log(MIN)
//     ) /
//     (
//       Math.log(MAX) -
//       Math.log(MIN)
//     );

//   return Math.max(
//     0.08,
//     Math.min(normalized, 1)
//   );
// }

// function toCanvasXY(
//   imgX,
//   imgY,
//   imageH,
//   zoom
// ) {
//   return {
//     cx: (imageH - imgY) * zoom,
//     cy: imgX * zoom,
//   };
// }

// /* =========================================================
//    COMPONENT
// ========================================================= */

// export default function MallwiseTab({ filterDate, appliedFilters }) {

//   const [zoom, setZoom] =
//     useState(1);

//   const [gradientType, setGradientType] =
//     useState("default");

//   const heatmapRef = useRef(null);

//   const [selectedMall, setSelectedMall] =
//     useState(mallsData[0]);

//   const [selectedFloor, setSelectedFloor] =
//     useState(mallsData[0].floors[0]);

//   const {
//     imageW,
//     imageH,
//   } = selectedFloor;

//   const canvasW = imageH * zoom;

//   const canvasH = imageW * zoom;

//   const imgStyle = {
//     width: imageW * zoom,
//     height: imageH * zoom,
//   };

//   /* =========================================================
//      HEATMAP
//   ========================================================= */

//   useEffect(() => {

//     if (!heatmapRef.current) return;

//     heatmapRef.current.innerHTML = "";

//     const canvas =
//       document.createElement("canvas");

//     canvas.width = canvasW;

//     canvas.height = canvasH;

//     heatmapRef.current.appendChild(canvas);

//     const heat = simpleheat(canvas);

//     const points = [];

//     selectedFloor.zones.forEach((zone) => {

//       const occCount =
//         zone.occupancy;

//       const occIntensity =
//         getIntensity(occCount);

//       /* =========================================
//          CENTER
//       ========================================= */

//       const centerX =
//         zone.points.reduce(
//           (sum, p) => sum + p.x,
//           0
//         ) / zone.points.length;

//       const centerY =
//         zone.points.reduce(
//           (sum, p) => sum + p.y,
//           0
//         ) / zone.points.length;

//       /* =========================================
//          AVG RADIUS
//       ========================================= */

//       const avgRadius =
//         zone.points.reduce((sum, p) => {

//           const dx = p.x - centerX;

//           const dy = p.y - centerY;

//           return (
//             sum +
//             Math.sqrt(dx * dx + dy * dy)
//           );

//         }, 0) / zone.points.length;

//       /* =========================================
//          DENSITY
//       ========================================= */

//       const zoneArea =
//         avgRadius * avgRadius;

//       /*
//         GLOBAL OCCUPANCY SCALE
//       */

//       const occupancyRatio =
//         occCount / MAX_OCCUPANCY;

//       /*
//         AREA NORMALIZATION
//         prevents tiny zones becoming fully red
//       */

//       const areaFactor =
//         Math.min(
//           Math.max(zoneArea / 90000, 0.55),
//           1.4
//         );

//       /*
//         FINAL DENSITY
//       */

//       const density =
//         Math.floor(
//           (
//             120 +
//             occupancyRatio * 900
//           ) * areaFactor
//         );
//       /* =========================================
//          GENERATE SMOOTH POINTS
//       ========================================= */

//       for (
//         let i = 0;
//         i < density;
//         i++
//       ) {

//         const angle =
//           Math.random() *
//           Math.PI *
//           2;

//         /*
//           CENTER HEAVY DISTRIBUTION
//         */

//         const radius =
//           Math.pow(
//             Math.random(),
//             0.65
//           ) *
//           avgRadius *
//           1.15;

//         const px =
//           centerX +
//           Math.cos(angle) * radius;

//         const py =
//           centerY +
//           Math.sin(angle) * radius;

//         /*
//           SOFT FALLOFF
//         */

//         /*
//         SMOOTH CENTER FALLOFF
//       */

//         const falloff =
//           Math.pow(
//             1 -
//             radius /
//             (avgRadius * 1.15),
//             1.8
//           );

//         /*
//         OCCUPANCY DRIVEN INTENSITY
//       */

//         /*
//         OCCUPANCY BASED INTENSITY
//       */

//         const occupancyRatio =
//           occCount / MAX_OCCUPANCY;

//         /*
//           LOW OCCUPANCY
//           should stay green/yellow
//         */

//         let baseIntensity =
//           0.12 +
//           occupancyRatio * 0.55;

//         /*
//           SMALL ZONES
//           should not overheat
//         */

//         if (occupancyRatio < 0.08) {
//           baseIntensity *= 0.45;
//         }
//         else if (occupancyRatio < 0.18) {
//           baseIntensity *= 0.65;
//         }
//         else if (occupancyRatio < 0.35) {
//           baseIntensity *= 0.82;
//         }

//         /*
//           FINAL INTENSITY
//         */

//         const intensity =
//           baseIntensity * falloff;

//         const { cx, cy } =
//           toCanvasXY(
//             px,
//             py,
//             selectedFloor.imageH,
//             zoom
//           );

//         points.push([
//           cx,
//           cy,
//           Math.max(
//             0.02,
//             intensity
//           ),
//         ]);
//       }

//     });

//     heat.data(points);

//     /* =========================================
//        FIGMA STYLE GRADIENT
//     ========================================= */

//     heat.gradient(
//       gradientType === "purple"
//         ? {
//           0.08: "#5b5fff",
//           0.22: "#7d4dff",
//           0.42: "#b84dff",
//           0.62: "#ff6ad5",
//           0.82: "#ffc2f2",
//           1.0: "#ffffff",
//         }
//         : {

//           0.05: "#c7f3ff",

//           0.18: "#8be8ff",

//           0.38: "#8dffb2",

//           0.55: "#e8ff8d",

//           0.72: "#ffe08a",

//           0.86: "#ffb36b",

//           0.94: "#ff7b5c",

//           1.0: "#ff4d4d",
//         }

//     );

//     /* =========================================
//        SOFT BLENDING
//     ========================================= */

//     heat.radius(
//       zoom >= 1.5
//         ? 78
//         : zoom >= 1
//           ? 66
//           : 54,
//       48
//     );

//     /*
//       LOWER MAX
//       BETTER COLOR TRANSITION
//     */

//     /*
//     BETTER COLOR SEPARATION
//   */

//     heat.max(1);

//     /*
//       SOFT TRANSPARENCY
//     */

//     heat.draw(0.04);

//   }, [
//     selectedFloor,
//     zoom,
//     gradientType,
//     canvasW,
//     canvasH,
//   ]);

//   /* =========================================================
//      LABELS
//   ========================================================= */

//   const renderLabels = () => {

//     return selectedFloor.zones.map(
//       (zone) => {

//         const centerX =
//           zone.points.reduce(
//             (sum, p) =>
//               sum + p.x,
//             0
//           ) / zone.points.length;

//         const centerY =
//           zone.points.reduce(
//             (sum, p) =>
//               sum + p.y,
//             0
//           ) / zone.points.length;

//         const {
//           cx,
//           cy,
//         } = toCanvasXY(
//           centerX,
//           centerY,
//           imageH,
//           zoom
//         );

//         return (
//           <div
//             key={zone.zoneId}
//             className="zone-label"
//             style={{
//               left: cx,
//               top: cy,
//             }}
//           >
//             <h4>
//               {zone.zoneName}
//             </h4>

//             <p>
//               {zone.occupancy.toLocaleString()}
//             </p>
//           </div>
//         );
//       }
//     );
//   };

//   useEffect(() => {
//     console.log("Mall Filter Date:", filterDate);

//     // API CALL HERE

//   }, [filterDate]);

//   /* =========================================================
//      JSX
//   ========================================================= */

//   return (
//     <div className="mallwise-layout">
//       {/* ==================== LEFT PANEL ==================== */}
//       <div className="left-panel">

//         <div className="filter-card">
//           <div className="field-group">
//             <label>Mall</label>
//             <select
//               value={selectedMall.mallId}
//               onChange={(e) => {
//                 const mall = mallsData.find((m) => m.mallId === Number(e.target.value));
//                 setSelectedMall(mall);
//                 setSelectedFloor(mall.floors[0]);
//               }}
//             >
//               {mallsData.map((m) => (
//                 <option key={m.mallId} value={m.mallId}>{m.mallName}</option>
//               ))}
//             </select>
//           </div>

//           <div className="field-group">
//             <label>Floor</label>
//             <div className="floor-list">
//               {selectedMall.floors.map((floor) => (
//                 <div
//                   key={floor.floorId}
//                   className={`floor-item ${selectedFloor.floorId === floor.floorId ? "active-floor" : ""}`}
//                   onClick={() => setSelectedFloor(floor)}
//                 >
//                   <span>{floor.floorName}</span>
//                   <span className="floor-badge">{floor.visitors.toLocaleString()}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Stats Card */}
        
//         <HeatmapStatsCard
//           value={selectedFloor.visitors.toLocaleString()}
//           title="Total Visitors"
//           subText="Yesterday"
//           trend="↗ 4.2%"
//           trendType="positive"
//           icon={<FiUsers />}
//           iconClass="blue"
//         />

//         <HeatmapStatsCard
//           value="1,631"
//           title="Visitors Inside"
//           subText="Last hour"
//           trend="↙ 6.5%"
//           trendType="negative"
//           icon={<FiLogIn />}
//           iconClass="purple"
//         />

//         <HeatmapStatsCard
//           value="12:30"
//           title="Peak Hour"
//           subText="1,091 Visitors"
//           icon={<FiClock />}
//           iconClass="violet"
//         />

//         <HeatmapStatsCard
//           value="29min"
//           title="Avg Dwell Time"
//           subText="Yesterday"
//           trend="↙ 7.5%"
//           trendType="negative"
//           icon={<FiActivity />}
//           iconClass="pink"
//         />

//         <HeatmapStatsCard
//           value="3"
//           title="Active Alerts"
//           subText="1 New alert"
//           icon={<FiAlertCircle />}
//           iconClass="red"
//         />

//       </div>

//       {/* ============================Right Panel ========================================*/}

//       <div className="right-panel">
//         <div className="heatmap-card">
//           <div className="heatmap-topbar">
//             <div className="breadcrumb">
//               <span className="breadcrumb-item">
//                 <HiOutlineBuildingOffice2 size={18} className="breadcrumb-icon" />
//                 {selectedMall.mallName}
//               </span>
//               <span className="breadcrumb-item">
//                 <MdOutlineDashboardCustomize size={18} className="breadcrumb-icon" />
//                 {selectedFloor.floorName}
//               </span>
//             </div>
//           </div>


//           <div className="legend-section">
//             <span className="legend-label">
//               Occupancy
//             </span>
//             <div
//               className={`legend-bar ${gradientType}`}
//             />
//             <div className="legend-range">
//               <span>0%</span>
//               <span>100%</span>
//             </div>

//           </div>

//           {/* MAP */}

//           <div className="map-wrapper">
//             <div className="map-scroll">
//               <div
//                 className="map-inner"
//                 style={{
//                   width: canvasW,
//                   height: canvasH,
//                 }}
//               >
//                 {/* FLOOR IMAGE */}
//                 <img
//                   src={
//                     selectedFloor.floorImage
//                   }
//                   alt=""
//                   className="floor-image"
//                   style={imgStyle}
//                 />
//                 {/* HEATMAP */}
//                 <div
//                   ref={heatmapRef}
//                   className="heatmap-layer"
//                 />
//                 {/* LABELS */}
//                 {renderLabels()}
//               </div>
//             </div>
//             {/* TOOLS */}
//             <div className="map-tools">
//               {/* ZOOM IN */}
//               <button
//                 onClick={() =>
//                   setZoom((p) =>
//                     +(
//                       p + 0.1
//                     ).toFixed(1)
//                   )
//                 }
//               >
//                 +
//               </button>
//               {/* ZOOM OUT */}
//               <button
//                 onClick={() =>
//                   setZoom((p) =>
//                     +Math.max(
//                       0.3,
//                       p - 0.1
//                     ).toFixed(1)
//                   )
//                 }
//               >
//                 −
//               </button>
//               {/* DEFAULT */}
//               <div
//                 className="gradient-tool first"
//                 onClick={() =>
//                   setGradientType(
//                     "default"
//                   )
//                 }
//               />
//               {/* PURPLE */}
//               <div
//                 className="gradient-tool second"
//                 onClick={() =>
//                   setGradientType(
//                     "purple"
//                   )
//                 }
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, {
  useEffect,
  useState,
} from "react";

import "../Styles/mallwiseTab.css";

import {
  mallsData,
} from "../data/MallsMockData";

import HeatmapSidebar
  from "../CommonComponents/HeatmapSidebar";

import HeatmapHeader
  from "../CommonComponents/HeatmapHeader";

import HeatmapLegend
  from "../CommonComponents/HeatmapLegend";

import HeatmapCanvas
  from "../CommonComponents/HeatmapCanvas";

import HeatmapStatsCard
  from "../CommonComponents/HeatmapStatsCard";

import useHeatmap
  from "../hooks/useHeatmap";

import {

  FiUsers,
  FiLogIn,
  FiClock,
  FiActivity,
  FiAlertCircle,

} from "react-icons/fi";

const MallwiseTab = ({
  filterDate,
  appliedFilters,
}) => {

  /* =====================================================
     STATES
  ===================================================== */

  const [zoom, setZoom] =
    useState(1);

  const [gradientType,
    setGradientType] =
    useState("default");

  const [selectedMall,
    setSelectedMall] =
    useState(
      mallsData[0]
    );

  const [selectedFloor,
    setSelectedFloor] =
    useState(
      mallsData[0]
        .floors[0]
    );

  /* =====================================================
     COMMON HEATMAP HOOK
  ===================================================== */

  const {
    zonesToRender,
  } = useHeatmap({

    mode: "mall",

    selectedFloor,

  });

  /* =====================================================
     FILTER DATE
  ===================================================== */

  useEffect(() => {

    console.log(
      "Mall Filter Date:",
      filterDate
    );

    console.log(
      "Applied Filters:",
      appliedFilters
    );

    // API CALL HERE

  }, [
    filterDate,
    appliedFilters,
  ]);

  /* =====================================================
     JSX
  ===================================================== */

  return (

    <div className="mallwise-layout">

      {/* =========================================
              LEFT SIDE
          ========================================= */}

      <HeatmapSidebar

        mode="mall"

        mallsData={mallsData}

        selectedMall={selectedMall}
        setSelectedMall={setSelectedMall}

        selectedFloor={selectedFloor}
        setSelectedFloor={setSelectedFloor}

      >

        {/* =====================================
                  STATS CARDS
              ===================================== */}

        <HeatmapStatsCard

          value={selectedFloor.visitors.toLocaleString()}

          title="Total Visitors"

          subText="Yesterday"

          trend="↗ 4.2%"

          trendType="positive"

          icon={<FiUsers />}

          iconClass="blue"

        />

        <HeatmapStatsCard

          value="1,631"

          title="Visitors Inside"

          subText="Last hour"

          trend="↙ 6.5%"

          trendType="negative"

          icon={<FiLogIn />}

          iconClass="purple"

        />

        <HeatmapStatsCard

          value="12:30"

          title="Peak Hour"

          subText="1,091 Visitors"

          icon={<FiClock />}

          iconClass="violet"

        />

        <HeatmapStatsCard

          value="29min"

          title="Avg Dwell Time"

          subText="Yesterday"

          trend="↙ 7.5%"

          trendType="negative"

          icon={<FiActivity />}

          iconClass="pink"

        />

        <HeatmapStatsCard

          value="3"

          title="Active Alerts"

          subText="1 New alert"

          icon={<FiAlertCircle />}

          iconClass="red"

        />

      </HeatmapSidebar>

      {/* =========================================
              RIGHT SIDE
          ========================================= */}

      <div className="right-panel">

        <div className="heatmap-card">

          {/* HEADER */}

          <HeatmapHeader

            mallName={
              selectedMall.mallName
            }

            floorName={
              selectedFloor.floorName
            }

          />

          {/* LEGEND */}

          <HeatmapLegend

            gradientType={
              gradientType
            }

          />

          {/* HEATMAP */}

          <HeatmapCanvas

            selectedFloor={
              selectedFloor
            }

            zonesToRender={
              zonesToRender
            }

            zoom={zoom}
            setZoom={setZoom}

            gradientType={
              gradientType
            }

            setGradientType={
              setGradientType
            }

          />

        </div>

      </div>

    </div>

  );

};

export default MallwiseTab;