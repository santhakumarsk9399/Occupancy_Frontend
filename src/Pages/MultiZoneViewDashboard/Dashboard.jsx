import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import MultiSelectDropdown from "../CommonComponents/MultiSelectDropDown";
import Loader from "../CommonComponents/Loader";
import NoData from "../CommonComponents/NoDataAvailable";
import Icon from "../CommonComponents/icon";
// import "../../Components/Styles/Dashboard3.css";
import "../MultiZoneViewDashboard/Multizone.css";
import safetoenterIcon from "../../Components/Assets/dashboard/sv_safetoenter.svg";
import emptyIcon from "../../Components/Assets/dashboard/sv_empty.svg";
import almostfulIcon from "../../Components/Assets/dashboard/sv_allmostfull.svg";
import fulIcon from "../../Components/Assets/dashboard/sv_full.svg";
import MultizoneMiniChart from "./MultizoneMiniChart";
import Footer from "../CommonComponents/Footer";
import { CloudCog } from "lucide-react";
import SelectZones from "../CommonComponents/SelectZonesValidation";

// ----------------- Occupancy classification -----------------
const classify = (pct, status) => {
  if (status) {
    const s = status.toLowerCase();
    if (s.includes("almost"))
      return { label: "Almost Full", variant: "almost" };
    if (s === "full") return { label: "Full", variant: "full" };
    if (s.includes("safe")) return { label: "Safe to Enter", variant: "safe" };
    if (s.includes("empty")) return { label: "Empty", variant: "empty" };
  }
  if (pct === 0) return { label: "Empty", variant: "empty" };
  if (pct >= 100) return { label: "Full", variant: "full" };
  if (pct >= 80) return { label: "Almost Full", variant: "almost" };
  return { label: "Safe to Enter", variant: "safe" };
};

// ----------------- Dashboard Component -----------------
const MultizoneaDashboard = ({ isActive = true }) => {
  const [zones, setZones] = useState([]);
  const [selectedZones, setSelectedZones] = useState([]);
  const [rows, setRows] = useState([]);
  const [displayRows, setDisplayRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);
  const [error, setError] = useState(null);
  const [zoneStatus, setZoneStatus] = useState(null);

  // const username = sessionStorage.getItem("username");
  const API_URL = import.meta.env.VITE_API_URL;
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  const token = userData
    ? userData?.token
    : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImlhdCI6MTc2MTU0OTgyNywiZXhwIjoxNzYxNjM2MjI3fQ.svwM6pFKRLlultSzUVZUU8F6J0SFa_U9u7CB9Be22AU";
  const username = userData?.user?.username;
  const vid = userData?.user?.vid;
  // const username = "Occupancy";
  // const vid = 4;

  // ---------------- FETCH ZONE LIST ----------------
  const fetchZones = useCallback(async () => {
    // const token = sessionStorage.getItem("token");
    // const token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImlhdCI6MTc2MTI4MjQ5MSwiZXhwIjoxNzYxMzY4ODkxfQ.P-K3Byx4zX5knj9KkU1fkorMfr8d4kLHfOE1fbJLy48';
    console.log(token, "token");
    setLoadingZones(true);
    try {
      const url = `${API_URL}/dashboard/dashboardFilter/getSelectedZones`;
      const res = await axios.get(url, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
        params: { vid: vid, username: username },
      });

      const zonesString = res?.data?.data?.selectedZones?.[0] || "";
      if (zonesString) {
        const zonesArray = zonesString
          .split(",")
          .map((z) => ({ label: z.trim(), value: z.trim() }));
        setZones(zonesArray);
        setSelectedZones(zonesArray);
        // Immediately fetch dashboard data for the loaded zones
        try {
          // fetchDashboard is defined below; it's safe to call here because
          // this effect runs after mount when fetchDashboard exists.
          // We call with zonesArray so the request uses the newly selected zones.
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          fetchDashboard(zonesArray);
        } catch (e) {
          // swallow — fetchDashboard handles its own errors
        }
      } else {
        setZones([]);
        setSelectedZones([]);
      }
    } catch (err) {
      console.error("Error fetching zones:", err);
    } finally {
      setLoadingZones(false);
    }
  }, [API_URL, token]);

  // ---------------- FETCH DASHBOARD DATA ----------------
  // fetchDashboard optionally accepts a zones array (e.g. the new selection)
  // If none passed, it falls back to the `selectedZones` state.
  const fetchDashboard = useCallback(
    async (zonesArg) => {
      const zonesToUse = Array.isArray(zonesArg) ? zonesArg : selectedZones;
      if (!zonesToUse || zonesToUse.length === 0) {
        setRows([]);
        return;
      }

      setLoading(true);
      setError(null);
      setZoneStatus(null);

      try {
        // const endpoint = `${API_URL}/dashboard/getMultiZoneStableData`;
               const endpoint = `${API_URL}/multiZone/getMultiZoneViewData`;
        
        const selectedValues = zonesToUse.map((z) => z.value).join(",");
        const params = { username, selectedZones: selectedValues };

        const res = await axios.get(endpoint, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
          params,
        });

        // Store the multiZoneStatus
        setZoneStatus(res?.data?.multiZoneStatus?.Zonestatus);

        const zonesData = res?.data?.data || [];
        if (!Array.isArray(zonesData) || zonesData.length === 0) {
          setRows([]);
          return;
        }

        const transformed = zonesData.map((z) => {
          const zoneName = z.ZoneName || "Unknown";
          const occ = z.LiveOccupancy ?? 0;
          const cap = z.Capacity ?? 0;
          const pct = z.OccupancyPercentage ?? (cap ? (occ / cap) * 100 : 0);
          const remaining = z.RemainingCapacity ?? "-";
          const status = z.Status || "";
          const meta = classify(pct, status);
          const hourly = Array.isArray(z.hourlyData) ? z.hourlyData : [];

          return {
            id: zoneName,
            zone: zoneName,
            occupancy: occ,
            capacity: cap,
            pct: Math.round(pct * 100) / 100,
            remaining,
            label: meta.label,
            variant: meta.variant,
            hourlyData: hourly,
          };
        });

        // Filter transformed rows to include only currently selected zones (by value)
        const selectedZoneValues = zonesToUse.map((s) => s.value);
        const filtered = transformed.filter((t) =>
          selectedZoneValues.includes(t.zone)
        );
        setRows(filtered);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError("Failed to fetch data");
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [API_URL, token, username, selectedZones]
  );

  // ---------------- ROTATE DISPLAY ROWS WITH ANIMATION ----------------
  useEffect(() => {
    if (rows.length === 0) {
      setDisplayRows([]);
      return;
    }

    const chunkSize = 6;

    // If we have 6 or fewer rows, show all of them without rotation
    if (rows.length <= chunkSize) {
      setDisplayRows(rows);
      return; // No need for rotation
    }

    // Build chunks of size 6, for the last incomplete chunk use previous complete chunk
    const chunks = [];
    for (let i = 0; i < rows.length; i += chunkSize) {
      const slice = rows.slice(i, i + chunkSize);
      if (slice.length < chunkSize && i + chunkSize >= rows.length) {
        // This is the last incomplete chunk
        // Get the last 5 items from previous complete chunk and add current items
        const prevCompleteChunk = rows.slice(i - chunkSize, i);
        const lastIncompleteItems = rows.slice(i);
        // Take last (6 - remaining items) from previous chunk
        const fillersNeeded = chunkSize - lastIncompleteItems.length;
        const fillers = prevCompleteChunk.slice(-fillersNeeded);
        chunks.push([...fillers, ...lastIncompleteItems]);
      } else {
        chunks.push(slice);
      }
    }

    // If rows.length is not a multiple of chunkSize, the user wants the quotient shown as the last six
    // We already padded the last chunk above so its length is chunkSize.

    // Initially show the first chunk
    let idx = 0;
    setDisplayRows(chunks[idx]);

    const rotationInterval = 15000; // 15 seconds
    const interval = setInterval(() => {
      idx = (idx + 1) % chunks.length;
      setDisplayRows(chunks[idx]);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [rows]);

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    if (isActive) fetchZones();
  }, [isActive, fetchZones]);
  // Removed the automatic effect that triggered fetchDashboard on selectedZones change
  // because we now call fetchDashboard explicitly from the dropdown onChange and
  // immediately after default zones are loaded. This prevents duplicate requests.
  // Poll the dashboard every 5 seconds while component is active and zones selected
  useEffect(() => {
    if (!isActive) return;
    if (!selectedZones || selectedZones.length === 0) return;

    const intervalId = setInterval(() => {
      fetchDashboard();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [isActive, selectedZones, fetchDashboard]);

  // ---------------- JSX ----------------
  return (
    <div className="occupancy-container">
      {/* Header */}
      <div className="occupancy-header">
        <div className="projectTitle">
          <h2 className="panel-title clickable-title">
            Occupancy Solution<span className="version">2.0</span>
          </h2>
        </div>
        <div className="moduleTitle">
          <h2>Live Occupancy</h2>
        </div>
        <div className="zone-filter">
          <label>Zone</label>
          {loadingZones ? (
            <Loader size="sm" />
          ) : (
            <MultiSelectDropdown
              options={zones}
              value={selectedZones}
              onChange={(newSelection) => {
                setSelectedZones(newSelection);

                // Immediately fetch dashboard for the new selection so UI updates
                // without waiting for the next render/effect cycle.
                try {
                  fetchDashboard(newSelection);
                } catch (e) {
                  // fetchDashboard handles its own errors; ignore here
                }

                // Immediately reset display rows based on new selection
                // Note: rows will update after fetchDashboard runs; here we defensively compute
                const newRows = rows; // current rows; fetchDashboard will replace soon
                const chunkSize = 6;
                if (!newRows || newRows.length === 0) {
                  setDisplayRows([]);
                  return;
                }
                if (newRows.length <= chunkSize) {
                  setDisplayRows(newRows);
                  return;
                }
                // Show first chunk of 6, or if less than 6 fill from start
                const firstSlice = newRows.slice(0, chunkSize);
                if (firstSlice.length < chunkSize) {
                  const remainingNeeded = chunkSize - firstSlice.length;
                  const fillers = newRows.slice(0, remainingNeeded);
                  setDisplayRows([...firstSlice, ...fillers]);
                } else {
                  setDisplayRows(firstSlice);
                }
              }}
              placeholder="Select Zones"
            />
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loader-wrap">
          <Loader size="md" />
        </div>
      ) : error ? (
        <div className="error-text">{error}</div>
      ) : selectedZones.length === 0 ? (
        <SelectZones name="no-data-dashboard_multizone" data="Select atleast one zone" />
      ) : zoneStatus === "The process time for this zone hasn't started yet" ? (
        // <div className="no-data-dashboard_multizone">
        //   <p>The process time for this zone hasn't started yet</p>
        // </div>
         <SelectZones name="no-data-dashboard_multizone" data="The process time for this zone hasn't started yet" />
      ) : displayRows.length > 0 ? (
        <div className="occupancy-table">
          <div className="occupancy-table-header">
            <div class="zone-lbl">Zone Name</div>
            <div class="live-occ-lbl">Live Occupants</div>
            <div class="cap-lbl">Capacity</div>
            <div class="per-lbl">Percentage</div>
            <div class="hour-trend-lbl">Hourly Trends</div>
            <div class="remain-cap-lbl">Remaining Capacity</div>
            <div class="status-lbl">Status</div>
          </div>

          <div className="occupancy-table-wrapper">
            {displayRows.map((row) => (
              <div key={row.id} className="occupancy-row">
                <div className="zone-name">{row.zone}</div>
                <div class="live-occ-val">{row.occupancy}</div>
                <div class="cap-val">{row.capacity}</div>
                <div className={`percentage ${row.variant}`}>{row.pct}%</div>
                <div className="chart-cell">
                  {row.hourlyData.length > 0 ? (
                    <MultizoneMiniChart data={row.hourlyData} mini />
                  ) : (
                    <span className="no-chart">--</span>
                  )}
                </div>
                <div class="remain-cap-val">{row.remaining}</div>
                <div>
                  <div className={`status-badge ${row.variant}`}>
                    {/* <Icon
                      img={
                        row.variant === "safe"
                          ? safetoenterIcon
                          : row.variant === "almost"
                          ? almostfulIcon
                          : row.variant === "full"
                          ? fulIcon
                          : emptyIcon
                      }
                      Img_width="22px"
                      Img_height="22px"
                    /> */}
                    <span>{row.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <NoData name="no-data-dashboard_multizone" />
      )}
      <div className="footerContainer">
        <Footer />
      </div>
    </div>
  );
};

export default MultizoneaDashboard;

