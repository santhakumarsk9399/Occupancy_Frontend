// src/workers/dashboard.worker.js
// Note: this is a plain web worker script (no imports). It uses fetch directly.

let BASE = "";
let token = null;
let vid = null;
let username = null;
let activeZone = null;
let running = false;

// internal controllers (so we can abort previous fetches)
let dashboardController = null;
let zonesController = null;

// helper: safe JSON parse + handleResponse (mirrors main api behaviour)
async function handleResponse(res) {
    const text = await res.text();
    let payload = null;
    try {
        payload = text ? JSON.parse(text) : null;
    } catch (e) {
        payload = null;
    }
    if (!res.ok) {
        const msg =
            payload?.message ||
            payload?.error ||
            text ||
            `HTTP ${res.status} ${res.statusText}`;
        const err = new Error(msg);
        err.status = res.status;
        throw err;
    }
    return payload;
}

// fetch zones (returns array of zone names)
async function fetchZones() {
    if (!BASE || !token || !vid || !username) return [];
    if (zonesController) zonesController.abort();
    zonesController = new AbortController();
    const url = new URL(`${BASE}/dashboard/dashboardFilter/getSelectedZones`);
    url.searchParams.append("vid", vid);
    url.searchParams.append("username", username);

    const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        signal: zonesController.signal,
    });

    const payload = await handleResponse(res);
    const raw = payload?.data?.selectedZones?.[0] || "";
    return raw.split(",").filter(Boolean);
}

// fetch dashboard for a single zone (API expects selectedZone array query param)
async function fetchDashboard(zone) {
    if (!BASE || !token || !zone) return null;
    if (dashboardController) dashboardController.abort();
    dashboardController = new AbortController();

    const url = new URL(`${BASE}/dashboard/getSingleZoneData`);
    // append selectedZone multiple times
    url.searchParams.append("selectedZone", zone);

    const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        signal: dashboardController.signal,
    });

    const payload = await handleResponse(res);
    return payload;
}

// main loop: dashboard every 5s, zones every 10s
async function runLoops() {
    if (running) return;
    running = true;

    // dashboard tick function
    async function dashboardTick() {
        if (!running) return;
        try {
            if (activeZone) {
                const d = await fetchDashboard(activeZone);
                // send dashboard data to main thread
                postMessage({ type: "dashboard", data: d });
            }
        } catch (e) {
            // ignore abort errors (expected) but forward others
            if (e.name !== "AbortError") {
                postMessage({ type: "error", error: e.message || String(e) });
            }
        } finally {
            // schedule next tick only if still running
            if (running) {
                setTimeout(dashboardTick, 5000); // 5s
            }
        }
    }

    // zones tick function
    async function zonesTick() {
        if (!running) return;
        try {
            const z = await fetchZones();
            postMessage({ type: "zones", zones: z });
        } catch (e) {
            if (e.name !== "AbortError") {
                postMessage({ type: "error", error: e.message || String(e) });
            }
        } finally {
            if (running) {
                setTimeout(zonesTick, 10000); // 10s
            }
        }
    }

    // start both loops
    dashboardTick();
    zonesTick();
}

// stop loops & abort ongoing fetches
function stopLoops() {
    running = false;
    if (dashboardController) {
        dashboardController.abort();
        dashboardController = null;
    }
    if (zonesController) {
        zonesController.abort();
        zonesController = null;
    }
}

// message handler from main thread
onmessage = function (ev) {
    const msg = ev.data || {};
    const { type } = msg;

    switch (type) {
        case "init":
            // { type:'init', base, token, vid, username, activeZone }
            BASE = msg.base || BASE;
            token = msg.token || token;
            vid = msg.vid || vid;
            username = msg.username || username;
            activeZone = msg.activeZone || activeZone;
            // start loops if not running
            runLoops();
            break;

        case "setToken":
            token = msg.token;
            break;

        case "setUser":
            vid = msg.vid;
            username = msg.username;
            break;

        case "setActiveZone":
            // change zone immediately and trigger a fresh fetch (by aborting previous dashboard fetch)
            activeZone = msg.activeZone;
            if (dashboardController) {
                dashboardController.abort();
                dashboardController = null;
            }
            // immediately fetch for the new zone and send result (non-blocking)
            (async () => {
                try {
                    if (activeZone) {
                        const d = await fetchDashboard(activeZone);
                        postMessage({ type: "dashboard", data: d });
                    }
                } catch (e) {
                    if (e.name !== "AbortError") {
                        postMessage({ type: "error", error: e.message || String(e) });
                    }
                }
            })();
            break;

        case "fetchNow": // manual immediate fetch of dashboard (optional)
            (async () => {
                try {
                    if (activeZone) {
                        const d = await fetchDashboard(activeZone);
                        postMessage({ type: "dashboard", data: d });
                    }
                } catch (e) {
                    if (e.name !== "AbortError") {
                        postMessage({ type: "error", error: e.message || String(e) });
                    }
                }
            })();
            break;

        case "stop":
            stopLoops();
            break;

        case "start":
            runLoops();
            break;

        default:
            // unknown message
            break;
    }
};
