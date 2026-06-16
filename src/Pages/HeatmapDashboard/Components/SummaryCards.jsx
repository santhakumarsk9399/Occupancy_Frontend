// import React from "react";

// const SummaryCards = () => {
//     const cards = [
//         { title: "Total Visitors", value: "24,831" },
//         { title: "Visitors Inside", value: "3,205" },
//         { title: "Peak Hour", value: "14:00" },
//         { title: "Avg Dwell Time", value: "47 min" },
//         { title: "Active Alerts", value: "3" },
//     ];

//     return (
//         <div className="summary">
//             {cards.map((card, i) => (
//                 <div key={i} className="summary-card">
//                     <h3>{card.value}</h3>
//                     <p>{card.title}</p>
//                 </div>
//             ))}
//         </div>
//     );
// };

// export default SummaryCards;

import React from "react";
import { FiEye, FiArrowLeft, FiCalendar, FiClock, FiBell, FiHome } from "react-icons/fi";

const data = [
    {
        title: "Total Visitors",
        value: "24,831",
        sub: "Yesterday",
        trend: "+8.5%",
        trendType: "up",
        icon: <FiEye />,
    },
    {
        title: "Visitors Inside",
        value: "3,205",
        sub: "Last hour",
        trend: "-3.0%",
        trendType: "down",
        icon: <FiArrowLeft />,
    },
    {
        title: "Peak Hour",
        value: "14:00",
        sub: "6,284 Visitors",
        icon: <FiCalendar />,
    },
    {
        title: "Avg Dwell Time",
        value: "47 min",
        sub: "Yesterday",
        trend: "-4.1%",
        trendType: "down",
        icon: <FiClock />,
    },
    {
        title: "Active Alerts",
        value: "3",
        sub: "1 New alert",
        icon: <FiBell />,
    },
];

const SummaryCards = () => {
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