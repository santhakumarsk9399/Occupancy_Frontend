import React from "react";

import "../Styles/mallwiseTab.css";

const HeatmapLegend = ({
    gradientType = "rainbow",
}) => {

    return (

        <div className="legend-section">

            {/* LABEL */}

            <span className="legend-label">
                Occupancy
            </span>

            {/* GRADIENT BAR */}

            <div
                className={`legend-bar ${gradientType}`}
            />

            {/* RANGE */}

            <div className="legend-range">

                <span>0%</span>

                <span>100%</span>

            </div>

        </div>

    );

};

export default HeatmapLegend;