import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import simpleheat from "simpleheat";

import "../Styles/mallwiseTab.css";
import floorImage from "../../../../public/hm46full.png";

/* =========================================================
   DATA
========================================================= */

const mallsData = [
  {
    mallId: 1,
    mallName: "Nexus Mall - BLR",

    floors: [
      {
        floorId: 1,
        floorName: "Ground Floor",

        visitors: 14067,

        imageW: 5467,
        imageH: 3164,

        floorImage,

        zones: [
          {
            zoneId: 1,
            zoneName: "Fashion Zone",

            occupancy: 400,

            points: [
              { x: 1600, y: 1928 },
              { x: 1855, y: 1713 },
              { x: 2110, y: 1703 },
              { x: 2320, y: 1823 },
              { x: 2455, y: 2033 },
              { x: 2470, y: 2268 },
              { x: 2415, y: 2428 },
              { x: 2265, y: 2518 },
              { x: 2145, y: 2568 },
              { x: 2015, y: 2618 },
              { x: 1900, y: 2618 },
              { x: 1705, y: 2518 },
              { x: 1625, y: 2318 },
              { x: 1525, y: 2078 },
            ],
          },

          {
            zoneId: 2,
            zoneName: "Retail Zone",

            occupancy: 700,

            points: [
              { x: 4861, y: 754 },
              { x: 5313, y: 747 },
              { x: 5323, y: 917 },
              { x: 5321, y: 1067 },
              { x: 5318, y: 1199 },
              { x: 4868, y: 1201 },
            ],
          },

          {
            zoneId: 3,
            zoneName: "Gaming Zone",

            occupancy: 1500,

            points: [
              {
                "x": 3430,
                "y": 303
              },
              {
                "x": 3500,
                "y": 285
              },
              {
                "x": 3783,
                "y": 286
              },
              {
                "x": 3876,
                "y": 284
              },
              {
                "x": 3868,
                "y": 264
              },
              {
                "x": 4113,
                "y": 273
              },
              {
                "x": 4120,
                "y": 289
              },
              {
                "x": 4261,
                "y": 288
              },
              {
                "x": 4274,
                "y": 368
              },
              {
                "x": 4147,
                "y": 399
              },
              {
                "x": 4122,
                "y": 394
              },
              {
                "x": 4126,
                "y": 482
              },
              {
                "x": 4118,
                "y": 500
              },
              {
                "x": 3878,
                "y": 495
              },
              {
                "x": 3865,
                "y": 456
              },
              {
                "x": 3726,
                "y": 465
              },
              {
                "x": 3504,
                "y": 458
              },
              {
                "x": 3409,
                "y": 462
              },
              {
                "x": 3414,
                "y": 387
              },
              {
                "x": 3423,
                "y": 316
              },
              {
                "x": 3432,
                "y": 305
              },
              {
                "x": 3432,
                "y": 305
              }
            ],
          },
        ],
      },
    ],
  },
];

/* =========================================================
   HELPERS
========================================================= */

const MAX_OCCUPANCY = 2000

function getIntensity(count) {

  /*
    LOG SCALE
    Prevent all zones becoming red
  */

  const MIN = 100;
  const MAX = 2000;

  const normalized =
    (
      Math.log(count) -
      Math.log(MIN)
    ) /
    (
      Math.log(MAX) -
      Math.log(MIN)
    );

  return Math.max(
    0.08,
    Math.min(normalized, 1)
  );
}

/*
  ROTATED IMAGE
*/

function toCanvasXY(
  imgX,
  imgY,
  imageH,
  zoom
) {
  return {
    cx: (imageH - imgY) * zoom,
    cy: imgX * zoom,
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function MallwiseTab() {

  const [zoom, setZoom] =
    useState(1);

  const [gradientType, setGradientType] =
    useState("default");

  const heatmapRef = useRef(null);

  const selectedMall =
    mallsData[0];

  const selectedFloor =
    mallsData[0].floors[0];

  const {
    imageW,
    imageH,
  } = selectedFloor;

  const canvasW = imageH * zoom;

  const canvasH = imageW * zoom;

  const imgStyle = {
    width: imageW * zoom,
    height: imageH * zoom,
  };

  /* =========================================================
     HEATMAP
  ========================================================= */

  useEffect(() => {

    if (!heatmapRef.current) return;

    heatmapRef.current.innerHTML = "";

    const canvas =
      document.createElement("canvas");

    canvas.width = canvasW;

    canvas.height = canvasH;

    heatmapRef.current.appendChild(canvas);

    const heat = simpleheat(canvas);

    const points = [];

    selectedFloor.zones.forEach((zone) => {

      const occCount =
        zone.occupancy;

      const occIntensity =
        getIntensity(occCount);

      /* =========================================
         CENTER
      ========================================= */

      const centerX =
        zone.points.reduce(
          (sum, p) => sum + p.x,
          0
        ) / zone.points.length;

      const centerY =
        zone.points.reduce(
          (sum, p) => sum + p.y,
          0
        ) / zone.points.length;

      /* =========================================
         AVG RADIUS
      ========================================= */

      const avgRadius =
        zone.points.reduce((sum, p) => {

          const dx = p.x - centerX;

          const dy = p.y - centerY;

          return (
            sum +
            Math.sqrt(dx * dx + dy * dy)
          );

        }, 0) / zone.points.length;

      /* =========================================
         DENSITY
      ========================================= */

      /*
      CONTROL POINT DENSITY
      Avoid too much red saturation
    */

      /*
      NORMALIZED DENSITY
      based on zone size
    */

      /*
      ZONE AREA
    */

      const zoneArea =
        avgRadius * avgRadius;

      /*
        GLOBAL OCCUPANCY SCALE
      */

      const occupancyRatio =
        occCount / MAX_OCCUPANCY;

      /*
        AREA NORMALIZATION
        prevents tiny zones becoming fully red
      */

      const areaFactor =
        Math.min(
          Math.max(zoneArea / 90000, 0.55),
          1.4
        );

      /*
        FINAL DENSITY
      */

      const density =
        Math.floor(
          (
            120 +
            occupancyRatio * 900
          ) * areaFactor
        );
      /* =========================================
         GENERATE SMOOTH POINTS
      ========================================= */

      for (
        let i = 0;
        i < density;
        i++
      ) {

        const angle =
          Math.random() *
          Math.PI *
          2;

        /*
          CENTER HEAVY DISTRIBUTION
        */

        const radius =
          Math.pow(
            Math.random(),
            0.65
          ) *
          avgRadius *
          1.15;

        const px =
          centerX +
          Math.cos(angle) * radius;

        const py =
          centerY +
          Math.sin(angle) * radius;

        /*
          SOFT FALLOFF
        */

        /*
        SMOOTH CENTER FALLOFF
      */

        const falloff =
          Math.pow(
            1 -
            radius /
            (avgRadius * 1.15),
            1.8
          );

        /*
        OCCUPANCY DRIVEN INTENSITY
      */

        /*
        OCCUPANCY BASED INTENSITY
      */

        const occupancyRatio =
          occCount / MAX_OCCUPANCY;

        /*
          LOW OCCUPANCY
          should stay green/yellow
        */

        let baseIntensity =
          0.12 +
          occupancyRatio * 0.55;

        /*
          SMALL ZONES
          should not overheat
        */

        if (occupancyRatio < 0.08) {
          baseIntensity *= 0.45;
        }
        else if (occupancyRatio < 0.18) {
          baseIntensity *= 0.65;
        }
        else if (occupancyRatio < 0.35) {
          baseIntensity *= 0.82;
        }

        /*
          FINAL INTENSITY
        */

        const intensity =
          baseIntensity * falloff;

        const { cx, cy } =
          toCanvasXY(
            px,
            py,
            selectedFloor.imageH,
            zoom
          );

        points.push([
          cx,
          cy,
          Math.max(
            0.02,
            intensity
          ),
        ]);
      }

    });

    heat.data(points);

    /* =========================================
       FIGMA STYLE GRADIENT
    ========================================= */

    heat.gradient(
      gradientType === "purple"
        ? {
          0.08: "#5b5fff",
          0.22: "#7d4dff",
          0.42: "#b84dff",
          0.62: "#ff6ad5",
          0.82: "#ffc2f2",
          1.0: "#ffffff",
        }
        : {

          0.05: "#c7f3ff",

          0.18: "#8be8ff",

          0.38: "#8dffb2",

          0.55: "#e8ff8d",

          0.72: "#ffe08a",

          0.86: "#ffb36b",

          0.94: "#ff7b5c",

          1.0: "#ff4d4d",
        }

    );

    /* =========================================
       SOFT BLENDING
    ========================================= */

    heat.radius(
      zoom >= 1.5
        ? 78
        : zoom >= 1
          ? 66
          : 54,
      48
    );

    /*
      LOWER MAX
      BETTER COLOR TRANSITION
    */

    /*
    BETTER COLOR SEPARATION
  */

    heat.max(1);

    /*
      SOFT TRANSPARENCY
    */

    heat.draw(0.04);

  }, [
    selectedFloor,
    zoom,
    gradientType,
    canvasW,
    canvasH,
  ]);

  /* =========================================================
     LABELS
  ========================================================= */

  const renderLabels = () => {

    return selectedFloor.zones.map(
      (zone) => {

        const centerX =
          zone.points.reduce(
            (sum, p) =>
              sum + p.x,
            0
          ) / zone.points.length;

        const centerY =
          zone.points.reduce(
            (sum, p) =>
              sum + p.y,
            0
          ) / zone.points.length;

        const {
          cx,
          cy,
        } = toCanvasXY(
          centerX,
          centerY,
          imageH,
          zoom
        );

        return (
          <div
            key={zone.zoneId}
            className="zone-label"
            style={{
              left: cx,
              top: cy,
            }}
          >
            <h4>
              {zone.zoneName}
            </h4>

            <p>
              {zone.occupancy.toLocaleString()}
            </p>
          </div>
        );
      }
    );
  };

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <div className="mallwise-layout">
      {/* ==================== LEFT PANEL ==================== */}
      <div className="left-panel">

        <div className="filter-card">
          <div className="field-group">
            <label>Mall</label>
            <select
              value={selectedMall.mallId}
              onChange={(e) => {
                const mall = mallsData.find((m) => m.mallId === Number(e.target.value));
                setSelectedMall(mall);
                setSelectedFloor(mall.floors[0]);
              }}
            >
              {mallsData.map((m) => (
                <option key={m.mallId} value={m.mallId}>{m.mallName}</option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Floor</label>
            <div className="floor-list">
              {selectedMall.floors.map((floor) => (
                <div
                  key={floor.floorId}
                  className={`floor-item ${selectedFloor.floorId === floor.floorId ? "active-floor" : ""}`}
                  onClick={() => setSelectedFloor(floor)}
                >
                  <span>{floor.floorName}</span>
                  <span className="floor-badge">{floor.visitors.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-value">14,067</div>
          <div className="stats-title">Total Visitors</div>
          <div className="stats-footer">
            <span>Yesterday</span>
            <span className="positive">↗ 4.2%</span>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-value">1,631</div>
          <div className="stats-title">Visitors Inside</div>
          <div className="stats-footer">
            <span>Last hour</span>
            <span className="negative">↙ 6.5%</span>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-value">12:30</div>
          <div className="stats-title">Peak Hour</div>
          <div className="stats-footer"><span>1,091 Visitors</span></div>
        </div>

        <div className="stats-card">
          <div className="stats-value">29min</div>
          <div className="stats-title">Avg Dwell Time</div>
          <div className="stats-footer">
            <span>Yesterday</span>
            <span className="negative">↙ 7.5%</span>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-value">3</div>
          <div className="stats-title">Active Alert</div>
          <div className="stats-footer">
            <span style={{ color: "#ff4d4f", fontWeight: 600 }}>1 New alert</span>
          </div>
        </div>

      </div>
      <div className="right-panel">

        <div className="heatmap-card">

          {/* HEADER */}

          <div className="heatmap-topbar">

            <div className="breadcrumb">

              <span>
                🏠 {selectedMall.mallName}
              </span>

              <span>
                🏢 {selectedFloor.floorName}
              </span>

            </div>

          </div>

          {/* LEGEND */}

          <div className="legend-section">

            <span className="legend-label">
              Occupancy
            </span>

            <div className="legend-bar" />

            <div className="legend-range">
              <span>0%</span>
              <span>100%</span>
            </div>

          </div>

          {/* MAP */}

          <div className="map-wrapper">

            <div className="map-scroll">

              <div
                className="map-inner"
                style={{
                  width: canvasW,
                  height: canvasH,
                }}
              >

                {/* FLOOR IMAGE */}

                <img
                  src={
                    selectedFloor.floorImage
                  }
                  alt=""
                  className="floor-image"
                  style={imgStyle}
                />

                {/* HEATMAP */}

                <div
                  ref={heatmapRef}
                  className="heatmap-layer"
                />

                {/* LABELS */}

                {renderLabels()}

              </div>

            </div>

            {/* TOOLS */}

            <div className="map-tools">

              {/* ZOOM IN */}

              <button
                onClick={() =>
                  setZoom((p) =>
                    +(
                      p + 0.1
                    ).toFixed(1)
                  )
                }
              >
                +
              </button>

              {/* ZOOM OUT */}

              <button
                onClick={() =>
                  setZoom((p) =>
                    +Math.max(
                      0.3,
                      p - 0.1
                    ).toFixed(1)
                  )
                }
              >
                −
              </button>

              {/* DEFAULT */}

              <div
                className="gradient-tool first"
                onClick={() =>
                  setGradientType(
                    "default"
                  )
                }
              />

              {/* PURPLE */}

              <div
                className="gradient-tool second"
                onClick={() =>
                  setGradientType(
                    "purple"
                  )
                }
              />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}