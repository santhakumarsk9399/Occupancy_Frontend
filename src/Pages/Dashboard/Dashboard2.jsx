import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import CustomCard from "../CommonComponents/Card";
import NoData from "../CommonComponents/NoDataAvailable";
import Loader from "../CommonComponents/Loader";
import "../../Components/Styles/LiveChart.css";
import "../../Components/Styles/Table.css";
import "../../Components/Styles/Dashboard2.css";
import axios from "axios";

// Fallback band calculator if API omits Status
const bandFromPct = (pct) => {
  if (pct <= 50) return "Low";
  if (pct <= 80) return "Medium";
  return "High";
};

const Dashboard2 = ({ zones = [], isActive = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    all: 0,
    low: 0,
    medium: 0,
    high: 0,
  });
  const [rowsAll, setRowsAll] = useState([]);
  const [rowsLow, setRowsLow] = useState([]);
  const [rowsMedium, setRowsMedium] = useState([]);
  const [rowsHigh, setRowsHigh] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");

  const token = sessionStorage.getItem("token");
  const vid = sessionStorage.getItem("vid");
  const username = sessionStorage.getItem("username");
  const API_URL = import.meta.env.VITE_API_URL; // base

  const lastFetchRef = useRef(0);
  const inFlightRef = useRef(false);

  const buildRow = (r, idx) => {
    console.log(r);
    const occ = r.Occupancy ?? r.occupancy ?? 0;
    const cap = r.Capacity ?? r.capacity ?? 0;
    let pctRaw;
    if (typeof r.OccupancyPercentage === "number")
      pctRaw = r.OccupancyPercentage;
    else if (typeof r.occupancyPercentage === "number")
      pctRaw = r.occupancyPercentage;
    else if (cap) pctRaw = (occ / cap) * 100;
    else pctRaw = 0;
    const pct = Math.round(pctRaw * 100) / 100;
    const status = r.Status;
    // const band = bandFromPct(pct);
    const band = r.Status;
    return {
      id: idx,
      zone: r.ZoneName,
      in: r.Incount ?? r.in ?? 0,
      out: r.Outcount ?? r.out ?? 0,
      occupancy: occ,
      capacity: cap,
      pct,
      band,
      threshold: r.Threshold ?? r.threshold ?? null,
    };
  };

  const fetchData = useCallback(async () => {
    if (!zones.length) {
      setRowsAll([]);
      setSummary({ all: 0, low: 0, medium: 0, high: 0 });
      return;
    }

    const now = Date.now();
    if (now - lastFetchRef.current < 5000) return; // throttle
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    setError(null);
    setLoading(true); // ✅ loader only when fetching

    try {
      // const body = { selectedZones: [zones.join(",")], vid, username };
      const selectedZoneStr = zones.join(","); // Join into one CSV string
      const dashpayload = {
        selectedZones: selectedZoneStr, // Wrap in array for API format
      };
      const res = await axios.get(`${API_URL}/dashboard/getDashboard2Data`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
        params: dashpayload,
      });
      const { data = {} } = res.data || {};
      console.log(res.data);
      const allRows = (data.all || []).map((r, i) => buildRow(r, i));
      const lowRows = allRows.filter((r) => r.band === "Low");
      const mediumRows = allRows.filter((r) => r.band === "Medium");
      const highRows = allRows.filter((r) => r.band === "High");

      setRowsAll(allRows);
      setRowsLow(lowRows);
      setRowsMedium(mediumRows);
      setRowsHigh(highRows);
      setSummary({
        all: allRows.length,
        low: lowRows.length,
        medium: mediumRows.length,
        high: highRows.length,
      });
    } catch (e) {
      if (e.response) {
        setError(
          `API error ${e.response.status}: ${
            e.response.data?.message || "Failed to load data"
          }`
        );
        console.log(e.response);
      } else if (e.request) {
        setError("No response from server (network/CORS issue?)");
      } else {
        setError(e.message || "Unknown error");
      }
      setRowsAll([]);
      setRowsLow([]);
      setRowsMedium([]);
      setRowsHigh([]);
      setSummary({ all: 0, low: 0, medium: 0, high: 0 });
    } finally {
      lastFetchRef.current = Date.now();
      inFlightRef.current = false;
      setLoading(false); // ✅ hide loader when fetch ends
    }
  }, [API_URL, token, zones, vid, username]);

  // First load + when tab becomes active
  useEffect(() => {
    if (isActive) {
      if (rowsAll.length === 0) {
        setLoading(true); // ✅ only first time
      }
      lastFetchRef.current = 0; // reset throttle
      fetchData();
    }
  }, [isActive, fetchData]);

  // When zones change (while active)
  useEffect(() => {
    if (!isActive || !zones.length) return;
    if (rowsAll.length === 0) {
      setLoading(true); // ✅ don’t flash if already have data
    }
    lastFetchRef.current = 0;
    fetchData();
  }, [zones, isActive, fetchData]);

  // Reset filter when tab/zones change
  useEffect(() => {
    setActiveFilter("All");
  }, [zones, isActive]);

  // Poll every 15s when active
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      fetchData();
    }, 15000);
    return () => clearInterval(interval);
  }, [isActive, fetchData]);

  const filtered = useMemo(() => {
    switch (activeFilter) {
      case "Low":
        return rowsLow;
      case "Medium":
        return rowsMedium;
      case "High":
        return rowsHigh;
      case "All":
      default:
        return rowsAll;
    }
  }, [activeFilter, rowsAll, rowsLow, rowsMedium, rowsHigh]);

  const counts = {
    All: summary.all,
    Low: summary.low,
    Medium: summary.medium,
    High: summary.high,
  };

  return (
    <div className="dash2-container">
      {/* ✅ Show loader only when loading & no previous data */}
      {loading && rowsAll.length === 0 ? (
        <div
          style={{
            height: "75vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader />
        </div>
      ) : error ? (
        // ✅ Error block
        <div
          className="Dash2_NoDataTopsection"
          style={{
            height: "75vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#c00",
          }}
        >
          {error}
        </div>
      ) : rowsAll.length === 0 ? (
        // ✅ No data available
        <div className="Dash2_NoDataTopsection" style={{ height: "75vh" }}>
          <NoData name="no-data-container" />
        </div>
      ) : (
        // ✅ Main content (when data available)
        <div className="mainSection">
          {!error && (
            <div className="dash2-filters">
              {[
                { key: "All", label: `All ${summary.all}` },
                { key: "Low", label: `Low ${summary.low}` },
                { key: "Medium", label: `Medium ${summary.medium}` },
                { key: "High", label: `High ${summary.high}` },
              ].map((b) => (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => setActiveFilter(b.key)}
                  className={`dash2-filter-btn ${
                    activeFilter === b.key ? "active" : ""
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}

          <CustomCard size="md" className="p-0">
            <div className="dash2-table">
              {filtered.length > 0 && (
                <div className="dash2-table-head">
                  <div>Zone Name</div>
                  <div>In</div>
                  <div>Out</div>
                  <div>Occupancy</div>
                  <div>Capacity</div>
                  <div>Occupied %</div>
                </div>
              )}

              <div className="dash2-row-list">
                {!error && filtered.length === 0 && (
                  <NoData name="no-data-dashboard" />
                )}
                {!error &&
                  filtered.length > 0 &&
                  filtered.map((row) => (
                    <div key={row.id} className="dash2-row">
                      <div>{row.zone}</div>
                      <div>{row.in}</div>
                      <div>{row.out}</div>
                      <div>{row.occupancy}</div>
                      <div>{row.capacity}</div>
                      <div
                        className={
                          row.band === "Low"
                            ? "dash2-pct-low"
                            : row.band === "Medium"
                            ? "dash2-pct-medium"
                            : "dash2-pct-high"
                        }
                      >
                        {row.pct}%
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </CustomCard>
        </div>
      )}
    </div>
  );

  // return (
  //   <div className="dash2-container">
  //     {loading ? (
  //       // ✅ Loader only when no data
  //       <div
  //         style={{
  //           height: "75vh",
  //           display: "flex",
  //           alignItems: "center",
  //           justifyContent: "center",
  //         }}
  //       >
  //         <Loader />
  //       </div>
  //     ) : rowsAll.length > 0 ? (
  //       <div className="mainSection">
  //         {!error && (
  //           <div className="dash2-filters">
  //             {[
  //               { key: "All", label: `All ${counts.All}` },
  //               { key: "Low", label: `Low ${counts.Low}` },
  //               { key: "Medium", label: `Medium ${counts.Medium}` },
  //               { key: "High", label: `High ${counts.High}` },
  //             ].map((b) => (
  //               <button
  //                 key={b.key}
  //                 type="button"
  //                 onClick={() => setActiveFilter(b.key)}
  //                 className={`dash2-filter-btn ${
  //                   activeFilter === b.key ? "active" : ""
  //                 }`}
  //               >
  //                 {b.label}
  //               </button>
  //             ))}
  //           </div>
  //         )}

  //         <CustomCard size="md" className="p-0">
  //           <div className="dash2-table">
  //             {filtered.length > 0 && (
  //               <div className="dash2-table-head">
  //                 <div>Zone Name</div>
  //                 <div>In</div>
  //                 <div>Out</div>
  //                 <div>Occupancy</div>
  //                 <div>Capacity</div>
  //                 <div>Occupied %</div>
  //               </div>
  //             )}

  //             <div className="dash2-row-list">
  //               {error && (
  //                 <div
  //                   className="dash2-row"
  //                   style={{ justifyContent: "center", color: "#c00" }}
  //                 >
  //                   {error}
  //                 </div>
  //               )}
  //               {!error && filtered.length === 0 && <NoData name="no-data-dashboard"/>}
  //               {!error &&
  //                 filtered.length > 0 &&
  //                 filtered.map((row) => (
  //                   <div key={row.id} className="dash2-row">
  //                     <div>{row.zone}</div>
  //                     <div>{row.in}</div>
  //                     <div>{row.out}</div>
  //                     <div>{row.occupancy}</div>
  //                     <div>{row.capacity}</div>
  //                     <div
  //                       className={
  //                         row.band === "Low"
  //                           ? "dash2-pct-low"
  //                           : row.band === "Medium"
  //                           ? "dash2-pct-medium"
  //                           : "dash2-pct-high"
  //                       }
  //                     >
  //                       {row.pct}%
  //                     </div>
  //                   </div>
  //                 ))}
  //             </div>
  //           </div>
  //         </CustomCard>
  //       </div>
  //     ) : error ? (
  //       // ✅ Show error if API fails
  //       <div
  //         className="Dash2_NoDataTopsection"
  //         style={{ height: "75vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#c00" }}
  //       >
  //         {error}
  //       </div>
  //     ) : !loading && rowsAll.length === 0 ? (
  //       // ✅ Show NoData only after loading finished
  //       <div className="Dash2_NoDataTopsection" style={{ height: "75vh" }}>
  //         <NoData name="no-data-container"/>
  //       </div>
  //     ) : null}
  //   </div>
  // );
};

export default Dashboard2;
