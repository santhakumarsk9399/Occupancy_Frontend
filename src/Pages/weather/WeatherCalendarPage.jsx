import { useEffect, useState } from "react";
import WeatherIcon from "./WeatherIcon";
import SunArc from "./SunArc";
import { loadMonthForLocation, buildWeekGrid, AQI_LABELS } from "./weatherLogic";
import { parseLoadParams } from "./inputParser";
import "./WeatherCalendar.css";
import "./WeatherCalendarPage.css";
import "./WeatherCalendarGlobal.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const today = new Date();

function splitList(str) {
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function WeatherCalendarPage() {
  const [citiesInput, setCitiesInput] = useState("Kochi");
  const [cities, setCities] = useState([]);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [displayYear, setDisplayYear] = useState(today.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(today.getMonth() + 1);
  const [locations, setLocations] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [status, setStatus] = useState("idle");
  const [globalError, setGlobalError] = useState("");

  useEffect(() => {
    const params = parseLoadParams(window.location.search);
    if (!params) return;

    setMonth(params.month || today.getMonth() + 1);
    setYear(params.year || today.getFullYear());
    const locs = params.locationInput || params.latInput || "";
    if (params.locationInput) setCitiesInput(params.locationInput);

    void loadFromInputs({
      citiesInput: params.locationInput || "",
      latInput: params.latInput || "",
      lonInput: params.lonInput || "",
      month: params.month || today.getMonth() + 1,
      year: params.year || today.getFullYear(),
    });
  }, []);

  async function loadFromInputs({ citiesInput: citiesValue, latInput: latValue, lonInput: lonValue, locationInput, month: monthValue, year: yearValue }) {
    setGlobalError("");
    const cityNames = citiesValue ? splitList(citiesValue) : splitList(locationInput || "");

    if (cityNames.length > 0) {
      setStatus("loading");
      setLocations(null);
      const results = await Promise.all(
        cityNames.map(async (name) => {
          try {
            const resolved = await resolveLocation(name);
            const result = await loadMonthForLocation(resolved.lat, resolved.lon, Number(yearValue), Number(monthValue));
            return { lat: resolved.lat, lon: resolved.lon, label: name, name, ...result };
          } catch (err) {
            return { lat: null, lon: null, label: name, name, days: [], meta: {}, error: err.message || "Location failed" };
          }
        })
      );
      setLocations(results);
      setCities(cityNames.map((n, i) => ({ name: n, lat: results[i]?.lat, lon: results[i]?.lon })));
      setActiveIdx(0);
      setDisplayMonth(Number(monthValue));
      setDisplayYear(Number(yearValue));
      setStatus("done");
      return;
    }

    let lats = splitList(latValue);
    let lons = splitList(lonValue);

    if (lats.length === 0 || lons.length === 0) {
      setGlobalError("Enter a city or latitude/longitude values.");
      setStatus("error");
      return;
    }
    if (lats.length !== lons.length) {
      setGlobalError("Latitude and longitude lists must be the same length.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setLocations(null);

    try {
      const results = await Promise.all(
        lats.map(async (lat, i) => {
          const lon = lons[i];
          const result = await loadMonthForLocation(lat, lon, Number(yearValue), Number(monthValue));
          return { lat, lon, label: `${lat}, ${lon}`, ...result };
        })
      );
      setLocations(results);
      setActiveIdx(0);
      setDisplayMonth(Number(monthValue));
      setDisplayYear(Number(yearValue));
      setStatus("done");
    } catch (err) {
      setGlobalError(err.message || "Something went wrong fetching weather.");
      setStatus("error");
    }
  }

  async function handleLoad(e) {
    e.preventDefault();
    await loadFromInputs({ citiesInput, month, year });
  }

  const active = locations ? locations[activeIdx] : null;
  const weeks = active && active.days.length ? buildWeekGrid(active.days) : [];

  return (
    <div className="weather-calendar-page">
      {status === "loading" && (
        <div className="calendar-loader-overlay" aria-live="polite" role="status">
          <div className="calendar-loader" />
          <div className="calendar-loader-text">Loading calendar…</div>
        </div>
      )}
      {/* <header className="masthead">
        <div>
          <h1>Weather Calendar</h1>
          <p className="masthead-copy">
            Monthly weather forecasts with AQI, temperature trends, and sunrise/sunset for your selected cities.
          </p>
        </div>
      </header> */}

      <form className="control-panel" onSubmit={handleLoad}>
        <div className="control-field control-field-city">
          <label htmlFor="cities">Cities</label>
          <input
            id="cities"
            type="text"
            autoComplete="off"
            value={citiesInput}
            onChange={(e) => setCitiesInput(e.target.value)}
            placeholder="Chennai, Coimbatore, Mumbai"
          />
        </div>
        {locations && locations.length > 0 && (
          <div className="control-field">
            <label htmlFor="city-select">Select city</label>
            <select id="city-select" value={activeIdx} onChange={(e) => setActiveIdx(Number(e.target.value))}>
              {locations.map((loc, i) => (
                <option key={loc.label + i} value={i}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="control-field control-field-narrow">
          <label htmlFor="month">Month</label>
          <select id="month" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div className="control-field control-field-narrow">
          <label htmlFor="year">Year</label>
          <input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
        </div>
        <button type="submit" className="control-submit" disabled={status === "loading"}>
          {status === "loading" ? "Reading the sky…" : "Load calendar"}
        </button>
      </form>

      {globalError && <div className="banner banner-error">{globalError}</div>}

      {locations && locations.length > 1 && (
        <div className="location-tabs">
          {locations.map((loc, i) => (
            <button key={loc.label + i} className={`location-tab ${i === activeIdx ? "is-active" : ""}`} onClick={() => setActiveIdx(i)} type="button">
              {loc.label}
            </button>
          ))}
        </div>
      )}

      {active && active.error && <div className="banner banner-error">{active.error}</div>}

      {active && !active.error && (
        <>
          <div className="calendar-meta">
            <span>{MONTH_NAMES[displayMonth - 1]} {displayYear}</span>
            <div className="calendar-meta-right">
              <span className="calendar-meta-dim">
                {/* {active.meta.latitude?.toFixed?.(2)}, {active.meta.longitude?.toFixed?.(2)} — {active.meta.timezone} */}
              </span>
              <Legend />
            </div>
          </div>

          <div className="dow-row">
            {DOW.map((d) => (
              <div key={d} className="dow-cell">{d}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {weeks.map((week, wi) => week.map((day, di) => <DayCell key={`${wi}-${di}`} day={day} isToday={isToday(day)} />))}
          </div>
        </>
      )}

      {!locations && status !== "loading" && (
        <div className="empty-state">Enter one or more city names (comma-separated) then load the calendar.</div>
      )}
    </div>
  );
}

async function resolveLocation(locationInput) {
  const query = encodeURIComponent(String(locationInput || "").trim());
  if (!query) {
    throw new Error("Please provide a location name.");
  }

  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=en&format=json`);
  if (!response.ok) {
    throw new Error("Could not resolve the provided location.");
  }

  const data = await response.json();
  const first = data?.results?.[0];
  if (!first) {
    throw new Error(`No coordinates found for "${locationInput}".`);
  }

  return { lat: String(first.latitude), lon: String(first.longitude) };
}

function isToday(day) {
  if (!day) return false;
  const t = today;
  const todayStr = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  return day.date === todayStr;
}

function DayCell({ day, isToday }) {
  if (!day) return <div className="day-cell day-cell-blank" aria-hidden="true" />;

  return (
    <div className={`day-cell aqi-${day.aqiCat} ${isToday ? "is-today" : ""}`}>
        <div className="day-cell-top">
          <WeatherIcon category={day.weatherCategory} />
          <span className="day-number">{day.dayOfMonth}</span>
        </div>

      <div className="day-desc">{day.weatherDescription}</div>

      <div className="day-temps">
        <span className="temp-max">{fmt(day.tempMax)}°</span>
        <span className="temp-min">{fmt(day.tempMin)}°</span>
      </div>

      <SunArc sunrise={day.sunrise} sunset={day.sunset} />

      <div className="day-footer">
        <span className="day-rain" title="Chance of rain">☂ {fmt(day.rainChance)}%</span>
        <span className="day-aqi" title={AQI_LABELS[day.aqiCat]}>AQI {fmt(day.usAqi)}</span>
      </div>
    </div>
  );
}

function fmt(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return "–";
  return v;
}

function Legend() {
  const items = ["good", "moderate", "sensitive", "unhealthy", "very-unhealthy", "hazardous"];
  return (
    <div className="legend">
      <span className="legend-label">Air quality</span>
      {items.map((cat) => (
        <span key={cat} className={`legend-swatch aqi-${cat}`}>
          {AQI_LABELS[cat]}
        </span>
      ))}
    </div>
  );
}
