import React, { useEffect, useRef, useState } from "react";

import simpleheat from "simpleheat";
import "../Styles/mallwiseTab.css";
import { getImageUrl } from "../../Settings_Heatmap/components/Heatmaps/utils/imageHelper";


/* =========================================================
   HELPERS
========================================================= */

function toCanvasXY(imgX, imgY, imageH, zoom) {
  return {
    cx: (imageH - imgY) * zoom,
    cy: imgX * zoom,
  };
}
function isPointInPolygon(x, y, polygon) {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;

    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}
/* =========================================================
   COMPONENT
========================================================= */

const HeatmapCanvas = ({
  selectedFloor,
  zonesToRender = [],
  selectedZone,
  zoom,
  setZoom,
  gradientType,
  setGradientType,
}) => {
  console.log(zonesToRender);


  const heatmapRef = useRef(null);
  const scrollRef = useRef(null);
  const mapInnerRef = useRef(null);
  const { imageW, imageH } = selectedFloor;
  const canvasW = imageH * zoom;
  const canvasH = imageW * zoom;
  const imgStyle = {
    width: imageW * zoom,
    height: imageH * zoom,
  };

  const [hoveredZone, setHoveredZone] = useState(null);
  // const [clickedZone, setClickedZone] = useState(null);
  const [clickedZone, setClickedZone] = useState(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  /* =====================================================
       HEATMAP
    ===================================================== */

  useEffect(() => {
    if (!heatmapRef.current) return;

    heatmapRef.current.innerHTML = "";
    const canvas = document.createElement("canvas");
    canvas.width = canvasW;
    canvas.height = canvasH;
    heatmapRef.current.appendChild(canvas);
    const heat = simpleheat(canvas);
    const points = [];
    zonesToRender.forEach((zone) => {

      const occupancyPercentage = zone.occupancyPercentage ?? 0;
      const occupancy = zone.occupancy ?? 0;

      // No occupancy -> No heatmap
      if (occupancy <= 0 || occupancyPercentage <= 0) {
        return;
      }

      const occupancyRatio = occupancyPercentage / 100;

      /* =====================================
                   CENTER
          ===================================== */

      const centerX =
        zone.points.reduce((sum, p) => sum + p.x, 0) / zone.points.length;

      const centerY =
        zone.points.reduce((sum, p) => sum + p.y, 0) / zone.points.length;

      /* =====================================
                   AVG RADIUS
                ===================================== */

      const avgRadius =
        zone.points.reduce((sum, p) => {
          const dx = p.x - centerX;

          const dy = p.y - centerY;

          return sum + Math.sqrt(dx * dx + dy * dy);
        }, 0) / zone.points.length;

      /* =====================================
                   AREA FACTOR
                ===================================== */

      const zoneArea = avgRadius * avgRadius;

      const areaFactor = Math.min(Math.max(zoneArea / 90000, 0.55), 1.4);

      /* =====================================
                   DENSITY
         ===================================== */

      // const density = Math.floor(180 * areaFactor);
      // const density = Math.floor(80 * areaFactor);
      //   const density = Math.max(
      //     5,
      //     Math.floor((occupancyPercentage / 100) * 120 * areaFactor)
      // );
      const density = Math.max(
        15,
        Math.floor((occupancy / 5) * areaFactor)
      );
      const xs = zone.points.map(p => p.x);
      const ys = zone.points.map(p => p.y);

      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      let created = 0;

      while (created < density) {

        const px = minX + Math.random() * (maxX - minX);

        const py = minY + Math.random() * (maxY - minY);

        if (!isPointInPolygon(px, py, zone.points)) {
          continue;
        }
        // const intensity = Math.max(
        //   0.03,
        //   Math.min(1, occupancyPercentage / 100)
        // );
        const intensity = Math.max(
          0.05,
          Math.min(0.75, occupancyPercentage / 100)
        );
        const { cx, cy } = toCanvasXY(
          px,
          py,
          selectedFloor.imageH,
          zoom
        );

        points.push([cx, cy, intensity]);

        created++;
      }
    });

    heat.data(points);

    /* =====================================
           GRADIENT
        ===================================== */

    heat.gradient(
      gradientType === "purple"
        ? {
          0.05: "#f7e8ff",
          0.18: "#efccff",
          0.35: "#df9fff",
          0.52: "#c86dff",
          0.7: "#a63dff",
          0.85: "#8d5be2",
          1.0: "#6525be",
        }
        : {
          0.0: "rgba(0,0,255,0)",
          0.2: "#0095ff", // Blue
          0.4: "#00d84a", // Green
          0.6: "#ffe600", // Yellow
          0.8: "#ff9800", // Orange
          1.0: "#ff0000", // Red
        },
    );

    /* =====================================
           RADIUS
        ===================================== */

    heat.radius(zoom >= 1.5 ? 60 : zoom >= 1 ? 48 : 40, 35);
    heat.max(1);
    heat.draw(0.04);
  }, [selectedFloor, zonesToRender, zoom, gradientType, canvasW, canvasH]);

  /* =====================================================
       LABELS
    ===================================================== */

  const getBorderColor = (value) => {
    if (value <= 20) return "#0095ff";
    if (value <= 40) return "#00d84a";
    if (value <= 60) return "#ffe600";
    if (value <= 80) return "#ff9800";
    return "#ff0000";
  };
  const renderZoneBorders = () => (
    <svg
      className="zone-border-layer"
      width={canvasW}
      height={canvasH}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 3,
      }}
    >
      {zonesToRender.map((zone) => {
        if (!zone.points?.length) return null;

        const polygon = zone.points
          .map((p) => {
            const { cx, cy } = toCanvasXY(
              p.x,
              p.y,
              selectedFloor.imageH,
              zoom
            );
            return `${cx},${cy}`;
          })
          .join(" ");
        const zoneFill = "rgba(255,255,255,0.02)";
        const zoneStroke = "#0d6efd"; // Blue
        return (

          <polygon
            key={zone.zoneId}
            points={polygon}
            fill={zoneFill}
            stroke={zoneStroke}
            strokeWidth={
              selectedZone?.zoneId === zone.zoneId
                ? 5
                : hoveredZone?.zoneId === zone.zoneId
                  ? 5
                  : 4
            }
            vectorEffect="non-scaling-stroke"
            pointerEvents="all"
            style={{ cursor: "pointer" }}
            onMouseEnter={(e) => {
              setHoveredZone(zone);

              const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();

              setPopupPos({
                x: e.clientX - rect.left + 15,
                y: e.clientY - rect.top + 15,
              });
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();

              setPopupPos({
                x: e.clientX - rect.left + 15,
                y: e.clientY - rect.top + 15,
              });
            }}
            onMouseLeave={() => {
              if (!clickedZone) setHoveredZone(null);
            }}
            onClick={(e) => {
              e.stopPropagation();
              setClickedZone(zone);

              const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();

              setPopupPos({
                x: e.clientX - rect.left + 15,
                y: e.clientY - rect.top + 15,
              });
            }}
          />
          // <polygon
          //   key={zone.zoneId}
          //   points={polygon}
          //   fill="rgba(255,255,255,0.02)"
          //   stroke={getBorderColor(zone.occupancyPercentage)}
          //   strokeWidth={2}
          //   strokeLinejoin="round"
          //   strokeLinecap="round"
          //   vectorEffect="non-scaling-stroke"
          // />
        );
      })}
    </svg>
  );
  const getStatusColor = (value) => {
    if (value <= 20) return "#0095ff"; // Blue
    if (value <= 40) return "#00d84a"; // Green
    if (value <= 60) return "#ffe600"; // Yellow
    if (value <= 80) return "#ff9800"; // Orange
    return "#ff0000";                  // Red
  };


  const renderLabels = () => {
    return zonesToRender.map((zone) => {
      const centerX =
        zone.points.reduce((sum, p) => sum + p.x, 0) / zone.points.length;
      const centerY =
        zone.points.reduce((sum, p) => sum + p.y, 0) / zone.points.length;

      const { cx, cy } = toCanvasXY(centerX, centerY, imageH, zoom);
      const occupancyPercentage = zone.occupancyPercentage ?? 0;
      const statusColor = getStatusColor(occupancyPercentage); // <-- here

      return (
        <div
          key={zone.zoneId}
          className="zone-card-v2"
          style={{ left: cx, top: cy, "--zone-color": statusColor }}
        >
          <div className="zone-card-v2-top">
            <span className="zone-card-v2-dot" />
            <span className="zone-card-v2-name">{zone.zoneName}</span>
          </div>
          <div className="zone-card-v2-value">
            {occupancyPercentage}
            <span className="zone-card-v2-pct">%</span>
          </div>
          <div className="zone-card-v2-bar-track">
            <div
              className="zone-card-v2-bar-fill"
              style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
            />
          </div>
        </div>
      );
    });
  };

  const focusZone = (zone) => {
    if (!zone?.points?.length || !scrollRef.current) return;

    const xs = zone.points.map(p => p.x);
    const ys = zone.points.map(p => p.y);

    const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;

    // Convert image coordinates to rotated canvas coordinates
    const { cx, cy } = toCanvasXY(
      centerX,
      centerY,
      selectedFloor.imageH,
      zoom
    );

    const scroll = scrollRef.current;

    scroll.scrollTo({
      left: Math.max(0, cx - scroll.clientWidth / 2),
      top: Math.max(0, cy - scroll.clientHeight / 2),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (zonesToRender.length > 0) {
      focusZone(zonesToRender[0]);
    }
  }, [selectedFloor, zonesToRender]);

  useEffect(() => {
    if (selectedZone) {
      focusZone(selectedZone);
    }
  }, [selectedZone]);

  // const renderLabels = () => {
  //   return zonesToRender.map((zone) => {
  //     const centerX =
  //       zone.points.reduce((sum, p) => sum + p.x, 0) / zone.points.length;

  //     const centerY =
  //       zone.points.reduce((sum, p) => sum + p.y, 0) / zone.points.length;

  //     const { cx, cy } = toCanvasXY(centerX, centerY, imageH, zoom);
  //     const occupancy = zone.occupancy ?? 0;

  //     const occupancyPercentage = zone.occupancyPercentage ?? 0;
  //     const getStatusColor = (value) => {
  //       if (value <= 20) return "#0095ff"; // Blue
  //       if (value <= 40) return "#00d84a"; // Green
  //       if (value <= 60) return "#ffe600"; // Yellow
  //       if (value <= 80) return "#ff9800"; // Orange
  //       return "#ff0000";                  // Red
  //     };
  //     return (
  //       <>
  //         <div
  //           className="zone-card-v2"
  //           style={{ left: cx, top: cy, "--zone-color": statusColor }}
  //         >
  //           <div className="zone-card-v2-top">
  //             <span className="zone-card-v2-dot" />
  //             <span className="zone-card-v2-name">{zone.zoneName}</span>
  //           </div>
  //           <div className="zone-card-v2-value">
  //             {occupancyPercentage}
  //             <span className="zone-card-v2-pct">%</span>
  //           </div>
  //           <div className="zone-card-v2-bar-track">
  //             <div
  //               className="zone-card-v2-bar-fill"
  //               style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
  //             />
  //           </div>
  //         </div>
  //       </>

  //     );
  //   });
  // };
  // <div
  //   key={zone.zoneId}
  //   className="zone-label"
  //   style={{ left: cx, top: cy }}
  // >
  //   <h4> {zone.zoneName} </h4>
  //   <p className="ZonePercentage">
  //     {/* {occupancy.toLocaleString()} */}
  //     {/* {" / "} */}
  //     {/* {capacity} */}
  //     {/* {" ("}{" "} */}
  //     {occupancyPercentage}
  //     {"%"}{" "}
  //   </p>
  // </div>
  /* =====================================================
       JSX
    ===================================================== */
  const activeZone = selectedZone || clickedZone || hoveredZone;
  return (
    <div
      className="map-wrapper"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setClickedZone(null);
          setHoveredZone(null);
        }
      }}
    >
      <div className="map-scroll" ref={scrollRef}>
        <div
          ref={mapInnerRef}
          className="map-inner"
          style={{
            width: canvasW,
            height: canvasH,
          }}
        >
          <img
            src={getImageUrl(selectedFloor.floorImage)}
            className="floor-image"
            style={imgStyle}
          />

          <div
            ref={heatmapRef}
            className="heatmap-layer"
            style={{ zIndex: 2 }}
          />

          {renderZoneBorders()}

          {renderLabels()}
          {
            (activeZone) && (
              <div
                className="zone-detail-popup-v2"
                style={{
                  left: popupPos.x,
                  top: popupPos.y,
                  "--zone-color": getStatusColor((activeZone).occupancyPercentage),
                }}
              >
                <div className="zdp-header">
                  <span className="zdp-dot" />
                  <span className="zdp-name">{(activeZone).zoneName}</span>
                </div>

                <div className="zdp-hero">
                  <span className="zdp-hero-value">
                    {(activeZone).occupancyPercentage}
                    <span className="zdp-hero-pct">%</span>
                  </span>
                  <span className="zdp-hero-label">occupancy</span>
                </div>

                <div className="zdp-bar-track">
                  <div
                    className="zdp-bar-fill"
                    style={{ width: `${Math.min((activeZone).occupancyPercentage, 100)}%` }}
                  />
                </div>

                <div className="zdp-divider" />

                <div className="zdp-row">
                  <span className="zdp-label">Visitors In</span>
                  <span className="zdp-value">{(activeZone).visitors}</span>
                </div>
                <div className="zdp-row">
                  <span className="zdp-label">Visitors Out</span>
                  <span className="zdp-value">{(activeZone).outCount}</span>
                </div>
                <div className="zdp-row">
                  <span className="zdp-label">Current Occupancy</span>
                  <span className="zdp-value">{(activeZone).occupancy}</span>
                </div>
              </div>
            )
          }
        </div>
      </div>

      {/* =====================================
               TOOLS
            ===================================== */}

      <div className="map-tools">
        {/* ZOOM IN */}
        <button onClick={() => setZoom((p) => +(p + 0.1).toFixed(1))}>+</button>
        {/* ZOOM OUT */}
        <button
          onClick={() => setZoom((p) => +Math.max(0.3, p - 0.1).toFixed(1))}
        >
          −
        </button>

        {/* DEFAULT */}

        <div
          className="gradient-tool first"
          onClick={() => setGradientType("default")}
        />

        {/* PURPLE */}

        <div
          className="gradient-tool second"
          onClick={() => setGradientType("purple")}
        />
      </div>
    </div>
  );
};

export default HeatmapCanvas;
