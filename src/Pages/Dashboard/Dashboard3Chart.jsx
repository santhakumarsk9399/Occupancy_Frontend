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
      <ResponsiveContainer width="100%" height={360} tabIndex={-1}>
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
            dataKey="Hours"
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-25}
            textAnchor="end"
            height={60}
            tickFormatter={(value) => {
              const [h, m] = value.split(":");
              return m === "00" ? `${h}:00` : "";
            }}
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
          <Area
            type="monotone"
            dataKey="LiveOccupancy"
            stroke="#1d4ed8"
            fill="url(#fill2)"
            strokeWidth={3}
            dot={{ r: 2 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Dashboard3Chart;
