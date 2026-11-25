import React from "react";
import "../../Styles/HeatmapBottomLegend.css";

const legendData = [
    {
        color: "#2F80ED",
        title: "Low",
        range: "0% - 20%",
    },
    {
        color: "#22C55E",
        title: "Moderate",
        range: "21% - 40%",
    },
    {
        color: "#FACC15",
        title: "Medium",
        range: "41% - 60%",
    },
    {
        color: "#F97316",
        title: "High",
        range: "61% - 80%",
    },
    {
        color: "#EF4444",
        title: "Very High",
        range: "81% - 100%",
    },
];

const HeatmapBottomLegend = () => {
    return (
        <div className="heatmap-bottom-legend">
            {legendData.map((item) => (
                <div className="legend-card" key={item.title}>
                    <span
                        className="legend-dot"
                        style={{ background: item.color }}
                    />

                    <div className="legend-content">
                        <div className="legend-title">
                            {item.title}
                        </div>

                        <div className="legend-range">
                            {item.range}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HeatmapBottomLegend;