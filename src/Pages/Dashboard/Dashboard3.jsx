import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import CustomCard from "../CommonComponents/Card";
import NoData from "../CommonComponents/NoDataAvailable";
import "../../Components/Styles/Table.css";
import "../../Components/Styles/Dashboard2.css";
import "../../Components/Styles/Dashboard3.css";
import axios from "axios";
import { useSpring, animated } from "@react-spring/web";

// Assets
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

import Icon from "../CommonComponents/icon";
import SingleSelectDropdown from "../CommonComponents/SingleSelectDropdown";
import Loader from "../CommonComponents/Loader";
import Dashboard3Chart from "./Dashboard3Chart";
import TotalInIcon from "../../components/Assets/dashboard/total-in.svg";
import TotalOutIcon from "../../components/Assets/dashboard/total-out.svg";

// ---------------- Helpers ----------------
const classify = (pct) => {
  if (pct === 0) return { category: "Empty", label: "Empty", variant: "empty" };
  if (pct >= 100) return { category: "Full", label: "Full", variant: "full" };
  if (pct >= 80)
    return { category: "High", label: "Almost Full", variant: "almost" };
  return { category: "Safe", label: "Safe to Enter", variant: "safe" };
};

// ---------------- Main Component ----------------
const Dashboard3 = ({ zones = [], isActive = false }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const initialLoadDoneRef = useRef(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [modalZoneId, setModalZoneId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalData, setModalData] = useState(null);

  const token = sessionStorage.getItem("token");
  const username = sessionStorage.getItem("username");
  const vid = sessionStorage.getItem("vid");
  const API_URL = import.meta.env.VITE_API_URL;

  const lastFetchRef = useRef(0);
  const inFlightRef = useRef(false);

  const transform = useCallback((list) => {
    return list.map((r) => {
      const zoneName = r.ZoneName || r.zone || r.Zone || "Unknown";
      const occ = r.LiveOccupancy ?? r.Occupancy ?? r.occupancy ?? 0;
      const cap = r.Capacity ?? r.capacity ?? 0;
      const pctRaw =
        r.Percentage ?? r.percentage ?? (cap ? (occ / cap) * 100 : 0);
      const pctNum =
        typeof pctRaw === "number" ? pctRaw : parseFloat(pctRaw) || 0;
      let meta = classify(pctNum);
      const status = r.CapacityStatus || r.capacityStatus;
      if (status) {
        const s = status.toLowerCase();
        if (s.includes("almost"))
          meta = { category: "High", label: "Almost Full", variant: "almost" };
        else if (s === "full")
          meta = { category: "Full", label: "Full", variant: "full" };
        else if (s.includes("safe"))
          meta = { category: "Safe", label: "Safe to Enter", variant: "safe" };
        else if (s.includes("empty"))
          meta = { category: "Empty", label: "Empty", variant: "empty" };
      }
      return {
        id: zoneName,
        zone: zoneName,
        occupancy: occ,
        capacity: cap,
        pct: Math.round(pctNum * 100) / 100,
        ...meta,
      };
    });
  }, []);

  const fetchData = useCallback(async () => {
    if (!zones.length) return;
    const now = Date.now();
    if (inFlightRef.current) return;
    if (now - lastFetchRef.current < 5000) return;

    inFlightRef.current = true;

    if (!initialLoadDoneRef.current || rows.length === 0) {
      setLoading(true);
    }

    setError(null);
    try {
      const body = { username, selectedZones: zones.join(",") };
      const endpoint = API_URL
        ? `${API_URL}/dashboard/getDashboard3Data`
        : `http://delbi2dev.deloptanalytics.com:3000/dashboard/getDashboard3Data`;

      const res = await axios.get(endpoint, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
        params: body,
      });

      const payload = res.data || {};
      let baseList =
        payload.allZones || payload.AllZones || payload.data?.allZones || [];

      if (!Array.isArray(baseList) || !baseList.length) {
        const merged = new Map();
        [
          payload.emptyZones,
          payload.safeZones,
          payload.highZones,
          payload.fullZones,
        ].forEach((arr) => {
          if (Array.isArray(arr)) {
            arr.forEach((it) => merged.set(it.ZoneName || it.zone, it));
          }
        });
        baseList = Array.from(merged.values());
      }

      const transformed = transform(baseList);
      setRows(transformed);

      if (modalZoneId && !transformed.find((r) => r.id === modalZoneId)) {
        setModalZoneId(null);
      }
    } catch (e) {
      if (e.response) {
        setError(e.response.data?.message || `API error ${e.response.status}`);
      } else if (e.request) {
        setError("No response from server");
      } else {
        setError(e.message || "Unknown error");
      }
      setRows([]);
    } finally {
      lastFetchRef.current = Date.now();
      inFlightRef.current = false;
      setLoading(false);
      initialLoadDoneRef.current = true;
    }
  }, [
    zones,
    API_URL,
    token,
    username,
    vid,
    transform,
    modalZoneId,
    rows.length,
  ]);

  // --- Effects
  useEffect(() => {
    if (isActive) {
      lastFetchRef.current = 0;
      fetchData();
    }
  }, [isActive, fetchData]);

  useEffect(() => {
    if (!isActive) return;
    lastFetchRef.current = 0;
    fetchData();
  }, [zones, isActive, fetchData]);

  // --- Modal Data
  const fetchModalData = useCallback(
    async (zoneId) => {
      if (!zoneId) return;
      setModalLoading(true);
      try {
        const body = { selectedZone: zoneId };
        const endpoint = API_URL
          ? `${API_URL}/dashboard/getSingleZoneData`
          : `http://delbi2dev.deloptanalytics.com:3000/dashboard/getSingleZoneData`;
        const res = await axios.get(endpoint, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
          params: body,
        });
        setModalData(res.data || null);
      } catch (e) {
        setModalError(
          e.response?.data?.message || e.message || "Error fetching modal data"
        );
      } finally {
        setModalLoading(false);
      }
    },
    [API_URL, token]
  );

  useEffect(() => {
    if (!isActive) return;

    const refresh = () => {
      fetchData();
      if (modalZoneId) {
        fetchModalData(modalZoneId);
      }
    };

    // run immediately
    refresh();

    // run every 15s
    const interval = setInterval(refresh, 15000);

    return () => clearInterval(interval);
  }, [isActive, fetchData, fetchModalData, modalZoneId]);
  useEffect(() => {
    setActiveFilter("All");
  }, [zones, isActive]);

  const enriched = useMemo(() => rows, [rows]);
  const zoneOptions = enriched.map((z) => ({ value: z.id, label: z.zone }));

  const counts = useMemo(
    () => ({
      All: enriched.length,
      Empty: enriched.filter((r) => r.category === "Empty").length,
      Safe: enriched.filter((r) => r.category === "Safe").length,
      High: enriched.filter((r) => r.category === "High").length,
      Full: enriched.filter((r) => r.category === "Full").length,
    }),
    [enriched]
  );

  const filtered = useMemo(
    () =>
      activeFilter === "All"
        ? enriched
        : enriched.filter((r) => r.category === activeFilter),
    [enriched, activeFilter]
  );

  const openModal = useCallback((id) => setModalZoneId(id), []);
  const closeModal = useCallback(() => {
    setModalZoneId(null);
    setModalError(null);
  }, []);

  useEffect(() => {
    if (modalZoneId) fetchModalData(modalZoneId);
  }, [modalZoneId, fetchModalData]);

  const selected = useMemo(
    () => enriched.find((r) => r.id === modalZoneId) || null,
    [modalZoneId, enriched]
  );

  const modalMetrics = useMemo(() => {
    if (!selected || !modalData) return null;

    const hourly = Array.isArray(modalData.hourlyData)
      ? modalData.hourlyData.map((d) => ({
          // hourLabel: d.Hours,
          // value: Number(d.LiveOccupancy ?? 0),
          Hours: d.Hours,
          LiveOccupancy: Number(d.LiveOccupancy ?? 0),
        }))
      : [];
    console.log(modalData);
    return {
      hourly,
      peak: {
        value: modalData.peakStats?.Peakoccupancy ?? 0,
        hour: modalData.peakStats?.Peakhour ?? null,
      },
      peakHourLabel: modalData.peakStats ? modalData.peakStats?.Peakhour : "-",
      remaining: modalData.capacityStats
        ? modalData.capacityStats?.Remainingcapacity
        : "-",
      maxCapacity: modalData.capacityStats
        ? modalData.capacityStats?.Maxcapacity
        : "-",
      totalIn: modalData.totals ? modalData.totals?.Totalin : "-",
      totalOut: modalData.totals ? modalData.totals?.Totalout : "-",
      percentage: modalData.liveStats ? modalData.liveStats?.Percentage : "-",

      // percentage: modalData.liveStats? (modalData.liveStats?.Percentage) :"-",
      liveOccupancy: modalData.liveStats
        ? modalData.liveStats?.LiveOccupancy
        : "-",
      statusLabel: modalData.peakStats ? modalData.peakStats?.Status : "-",
      variant:
        modalData.peakStats?.Status == "Safe to Enter"
          ? "safe"
          : modalData.peakStats?.Status == "Full"
          ? "full"
          : modalData.peakStats?.Status == "Almost Full"
          ? "almost"
          : "empty",
    };
  }, [selected, modalData]);
  // console.log(modalMetrics);
  // console.log(filtered);
  // console.log(modalMetrics);
  // --- Render
  return (
    <div className="dash2-container">
      {loading ? (
        <div
          style={{
            height: "75vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Loader size="md" /> {/* smaller size */}
        </div>
      ) : enriched && enriched.length > 0 ? (
        <div className="mainSection">
          {!error && (
            <div className="dash2-filters">
              {["All", "Empty", "Safe", "Almost Full", "Full"].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setActiveFilter(key === "Almost Full" ? "High" : key)
                  }
                  className={`dash2-filter-btn ${
                    activeFilter === (key === "Almost Full" ? "High" : key)
                      ? "active"
                      : ""
                  }`}
                >
                  {`${key} ${counts[key === "Almost Full" ? "High" : key]}`}
                </button>
              ))}
            </div>
          )}

          <CustomCard size="md" className="p-0">
            <div className="dash2-table">
              {!error && filtered.length > 0 && (
                <div className="dash2-table-head">
                  <div>Zone Name</div>
                  <div>Live Occupants</div>
                  <div>Capacity</div>
                  <div>Percentage</div>
                  <div>Status</div>
                </div>
              )}
              <div className="dash2-row-list">
                {error && (
                  <div
                    className="dash2-row"
                    style={{ justifyContent: "center", color: "#c00" }}
                  >
                    {error}
                  </div>
                )}
                {!error &&
                  filtered.length > 0 &&
                  filtered.map((row) => (
                    <div
                      key={row.id}
                      className="dash2-row dash3-clickable"
                      onClick={() => openModal(row.id)}
                    >
                      <div>{row.zone}</div>
                      <div>{row.occupancy}</div>
                      <div>{row.capacity}</div>
                      <div>{row.pct}%</div>
                      <div>
                        <span
                          className={`dash-status-badge badge-${row.variant}`}
                        >
                          {row.label}
                        </span>
                      </div>
                    </div>
                  ))}
                {!error && filtered.length === 0 && (
                  <NoData name="no-data-dashboard" />
                )}
              </div>
            </div>
          </CustomCard>

          {selected && modalMetrics && (
            <div className="dash3-modal-overlay">
              <div className="dash3-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="dash3-modal-header mb-0">
                  <div className="zoneTitle">
                    <h2 className="dash3-modal-title">{selected.zone}</h2>
                  </div>
                  <div className="dash3-header-controls">
                    <SingleSelectDropdown
                      options={zoneOptions}
                      value={
                        zoneOptions.find((o) => o.value === selected.id) || null
                      }
                      onChange={(option) =>
                        setModalZoneId(option ? option.value : null)
                      }
                      placeholder="Select Zone"
                      className="singlezoneDropdown"
                    />
                    <button className="dash3-close-btn" onClick={closeModal}>
                      ×
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="dash3-stat-grid">
                  <StatCard
                    icon={OccupancyIcon}
                    value={modalMetrics.liveOccupancy}
                    label="Live Occupancy"
                  />
                  <StatCard
                    icon={CapacityIcon}
                    value={modalMetrics.maxCapacity}
                    label="Max Capacity"
                  />
                  <StatCard
                    icon={PercentageIcon}
                    value={modalMetrics.percentage}
                    isPercentage
                    label="Percentage"
                  />
                  <div
                    className={`dash3-status-badge badge-${modalMetrics.variant}`}
                  >
                    <Icon
                      img={
                        modalMetrics.statusLabel === "Safe to Enter"
                          ? safetoenterIcon
                          : modalMetrics.statusLabel === "High" ||
                            modalMetrics.statusLabel === "Almost Full"
                          ? almostfulIcon
                          : modalMetrics.statusLabel === "Full"
                          ? fulIcon
                          : emptyIcon
                      }
                      Img_width="35px"
                      Img_height="35px"
                    />
                    <div className="dash3-status-text">
                      {modalMetrics.statusLabel}
                    </div>
                  </div>
                </div>

                {/* Chart + Side Cards */}
                <div className="dash3-bottom-row">
                  <div className="dash3-chart-section">
                    <h3>Hourly Trends</h3>
                    <Dashboard3Chart data={modalMetrics.hourly} />
                    <div className="dash3-chart-footer">
                      <span>
                        <img src={TotalInIcon} width="22" /> Total In:{" "}
                        <strong className="dash3-in">
                          {modalMetrics.totalIn}
                        </strong>
                      </span>
                      <span>
                        <img src={TotalOutIcon} width="22" /> Total Out:{" "}
                        <strong className="dash3-out">
                          {modalMetrics.totalOut}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="dash3-side-grid">
                    <SideCard
                      icon={RemainingCapacity}
                      value={modalMetrics.remaining}
                      label="Remaining Capacity"
                    />
                    <SideCard
                      icon={PeakOccupancy}
                      value={modalMetrics.peak.value}
                      label="Peak Occupancy"
                    />
                    <SideCard
                      icon={PeakHour}
                      value={`${modalMetrics.peakHourLabel} Hr`}
                      label="Peak Hour"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="dash3NodataDiv">
          {" "}
          <NoData name="no-data-container" />
        </div>
      )}
    </div>
  );
};

// ---------------- Small Components ----------------
const StatCard = ({ icon, value, label, isPercentage = false }) => {
  const props = useSpring({ val: Number(value) || 0, from: { val: 0 } });
  return (
    <div className="dash3-stat-card">
      <div className="cardsec1">
        <Icon img={icon} Img_width="35px" Img_height="35px" />
        <animated.div className="dash3-stat-main">
          {props.val.to((n) =>
            isPercentage ? `${Math.floor(n)}%` : Math.floor(n)
          )}
        </animated.div>
      </div>
      <div className="dash3-stat-label">{label}</div>
    </div>
  );
};

const SideCard = ({ icon, value, label }) => (
  <div className="dash3-side-card">
    <div className="cardsec1">
      <Icon img={icon} Img_width="35px" Img_height="35px" />
      <div className="dash3_pop-side-main">{value}</div>
    </div>
    <div className="dash3_pop--side-label">{label}</div>
  </div>
);

export default Dashboard3;
