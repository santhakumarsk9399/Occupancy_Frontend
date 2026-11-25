import React from "react";
import {
    FiUsers,
    FiUserCheck,
    FiTrendingUp,
    FiClock,
    FiHome,
} from "react-icons/fi";

import "./TVSidebar.css";
// import {
//     FiUsers,
//     FiLogIn,
//     FiTrendingUp,
//     FiClock,
//     FiAlertTriangle,
//     FiCalendar,
// } from "react-icons/fi";
import "./TVSidebar.css"
const Card = ({
    icon,
    color,
    title,
    value,
    subText,
    trend,
    trendType,
    trendColorUp = "#16a34a",
    trendColorLow = "#ef4444",
    valueClass = "",
}) => (
    <div
        className="tv-card"
        style={{
            borderLeft: `5px solid ${color}`,
        }}
    >

        <div
            className="tv-card-icon"
            style={{ background: color }}
        >
            {icon}
        </div>

        <div className="tv-card-content">

            <span className="tv-card-title">
                {title}
            </span>

            <h2 className={valueClass}>{value}</h2>

            <div className="tv-card-footer">

                <span>{subText}</span>
        
                {trend && (
                    <span
                        className="tv-trend"
                        style={{ color: trendType === "up" ? trendColorUp : trendColorLow }}
                    >
                     {trendType === "up" ? "↗" : "↘"} {trend}
                 </span>
                )}

            </div>

        </div>

    </div>
);

const TVSidebar = ({ widget2, widget3, widget4,liveOccupancy }) => {
    return (

        <div className="tv-sidebar">

            <h3 className="live-summary-title">
                <span className="live-dot"></span>
                Live Summary
            </h3>
            <Card
                icon={<FiUsers />}
                color="#22C55E"
                title="Occupancy"
                value={
                    liveOccupancy?.totalOccupancy ??
                    "-"
                }
                // subText="Today"
            // trend="+8.5%"
            />
            <Card
                icon={<FiUserCheck />}
                color="#3385F5"
                title="Total Visitors"
                value={widget2?.TodayTotalVisitors ?? "-"}
                // subText="Today"
                // trend="+8.5%"
            />
            <Card
                icon={<FiHome />}
                color="#8352F5"
                title="Capacity"
                value={liveOccupancy?.totalCapacities ?? "-"}
                // subText="Today"
            />
            {/* <Card
                icon={<FiCalendar />}
                color="#8352F5"
                title="Total Visitors"
                value={widget2?.YesterdayTotalVisitors ?? "-"}
                subText="yesterday"
                trend= {`${Math.abs(widget2.OccupancyPercentage ?? 0).toFixed(2)}%`}
                trendType ={widget2.Status == "Low" ? "down" : "up"}
            /> */}
            {/* <Card
                icon={<FiLogIn />}
                color="#22C55E"
                title="Visitors Inside"
                value={widget3?.LastHourTotalVisitors ?? "-"}
                subText="Last Hour"
                // trend={`${Math.abs(widget3.OccupancyPercentage ?? 0).toFixed(2)}%`}
                trendType={widget3.Status == "Low" ? "down" : "up"}
            /> */}
            <Card
                icon={<FiTrendingUp />}
                color="#FF9900"
                title="Peak Occupancy"
                value={widget4?.PeakHourOccupancy ?? "--"}
                // subText="Today"
            />
            <Card
                icon={<FiClock />}
                color="#4B3FDC"
                title="Peak Hour"
                value={widget4?.PeakHour ? `${widget4?.PeakHour} Hr`: "--"}
                // subText="Today"
                valueClass="peak-hour-value"
            />
        

            {/* <Card
                icon={<FiClock />}
                color="#FDBA3B"
                title="Avg. Dwell Time"
                value="28 min"
                subText="Today"
                trend="+3.1%"
            />

            <Card
                icon={<FiAlertTriangle />}
                color="#F87171"
                title="Active Alerts"
                value="7"
                subText="Requires Attention"
                trendColor="#EF4444"
            />

            <Card
                icon={<FiCalendar />}
                color="#60A5FA"
                title="Today"
                value={widget2?.TodayTotalVisitors ?? "-"}
                subText="Total Visitors"
                trend="+8.5%"
            /> */}

        </div>

    );

};

export default TVSidebar;