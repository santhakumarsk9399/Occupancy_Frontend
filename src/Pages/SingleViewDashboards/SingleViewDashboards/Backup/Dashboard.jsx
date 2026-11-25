// Dashboard.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef
} from "react";
import { fetchZones, fetchDashboard } from "./api";
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


/* ===== helpers ===== */
const deepEqual = (a, b) =>
  JSON.stringify(a) === JSON.stringify(b);

export default function Dashboard() {
  const [token, setToken] = useState(null);
  const [vid, setVid] = useState(null);
  const [username, setUsername] = useState("");

  const [zones, setZones] = useState([]);
  const [zoneIndex, setZoneIndex] = useState(0);

  const [data, setData] = useState(null);
  const prevDataRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const workerRef = useRef(null);
  const activeZone = zones[zoneIndex];


  /* ===============================
     INITIAL AUTH + ZONES LOAD
  =============================== */
  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    if (!userData?.token) return;

    setToken(userData.token);
    setVid(userData.user.vid);
    setUsername(userData.user.username);

    fetchZones(
      userData.token,
      userData.user.vid,
      userData.user.username
    ).then(setZones);

  }, []);


  /* ===============================
         START WEB WORKER
  =============================== */
  useEffect(() => {
    if (!token || !vid || !username) return;

    const worker = new Worker(
      new URL("./pollWorker.js", import.meta.url),
      { type: "module" }
    );

    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, payload } = e.data || {};

      if (type === "ZONES") {
        setZones((prev) =>
          deepEqual(prev, payload) ? prev : payload
        );
      }

      if (type === "DASHBOARD") {
        // ✅ Skip UI update when data unchanged
        if (!deepEqual(prevDataRef.current, payload.data)) {
          prevDataRef.current = payload.data;
          setData(payload.data);
        }
        setLoading(false);
      }

      if (type === "ERROR") {
        setError(payload.message);
      }
    };

    worker.postMessage({
      type: "INIT",
      payload: { token, vid, username }
    });

    return () => worker.terminate();
  }, [token, vid, username]);


  /* ===============================
      TELL WORKER ACTIVE ZONE
  =============================== */
  useEffect(() => {
    if (!workerRef.current || !activeZone) return;

    workerRef.current.postMessage({
      type: "SET_ZONE",
      payload: { zone: activeZone }
    });

  }, [activeZone]);


  /* ===============================
         UI ROTATE ZONES
  =============================== */
  useEffect(() => {
    if (!zones.length) return;

    const id = setInterval(() => {
      setZoneIndex(i => (i + 1) % zones.length);
    }, 15000);

    return () => clearInterval(id);

  }, [zones]);


  /* ===============================
          VIEW MODE DATA
  =============================== */

  const hourly = useMemo(() => data?.hourlyData || [], [data]);
  const status = data?.peakStats?.Status || "";

  const zoneOptions = useMemo(
    () => zones.map((z, i) => ({ value: i, label: z })),
    [zones]
  );


  /* ===============================
             RENDER
  =============================== */

  return (
    <div className="dashboard-wrapper">
      <div className="single_dashboard-header">
        <h3>Occupancy Solution <span>2.0</span></h3>

        <h2>{activeZone || "--"}</h2>

        <div className="zone-selector">
          <SingleSelectDropdown
            options={zoneOptions}
            value={zoneOptions[zoneIndex]}
            onChange={o => setZoneIndex(o?.value || 0)}
          />
        </div>

        <div className="userinfo_single">
          <Icon img={usernameicon} Img_width="34px" Img_height="34px" />
          <span>{username}</span>
        </div>
      </div>


      <div className="singleviewBodySec">
        {error ? (
          <div className="center-message">{error}</div>

        ) : loading ? (
          <Loader />

        ) : !data ? (
          <NoData />

        ) : (
          <>
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
            </div>


            <ResponsiveContainer width="100%" height={440}>
              <AreaChart data={hourly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Hours" />
                <YAxis />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="LiveOccupancy"
                  stroke="#1d4ed8"
                  fillOpacity={0.2}
                  strokeWidth={3}

                  /* ✅ NO ANIMATION */
                  isAnimationActive={false}
                />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#1d4ed8"

                  /* ✅ NO ANIMATION */
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}


/* ========== COMPONENTS ========== */

function StatCard({ icon, label, children }) {
  return (
    <div className="dash3-stat-card">
      <img src={icon} />
      <div>{children}</div>
      <div>{label}</div>
    </div>
  );
}


/* ✅ RAF disabled on refresh updates */
function AnimatedNumber({ value, suffix = "" }) {
  const [display, setDisplay] = useState(value || 0);

  useEffect(() => {
    setDisplay(value);
  }, [value]);

  return (
    <span className="animated-number">
      {display}{suffix}
    </span>
  );
}
