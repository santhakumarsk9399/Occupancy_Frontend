import React, { useState, useEffect } from "react";
import "../../Components/Styles/Tooltip.css";

const SmoothTooltip = ({ active, payload, coordinate }) => {
  const [visible, setVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (active && payload && payload.length && payload[0].payload) {
      setTooltipData(payload[0].payload);
      setPosition({
        left: coordinate.x + 12,
        top: coordinate.y - 48,
      });
      setVisible(true);
    } else {
      const timeout = setTimeout(() => setVisible(false), 150);
      return () => clearTimeout(timeout);
    }
  }, [active, payload, coordinate]);

  if (!tooltipData) return null;
console.log(tooltipData)
  const zoneType = tooltipData.type?.toLowerCase() || "low";

  return (
    <div
      className={`custom-tooltip ${
        visible ? "fade-in-tooltip" : "fade-out-tooltip"
      } ${zoneType}-tooltip`}
      style={{
        position: "absolute",
        left: position.left,
        top: position.top,
        pointerEvents: "none",
      }}
    >
      <div className="tooltip-line">
        In: <span className="tooltip-count">{tooltipData.Incount}</span>
      </div>
      <div className="tooltip-line">
        Out: <span className="tooltip-count">{tooltipData.Outcount}</span>
      </div>
      <div className="tooltip-line">
        Occupancy:{" "}
        <span className="tooltip-count">{tooltipData.Occupancy}</span>
      </div>
      <div className="tooltip-line">
        Zone Name:{" "}
        <span className="tooltip-count">{tooltipData.ZoneName}</span>
      </div>
    </div>
  );
};

export default SmoothTooltip;
