
// import React, { useState } from "react";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ResponsiveContainer,
//   Legend
// } from "recharts";
// import "../../Pages/Historical Analytics/HistoricalChart.css";
// import NoData from "../CommonComponents/NoDataAvailable";


// const MultizoneMiniChart = ({ data }) => {
//   const downsampleData = (data, points = 20) => {
//   if (!data || data.length <= points) return data;
//   const step = Math.ceil(data.length / points);
//   return data.filter((_, idx) => idx % step === 0);
// };

//   const chartData = downsampleData(data, 20);

//   return (
//     <ResponsiveContainer width="100%" height={70}>
//       <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
//         <defs>
//           <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="0%" stopColor="#2162CD" stopOpacity={0.5}/>
//             <stop offset="100%" stopColor="#2162CD" stopOpacity={0}/>
//           </linearGradient>
//         </defs>
//         <XAxis dataKey="Hours" hide />
//         <YAxis hide />
//         <Tooltip
//           content={({ active, payload, label }) => {
//             if (active && payload && payload.length) {
//               return (
//                 <div style={{ background: "#fff", padding: 6,  paddingRight: '12px', paddingLeft: '12px', borderRadius: 4, border: "1px solid #ddd", textAlign: 'left', fontSize: 14 }}>
//                   <div>Hour: <b>{label}</b></div>
//                   <div>Occupancy: <b>{payload[0].value}</b></div>
//                 </div>
//               );
//             }
//             return null;
//           }}
//         />
//         <Area
//           type="monotone"
//           dataKey="LiveOccupancy"
//           stroke="#1d4ed8"
//           fill="url(#miniGradient)"
//           strokeWidth={2}
//           dot={false}
//         />
//       </AreaChart>
//     </ResponsiveContainer>
//   );
// };

// export default MultizoneMiniChart;

// import React from "react";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// const MultizoneMiniChart = ({ data }) => {

//   // ✅ 1. Normalize data to ensure every 5-minute interval exists
//   const normalizeData = (data) => {
//     if (!data || data.length === 0) return [];

//     // Parse timestamps and sort
//     const sortedData = [...data].sort(
//       (a, b) => new Date(a.Hours) - new Date(b.Hours)
//     );

//     const start = new Date(sortedData[0].Hours);
//     const end = new Date(sortedData[sortedData.length - 1].Hours);

//     const normalized = [];
//     for (let t = new Date(start); t <= end; t.setMinutes(t.getMinutes() + 5)) {
//       const timeStr = t.toISOString(); // or your time format, e.g. 'HH:mm'
//       const found = sortedData.find(
//         (d) => Math.abs(new Date(d.Hours) - new Date(timeStr)) < 1000
//       );
//       normalized.push({
//         Hours: timeStr,
//         LiveOccupancy: found ? found.LiveOccupancy : 0, // or null
//       });
//     }

//     return normalized;
//   };

//   // ✅ 2. Optional: downsample to 20 points for mini display
//   const downsampleData = (data, points = 20) => {
//     if (!data || data.length <= points) return data;
//     const step = Math.ceil(data.length / points);
//     return data.filter((_, idx) => idx % step === 0);
//   };

//   const normalizedData = normalizeData(data);
//   const chartData = downsampleData(normalizedData, 20);

//   // ✅ 3. Chart rendering
//   return (
//     <ResponsiveContainer width="100%" height={70}>
//       <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
//         <defs>
//           <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="0%" stopColor="#2162CD" stopOpacity={0.5} />
//             <stop offset="100%" stopColor="#2162CD" stopOpacity={0} />
//           </linearGradient>
//         </defs>

//         {/* ✅ X-Axis formatted as 5-min intervals */}
//         <XAxis
//           dataKey="Hours"
//           hide
//           tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//         />
//         <YAxis hide />

//         <Tooltip
//           content={({ active, payload, label }) => {
//             if (active && payload && payload.length) {
//               return (
//                 <div
//                   style={{
//                     background: "#fff",
//                     padding: 6,
//                     paddingRight: "12px",
//                     paddingLeft: "12px",
//                     borderRadius: 4,
//                     border: "1px solid #ddd",
//                     textAlign: "left",
//                     fontSize: 14,
//                   }}
//                 >
//                   <div>Hour: <b>{new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</b></div>
//                   <div>Occupancy: <b>{payload[0].value}</b></div>
//                 </div>
//               );
//             }
//             return null;
//           }}
//         />

//         <Area
//           type="monotone"
//           dataKey="LiveOccupancy"
//           stroke="#1d4ed8"
//           fill="url(#miniGradient)"
//           strokeWidth={2}
//           dot={false}
//         />
//       </AreaChart>
//     </ResponsiveContainer>
//   );
// };

// export default MultizoneMiniChart;

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MultizoneMiniChart = ({ data }) => {
  const normalizeData = (data) => {
    if (!data || data.length === 0) return [];

    const sortedData = [...data].sort((a, b) => {
      const [aH, aM] = a.Hours.split(":").map(Number);
      const [bH, bM] = b.Hours.split(":").map(Number);
      return aH * 60 + aM - (bH * 60 + bM);
    });

    const startTime = sortedData[0].Hours;
    const endTime = sortedData[sortedData.length - 1].Hours;
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    const normalized = [];
    const start = new Date();
    start.setHours(startH, startM, 0, 0);

    const end = new Date();
    end.setHours(endH, endM, 0, 0);

    for (let t = new Date(start); t <= end; t.setMinutes(t.getMinutes() + 5)) {
      const hours = String(t.getHours()).padStart(2, "0");
      const minutes = String(t.getMinutes()).padStart(2, "0");
      const timeStr = `${hours}:${minutes}`;

      const found = sortedData.find((d) => d.Hours === timeStr);
      normalized.push({
        Hours: timeStr,
        LiveOccupancy: found ? found.LiveOccupancy : 0,
      });
    }

    return normalized;
  };

  const normalizedData = normalizeData(data);
  const chartData = normalizedData;

  return (
    <ResponsiveContainer width="100%" height={70}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2162CD" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#2162CD" stopOpacity={0} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="Hours"
          hide
        />
        <YAxis hide />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div
                  style={{
                    background: "#fff",
                    padding: 6,
                    paddingRight: "12px",
                    paddingLeft: "12px",
                    borderRadius: 4,
                    border: "1px solid #ddd",
                    textAlign: "left",
                    fontSize: 14,
                  }}
                >
                  <div>Hour: <b>{label}</b></div>
                  <div>Occupancy: <b>{payload[0].value}</b></div>
                </div>
              );
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="LiveOccupancy"
          stroke="#1d4ed8"
          fill="url(#miniGradient)"
          strokeWidth={1.2}
          dot={{ r: 1 }}
          activeDot={{ r: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MultizoneMiniChart;
