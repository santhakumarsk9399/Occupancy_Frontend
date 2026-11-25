


import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import "../../Components/Styles/LiveChart.css"
const getColorByValue = (value) => {
  if (value <= 500) return "#28a745"; // Green
  if (value <= 800) return "#ffc107"; // Yellow
  return "#dc3545"; // Red
};

const getTypeByValue = (value) => {
  if (value <= 500) return "Low";
  if (value <= 800) return "Medium";
  return "High";
};

const LiveOccupancyChart = ({ data }) => {
  const categorizedData = data.map((item) => ({
    ...item,
    type: getTypeByValue(item.occupancy),
    fill: getColorByValue(item.occupancy),
  }));

  const [visibleTypes, setVisibleTypes] = useState({
    Low: true,
    Medium: true,
    High: true,
  });

  const handleCheckboxChange = (type) => {
    setVisibleTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const filteredData = categorizedData.filter(
    (item) => visibleTypes[item.type]
  );

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        {Object.keys(visibleTypes).map((type) => (
          <label key={type} style={{ marginRight: "20px" }}>
            <input
              type="checkbox"
              checked={visibleTypes[type]}
              onChange={() => handleCheckboxChange(type)}
              style={{ marginRight: "5px" }}
            />
            <span
              style={{
                color: getColorByValue(
                  type === "Low" ? 400 : type === "Medium" ? 700 : 900
                ),
              }}
            >
              {type} 
            </span>
          </label>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={filteredData}
          margin={{ top: 30, right: 30, bottom: 50, left: 20 }}
        >
          <XAxis dataKey="zone" angle={-10} textAnchor="end" />
          <YAxis
            label={{ value: "COUNTS", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            formatter={(value, name, props) => [value, "Occupancy"]}
            labelFormatter={(label) => {
              const item = categorizedData.find((d) => d.zone === label);
              return `In : ${item?.in}\nOut : ${item?.out}\nOccupancy : ${item?.occupancy}`;
            }}
          />
          <Bar dataKey="occupancy" fill="#8884d8">
            <LabelList dataKey="occupancy" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LiveOccupancyChart;

