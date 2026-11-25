export const WEATHER_MAP = {
  0: { description: "Clear sky", category: "clear" },
  1: { description: "Mainly clear", category: "clear" },
  2: { description: "Partly cloudy", category: "cloudy" },
  3: { description: "Overcast", category: "cloudy" },
  45: { description: "Fog", category: "fog" },
  48: { description: "Depositing rime fog", category: "fog" },
  51: { description: "Light drizzle", category: "drizzle" },
  53: { description: "Moderate drizzle", category: "drizzle" },
  55: { description: "Dense drizzle", category: "drizzle" },
  56: { description: "Light freezing drizzle", category: "drizzle" },
  57: { description: "Dense freezing drizzle", category: "drizzle" },
  61: { description: "Slight rain", category: "rain" },
  63: { description: "Moderate rain", category: "rain" },
  65: { description: "Heavy rain", category: "rain" },
  66: { description: "Light freezing rain", category: "rain" },
  67: { description: "Heavy freezing rain", category: "rain" },
  71: { description: "Slight snow fall", category: "snow" },
  73: { description: "Moderate snow fall", category: "snow" },
  75: { description: "Heavy snow fall", category: "snow" },
  77: { description: "Snow grains", category: "snow" },
  80: { description: "Slight rain showers", category: "showers" },
  81: { description: "Moderate rain showers", category: "showers" },
  82: { description: "Violent rain showers", category: "showers" },
  85: { description: "Slight snow showers", category: "showers" },
  86: { description: "Heavy snow showers", category: "showers" },
  95: { description: "Thunderstorm", category: "storm" },
  96: { description: "Thunderstorm with slight hail", category: "storm" },
  99: { description: "Thunderstorm with heavy hail", category: "storm" },
};

export function decodeWeatherCode(code) {
  if (code === null || code === undefined || isNaN(code)) {
    return { code, description: "Unknown", category: "unknown" };
  }
  code = Number(code);
  const match = WEATHER_MAP[code];
  if (!match) {
    return { code, description: `Unrecognized WMO code (${code})`, category: "unknown" };
  }
  return { code, description: match.description, category: match.category };
}

export function aqiCategory(usAqi) {
  if (usAqi === null || usAqi === undefined || isNaN(usAqi)) return "unknown";
  if (usAqi <= 50) return "good";
  if (usAqi <= 100) return "moderate";
  if (usAqi <= 150) return "sensitive";
  if (usAqi <= 200) return "unhealthy";
  if (usAqi <= 300) return "very-unhealthy";
  return "hazardous";
}

export const AQI_LABELS = {
  good: "Good",
  moderate: "Moderate",
  sensitive: "Unhealthy (sensitive)",
  unhealthy: "Unhealthy",
  "very-unhealthy": "Very unhealthy",
  hazardous: "Hazardous",
  unknown: "No AQI data",
};

function averageForDate(hourlyTimes, hourlyValues, targetDate) {
  if (!hourlyTimes || !hourlyValues) return null;
  let sum = 0;
  let count = 0;
  for (let h = 0; h < hourlyTimes.length; h++) {
    if (hourlyTimes[h].indexOf(targetDate) === 0) {
      const v = hourlyValues[h];
      if (v !== null && v !== undefined && !isNaN(v)) {
        sum += v;
        count++;
      }
    }
  }
  return count > 0 ? Math.round((sum / count) * 10) / 10 : null;
}

function parseDateOnly(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export function getDayName(dateStr) {
  return DAY_NAMES[parseDateOnly(dateStr).getDay()];
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

export function monthRange(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const startDate = `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-${pad2(start.getDate())}`;
  const endDate = `${end.getFullYear()}-${pad2(end.getMonth() + 1)}-${pad2(end.getDate())}`;
  return { startDate, endDate };
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${body ? `: ${body}` : ""}`);
  }
  return res.json();
}

function isFarPast(endDate) {
  const diffDays = (Date.now() - parseDateOnly(endDate).getTime()) / 86400000;
  return diffDays > 92;
}

async function fetchWeather(lat, lon, startDate, endDate) {
  const daily = "temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,weather_code,wind_speed_10m_max";
  const base = isFarPast(endDate) ? "https://archive-api.open-meteo.com/v1/archive" : "https://api.open-meteo.com/v1/forecast";
  const url = `${base}?latitude=${lat}&longitude=${lon}&daily=${daily}&timezone=auto&start_date=${startDate}&end_date=${endDate}`;
  return fetchJSON(url);
}

function formatYYYYMMDD(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function getAqiRange(startDateStr, endDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  const forecastEnd = new Date(today);
  forecastEnd.setDate(today.getDate() + 5);

  if (endDate < today) return null;

  const effectiveStart = startDate < today ? today : startDate;
  const effectiveEnd = endDate > forecastEnd ? forecastEnd : endDate;

  if (effectiveStart > effectiveEnd) return null;
  return { startDate: formatYYYYMMDD(effectiveStart), endDate: formatYYYYMMDD(effectiveEnd) };
}

async function fetchAqi(lat, lon, startDateStr, endDateStr) {
  const hourlyVars = "european_aqi,us_aqi,pm2_5,pm10";

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const forecastEnd = new Date(today);
  forecastEnd.setDate(today.getDate() + 5);

  const requests = [];

  if (startDate <= yesterday && yesterday >= startDate) {
    const histStart = formatYYYYMMDD(startDate);
    const histEnd = formatYYYYMMDD(yesterday < endDate ? yesterday : endDate);
    if (histStart <= histEnd) {
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=${hourlyVars}&timezone=auto&start_date=${histStart}&end_date=${histEnd}`;
      requests.push(fetchJSON(url).catch(() => null));
    }
  }

  const fStart = today <= endDate ? today : null;
  if (fStart) {
    const fEndDate = endDate < forecastEnd ? endDate : forecastEnd;
    const fStartStr = formatYYYYMMDD(fStart);
    const fEndStr = formatYYYYMMDD(fEndDate);
    if (fStartStr <= fEndStr) {
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=${hourlyVars}&timezone=auto&start_date=${fStartStr}&end_date=${fEndStr}`;
      requests.push(fetchJSON(url).catch(() => null));
    }
  }

  if (requests.length === 0) return null;

  const responses = await Promise.all(requests);

  const map = new Map();
  for (const res of responses) {
    if (!res || !res.hourly || !Array.isArray(res.hourly.time)) continue;
    const times = res.hourly.time;
    for (let i = 0; i < times.length; i++) {
      const t = times[i];
      if (!map.has(t)) {
        map.set(t, {
          us_aqi: res.hourly.us_aqi?.[i] ?? null,
          european_aqi: res.hourly.european_aqi?.[i] ?? null,
          pm2_5: res.hourly.pm2_5?.[i] ?? null,
          pm10: res.hourly.pm10?.[i] ?? null,
        });
      } else {
        const cur = map.get(t);
        cur.us_aqi = cur.us_aqi ?? (res.hourly.us_aqi?.[i] ?? null);
        cur.european_aqi = cur.european_aqi ?? (res.hourly.european_aqi?.[i] ?? null);
        cur.pm2_5 = cur.pm2_5 ?? (res.hourly.pm2_5?.[i] ?? null);
        cur.pm10 = cur.pm10 ?? (res.hourly.pm10?.[i] ?? null);
      }
    }
  }

  const sortedTimes = Array.from(map.keys()).sort();
  if (sortedTimes.length === 0) return null;

  const combined = { hourly: { time: [], us_aqi: [], european_aqi: [], pm2_5: [], pm10: [] } };

  for (const t of sortedTimes) {
    const v = map.get(t);
    combined.hourly.time.push(t);
    combined.hourly.us_aqi.push(v.us_aqi ?? null);
    combined.hourly.european_aqi.push(v.european_aqi ?? null);
    combined.hourly.pm2_5.push(v.pm2_5 ?? null);
    combined.hourly.pm10.push(v.pm10 ?? null);
  }

  return combined;
}

function formatTime(iso) {
  if (!iso || !iso.includes("T")) return "";
  return iso.split("T")[1];
}

export async function loadMonthForLocation(lat, lon, year, month) {
  const { startDate, endDate } = monthRange(year, month);

  let weather;
  try {
    weather = await fetchWeather(lat, lon, startDate, endDate);
  } catch (e) {
    return { days: [], meta: { latitude: lat, longitude: lon, timezone: "" }, error: `Weather fetch failed: ${e.message}` };
  }

  if (!weather || !weather.daily || !weather.daily.time || weather.daily.time.length === 0) {
    return {
      days: [],
      meta: { latitude: weather?.latitude ?? lat, longitude: weather?.longitude ?? lon, timezone: weather?.timezone ?? "" },
      error: "No weather data available for the selected month.",
    };
  }

  let aqi = null;
  try {
    aqi = await fetchAqi(lat, lon, startDate, endDate);
  } catch {
    aqi = null;
  }

  const days = weather.daily.time.map((currentDate, i) => {
    const rawCode = weather.daily.weather_code[i];
    const decoded = decodeWeatherCode(rawCode);

    let usAqi = null;
    let europeanAqi = null;
    let pm2_5 = null;
    let pm10 = null;
    if (aqi && aqi.hourly && aqi.hourly.time) {
      usAqi = averageForDate(aqi.hourly.time, aqi.hourly.us_aqi, currentDate);
      europeanAqi = averageForDate(aqi.hourly.time, aqi.hourly.european_aqi, currentDate);
      pm2_5 = averageForDate(aqi.hourly.time, aqi.hourly.pm2_5, currentDate);
      pm10 = averageForDate(aqi.hourly.time, aqi.hourly.pm10, currentDate);
    }

    return {
      date: currentDate,
      dayOfMonth: Number(currentDate.split("-")[2]),
      dayName: getDayName(currentDate),
      tempMax: weather.daily.temperature_2m_max[i],
      tempMin: weather.daily.temperature_2m_min[i],
      tempUnit: weather.daily_units?.temperature_2m_max ?? "",
      sunrise: formatTime(weather.daily.sunrise[i]),
      sunset: formatTime(weather.daily.sunset[i]),
      rainChance: weather.daily.precipitation_probability_max[i],
      windSpeedMax: weather.daily.wind_speed_10m_max[i],
      windUnit: weather.daily_units?.wind_speed_10m_max ?? "",
      weatherCode: rawCode,
      weatherDescription: decoded.description,
      weatherCategory: decoded.category,
      usAqi,
      europeanAqi,
      pm2_5,
      pm10,
      aqiCat: aqiCategory(usAqi),
    };
  });

  return {
    days,
    meta: { latitude: weather.latitude, longitude: weather.longitude, timezone: weather.timezone },
    error: null,
  };
}

export function buildWeekGrid(days) {
  if (!days.length) return [];
  const weeks = [];
  let current = [];

  const firstDow = parseDateOnly(days[0].date).getDay();
  for (let i = 0; i < firstDow; i++) current.push(null);

  for (const day of days) {
    current.push(day);
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  }
  if (current.length) {
    while (current.length < 7) current.push(null);
    weeks.push(current);
  }
  return weeks;
}
