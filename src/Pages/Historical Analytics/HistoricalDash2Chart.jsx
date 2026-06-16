// import React, { useState } from "react";
// import {
//   BarChart,
//   Bar,
//   LineChart,
//   Line,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   LabelList,
//   ResponsiveContainer,
//   Legend
// } from "recharts";
// import { Modal } from "react-bootstrap";
// import "../../Pages/Historical Analytics/HistoricalChart.css";
// import SmoothTooltip from "../CommonComponents/ToolTip";
// import NoData from "../CommonComponents/NoDataAvailable";

// const HistoricalAnalyticsDash2Chart = ({ data }) => {
//   const [showModal, setShowModal] = useState(false);
// const CustomLegend = () => (
//   <div
//     style={{
//       display: "flex",
//       flexDirection: "column",
//       alignItems: "center",
//       marginBottom: 16,
//       marginTop: 25,
//       width: "100%",
//     }}
//   >
//     <div
//       style={{
//         display: "flex",
//         flexWrap: "wrap",
//         justifyContent: "center",
//         gap: "16px 24px", // row-gap, column-gap
//         maxHeight: 140,   // limit legend height
//         overflowY: zones.length > 12 ? "auto" : "visible", // scroll only if many zones
//         padding: "8px 12px",
//         border: zones.length > 12 ? "1px solid #e5e7eb" : "none",
//         borderRadius: 8,
//         width: "100%",
//       }}
//     >
//       {/* {zones.map((zone, idx) => { */}
//         {/* const isActive = activeZones.has(zone); */}
//         return (
//           <div
//             key={zone}
//             onClick={() => toggleZone(zone)}
//             style={{
//               display: "flex",
//               alignItems: "center",
//               cursor: "pointer",
//               userSelect: "none",
//               flex: "0 1 160px", // allow wrapping within width
//               justifyContent: "flex-start",
//             }}
//           >
//             <div
//               style={{
//                 width: 18,
//                 height: 18,
//                 borderRadius: 4,
//                 marginRight: 6,
//                 background: isActive ? colors[idx] : "#e5e7eb",
//                 color: "#fff",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontSize: 12,
//                 transition: "0.2s",
//                 flexShrink: 0,
//               }}
//             >
//               {isActive && "✓"}
//             </div>
//             <span
//               style={{
//                 whiteSpace: "nowrap",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 maxWidth: 120,
//               }}
//               // title={zone}
//             >
//               {"In Count"}
//             </span>
//           </div>
//         );
//       {/* })} */}
//     </div>
//   </div>
// );
//   return (
//     <>
//       {data && data.length > 0 ? (
//         // <div className="analytics-container_chart">
//         //   <div className="chart-wrapper">
//         //     <ResponsiveContainer width="100%" height={420}>
//         //       <LineChart
//         //         className="custom-bar-chart"
//         //         data={data}
//         //         margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//         //       >
//         //         <CartesianGrid
//         //           strokeDasharray="3 3"
//         //           vertical={false}
//         //           stroke="#e5e7eb"
//         //         />
//         //         <XAxis
//         //           dataKey="hour"
//         //           height={80}
//         //           tick={{ fontSize: 12 }}
//         //           label={{
//         //             value: "HOURS",
//         //             position: "insideBottom",
//         //             offset: 30,
//         //             fontSize: 14,
//         //           }}
//         //         />
//         //         <YAxis
//         //           label={{
//         //             value: "COUNTS",
//         //             angle: -90,
//         //             position: "insideLeft",
//         //             offset: 10, // ⬅️ Add some offset
//         //             dx: -20, // ⬅️ Move text away from ticks
//         //             style: { fontSize: 14 },
//         //           }}
//         //         />
//         //         <Tooltip content={<SmoothTooltip />} cursor={false} />
//         //         <Line
//         //           dataKey="InCount"
//         //           fill="#25B27A"
//         //           radius={[4, 4, 0, 0]}
//         //           barSize={70}
//         //           isAnimationActive={false}
//         //         >
//         //           <LabelList
//         //             dataKey="InCount"
//         //             position="top"
//         //             fill="black"
//         //             fontSize={14}
//         //           />
//         //         </Line>
//         //       </LineChart>
//         //     </ResponsiveContainer>
//         //   </div>
//         // </div>
//         <div className="dash3-chart-wrap">
//           <ResponsiveContainer width="100%" height={450} tabIndex={-1}>
//             <AreaChart
//               data={data}
//               margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
//             >
//               <defs>
//                 <linearGradient id="fill2" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="10%" stopColor="#1d4ed8" stopOpacity={0.18} />
//                   <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid
//                 strokeDasharray="3 3"
//                 vertical={false}
//                 stroke="#e5e7eb"
//               />
//               <XAxis
//                 dataKey="hour"
//                 tick={{ fontSize: 12 }}
//                 interval={0}
//                 angle={-25}
//                 textAnchor="end"
//                 height={60}
//                 // tickFormatter={(value) => {
//                 //   const [h, m] = value.split(":");
//                 //   return m === "00" ? `${h}:00` : "";
//                 // }}
//                 label={{
//                   value: "HOURS",
//                   position: "insideBottom",
//                   offset: 0,
//                   fill: "#4b5563",
//                   fontSize: 13,
//                   fontWeight: 600,
//                 }}
//               />
//               <YAxis
//                 tick={{ fontSize: 12 }}
//                 width={60}
//                 label={{
//                   value: "COUNTS",
//                   angle: -90,
//                   position: "insideLeft",
//                   fill: "#4b5563",
//                   fontSize: 13,
//                   fontWeight: 600,
//                 }}
//               />
//               <Legend />
//               <Tooltip
//                 content={({ active, payload, label }) => {
//                   if (active && payload && payload.length) {
//                     const val = payload[0].value;
//                     return (
//                       <div
//                         style={{
//                           background: "#fff",
//                           border: "1px solid #d1d5db",
//                           borderRadius: 8,
//                           padding: "8px 10px",
//                           fontSize: 13,
//                         }}
//                       >
//                         <div>
//                           Hour :{" "}
//                           <span style={{ marginBottom: 6, fontWeight: 600 }}>
//                             {label}
//                           </span>
//                         </div>
//                         <div>
//                           In Count :{" "}
//                           <span style={{ marginBottom: 6, fontWeight: 600 }}>
//                             {val}
//                           </span>
//                         </div>
//                       </div>
//                     );
//                   }
//                   return null;
//                 }}
//                 cursor={{ strokeDasharray: "4 4", stroke: "#111827" }}
//               />
//               <Area
//                 type="monotone"
//                 dataKey="InCount"
//                 stroke="#1d4ed8"
//                 fill="url(#fill2)"
//                 strokeWidth={3}
//                 dot={{ r: 2 }}
//                 activeDot={{ r: 6 }}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>
//       ) : (
//         <NoData name="no-data-Historical_dashboard" />
//       )}
//     </>
//   );
// };

// export default HistoricalAnalyticsDash2Chart;

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";
import "./HistoricalChart.css";
import NoData from "../CommonComponents/NoDataAvailable";

const HistoricalAnalyticsDash2Chart = ({ data }) => {
  // Custom Legend for the static name "In Count"
  const CustomLegend = () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 16,
        marginBottom: 8,
        fontSize: 14,
        fontWeight: 600,
        color: "#4b5563",
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          marginRight: 6,
          backgroundColor: "#1d4ed8", // Color for the legend item
        }}
      ></div>
      <span>{"In Count"}</span>
    </div>
  );

  return (
    <>
      {data && data.length > 0 ? (
        <div className="dash3-chart-wrap">
          <ResponsiveContainer width="100%" height={450} tabIndex={-1}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fill2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor="#1d4ed8" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={60}
                label={{
                  value: "HOURS",
                  position: "insideBottom",
                  offset: 0,
                  // fill: "#4b5563",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                width={60}
                label={{
                  value: "COUNTS",
                  angle: -90,
                  position: "insideLeft",
                  // fill: "#4b5563",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              />
              {/* Custom legend component */}
              <Legend content={<CustomLegend />} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const val = payload[0].value;
                    return (
                      <div
                        style={{
                          background: "#fff",
                          border: "1px solid #d1d5db",
                          borderRadius: 8,
                          padding: "8px 10px",
                          fontSize: 13,
                        }}
                      >
                        <div>
                          Hour :{" "}
                          <span style={{ marginBottom: 6, fontWeight: 600 }}>
                            {label}
                          </span>
                        </div>
                        <div>
                          In Count :{" "}
                          <span style={{ marginBottom: 6, fontWeight: 600 }}>
                            {val}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ strokeDasharray: "4 4", stroke: "#111827" }}
              />
              <Area
                type="monotone"
                dataKey="InCount"
                stroke="#1d4ed8"
                fill="url(#fill2)"
                strokeWidth={3}
                dot={{ r: 2 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <NoData name="no-data-Historical_dashboard" />
      )}
    </>
  );
};

export default HistoricalAnalyticsDash2Chart;
