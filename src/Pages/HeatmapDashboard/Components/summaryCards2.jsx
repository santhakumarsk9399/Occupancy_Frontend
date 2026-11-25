import React from "react";
import {
    FiUsers,
    FiCalendar,
    FiLogIn,
    FiClock,
    FiTrendingUp,
    FiMoreVertical,
} from "react-icons/fi";
import "../Styles/summarycards.css";

const SummaryCards2 = ({ cards }) => {
    const widget2 = cards?.widget2?.data?.[0] || {};
    const widget3 = cards?.widget3?.data?.[0] || {};
    const widget4 = cards?.widget4?.data?.[0] || {};

    const data = [
        {
            type: "normal",
            title: "Total Visitors",
            value: widget2.TodayTotalVisitors ?? "-",
            sub: "Today",
            icon: <FiUsers />,
            color: "#4F46E5",
        },
        {
            type: "normal",
            title: "Total Visitors",
            value: widget2.YesterdayTotalVisitors ?? "-",
            sub: "Yesterday",
            trend: `${Math.abs(widget2.OccupancyPercentage ?? 0).toFixed(2)}%`,
            trendType: widget2.Status === "Low" ? "down" : "up",
            icon: <FiCalendar />,
            color: "#4F46E5",
        },
        {
            type: "normal",
            title: "Visitors Inside",
            value: widget3.LastHourTotalVisitors ?? "-",
            sub: "Last Hour",
            trend: `${Math.abs(widget3.OccupancyPercentage ?? 0).toFixed(2)}%`,
            trendType: widget3.Status === "Low" ? "down" : "up",
            icon: <FiLogIn />,
            color: "#4F46E5",
        },
        {
            type: "peakHour",
            title: "Peak Hour",
            value: widget4.PeakHour ?? "--:--",
            icon: <FiClock />,
            color: "#4F46E5",
        },
        {
            type: "peakOccupancy",
            title: "Peak Occupancy",
            value: widget4.PeakHourOccupancy ?? 0,
            icon: <FiTrendingUp />,
            color: "#F97316",
        },
    ];

    return (
        <div className="summary-grid">
            {data.map((item, index) => {
                if (item.type === "peakHour") {
                    return (
                        <div className="summary-card modern" key={index}>
                            <div className="card-top">
                                <div className="title-area">
                                    <div
                                        className="icon-circle"
                                        style={{ color: item.color }}
                                    >
                                        {item.icon}
                                    </div>

                                    <span>{item.title}</span>
                                </div>

                                <FiMoreVertical className="menu-icon" />
                            </div>

                            <div className="peak-box">
                                <h2>{item.value}</h2>

                                <div className="mini-bars">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>

                            <div className="divider"></div>

                            <div className="bottom-info">
                                <div className="small-circle">
                                    <FiUsers />
                                </div>

                                <div>
                                    <strong>Most Active</strong>
                                    <p>Time Today</p>
                                </div>
                            </div>
                        </div>
                    );
                }

                if (item.type === "peakOccupancy") {
                    return (
                        <div className="summary-card modern" key={index}>
                            <div className="card-top">
                                <div className="title-area">
                                    <div
                                        className="icon-circle orange"
                                    >
                                        {item.icon}
                                    </div>

                                    <span>{item.title}</span>
                                </div>

                                <FiMoreVertical className="menu-icon" />
                            </div>

                            <div className="peak-percent">
                                {item.value}%
                            </div>

                            {/* <div className="peak-subtitle">
                                Highest Occupancy Today
                            </div> */}

                            <div className="progress">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${Math.min(item.value, 100)}%`,
                                    }}
                                />
                            </div>

                            <div className="scale">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                            </div>

                            {/* <div className="badge-warning">
                                🔥 New High for Today!
                            </div> */}
                        </div>
                    );
                }

                return (
                    <div className="summary-card modern" key={index}>
                        <div className="card-top">
                            <div className="icon-circle">
                                {item.icon}
                            </div>

                            <FiMoreVertical className="menu-icon" />
                        </div>

                        <div className="big-number">
                            {item.value}
                        </div>

                        <div className="card-title">
                            {item.title}
                        </div>

                        <div className="line"></div>

                        <div className="footer-chip">
                            <span>{item.sub}</span>

                            {item.trend && (
                                <span
                                    className={
                                        item.trendType === "up"
                                            ? "trend-up"
                                            : "trend-down"
                                    }
                                >
                                    {item.trendType === "up"
                                        ? "↗"
                                        : "↘"}{" "}
                                    {item.trend}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SummaryCards2;