// pollWorker.js
const BASE = import.meta.env.VITE_API_URL;

let token = null;
let vid = null;
let username = null;
let zone = null;

let zoneTimer = null;
let dashTimer = null;
let lastHash = null;

const headers = () => ({
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` })
});

function quickHash(d) {
  if (!d) return null;
  return [
    d?.liveStats?.LiveOccupancy,
    d?.capacityStats?.Remainingcapacity,
    d?.peakStats?.Peakoccupancy,
    d?.totals?.Totalin,
    d?.hourlyData?.length
  ].join("-");
}

async function safeFetch(fn, label) {
  try {
    await fn();
  } catch (err) {
    postMessage({
      type: "ERROR",
      payload: {
        message: `${label} failed: ${err?.message || "Network error"}`
      }
    });
  }
}

async function fetchZones() {
  const url = new URL("/dashboard/dashboardFilter/getSelectedZones", BASE);
  url.searchParams.set("vid", vid);
  url.searchParams.set("username", username);

  const res = await fetch(url, { headers: headers() });
  const data = await res.json();

  const raw = data?.data?.selectedZones?.[0] || "";
  postMessage({
    type: "ZONES",
    payload: raw.split(",").filter(Boolean),
  });
}

async function fetchDashboard() {
  if (!zone) return;

  const url = new URL("/dashboard/getSingleZoneData", BASE);
  url.searchParams.append("selectedZone", zone);

  const res = await fetch(url, { headers: headers() });
  const data = await res.json();

  const newHash = quickHash(data);
  if (newHash === lastHash) return;

  lastHash = newHash;

  postMessage({
    type: "DASHBOARD",
    payload: { data }
  });
}

onmessage = (e) => {
  const { type, payload } = e.data || {};

  if (type === "INIT") {
    token = payload.token;
    vid = payload.vid;
    username = payload.username;

    safeFetch(fetchZones, "Zones API");
    if (!zoneTimer)
      zoneTimer = setInterval(() => safeFetch(fetchZones, "Zones API"), 15000);
  }

  if (type === "SET_ZONE") {
    zone = payload.zone;

    safeFetch(fetchDashboard, "Dashboard API");

    if (dashTimer) clearInterval(dashTimer);
    dashTimer = setInterval(() => safeFetch(fetchDashboard, "Dashboard API"), 5000);
  }

  if (type === "STOP") {
    clearInterval(zoneTimer);
    clearInterval(dashTimer);
    close();
  }
};
