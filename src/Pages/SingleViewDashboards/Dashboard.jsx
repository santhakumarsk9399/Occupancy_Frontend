
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  Line,
  AreaChart,
} from "recharts";

import "./Dashboard.css";
import { Spinner } from "react-bootstrap";
// Assets
import OccupancyIcon from "../../components/Assets/dashboard/sv_occupancy.svg";
import CapacityIcon from "../../components/Assets/dashboard/sv_capcity.svg";
import PercentageIcon from "../../components/Assets/dashboard/sv_percentage.svg";
import SafeIcon from "../../components/Assets/dashboard/sv_safetoenter.svg";
import AlmostFullIcon from "../../components/Assets/dashboard/sv_allmostfull.svg";
import FullIcon from "../../components/Assets/dashboard/sv_full.svg";
import EmptyIcon from "../../components/Assets/dashboard/sv_empty.svg";
import RemainingCapacityIcon from "../../components/Assets/dashboard/sv_remainingcapacity.svg";
import PeakOccIcon from "../../components/Assets/dashboard/sv_peakoccupancy.svg";
import PeakHourIcon from "../../components/Assets/dashboard/sv_peakhour.svg";
import TotalInIcon from "../../components/Assets/dashboard/total-in.svg";
import TotalOutIcon from "../../components/Assets/dashboard/total-out.svg";
import Footer from "../CommonComponents/Footer";
import SingleSelectDropdown from "../CommonComponents/SingleSelectDropdown";
import Loader from "../CommonComponents/Loader";
import NoData from "../CommonComponents/NoDataAvailable";
import usernameicon from "../../Components/Assets/username_Icon.svg";
import Icon from "../CommonComponents/icon";
import "../../Components/Styles/NoData.css";

// create worker via Vite-friendly syntax. If you use CRA, change path accordingly.
const WorkerUrl = new URL("./webWorker.jsx", import.meta.url).href;

export default function Dashboard() {
  const [token, setToken] = useState(null);
  const [zones, setZones] = useState([]);
  const [zoneIndex, setZoneIndex] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const workerRef = useRef(null);

  const activeZone = zones[zoneIndex];

  /* ----------------------------
     Load token + zones on mount
  -----------------------------*/
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const userData = JSON.parse(sessionStorage.getItem("userData"));
        if (!userData?.token) {
          throw new Error("Missing session token, please log in again");
        }
        if (!mounted) return;

        setToken(userData.token);
        setUsername(userData.user.username || "");

        // create worker
        const w = new Worker(WorkerUrl, { type: "module" });
        workerRef.current = w;

        // worker message handler
        w.onmessage = (ev) => {
          const msg = ev.data || {};
          if (msg.type === "dashboard") {
            setData(msg.data);
            setLoading(false);
            setRefreshing(false);
            setError(null);
          } else if (msg.type === "zones") {
            // zones array from worker
            setZones((prev) => {
              try {
                if (JSON.stringify(prev) !== JSON.stringify(msg.zones)) {
                  return msg.zones;
                }
              } catch {
                return msg.zones;
              }
              return prev;
            });
            // keep zoneIndex within bounds
            setZoneIndex((prevIndex) => {
              if (!msg.zones || msg.zones.length === 0) return 0;
              return Math.min(prevIndex, msg.zones.length - 1);
            });
          } else if (msg.type === "error") {
            setError(msg.error || "Unknown error from worker");
            setRefreshing(false);
            setLoading(false);
          }
        };

        w.onerror = (err) => {
          console.error("Worker error:", err);
          setError("Internal worker error");
        };

        // initialize worker with base info & start loops
        w.postMessage({
          type: "init",
          base: import.meta.env.VITE_API_URL || "",
          token: userData.token,
          vid: userData.user.vid,
          username: userData.user.username,
          activeZone: null, // initial — zones will arrive from worker
        });
      } catch (e) {
        if (mounted) setError(e.message);
      }
    })();

    return () => {
      mounted = false;
      // terminate worker on unmount
      if (workerRef.current) {
        workerRef.current.postMessage({ type: "stop" });
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -----------------------------------------------------
     When activeZone changes (user selection or rotation),
     tell worker to switch to that zone immediately.
     The worker will abort previous dashboard fetch if any,
     and fetch the new zone immediately and then continue polling.
  ------------------------------------------------------*/
  useEffect(() => {
    if (!workerRef.current) return;

    // send setActiveZone (worker will fetch immediately)
    const zone = activeZone || null;
    workerRef.current.postMessage({ type: "setActiveZone", activeZone: zone });

    // set loading / refreshing UI flags
    setRefreshing(true);
  }, [activeZone]);

  /* -----------------------------------------------------
     Keep worker token/user updated if token/user changes.
  ------------------------------------------------------*/
  useEffect(() => {
    if (!workerRef.current) return;
    if (token) {
      workerRef.current.postMessage({ type: "setToken", token });
    }
  }, [token]);

  /* -----------------------------------------------------
     Auto-rotate zones every 15s — kept same as before.
     This changes zoneIndex which triggers worker to fetch new zone.
  ------------------------------------------------------*/
  useEffect(() => {
    if (!zones.length) return;

    const id = setInterval(() => {
      setZoneIndex((prev) => (prev + 1) % zones.length);
    }, 15000);

    return () => clearInterval(id);
  }, [zones.length]);

  // Dropdown options (unchanged)
  const zoneOptions = useMemo(
    () => zones.map((z, i) => ({ value: i, label: z })),
    [zones]
  );

  const hourly = useMemo(() => data?.hourlyData || [], [data]);
  const status = data?.peakStats?.Status || "";
  const statusLower = status;
  let badgeCls = "badge-safe";
  if (statusLower.includes("Almost Full")) badgeCls = "badge-almost";
  else if (statusLower.includes("Full")) badgeCls = "badge-full";
  else if (statusLower.includes("Empty")) badgeCls = "badge-empty";
  else if (statusLower.includes("Safe to Enter")) badgeCls = "badge-safe";

  return (
    <div className="dashboard-wrapper">
      <div className="single_dashboard-header">
        <div className="dashboard-projectTitle">
          <h3 className="mb-0">
            Occupancy Solution<span>2.0</span>
          </h3>
        </div>

        <div className="dashboard-title">
          <h2 className="mb-0">{activeZone || "--"}</h2>
        </div>
        <div className="zoneuserSection">
          <div className="usernameSec">
            <div className="userinfo_single">
              <Icon img={usernameicon} Img_width="34px" Img_height="34px" />
              <span className="sidebar_username_single">{username}</span>
            </div>
          </div>
          <div className="zone-selector">
            <label>Zone</label>
            <SingleSelectDropdown
              options={zoneOptions}
              value={zoneOptions.find((o) => o.value === zoneIndex) || null}
              onChange={(option) => setZoneIndex(option ? option.value : 0)}
              placeholder="Select Zone"
              className="singlezoneDropdown"
            />
          </div>
        </div>
      </div>

      <div className="singleviewBodySec">
        {error ? (
          <div className="datareason center-message">
            <p>{error === "Dashboard API failed: Failed to fetch" ? "Server Disconnect.. Contact IT":error}</p>
          </div>
        ) : loading ? (
          <div
            style={{
              height: "83vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Loader />
          </div>
        ) : !data ? (
          <div className="datareason center-message">
            <NoData name="no-data-container" />
          </div>
        ) : data?.zoneStatus === "Go Live" ? (
          // ✅ Normal Dashboard Data
          <>
            <div className="dash3-stat-grid">
              <StatCard icon={OccupancyIcon} label="Live Occupancy">
                <AnimatedNumber value={data?.liveStats?.LiveOccupancy || 0} />
              </StatCard>
              <StatCard icon={CapacityIcon} label="Max Capacity">
                <AnimatedNumber value={data?.capacityStats?.Maxcapacity || 0} />
              </StatCard>
              <StatCard icon={PercentageIcon} label="Percentage">
                <AnimatedNumber
                  value={data?.liveStats?.Percentage || 0}
                  suffix="%"
                />
              </StatCard>

              {/* Status Badge */}
              <div className={`dash3-status-badge ${badgeCls}`}>
                <img
                  src={
                    statusLower.includes("safe to enter")
                      ? SafeIcon
                      : statusLower.includes("almost full") ||
                        statusLower.includes("high")
                        ? AlmostFullIcon
                        : statusLower.includes("full")
                          ? FullIcon
                          : statusLower.includes("empty")
                            ? EmptyIcon
                            : SafeIcon
                  }
                  alt={status || "status"}
                  className="dash3-icon badge-icon"
                />
                <div className="dash3-status-text">
                  {status
                    ? statusLower.includes("safe")
                      ? "Safe to Enter"
                      : status
                    : "..."}
                </div>
              </div>
            </div>

            {/* Chart + Side Stats */}
            <div className="dash3-bottom-row">
              {/* Chart Section */}
              <div className="dash3-chart-section">
                <h3>Hourly Trends</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={440}>
                    <AreaChart data={hourly || []}>
                      <defs>
                        <linearGradient id="fill2" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="10%"
                            stopColor="#1d4ed8"
                            stopOpacity={0.18}
                          />
                          <stop
                            offset="95%"
                            stopColor="#1d4ed8"
                            stopOpacity={0}
                          />
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
                          const [h, m] = (value || "").split(":");
                          return m === "00" ? `${h}:00` : "";
                        }}
                        label={{
                          value: "HOURS",
                          position: "insideBottom",
                          fill: "#4b5563",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        width={60}
                        label={{
                          value: "COUNTS",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#4b5563",
                          fontSize: 13,
                          fontWeight: 600,
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
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#1d4ed8"
                        strokeWidth={2}
                        dot={{
                          r: 4,
                          fill: "#1d4ed8",
                          stroke: "#fff",
                          strokeWidth: 2,
                        }}
                        activeDot={{ r: 6 }}
                        isAnimationActive={true}
                        animationDuration={800}
                      />
                    </AreaChart>
                  </ResponsiveContainer>

                  {refreshing && <div className="chart-overlay">Updating…</div>}
                </div>

                {/* Chart Footer */}
                <div className="dash3-chart-footer">
                  <span>
                    <img
                      src={TotalInIcon}
                      width="22"
                      height="22"
                      className="total-icon"
                      alt="in"
                    />
                    Total In:{" "}
                    <strong className="dash3-in">
                      <AnimatedNumber value={data?.totals?.Totalin || 0} />
                    </strong>
                  </span>
                  <span>
                    <img
                      src={TotalOutIcon}
                      width="22"
                      height="22"
                      className="total-icon"
                      alt="out"
                    />
                    Total Out:{" "}
                    <strong className="dash3-out">
                      <AnimatedNumber value={data?.totals?.Totalout || 0} />
                    </strong>
                  </span>
                </div>
              </div>

              {/* Side Grid */}
              <div className="dash3-side-grid">
                <StatSideCard
                  icon={RemainingCapacityIcon}
                  label="Remaining Capacity"
                >
                  <AnimatedNumber
                    value={data?.capacityStats?.Remainingcapacity || 0}
                  />
                </StatSideCard>
                <StatSideCard icon={PeakOccIcon} label="Peak Occupancy">
                  <AnimatedNumber value={data?.peakStats?.Peakoccupancy || 0} />
                </StatSideCard>
                <StatSideCard icon={PeakHourIcon} label="Peak Hour">
                  {data?.peakStats?.Peakhour ?? "--"}{" "}
                  <span className="dash3-hr-suffix">Hr</span>
                </StatSideCard>
              </div>
            </div>
          </>
        ) : data?.zoneStatus ===
          "The process time for this zone hasn't started yet" ? (
          <div className="datareason center-message">
            <p className="no-data-text">The process time for this zone hasn’t started yet</p>
          </div>
        ) : (
          <div className="datareason center-message">
            <NoData />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

/* --- Reusable Components --- */
function StatCard({ icon, label, children }) {
  return (
    <div className="dash3-stat-card">
      <div className="cardsec1">
        <img src={icon} alt={label} className="dash3-icon" />
        <div className="dash3-stat-main">{children}</div>
      </div>
      <div className="dash3-stat-label">{label}</div>
    </div>
  );
}

function StatSideCard({ icon, label, children }) {
  return (
    <div className="dash3-side-card">
      <div className="cardsec1">
        <img src={icon} alt={label} className="dash3-icon" />
        <div className="dash3-side-main">{children}</div>
      </div>
      <div className="dash3-side-label">{label}</div>
    </div>
  );
}

function AnimatedNumber({ value, duration = 600, suffix = "" }) {
  const [display, setDisplay] = useState(value ?? 0);
  const prevRef = React.useRef(value ?? 0);

  useEffect(() => {
    if (value == null || value === prevRef.current) return;
    const start = performance.now();
    const from = prevRef.current || 0;
    const to = value || 0;
    const d = duration;
    function ease(p) {
      return p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
    }
    function step(ts) {
      const p = Math.min(1, (ts - start) / d);
      const eased = ease(p);
      const current = from + (to - from) * eased;
      setDisplay(Math.round(current));
      if (p < 1) requestAnimationFrame(step);
      else prevRef.current = to;
    }
    requestAnimationFrame(step);
  }, [value, duration]);

  return value == null ? (
    <span className="animated-number">--</span>
  ) : (
    <span className="animated-number">
      {display}
      {suffix}
    </span>
  );
}
