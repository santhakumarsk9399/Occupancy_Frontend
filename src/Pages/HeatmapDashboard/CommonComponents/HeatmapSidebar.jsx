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
    // console.log(mallsData)
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
                        value={selectedMall?.mallId ?? ""}
                        onChange={(e) => {
                            const mall = mallsData.find(
                                (m) => String(m.mallId) === e.target.value
                            );

                            if (!mall) return;

                            setSelectedMall(mall);

                            const firstFloor = mall.floors?.[0];

                            if (firstFloor) {
                                setSelectedFloor(firstFloor);

                                if (mode === "zone" && setSelectedZone) {
                                    setSelectedZone(firstFloor.zones?.[0]);
                                }
                            }
                        }}
                    >
                        {mallsData.map((mall) => (
                            <option
                                key={mall.mallId}
                                value={String(mall.mallId)}
                            >
                                {mall.mallName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="field-group">
                    <label>
                        Floor
                    </label>
                    {
                        mode === "zone"
                            ? (
                                <select
                                    value={String(selectedFloor?.floorId ?? "")}
                                    onChange={(e) => {
                                        const floor = selectedMall?.floors?.find(
                                            (f) => String(f.floorId) === e.target.value
                                        );

                                        if (!floor) return;

                                        setSelectedFloor(floor);
                                        setSelectedZone(floor.zones?.[0] ?? null);
                                    }}
                                >
                                    {(selectedMall?.floors ?? []).map((floor) => (
                                        <option
                                            key={floor.floorId}
                                            value={String(floor.floorId)}
                                        >
                                            {floor.floorName}
                                        </option>
                                    ))}
                            </select>
                            //     <select value={selectedFloor?.floorId}
                            //     onChange={(e) => {
                            //         const floor =
                            //             selectedMall?.floors.find(
                            //                 (f) =>
                            //                     f.floorId ===
                            //                     Number(
                            //                         e.target.value
                            //                     )
                            //             );
                            //         setSelectedFloor(floor);
                            //         if (setSelectedZone) {
                            //             setSelectedZone(floor.zones[0]);
                            //         }

                            //     }}

                            // >

                            //     {(selectedMall?.floors ?? []).map(
                            //         (floor) => (

                            //             <option

                            //                 key={
                            //                     floor.floorId
                            //                 }

                            //                 value={
                            //                     floor.floorId
                            //                 }

                            //             >

                            //                 {floor.floorName}

                            //             </option>

                            //         )
                            //     )}

                            // </select>

                            )

                            : (
                                <div className="floor-list">
                                    {(selectedMall?.floors ?? []).map(
                                        (floor) => (
                                            <div
                                                key={floor.floorId}
                                                className={`floor-item ${selectedFloor?.floorId === floor.floorId ? "active-floor" : ""}`}
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

                            {(selectedFloor?.zones ?? []).map(
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