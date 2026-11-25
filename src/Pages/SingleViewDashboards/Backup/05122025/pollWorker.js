// pollWorker.js  (web worker module)
const BASE = import.meta.env.VITE_API_URL || "";

let token = null;
let vid = null;
let username = null;
let zone = null;

// control flags
let zoneLoopActive = false;
let dashLoopActive = false;

// abort controllers
let zoneAbort = null;
let dashAbort = null;

// previous snapshots to avoid posting identical payloads
let prevZoneSnap = "";
let prevDashSnap = "";

/** Build URL helper */
function buildUrl(path, params = {}) {
  const url = new URL(path, BASE);
  Object.keys(params || {}).forEach((k) => {
    const v = params[k];
    if (Array.isArray(v)) v.forEach((val) => url.searchParams.append(k, val));
    else if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });
  return url.toString();
}

/** Zone polling loop (15s) */
async function zoneLoop() {
  if (zoneLoopActive) return;
  zoneLoopActive = true;

  while (zoneLoopActive) {
    try {
      if (zoneAbort) zoneAbort.abort();
      zoneAbort = new AbortController();

      const res = await fetch(
        buildUrl("/dashboard/dashboardFilter/getSelectedZones", { vid, username }),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: zoneAbort.signal,
        }
      );

      const text = await res.text();
      let j = null;
      try {
        j = text ? JSON.parse(text) : null;
      } catch (e) {
        j = null;
      }

      const raw = j?.data?.selectedZones?.[0] || "";
      const arr = raw.split(",").filter(Boolean);
      const snap = arr.join("|");
      if (snap !== prevZoneSnap) {
        prevZoneSnap = snap;
        postMessage({ type: "ZONES", payload: arr });
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        postMessage({ type: "ERROR", payload: { message: "Zones fetch failed: " + err.message } });
      }
    }

    await new Promise((r) => setTimeout(r, 15000));
  }
}

/** Dashboard polling loop (5s) */
async function dashLoop() {
  if (dashLoopActive) return;
  dashLoopActive = true;

  while (dashLoopActive) {
    if (!zone) {
      await new Promise((r) => setTimeout(r, 500));
      continue;
    }

    try {
      if (dashAbort) dashAbort.abort();
      dashAbort = new AbortController();

      const res = await fetch(buildUrl("/dashboard/getSingleZoneData", { selectedZone: zone }), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: dashAbort.signal,
      });

      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        data = null;
      }

      // create a small snapshot of only the key fields (cheap)
      const live = data?.liveStats?.LiveOccupancy ?? 0;
      const perc = data?.liveStats?.Percentage ?? 0;
      const max = data?.capacityStats?.Maxcapacity ?? 0;
      const hourlyLen = Array.isArray(data?.hourlyData) ? data.hourlyData.length : 0;
      const snap = `${live}|${perc}|${max}|${hourlyLen}`;

      if (snap !== prevDashSnap) {
        prevDashSnap = snap;
        // send full data to UI only when it changed
        postMessage({ type: "DASHBOARD", payload: { data } });
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        postMessage({ type: "ERROR", payload: { message: "Dashboard fetch failed: " + err.message } });
      }
    }

    await new Promise((r) => setTimeout(r, 5000));
  }
}

/** Message handler from main thread */
onmessage = (e) => {
  const { type, payload } = e.data || {};

  if (type === "INIT") {
    token = payload?.token ?? token;
    vid = payload?.vid ?? vid;
    username = payload?.username ?? username;

    // start loops if not already running
    if (!zoneLoopActive) zoneLoop();
    if (!dashLoopActive) dashLoop();
  }

  if (type === "SET_ZONE") {
    zone = payload?.zone ?? zone;
    prevDashSnap = ""; // force immediate push after zone change
    if (!dashLoopActive) dashLoop();
  }

  if (type === "STOP") {
    zoneLoopActive = false;
    dashLoopActive = false;
    try {
      if (zoneAbort) zoneAbort.abort();
      if (dashAbort) dashAbort.abort();
    } catch (e) {}
  }
};
