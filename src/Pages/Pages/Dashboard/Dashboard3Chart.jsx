import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const Dashboard3Chart = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) return null;

  // unique gradient id to avoid collisions if multiple charts exist
  const gradId = useMemo(
    () => `colorOccupancy_${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  return (
    <div className="dash3-chart-wrap">
      <ResponsiveContainer width="100%" height={360}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
        >
          {/* Gradient defs (unique id) */}
          <defs>
            <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
              {/* White till 50% */}
              <stop offset="0%" stopColor="#ffffff" stopOpacity={1} />
              <stop offset="50%" stopColor="#ffffff" stopOpacity={1} />

              {/* Blue at bottom */}
              <stop offset="100%" stopColor="#aecaf7ff" stopOpacity={1} />
            </linearGradient>
          </defs>

          {/* <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" /> */}
          <CartesianGrid stroke="#e5e7eb" />

          <XAxis
            dataKey="hourLabel"
            tick={{ fill: "#374151", fontSize: 12 }}
            axisLine={{ stroke: "#d1d5db" }}
            tickLine={{ stroke: "#d1d5db" }}
            label={{
              value: "Hours",
              position: "insideBottom",
              offset: -12,
              fill: "#4b5563",
              fontSize: 13,
              fontWeight: 600,
            }}
          />

          <YAxis
            tick={{ fill: "#374151", fontSize: 12 }}
            axisLine={{ stroke: "#d1d5db" }}
            tickLine={{ stroke: "#d1d5db" }}
            label={{
              value: "Counts",
              angle: -90,
              position: "insideLeft",
              fill: "#4b5563",
              fontSize: 13,
              fontWeight: 600,
            }}
          />

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
                      <strong>Hour:</strong> {label}
                    </div>
                    <div>
                      <strong>Live Occupancy:</strong> {val}
                    </div>
                  </div>
                );
              }
              return null;
            }}
            cursor={{ strokeDasharray: "4 4", stroke: "#111827" }}
          />

          {/* Strong area (near line) */}
          <Area
            type="monotone"
            dataKey="value"
            stroke="none"
            fill="url(#colorOccupancy)"
            isAnimationActive={true}
            animationDuration={800}
          />

          {/* Lighter area to extend the fade */}
          <Area
            type="monotone"
            dataKey="value"
            stroke="none"
            fill={`url(#${gradId}_light)`}
            isAnimationActive={true}
            animationDuration={800}
            className="dash3-area-light"
          />

          {/* Line on top */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#1d4ed8"
            strokeWidth={2}
            dot={{ r: 4, fill: "#1d4ed8", stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Dashboard3Chart;
// import React from "react";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ResponsiveContainer,
// } from "recharts";

// const Dashboard3Chart = ({ data }) => {
//   if (!data || !data.length) return <div>No Chart Data</div>;

//   return (
//     <ResponsiveContainer width="100%" height={300}>
//       <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
//         <defs>
//           <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
//             <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
//           </linearGradient>
//         </defs>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="hourLabel" />
//         <YAxis />
//         <Tooltip />
//         <Area
//           type="monotone"
//           dataKey="value"
//           stroke="#82ca9d"
//           fillOpacity={1}
//           fill="url(#colorOcc)"
//           isAnimationActive={true}
//           animationDuration={800}
//         />
//       </AreaChart>
//     </ResponsiveContainer>
//   );
// };

// export default Dashboard3Chart;
