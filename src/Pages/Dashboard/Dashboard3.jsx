import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import CustomCard from "../CommonComponents/Card";
import NoData from "../CommonComponents/NoDataAvailable"; // match Dashboard2 nodata usage
import "../../Components/Styles/Table.css";
import "../../Components/Styles/Dashboard2.css";
import "../../Components/Styles/Dashboard3.css";
import axios from "axios";

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
import ProjectNameIcon from "../../Components/Assets/dashboard/Project_name.svg";

import Icon from "../CommonComponents/icon";
import SingleSelectDropdown from "../CommonComponents/SingleSelectDropdown";
import Loader from "../CommonComponents/Loader";

// ---------------- Helpers ----------------
const classify = (pct) => {
  if (pct === 0) return { category: "Empty", label: "Empty", variant: "empty" };
  if (pct >= 100) return { category: "Full", label: "Full", variant: "full" };
  if (pct >= 80) return { category: "High", label: "Almost Full", variant: "almost" };
  return { category: "Safe", label: "Safe to Enter", variant: "safe" };
};

const buildHourlySeries = (base) => {
  const factors = [0.1, 0.5, 0.95, 0.6, 0.42, 0.72, 0.3];
  const hours = [8, 9, 10, 11, 12, 13, 14];
  return hours.map((h, i) => ({
    hour: h,
    value: Math.round(base * factors[i]),
  }));
};

// ---------------- Main Component ----------------
const Dashboard3 = ({ zones = [], isActive = false }) => {
  const [rows, setRows] = useState([]); // transformed rows
  const [loading, setLoading] = useState(false); // only for initial load
  const initialLoadDoneRef = useRef(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [modalZoneId, setModalZoneId] = useState(null); // holds zone identifier (ZoneName)
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalData, setModalData] = useState(null); // detailed API response for selected zone

  const token = sessionStorage.getItem("token");
  const username = sessionStorage.getItem("username");
  const vid = sessionStorage.getItem("vid"); // include if backend expects (mirroring Dashboard2)
  const API_URL = import.meta.env.VITE_API_URL; // optional base

  const lastFetchRef = useRef(0);
  const inFlightRef = useRef(false);

  const transform = useCallback((list) => {
    return list.map((r) => {
      const zoneName = r.ZoneName || r.zone || r.Zone || "Unknown";
      const occ = r.LiveOccupancy ?? r.Occupancy ?? r.occupancy ?? 0;
      const cap = r.Capacity ?? r.capacity ?? 0;
      const pctRaw = r.Percentage ?? r.percentage ?? (cap ? (occ / cap) * 100 : 0);
      const pctNum = typeof pctRaw === 'number' ? pctRaw : parseFloat(pctRaw) || 0;
      // base classification
      let meta = classify(pctNum);
      const status = r.CapacityStatus || r.capacityStatus;
      if (status) {
        const s = status.toLowerCase();
        if (s.includes("almost")) meta = { category: "High", label: "Almost Full", variant: "almost" };
        else if (s === "full") meta = { category: "Full", label: "Full", variant: "full" };
        else if (s.includes("safe")) meta = { category: "Safe", label: "Safe to Enter", variant: "safe" };
        else if (s.includes("empty")) meta = { category: "Empty", label: "Empty", variant: "empty" };
      }
      return {
        id: zoneName, // stable identifier
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
    // minimal throttle 5s to prevent accidental double calls
    if (now - lastFetchRef.current < 5000) return;
    inFlightRef.current = true;
  if (!initialLoadDoneRef.current) setLoading(true);
    setError(null);
    try {
      const body = {
        username,
        selectedZones: zones.join(","),
        vid,
      };
      const endpoint = API_URL ? `${API_URL}/dashboard/getDashboard3Data` : `http://delbi2dev.deloptanalytics.com:3000/dashboard/getDashboard3Data`;
      if (!token) console.warn("[Dashboard3] Missing auth token");
      console.log("[Dashboard3] POST", endpoint, body);
      const res = await axios.post(endpoint, body, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
      });
      console.log("[Dashboard3] Response", res.data);
      const payload = res.data || {};
      let baseList = payload.allZones || payload.data?.allZones || [];
      if (!Array.isArray(baseList) || !baseList.length) {
        const merged = new Map();
        [payload.emptyZones, payload.safeZones, payload.highZones, payload.fullZones].forEach(arr => {
          if (Array.isArray(arr)) arr.forEach(it => merged.set(it.ZoneName || it.zone, it));
        });
        baseList = Array.from(merged.values());
      }
      const transformed = transform(baseList);
      setRows(transformed);
      if (modalZoneId && !transformed.find(r => r.id === modalZoneId)) setModalZoneId(null);
    } catch (e) {
      if (e.response) {
        console.error("[Dashboard3] API error", e.response.status, e.response.data);
        setError(e.response.data?.message || `API error ${e.response.status}`);
      } else if (e.request) {
        console.error("[Dashboard3] No response", e.request);
        setError("No response from server");
      } else {
        console.error("[Dashboard3] Request setup error", e.message);
        setError(e.message || "Unknown error");
      }
      setRows([]);
    } finally {
      lastFetchRef.current = Date.now();
      inFlightRef.current = false;
      if (!initialLoadDoneRef.current) {
        setLoading(false);
        initialLoadDoneRef.current = true;
      }
    }
  }, [zones, API_URL, token, username, vid, transform, modalZoneId]);

  // Trigger fetch when tab becomes active
  useEffect(() => {
    if (isActive) {
      lastFetchRef.current = 0; // allow immediate
      fetchData();
    }
  }, [isActive, fetchData]);

  // Refetch when zones change while active
  useEffect(() => {
    if (!isActive) return;
    lastFetchRef.current = 0;
    fetchData();
  }, [zones, isActive, fetchData]);

  // Poll every 15 seconds
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      fetchData();
    }, 15000);
    return () => clearInterval(interval);
  }, [isActive, fetchData]);

  // Reset filter to 'All' whenever zones change or dashboard tab becomes active
  useEffect(() => {
    setActiveFilter('All');
  }, [zones, isActive]);

  const enriched = useMemo(() => rows, [rows]);
  const zoneOptions = enriched.map((z) => ({ value: z.id, label: z.zone }));

  const counts = useMemo(() => ({
    All: enriched.length,
    Empty: enriched.filter((r) => r.category === "Empty").length,
    Safe: enriched.filter((r) => r.category === "Safe").length,
    High: enriched.filter((r) => r.category === "High").length,
    Full: enriched.filter((r) => r.category === "Full").length,
  }), [enriched]);

  const filtered = useMemo(() => (
    activeFilter === "All" ? enriched : enriched.filter(r => r.category === activeFilter)
  ), [enriched, activeFilter]);

  const openModal = useCallback((id) => {
    setModalZoneId(id);
  }, []);
  const closeModal = useCallback(() => {
    setModalZoneId(null);
    setModalData(null);
    setModalError(null);
  }, []);
  const selected = useMemo(() => enriched.find((r) => r.id === modalZoneId) || null, [modalZoneId, enriched]);

  // Fetch single zone detailed data when modalZoneId changes
  const fetchModalData = useCallback(async (zoneId) => {
    if (!zoneId) return;
    if (!token) console.warn("[Dashboard3] Missing auth token for single view");
    setModalLoading(true);
    setModalError(null);
    try {
      const body = { selectedZone: [zoneId] };
      const endpoint = API_URL ? `${API_URL}/dashboard/dashboard3/singleViewDashboardData` : `http://delbi2dev.deloptanalytics.com:3000/dashboard/dashboard3/singleViewDashboardData`;
      console.log("[Dashboard3] (modal) POST", endpoint, body);
      const res = await axios.post(endpoint, body, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
      });
      console.log("[Dashboard3] (modal) Response", res.data);
      setModalData(res.data || null);
    } catch (e) {
      if (e.response) {
        console.error("[Dashboard3] (modal) API error", e.response.status, e.response.data);
        setModalError(e.response.data?.message || `API error ${e.response.status}`);
      } else if (e.request) {
        console.error("[Dashboard3] (modal) No response", e.request);
        setModalError("No response from server");
      } else {
        console.error("[Dashboard3] (modal) Request setup error", e.message);
        setModalError(e.message || "Unknown error");
      }
      setModalData(null);
    } finally {
      setModalLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    if (modalZoneId) fetchModalData(modalZoneId);
  }, [modalZoneId, fetchModalData]);

  const modalMetrics = useMemo(() => {
    if (!selected) return null;
    // Prefer API modalData if zone matches; fallback to synthetic
    const api = modalData && (modalData.zone === selected.zone || modalData.zone === selected.id) ? modalData : null;
    const hourlyRaw = api?.hourlyData && Array.isArray(api.hourlyData) ? api.hourlyData : null;
    let hourly;
    if (hourlyRaw && hourlyRaw.length) {
      hourly = hourlyRaw.map((d, idx) => {
        const hourVal = d.hour ?? d.Hour ?? d.HH ?? d.TimeHour ?? d.timeHour ?? d.time ?? idx; // best-effort
        const valueVal = d.value ?? d.Value ?? d.occupancy ?? d.Occupancy ?? d.LiveOccupancy ?? 0;
        return { hour: parseInt(hourVal, 10), value: Number(valueVal) || 0 };
      }).filter(it => !Number.isNaN(it.hour));
    } else {
      // fallback synthetic if API returned nothing
      hourly = buildHourlySeries(selected.capacity);
    }
    const peakOccupancy = api?.peakStats?.Peakoccupancy ?? (hourly.length ? Math.max(...hourly.map(h => h.value)) : 0);
    const peakHourRaw = api?.peakStats?.Peakhour;
    const peakHourEntry = hourly.find(h => h.value === peakOccupancy) || hourly[0];
    const peakHourNum = peakHourEntry ? peakHourEntry.hour : null;
    const peakHourLabel = peakHourRaw ? String(peakHourRaw) : (peakHourNum != null ? `${peakHourNum.toString().padStart(2, "0")}-${(peakHourNum + 1).toString().padStart(2, "0")}` : "NA");
    const remaining = api?.capacityStats?.Remainingcapacity ?? (selected.capacity - selected.occupancy);
    const maxCapacity = api?.capacityStats?.Maxcapacity ?? selected.capacity;
    const totalIn = api?.totals?.Totalin ?? 0;
    const totalOut = api?.totals?.Totalout ?? 0;
    const percentage = api?.liveStats?.Percentage ?? selected.pct;
    const liveOccupancy = api?.liveStats?.LiveOccupancy ?? selected.occupancy;
    const statusVariantMap = { Safe: "safe", High: "almost", Full: "full", Empty: "empty" };
    const statusLabel = api?.peakStats?.Status || selected.label;
    const variant = statusVariantMap[statusLabel] || selected.variant;
    return {
      hourly,
      peak: { value: peakOccupancy, hour: peakHourNum },
      peakHourLabel,
      remaining,
      totalIn,
      totalOut,
      maxCapacity,
      percentage,
      liveOccupancy,
      statusLabel,
      variant,
    };
  }, [selected, modalData]);

  const changeModalZone = (e) => setModalZoneId(e.target.value);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
console.log(modalMetrics)
  return (
    <div className="dash2-container">
    {(enriched && enriched.length > 0) ? (<div className="mainSection">
      {!error && enriched.length > 0 && (
        <div className="dash2-filters">
          {["All", "Empty", "Safe", "High", "Full"].map((key) => (
            <button
              key={key}
              type="button"
              disabled={loading}
              onClick={() => setActiveFilter(key)}
              className={`dash2-filter-btn ${activeFilter === key ? "active" : ""}`}
            >
              {`${key} ${counts[key]}`}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
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
              <div className="dash2-row" style={{ justifyContent: "center", color: '#c00' }}>{error}</div>
            )}
            {/* Mirror Dashboard2: show NoData component when no filtered rows (after initial load) */}
            {!error && initialLoadDoneRef.current && (!zones.length || filtered.length === 0) && (
              <NoData />
            )}
            {!error && filtered.length > 0 && filtered.map((row) => (
              <div
                key={row.id}
                className="dash2-row dash3-clickable"
                onClick={() => openModal(row.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && openModal(row.id)}
              >
                <div>{row.zone}</div>
                <div>{row.occupancy}</div>
                <div>{row.capacity}</div>
                <div
                  className={
                    row.category === "Safe"
                      ? "dash2-pct-low"
                      : row.category === "High"
                      ? "dash2-pct-medium"
                      : row.category === "Full"
                      ? "dash2-pct-high"
                      : "dash2-pct-medium"
                  }
                >
                  {row.pct}%
                </div>
                <div>
                  <span className={`dash-status-badge badge-${row.variant}`}>{row.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CustomCard>

      {/* Modal */}
  {selected && modalMetrics && (
        <div className="dash3-modal-overlay" onClick={closeModal} backdrop="static">
          <div className="dash3-modal" onClick={(e) => e.stopPropagation()}>
            {modalLoading && !modalData && !modalError && (
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.6)',zIndex:10,borderRadius:'24px'}}>
                <Loader size="lg" />
              </div>
            )}
            {/* Header */}
            <div className="dash3-modal-header mb-0">
             
              {/*<div className="projecTitle">
                <Icon img={ProjectNameIcon} />
              </div>*/}

              <div className="zoneTitle">
                <h2 className="dash3-modal-title">
                  {selected.zone} <span className="sel_zon_sec_str">Occupancy</span>
                </h2>
              </div>
              <div className="dash3-header-controls">
                <div className="dash3-headerzoneSection">
                  <label className="dash3-zone-select-label">Zone</label>
                  <SingleSelectDropdown
                    options={zoneOptions}
                    value={zoneOptions.find((o) => o.value === selected.id) || null}
                    onChange={(option) => changeModalZone({ target: { value: option.value } })}
                    placeholder="Select Zone"
                    className="singlezoneDropdown"
                  />
                </div>
              </div>
              <button className="dash3-close-btn" onClick={closeModal} aria-label="Close">
                ×
              </button>
            </div>

            {/* Stats */}
            <div className="dash3-stat-grid">
              {modalLoading ? (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", fontWeight: 500 }}>Loading...</div>
              ) : modalError ? (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#c00" }}>{modalError}</div>
              ) : (
                <>
                  <StatCard icon={OccupancyIcon} value={modalMetrics.liveOccupancy} label="Live Occupancy" />
                  <StatCard icon={CapacityIcon} value={modalMetrics.maxCapacity} label="Max Capacity" />
                  <StatCard icon={PercentageIcon} value={`${modalMetrics.percentage}%`} label="Percentage" />
                  <div className={`dash3-status-badge badge-${modalMetrics.variant}`}>
                    <Icon
                      img={
                        modalMetrics.statusLabel === "Safe"
                          ? safetoenterIcon
                          : modalMetrics.statusLabel === "High" || modalMetrics.statusLabel === "Almost Full"
                          ? almostfulIcon
                          : modalMetrics.statusLabel === "Full"
                          ? fulIcon
                          : emptyIcon
                      }
                      Img_width="35px"
                      Img_height="35px"
                    />
                    <div className="dash3-status-text">{modalMetrics.statusLabel}</div>
                  </div>
                </>
              )}
            </div>

            {/* Chart + Side Cards */}
            <div className="dash3-bottom-row">
              <div className="dash3-chart-section">
                <h3>Hourly Trends</h3>
                {modalLoading ? (
                  <div style={{ padding: "40px", textAlign: "center" }}>Loading chart...</div>
                ) : modalError ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "#c00" }}>No chart</div>
                ) : (
                  <>
                    <Dashboard3Chart data={modalMetrics.hourly} />
                    <div className="dash3-chart-footer">
                      <span>Total In: <strong>{modalMetrics.totalIn}</strong></span>
                      <span>Total Out: <strong>{modalMetrics.totalOut}</strong></span>
                    </div>
                  </>
                )}
              </div>

              <div className="dash3-side-grid">
                {modalLoading || modalError ? (
                  <>
                    <SideCard icon={RemainingCapacity} value={"-"} label="Remaining Capacity" />
                    <SideCard icon={PeakOccupancy} value={"-"} label="Peak Occupancy" />
                    <SideCard icon={PeakHour} value={"-"} label="Peak Hour" />
                  </>
                ) : (
                  <>
                    <SideCard icon={RemainingCapacity} value={modalMetrics.remaining} label="Remaining Capacity" />
                    <SideCard icon={PeakOccupancy} value={modalMetrics.peak.value} label="Peak Occupancy" />
                    <SideCard icon={PeakHour} value={`${modalMetrics.peakHourLabel} Hr`} label="Peak Hour" />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
   </div>) :(<div className="Dash2_NoDataTopsection" style={{Height:"75vh"}}><NoData/></div>) } 
    </div>
  );
};

// ---------------- Small Components ----------------
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

// ---------------- Chart ----------------
const Dashboard3Chart = ({ data }) => {
  const [tip, setTip] = React.useState(null); // {index,x,y,data}
  const svgRef = useRef(null);
  if (!data?.length) return null;

  const max = Math.max(...data.map((d) => d.value), 1);
  const width = 820, height = 340;
  const padding = { left: 60, right: 30, top: 20, bottom: 50 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const xStep = innerW / (data.length - 1 || 1);

  const points = data.map((d, i) => ({
    x: padding.left + i * xStep,
    y: padding.top + innerH - (d.value / max) * innerH,
    value: d.value,
    hour: d.hour,
  }));

  const pathLine = points.map((p, i) => (i ? `L${p.x},${p.y}` : `M${p.x},${p.y}`)).join(" ");
  const areaPath = `${pathLine} L${points[points.length - 1].x},${padding.top + innerH} L${points[0].x},${padding.top + innerH} Z`;

  // Y axis ticks (5 divisions)
  const yTicks = 5;
  const yValues = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((max / yTicks) * i));

  // Current time vertical line (if within range)
  const now = new Date();
  const nowHourDec = now.getHours() + now.getMinutes() / 60;
  const minHour = data[0].hour;
  const maxHour = data[data.length - 1].hour;
  let nowX = null;
  if (nowHourDec >= minHour && nowHourDec <= maxHour) {
    const ratio = (nowHourDec - minHour) / (maxHour - minHour || 1);
    nowX = padding.left + ratio * innerW;
  }

  const handleClick = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const xClick = e.clientX - rect.left;
    // find nearest point by x distance
    let nearest = points[0];
    let nearestIdx = 0;
    let minDist = Math.abs(xClick - points[0].x);
    points.forEach((p, idx) => {
      const d = Math.abs(xClick - p.x);
      if (d < minDist) {
        minDist = d;
        nearest = p;
        nearestIdx = idx;
      }
    });
    setTip({ index: nearestIdx, ...nearest });
  };

  const handleSvgLeave = () => {
    // keep tooltip until another click; comment out to hide when leave
  };

  return (
    <div className="dash3-chart-wrap">
      <svg
        ref={svgRef}
        className="dash3-chart-svg"
        viewBox={`0 0 ${width} ${height}`}
        onClick={handleClick}
        onMouseLeave={handleSvgLeave}
        role="img"
        aria-label="Hourly occupancy line chart"
      >
        <defs>
          <linearGradient id="dash3Area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid */}
        {yValues.map((v, i) => {
          const y = padding.top + innerH - (v / max) * innerH;
          return (
            <g key={i}>
              <line x1={padding.left} x2={padding.left + innerW} y1={y} y2={y} stroke="#e5e7eb" strokeWidth={1} />
              <text x={padding.left - 10} y={y + 4} fontSize={12} textAnchor="end" fill="#6b7280">{v}</text>
            </g>
          );
        })}
        {/* X axis line */}
        <line
          x1={padding.left}
          x2={padding.left + innerW}
          y1={padding.top + innerH}
          y2={padding.top + innerH}
          stroke="#d1d5db"
          strokeWidth={1.2}
        />
        {/* Current time vertical dashed line */}
        {nowX && (
          <line
            x1={nowX}
            x2={nowX}
            y1={padding.top}
            y2={padding.top + innerH}
            stroke="#111827"
            strokeDasharray="4 4"
            strokeWidth={1.2}
            opacity={0.8}
          />
        )}
        {/* Area + Line */}
        <path d={areaPath} fill="url(#dash3Area)" />
        <path d={pathLine} fill="none" stroke="#1d4ed8" strokeWidth={3} strokeLinecap="round" />
        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={6}
            fill="#1d4ed8"
            stroke="#fff"
            strokeWidth={2}
            style={{ cursor: "pointer" }}
          />
        ))}
        {/* X labels */}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={height - 18} fontSize={12} textAnchor="middle" fill="#374151">
            {`${p.hour.toString().padStart(2, "0")}:00`}
          </text>
        ))}
        {/* Axis labels */}
        <text
          x={padding.left + innerW / 2}
          y={height - 5}
          fontSize={14}
          textAnchor="middle"
          fill="#4b5563"
          fontWeight={500}
        >
          Hours
        </text>
        <text
          x={15}
          y={padding.top + innerH / 2}
          fontSize={14}
          textAnchor="middle"
          fill="#4b5563"
          fontWeight={500}
          transform={`rotate(-90 15 ${padding.top + innerH / 2})`}
        >
          Counts
        </text>
      </svg>
      {tip && (
        <div
          className="dash3-chart-tooltip"
          style={{ left: tip.x + 8, top: tip.y + 8 }}
        >
          <div><strong>Hour : </strong>{`${tip.hour.toString().padStart(2, "0")}:00`}</div>
          <div><strong>Live Occupancy : </strong>{tip.value}</div>
        </div>
      )}
    </div>
  );
};

export default Dashboard3;
