import React from "react";
import "./heatmapFilter.css";

export default function HeatmapFilter({
    value,
    onChange,
    onApply,
    onClear,
}) {

    return (

        <div className="heatmap-filter-bar">

            <span className="heatmap-filter-label">
                Custom Date
            </span>

            <div className="heatmap-date-wrapper">

                <input
                    type="date"
                    value={value || ""}
                    max={new Date().toISOString().split("T")[0]} // today date
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