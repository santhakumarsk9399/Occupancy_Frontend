import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
} from "recharts";

const Dashboard3Chart = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) return null;

  return (
    <div className="dash3-chart-wrap" style={{ width: "100%", height: 340 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
        >
          {/* Background grid - solid lines */}
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="0" />

          {/* X axis - show only hourly labels */}
          <XAxis
            dataKey="timeLabel"
            tickFormatter={(label) => {
              const [hour, min] = label.split(/[:-]/);
              return min === "00" ? `${hour}:00` : ""; // only whole hours
            }}
            interval={0}
            tick={{ fill: "#374151", fontSize: 12 }}
            axisLine={{ stroke: "#d1d5db" }}
            tickLine={{ stroke: "#d1d5db" }}
            label={{
              value: "Hours",
              position: "insideBottom",
              offset: -15,
              fill: "#4b5563",
              fontSize: 14,
              fontWeight: 500,
            }}
          />

          {/* Y axis */}
          <YAxis
            tick={{ fill: "#374151", fontSize: 12 }}
            axisLine={{ stroke: "#d1d5db" }}
            tickLine={{ stroke: "#d1d5db" }}
            label={{
              value: "Counts",
              angle: -90,
              position: "insideLeft",
              fill: "#4b5563",
              fontSize: 14,
              fontWeight: 500,
            }}
          />

          {/* Tooltip with vertical hover line */}
          <Tooltip
            cursor={{ stroke: "#2162cd", strokeWidth: 2 }}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "13px",
            }}
            formatter={(val) => [val, "Live Occupancy"]}
            labelFormatter={(label) => `Time: ${label}`}
          />

          {/* Gradient area under line */}
          <defs>
            <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={1} />
              <stop offset="50%" stopColor="#ffffff" stopOpacity={1} />
              <stop offset="100%" stopColor="#2162cd" stopOpacity={1} />
            </linearGradient>
          </defs>

          <Area
            type="monotone"
            dataKey="value"
            stroke="none"
            fill="url(#colorOccupancy)"
            isAnimationActive={false}
          />

          {/* Smooth line with 15-min dots */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#1e40af", stroke: "#fff", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Dashboard3Chart;
