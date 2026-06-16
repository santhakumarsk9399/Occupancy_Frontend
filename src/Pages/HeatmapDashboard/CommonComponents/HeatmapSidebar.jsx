import React from "react";

import "../Styles/mallwiseTab.css";

const HeatmapSidebar = ({

    mode = "mall",

    mallsData = [],

    selectedMall,
    setSelectedMall,

    selectedFloor,
    setSelectedFloor,

    selectedZone,
    setSelectedZone,

    children,

}) => {

    return (

        <div className="left-section">

            {/* =========================================
                FILTER CARD
            ========================================= */}

            <div className="filter-card">

                {/* =====================================
                    MALL
                ===================================== */}

                <div className="field-group">

                    <label>
                        Mall
                    </label>

                    <select

                        value={
                            selectedMall?.mallId
                        }

                        onChange={(e) => {

                            const mall =
                                mallsData.find(
                                    (m) =>
                                        m.mallId ===
                                        Number(
                                            e.target.value
                                        )
                                );

                            setSelectedMall(
                                mall
                            );

                            setSelectedFloor(
                                mall.floors[0]
                            );

                            if (
                                mode === "zone" &&
                                setSelectedZone
                            ) {

                                setSelectedZone(
                                    mall.floors[0]
                                        .zones[0]
                                );

                            }

                        }}

                    >

                        {mallsData.map(
                            (mall) => (

                                <option

                                    key={
                                        mall.mallId
                                    }

                                    value={
                                        mall.mallId
                                    }

                                >

                                    {
                                        mall.mallName
                                    }

                                </option>

                            )
                        )}

                    </select>

                </div>

                {/* =====================================
                    FLOOR
                ===================================== */}

                {/* <div className="field-group">

                    <label>
                        Floor
                    </label>

                    <div className="floor-list">

                        {selectedMall?.floors.map(
                            (floor) => (

                                <div

                                    key={
                                        floor.floorId
                                    }

                                    className={`floor-item ${selectedFloor?.floorId === floor.floorId
                                        ? "active-floor"
                                        : ""
                                        }`}

                                    onClick={() => {

                                        setSelectedFloor(
                                            floor
                                        );

                                        if (
                                            mode === "zone" &&
                                            setSelectedZone
                                        ) {

                                            setSelectedZone(
                                                floor
                                                    .zones[0]
                                            );

                                        }

                                    }}

                                >

                                    <span>
                                        {
                                            floor.floorName
                                        }
                                    </span>

                                    <span className="floor-badge">

                                        {floor.visitors.toLocaleString()}

                                    </span>

                                </div>

                            )
                        )}

                    </div>

                </div> */}

                <div className="field-group">

                    <label>
                        Floor
                    </label>

                    {
                        mode === "zone"

                            ? (

                                <select

                                    value={
                                        selectedFloor?.floorId
                                    }

                                    onChange={(e) => {

                                        const floor =
                                            selectedMall?.floors.find(
                                                (f) =>
                                                    f.floorId ===
                                                    Number(
                                                        e.target.value
                                                    )
                                            );

                                        setSelectedFloor(
                                            floor
                                        );

                                        if (
                                            setSelectedZone
                                        ) {

                                            setSelectedZone(
                                                floor.zones[0]
                                            );

                                        }

                                    }}

                                >

                                    {selectedMall?.floors.map(
                                        (floor) => (

                                            <option

                                                key={
                                                    floor.floorId
                                                }

                                                value={
                                                    floor.floorId
                                                }

                                            >

                                                {floor.floorName}

                                            </option>

                                        )
                                    )}

                                </select>

                            )

                            : (

                                <div className="floor-list">

                                    {selectedMall?.floors.map(
                                        (floor) => (

                                            <div

                                                key={
                                                    floor.floorId
                                                }

                                                className={`floor-item ${selectedFloor?.floorId === floor.floorId
                                                        ? "active-floor"
                                                        : ""
                                                    }`}

                                                onClick={() => {

                                                    setSelectedFloor(
                                                        floor
                                                    );

                                                    if (
                                                        mode === "zone" &&
                                                        setSelectedZone
                                                    ) {

                                                        setSelectedZone(
                                                            floor
                                                                .zones[0]
                                                        );

                                                    }

                                                }}

                                            >

                                                <span>
                                                    {
                                                        floor.floorName
                                                    }
                                                </span>

                                                <span className="floor-badge">

                                                    {floor.visitors.toLocaleString()}

                                                </span>

                                            </div>

                                        )
                                    )}

                                </div>

                            )

                    }

                </div>
                {/* =====================================
                    ZONE
                    ONLY FOR ZONEWISE
                ===================================== */}

                {mode === "zone" && (

                    <div className="field-group">

                        <label>
                            Zone
                        </label>

                        <div className="floor-list">

                            {selectedFloor?.zones.map(
                                (zone) => (

                                    <div

                                        key={
                                            zone.zoneId
                                        }

                                        className={`floor-item ${selectedZone?.zoneId === zone.zoneId
                                            ? "active-floor"
                                            : ""
                                            }`}

                                        onClick={() =>
                                            setSelectedZone(
                                                zone
                                            )
                                        }

                                    >

                                        <span>
                                            {
                                                zone.zoneName
                                            }
                                        </span>

                                        <span className="floor-badge">

                                            {zone.occupancy.toLocaleString()}

                                        </span>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                )}

            </div>

            {/* =========================================
                STATS SECTION
            ========================================= */}

            <div className="stats-panel">

                {children}

            </div>

        </div>

    );

};

export default HeatmapSidebar;