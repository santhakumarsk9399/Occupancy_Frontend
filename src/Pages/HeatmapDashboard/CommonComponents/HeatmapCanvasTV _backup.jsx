import React, { useEffect, useMemo, useRef, useState } from "react";
import simpleheat from "simpleheat";
import "../Styles/mallwiseTV.css";
import { getImageUrl } from "../../Settings_Heatmap/components/Heatmaps/utils/imageHelper";

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

const HeatmapCanvasTV = ({ selectedFloor, zones = [] }) => {
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

  //   zones.forEach((zone) => {
  //     if (!zone.points?.length) return;
  //     const zoneCanvas = document.createElement("canvas");
  //     zoneCanvas.width = canvasW;
  //     zoneCanvas.height = canvasH;
  //     const heat = simpleheat(zoneCanvas);
  //     const pts = [];
  //     const xs = zone.points.map((p) => p.x);
  //     const ys = zone.points.map((p) => p.y);
  //     const minX = Math.min(...xs);
  //     const maxX = Math.max(...xs);
  //     const minY = Math.min(...ys);
  //     const maxY = Math.max(...ys);
  //     const occupancy = zone.occupancy ?? 0;
  //     const density = Math.max(15, Math.floor(occupancy / 5));
  //     let created = 0;
  //     while (created < density) {
  //       const px = minX + Math.random() * (maxX - minX);
  //       const py = minY + Math.random() * (maxY - minY);
  //       if (!isPointInPolygon(px, py, zone.points)) continue;
  //       const { cx, cy } = toCanvasXY(px, py, imageH, scale);
  //       pts.push([cx, cy, Math.min(0.75, zone.occupancyPercentage / 100)]);

  //       created++;
  //     }

  //     heat.data(pts);
  //     heat.gradient({
  //       0.0: "rgba(0,0,255,0)",
  //       0.2: "#0095ff",
  //       0.4: "#00d84a",
  //       0.6: "#ffe600",
  //       0.8: "#ff9800",
  //       1.0: "#ff0000",
  //     });

  //     heat.radius(42, 35);
  //     heat.max(1);
  //     heat.draw(0.04);
  //     const zoneCtx = zoneCanvas.getContext("2d");
  //     zoneCtx.save();
  //     zoneCtx.globalCompositeOperation = "destination-in";
  //     zoneCtx.beginPath();
  //     zone.points.forEach((p, i) => {
  //       const { cx, cy } = toCanvasXY(p.x, p.y, imageH, scale);

  //       if (i === 0) zoneCtx.moveTo(cx, cy);
  //       else zoneCtx.lineTo(cx, cy);
  //     });
  //     zoneCtx.closePath();
  //     zoneCtx.fill();
  //     zoneCtx.restore();
  //     ctx.drawImage(zoneCanvas, 0, 0);
  //   });
  // }, [zones, scale]);
  useEffect(() => {
    if (!heatmapRef.current) return;

    heatmapRef.current.innerHTML = "";

    const canvas = document.createElement("canvas");

    canvas.width = canvasW;
    canvas.height = canvasH;

    heatmapRef.current.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    // ============================================================
    // ZONE BACKGROUND COLORS
    // ============================================================

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

    // ============================================================
    // 1. DRAW ALL ZONE BACKGROUNDS FIRST
    // ============================================================

    zones.forEach((zone, index) => {
      if (!zone.points?.length) return;

      ctx.save();

      ctx.beginPath();

      zone.points.forEach((p, i) => {
        const { cx, cy } = toCanvasXY(
          p.x,
          p.y,
          imageH,
          scale
        );

        if (i === 0) {
          ctx.moveTo(cx, cy);
        } else {
          ctx.lineTo(cx, cy);
        }
      });

      ctx.closePath();

      // Different light color for each zone
      ctx.fillStyle =
        zoneColors[index % zoneColors.length];

      ctx.fill();

      ctx.restore();
    });

    // ============================================================
    // 2. DRAW HEATMAP ABOVE THE ZONE BACKGROUNDS
    // ============================================================

    zones.forEach((zone) => {
      if (!zone.points?.length) return;

      const zoneCanvas =
        document.createElement("canvas");

      zoneCanvas.width = canvasW;
      zoneCanvas.height = canvasH;

      const heat = simpleheat(zoneCanvas);

      const pts = [];

      const xs = zone.points.map(
        (p) => p.x
      );

      const ys = zone.points.map(
        (p) => p.y
      );

      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);

      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      const occupancy =
        zone.occupancy ?? 0;

      const density = Math.max(
        15,
        Math.floor(
          occupancy / 5
        )
      );

      let created = 0;

      while (created < density) {
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
          Math.min(
            0.75,
            zone.occupancyPercentage /
            100
          ),
        ]);

        created++;
      }

      heat.data(pts);

      heat.gradient({
        0.0: "rgba(0,0,255,0)",
        0.2: "#0095ff",
        0.4: "#00d84a",
        0.6: "#ffe600",
        0.8: "#ff9800",
        1.0: "#ff0000",
      });

      heat.radius(
        42,
        35
      );

      heat.max(1);

      heat.draw(0.04);

      // ========================================================
      // CLIP HEATMAP TO ZONE
      // ========================================================

      const zoneCtx =
        zoneCanvas.getContext(
          "2d"
        );

      zoneCtx.save();

      zoneCtx.globalCompositeOperation =
        "destination-in";

      zoneCtx.beginPath();

      zone.points.forEach(
        (p, i) => {
          const { cx, cy } =
            toCanvasXY(
              p.x,
              p.y,
              imageH,
              scale
            );

          if (i === 0) {
            zoneCtx.moveTo(
              cx,
              cy
            );
          } else {
            zoneCtx.lineTo(
              cx,
              cy
            );
          }
        }
      );

      zoneCtx.closePath();

      zoneCtx.fill();

      zoneCtx.restore();

      // ========================================================
      // PUT HEATMAP ABOVE BACKGROUND
      // ========================================================

      ctx.drawImage(
        zoneCanvas,
        0,
        0
      );
    });
  }, [
    zones,
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
      { x: 65, y: -90 },
      { x: -65, y: -90 },
      { x: 65, y: 90 },
      { x: -65, y: 90 },
      { x: 100, y: 0 },
      { x: -100, y: 0 },
      { x: 0, y: -100 },
      { x: 0, y: 100 },
    ];

    const TOOLTIP_W = 300;
    const TOOLTIP_H = 100;

    for (const p of positions) {
      const left = x + p.x - TOOLTIP_W / 2;
      const top = y + p.y - TOOLTIP_H / 2;

      if (
        left < 10 ||
        top < 10 ||
        left + TOOLTIP_W > canvasW - 10 ||
        top + TOOLTIP_H > canvasH - 10
      ) {
        continue;
      }

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

    return { x: 80, y: -60 };
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
          }}
        />
        <div ref={heatmapRef} className="tv-heatmap-layer" />

        <svg className="tv-border-layer" width={canvasW} height={canvasH}>
          {zones.map((zone) => {
            if (!Array.isArray(zone.points) || zone.points.length === 0) {
              return null;
            }
            
            const polygon = zone.points
              .map((p) => {
                const { cx, cy } = toCanvasXY(p.x, p.y, imageH, scale);

                return `${cx},${cy}`;
              })
              .join(" ");

            return (
              <polygon
                key={zone.zoneId}
                points={polygon}
                fill="transparent"
                stroke={getColor(zone.occupancyPercentage)}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {(() => {
          placedTooltips.length = 0;

          return zones.map((zone) => {
            const status = getStatus(zone.occupancyPercentage);
            if (!Array.isArray(zone.points) || zone.points.length === 0) {
              return null;
            }
            
            const cx =
              zone.points.reduce((a, b) => a + b.x, 0) / zone.points.length;
            const cy =
              zone.points.reduce((a, b) => a + b.y, 0) / zone.points.length;
            const pos = toCanvasXY(cx, cy, imageH, scale);
            const offset = getTooltipPosition(pos.cx, pos.cy, canvasW, canvasH);
            

            const CARD_W = 300;
            const CARD_H = 100;

            const tooltipX = pos.cx + offset.x;
            const tooltipY = pos.cy + offset.y;

            const tooltipLeft =
              tooltipX - CARD_W / 2;

            const tooltipRight =
              tooltipX + CARD_W / 2;

            const tooltipTop =
              tooltipY - CARD_H / 2;

            const tooltipBottom =
              tooltipY + CARD_H / 2;


            /* =========================================================
               FIND THE CORRECT TOOLTIP EDGE FOR THE ARROW
            
               The arrow connects from the zone point to the
               nearest edge of the tooltip card.
            ========================================================= */

            let endX;
            let endY;

            const GAP = 8;

            // Distance from zone point to each tooltip edge
            const distanceLeft =
              Math.abs(pos.cx - tooltipLeft);

            const distanceRight =
              Math.abs(pos.cx - tooltipRight);

            const distanceTop =
              Math.abs(pos.cy - tooltipTop);

            const distanceBottom =
              Math.abs(pos.cy - tooltipBottom);


            /* ---------------------------------------------------------
               Determine which side the zone point is outside of
            --------------------------------------------------------- */

            if (pos.cx < tooltipLeft) {

              // Zone is LEFT of tooltip
              endX = tooltipLeft - GAP;

              // Keep arrow aligned with zone point
              endY = Math.max(
                tooltipTop + 12,
                Math.min(
                  pos.cy,
                  tooltipBottom - 12
                )
              );

            } else if (pos.cx > tooltipRight) {

              // Zone is RIGHT of tooltip
              endX = tooltipRight + GAP;

              endY = Math.max(
                tooltipTop + 12,
                Math.min(
                  pos.cy,
                  tooltipBottom - 12
                )
              );

            } else if (pos.cy < tooltipTop) {

              // Zone is ABOVE tooltip
              endX = Math.max(
                tooltipLeft + 12,
                Math.min(
                  pos.cx,
                  tooltipRight - 12
                )
              );

              endY = tooltipTop - GAP;

            } else {

              // Zone is BELOW tooltip
              endX = Math.max(
                tooltipLeft + 12,
                Math.min(
                  pos.cx,
                  tooltipRight - 12
                )
              );

              endY = tooltipBottom + GAP;
            }


            /* =========================================================
               CURVE CONTROL POINT
            ========================================================= */

            const mx =
              (pos.cx + endX) / 2;

            const my =
              (pos.cy + endY) / 2;
            return (
              <React.Fragment key={zone.zoneId}>
                <svg
                  className="tv-label-line"
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
                    overflow: "visible",
                    zIndex: 8,
                  }}
                >
                  <path
                    d={`
    M ${pos.cx} ${pos.cy}
    Q ${mx} ${my}
    ${endX} ${endY}
  `}
                    stroke={status.color}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="2 8"
                    strokeLinecap="round"
                  /> 
                  {/* <line
                    x1={pos.cx}
                    y1={pos.cy}
                    x2={endX}
                    y2={endY}
                    stroke={status.color}
                    strokeWidth="3"
                    strokeDasharray="2 8"
                    strokeLinecap="round"
                  /> */}
                  <circle
                    cx={pos.cx}
                    cy={pos.cy}
                    r="7"
                    fill={status.color}
                    stroke="#fff"
                    strokeWidth="3"
                  />
                </svg>

                <div
                  className={`tv-tooltip ${status.className}`}
                  style={{
                    left: pos.cx + offset.x,
                    top: pos.cy + offset.y,
                  }}
                >
                  {/* <div className="tv-tooltip-header">
                    <div
                      className="tv-tooltip-title"
                      data-zone-name={zone.zoneName}
                    >
                      {zone.zoneName?.length > 10
                        ? `${zone.zoneName.substring(0, 10)}...`
                        : zone.zoneName}
                    </div>
                  </div> */}
                  <div className="tv-tooltip-title-wrapper">
                    <div className="tv-tooltip-title"
                      title={zone.zoneName} >
                      {zone.zoneName}
                    </div>

                    {/* <span className="tv-full-zone-name">
                      {zone.zoneName}
                    </span> */}
                  </div>
                  <div
                    className="tv-tooltip-value"
                    style={{ color: status.color }}
                  >
                    {zone.occupancyPercentage}%
                  </div>
                </div>
              </React.Fragment>
            );
          });
        })()}
      </div>
    </div>
  );
};

export default HeatmapCanvasTV;
