import React from "react";

// const getColor = (v) => {
//     if (v < 30) return "#1E88E5";
//     if (v < 70) return "#33B56A";
//     if (v < 85) return "#FBC002";
//     return "#F44336";
// };
const getColor = (v) => {
    if (v < 30) return "#1E88E5";
    if (v < 70) return "#33B56A";
    if (v < 85) return "#FBC002";
    return "#F44336";
};
const ZoneCard = ({ zone }) => {
    return (
        <div
            className="zone-card"
            style={{ backgroundColor: getColor(zone.occupancyPercentage) }}
        >
            <div className="zonename">{zone.name}</div>
            <strong className="zoneValue"> {Math.round(zone.occupancyPercentage)}%</strong>
        </div>
    );
};

export default ZoneCard;