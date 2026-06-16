// // api.js

// const API_URL = import.meta.env.VITE_API_URL;
// const BASE = API_URL;
// /**
//  * Handle API responses consistently (no double-read)
//  */
// async function handleResponse(res) {
//   const text = await res.text(); // read once

//   let payload;
//   try {
//     payload = text ? JSON.parse(text) : null;
//   } catch {
//     payload = null;
//   }

//   if (!res.ok) {
//     const msg =
//       payload?.message ||
//       payload?.error ||
//       text ||
//       `HTTP ${res.status} ${res.statusText}`;
//     throw new Error(msg);
//   }

//   return payload;
// }

// /**
//  * Generic POST with JSON
//  */
// async function postJson(path, body, token) {
//   const res = await fetch(`${BASE}${path}`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     },
//     body: JSON.stringify(body || {}),
//   });

//   return handleResponse(res);
// }

// /**
//  * Generic GET with query params
//  */
// async function getJson(path, params = {}, token) {
//   const url = new URL(`${BASE}${path}`);
//   Object.keys(params).forEach((k) => url.searchParams.append(k, params[k]));

//   const res = await fetch(url, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     },
//   });

//   return handleResponse(res);
// }

// /**
//  * 🔑 Login with encrypted key
//  */
// export async function login(key) {
//   const data = await getJson("/auth/dashboardViewLogin", { key });
//   return { token: data?.token?.token, user: data?.user };
// }

// /**
//  * 📌 Fetch zones (changed to GET with query params)
//  */
// export async function fetchZones(token, vid, username) {
//   const data = await getJson(
//     "/dashboard/dashboardFilter/getSelectedZones",
//     { vid, username },
//     token
//   );

//   const raw = data?.data?.selectedZones?.[0] || "";
//   return raw.split(",").filter(Boolean);
// }


// export async function fetchDashboard(token, zones) {
//   const urlParams = {};
//   const selectedZones = Array.isArray(zones) ? zones : [zones];
//   selectedZones.forEach((z) => {
//     if (!urlParams.selectedZone) {
//       urlParams.selectedZone = [];
//     }
//     urlParams.selectedZone.push(z);
//   });

//   return getJson("/dashboard/getSingleZoneData", urlParams, token);
// }

// /**
//  * Cached login to avoid spamming auth endpoint
//  */
// let authCache = null;
// let authPromise = null;

// export async function getAuth(key) {
//   if (authCache) return authCache;
//   if (!authPromise) {
//     authPromise = login(key)
//       .then((r) => (authCache = r))
//       .catch((e) => {
//         authPromise = null;
//         throw e;
//       });
//   }
//   return authPromise;
// }

// api.js

const API_URL = import.meta.env.VITE_API_URL;
const BASE = API_URL;

/* -----------------------------------------------------------
   🔒 GLOBAL: Abort last request before starting new one
----------------------------------------------------------- */
let lastController = null;

/**
 * Create a new AbortController & auto-cancel previous one.
 */
export function createAbortSignal() {
  if (lastController) lastController.abort();
  lastController = new AbortController();
  return lastController.signal;
}

/* -----------------------------------------------------------
   🔄 Unified JSON response handler (safe)
----------------------------------------------------------- */
async function handleResponse(res) {
  const text = await res.text();   // read once

  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const msg =
      payload?.message ||
      payload?.error ||
      text ||
      `HTTP ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return payload;
}

/* -----------------------------------------------------------
   🔧 Generic GET with abort support
----------------------------------------------------------- */
// async function getJson(path, params = {}, token, signal) {
//   const url = new URL(`${BASE}${path}`);

//   Object.keys(params).forEach((k) => {
//     const val = params[k];
//     if (Array.isArray(val)) {
//       val.forEach((v) => url.searchParams.append(k, v));
//     } else {
//       url.searchParams.append(k, val);
//     }
//   });

//   const res = await fetch(url, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     },
//     signal,
//   });

//   return handleResponse(res);
// }
async function getJson(path, params = {}, token, signal) {
  try {
    const url = new URL(`${BASE}${path}`);

    Object.keys(params).forEach((k) => {
      const val = params[k];
      if (Array.isArray(val)) {
        val.forEach((v) => url.searchParams.append(k, v));
      } else {
        url.searchParams.append(k, val);
      }
    });

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal,
    });

    return handleResponse(res);
  } catch (err) {
    if (err.name === "AbortError") throw err;

    // 🔥 CUSTOM NETWORK ERROR
    throw new Error("Server Disconnected. Contact IT.");
  }
}

/* -----------------------------------------------------------
   📨 Generic POST with JSON (cancel-safe)
----------------------------------------------------------- */
async function postJson(path, body, token, signal) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body || {}),
    signal,
  });

  return handleResponse(res);
}

/* -----------------------------------------------------------
   🔑 LOGIN (unchanged but safe)
----------------------------------------------------------- */
export async function login(key) {
  const signal = createAbortSignal();
  const data = await getJson("/auth/dashboardViewLogin", { key }, null, signal);
  return { token: data?.token?.token, user: data?.user };
}

/* -----------------------------------------------------------
   📌 Fetch Zones (NOW SAFE + ABORTABLE)
----------------------------------------------------------- */
export async function fetchZones(token, vid, username, signal) {
  const data = await getJson(
    "/dashboard/dashboardFilter/getSelectedZones",
    { vid, username },
    token,
    signal
  );

  const raw = data?.data?.selectedZones?.[0] || "";
  return raw.split(",").filter(Boolean);
}

/* -----------------------------------------------------------
   📊 Fetch Dashboard (NOW SAFE + ABORTABLE)
----------------------------------------------------------- */
export async function fetchDashboard(token, zones, signal) {
  const urlParams = {};

  const selectedZones = Array.isArray(zones) ? zones : [zones];

  urlParams.selectedZone = selectedZones; // API expects array

  return getJson("/dashboard/getSingleZoneData", urlParams, token, signal);
}

/* -----------------------------------------------------------
   🔐 Cached Login (safe)
----------------------------------------------------------- */
let authCache = null;
let authPromise = null;

export async function getAuth(key) {
  if (authCache) return authCache;

  if (!authPromise) {
    authPromise = login(key)
      .then((r) => (authCache = r))
      .catch((e) => {
        authPromise = null;
        throw e;
      });
  }

  return authPromise;
}
