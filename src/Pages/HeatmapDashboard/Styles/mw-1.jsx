// MallWiseTab.jsx

import React, { useState } from "react";
import "../Styles/mallwiseTab.css";

export const mallsData = [
  {
    mallId: 1,
    mallName: "Nexus Mall - BLR",

    floors: [
      {
        floorId: 1,
        floorName: "Ground Floor",
        visitors: 14067,

        floorImage:
          "https://i.imgur.com/6Iej2c3.png",

        heatmapData: {
          9: [
            { x: 250, y: 180, value: 70 },
            { x: 500, y: 300, value: 90 },
            { x: 700, y: 500, value: 50 },
          ],

          10: [
            { x: 300, y: 200, value: 90 },
            { x: 550, y: 350, value: 95 },
            { x: 750, y: 600, value: 80 },
          ],

          11: [
            { x: 400, y: 220, value: 95 },
            { x: 600, y: 420, value: 100 },
            { x: 850, y: 620, value: 88 },
          ],
        },
      },

      {
        floorId: 2,
        floorName: "First Floor",
        visitors: 5609,

        floorImage:
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200",

        heatmapData: {
          9: [
            { x: 350, y: 240, value: 60 },
            { x: 500, y: 450, value: 80 },
          ],

          10: [
            { x: 450, y: 300, value: 90 },
            { x: 600, y: 500, value: 70 },
          ],

          11: [
            { x: 300, y: 220, value: 75 },
            { x: 700, y: 480, value: 95 },
          ],
        },
      },

      {
        floorId: 3,
        floorName: "Second Floor",
        visitors: 21904,

        floorImage:
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200",

        heatmapData: {
          9: [
            { x: 250, y: 300, value: 90 },
            { x: 800, y: 500, value: 95 },
          ],

          10: [
            { x: 300, y: 250, value: 88 },
            { x: 650, y: 450, value: 92 },
          ],

          11: [
            { x: 500, y: 400, value: 100 },
            { x: 900, y: 600, value: 96 },
          ],
        },
      },
    ],
  },

  // =========================

  {
    mallId: 2,
    mallName: "Phoenix Mall - MUM",

    floors: [
      {
        floorId: 1,
        floorName: "Ground Floor",
        visitors: 18900,

        floorImage:
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200",

        heatmapData: {
          9: [
            { x: 200, y: 250, value: 85 },
            { x: 600, y: 300, value: 75 },
          ],

          10: [
            { x: 300, y: 350, value: 90 },
            { x: 700, y: 450, value: 88 },
          ],

          11: [
            { x: 450, y: 250, value: 98 },
            { x: 800, y: 500, value: 95 },
          ],
        },
      },

      {
        floorId: 2,
        floorName: "Food Court",
        visitors: 12450,

        floorImage:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200",

        heatmapData: {
          9: [
            { x: 250, y: 220, value: 65 },
            { x: 500, y: 420, value: 72 },
          ],

          10: [
            { x: 350, y: 280, value: 82 },
            { x: 650, y: 480, value: 90 },
          ],

          11: [
            { x: 400, y: 260, value: 100 },
            { x: 750, y: 500, value: 94 },
          ],
        },
      },

      {
        floorId: 3,
        floorName: "Entertainment Zone",
        visitors: 9800,

        floorImage:
          "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200",

        heatmapData: {
          9: [
            { x: 200, y: 180, value: 55 },
            { x: 600, y: 350, value: 68 },
          ],

          10: [
            { x: 350, y: 300, value: 85 },
            { x: 700, y: 450, value: 78 },
          ],

          11: [
            { x: 500, y: 400, value: 92 },
            { x: 850, y: 550, value: 88 },
          ],
        },
      },
    ],
  },

  // =========================

  {
    mallId: 3,
    mallName: "DLF Mall of India - DEL",

    floors: [
      {
        floorId: 1,
        floorName: "Ground Floor",
        visitors: 25400,

        floorImage:
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200",

        heatmapData: {
          9: [
            { x: 220, y: 180, value: 90 },
            { x: 500, y: 350, value: 85 },
          ],

          10: [
            { x: 350, y: 300, value: 95 },
            { x: 700, y: 500, value: 92 },
          ],

          11: [
            { x: 450, y: 250, value: 100 },
            { x: 850, y: 580, value: 98 },
          ],
        },
      },

      {
        floorId: 2,
        floorName: "Fashion Floor",
        visitors: 17400,

        floorImage:
          "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1200",

        heatmapData: {
          9: [
            { x: 250, y: 220, value: 75 },
            { x: 600, y: 350, value: 70 },
          ],

          10: [
            { x: 380, y: 280, value: 88 },
            { x: 750, y: 480, value: 85 },
          ],

          11: [
            { x: 520, y: 350, value: 97 },
            { x: 900, y: 600, value: 92 },
          ],
        },
      },

      {
        floorId: 3,
        floorName: "Gaming Zone",
        visitors: 11200,

        floorImage:
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200",

        heatmapData: {
          9: [
            { x: 200, y: 300, value: 65 },
            { x: 500, y: 450, value: 75 },
          ],

          10: [
            { x: 350, y: 400, value: 90 },
            { x: 750, y: 520, value: 85 },
          ],

          11: [
            { x: 480, y: 300, value: 96 },
            { x: 880, y: 620, value: 90 },
          ],
        },
      },
    ],
  },
];

const statsData = [
  {
    value: "14,067",
    title: "Total Visitors",
    sub: "Yesterday",
    change: "+4.2%",
    positive: true,
  },

  {
    value: "1,631",
    title: "Visitors Inside",
    sub: "Last hour",
    change: "-6.5%",
    positive: false,
  },

  {
    value: "12:30",
    title: "Peak Hour",
    sub: "1,091 Visitors",
  },

  {
    value: "29 min",
    title: "Avg Dwell Time",
    sub: "Yesterday",
    change: "-7.5%",
    positive: false,
  },

  {
    value: "3",
    title: "Active Alerts",
    sub: "1 New Alert",
    danger: true,
  },
];

const MallWiseTab = () => {

  const [selectedMallId, setSelectedMallId] =
    useState(1);

  const [selectedFloorId, setSelectedFloorId] =
    useState(1);

  const [selectedHour, setSelectedHour] =
    useState(10);
  const [zoom, setZoom] = useState(1);

  const [heatTheme, setHeatTheme] =
    useState("default");
  // CURRENT MALL
  const selectedMall = mallsData.find(
    (mall) => mall.mallId === selectedMallId
  );

  // CURRENT FLOOR
  const selectedFloor =
    selectedMall?.floors.find(
      (floor) => floor.floorId === selectedFloorId
    );

  // CURRENT HEATMAP POINTS
  const heatmapPoints =
    selectedFloor?.heatmapData[selectedHour] || [];

  // CHANGE MALL
  const handleMallChange = (e) => {

    const mallId = Number(e.target.value);

    setSelectedMallId(mallId);

    const firstFloor =
      mallsData.find(
        (mall) => mall.mallId === mallId
      )?.floors[0];

    setSelectedFloorId(firstFloor.floorId);
  };
  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 1));
  };
  return (
    <div className="mallwise-layout">

      {/* LEFT PANEL */}
      <div className="left-panel">

        {/* FILTER CARD */}
        <div className="filter-card">

          {/* MALL */}
          <div className="field-group">

            <label>Mall</label>

            <select
              value={selectedMallId}
              onChange={handleMallChange}
            >
              {mallsData.map((mall) => (
                <option
                  key={mall.mallId}
                  value={mall.mallId}
                >
                  {mall.mallName}
                </option>
              ))}
            </select>

          </div>

          {/* FLOOR */}
          <div className="field-group">

            <label>Floor</label>

            <div className="floor-list">

              {selectedMall?.floors.map((floor) => (

                <div
                  key={floor.floorId}
                  className={`floor-item ${selectedFloorId === floor.floorId
                    ? "active-floor"
                    : ""
                    }`}
                  onClick={() =>
                    setSelectedFloorId(
                      floor.floorId
                    )
                  }
                >

                  <span>{floor.floorName}</span>

                  <span className="floor-badge">
                    {floor.visitors}
                  </span>

                </div>

              ))}

            </div>

          </div>

        </div>

        {/* STATS */}
        {statsData.map((card, index) => (

          <div className="stats-card" key={index}>

            <div className="stats-value">
              {card.value}
            </div>

            <div className="stats-title">
              {card.title}
            </div>

            <div className="stats-footer">

              <span
                className={
                  card.danger
                    ? "danger-text"
                    : ""
                }
              >
                {card.sub}
              </span>

              {card.change && (

                <span
                  className={
                    card.positive
                      ? "positive"
                      : "negative"
                  }
                >
                  {card.change}
                </span>

              )}

            </div>

          </div>

        ))}

      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel">

        <div className="heatmap-card">

          {/* TOPBAR */}
          <div className="heatmap-topbar">

            <div className="breadcrumb">

              <span>
                🏢 {selectedMall?.mallName}
              </span>

              <span>
                🏬 {selectedFloor?.floorName}
              </span>

            </div>

          </div>

          {/* LEGEND */}
          <div className="legend-section">

            <span className="legend-label">
              Occupancy
            </span>

            <div className="legend-bar"></div>

            <div className="legend-range">

              <span>0%</span>

              <span>100%</span>

            </div>

          </div>

          <div className="map-wrapper">

            {/* ZOOMABLE AREA */}
            <div
              className="map-zoom-area"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "center",
                transition: "0.3s ease",
              }}
            >

              {/* IMAGE */}
              <img
                src={selectedFloor?.floorImage}
                alt="floor"
                className="floor-image"
              />

              {/* HEATMAP */}
              <div className="heatmap-layer">

                {heatmapPoints.map((point, index) => (

                  <div
                    key={index}
                    className="heat-point"
                    style={{
                      left: `${point.x}px`,
                      top: `${point.y}px`,

                      opacity: point.value / 100,

                      width: `${point.value * 2}px`,
                      height: `${point.value * 2}px`,

                      background:
                        heatTheme === "default"
                          ? `radial-gradient(
                  circle,
                  rgba(255,0,0,1) 0%,
                  rgba(255,165,0,0.8) 30%,
                  rgba(255,255,0,0.5) 60%,
                  rgba(0,255,0,0.2) 100%
                )`

                          : `radial-gradient(
                  circle,
                  rgba(0,150,255,1) 0%,
                  rgba(140,0,255,0.7) 50%,
                  rgba(255,0,100,0.3) 100%
                )`,
                    }}
                  />

                ))}

              </div>

            </div>

            {/* MAP TOOLS */}
            <div className="map-tools">

              <button onClick={zoomIn}>+</button>

              <button onClick={zoomOut}>-</button>

              <div
                className="gradient-tool"
                onClick={() => setHeatTheme("default")}
              />

              <div
                className="gradient-tool second"
                onClick={() => setHeatTheme("purple")}
              />

            </div>

            {/* TIMELINE */}
            <div className="timeline-container">

              <input
                type="range"
                min="9"
                max="11"
                value={selectedHour}
                onChange={(e) =>
                  setSelectedHour(Number(e.target.value))
                }
              />

              <div className="timeline-hours">

                {[9, 10, 11].map((hour) => (

                  <span key={hour}>
                    {hour}
                  </span>

                ))}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default MallWiseTab;