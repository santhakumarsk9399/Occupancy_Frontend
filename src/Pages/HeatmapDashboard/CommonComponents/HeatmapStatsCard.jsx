// import React from "react";
// import "../Styles/mallwiseTab.css";
// import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";
// const HeatmapStatsCard = ({
//     value,
//     title,
//     subText,
//     trend,
//     trendType = "positive",
//     icon,
//     iconClass,
// }) => {
//     return (

//         <div className="stats-card">
//             <div className="stats-header">
//                 <div className="stats-value">
//                     {value}
//                 </div>
//                 <div className={`stats-icon ${iconClass}`}>
//                     {icon}
//                 </div>
//             </div>
//             <div className="stats-title">
//                 {title}
//             </div>
//             <div className="stats-footer">
//                 <span>{subText}</span>

//                 {trend && (
//                     <span className={`trend ${trendType}`}>
//                         {trendType === "up" ? (
//                             <FiArrowUpRight className="trend-icon" />
//                         ) : (
//                             <FiArrowDownRight className="trend-icon" />
//                         )}
//                         {trend}
//                     </span>
//                 )}
//             </div>
//         </div>

//     );
// };

// export default HeatmapStatsCard;
import React from "react";
import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";
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
    const isPeakHour = title === "Peak Hour & Occupancy";

    return (
        <div className="stats-card">
            <div className="stats-header">
                <div className={`stats-value ${isPeakHour ? "peak-hour-value" : ""}`}>
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
                {isPeakHour ? (
                    <span className="peak-hour-subtext">
                        <span className="visitor-count">
                            {subText?.split(" ")[0]}
                        </span>{" "}
                        {subText?.split(" ").slice(1).join(" ")}
                    </span>
                ) : (
                    <>
                        <span>{subText}</span>

                        {trend && (
                            <span className={`trend ${trendType}`}>
                                {trendType === "up" ? (
                                    <FiArrowUpRight className="trend-icon" />
                                ) : (
                                    <FiArrowDownRight className="trend-icon" />
                                )}
                                {trend}
                            </span>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default HeatmapStatsCard;