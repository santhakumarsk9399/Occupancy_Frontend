import React, { useEffect, useState } from "react";
import Icon from "../CommonComponents/icon";
import SingleSelectDropdown from "../CommonComponents/SingleSelectDropdown";

import OccupancyIcon from "../../Components/Assets/dashboard/sv_occupancy.svg";
import PercentageIcon from "../../Components/Assets/dashboard/sv_percentage.svg";
import CapacityIcon from "../../Components/Assets/dashboard/sv_capcity.svg";
import safetoenterIcon from "../../Components/Assets/dashboard/sv_safetoenter.svg";
import emptyIcon from "../../Components/Assets/dashboard/sv_empty.svg";
import almostfulIcon from "../../Components/Assets/dashboard/sv_allmostfull.svg";
import fulIcon from "../../Components/Assets/dashboard/sv_full.svg";
import RemainingCapacity from "../../Components/Assets/dashboard/sv_remainingcapacity.svg";
import PeakOccupancy from "../../Components/Assets/dashboard/sv_peakoccupancy.svg";
import PeakHour from "../../Components/Assets/dashboard/sv_peakhour.svg";
import ProjectNameIcon from "../../Components/Assets/dashboard/Project_name.svg";

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const token = sessionStorage.getItem("token");
const MainUsername = sessionStorage.getItem("username");

const ZoneModal = ({ zones, selectedId, onClose, onChangeZone }) => {
  const [zoneDetails, setZoneDetails] = useState(null);

  useEffect(() => {
    const fetchZoneDetails = async () => {
      try {
        const selectedZone = zones.find((z) => z.id === selectedId);
        if (!selectedZone) return;

        const payload = { username: MainUsername, zoneName: selectedZone.zone };
        const response = await axios.post(
          `${API_URL}/dashboard/dashboard3/singleViewDashboardData`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(response,"response")
        if (response?.data?.success) {
          const res = response.data;
          setZoneDetails({
            zone: res.zone,
            totals: res.totals,
            liveStats: res.liveStats,
            capacityStats: res.capacityStats,
            peakStats: res.peakStats,
            hourlyData: res.hourlyData.map((h) => ({
              hour: h.Hours,
              value: h.LiveOccupancy,
            })),
          });
        }
      } catch (err) {
        console.error("Failed to load zone details", err);
      }
    };

    fetchZoneDetails();
  }, [selectedId, zones]);

  if (!zoneDetails) return null;

  return (
    <div className="dash3-modal-overlay" onClick={onClose}>
      <div className="dash3-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="dash3-modal-header">
          <div className="projecTitle">
            <Icon img={ProjectNameIcon} />
          </div>
          <div className="zoneTitle">
            <h2 className="dash3-modal-title">
              {zoneDetails.zone}{" "}
              <span className="sel_zon_sec_str">Live Occupancy</span>
            </h2>
          </div>
          <div className="dash3-header-controls">
            <div className="dash3-headerzoneSection">
              <label className="dash3-zone-select-label">Zone</label>
              <SingleSelectDropdown
                options={zones.map((z) => ({ value: z.id, label: z.zone }))}
                value={zones.find((z) => z.id === selectedId) || null}
                onChange={(option) => onChangeZone(option.value)}
                placeholder="Select Zone"
              />
            </div>
          </div>
          <button className="dash3-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Stats */}
        <div className="dash3-stat-grid">
          <StatCard
            icon={OccupancyIcon}
            value={zoneDetails.liveStats.LiveOccupancy}
            label="Live Occupancy"
          />
          <StatCard
            icon={CapacityIcon}
            value={zoneDetails.capacityStats.Maxcapacity}
            label="Max Capacity"
          />
          <StatCard
            icon={PercentageIcon}
            value={`${zoneDetails.liveStats.Percentage}%`}
            label="Percentage"
          />
          <div className={`dash3-status-badge badge-${zoneDetails.peakStats.Status.toLowerCase()}`}>
            <Icon
              img={
                zoneDetails.peakStats.Status === "Safe"
                  ? safetoenterIcon
                  : zoneDetails.peakStats.Status === "High"
                  ? almostfulIcon
                  : zoneDetails.peakStats.Status === "Full"
                  ? fulIcon
                  : emptyIcon
              }
              Img_width="35px"
              Img_height="35px"
            />
            <div className="dash3-status-text">{zoneDetails.peakStats.Status}</div>
          </div>
        </div>

        {/* Chart + Side Cards */}
        <div className="dash3-bottom-row">
          <div className="dash3-chart-section">
            <h3>Hourly Trends</h3>
            <Dashboard3Chart data={zoneDetails.hourlyData} />
            <div className="dash3-chart-footer">
              <span>
                Total In: <strong>{zoneDetails.totals.Totalin}</strong>
              </span>
              <span>
                Total Out: <strong>{zoneDetails.totals.Totalout}</strong>
              </span>
            </div>
          </div>

          <div className="dash3-side-grid">
            <SideCard
              icon={RemainingCapacity}
              value={zoneDetails.capacityStats.Remainingcapacity}
              label="Remaining Capacity"
            />
            <SideCard
              icon={PeakOccupancy}
              value={zoneDetails.peakStats.Peakoccupancy}
              label="Peak Occupancy"
            />
            <SideCard
              icon={PeakHour}
              value={`${zoneDetails.peakStats.Peakhour} Hr`}
              label="Peak Hour"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label }) => (
  <div className="dash3-stat-card">
    <div className="cardsec1">
      <Icon img={icon} Img_width="35px" Img_height="35px" />
      <div className="dash3-stat-main">{value}</div>
    </div>
    <div className="dash3-stat-label">{label}</div>
  </div>
);

const SideCard = ({ icon, value, label }) => (
  <div className="dash3-side-card">
    <div className="cardsec1">
      <Icon img={icon} Img_width="35px" Img_height="35px" />
      <div className="dash3-side-main">{value}</div>
    </div>
    <div className="dash3-side-label">{label}</div>
  </div>
);

const Dashboard3Chart = ({ data }) => {
  if (!data?.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const width = 820, height = 300;
  const padding = { left: 50, right: 20, top: 20, bottom: 40 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const xStep = innerW / (data.length - 1);

  const points = data.map((d, i) => [
    padding.left + i * xStep,
    padding.top + innerH - (d.value / max) * innerH,
  ]);

  const pathLine = points.map((p, i) => (i ? `L${p[0]},${p[1]}` : `M${p[0]},${p[1]}`)).join(" ");
  const areaPath = `${pathLine} L${points[points.length - 1][0]},${padding.top + innerH} L${padding.left},${padding.top + innerH} Z`;

  return (
    <svg className="dash3-chart-svg" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="dash3Area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#dash3Area)" />
      <path d={pathLine} fill="none" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={`point-${i}`} cx={p[0]} cy={p[1]} r={5} fill="#1d4ed8" stroke="#fff" strokeWidth="2" />
      ))}
      {data.map((d, i) => (
        <text key={`label-${i}`} x={points[i][0]} y={height - 15} fontSize="12" textAnchor="middle" fill="#374151">
          {d.hour}
        </text>
      ))}
    </svg>
  );
};

export default ZoneModal;
