const BASE = import.meta.env.VITE_API_URL;

let token = null;
let vid = null;
let username = null;
let zone = null;

let zoneTimer = null;
let dashTimer = null;

const headers = () => ({
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` })
});

async function fetchZones() {
  const url = new URL("/dashboard/dashboardFilter/getSelectedZones", BASE);
  url.searchParams.set("vid", vid);
  url.searchParams.set("username", username);

  const res = await fetch(url, { headers: headers() });
  const j = await res.json();

  const raw = j?.data?.selectedZones?.[0] || "";

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

  postMessage({
    type: "DASHBOARD",
    payload: { data },
  });
}

onmessage = (e) => {
  const { type, payload } = e.data;

  if (type === "INIT") {
    token = payload.token;
    vid = payload.vid;
    username = payload.username;

    fetchZones();
    if (!zoneTimer) zoneTimer = setInterval(fetchZones, 15000);
  }

  if (type === "SET_ZONE") {
    zone = payload.zone;
    fetchDashboard();

    if (dashTimer) clearInterval(dashTimer);
    dashTimer = setInterval(fetchDashboard, 5000);
  }

  if (type === "STOP") {
    clearInterval(zoneTimer);
    clearInterval(dashTimer);
    close();
  }
};
