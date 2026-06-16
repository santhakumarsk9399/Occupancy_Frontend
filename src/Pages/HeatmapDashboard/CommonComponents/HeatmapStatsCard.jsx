import React from "react";
import "../Styles/mallwiseTab.css";

const HeatmapStatsCard = ({
    value,
    title,
    subText,
    trend,
    trendType = "positive",
    icon,
    iconClass,
}) => {
    return (

        <div className="stats-card">

            <div className="stats-header">

                <div className="stats-value">
                    {value}
                </div>

                <div className={`stats-icon ${iconClass}`}>
                    {icon}
                </div>

            </div>

            <div className="stats-title">
                {title}
            </div>

            <div className="stats-footer">

                <span>{subText}</span>

                {trend && (
                    <span className={trendType}>
                        {trend}
                    </span>
                )}

            </div>

        </div>

    );
};

export default HeatmapStatsCard;