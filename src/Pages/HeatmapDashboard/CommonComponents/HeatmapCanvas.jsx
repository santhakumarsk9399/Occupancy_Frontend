import React, { useEffect, useRef, useState } from "react";
import simpleheat from "simpleheat";
import "../Styles/mallwiseTab.css";
import { getImageUrl } from "../../Settings_Heatmap/components/Heatmaps/utils/imageHelper";

/* =========================================================
   HELPERS
========================================================= */

function toCanvasXY(imgX, imgY, zoom) {
  return {
    cx: imgX * zoom,
    cy: imgY * zoom,
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
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

/* =========================================================
   POLYGON AREA
========================================================= */

function getPolygonArea(points) {
  if (!points || points.length < 3) return 0;

  let area = 0;

  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;

    area += points[i].x * points[j].y - points[j].x * points[i].y;
  }

  return Math.abs(area / 2);
}

/* =========================================================
   DISTRIBUTED HEATMAP POINT GENERATOR
========================================================= */

function generateDistributedPoints(zone, density, zoom, intensity) {
  if (!zone?.points?.length) return [];

  const xs = zone.points.map((p) => p.x);
  const ys = zone.points.map((p) => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const width = maxX - minX;
  const height = maxY - minY;

  if (width <= 0 || height <= 0) return [];

  /*
   * Instead of completely random points,
   * create a grid across the zone.
   *
   * This prevents large empty areas.
   */

  const totalCells = Math.max(density, 1);

  const aspectRatio = width / height;

  let columns = Math.ceil(Math.sqrt(totalCells * aspectRatio));

  let rows = Math.ceil(totalCells / columns);

  columns = Math.max(columns, 2);
  rows = Math.max(rows, 2);

  const cellWidth = width / columns;
  const cellHeight = height / rows;

  const points = [];

  /*
   * Add a little random movement to every grid point.
   * This keeps the heatmap natural instead of looking
   * like a perfect mathematical grid.
   */

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      if (points.length >= density) {
        break;
      }

      const baseX = minX + (col + 0.5) * cellWidth;

      const baseY = minY + (row + 0.5) * cellHeight;

      /*
       * Random jitter.
       * Keep it below 35% of cell size so points
       * don't move too far from their coverage area.
       */

      const jitterX = (Math.random() - 0.5) * cellWidth * 0.7;

      const jitterY = (Math.random() - 0.5) * cellHeight * 0.7;

      const px = baseX + jitterX;
      const py = baseY + jitterY;

      if (!isPointInPolygon(px, py, zone.points)) {
        continue;
      }

      const { cx, cy } = toCanvasXY(px, py, zoom);

      points.push([cx, cy, intensity]);
    }
  }

  /*
   * If polygon shape is irregular, some grid cells may fall
   * outside the polygon.
   *
   * Fill the remaining required points with random
   * points inside the polygon.
   */

  let attempts = 0;

  const maxAttempts = density * 20;

  while (points.length < density && attempts < maxAttempts) {
    attempts++;

    const px = minX + Math.random() * (maxX - minX);

    const py = minY + Math.random() * (maxY - minY);

    if (!isPointInPolygon(px, py, zone.points)) {
      continue;
    }

    const { cx, cy } = toCanvasXY(px, py, zoom);

    points.push([cx, cy, intensity]);
  }

  return points;
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
  const heatmapRef = useRef(null);
  const scrollRef = useRef(null);
  const mapInnerRef = useRef(null);

  const { imageW, imageH } = selectedFloor;

  const canvasW = imageW * zoom;
  const canvasH = imageH * zoom;

  const imgStyle = {
    width: imageW * zoom,
    height: imageH * zoom,
  };

  const [hoveredZone, setHoveredZone] = useState(null);

  const [clickedZone, setClickedZone] = useState(null);

  const [popupPos, setPopupPos] = useState({
    x: 0,
    y: 0,
  });

  /* =====================================================
     ZONE COLORS
  ===================================================== */

  const zoneColors = [
    "rgba(255, 99, 132, 0.18)",
    "rgba(54, 162, 235, 0.18)",
    "rgba(255, 206, 86, 0.18)",
    "rgba(75, 192, 192, 0.18)",
    "rgba(153, 102, 255, 0.18)",
    "rgba(255, 159, 64, 0.18)",
    "rgba(46, 204, 113, 0.18)",
    "rgba(231, 76, 60, 0.18)",
  ];

  /* =====================================================
     HEATMAP
  ===================================================== */

  useEffect(() => {
    if (!heatmapRef.current) return;

    heatmapRef.current.innerHTML = "";

    const mainCanvas = document.createElement("canvas");

    mainCanvas.width = canvasW;
    mainCanvas.height = canvasH;

    heatmapRef.current.appendChild(mainCanvas);

    const mainCtx = mainCanvas.getContext("2d");

    /* ==================================================
       1. ZONE BACKGROUND
    ================================================== */

    // zonesToRender.forEach(
    //   (zone, index) => {

    //     if (!zone.points?.length) {
    //       return;
    //     }

    //     mainCtx.save();

    //     mainCtx.beginPath();

    //     zone.points.forEach(
    //       (p, pointIndex) => {

    //         const {
    //           cx,
    //           cy,
    //         } = toCanvasXY(
    //           p.x,
    //           p.y,
    //           zoom
    //         );

    //         if (pointIndex === 0) {
    //           mainCtx.moveTo(
    //             cx,
    //             cy
    //           );
    //         } else {
    //           mainCtx.lineTo(
    //             cx,
    //             cy
    //           );
    //         }
    //       }
    //     );

    //     mainCtx.closePath();

    //     mainCtx.fillStyle =
    //       zoneColors[
    //       index %
    //       zoneColors.length
    //       ];

    //     mainCtx.fill();

    //     mainCtx.restore();
    //   }
    // );

    /* ==================================================
       2. HEATMAP
    ================================================== */

    zonesToRender.forEach((zone) => {
      const occupancyPercentage = Number(zone.occupancyPercentage ?? 0);

      const occupancy = Number(zone.occupancy ?? 0);

      /*
       * No occupancy = no heatmap
       */

      if (occupancy <= 0 || occupancyPercentage <= 0) {
        return;
      }

      if (!zone.points || zone.points.length < 3) {
        return;
      }

      /* ==============================================
           POLYGON AREA
        ============================================== */

      const polygonArea = getPolygonArea(zone.points);

      /*
       * ------------------------------------------------
       * HEATMAP DENSITY
       * ------------------------------------------------
       *
       * Previous:
       *
       * occupancy / 5
       *
       * This could produce too few points.
       *
       * New:
       * - Minimum number of points
       * - Area based points
       * - Occupancy based points
       * - Maximum cap
       *
       * This gives much better coverage.
       */

      const MIN_HEAT_POINTS = 25;
      const MAX_HEAT_POINTS = 180;

      /*
       * Larger zones automatically receive
       * more heatmap points.
       */

      const areaDensity = polygonArea / 8000;

      /*
       * Occupancy also contributes to the
       * number of visible hotspots.
       */

      const occupancyDensity = Math.max(0, occupancy / 4);

      /*
       * Combine both.
       */

      let density = Math.floor(
        Math.max(MIN_HEAT_POINTS, areaDensity + occupancyDensity),
      );

      density = Math.min(density, MAX_HEAT_POINTS);

      /* ==============================================
           INTENSITY
        ============================================== */

      const intensity = Math.max(0.05, Math.min(1, occupancyPercentage / 100));

      /* ==============================================
           CREATE ZONE CANVAS
        ============================================== */

      const zoneCanvas = document.createElement("canvas");

      zoneCanvas.width = canvasW;
      zoneCanvas.height = canvasH;

      const heat = simpleheat(zoneCanvas);

      /* ==============================================
           DISTRIBUTED POINTS
        ============================================== */

      const zonePoints = generateDistributedPoints(
        zone,
        density,
        zoom,
        intensity,
      );

      if (!zonePoints.length) {
        return;
      }

      heat.data(zonePoints);

      /* ==============================================
           GRADIENT
        ============================================== */

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

              0.2: "#0095ff",

              0.4: "#00d84a",

              0.6: "#ffe600",

              0.8: "#ff9800",

              1.0: "#ff0000",
            },
      );

      /* ==============================================
           RADIUS
        ============================================== */

      /*
       * Large hotspots remain.
       *
       * Slightly smaller radius at lower zoom
       * allows the additional points to remain
       * visually separated.
       */

      const radius = zoom >= 1.5 ? 60 : zoom >= 1 ? 48 : 40;

      heat.radius(radius, 35);

      heat.max(1);

      heat.draw(0.04);

      /* ==============================================
           CLIP HEATMAP TO ZONE
        ============================================== */

      const zoneCtx = zoneCanvas.getContext("2d");

      zoneCtx.save();

      zoneCtx.globalCompositeOperation = "destination-in";

      zoneCtx.beginPath();

      zone.points.forEach((p, index) => {
        const { cx, cy } = toCanvasXY(p.x, p.y, zoom);

        if (index === 0) {
          zoneCtx.moveTo(cx, cy);
        } else {
          zoneCtx.lineTo(cx, cy);
        }
      });

      zoneCtx.closePath();

      zoneCtx.fill();

      zoneCtx.restore();

      /* ==============================================
           DRAW TO MAIN CANVAS
        ============================================== */

      mainCtx.drawImage(zoneCanvas, 0, 0);
    });
  }, [
    selectedFloor,
    zonesToRender,
    selectedZone,
    clickedZone,
    zoom,
    gradientType,
    canvasW,
    canvasH,
  ]);

  /* =====================================================
     STATUS COLOR
  ===================================================== */

  const getStatusColor = (value) => {
    if (value <= 20) return "#0095ff";

    if (value <= 40) return "#00d84a";

    if (value <= 60) return "#ffe600";

    if (value <= 80) return "#ff9800";

    return "#ff0000";
  };

  /* =====================================================
     ZONE BORDERS
  ===================================================== */

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
        if (!zone.points?.length) {
          return null;
        }

        const polygon = zone.points
          .map((p) => {
            const { cx, cy } = toCanvasXY(p.x, p.y, zoom);

            return `${cx},${cy}`;
          })
          .join(" ");

        return (
          <polygon
            key={zone.zoneId}
            points={polygon}
            fill="rgba(255,255,255,0.02)"
            stroke="#0d6efd"
            strokeWidth={
              selectedZone?.zoneId === zone.zoneId
                ? 2
                : hoveredZone?.zoneId === zone.zoneId
                  ? 3
                  : 2
            }
            vectorEffect="non-scaling-stroke"
            pointerEvents="all"
            style={{
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              setHoveredZone(zone);

              const rect =
                e.currentTarget.ownerSVGElement.getBoundingClientRect();

              setPopupPos({
                x: e.clientX - rect.left + 15,

                y: e.clientY - rect.top + 15,
              });
            }}
            onMouseMove={(e) => {
              const rect =
                e.currentTarget.ownerSVGElement.getBoundingClientRect();

              setPopupPos({
                x: e.clientX - rect.left + 15,

                y: e.clientY - rect.top + 15,
              });
            }}
            onMouseLeave={() => {
              if (!clickedZone) {
                setHoveredZone(null);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();

              setClickedZone(zone);

              const rect =
                e.currentTarget.ownerSVGElement.getBoundingClientRect();

              setPopupPos({
                x: e.clientX - rect.left + 15,

                y: e.clientY - rect.top + 15,
              });
            }}
          />
        );
      })}
    </svg>
  );

  /* =====================================================
     LABELS
  ===================================================== */

  const renderLabels = () => {
    return zonesToRender.map((zone) => {
      if (!zone.points?.length) {
        return null;
      }

      const centerX =
        zone.points.reduce((sum, p) => sum + p.x, 0) / zone.points.length;

      const centerY =
        zone.points.reduce((sum, p) => sum + p.y, 0) / zone.points.length;

      const { cx, cy } = toCanvasXY(centerX, centerY, zoom);

      const occupancyPercentage = zone.occupancyPercentage ?? 0;

      const statusColor = getStatusColor(occupancyPercentage);

      return (
        <div
          key={zone.zoneId}
          className="zone-card-v2"
          style={{
            left: cx,
            top: cy,
            "--zone-color": statusColor,
          }}
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
              style={{
                width: `${Math.min(occupancyPercentage, 100)}%`,
              }}
            />
          </div>
        </div>
      );
    });
  };

  /* =====================================================
     FOCUS ZONE
  ===================================================== */

  const focusZone = (zone) => {
    if (!zone?.points?.length || !scrollRef.current) {
      return;
    }

    const xs = zone.points.map((p) => p.x);

    const ys = zone.points.map((p) => p.y);

    const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;

    const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;

    const { cx, cy } = toCanvasXY(centerX, centerY, zoom);

    const scroll = scrollRef.current;

    scroll.scrollTo({
      left: Math.max(0, cx - scroll.clientWidth / 2),

      top: Math.max(0, cy - scroll.clientHeight / 2),

      behavior: "smooth",
    });
  };

  /* =====================================================
     INITIAL FOCUS
  ===================================================== */

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

  /* =====================================================
     ACTIVE ZONE
  ===================================================== */

  const activeZone = selectedZone || clickedZone || hoveredZone;

  /* =====================================================
     JSX
  ===================================================== */

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

            position: "relative",
          }}
        >
          {/* FLOOR IMAGE */}

          <img
            src={getImageUrl(selectedFloor.floorImage)}
            className="floor-image"
            style={{
              ...imgStyle,

              position: "absolute",

              left: 0,

              top: 0,

              zIndex: 0,
            }}
          />

          {/* HEATMAP */}

          <div
            ref={heatmapRef}
            className="heatmap-layer"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: canvasW,
              height: canvasH,
              zIndex: 2,
              pointerEvents: "none",
              background: "transparent",
              opacity: 1,
              filter: "none",
              mixBlendMode: "normal",
            }}
          />

          {/* ZONE BORDER */}

          {renderZoneBorders()}

          {/* LABELS */}

          {renderLabels()}

          {/* POPUP */}

          {activeZone && (
            <div
              className="zone-detail-popup-v2"
              style={{
                left: popupPos.x,

                top: popupPos.y,

                "--zone-color": getStatusColor(activeZone.occupancyPercentage),
              }}
            >
              <div className="zdp-header">
                <span className="zdp-dot" />

                <span className="zdp-name">{activeZone.zoneName}</span>
              </div>

              <div className="zdp-hero">
                <span className="zdp-hero-value">
                  {activeZone.occupancyPercentage}

                  <span className="zdp-hero-pct">%</span>
                </span>

                <span className="zdp-hero-label">occupancy</span>
              </div>

              <div className="zdp-bar-track">
                <div
                  className="zdp-bar-fill"
                  style={{
                    width: `${Math.min(activeZone.occupancyPercentage, 100)}%`,
                  }}
                />
              </div>

              <div className="zdp-divider" />

              <div className="zdp-row">
                <span className="zdp-label">Visitors In</span>

                <span className="zdp-value">{activeZone.visitors}</span>
              </div>

              <div className="zdp-row">
                <span className="zdp-label">Visitors Out</span>

                <span className="zdp-value">{activeZone.outCount}</span>
              </div>

              <div className="zdp-row">
                <span className="zdp-label">Occupancy</span>

                <span className="zdp-value">{activeZone.occupancy}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          TOOLS
      ================================================= */}

      <div className="map-tools">
        {/* ZOOM IN */}

        <button onClick={() => setZoom((p) => +(p + 0.1).toFixed(1))}>+</button>

        {/* ZOOM OUT */}

        <button
          onClick={() => setZoom((p) => +Math.max(0.3, p - 0.1).toFixed(1))}
        >
          −
        </button>

        {/* DEFAULT GRADIENT */}

        <div
          className="gradient-tool first"
          onClick={() => setGradientType("default")}
        />

        {/* PURPLE GRADIENT */}

        <div
          className="gradient-tool second"
          onClick={() => setGradientType("purple")}
        />
      </div>
    </div>
  );
};

export default HeatmapCanvas;
