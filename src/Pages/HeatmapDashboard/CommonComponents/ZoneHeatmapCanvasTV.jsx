import React, { useEffect, useMemo, useRef, useState } from "react";
import simpleheat from "simpleheat";
import "../Styles/mallwiseTV.css";
import { getImageUrl } from "../../Settings_Heatmap/components/Heatmaps/utils/imageHelper";
const ZONEWISE_BACKGROUND_COLOR = "rgba(148, 163, 184, 0.22)";
/*-----------------------------------
Rotate Image
-----------------------------------*/

function toCanvasXY(imgX, imgY, imageH, scale) {
  return {
    cx: imgX * scale,
    cy: imgY * scale,
  };
}

/*-----------------------------------
Point In Polygon
-----------------------------------*/

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
const ZoneHeatmapCanvasTV = ({
  selectedFloor,
  selectedZone,
}) => {
  const wrapperRef = useRef();
  const heatmapRef = useRef();
  const [size, setSize] = useState({
    width: 1600,
    height: 900,
  });

  /*-----------------------------------
Auto Resize
-----------------------------------*/

  useEffect(() => {
    const resize = () => {
      if (!wrapperRef.current) return;

      setSize({
        width: wrapperRef.current.clientWidth,
        height: wrapperRef.current.clientHeight,
      });
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const [imageSize, setImageSize] = useState({
    width: 1,
    height: 1,
  });

  const imageW = imageSize.width;
  const imageH = imageSize.height;

  const TV_ZOOM = 1.15;

  const scale = useMemo(() => {
    if (!imageW || !imageH) return 1;

    const padding = 20;

    const widthScale = (size.width - padding) / imageW;
    const heightScale = (size.height - padding) / imageH;

    return Math.min(widthScale, heightScale) * 1;
  }, [size, imageW, imageH]);

  const canvasW = imageW * scale;
  const canvasH = imageH * scale;

  const zone = selectedZone;

  const bounds = useMemo(() => {
    if (!zone?.points?.length) return null;

    const xs = zone.points.map(p => p.x);
    const ys = zone.points.map(p => p.y);

    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  }, [zone]);
  if (!zone) {
    return (
      <div className="tv-map-wrapper">
        No Zone Selected
      </div>
    );
  }
  /*-----------------------------------
Heatmap
-----------------------------------*/

  // useEffect(() => {
  //   if (!heatmapRef.current) return;

  //   heatmapRef.current.innerHTML = "";
  //   const canvas = document.createElement("canvas");
  //   canvas.width = canvasW;
  //   canvas.height = canvasH;
  //   heatmapRef.current.appendChild(canvas);
  //   const ctx = canvas.getContext("2d");

  //   // zones.forEach((zone) => {
  //   if (!zone.points?.length) return;
  //   const zoneCanvas = document.createElement("canvas");
  //   zoneCanvas.width = canvasW;
  //   zoneCanvas.height = canvasH;
  //   const heat = simpleheat(zoneCanvas);
  //   const pts = [];
  //   const xs = zone.points.map((p) => p.x);
  //   const ys = zone.points.map((p) => p.y);
  //   const minX = Math.min(...xs);
  //   const maxX = Math.max(...xs);
  //   const minY = Math.min(...ys);
  //   const maxY = Math.max(...ys);
  //   const occupancy = zone.occupancy ?? 0;
  //   const density = Math.max(15, Math.floor(occupancy / 5));
  //   let created = 0;
  //   while (created < density) {
  //     const px = minX + Math.random() * (maxX - minX);
  //     const py = minY + Math.random() * (maxY - minY);
  //     if (!isPointInPolygon(px, py, zone.points)) continue;
  //     const { cx, cy } = toCanvasXY(px, py, imageH, scale);
  //     pts.push([cx, cy, Math.min(0.75, zone.occupancyPercentage / 100)]);

  //     created++;
  //   }

  //   heat.data(pts);
  //   heat.gradient({
  //     0.0: "rgba(0,0,255,0)",
  //     0.2: "#0095ff",
  //     0.4: "#00d84a",
  //     0.6: "#ffe600",
  //     0.8: "#ff9800",
  //     1.0: "#ff0000",
  //   });

  //   heat.radius(42, 35);
  //   heat.max(1);
  //   heat.draw(0.04);
  //   const zoneCtx = zoneCanvas.getContext("2d");
  //   zoneCtx.save();
  //   zoneCtx.globalCompositeOperation = "destination-in";
  //   zoneCtx.beginPath();
  //   zone.points.forEach((p, i) => {
  //     const { cx, cy } = toCanvasXY(p.x, p.y, imageH, scale);

  //     if (i === 0) zoneCtx.moveTo(cx, cy);
  //     else zoneCtx.lineTo(cx, cy);
  //   });
  //   zoneCtx.closePath();
  //   zoneCtx.fill();
  //   zoneCtx.restore();
  //   ctx.drawImage(zoneCanvas, 0, 0);
  //   // }
  //   // );
  // }, [selectedZone, scale]);
  useEffect(() => {
    if (!heatmapRef.current) return;

    heatmapRef.current.innerHTML = "";

    const canvas = document.createElement("canvas");
    canvas.width = canvasW;
    canvas.height = canvasH;

    heatmapRef.current.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    if (!zone?.points?.length) return;

    const zoneCanvas = document.createElement("canvas");
    zoneCanvas.width = canvasW;
    zoneCanvas.height = canvasH;

    const heat = simpleheat(zoneCanvas);

    const xs = zone.points.map((p) => p.x);
    const ys = zone.points.map((p) => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = maxX - minX;
    const height = maxY - minY;

    if (width <= 0 || height <= 0) return;

    // ============================================================
    // HOTSPOT DENSITY
    // ============================================================

    const occupancy = Number(zone.occupancy ?? 0);

    const occupancyPercentage =
      Number(zone.occupancyPercentage ?? 0);

    const MIN_HEAT_POINTS = 30;
    const MAX_HEAT_POINTS = 180;

    const areaDensity = (width * height) / 8000;

    const occupancyDensity =
      Math.max(0, occupancy / 4);

    let density = Math.floor(
      Math.max(
        MIN_HEAT_POINTS,
        areaDensity + occupancyDensity
      )
    );

    density = Math.min(
      density,
      MAX_HEAT_POINTS
    );

    // ============================================================
    // INTENSITY
    // ============================================================

    const intensity = Math.max(
      0.05,
      Math.min(
        1,
        occupancyPercentage / 100
      )
    );

    // ============================================================
    // GRID DISTRIBUTION
    // ============================================================

    const aspectRatio = width / height;

    let columns = Math.ceil(
      Math.sqrt(
        density * aspectRatio
      )
    );

    let rows = Math.ceil(
      density / columns
    );

    columns = Math.max(columns, 2);
    rows = Math.max(rows, 2);

    const cellWidth = width / columns;
    const cellHeight = height / rows;

    const pts = [];

    // ============================================================
    // CREATE DISTRIBUTED HOTSPOTS
    // ============================================================

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {

        if (pts.length >= density) {
          break;
        }

        const baseX =
          minX +
          (col + 0.5) *
          cellWidth;

        const baseY =
          minY +
          (row + 0.5) *
          cellHeight;

        // Small random movement
        const jitterX =
          (Math.random() - 0.5) *
          cellWidth *
          0.7;

        const jitterY =
          (Math.random() - 0.5) *
          cellHeight *
          0.7;

        const px =
          baseX + jitterX;

        const py =
          baseY + jitterY;

        // Only keep points inside actual polygon
        if (
          !isPointInPolygon(
            px,
            py,
            zone.points
          )
        ) {
          continue;
        }

        const { cx, cy } =
          toCanvasXY(
            px,
            py,
            imageH,
            scale
          );

        pts.push([
          cx,
          cy,
          intensity
        ]);
      }
    }

    // ============================================================
    // FILL MISSING POINTS FOR IRREGULAR ZONES
    // ============================================================

    let attempts = 0;

    const maxAttempts =
      density * 20;

    while (
      pts.length < density &&
      attempts < maxAttempts
    ) {
      attempts++;

      const px =
        minX +
        Math.random() *
        (maxX - minX);

      const py =
        minY +
        Math.random() *
        (maxY - minY);

      if (
        !isPointInPolygon(
          px,
          py,
          zone.points
        )
      ) {
        continue;
      }

      const { cx, cy } =
        toCanvasXY(
          px,
          py,
          imageH,
          scale
        );

      pts.push([
        cx,
        cy,
        intensity
      ]);
    }

    // ============================================================
    // HEATMAP GRADIENT
    // ============================================================

    heat.data(pts);

    heat.gradient({
      0.0: "rgba(0,0,255,0)",
      0.2: "#0095ff",
      0.4: "#00d84a",
      0.6: "#ffe600",
      0.8: "#ff9800",
      1.0: "#ff0000",
    });

    // Slightly larger radius for better spread
    heat.radius(48, 35);

    heat.max(1);

    heat.draw(0.04);

    // ============================================================
    // CLIP HEATMAP TO ZONE
    // ============================================================

    const zoneCtx =
      zoneCanvas.getContext("2d");

    zoneCtx.save();

    zoneCtx.globalCompositeOperation =
      "destination-in";

    zoneCtx.beginPath();

    zone.points.forEach((p, i) => {

      const { cx, cy } =
        toCanvasXY(
          p.x,
          p.y,
          imageH,
          scale
        );

      if (i === 0) {
        zoneCtx.moveTo(cx, cy);
      } else {
        zoneCtx.lineTo(cx, cy);
      }
    });

    zoneCtx.closePath();

    zoneCtx.fill();

    zoneCtx.restore();

    // ============================================================
    // DRAW HEATMAP
    // ============================================================

    ctx.drawImage(
      zoneCanvas,
      0,
      0
    );

  }, [
    selectedZone,
    scale,
    canvasW,
    canvasH,
    imageH,
  ]);
  /*-----------------------------------
Border Color
-----------------------------------*/

  const getColor = (v) => {
    if (v <= 20) return "#2D8CFF";

    if (v <= 40) return "#34C759";

    if (v <= 60) return "#F5C542";

    if (v <= 80) return "#FF8A34";

    return "#FF5A5F";
  };

  if (!selectedFloor) {
    return <div className="tv-map-wrapper">Loading Heatmap...</div>;
  }
  /* get status color for cards */
  const getStatus = (value = 0) => {
    if (value <= 20)
      return {
        label: "Low",
        color: "#2196F3",
        className: "blue",
      };

    if (value <= 40)
      return {
        label: "Normal",
        color: "#22C55E",
        className: "green",
      };

    if (value <= 60)
      return {
        label: "Moderate",
        color: "#FACC15",
        className: "yellow",
      };

    if (value <= 80)
      return {
        label: "High",
        color: "#FB923C",
        className: "orange",
      };

    return {
      label: "Critical",
      color: "#EF4444",
      className: "red",
    };
  };

  const placedTooltips = [];

  const getTooltipPosition = (x, y, canvasW, canvasH) => {
    const positions = [
      { x: 120, y: -90 },
      { x: -120, y: -90 },
      { x: 120, y: 90 },
      { x: -120, y: 90 },
      { x: 170, y: 0 },
      { x: -170, y: 0 },
      { x: 0, y: -120 },
      { x: 0, y: 120 },
    ];

    const TOOLTIP_W = 170;
    const TOOLTIP_H = 105;

    for (const p of positions) {
      const left = x + p.x - TOOLTIP_W / 2;
      const top = y + p.y - TOOLTIP_H / 2;

      if (
        left < 10 ||
        top < 10 ||
        left + TOOLTIP_W > canvasW - 10 ||
        top + TOOLTIP_H > canvasH - 10
      )
        continue;

      let overlap = false;

      for (const box of placedTooltips) {
        if (
          left < box.right &&
          left + TOOLTIP_W > box.left &&
          top < box.bottom &&
          top + TOOLTIP_H > box.top
        ) {
          overlap = true;
          break;
        }
      }

      if (!overlap) {
        placedTooltips.push({
          left,
          top,
          right: left + TOOLTIP_W,
          bottom: top + TOOLTIP_H,
        });

        return p;
      }
    }

    return { x: 120, y: -90 };
  };
  const floorImage =
    selectedFloor?.floorImage
      ? getImageUrl(selectedFloor.floorImage)
      : null;
  return (
    <div className="tv-map-wrapper" ref={wrapperRef}>
      <div
        className="tv-map-inner"
        style={{
          width: canvasW,
          height: canvasH,
        }}
      >
        <img
          src={floorImage}
          className="tv-floor-image"
          onLoad={(e) => {
            setImageSize({
              width: e.target.naturalWidth,
              height: e.target.naturalHeight,
            });
          }}
          style={{
            width: canvasW,
            height: canvasH,
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 1,
          }}
          alt=""
        />

        {/* =========================================
    SELECTED ZONE CONSTANT BACKGROUND
    ========================================= */}

        {/* <svg
          width={canvasW}
          height={canvasH}
          viewBox={`0 0 ${canvasW} ${canvasH}`}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: canvasW,
            height: canvasH,
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          {zone?.points?.length > 0 && (
            <polygon
              points={zone.points
                .map((p) => {
                  const { cx, cy } = toCanvasXY(
                    p.x,
                    p.y,
                    imageH,
                    scale
                  );

                  return `${cx},${cy}`;
                })
                .join(" ")}
              fill={ZONEWISE_BACKGROUND_COLOR}
              stroke="none"
            />
          )}
        </svg> */}

        {/* =========================================
    HEATMAP
    ========================================= */}

        <div
          ref={heatmapRef}
          className="tv-heatmap-layer"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: canvasW,
            height: canvasH,
            pointerEvents: "none",
            zIndex: 4,
          }}
        />

        <svg
          className="tv-border-layer"
          width={canvasW}
          height={canvasH}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: canvasW,
            height: canvasH,
            pointerEvents: "none",
            overflow: "visible",
            zIndex: 6,
          }}
        >
          {zone?.points?.length > 0 && (
            <polygon
              points={zone.points
                .map((p) => {
                  const { cx, cy } = toCanvasXY(
                    p.x,
                    p.y,
                    imageH,
                    scale
                  );

                  return `${cx},${cy}`;
                })
                .join(" ")}
              fill="none"
              stroke={getColor(zone.occupancyPercentage)}
              strokeWidth="1.4"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
        {(() => {
          placedTooltips.length = 0;

          if (!zone?.points?.length) return null;

          const status = getStatus(zone.occupancyPercentage);

          const cx =
            zone.points.reduce((a, b) => a + b.x, 0) / zone.points.length;

          const cy =
            zone.points.reduce((a, b) => a + b.y, 0) / zone.points.length;

          const pos = toCanvasXY(cx, cy, imageH, scale);

          const offset = getTooltipPosition(
            pos.cx,
            pos.cy,
            canvasW,
            canvasH
          );

          const tooltipX = pos.cx + offset.x;
          const tooltipY = pos.cy + offset.y;

          const visitorsIn = zone.visitors ?? 0;
          const visitorsOut = zone.outCount ?? 0;
          const currentOccupancy =
            zone.currentOccupancy ?? zone.occupancy ?? 0;

          const statRowStyle = {
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#5b6068",
            padding: "2px 0",
          };

          const statValueStyle = {
            fontWeight: 600,
            color: "#1a1d21",
          };

          return (
            <div
              key={zone.zoneId}
              className={`tv-tooltip ${status.className}`}
              style={{
                left: tooltipX,
                top: tooltipY,
                transform: "translate(-50%, -50%)",
                minWidth: "210px",
                padding: "12px 12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "4px",
                }}
              >
                {/* <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    backgroundColor: status.color,
                  }}
                /> */}
                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                  title={zone.zoneName}
                >
                  {zone.zoneName?.length > 14
                    ? `${zone.zoneName.substring(0, 13)}...`
                    : zone.zoneName}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "6px",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "27px",
                    fontWeight: 700,
                    color: status.color,
                  }}
                >
                  {zone.occupancyPercentage}%
                </span>
                <span style={{ fontSize: "12px", color: "#8a8f98" }}>
                  occupancy
                </span>
              </div>

              <div
                style={{
                  height: "4px",
                  borderRadius: "2px",
                  background: "#eef0f3",
                  overflow: "hidden",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: "2px",
                    width: `${Math.min(100, zone.occupancyPercentage)}%`,
                    backgroundColor: status.color,
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={statRowStyle}>
                  <span>Visitors In</span>
                  <span style={statValueStyle}>{visitorsIn}</span>
                </div>
                <div style={statRowStyle}>
                  <span>Visitors Out</span>
                  <span style={statValueStyle}>{visitorsOut}</span>
                </div>
                <div style={statRowStyle}>
                  <span>Current Occupancy</span>
                  <span style={statValueStyle}>{currentOccupancy}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default ZoneHeatmapCanvasTV;
