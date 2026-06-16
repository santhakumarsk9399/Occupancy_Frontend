import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  CartesianGrid,
} from "recharts";

import "../../Components/Styles/LiveChart.css";
import Icon from "../CommonComponents/icon";
import lowIcon from "../../Components/Assets/dashboard/LowZone_icon.png";
import medIcon from "../../Components/Assets/dashboard/MediumZone_icon.png";
import highIcon from "../../Components/Assets/dashboard/HighZone_icon.png";
import enlargeIcon from "../../Components/Assets/dashboard/EnlargeIcon.png";
import SmoothTooltip from "../CommonComponents/ToolTip";

// ✅ Get color based on status string
const getColorByStatus = (status) => {
  switch (status?.toLowerCase()) {
    case "low":
      return "#25B27A"; // Green
    case "medium":
      return "#FFB700"; // Yellow
    case "high":
      return "#F35F5F"; // Red
    default:
      return "#999"; // Fallback color
  }
};

// ✅ Normalize status for chart type
const getTypeFromStatus = (status) => {
  const normalized = status?.toLowerCase();
  if (
    normalized === "low" ||
    normalized === "medium" ||
    normalized === "high"
  ) {
    return status;
  }
  return "Low"; // Default fallback
};

const LiveOccupancyChart2Base = ({ data }) => {
  const [showModal, setShowModal] = useState(false);

  const categorizedData = useMemo(
    () =>
      (data || []).map((item) => ({
        ...item,
        type: getTypeFromStatus(item.Status),
        fill: getColorByStatus(item.Status),
      })),
    [data]
  );

  const counts = useMemo(
    () => ({
      Low: categorizedData.filter((d) => d.type.toLowerCase() === "low").length,
      Medium: categorizedData.filter((d) => d.type.toLowerCase() === "medium")
        .length,
      High: categorizedData.filter((d) => d.type.toLowerCase() === "high")
        .length,
    }),
    [categorizedData]
  );

  // ✅ Legend states for page and modal
  const [visibleTypesPage, setVisibleTypesPage] = useState({
    Low: true,
    Medium: true,
    High: true,
  });
  const [visibleTypesModal, setVisibleTypesModal] = useState({
    Low: true,
    Medium: true,
    High: true,
  });

  // ✅ Reset only modal legends when popup closes
  useEffect(() => {
    if (!showModal) {
      setVisibleTypesModal({
        Low: true,
        Medium: true,
        High: true,
      });
    }
  }, [showModal]);

  const filteredDataPage = useMemo(
    () => categorizedData.filter((item) => visibleTypesPage[item.type]),
    [categorizedData, visibleTypesPage]
  );

  const filteredDataModal = useMemo(
    () => categorizedData.filter((item) => visibleTypesModal[item.type]),
    [categorizedData, visibleTypesModal]
  );

  const ChartMarkup = ({ height, data }) => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        className="custom-bar-chart"
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e5e7eb"
        />
        <XAxis
          dataKey="ZoneName"
          height={80}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => {
            let total = data?.length || 0;
            if (!value) return "";
            if (total > 15) return value.substring(0, 5) + "...";
            if (total > 8) return value.substring(0, 8) + "...";
            if (total > 3 && value?.length > 20)
              return value.substring(0, 20) + "...";
            if (total <= 3 && value?.length > 30)
              return value.substring(0, 30) + "...";
            if (total <= 3 && value?.length > 20) return value;
            return value;
          }}
          label={{
            value: "ZONES",
            position: "insideBottom",
            offset: 30,
            fontSize: 14,
          }}
        />
        <YAxis
          label={{ value: "COUNTS", angle: -90, position: "insideLeft" }}
        />
        <Tooltip content={<SmoothTooltip />} cursor={false} />
        <Bar
          dataKey="Occupancy"
          radius={[4, 4, 0, 0]}
          barSize={70}
          isAnimationActive={false}
        >
          <LabelList
            dataKey="Occupancy"
            position="top"
            fill="black"
            fontSize={14}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );1

  return (
    <div className="live-chart-wrapper">
      <div className="topSections">
        <div className="chart-summary">
          <span className="legend-item">
            <Icon img={lowIcon} Img_width="20px" Img_height="20px" />{" "}
            {counts.Low}
            <p className="OccupiedZoneLabel_color">Low Occupied Zones</p>
          </span>
          <span className="legend-item">
            <Icon img={medIcon} Img_width="20px" Img_height="20px" />{" "}
            {counts.Medium}
            <p className="OccupiedZoneLabel_color">Medium Occupied Zones</p>
          </span>
          <span className="legend-item">
            <Icon img={highIcon} Img_width="20px" Img_height="20px" />{" "}
            {counts.High}
            <p className="OccupiedZoneLabel_color">High Occupied Zones</p>
          </span>
        </div>

        <div className="enlargeicon">
          <button onClick={() => setShowModal(true)} className="enlarge_icon">
            <Icon img={enlargeIcon} Img_width="20px" Img_height="20px" />
          </button>
        </div>
      </div>

      {/* ✅ Chart First */}
      <ChartMarkup height={550} data={filteredDataPage} />

      {/* ✅ Legend comes BELOW chart */}
      <div className="checkbox-legend below-chart">
        {["Low", "Medium", "High"].map((type) => (
          <label key={type} className="legend-checkbox">
            <input
              type="checkbox"
              className={`legend-checkbox-input ${type.toLowerCase()}`}
              checked={!!visibleTypesPage[type]}
              onChange={() =>
                setVisibleTypesPage((prev) => ({
                  ...prev,
                  [type]: !prev[type],
                }))
              }
            />
            <span className="legend-label">{type} Occupied</span>
          </label>
        ))}
      </div>

      <div className="update-text">
        <p className="update-text_sub">
          Note : Counts are updated every 15 seconds
        </p>
      </div>

      {/* ✅ Full-screen Modal */}
      {showModal && (
        <div
          className="chart-modal-overlay"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="chart-modal">
            <div className="modal-header">
              <h3 className="modal-title">Live Occupancy</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <ChartMarkup height={650} data={filteredDataModal} />
              <div className="checkbox-legend below-chart">
                {["Low", "Medium", "High"].map((type) => (
                  <label key={type} className="legend-checkbox">
                    <input
                      // type="checkbox"
                      // className={`legend-checkbox-input ${type.toLowerCase()}`}
                    type="checkbox"
                     className="legend-checkbox"
                      checked={!!visibleTypesModal[type]}
                      onChange={() =>
                        setVisibleTypesModal((prev) => ({
                          ...prev,
                          [type]: !prev[type],
                        }))
                      }
                    />
                    <span className="legend-label">{type} Occupied</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ Custom comparator: avoid re-render if data unchanged
const areEqual = (prevProps, nextProps) => {
  const a = prevProps.data || [];
  const b = nextProps.data || [];
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const pa = a[i];
    const pb = b[i];
    if (
      pa.ZoneName !== pb.ZoneName ||
      pa.Occupancy !== pb.Occupancy ||
      pa.Status !== pb.Status
    ) {
      return false;
    }
  }
  return true;
};

const LiveOccupancyChart2 = React.memo(LiveOccupancyChart2Base, areEqual);

export default LiveOccupancyChart2;
