import React from "react";
// import { FiEye, FiArrowLeft, FiCalendar, FiClock, FiBell, FiHome, FiTrendingUp } from "react-icons/fi";
import {
    FiUsers,
    FiCalendar,
    FiLogIn,
    FiClock,
    FiTrendingUp,
} from "react-icons/fi";
const SummaryCards = ({ cards }) => {
    const widget1 = cards?.widget1?.data?.[0] || {};
    const widget2 = cards?.widget2?.data?.[0] || {};
    const widget3 = cards?.widget3?.data?.[0] || {};
    const widget4 = cards?.widget4?.data?.[0] || {};
    const data = [
        {
            title: "Total Visitors",
            value: widget2.TodayTotalVisitors ?? "-",
            sub: "Today",
            // trend: "+8.5%",
            // trendType: "up",
            icon: <FiUsers />,
        },
        {
            title: "Total Visitors",
            value: widget2.YesterdayTotalVisitors ?? "-",
            sub: "Yesterday",
            trend: `${Math.abs(widget2.OccupancyPercentage ?? 0).toFixed(2)}%`,
            trendType: widget2.Status == "Low" ? "down" : "up",
            icon: <FiCalendar />,
        },
        {
            title: "Visitors Inside",
            value: widget3.LastHourTotalVisitors ?? "-",
            sub: "Last hour",
            trend: `${Math.abs(widget3.OccupancyPercentage ?? 0).toFixed(2)}%`,
            trendType: widget3.Status == "Low" ? "down" : "up",
            icon: <FiLogIn />,
        },
        {
            title: "Peak Hour",
            value: widget4.PeakHour ?? "-",
            // sub: "6,284 Visitors",
            icon: <FiClock />,
        },
        {
            title: "Peak Occupancy",
            value: widget4.PeakHourOccupancy ?? "-",
            // sub: "6,284 Visitors",
            icon: <FiTrendingUp />,
        },

    ];

    return (
        <div className="summary">
            {data.map((item, i) => (
                <div key={i} className="summary-card">
                    <div className="card-header">
                        <div className="card-value">{item.value}</div>
                        <div className="card-icon">{item.icon}</div>
                    </div>

                    <div className="card-title">{item.title}</div>  {/* ← move title here, outside header */}

                    <div className="card-bottom">                   {/* ← new bottom row */}
                        <span className="card-sub">{item.sub}</span>
                        {item.trend && (
                            <span className={`card-trend ${item.trendType}`}>
                                {item.trendType === "up" ? "↗" : "↘"} {item.trend}
                            </span>
                        )}
                        {item.isAlert && (
                            <span className="card-alert">1 New alert</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SummaryCards;

