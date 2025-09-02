import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Loader from "../CommonComponents/Loader";
import Icon from "../CommonComponents/icon";
import SingleSelectDropdown from "../CommonComponents/SingleSelectDropdown";

import OccupancyIcon from "../../Components/Assets/dashboard/sv_occupancy.svg";
import CapacityIcon from "../../Components/Assets/dashboard/sv_capcity.svg";
import PercentageIcon from "../../Components/Assets/dashboard/sv_percentage.svg";
import safetoenterIcon from "../../Components/Assets/dashboard/sv_safetoenter.svg";
import emptyIcon from "../../Components/Assets/dashboard/sv_empty.svg";
import almostfulIcon from "../../Components/Assets/dashboard/sv_allmostfull.svg";
import fulIcon from "../../Components/Assets/dashboard/sv_full.svg";
import RemainingCapacity from "../../Components/Assets/dashboard/sv_remainingcapacity.svg";
import PeakOccupancy from "../../Components/Assets/dashboard/sv_peakoccupancy.svg";
import PeakHour from "../../Components/Assets/dashboard/sv_peakhour.svg";

import Dashboard3Chart from "./Dashboard3Chart"
import "../../Components/Styles/Dashboard3.css";

const SideCard = ({ icon, value, label }) => (
  <div className="dash3-side-card">
    <div className="cardsec1">
      <Icon img={icon} Img_width="35px" Img_height="35px" />
      <div className="dash3-side-main">{value}</div>
    </div>
    <div className="dash3-side-label">{label}</div>
  </div>
);

const StatCard = ({ icon, value, label }) => (
  <div className="dash3-stat-card">
    <div className="cardsec1">
      <Icon img={icon} Img_width="35px" Img_height="35px" />
      <div className="dash3-stat-main">{value}</div>
    </div>
    <div className="dash3-stat-label">{label}</div>
  </div>
);

const ZoneDetailsPage = ({ zones }) => {
  const { zoneId } = useParams();
  const navigate = useNavigate();

  const token = sessionStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  // ✅ Safe initialization
  const [selectedZone, setSelectedZone] = useState(() => {
    if (zoneId) return zoneId;
    if (zones && zones.length > 0) return zones[0];
    return "";
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const zoneOptions = zones?.map((z) => ({ value: z, label: z })) || [];

  const fetchZoneData = useCallback(
    async (zone) => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.post(
          `${API_URL}/dashboard/dashboard3/singleViewDashboardData`,
          { selectedZone: [zone] },
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json",
            },
          }
        );
        setData(res.data || {});
      } catch (e) {
        console.error("Fetch error:", e);
        setError("Failed to load zone data");
      } finally {
        setLoading(false);
      }
    },
    [API_URL, token]
  );

  useEffect(() => {
    if (selectedZone) {
      fetchZoneData(selectedZone);
    }
  }, [selectedZone, fetchZoneData]);

  const handleZoneChange = (option) => {
    setSelectedZone(option.value);
    navigate(`/zone-details/${option.value}`);
  };

  const hourlyData = useMemo(() => {
    if (!data?.hourlyData) return [];
    return data.hourlyData.map((h, idx) => ({
      hour: h.hour ?? idx,
      value: h.value ?? 0,
    }));
  }, [data]);

  const metrics = useMemo(() => {
    if (!data) return null;
    const live = data.liveStats || {};
    const cap = data.capacityStats || {};
    const peak = data.peakStats || {};
    const totals = data.totals || {};

    return {
      occupancy: live.LiveOccupancy ?? 0,
      percentage: live.Percentage ?? 0,
      maxCapacity: cap.Maxcapacity ?? 0,
      remaining: cap.Remainingcapacity ?? 0,
      peakOccupancy: peak.Peakoccupancy ?? 0,
      peakHour: peak.Peakhour ?? "NA",
      totalIn: totals.Totalin ?? 0,
      totalOut: totals.Totalout ?? 0,
      statusLabel: peak.Status || "Safe",
      variant: (() => {
        switch ((peak.Status || "Safe").toLowerCase()) {
          case "full":
            return "full";
          case "high":
          case "almost full":
            return "almost";
          case "empty":
            return "empty";
          default:
            return "safe";
        }
      })(),
    };
  }, [data]);

  if (!zones || zones.length === 0) {
    return <div>No zones available</div>;
  }

  if (loading) return <Loader size="lg" />;
  if (error) return <div className="error">{error}</div>;
  if (!metrics) return null;

  return (
    <div className="zone-detail-page">
      <div className="zone-detail-header">
        <h1>{selectedZone} Occupancy</h1>
        <div className="zone-dropdown">
          <SingleSelectDropdown
            options={zoneOptions}
            value={zoneOptions.find((o) => o.value === selectedZone)}
            onChange={handleZoneChange}
          />
        </div>
      </div>

      <div className="dash3-stat-grid">
        <StatCard icon={OccupancyIcon} value={metrics.occupancy} label="Live Occupancy" />
        <StatCard icon={CapacityIcon} value={metrics.maxCapacity} label="Max Capacity" />
        <StatCard icon={PercentageIcon} value={`${metrics.percentage}%`} label="Percentage" />
        <div className={`dash3-status-badge badge-${metrics.variant}`}>
          <Icon
            img={
              metrics.statusLabel === "Safe"
                ? safetoenterIcon
                : metrics.statusLabel === "High" || metrics.statusLabel === "Almost Full"
                ? almostfulIcon
                : metrics.statusLabel === "Full"
                ? fulIcon
                : emptyIcon
            }
            Img_width="35px"
            Img_height="35px"
          />
          <div className="dash3-status-text">{metrics.statusLabel}</div>
        </div>
      </div>

      <div className="dash3-bottom-row">
        <div className="dash3-chart-section">
          <h3>Hourly Trends</h3>
          <Dashboard3Chart data={hourlyData} />
          <div className="dash3-chart-footer">
            <span>Total In: <strong>{metrics.totalIn}</strong></span>
            <span>Total Out: <strong>{metrics.totalOut}</strong></span>
          </div>
        </div>

        <div className="dash3-side-grid">
          <SideCard icon={RemainingCapacity} value={metrics.remaining} label="Remaining Capacity" />
          <SideCard icon={PeakOccupancy} value={metrics.peakOccupancy} label="Peak Occupancy" />
          <SideCard icon={PeakHour} value={`${metrics.peakHour} Hr`} label="Peak Hour" />
        </div>
      </div>
    </div>
  );
};

export default ZoneDetailsPage;
