import React, { useMemo, useRef, useState } from "react";
import "../Styles/mallwiseTab.css";
import floorImage from "../../../../public/hm46full.png";

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

                floorImage: floorImage,

                zones: [
                    {
                        zoneId: 1,
                        zoneName: "Fashion Dome",
                        occupancy: 92,

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
                        zoneName: "Food Court",
                        occupancy: 78,

                        points: [
                            { x: 600, y: 2500 },
                            { x: 980, y: 2380 },
                            { x: 1150, y: 2550 },
                            { x: 1180, y: 2880 },
                            { x: 920, y: 3050 },
                        ],
                    },

                    {
                        zoneId: 3,
                        zoneName: "Gaming Zone",
                        occupancy: 45,

                        points: [
                            { x: 3400, y: 1200 },
                            { x: 3820, y: 1150 },
                            { x: 3980, y: 1420 },
                            { x: 3900, y: 1780 },
                            { x: 3550, y: 1820 },
                        ],
                    },
                ],
            },
        ],
    },
];

export default function MallwiseTab() {
    const [selectedMall] = useState(mallsData[0]);

    const [selectedFloor] = useState(
        mallsData[0].floors[0]
    );

    const [zoom, setZoom] = useState(1);

    const [timelineHour, setTimelineHour] =
        useState(14);

    const [gradientType, setGradientType] =
        useState("default");

    const mapRef = useRef(null);

    const hours = useMemo(
        () => [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
        []
    );

    /* DYNAMIC IMAGE SIZE */

    const maxHeight =
        window.innerHeight - 260;

    const renderHeight = maxHeight;

    const renderWidth =
        (selectedFloor.imageW /
            selectedFloor.imageH) *
        renderHeight;

    const scaleX =
        renderWidth / selectedFloor.imageW;

    const scaleY =
        renderHeight / selectedFloor.imageH;

    return (
        <div className="mallwise-layout">

            {/* LEFT */}

            <div className="left-panel">
                <div className="filter-card">
                    <div className="field-group">
                        <label>Mall</label>

                        <select>
                            <option>
                                {selectedMall.mallName}
                            </option>
                        </select>
                    </div>

                    <div className="field-group">
                        <label>Floor</label>

                        <div className="floor-list">
                            {selectedMall.floors.map((floor) => (
                                <div
                                    key={floor.floorId}
                                    className={`floor-item ${selectedFloor.floorId ===
                                        floor.floorId
                                        ? "active-floor"
                                        : ""
                                        }`}
                                    onClick={() =>
                                        setSelectedFloor(floor)
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

                <div className="stats-card">
                    <div className="stats-value">
                        14,067
                    </div>

                    <div className="stats-title">
                        Total Visitors
                    </div>

                    <div className="stats-footer">
                        <span>Yesterday</span>

                        <span className="positive">
                            ↗ 4.2%
                        </span>
                    </div>
                </div>

                <div className="stats-card">
                    <div className="stats-value">
                        1,631
                    </div>

                    <div className="stats-title">
                        Visitors Inside
                    </div>

                    <div className="stats-footer">
                        <span>Last hour</span>

                        <span className="negative">
                            ↙ 6.5%
                        </span>
                    </div>
                </div>

                <div className="stats-card">
                    <div className="stats-value">
                        12:30
                    </div>

                    <div className="stats-title">
                        Peak Hour
                    </div>

                    <div className="stats-footer">
                        <span>1,091 Visitors</span>
                    </div>
                </div>

                <div className="stats-card">
                    <div className="stats-value">
                        29min
                    </div>

                    <div className="stats-title">
                        Avg Dwell Time
                    </div>

                    <div className="stats-footer">
                        <span>Yesterday</span>

                        <span className="negative">
                            ↙ 7.5%
                        </span>
                    </div>
                </div>
            </div>

            {/* RIGHT */}

            <div className="right-panel">

                <div className="heatmap-card">

                    {/* HEADER */}

                    <div className="heatmap-topbar">

                        <div className="breadcrumb">

                            <span>
                                🏢 {selectedMall.mallName}
                            </span>

                            <span>
                                🏬 {selectedFloor.floorName}
                            </span>

                        </div>

                        <button className="fullscreen-btn">
                            ⛶
                        </button>

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

                        <div
                            className="map-inner"
                            ref={mapRef}
                            style={{
                                width: renderWidth,
                                height: renderHeight,
                                transform: `scale(${zoom})`,
                            }}
                        >

                            {/* IMAGE */}

                            <img
                                src={selectedFloor.floorImage}
                                alt=""
                                className="floor-image"
                            />

                            {/* HEATMAP */}

                            {selectedFloor.zones.map(
                                (zone) => {

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

                                    const mappedX =
                                        centerX * scaleX;

                                    const mappedY =
                                        centerY * scaleY;

                                    const occupancy =
                                        Math.max(
                                            0,
                                            Math.min(
                                                100,
                                                zone.occupancy +
                                                (timelineHour - 14) * 2
                                            )
                                        );

                                    const heatSize =
                                        occupancy >= 90
                                            ? 420
                                            : occupancy >= 70
                                                ? 350
                                                : occupancy >= 50
                                                    ? 280
                                                    : 230;

                                    return (
                                        <React.Fragment
                                            key={zone.zoneId}
                                        >

                                            <div
                                                className={`heat-glow ${gradientType}`}
                                                style={{
                                                    width: heatSize,
                                                    height: heatSize,

                                                    left: mappedX,
                                                    top: mappedY,

                                                    opacity:
                                                        occupancy / 100,
                                                }}
                                            />

                                            <div
                                                className="zone-label"
                                                style={{
                                                    left: mappedX,
                                                    top: mappedY,
                                                }}
                                            >
                                                <h4>
                                                    {zone.zoneName}
                                                </h4>

                                                <p>
                                                    {occupancy}%
                                                </p>
                                            </div>

                                        </React.Fragment>
                                    );
                                }
                            )}

                        </div>

                        {/* TOOLS */}

                        <div className="map-tools">

                            <button
                                onClick={() =>
                                    setZoom((p) => p + 0.1)
                                }
                            >
                                +
                            </button>

                            <button
                                onClick={() =>
                                    setZoom((p) =>
                                        Math.max(0.7, p - 0.1)
                                    )
                                }
                            >
                                −
                            </button>

                            <div
                                className="gradient-tool first"
                                onClick={() =>
                                    setGradientType("default")
                                }
                            />

                            <div
                                className="gradient-tool second"
                                onClick={() =>
                                    setGradientType("purple")
                                }
                            />

                        </div>

                        {/* TIMELINE */}

                        <div className="timeline-container">

                            <input
                                type="range"
                                min="9"
                                max="19"
                                value={timelineHour}
                                onChange={(e) =>
                                    setTimelineHour(
                                        Number(e.target.value)
                                    )
                                }
                            />

                            <div className="timeline-hours">

                                {hours.map((hour) => (
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
}