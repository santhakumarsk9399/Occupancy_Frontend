import React from "react";
import "./heatmapFilter.css";

export default function HeatmapFilter({
    value,
    onChange,
    onApply,
    onClear,
}) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000)  // subtract 24 hours
        .toISOString()
        .split('T')[0];
    return (

        <div className="heatmap-filter-bar">

            <span className="heatmap-filter-label">
                Custom Date
            </span>

            <div className="heatmap-date-wrapper">

                <input
                    type="date"
                    value={value || ""}
                    max={yesterday} // yesrerday date
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                    className="heatmap-date-input"
                />
            </div>

            <button
                className="heatmap-clear-btn"
                onClick={onClear}
            >
                Clear
            </button>

            <button
                className="heatmap-apply-btn"
                onClick={() => onApply(value)}
            >
                Apply
            </button>

        </div>

    );
}