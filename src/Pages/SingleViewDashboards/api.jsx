// api.js
const BASE = "http://delbi2dev.deloptanalytics.com:3000";

/**
 * Handle API responses consistently (no double-read)
 */
async function handleResponse(res) {
  const text = await res.text(); // read once

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

/**
 * Generic POST with JSON
 */
async function postJson(path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body || {}),
  });

  return handleResponse(res);
}

/**
 * Generic GET with query params
 */
async function getJson(path, params = {}, token) {
  const url = new URL(`${BASE}${path}`);
  Object.keys(params).forEach((k) =>
    url.searchParams.append(k, params[k])
  );

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return handleResponse(res);
}

/**
 * 🔑 Login with encrypted key
 */
export async function login(key) {
  const data = await getJson("/auth/dashboardViewLogin", { key });
  return { token: data?.token?.token, user: data?.user };
}

/**
 * 📌 Fetch zones
 */
export async function fetchZones(token, vid, username) {
  const data = await postJson(
    "/dashboard/dashboard1filter/getSelectedZones",
    { vid, username },
    token
  );

  const raw = data?.data?.selectedZones?.[0] || "";
  return raw.split(",").filter(Boolean);
}

/**
 * 📊 Fetch dashboard data
 */
export async function fetchDashboard(token, zone) {
  const body = { selectedZone: [zone] };
  return postJson(
    "/dashboard/dashboard3/singleViewDashboardData",
    body,
    token
  );
}

/**
 * Cached login to avoid spamming auth endpoint
 */
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
