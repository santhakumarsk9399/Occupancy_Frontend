import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { fetchZones } from "./api";
import "./Dashboard.css";

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
import Icon from "../CommonComponents/icon";
import usernameicon from "../../Components/Assets/username_Icon.svg";

import CanvasChart from "./CanvasChart"; // NEW CANVAS CHART
import Marquee from "../CommonComponents/Marquee";


/* ------------------------------------------------------
   Memoized Components
------------------------------------------------------ */
const StatCard = React.memo(function StatCard({ icon, label, children }) {
  return (
    <div className="dash3-stat-card">
      <div className="cardsec1">
        <img src={icon} alt={label} className="dash3-icon" />
        <div className="dash3-stat-main">{children}</div>
      </div>
      <div className="dash3-stat-label">{label}</div>
    </div>
  );
});

const StatSideCard = React.memo(function StatSideCard({ icon, label, children }) {
  return (
    <div className="dash3-side-card">
      <div className="cardsec1">
        <img src={icon} alt={label} className="dash3-icon" />
        <div className="dash3-side-main">{children}</div>
      </div>
      <div className="dash3-side-label">{label}</div>
    </div>
  );
});

const AnimatedNumber = React.memo(function AnimatedNumber({ value, suffix = "" }) {
  return (
    <span className="animated-number">
      {value == null ? "--" : value}
      {suffix}
    </span>
  );
});


/* ------------------------------------------------------
   MAIN DASHBOARD
------------------------------------------------------ */
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


  /* ---------------------------------------
     LOAD TOKEN + INITIAL ZONES
  --------------------------------------- */
  useEffect(() => {
    const ud = JSON.parse(sessionStorage.getItem("userData"));
    if (!ud?.token) return;

    setToken(ud.token);
    setUsername(ud.user.username);

    fetchZones(ud.token, ud.user.vid, ud.user.username).then((z) => {
      if (Array.isArray(z)) setZones(z);
    });
  }, []);


  /* ---------------------------------------
     START WEB WORKER
  --------------------------------------- */
  useEffect(() => {
    if (!token) return;

    if (workerRef.current) {
      try {
        workerRef.current.postMessage({ type: "STOP" });
      } catch { }
      workerRef.current.terminate();
      workerRef.current = null;
    }

    const worker = new Worker(new URL("./pollWorker.js", import.meta.url), { type: "module" });
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, payload } = e.data || {};

      if (type === "ZONES") {
        setZones((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(payload)) return prev;
          setZoneIndex((i) => Math.min(i, payload.length - 1));
          return payload;
        });
      }

      if (type === "DASHBOARD") {
        setLoading(false);
        setRefreshing(false);
        setData(payload.data);
      }

      if (type === "ERROR") {
        setError(payload.message);
      }
    };

    const ud = JSON.parse(sessionStorage.getItem("userData") || "{}");
    worker.postMessage({
      type: "INIT",
      payload: {
        token,
        vid: ud.user?.vid,
        username: ud.user?.username,
      },
    });

    return () => {
      try {
        worker.postMessage({ type: "STOP" });
      } catch { }
      worker.terminate();
    };
  }, [token]);


  /* ---------------------------------------
     ZONE CHANGE
  --------------------------------------- */
  useEffect(() => {
    if (!workerRef.current || !activeZone) return;
    setRefreshing(true);

    workerRef.current.postMessage({
      type: "SET_ZONE",
      payload: { zone: activeZone },
    });
  }, [activeZone]);


  /* ---------------------------------------
     AUTO ROTATE ZONES
  --------------------------------------- */
  useEffect(() => {
    if (!zones.length) return;
    const id = setInterval(() => {
      setZoneIndex((i) => (i + 1) % zones.length);
    }, 15000);
    return () => clearInterval(id);
  }, [zones.length]);


  /* ---------------------------------------
     FORCE PAGE RELOAD WHEN INTERNET RETURNS
  --------------------------------------- */
  useEffect(() => {
    const onOnline = () => {
      console.log("Internet restored → Refreshing page...");
      window.location.reload(); // FULL PAGE RELOAD (Option B)
    };

    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);


  /* ---------------------------------------
     FORCE LOGIN CHECK
  --------------------------------------- */
  const ud = JSON.parse(sessionStorage.getItem("userData"));
  if (!ud || !ud.token) {
    window.location.reload();
    console.log("Restarted due to missing session...");
  }


  /* ---------------------------------------
     RENDER UI (NO DOM/CSS CHANGES)
  --------------------------------------- */
  const hourly = data?.hourlyData || [];
  const status = data?.peakStats?.Status || "";
  const statusLower = status.toLowerCase();
  console.log(statusLower, "data")
  let badgeCls = "badge-safe";
  if (statusLower.includes("almost")) badgeCls = "badge-almost";
  else if (statusLower.includes("full")) badgeCls = "badge-full";
  else if (statusLower.includes("empty")) badgeCls = "badge-empty";

  const zoneOptions = zones.map((z, i) => ({ value: i, label: z }));

  let dashwrapCls = "dashwrap-safe";
  if (statusLower.includes("almost")) dashwrapCls = "dashwrap-almost";
  else if (statusLower.includes("full")) dashwrapCls = "dashwrap-full";
  else if (statusLower.includes("empty")) dashwrapCls = "dashwrap-empty";

  return (
    <div className={`dashboard-wrapper ${dashwrapCls}`}>
      {/* HEADER */}
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
              value={zoneOptions[zoneIndex] || null}
              onChange={(o) => setZoneIndex(o?.value || 0)}
              className="singlezoneDropdown"
            />
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="singleviewBodySec">
        {error ? (
          <div className="datareason center-message"><p>{error === "Dashboard API failed: Failed to fetch" ? "Server Disconnected.. Contact IT Team" : error}</p></div>
        ) : loading ? (
          <div style={{
            height: "83vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <Loader />
          </div>
        ) : !data ? (
          <div className="datareason center-message"><NoData /></div>
        ) : data.zoneStatus !== "Go Live" ? (
          <div className="datareason center-message">
            <p>No Live Data Available</p>
          </div>
        ) : (
          <>
            {/* TOP CARDS */}
            <div className="dash3-stat-grid">
              <StatCard icon={OccupancyIcon} label="Live Occupancy">
                <AnimatedNumber value={data.liveStats.LiveOccupancy} />
              </StatCard>

              <StatCard icon={CapacityIcon} label="Max Capacity">
                <AnimatedNumber value={data.capacityStats.Maxcapacity} />
              </StatCard>

              <StatCard icon={PercentageIcon} label="Percentage">
                <AnimatedNumber value={data.liveStats.Percentage} suffix="%" />
              </StatCard>

              <div className={`dash3-status-badge ${badgeCls}`}>
                <img
                  src={
                    statusLower.includes("safe")
                      ? SafeIcon
                      : statusLower.includes("almost")
                        ? AlmostFullIcon
                        : statusLower.includes("full")
                          ? FullIcon
                          : statusLower.includes("empty")
                            ? EmptyIcon
                            : SafeIcon
                  }
                  alt="status"
                  className="dash3-icon badge-icon"
                />
                <div className="dash3-status-text">
                  {/* {statusLower.includes("safe") ? "Safe to Enter" : status} */}
                  {status}
                </div>
              </div>
            </div>

            {/* CHART & SIDE CARDS */}
            <div className="dash3-bottom-row">

              {/* CHART */}
              <div className="dash3-chart-section">
                <h3>Hourly Trends</h3>

                <div className="chart-container">
                  <CanvasChart hourly={hourly} />
                  {refreshing && <div className="chart-overlay">Updating…</div>}
                </div>

                <div className="dash3-chart-footer">
                  <span>
                    <img src={TotalInIcon} className="total-icon" width="22" height="22" />
                    Total In: <strong className="dash3-in">
                      <AnimatedNumber value={data.totals.Totalin} />
                    </strong>
                  </span>

                  <span>
                    <img src={TotalOutIcon} className="total-icon" width="22" height="22" />
                    Total Out: <strong className="dash3-out">
                      <AnimatedNumber value={data.totals.Totalout} />
                    </strong>
                  </span>
                </div>
              </div>



              {/* SIDE STATS */}
              <div className="dash3-side-grid">
                <StatSideCard icon={RemainingCapacityIcon} label="Remaining Capacity">
                  <AnimatedNumber value={data.capacityStats.Remainingcapacity} />
                </StatSideCard>

                <StatSideCard icon={PeakOccIcon} label="Peak Occupancy">
                  <AnimatedNumber value={data.peakStats.Peakoccupancy} />
                </StatSideCard>

                <StatSideCard icon={PeakHourIcon} label="Peak Hour">
                  {data.peakStats.Peakhour} <span className="dash3-hr-suffix">Hr</span>
                </StatSideCard>
              </div>


            </div>

            {/* {data?.peakStats?.MarqueeStatus && (
              <div className="footer-marquee-wrap">
                <div className="footer-marquee">
                  <div className="footer-marquee-text">
                    {data?.peakStats?.MarqueeMessage}
                  </div>
                </div>
              </div>
                    )} */}
                    {data?.peakStats?.MarqueeStatus && (
                      <div className="footer-marquee-wrap">
                        <Marquee text={data?.peakStats?.MarqueeMessage} />
                      </div>
                    )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
