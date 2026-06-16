import React from "react";

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
            style={{ backgroundColor: getColor(zone.value) }}
        >
            <div className="zonename">{zone.name}</div>
            <strong className="zoneValue">{zone.value}%</strong>
        </div>
    );
};

export default ZoneCard;