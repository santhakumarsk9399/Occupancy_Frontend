import React, { useRef, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import NoData from "../CommonComponents/NoDataAvailable";
import Icon from "../CommonComponents/icon";
import ZoomInIcon1 from "../../Components/Assets/ZoomIn.svg";
import { Modal } from "react-bootstrap";
import "../../Pages/Historical Analytics/HistoricalChart.css";

// Dynamic colors for different zones
const generateColors = (count) =>
  Array.from(
    { length: count },
    (_, i) => `hsl(${(i * 360) / count}, 70%, 50%)`
  );

const HistoricalDash1Chart2 = ({ data }) => {
  const containerRef = useRef(null);
  const modalContainerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [showModal, setShowModal] = useState(false);

  if (!data || data.length === 0) {
    return <NoData name="no-data-Historical_dashboard" />;
  }

  const zones = Object.keys(data[0]).filter((k) => k !== "hour");
  const colors = generateColors(zones.length);

  // ✅ Separate states for inline and modal charts
  const [activeZonesInline, setActiveZonesInline] = useState(new Set(zones));
  const [activeZonesModal, setActiveZonesModal] = useState(new Set(zones));

  const toggleZoneInline = (zone) => {
    setActiveZonesInline((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(zone)) newSet.delete(zone);
      else newSet.add(zone);
      return newSet;
    });
  };

  const toggleZoneModal = (zone) => {
    setActiveZonesModal((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(zone)) newSet.delete(zone);
      else newSet.add(zone);
      return newSet;
    });
  };

  // ✅ Reusable Legend Component
  const CustomLegend = ({ activeZones, toggleZone }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: 16,
        marginTop: 25,
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "16px 24px",
          maxHeight: 140,
          overflowY: zones.length > 12 ? "auto" : "visible",
          padding: "8px 12px",
          border: zones.length > 12 ? "1px solid #e5e7eb" : "none",
          borderRadius: 8,
          width: "100%",
        }}
      >
        {zones.map((zone, idx) => {
          const isActive = activeZones.has(zone);
          return (
            <div
              key={zone}
              onClick={() => toggleZone(zone)}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                userSelect: "none",
                flex: "0 1 160px",
                justifyContent: "flex-start",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  marginRight: 6,
                  background: isActive ? colors[idx] : "#e5e7eb",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  transition: "0.2s",
                  flexShrink: 0,
                }}
              >
                {isActive && "✓"}
              </div>
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 120,
                }}
                title={zone}
              >
                {zone}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // --- Watch mouse move globally to hide tooltip ---
  useEffect(() => {
    if (!hovered) return;
    const handleDocMouseMove = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const tooltipEl = tooltipRef.current;
      const overTooltip = tooltipEl && tooltipEl.contains(el);
      const isDot =
        el &&
        (el.getAttribute?.("data-custom-dot") !== null ||
          (el.closest && el.closest("[data-custom-dot]")));
      if (!overTooltip && !isDot) setHovered(null);
    };
    document.addEventListener("mousemove", handleDocMouseMove);
    return () => document.removeEventListener("mousemove", handleDocMouseMove);
  }, [hovered]);

  // ✅ Custom Dot (shared by both charts)
  const CustomDot = ({
    cx,
    cy,
    payload,
    zone,
    color,
    containerRef: customRef,
  }) => {
    if (cx == null || cy == null) return null;
    const usedRef = customRef || containerRef;
    if (!usedRef || !usedRef.current) return null;

    const handleMouseEnter = (e) => {
      const rect = usedRef.current.getBoundingClientRect();
      const tooltipWidth = 180;
      const currentZone = zone;
      const currentValue = payload[currentZone];

      const validZones = zones
        .filter((z) => payload[z] != null)
        .map((z) => ({
          zone: z,
          value: payload[z],
          color: colors[zones.indexOf(z)],
        }));

      const sameValueZones = validZones.filter((z) => z.value === currentValue);
      const finalZones =
        sameValueZones.length > 1
          ? sameValueZones
          : validZones.filter((z) => z.zone === currentZone);

      const baseHeight = 40;
      const lineHeight = 20;
      const tooltipHeight = baseHeight + lineHeight * finalZones.length;

      let left = e.clientX - rect.left + 12;
      let top = e.clientY - rect.top - 44;

      if (left + tooltipWidth > rect.width) {
        left = rect.width - tooltipWidth - 12;
      }
      if (top + tooltipHeight > rect.height) {
        top = e.clientY - rect.top - tooltipHeight - 12;
      }
      if (top < 8) top = 8;

      setHovered({
        left,
        top,
        container: usedRef === modalContainerRef ? "modal" : "inline",
        hour: payload.hour,
        zones: finalZones,
        dotX: cx,
      });
    };

    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill={color}
          stroke={color}
          strokeWidth={2}
          style={{ cursor: "pointer" }}
          onMouseEnter={handleMouseEnter}
          data-custom-dot={zone}
        />
        {hovered && hovered.dotX === cx && (
          <line
            x1={cx}
            y1={0}
            x2={cx}
            y2="100%"
            stroke={color}
            strokeDasharray="4 4"
            strokeWidth={1}
          />
        )}
      </g>
    );
  };

  // ✅ Tooltip block
  const TooltipBlock = () =>
    hovered &&
    hovered.zones &&
    hovered.zones.length > 0 && (
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          left: hovered.left,
          top: Math.max(hovered.top - 44, 8),
          background: "rgba(255,255,255,0.98)",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 6,
          padding: "8px 12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          fontSize: 13,
          minWidth: 140,
          pointerEvents: "auto",
          zIndex: 9999,
          maxHeight: "250px",
          overflowY: "auto",
        }}
        onMouseLeave={() => setHovered(null)}
      >
        {hovered.zones.map((z) => (
          <div key={z.zone} style={{ marginBottom: 8 }}>
            <div>
              Count: <span style={{ fontWeight: 600 }}>{z.value}</span>
            </div>
            <div>
              Hour: <span style={{ fontWeight: 600 }}>{hovered.hour}</span>
            </div>
            <div>
              Zone Name: <span style={{ fontWeight: 600 }}>{z.zone}</span>
            </div>
          </div>
        ))}
      </div>
    );

  // ✅ Chart Block (receives activeZones as prop)
  const ChartBlock = ({ refProp, height, activeZones }) => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e5e7eb"
          vertical={false}
        />
        <XAxis
          dataKey="hour"
          label={{ value: "HOURS", position: "insideBottom", offset: -20 }}
        />
        <YAxis
          label={{ value: "COUNTS", angle: -90, position: "insideLeft" }}
        />

        {zones.map(
          (zone, idx) =>
            activeZones.has(zone) && (
              <Line
                key={`${zone}-${idx}`}
                dataKey={zone}
                stroke={colors[idx]}
                strokeWidth={2}
                dot={(props) => {
                  const { key, ...rest } = props;
                  return (
                    <CustomDot
                      {...rest}
                      key={key}
                      zone={zone}
                      color={colors[idx]}
                      containerRef={refProp}
                    />
                  );
                }}
                activeDot={false}
                connectNulls
                type="monotone"
                isAnimationActive={false}
              />
            )
        )}
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div className="analytics-container_chart">
      <div className="analytics-header">
        <h5>Historical Analytics - Visitors IN</h5>
        <button className="enlarge-btn" onClick={() => setShowModal(true)}>
          <Icon img={ZoomInIcon1} Img_width="20px" Img_height="20px" />
        </button>
      </div>

      {/* Inline Chart */}
      <div
        className="chart-wrapper"
        ref={containerRef}
        style={{ width: "100%", height: 420, position: "relative" }}
        onMouseLeave={() => setHovered(null)}
      >
        <ChartBlock
          refProp={containerRef}
          height={400}
          activeZones={activeZonesInline}
        />
        {hovered && hovered.container === "inline" && <TooltipBlock />}
        {/* <CustomLegend
          activeZones={activeZonesInline}
          toggleZone={toggleZoneInline}
        /> */}
      </div>

      {/* Modal Chart */}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setActiveZonesModal(new Set(zones)); // ✅ Reset legend state on close
        }}
        backdrop="static"
        dialogClassName="enlarge-modal"
        className="historical-modal"
        size="xl"
        aria-labelledby="historicalModalTitle"
      >
        <Modal.Header closeButton>
          <Modal.Title id="historicalModalTitle">
            Historical Analytics - Visitors IN
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ position: "relative" }}>
          <div
            className="enlarge-chart-wrapper"
            ref={modalContainerRef}
            style={{ width: "100%", height: "100%", position: "relative" }}
          >
            <ChartBlock
              refProp={modalContainerRef}
              height={560}
              activeZones={activeZonesModal}
            />
            {hovered && hovered.container === "modal" && <TooltipBlock />}
            <CustomLegend
              activeZones={activeZonesModal}
              toggleZone={toggleZoneModal}
            />
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default HistoricalDash1Chart2;
