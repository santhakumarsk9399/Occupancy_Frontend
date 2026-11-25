import React from "react";
import "../../Styles/Overview.css";
import { FiRefreshCw, FiShoppingBag, FiLayers } from "react-icons/fi";
const OccupancyOverview = ({
    occupancy = 18.37,
    inside = 151,
    capacity = 822,
    selectedFloor,
    selectedMall
}) => {
    const legend = [
        { color: "#2196F3", label: "0% - 20%", status: "Low" },
        { color: "#22C55E", label: "21% - 40%", status: "Moderate" },
        { color: "#FACC15", label: "41% - 60%", status: "Medium" },
        { color: "#F97316", label: "61% - 80%", status: "High" },
        { color: "#EF4444", label: "81% - 100%", status: "Very High" },
    ];
console.log(selectedFloor,selectedMall)
    return (
        <div className="occupancy-panel">
            {/* <div className="current-showing-card">

                <h4 className="panel-title">Currently Showing</h4>

                <div className="info-item">
                    <div className="info-icon mall">
                        <FiShoppingBag />
                    </div>

                    <div className="info-content">
                        <span>Mall</span>
                        <strong>{selectedMall?.mallName || "--"}</strong>
                    </div>
                </div>

                <div className="divider" />

                <div className="info-item">
                    <div className="info-icon floor">
                        <FiLayers />
                    </div>

                    <div className="info-content">
                        <span>Floor</span>
                        <strong>{selectedFloor?.floorName || "--"}</strong>
                    </div>
                </div>

                <div className="divider" />

                <div className="info-item">
                    <div className="info-icon rotate">
                        <FiRefreshCw />
                    </div>

                    <div className="info-content">
                        <span>Auto Rotate</span>
                        <strong className="rotate-time">
                            Next in 00:20 sec
                        </strong>
                    </div>
                </div>
            </div> */}
            <div className="current-showing-card">

                <h4 className="Overview-panel-title">
                    Currently Showing
                </h4>

                <div className="show-card mall-card">
                    <div className="info-icon mall">
                        <FiShoppingBag />
                    </div>

                    <div className="info-content">
                        <span>Mall</span>

                        <div
                            className="value-pill blue"
                            title={selectedMall?.mallName}
                        >
                            {selectedMall?.mallName || "--"}
                        {/* {"The Brookfields Mall"} */}
                        </div>
                    </div>
                </div>

                <div className="show-card floor-card">
                    <div className="info-icon floor">
                        <FiLayers />
                    </div>

                    <div className="info-content">
                        <span>Floor</span>

                        <div
                            className="value-pill purple"
                            title={selectedFloor?.floorName}
                        >
                            {selectedFloor?.floorName || "--"}
                            {/* {"First"} */}
                        </div>
                    </div>
                </div>

                {/* <div className="show-card rotate-card">
                    <div className="info-icon rotate">
                        <FiRefreshCw />
                    </div>

                    <div className="info-content">
                        <span>Floors rotate in every </span>

                        <div className="rotate-box">
                            30s
                        </div>

                    </div>
                </div> */}

            </div>
            <div className="occupancy-card">
                <h4 className="Overview-panel-title">
                    Occupancy Levels
                </h4>

                {/* <div className="legend-list">
                    {legend.map((item) => (
                        <div
                            key={item.label}
                            className="legend-row"
                        >
                            <span
                                className="legend-dot"
                                style={{ background: item.color }}
                            />

                            <div>
                                <div className="legend-range">
                                    {item.label}
                                </div>

                                <div className="legend-status">
                                    {item.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div> */}
                <div className="legend-list">

                    {legend.map((item) => (

                        <div
                            key={item.label}
                            className="legend-row"
                            style={{
                                borderLeft: `6px solid ${item.color}`
                            }}
                        >

                            <span
                                className="legend-dot"
                                style={{
                                    background: item.color
                                }}
                            />

                            <div className="legend-text">

                                <div className="legend-range">
                                    {item.label}
                                </div>

                                <div
                                    className="legend-status"
                                    style={{
                                        color: item.color
                                    }}
                                >
                                    {item.status}
                                </div>

                            </div>

                        </div>

                    ))}

                </div>
            </div>
        </div>
    );
};





export default OccupancyOverview;