// // import React, { useEffect, useMemo, useState } from "react";
// // import {
// //   FiActivity,
// //   FiGlobe,
// //   FiMapPin,
// //   FiInfo,
// //   FiRefreshCw,
// //   FiBarChart2,
// //   FiCalendar,
// //   FiChevronDown,
// //   FiLoader
// // } from "react-icons/fi";
// // import {
// //   Globe2,
// //   Building2,
// //   MapPinned,
// //   CalendarCheck,
// //   CalendarClock,
// //   CalendarDays,
// //   CalendarRange,
// //   Calendar,
// //   BarChart3,
// //   RotateCcw,
// //   LoaderCircle,
// //   ArrowRight,
// // } from "lucide-react";

// // import "./HealthReportFilters.css";
// // import HealthReportResults from "./HealthReportResults";

// // // Reuse the same Axios client and session helpers as Historical Reports.
// // import api from "../../Settings_heatmap/utils/AxiosInstance";
// // import {
// //   getVid,
// //   getToken,
// // } from "../../Settings_Heatmap/components/Heatmaps/utils/sessionHelper";

// // const EMPTY_FILTER_DATA = { countries: [], cities: [], zones: [] };
// // const PERIODS = ["Today", "Yesterday", "This Week", "This Month", "This Year", "Custom"];
// // const pad = (value) => String(value).padStart(2, "0");
// // const toISO = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
// // const todayISO = () => toISO(new Date());
// // const displayDate = (value) => value ? `${value.slice(8, 10)}-${value.slice(5, 7)}-${value.slice(0, 4)}` : "";

// // const getRange = (preset) => {
// //   const now = new Date();
// //   const from = new Date(now);
// //   const to = new Date(now);
// //   if (preset === "Yesterday") {
// //     from.setDate(now.getDate() - 1);
// //     to.setDate(now.getDate() - 1);
// //   } else if (preset === "This Week") {
// //     from.setDate(now.getDate() - ((now.getDay() + 6) % 7));
// //   } else if (preset === "This Month") {
// //     from.setDate(1);
// //   } else if (preset === "This Year") {
// //     from.setMonth(0, 1);
// //   }
// //   return { fromDate: toISO(from), toDate: toISO(to) };
// // };

// // // This matches HistoricalReports.jsx response.allFilters normalization.
// // const normalizeFilterData = (allFilters = {}) => ({
// //   countries: (Array.isArray(allFilters.countries) ? allFilters.countries : []).map((country) => ({
// //     value: String(country.id),
// //     label: country.Country,
// //   })),
// //   cities: (Array.isArray(allFilters.cities) ? allFilters.cities : []).map((city) => ({
// //     value: String(city.id),
// //     label: city.City,
// //     countryId: String(city.countryId),
// //   })),
// //   zones: (Array.isArray(allFilters.zones) ? allFilters.zones : []).map((zone) => ({
// //     // Historical Reports sends zone names in ZoneName, so preserve names as values.
// //     value: String(zone.Zonename),
// //     label: String(zone.Zonename),
// //     zoneId: String(zone.id),
// //     cityId: String(zone.cityId),
// //   })),
// // });


// // function MultiSelectFilter({
// //   label,
// //   options,
// //   value,
// //   onChange,
// //   disabled = false,
// // }) {
// //   const [open, setOpen] = useState(false);
// //   const [search, setSearch] = useState("");

// //   const allSelected =
// //     options.length > 0 &&
// //     options.every((option) => value.includes(option.value));

// //   const filteredOptions = options.filter((option) =>
// //     option.label.toLowerCase().includes(search.toLowerCase())
// //   );

// //   const selectedLabels = options
// //     .filter((option) => value.includes(option.value))
// //     .map((option) => option.label);

// //   const summary =
// //     allSelected || value.length === 0
// //       ? "All Selected"
// //       : value.length === 1
// //         ? selectedLabels[0] || "Select"
// //         : `${value.length} Selected`;

// //   const toggleOption = (optionValue) => {
// //     onChange(
// //       value.includes(optionValue)
// //         ? value.filter((item) => item !== optionValue)
// //         : [...value, optionValue]
// //     );
// //   };

// //   const toggleAll = () => {
// //     const visibleValues = filteredOptions.map(
// //       (option) => option.value
// //     );

// //     const allVisibleSelected =
// //       visibleValues.length > 0 &&
// //       visibleValues.every((item) => value.includes(item));

// //     onChange(
// //       allVisibleSelected
// //         ? value.filter((item) => !visibleValues.includes(item))
// //         : [
// //           ...new Set([
// //             ...value,
// //             ...visibleValues,
// //           ]),
// //         ]
// //     );
// //   };

// //   return (
// //     <div className={`hrf-multiselect ${open ? "is-open" : ""}`}>
// //       <button
// //         type="button"
// //         className="hrf-multi-trigger"
// //         aria-label={label}
// //         aria-expanded={open}
// //         disabled={disabled}
// //         onClick={() => {
// //           setOpen((previous) => !previous);
// //           setSearch("");
// //         }}
// //       >
// //         <span>{summary}</span>
// //         <FiChevronDown className="hrf-chevron" />
// //       </button>

// //       {open && !disabled && (
// //         <>
// //           <button
// //             type="button"
// //             className="hrf-click-away"
// //             aria-label={`Close ${label}`}
// //             onClick={() => setOpen(false)}
// //           />

// //           <div className="hrf-multi-menu">
// //             {/* Search field */}
// //             <div className="hrf-search-wrapper">
// //               <input
// //                 type="text"
// //                 className="hrf-search-input"
// //                 placeholder={`Search ${label.replace("(s)", "")}...`}
// //                 value={search}
// //                 onChange={(event) =>
// //                   setSearch(event.target.value)
// //                 }
// //                 onClick={(event) => event.stopPropagation()}
// //                 aria-label={`Search ${label}`}
// //               />
// //             </div>

// //             {/* Select all */}
// //             {filteredOptions.length > 0 && (
// //               <label className="hrf-multi-option hrf-select-all">
// //                 <input
// //                   type="checkbox"
// //                   checked={
// //                     filteredOptions.length > 0 &&
// //                     filteredOptions.every((option) =>
// //                       value.includes(option.value)
// //                     )
// //                   }
// //                   onChange={toggleAll}
// //                 />
// //                 <span>All Selected</span>
// //               </label>
// //             )}

// //             {/* Filtered options */}
// //             {filteredOptions.map((option) => (
// //               <label
// //                 className="hrf-multi-option"
// //                 key={option.value}
// //               >
// //                 <input
// //                   type="checkbox"
// //                   checked={value.includes(option.value)}
// //                   onChange={() => toggleOption(option.value)}
// //                 />
// //                 <span>{option.label}</span>
// //               </label>
// //             ))}

// //             {filteredOptions.length === 0 && (
// //               <div className="hrf-no-options">
// //                 No matching options
// //               </div>
// //             )}
// //           </div>
// //         </>
// //       )}
// //     </div>
// //   );
// // }


// // export default function HealthReportFilters({ onGenerate }) {
// //   const [reportFilters, setReportFilters] = useState(null);
// //   const [filterData, setFilterData] = useState(EMPTY_FILTER_DATA);
// //   const [isLoadingFilters, setIsLoadingFilters] = useState(true);
// //   const [filterError, setFilterError] = useState("");
// //   const [isGenerating, setIsGenerating] = useState(false);
// //   const [generationError, setGenerationError] = useState("");
// //   const [reportData, setReportData] = useState(null);
// //   const [preset, setPreset] = useState("Today");
// //   const [fromDate, setFromDate] = useState(todayISO());
// //   const [toDate, setToDate] = useState(todayISO());
// //   const [startMinutes, setStartMinutes] = useState(0);
// //   const [endMinutes, setEndMinutes] = useState(1439);
// //   const [countries, setCountries] = useState([]);
// //   const [cities, setCities] = useState([]);
// //   const [zones, setZones] = useState([]);

// //   // Same filter endpoint, session params, token and allFilters response as Historical Reports.
// //   useEffect(() => {
// //     let active = true;
// //     const loadFilters = async () => {
// //       setIsLoadingFilters(true);
// //       setFilterError("");
// //       try {
// //         const username = sessionStorage.getItem("username") || sessionStorage.getItem("Username") || "Occupancy";
// //         const response = await api.get("dashboard/dashboardFilter/filters", {
// //           params: { vid: getVid(), username },
// //           headers: { Authorization: `Bearer ${getToken()}` },
// //         });
// //         const result = response?.data;
// //         if (result?.success === false) throw new Error(result?.message || "Unable to load report filters.");
// //         const normalized = normalizeFilterData(result?.allFilters);
// //         if (active) {
// //           setFilterData(normalized);
// //           setCountries(normalized.countries.map((item) => item.value));
// //           setCities(normalized.cities.map((item) => item.value));
// //           setZones(normalized.zones.map((item) => item.value));
// //         }
// //       } catch (error) {
// //         console.error("Unable to load health report filters:", error);
// //         if (active) {
// //           setFilterData(EMPTY_FILTER_DATA);
// //           setCountries([]); setCities([]); setZones([]);
// //           setFilterError(error?.response?.data?.message || error?.message || "Unable to load Country, City and Zone filters.");
// //         }
// //       } finally {
// //         if (active) setIsLoadingFilters(false);
// //       }
// //     };
// //     loadFilters();
// //     return () => { active = false; };
// //   }, []);

// //   const availableCities = useMemo(() => {
// //     if (countries.length === filterData.countries.length) return filterData.cities;
// //     return filterData.cities.filter((city) => countries.includes(city.countryId));
// //   }, [countries, filterData]);

// //   const availableZones = useMemo(() => {
// //     const visibleCityIds = availableCities.filter((city) => cities.includes(city.value)).map((city) => city.value);
// //     return filterData.zones.filter((zone) => visibleCityIds.includes(zone.cityId));
// //   }, [cities, availableCities, filterData]);

// //   const updateCountries = (values) => {
// //     setCountries(values);
// //     const nextCities = filterData.cities.filter((city) => values.includes(city.countryId)).map((city) => city.value);
// //     // If all countries are selected, include all cities even when IDs are represented differently.
// //     const resolvedCities = values.length === filterData.countries.length ? filterData.cities.map((city) => city.value) : nextCities;
// //     setCities(resolvedCities);
// //     setZones(filterData.zones.filter((zone) => resolvedCities.includes(zone.cityId)).map((zone) => zone.value));
// //   };

// //   const updateCities = (values) => {
// //     setCities(values);
// //     setZones(filterData.zones.filter((zone) => values.includes(zone.cityId)).map((zone) => zone.value));
// //   };

// //   const changePreset = (value) => {
// //     setPreset(value);
// //     if (value !== "Custom") {
// //       const range = getRange(value);
// //       setFromDate(range.fromDate);
// //       setToDate(range.toDate);
// //     }
// //   };

// //   const changeFromDate = (value) => {
// //     if (!value || value > todayISO()) return;
// //     setPreset("Custom");
// //     setFromDate(value);
// //     if (value > toDate) setToDate(value);
// //   };

// //   const changeToDate = (value) => {
// //     if (!value || value > todayISO()) return;
// //     setPreset("Custom");
// //     setToDate(value < fromDate ? fromDate : value);
// //   };

// //   const timeText = (minutes) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
// //   const startPercent = (startMinutes / 1439) * 100;
// //   const endPercent = (endMinutes / 1439) * 100;

// //   const resetFilters = () => {
// //     setPreset("Today"); setFromDate(todayISO()); setToDate(todayISO());
// //     setStartMinutes(0); setEndMinutes(1439);
// //     setCountries(filterData.countries.map((item) => item.value));
// //     setCities(filterData.cities.map((item) => item.value));
// //     setZones(filterData.zones.map((item) => item.value));
// //     setFilterError("");
// //   };

// //   const generateReport = async () => {
// //     if (isGenerating) return;
// //     if (!fromDate || !toDate || fromDate > toDate) {
// //       setGenerationError("Please select a valid reporting period.");
// //       return;
// //     }
// //     if (!zones.length) {
// //       setGenerationError("Please select at least one zone.");
// //       return;
// //     }

// //     const filters = {
// //       country: countries,
// //       city: cities,
// //       zones,
// //       countryIds: countries,
// //       cityIds: cities,
// //       zoneIds: zones,
// //       preset,
// //       fromDate,
// //       toDate,
// //       fromTime: `${timeText(startMinutes)}:00`,
// //       toTime: `${timeText(endMinutes)}:59`,
// //     };

// //     // Keep request keys consistent with the existing report API conventions.
// //     const payload = {
// //       reportType: "Daily",
// //       ZoneName: zones.join(","),
// //       FromDateTime: fromDate,
// //       ToDateTime: toDate,
// //     };

// //     setIsGenerating(true);
// //     setGenerationError("");
// //     try {
// //       const response = await api.post("healthReports/report", payload, {
// //         headers: { Authorization: `Bearer ${getToken()}` },
// //       });
// //       // Support both a direct API response and an API wrapper such as
// //       // { data: { success, chart, grid } }.
// //       const responseBody = response?.data;
// //       const result = responseBody?.data ?? responseBody;

// //       if (!result || result.success === false) {
// //         throw new Error(
// //           result?.message || "Failed to generate the health report."
// //         );
// //       }

// //       // The Health Reports API returns chart as a nested array and grid as rows.
// //       const hasGrid = Array.isArray(result.grid);
// //       const hasChart = Array.isArray(result.chart);
// //       if (!hasGrid && !hasChart) {
// //         console.error("Unexpected Health Reports API response:", responseBody);
// //         throw new Error(
// //           "The Health Reports API response did not contain a grid or chart array."
// //         );
// //       }

// //       // Save the complete response object: Results reads data.grid and data.chart.
// //       setReportData(result);
// //       setReportFilters(filters);

// //       // Do not invoke the optional parent callback here. A parent callback may
// //       // trigger another render/navigation and interfere with this component's
// //       // local filter-to-results transition.
// //     } catch (error) {
// //       console.error("Unable to generate health report:", error);
// //       setGenerationError(
// //         error?.response?.data?.message || error?.message ||
// //         "Unable to generate the health report. Please try again."
// //       );
// //     } finally {
// //       setIsGenerating(false);
// //     }
// //   };

// //   if (reportFilters !== null) {
// //     return (
// //       <HealthReportResults
// //         filters={reportFilters}
// //         data={reportData}
// //         onBack={() => { setReportFilters(null); setReportData(null); setGenerationError(""); }}
// //       />
// //     );
// //   }

// //   return (
// //     <div className="hrf-page">
// //       {/* Keep the same page header pattern as Historical Reports. */}
// //       <header className="hrf-header"><h1>Health Report</h1></header>
// //       <main className="hrf-main">
// //         <section className="hrf-card">
// //           <section className="hrf-filter-section">
// //             <div className="hrf-section-heading">
// //               <h2>Filters</h2>
// //               <p>{isLoadingFilters ? "Loading Country, City and Zone filters..." : "Select the filters for your report. You can select multiple values."}</p>
// //             </div>
// //             <div className="hrf-filter-grid">
// //               <div className="hrf-field"><label><Globe2 /><strong>Country(s)</strong></label><MultiSelectFilter label="Country(s)" options={filterData.countries} value={countries} onChange={updateCountries} disabled={isLoadingFilters} /></div>
// //               <div className="hrf-field"><label><Building2 /><strong>City(s)</strong></label><MultiSelectFilter label="City(s)" options={availableCities} value={cities.filter((id) => availableCities.some((city) => city.value === id))} onChange={updateCities} disabled={isLoadingFilters} /></div>
// //               <div className="hrf-field"><label><MapPinned /><strong>Zone(s)</strong></label><MultiSelectFilter label="Zone(s)" options={availableZones} value={zones.filter((id) => availableZones.some((zone) => zone.value === id))} onChange={setZones} disabled={isLoadingFilters} /></div>
// //             </div>
// //             {isLoadingFilters && <div className="hrf-filter-status"><LoaderCircle className="hrf-spin" /> Loading filters...</div>}
// //             {filterError && <div className="hrf-error" role="alert">{filterError} Please check your session/API connection and try refreshing.</div>}
// //           </section>
// //           {generationError && <div className="hrf-error" role="alert">{generationError}</div>}
// //           {isGenerating && <div className="hrf-filter-status" role="status">Generating health report...</div>}

// //           <section className="hrf-report-options">
// //             <h2>Report Options</h2>
// //             <div className="hrf-options-grid">
// //               <section className="hrf-period-panel">
// //                 <h3>Select Period</h3>
// //                 <div className="hrf-preset-list">
// //                   {PERIODS.map((period) => <button key={period} type="button" className={`hrf-preset ${preset === period ? "active" : ""}`} aria-pressed={preset === period} onClick={() => changePreset(period)}><Calendar /><span>{period}</span></button>)}
// //                 </div>
// //                 {preset === "Custom" && <div className="hrf-custom-date-panel">
// //                   <label className="hrf-date-field" htmlFor="hrf-from-date"><span>From Date</span><input id="hrf-from-date" type="date" value={fromDate} max={todayISO()} onChange={(event) => changeFromDate(event.target.value)} /></label>
// //                   <span className="hrf-to-label">to</span>
// //                   <label className="hrf-date-field" htmlFor="hrf-to-date"><span>To Date</span><input id="hrf-to-date" type="date" value={toDate} min={fromDate} max={todayISO()} onChange={(event) => changeToDate(event.target.value)} /></label>
// //                 </div>}
// //                 <div className="hrf-selected-period"><Calendar /><span><strong>Selected Period:</strong> {displayDate(fromDate)} to {displayDate(toDate)}</span></div>
// //               </section>

// //               <section className="hrf-time-panel">
// //                 <h3>Time Range (Hours)</h3>
// //                 <div className="hrf-time-values"><span className="hrf-time-chip"><small>From</small><strong>{timeText(startMinutes)}</strong></span><span className="hrf-time-arrow">→</span><span className="hrf-time-chip hrf-time-chip-end"><small>To</small><strong>{timeText(endMinutes)}</strong></span></div>
// //                 <div className="hrf-time-slider" aria-label="Select report time range"><div className="hrf-slider-track" /><div className="hrf-slider-selected" style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }} />
// //                   <input className="hrf-slider-input hrf-slider-start" aria-label="Start time" type="range" min="0" max={Math.max(0, endMinutes - 1)} value={startMinutes} onChange={(event) => setStartMinutes(Math.min(Number(event.target.value), endMinutes - 1))} />
// //                   <input className="hrf-slider-input hrf-slider-end" aria-label="End time" type="range" min={Math.min(1439, startMinutes + 1)} max="1439" value={endMinutes} onChange={(event) => setEndMinutes(Math.max(Number(event.target.value), startMinutes + 1))} />
// //                 </div>
// //                 <div className="hrf-time-labels"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span></div>
// //               </section>
// //             </div>
// //           </section>

// //           <div className="hrf-action-bar"><div className="hrf-info"><FiInfo /><span>Review the filters, period and report options before generating.</span></div><div className="hrf-actions">
// //             <button type="button" className="hrf-button secondary" onClick={resetFilters}><FiRefreshCw />Reset</button>
// //             <button type="button" className="hrf-button primary" onClick={generateReport} disabled={isLoadingFilters || !!filterError || isGenerating || startMinutes >= endMinutes}><FiBarChart2 />{isGenerating ? "Generating..." : "Generate Report"} <span>→</span></button>
// //           </div></div>
// //         </section>
// //       </main>
// //     </div>
// //   );
// // }
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   FiActivity,
//   FiGlobe,
//   FiMapPin,
//   FiInfo,
//   FiRefreshCw,
//   FiBarChart2,
//   FiCalendar,
//   FiChevronDown,
//   FiLoader
// } from "react-icons/fi";
// import {
//   Globe2,
//   Building2,
//   MapPinned,
//   CalendarCheck,
//   CalendarClock,
//   CalendarDays,
//   CalendarRange,
//   Calendar,
//   BarChart3,
//   RotateCcw,
//   LoaderCircle,
//   ArrowRight,
// } from "lucide-react";

// import "./HealthReportFilters.css";
// import HealthReportResults from "./HealthReportResults";

// // Reuse the same Axios client and session helpers as Historical Reports.
// import api from "../../Settings_heatmap/utils/AxiosInstance";
// import {
//   getVid,
//   getToken,
// } from "../../Settings_Heatmap/components/Heatmaps/utils/sessionHelper";

// const EMPTY_FILTER_DATA = { countries: [], cities: [], zones: [] };
// const PERIODS = ["Today", "Yesterday", "This Week", "This Month", "This Year", "Custom"];
// const pad = (value) => String(value).padStart(2, "0");
// const toISO = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
// const todayISO = () => toISO(new Date());
// const displayDate = (value) => value ? `${value.slice(8, 10)}-${value.slice(5, 7)}-${value.slice(0, 4)}` : "";

// // Custom date ranges are limited to 90 calendar days, including both endpoints.
// const getInclusiveDateRangeDays = (from, to) => {
//   if (!from || !to || from > to) return 0;
//   const fromMs = Date.parse(`${from}T00:00:00Z`);
//   const toMs = Date.parse(`${to}T00:00:00Z`);
//   return Math.floor((toMs - fromMs) / 86400000) + 1;
// };

// const getRange = (preset) => {
//   const now = new Date();
//   const from = new Date(now);
//   const to = new Date(now);
//   if (preset === "Yesterday") {
//     from.setDate(now.getDate() - 1);
//     to.setDate(now.getDate() - 1);
//   } else if (preset === "This Week") {
//     from.setDate(now.getDate() - ((now.getDay() + 6) % 7));
//   } else if (preset === "This Month") {
//     from.setDate(1);
//   } else if (preset === "This Year") {
//     from.setMonth(0, 1);
//   }
//   return { fromDate: toISO(from), toDate: toISO(to) };
// };

// // This matches HistoricalReports.jsx response.allFilters normalization.
// const normalizeFilterData = (allFilters = {}) => ({
//   countries: (Array.isArray(allFilters.countries) ? allFilters.countries : []).map((country) => ({
//     value: String(country.id),
//     label: country.Country,
//   })),
//   cities: (Array.isArray(allFilters.cities) ? allFilters.cities : []).map((city) => ({
//     value: String(city.id),
//     label: city.City,
//     countryId: String(city.countryId),
//   })),
//   zones: (Array.isArray(allFilters.zones) ? allFilters.zones : []).map((zone) => ({
//     // Historical Reports sends zone names in ZoneName, so preserve names as values.
//     value: String(zone.Zonename),
//     label: String(zone.Zonename),
//     zoneId: String(zone.id),
//     cityId: String(zone.cityId),
//   })),
// });


// function MultiSelectFilter({
//   label,
//   options,
//   value,
//   onChange,
//   disabled = false,
// }) {
//   const [open, setOpen] = useState(false);
//   const [search, setSearch] = useState("");

//   const allSelected =
//     options.length > 0 &&
//     options.every((option) => value.includes(option.value));

//   const filteredOptions = options.filter((option) =>
//     option.label.toLowerCase().includes(search.toLowerCase())
//   );

//   const selectedLabels = options
//     .filter((option) => value.includes(option.value))
//     .map((option) => option.label);

//   const summary =
//     allSelected || value.length === 0
//       ? "All Selected"
//       : value.length === 1
//         ? selectedLabels[0] || "Select"
//         : `${value.length} Selected`;

//   const toggleOption = (optionValue) => {
//     onChange(
//       value.includes(optionValue)
//         ? value.filter((item) => item !== optionValue)
//         : [...value, optionValue]
//     );
//   };

//   const toggleAll = () => {
//     const visibleValues = filteredOptions.map(
//       (option) => option.value
//     );

//     const allVisibleSelected =
//       visibleValues.length > 0 &&
//       visibleValues.every((item) => value.includes(item));

//     onChange(
//       allVisibleSelected
//         ? value.filter((item) => !visibleValues.includes(item))
//         : [
//           ...new Set([
//             ...value,
//             ...visibleValues,
//           ]),
//         ]
//     );
//   };

//   return (
//     <div className={`hrf-multiselect ${open ? "is-open" : ""}`}>
//       <button
//         type="button"
//         className="hrf-multi-trigger"
//         aria-label={label}
//         aria-expanded={open}
//         disabled={disabled}
//         onClick={() => {
//           setOpen((previous) => !previous);
//           setSearch("");
//         }}
//       >
//         <span>{summary}</span>
//         <FiChevronDown className="hrf-chevron" />
//       </button>

//       {open && !disabled && (
//         <>
//           <button
//             type="button"
//             className="hrf-click-away"
//             aria-label={`Close ${label}`}
//             onClick={() => setOpen(false)}
//           />

//           <div className="hrf-multi-menu">
//             {/* Search field */}
//             <div className="hrf-search-wrapper">
//               <input
//                 type="text"
//                 className="hrf-search-input"
//                 placeholder={`Search ${label.replace("(s)", "")}...`}
//                 value={search}
//                 onChange={(event) =>
//                   setSearch(event.target.value)
//                 }
//                 onClick={(event) => event.stopPropagation()}
//                 aria-label={`Search ${label}`}
//               />
//             </div>

//             {/* Select all */}
//             {filteredOptions.length > 0 && (
//               <label className="hrf-multi-option hrf-select-all">
//                 <input
//                   type="checkbox"
//                   checked={
//                     filteredOptions.length > 0 &&
//                     filteredOptions.every((option) =>
//                       value.includes(option.value)
//                     )
//                   }
//                   onChange={toggleAll}
//                 />
//                 <span>All Selected</span>
//               </label>
//             )}

//             {/* Filtered options */}
//             {filteredOptions.map((option) => (
//               <label
//                 className="hrf-multi-option"
//                 key={option.value}
//               >
//                 <input
//                   type="checkbox"
//                   checked={value.includes(option.value)}
//                   onChange={() => toggleOption(option.value)}
//                 />
//                 <span>{option.label}</span>
//               </label>
//             ))}

//             {filteredOptions.length === 0 && (
//               <div className="hrf-no-options">
//                 No matching options
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }


// export default function HealthReportFilters({ onGenerate }) {
//   const [reportFilters, setReportFilters] = useState(null);
//   const [filterData, setFilterData] = useState(EMPTY_FILTER_DATA);
//   const [isLoadingFilters, setIsLoadingFilters] = useState(true);
//   const [filterError, setFilterError] = useState("");
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [generationError, setGenerationError] = useState("");
//   const [reportData, setReportData] = useState(null);
//   const [preset, setPreset] = useState("Today");
//   const [fromDate, setFromDate] = useState(todayISO());
//   const [toDate, setToDate] = useState(todayISO());
//   const [startMinutes, setStartMinutes] = useState(0);
//   const [endMinutes, setEndMinutes] = useState(1439);
//   const [countries, setCountries] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [zones, setZones] = useState([]);

//   // Same filter endpoint, session params, token and allFilters response as Historical Reports.
//   useEffect(() => {
//     let active = true;
//     const loadFilters = async () => {
//       setIsLoadingFilters(true);
//       setFilterError("");
//       try {
//         const username = sessionStorage.getItem("username") || sessionStorage.getItem("Username") || "Occupancy";
//         const response = await api.get("dashboard/dashboardFilter/filters", {
//           params: { vid: getVid(), username },
//           headers: { Authorization: `Bearer ${getToken()}` },
//         });
//         const result = response?.data;
//         if (result?.success === false) throw new Error(result?.message || "Unable to load report filters.");
//         const normalized = normalizeFilterData(result?.allFilters);
//         if (active) {
//           setFilterData(normalized);
//           setCountries(normalized.countries.map((item) => item.value));
//           setCities(normalized.cities.map((item) => item.value));
//           setZones(normalized.zones.map((item) => item.value));
//         }
//       } catch (error) {
//         console.error("Unable to load health report filters:", error);
//         if (active) {
//           setFilterData(EMPTY_FILTER_DATA);
//           setCountries([]); setCities([]); setZones([]);
//           setFilterError(error?.response?.data?.message || error?.message || "Unable to load Country, City and Zone filters.");
//         }
//       } finally {
//         if (active) setIsLoadingFilters(false);
//       }
//     };
//     loadFilters();
//     return () => { active = false; };
//   }, []);

//   const availableCities = useMemo(() => {
//     if (countries.length === filterData.countries.length) return filterData.cities;
//     return filterData.cities.filter((city) => countries.includes(city.countryId));
//   }, [countries, filterData]);

//   const availableZones = useMemo(() => {
//     const visibleCityIds = availableCities.filter((city) => cities.includes(city.value)).map((city) => city.value);
//     return filterData.zones.filter((zone) => visibleCityIds.includes(zone.cityId));
//   }, [cities, availableCities, filterData]);

//   const updateCountries = (values) => {
//     setCountries(values);
//     const nextCities = filterData.cities.filter((city) => values.includes(city.countryId)).map((city) => city.value);
//     // If all countries are selected, include all cities even when IDs are represented differently.
//     const resolvedCities = values.length === filterData.countries.length ? filterData.cities.map((city) => city.value) : nextCities;
//     setCities(resolvedCities);
//     setZones(filterData.zones.filter((zone) => resolvedCities.includes(zone.cityId)).map((zone) => zone.value));
//   };

//   const updateCities = (values) => {
//     setCities(values);
//     setZones(filterData.zones.filter((zone) => values.includes(zone.cityId)).map((zone) => zone.value));
//   };

//   const changePreset = (value) => {
//     setPreset(value);
//     if (value !== "Custom") {
//       const range = getRange(value);
//       setFromDate(range.fromDate);
//       setToDate(range.toDate);
//     }
//   };

//   const changeFromDate = (value) => {
//     if (!value || value > todayISO()) return;
//     setPreset("Custom");
//     setFromDate(value);
//     if (value > toDate) setToDate(value);
//   };

//   const changeToDate = (value) => {
//     if (!value || value > todayISO()) return;
//     setPreset("Custom");
//     setToDate(value < fromDate ? fromDate : value);
//   };

//   const customRangeDays = getInclusiveDateRangeDays(fromDate, toDate);
//   const isCustomRangeTooLong = preset === "Custom" && customRangeDays > 90;

//   const timeText = (minutes) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
//   const startPercent = (startMinutes / 1439) * 100;
//   const endPercent = (endMinutes / 1439) * 100;

//   const resetFilters = () => {
//     setPreset("Today"); setFromDate(todayISO()); setToDate(todayISO());
//     setStartMinutes(0); setEndMinutes(1439);
//     setCountries(filterData.countries.map((item) => item.value));
//     setCities(filterData.cities.map((item) => item.value));
//     setZones(filterData.zones.map((item) => item.value));
//     setFilterError("");
//   };

//   const generateReport = async () => {
//     if (isGenerating) return;
//     if (!fromDate || !toDate || fromDate > toDate) {
//       setGenerationError("Please select a valid reporting period.");
//       return;
//     }
//     if (preset === "Custom" && customRangeDays > 90) {
//       setGenerationError("Custom date range cannot exceed 90 days. Please select a shorter range.");
//       return;
//     }
//     if (!zones.length) {
//       setGenerationError("Please select at least one zone.");
//       return;
//     }

//     const filters = {
//       country: countries,
//       city: cities,
//       zones,
//       countryIds: countries,
//       cityIds: cities,
//       zoneIds: zones,
//       preset,
//       fromDate,
//       toDate,
//       fromTime: `${timeText(startMinutes)}:00`,
//       toTime: `${timeText(endMinutes)}:59`,
//     };

//     // Keep request keys consistent with the existing report API conventions.
//     const payload = {
//       reportType: "Daily",
//       ZoneName: zones.join(","),
//       FromDateTime: fromDate,
//       ToDateTime: toDate,
//     };

//     setIsGenerating(true);
//     setGenerationError("");
//     try {
//       const response = await api.post("healthReports/report", payload, {
//         headers: { Authorization: `Bearer ${getToken()}` },
//       });
//       // Support both a direct API response and an API wrapper such as
//       // { data: { success, chart, grid } }.
//       const responseBody = response?.data;
//       const result = responseBody?.data ?? responseBody;

//       if (!result || result.success === false) {
//         throw new Error(
//           result?.message || "Failed to generate the health report."
//         );
//       }

//       // The Health Reports API returns chart as a nested array and grid as rows.
//       const hasGrid = Array.isArray(result.grid);
//       const hasChart = Array.isArray(result.chart);
//       if (!hasGrid && !hasChart) {
//         console.error("Unexpected Health Reports API response:", responseBody);
//         throw new Error(
//           "The Health Reports API response did not contain a grid or chart array."
//         );
//       }

//       // Save the complete response object: Results reads data.grid and data.chart.
//       setReportData(result);
//       setReportFilters(filters);

//       // Do not invoke the optional parent callback here. A parent callback may
//       // trigger another render/navigation and interfere with this component's
//       // local filter-to-results transition.
//     } catch (error) {
//       console.error("Unable to generate health report:", error);
//       setGenerationError(
//         error?.response?.data?.message || error?.message ||
//         "Unable to generate the health report. Please try again."
//       );
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   if (reportFilters !== null) {
//     return (
//       <HealthReportResults
//         filters={reportFilters}
//         data={reportData}
//         onBack={() => { setReportFilters(null); setReportData(null); setGenerationError(""); }}
//       />
//     );
//   }

//   return (
//     <div className="hrf-page">
//       {/* Keep the same page header pattern as Historical Reports. */}
//       <header className="hrf-header"><h1>Health Report</h1></header>
//       <main className="hrf-main">
//         <section className="hrf-card">
//           <section className="hrf-filter-section">
//             <div className="hrf-section-heading">
//               <h2>Filters</h2>
//               <p>{isLoadingFilters ? "Loading Country, City and Zone filters..." : "Select the filters for your report. You can select multiple values."}</p>
//             </div>
//             <div className="hrf-filter-grid">
//               <div className="hrf-field"><label><Globe2 /><strong>Country(s)</strong></label><MultiSelectFilter label="Country(s)" options={filterData.countries} value={countries} onChange={updateCountries} disabled={isLoadingFilters} /></div>
//               <div className="hrf-field"><label><Building2 /><strong>City(s)</strong></label><MultiSelectFilter label="City(s)" options={availableCities} value={cities.filter((id) => availableCities.some((city) => city.value === id))} onChange={updateCities} disabled={isLoadingFilters} /></div>
//               <div className="hrf-field"><label><MapPinned /><strong>Zone(s)</strong></label><MultiSelectFilter label="Zone(s)" options={availableZones} value={zones.filter((id) => availableZones.some((zone) => zone.value === id))} onChange={setZones} disabled={isLoadingFilters} /></div>
//             </div>
//             {isLoadingFilters && <div className="hrf-filter-status"><LoaderCircle className="hrf-spin" /> Loading filters...</div>}
//             {filterError && <div className="hrf-error" role="alert">{filterError} Please check your session/API connection and try refreshing.</div>}
//           </section>
//           {generationError && <div className="hrf-error" role="alert">{generationError}</div>}
//           {isGenerating && <div className="hrf-filter-status" role="status">Generating health report...</div>}

//           <section className="hrf-report-options">
//             <h2>Report Options</h2>
//             <div className="hrf-options-grid">
//               <section className="hrf-period-panel">
//                 <h3>Select Period</h3>
//                 <div className="hrf-preset-list">
//                   {PERIODS.map((period) => <button key={period} type="button" className={`hrf-preset ${preset === period ? "active" : ""}`} aria-pressed={preset === period} onClick={() => changePreset(period)}><Calendar /><span>{period}</span></button>)}
//                 </div>
//                 {preset === "Custom" && <div className="hrf-custom-date-panel">
//                   <label className="hrf-date-field" htmlFor="hrf-from-date"><span>From Date</span><input id="hrf-from-date" type="date" value={fromDate} max={todayISO()} onChange={(event) => changeFromDate(event.target.value)} /></label>
//                   <span className="hrf-to-label">to</span>
//                   <label className="hrf-date-field" htmlFor="hrf-to-date"><span>To Date</span><input id="hrf-to-date" type="date" value={toDate} min={fromDate} max={todayISO()} onChange={(event) => changeToDate(event.target.value)} /></label>
//                   <div
//                     role={isCustomRangeTooLong ? "alert" : "note"}
//                     style={{
//                       gridColumn: "1 / -1",
//                       marginTop: "2px",
//                       fontSize: "13px",
//                       color: isCustomRangeTooLong ? "#dc2626" : "#64748b",
//                     }}
//                   >
//                     {isCustomRangeTooLong
//                       ? `Selected range is ${customRangeDays} days. Maximum allowed is 90 days. Please select a shorter range.`
//                       : "Note: Custom date range must be 90 days or fewer."}
//                   </div>
//                 </div>}
//                 <div className="hrf-selected-period"><Calendar /><span><strong>Selected Period:</strong> {displayDate(fromDate)} to {displayDate(toDate)}</span></div>
//               </section>

//               <section className="hrf-time-panel">
//                 <h3>Time Range (Hours)</h3>
//                 <div className="hrf-time-values"><span className="hrf-time-chip"><small>From</small><strong>{timeText(startMinutes)}</strong></span><span className="hrf-time-arrow">→</span><span className="hrf-time-chip hrf-time-chip-end"><small>To</small><strong>{timeText(endMinutes)}</strong></span></div>
//                 <div className="hrf-time-slider" aria-label="Select report time range"><div className="hrf-slider-track" /><div className="hrf-slider-selected" style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }} />
//                   <input className="hrf-slider-input hrf-slider-start" aria-label="Start time" type="range" min="0" max={Math.max(0, endMinutes - 1)} value={startMinutes} onChange={(event) => setStartMinutes(Math.min(Number(event.target.value), endMinutes - 1))} />
//                   <input className="hrf-slider-input hrf-slider-end" aria-label="End time" type="range" min={Math.min(1439, startMinutes + 1)} max="1439" value={endMinutes} onChange={(event) => setEndMinutes(Math.max(Number(event.target.value), startMinutes + 1))} />
//                 </div>
//                 <div className="hrf-time-labels"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span></div>
//               </section>
//             </div>
//           </section>

//           <div className="hrf-action-bar"><div className="hrf-info"><FiInfo /><span>Review the filters, period and report options before generating.</span></div><div className="hrf-actions">
//             <button type="button" className="hrf-button secondary" onClick={resetFilters}><FiRefreshCw />Reset</button>
//             <button type="button" className="hrf-button primary" onClick={generateReport} disabled={isLoadingFilters || !!filterError || isGenerating || startMinutes >= endMinutes || isCustomRangeTooLong}><FiBarChart2 />{isGenerating ? "Generating..." : "Generate Report"} <span>→</span></button>
//           </div></div>
//         </section>
//       </main>
//     </div>
//   );
// }

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   FiActivity,
//   FiGlobe,
//   FiMapPin,
//   FiInfo,
//   FiRefreshCw,
//   FiBarChart2,
//   FiCalendar,
//   FiChevronDown,
//   FiLoader
// } from "react-icons/fi";
// import {
//   Globe2,
//   Building2,
//   MapPinned,
//   CalendarCheck,
//   CalendarClock,
//   CalendarDays,
//   CalendarRange,
//   Calendar,
//   BarChart3,
//   RotateCcw,
//   LoaderCircle,
//   ArrowRight,
// } from "lucide-react";

// import "./HealthReportFilters.css";
// import HealthReportResults from "./HealthReportResults";

// // Reuse the same Axios client and session helpers as Historical Reports.
// import api from "../../Settings_heatmap/utils/AxiosInstance";
// import {
//   getVid,
//   getToken,
// } from "../../Settings_Heatmap/components/Heatmaps/utils/sessionHelper";

const customDateRangeStyles = `
  .hrf-custom-date-panel {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: end;
    gap: 12px;
  }
  .hrf-custom-date-note-row {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 16px;
    margin-top: 2px;
    font-size: 13px;
    line-height: 1.5;
  }
  .hrf-custom-date-note { color: #64748b; }
  .hrf-custom-date-note-error,
  .hrf-selected-days-error { color: #dc2626; }
  .hrf-selected-days {
    color: #2563eb;
    font-weight: 600;
    white-space: nowrap;
  }
  .hrf-custom-date-panel-invalid { border-color: #fecaca; }
  @media (max-width: 640px) {
    .hrf-custom-date-panel { grid-template-columns: minmax(0, 1fr); gap: 10px; }
    .hrf-to-label { display: none; }
    .hrf-custom-date-note-row { align-items: flex-start; flex-direction: column; }
  }
`;

// const EMPTY_FILTER_DATA = { countries: [], cities: [], zones: [] };
// const PERIODS = ["Today", "Yesterday", "This Week", "This Month", "This Year", "Custom"];
// const pad = (value) => String(value).padStart(2, "0");
// const toISO = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
// const todayISO = () => toISO(new Date());
// const displayDate = (value) => value ? `${value.slice(8, 10)}-${value.slice(5, 7)}-${value.slice(0, 4)}` : "";

// const getRange = (preset) => {
//   const now = new Date();
//   const from = new Date(now);
//   const to = new Date(now);
//   if (preset === "Yesterday") {
//     from.setDate(now.getDate() - 1);
//     to.setDate(now.getDate() - 1);
//   } else if (preset === "This Week") {
//     from.setDate(now.getDate() - ((now.getDay() + 6) % 7));
//   } else if (preset === "This Month") {
//     from.setDate(1);
//   } else if (preset === "This Year") {
//     from.setMonth(0, 1);
//   }
//   return { fromDate: toISO(from), toDate: toISO(to) };
// };

// // This matches HistoricalReports.jsx response.allFilters normalization.
// const normalizeFilterData = (allFilters = {}) => ({
//   countries: (Array.isArray(allFilters.countries) ? allFilters.countries : []).map((country) => ({
//     value: String(country.id),
//     label: country.Country,
//   })),
//   cities: (Array.isArray(allFilters.cities) ? allFilters.cities : []).map((city) => ({
//     value: String(city.id),
//     label: city.City,
//     countryId: String(city.countryId),
//   })),
//   zones: (Array.isArray(allFilters.zones) ? allFilters.zones : []).map((zone) => ({
//     // Historical Reports sends zone names in ZoneName, so preserve names as values.
//     value: String(zone.Zonename),
//     label: String(zone.Zonename),
//     zoneId: String(zone.id),
//     cityId: String(zone.cityId),
//   })),
// });


// function MultiSelectFilter({
//   label,
//   options,
//   value,
//   onChange,
//   disabled = false,
// }) {
//   const [open, setOpen] = useState(false);
//   const [search, setSearch] = useState("");

//   const allSelected =
//     options.length > 0 &&
//     options.every((option) => value.includes(option.value));

//   const filteredOptions = options.filter((option) =>
//     option.label.toLowerCase().includes(search.toLowerCase())
//   );

//   const selectedLabels = options
//     .filter((option) => value.includes(option.value))
//     .map((option) => option.label);

//   const summary =
//     allSelected || value.length === 0
//       ? "All Selected"
//       : value.length === 1
//         ? selectedLabels[0] || "Select"
//         : `${value.length} Selected`;

//   const toggleOption = (optionValue) => {
//     onChange(
//       value.includes(optionValue)
//         ? value.filter((item) => item !== optionValue)
//         : [...value, optionValue]
//     );
//   };

//   const toggleAll = () => {
//     const visibleValues = filteredOptions.map(
//       (option) => option.value
//     );

//     const allVisibleSelected =
//       visibleValues.length > 0 &&
//       visibleValues.every((item) => value.includes(item));

//     onChange(
//       allVisibleSelected
//         ? value.filter((item) => !visibleValues.includes(item))
//         : [
//           ...new Set([
//             ...value,
//             ...visibleValues,
//           ]),
//         ]
//     );
//   };

//   return (
//     <div className={`hrf-multiselect ${open ? "is-open" : ""}`}>
//       <button
//         type="button"
//         className="hrf-multi-trigger"
//         aria-label={label}
//         aria-expanded={open}
//         disabled={disabled}
//         onClick={() => {
//           setOpen((previous) => !previous);
//           setSearch("");
//         }}
//       >
//         <span>{summary}</span>
//         <FiChevronDown className="hrf-chevron" />
//       </button>

//       {open && !disabled && (
//         <>
//           <button
//             type="button"
//             className="hrf-click-away"
//             aria-label={`Close ${label}`}
//             onClick={() => setOpen(false)}
//           />

//           <div className="hrf-multi-menu">
//             {/* Search field */}
//             <div className="hrf-search-wrapper">
//               <input
//                 type="text"
//                 className="hrf-search-input"
//                 placeholder={`Search ${label.replace("(s)", "")}...`}
//                 value={search}
//                 onChange={(event) =>
//                   setSearch(event.target.value)
//                 }
//                 onClick={(event) => event.stopPropagation()}
//                 aria-label={`Search ${label}`}
//               />
//             </div>

//             {/* Select all */}
//             {filteredOptions.length > 0 && (
//               <label className="hrf-multi-option hrf-select-all">
//                 <input
//                   type="checkbox"
//                   checked={
//                     filteredOptions.length > 0 &&
//                     filteredOptions.every((option) =>
//                       value.includes(option.value)
//                     )
//                   }
//                   onChange={toggleAll}
//                 />
//                 <span>All Selected</span>
//               </label>
//             )}

//             {/* Filtered options */}
//             {filteredOptions.map((option) => (
//               <label
//                 className="hrf-multi-option"
//                 key={option.value}
//               >
//                 <input
//                   type="checkbox"
//                   checked={value.includes(option.value)}
//                   onChange={() => toggleOption(option.value)}
//                 />
//                 <span>{option.label}</span>
//               </label>
//             ))}

//             {filteredOptions.length === 0 && (
//               <div className="hrf-no-options">
//                 No matching options
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }


// export default function HealthReportFilters({ onGenerate }) {
//   const [reportFilters, setReportFilters] = useState(null);
//   const [filterData, setFilterData] = useState(EMPTY_FILTER_DATA);
//   const [isLoadingFilters, setIsLoadingFilters] = useState(true);
//   const [filterError, setFilterError] = useState("");
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [generationError, setGenerationError] = useState("");
//   const [reportData, setReportData] = useState(null);
//   const [preset, setPreset] = useState("Today");
//   const [fromDate, setFromDate] = useState(todayISO());
//   const [toDate, setToDate] = useState(todayISO());
//   const [startMinutes, setStartMinutes] = useState(0);
//   const [endMinutes, setEndMinutes] = useState(1439);
//   const [countries, setCountries] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [zones, setZones] = useState([]);

//   // Same filter endpoint, session params, token and allFilters response as Historical Reports.
//   useEffect(() => {
//     let active = true;
//     const loadFilters = async () => {
//       setIsLoadingFilters(true);
//       setFilterError("");
//       try {
//         const username = sessionStorage.getItem("username") || sessionStorage.getItem("Username") || "Occupancy";
//         const response = await api.get("dashboard/dashboardFilter/filters", {
//           params: { vid: getVid(), username },
//           headers: { Authorization: `Bearer ${getToken()}` },
//         });
//         const result = response?.data;
//         if (result?.success === false) throw new Error(result?.message || "Unable to load report filters.");
//         const normalized = normalizeFilterData(result?.allFilters);
//         if (active) {
//           setFilterData(normalized);
//           setCountries(normalized.countries.map((item) => item.value));
//           setCities(normalized.cities.map((item) => item.value));
//           setZones(normalized.zones.map((item) => item.value));
//         }
//       } catch (error) {
//         console.error("Unable to load health report filters:", error);
//         if (active) {
//           setFilterData(EMPTY_FILTER_DATA);
//           setCountries([]); setCities([]); setZones([]);
//           setFilterError(error?.response?.data?.message || error?.message || "Unable to load Country, City and Zone filters.");
//         }
//       } finally {
//         if (active) setIsLoadingFilters(false);
//       }
//     };
//     loadFilters();
//     return () => { active = false; };
//   }, []);

//   const availableCities = useMemo(() => {
//     if (countries.length === filterData.countries.length) return filterData.cities;
//     return filterData.cities.filter((city) => countries.includes(city.countryId));
//   }, [countries, filterData]);

//   const availableZones = useMemo(() => {
//     const visibleCityIds = availableCities.filter((city) => cities.includes(city.value)).map((city) => city.value);
//     return filterData.zones.filter((zone) => visibleCityIds.includes(zone.cityId));
//   }, [cities, availableCities, filterData]);

//   const updateCountries = (values) => {
//     setCountries(values);
//     const nextCities = filterData.cities.filter((city) => values.includes(city.countryId)).map((city) => city.value);
//     // If all countries are selected, include all cities even when IDs are represented differently.
//     const resolvedCities = values.length === filterData.countries.length ? filterData.cities.map((city) => city.value) : nextCities;
//     setCities(resolvedCities);
//     setZones(filterData.zones.filter((zone) => resolvedCities.includes(zone.cityId)).map((zone) => zone.value));
//   };

//   const updateCities = (values) => {
//     setCities(values);
//     setZones(filterData.zones.filter((zone) => values.includes(zone.cityId)).map((zone) => zone.value));
//   };

//   const changePreset = (value) => {
//     setPreset(value);
//     if (value !== "Custom") {
//       const range = getRange(value);
//       setFromDate(range.fromDate);
//       setToDate(range.toDate);
//     }
//   };

//   const changeFromDate = (value) => {
//     if (!value || value > todayISO()) return;
//     setPreset("Custom");
//     setFromDate(value);
//     if (value > toDate) setToDate(value);
//   };

//   const changeToDate = (value) => {
//     if (!value || value > todayISO()) return;
//     setPreset("Custom");
//     setToDate(value < fromDate ? fromDate : value);
//   };

//   const timeText = (minutes) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
//   const startPercent = (startMinutes / 1439) * 100;
//   const endPercent = (endMinutes / 1439) * 100;

//   const resetFilters = () => {
//     setPreset("Today"); setFromDate(todayISO()); setToDate(todayISO());
//     setStartMinutes(0); setEndMinutes(1439);
//     setCountries(filterData.countries.map((item) => item.value));
//     setCities(filterData.cities.map((item) => item.value));
//     setZones(filterData.zones.map((item) => item.value));
//     setFilterError("");
//   };

//   const generateReport = async () => {
//     if (isGenerating) return;
//     if (!fromDate || !toDate || fromDate > toDate) {
//       setGenerationError("Please select a valid reporting period.");
//       return;
//     }
//     if (!zones.length) {
//       setGenerationError("Please select at least one zone.");
//       return;
//     }

//     const filters = {
//       country: countries,
//       city: cities,
//       zones,
//       countryIds: countries,
//       cityIds: cities,
//       zoneIds: zones,
//       preset,
//       fromDate,
//       toDate,
//       fromTime: `${timeText(startMinutes)}:00`,
//       toTime: `${timeText(endMinutes)}:59`,
//     };

//     // Keep request keys consistent with the existing report API conventions.
//     const payload = {
//       reportType: "Daily",
//       ZoneName: zones.join(","),
//       FromDateTime: fromDate,
//       ToDateTime: toDate,
//     };

//     setIsGenerating(true);
//     setGenerationError("");
//     try {
//       const response = await api.post("healthReports/report", payload, {
//         headers: { Authorization: `Bearer ${getToken()}` },
//       });
//       // Support both a direct API response and an API wrapper such as
//       // { data: { success, chart, grid } }.
//       const responseBody = response?.data;
//       const result = responseBody?.data ?? responseBody;

//       if (!result || result.success === false) {
//         throw new Error(
//           result?.message || "Failed to generate the health report."
//         );
//       }

//       // The Health Reports API returns chart as a nested array and grid as rows.
//       const hasGrid = Array.isArray(result.grid);
//       const hasChart = Array.isArray(result.chart);
//       if (!hasGrid && !hasChart) {
//         console.error("Unexpected Health Reports API response:", responseBody);
//         throw new Error(
//           "The Health Reports API response did not contain a grid or chart array."
//         );
//       }

//       // Save the complete response object: Results reads data.grid and data.chart.
//       setReportData(result);
//       setReportFilters(filters);

//       // Do not invoke the optional parent callback here. A parent callback may
//       // trigger another render/navigation and interfere with this component's
//       // local filter-to-results transition.
//     } catch (error) {
//       console.error("Unable to generate health report:", error);
//       setGenerationError(
//         error?.response?.data?.message || error?.message ||
//         "Unable to generate the health report. Please try again."
//       );
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   if (reportFilters !== null) {
//     return (
//       <HealthReportResults
//         filters={reportFilters}
//         data={reportData}
//         onBack={() => { setReportFilters(null); setReportData(null); setGenerationError(""); }}
//       />
//     );
//   }

//   return (
//     <div className="hrf-page">
//       {/* Keep the same page header pattern as Historical Reports. */}
//       <header className="hrf-header"><h1>Health Report</h1></header>
//       <main className="hrf-main">
//         <section className="hrf-card">
//           <section className="hrf-filter-section">
//             <div className="hrf-section-heading">
//               <h2>Filters</h2>
//               <p>{isLoadingFilters ? "Loading Country, City and Zone filters..." : "Select the filters for your report. You can select multiple values."}</p>
//             </div>
//             <div className="hrf-filter-grid">
//               <div className="hrf-field"><label><Globe2 /><strong>Country(s)</strong></label><MultiSelectFilter label="Country(s)" options={filterData.countries} value={countries} onChange={updateCountries} disabled={isLoadingFilters} /></div>
//               <div className="hrf-field"><label><Building2 /><strong>City(s)</strong></label><MultiSelectFilter label="City(s)" options={availableCities} value={cities.filter((id) => availableCities.some((city) => city.value === id))} onChange={updateCities} disabled={isLoadingFilters} /></div>
//               <div className="hrf-field"><label><MapPinned /><strong>Zone(s)</strong></label><MultiSelectFilter label="Zone(s)" options={availableZones} value={zones.filter((id) => availableZones.some((zone) => zone.value === id))} onChange={setZones} disabled={isLoadingFilters} /></div>
//             </div>
//             {isLoadingFilters && <div className="hrf-filter-status"><LoaderCircle className="hrf-spin" /> Loading filters...</div>}
//             {filterError && <div className="hrf-error" role="alert">{filterError} Please check your session/API connection and try refreshing.</div>}
//           </section>
//           {generationError && <div className="hrf-error" role="alert">{generationError}</div>}
//           {isGenerating && <div className="hrf-filter-status" role="status">Generating health report...</div>}

//           <section className="hrf-report-options">
//             <h2>Report Options</h2>
//             <div className="hrf-options-grid">
//               <section className="hrf-period-panel">
//                 <h3>Select Period</h3>
//                 <div className="hrf-preset-list">
//                   {PERIODS.map((period) => <button key={period} type="button" className={`hrf-preset ${preset === period ? "active" : ""}`} aria-pressed={preset === period} onClick={() => changePreset(period)}><Calendar /><span>{period}</span></button>)}
//                 </div>
//                 {preset === "Custom" && <div className="hrf-custom-date-panel">
//                   <label className="hrf-date-field" htmlFor="hrf-from-date"><span>From Date</span><input id="hrf-from-date" type="date" value={fromDate} max={todayISO()} onChange={(event) => changeFromDate(event.target.value)} /></label>
//                   <span className="hrf-to-label">to</span>
//                   <label className="hrf-date-field" htmlFor="hrf-to-date"><span>To Date</span><input id="hrf-to-date" type="date" value={toDate} min={fromDate} max={todayISO()} onChange={(event) => changeToDate(event.target.value)} /></label>
//                 </div>}
//                 <div className="hrf-selected-period"><Calendar /><span><strong>Selected Period:</strong> {displayDate(fromDate)} to {displayDate(toDate)}</span></div>
//               </section>

//               <section className="hrf-time-panel">
//                 <h3>Time Range (Hours)</h3>
//                 <div className="hrf-time-values"><span className="hrf-time-chip"><small>From</small><strong>{timeText(startMinutes)}</strong></span><span className="hrf-time-arrow">→</span><span className="hrf-time-chip hrf-time-chip-end"><small>To</small><strong>{timeText(endMinutes)}</strong></span></div>
//                 <div className="hrf-time-slider" aria-label="Select report time range"><div className="hrf-slider-track" /><div className="hrf-slider-selected" style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }} />
//                   <input className="hrf-slider-input hrf-slider-start" aria-label="Start time" type="range" min="0" max={Math.max(0, endMinutes - 1)} value={startMinutes} onChange={(event) => setStartMinutes(Math.min(Number(event.target.value), endMinutes - 1))} />
//                   <input className="hrf-slider-input hrf-slider-end" aria-label="End time" type="range" min={Math.min(1439, startMinutes + 1)} max="1439" value={endMinutes} onChange={(event) => setEndMinutes(Math.max(Number(event.target.value), startMinutes + 1))} />
//                 </div>
//                 <div className="hrf-time-labels"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span></div>
//               </section>
//             </div>
//           </section>

//           <div className="hrf-action-bar"><div className="hrf-info"><FiInfo /><span>Review the filters, period and report options before generating.</span></div><div className="hrf-actions">
//             <button type="button" className="hrf-button secondary" onClick={resetFilters}><FiRefreshCw />Reset</button>
//             <button type="button" className="hrf-button primary" onClick={generateReport} disabled={isLoadingFilters || !!filterError || isGenerating || startMinutes >= endMinutes}><FiBarChart2 />{isGenerating ? "Generating..." : "Generate Report"} <span>→</span></button>
//           </div></div>
//         </section>
//       </main>
//     </div>
//   );
// }
import React, { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiGlobe,
  FiMapPin,
  FiInfo,
  FiRefreshCw,
  FiBarChart2,
  FiCalendar,
  FiChevronDown,
  FiLoader
} from "react-icons/fi";
import {
  Globe2,
  Building2,
  MapPinned,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Calendar,
  BarChart3,
  RotateCcw,
  LoaderCircle,
  ArrowRight,
} from "lucide-react";

import "./HealthReportFilters.css";




import HealthReportResults from "./HealthReportResults";

// Reuse the same Axios client and session helpers as Historical Reports.
import api from "../../Settings_heatmap/utils/AxiosInstance";
import {
  getVid,
  getToken,
} from "../../Settings_Heatmap/components/Heatmaps/utils/sessionHelper";

const EMPTY_FILTER_DATA = { countries: [], cities: [], zones: [] };
const PERIODS = ["Today", "Yesterday", "This Week", "This Month", "This Year", "Custom"];
const pad = (value) => String(value).padStart(2, "0");
const toISO = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const todayISO = () => toISO(new Date());
const displayDate = (value) => value ? `${value.slice(8, 10)}-${value.slice(5, 7)}-${value.slice(0, 4)}` : "";

// Custom date ranges are limited to 90 calendar days, including both endpoints.
const getInclusiveDateRangeDays = (from, to) => {
  if (!from || !to || from > to) return 0;
  const fromMs = Date.parse(`${from}T00:00:00Z`);
  const toMs = Date.parse(`${to}T00:00:00Z`);
  return Math.floor((toMs - fromMs) / 86400000) + 1;
};

const getRange = (preset) => {
  const now = new Date();
  const from = new Date(now);
  const to = new Date(now);
  if (preset === "Yesterday") {
    from.setDate(now.getDate() - 1);
    to.setDate(now.getDate() - 1);
  } else if (preset === "This Week") {
    from.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  } else if (preset === "This Month") {
    from.setDate(1);
  } else if (preset === "This Year") {
    from.setMonth(0, 1);
  }
  return { fromDate: toISO(from), toDate: toISO(to) };
};

// This matches HistoricalReports.jsx response.allFilters normalization.
const normalizeFilterData = (allFilters = {}) => ({
  countries: (Array.isArray(allFilters.countries) ? allFilters.countries : []).map((country) => ({
    value: String(country.id),
    label: country.Country,
  })),
  cities: (Array.isArray(allFilters.cities) ? allFilters.cities : []).map((city) => ({
    value: String(city.id),
    label: city.City,
    countryId: String(city.countryId),
  })),
  zones: (Array.isArray(allFilters.zones) ? allFilters.zones : []).map((zone) => ({
    // Historical Reports sends zone names in ZoneName, so preserve names as values.
    value: String(zone.Zonename),
    label: String(zone.Zonename),
    zoneId: String(zone.id),
    cityId: String(zone.cityId),
  })),
});


function MultiSelectFilter({
  label,
  options,
  value,
  onChange,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const allSelected =
    options.length > 0 &&
    options.every((option) => value.includes(option.value));

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);

  const summary =
    allSelected || value.length === 0
      ? "All Selected"
      : value.length === 1
        ? selectedLabels[0] || "Select"
        : `${value.length} Selected`;

  const toggleOption = (optionValue) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue]
    );
  };

  const toggleAll = () => {
    const visibleValues = filteredOptions.map(
      (option) => option.value
    );

    const allVisibleSelected =
      visibleValues.length > 0 &&
      visibleValues.every((item) => value.includes(item));

    onChange(
      allVisibleSelected
        ? value.filter((item) => !visibleValues.includes(item))
        : [
          ...new Set([
            ...value,
            ...visibleValues,
          ]),
        ]
    );
  };

  return (
    <div className={`hrf-multiselect ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="hrf-multi-trigger"
        aria-label={label}
        aria-expanded={open}
        disabled={disabled}
        onClick={() => {
          setOpen((previous) => !previous);
          setSearch("");
        }}
      >
        <span>{summary}</span>
        <FiChevronDown className="hrf-chevron" />
      </button>

      {open && !disabled && (
        <>
          <button
            type="button"
            className="hrf-click-away"
            aria-label={`Close ${label}`}
            onClick={() => setOpen(false)}
          />

          <div className="hrf-multi-menu">
            {/* Search field */}
            <div className="hrf-search-wrapper">
              <input
                type="text"
                className="hrf-search-input"
                placeholder={`Search ${label.replace("(s)", "")}...`}
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                onClick={(event) => event.stopPropagation()}
                aria-label={`Search ${label}`}
              />
            </div>

            {/* Select all */}
            {filteredOptions.length > 0 && (
              <label className="hrf-multi-option hrf-select-all">
                <input
                  type="checkbox"
                  checked={
                    filteredOptions.length > 0 &&
                    filteredOptions.every((option) =>
                      value.includes(option.value)
                    )
                  }
                  onChange={toggleAll}
                />
                <span>All Selected</span>
              </label>
            )}

            {/* Filtered options */}
            {filteredOptions.map((option) => (
              <label
                className="hrf-multi-option"
                key={option.value}
              >
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}

            {filteredOptions.length === 0 && (
              <div className="hrf-no-options">
                No matching options
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}


export default function HealthReportFilters({ onGenerate }) {
  const [reportFilters, setReportFilters] = useState(null);
  const [filterData, setFilterData] = useState(EMPTY_FILTER_DATA);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [filterError, setFilterError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [reportData, setReportData] = useState(null);
  const [preset, setPreset] = useState("Today");
  const [fromDate, setFromDate] = useState(todayISO());
  const [toDate, setToDate] = useState(todayISO());
  const [startMinutes, setStartMinutes] = useState(0);
  const [endMinutes, setEndMinutes] = useState(1439);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [zones, setZones] = useState([]);

  // Same filter endpoint, session params, token and allFilters response as Historical Reports.
  useEffect(() => {
    let active = true;
    const loadFilters = async () => {
      setIsLoadingFilters(true);
      setFilterError("");
      try {
        const username = sessionStorage.getItem("username") || sessionStorage.getItem("Username") || "Occupancy";
        const response = await api.get("dashboard/dashboardFilter/filters", {
          params: { vid: getVid(), username },
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const result = response?.data;
        if (result?.success === false) throw new Error(result?.message || "Unable to load report filters.");
        const normalized = normalizeFilterData(result?.allFilters);
        if (active) {
          setFilterData(normalized);
          setCountries(normalized.countries.map((item) => item.value));
          setCities(normalized.cities.map((item) => item.value));
          setZones(normalized.zones.map((item) => item.value));
        }
      } catch (error) {
        console.error("Unable to load health report filters:", error);
        if (active) {
          setFilterData(EMPTY_FILTER_DATA);
          setCountries([]); setCities([]); setZones([]);
          setFilterError(error?.response?.data?.message || error?.message || "Unable to load Country, City and Zone filters.");
        }
      } finally {
        if (active) setIsLoadingFilters(false);
      }
    };
    loadFilters();
    return () => { active = false; };
  }, []);

  const availableCities = useMemo(() => {
    if (countries.length === filterData.countries.length) return filterData.cities;
    return filterData.cities.filter((city) => countries.includes(city.countryId));
  }, [countries, filterData]);

  const availableZones = useMemo(() => {
    const visibleCityIds = availableCities.filter((city) => cities.includes(city.value)).map((city) => city.value);
    return filterData.zones.filter((zone) => visibleCityIds.includes(zone.cityId));
  }, [cities, availableCities, filterData]);

  const updateCountries = (values) => {
    setCountries(values);
    const nextCities = filterData.cities.filter((city) => values.includes(city.countryId)).map((city) => city.value);
    // If all countries are selected, include all cities even when IDs are represented differently.
    const resolvedCities = values.length === filterData.countries.length ? filterData.cities.map((city) => city.value) : nextCities;
    setCities(resolvedCities);
    setZones(filterData.zones.filter((zone) => resolvedCities.includes(zone.cityId)).map((zone) => zone.value));
  };

  const updateCities = (values) => {
    setCities(values);
    setZones(filterData.zones.filter((zone) => values.includes(zone.cityId)).map((zone) => zone.value));
  };

  const changePreset = (value) => {
    setPreset(value);
    if (value !== "Custom") {
      const range = getRange(value);
      setFromDate(range.fromDate);
      setToDate(range.toDate);
    }
  };

  const changeFromDate = (value) => {
    if (!value || value > todayISO()) return;
    setPreset("Custom");
    setFromDate(value);
    if (value > toDate) setToDate(value);
  };

  const changeToDate = (value) => {
    if (!value || value > todayISO()) return;
    setPreset("Custom");
    setToDate(value < fromDate ? fromDate : value);
  };

  const customRangeDays = getInclusiveDateRangeDays(fromDate, toDate);
  const isCustomRangeTooLong = preset === "Custom" && customRangeDays > 90;

  const timeText = (minutes) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
  const startPercent = (startMinutes / 1439) * 100;
  const endPercent = (endMinutes / 1439) * 100;

  const resetFilters = () => {
    setPreset("Today"); setFromDate(todayISO()); setToDate(todayISO());
    setStartMinutes(0); setEndMinutes(1439);
    setCountries(filterData.countries.map((item) => item.value));
    setCities(filterData.cities.map((item) => item.value));
    setZones(filterData.zones.map((item) => item.value));
    setFilterError("");
  };

  const generateReport = async () => {
    if (isGenerating) return;
    if (!fromDate || !toDate || fromDate > toDate) {
      setGenerationError("Please select a valid reporting period.");
      return;
    }
    if (preset === "Custom" && customRangeDays > 90) {
      setGenerationError("Custom date range cannot exceed 90 days. Please select a shorter range.");
      return;
    }
    if (!zones.length) {
      setGenerationError("Please select at least one zone.");
      return;
    }

    const filters = {
      country: countries,
      city: cities,
      zones,
      countryIds: countries,
      cityIds: cities,
      zoneIds: zones,
      preset,
      fromDate,
      toDate,
      fromTime: `${timeText(startMinutes)}:00`,
      toTime: `${timeText(endMinutes)}:59`,
    };

    // Keep request keys consistent with the existing report API conventions.
    const payload = {
      reportType: "Daily",
      ZoneName: zones.join(","),
      FromDateTime: fromDate,
      ToDateTime: toDate,
    };

    setIsGenerating(true);
    setGenerationError("");
    try {
      const response = await api.post("healthReports/report", payload, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      // Support both a direct API response and an API wrapper such as
      // { data: { success, chart, grid } }.
      const responseBody = response?.data;
      const result = responseBody?.data ?? responseBody;

      if (!result || result.success === false) {
        throw new Error(
          result?.message || "Failed to generate the health report."
        );
      }

      // The Health Reports API returns chart as a nested array and grid as rows.
      const hasGrid = Array.isArray(result.grid);
      const hasChart = Array.isArray(result.chart);
      if (!hasGrid && !hasChart) {
        console.error("Unexpected Health Reports API response:", responseBody);
        throw new Error(
          "The Health Reports API response did not contain a grid or chart array."
        );
      }

      // Save the complete response object: Results reads data.grid and data.chart.
      setReportData(result);
      setReportFilters(filters);

      // Do not invoke the optional parent callback here. A parent callback may
      // trigger another render/navigation and interfere with this component's
      // local filter-to-results transition.
    } catch (error) {
      console.error("Unable to generate health report:", error);
      setGenerationError(
        error?.response?.data?.message || error?.message ||
        "Unable to generate the health report. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (reportFilters !== null) {
    return (
      <HealthReportResults
        filters={reportFilters}
        data={reportData}
        onBack={() => { setReportFilters(null); setReportData(null); setGenerationError(""); }}
      />
    );
  }

  return (
    <><style>{customDateRangeStyles}</style>
      <div className="hrf-page">
      {/* Keep the same page header pattern as Historical Reports. */}
      <header className="hrf-header"><h1>Health Report</h1></header>
      <main className="hrf-main">
        <section className="hrf-card">
          <section className="hrf-filter-section">
            <div className="hrf-section-heading">
              <h2>Filters</h2>
              <p>{isLoadingFilters ? "Loading Country, City and Zone filters..." : "Select the filters for your report. You can select multiple values."}</p>
            </div>
            <div className="hrf-filter-grid">
              <div className="hrf-field"><label><Globe2 /><strong>Country(s)</strong></label><MultiSelectFilter label="Country(s)" options={filterData.countries} value={countries} onChange={updateCountries} disabled={isLoadingFilters} /></div>
              <div className="hrf-field"><label><Building2 /><strong>City(s)</strong></label><MultiSelectFilter label="City(s)" options={availableCities} value={cities.filter((id) => availableCities.some((city) => city.value === id))} onChange={updateCities} disabled={isLoadingFilters} /></div>
              <div className="hrf-field"><label><MapPinned /><strong>Zone(s)</strong></label><MultiSelectFilter label="Zone(s)" options={availableZones} value={zones.filter((id) => availableZones.some((zone) => zone.value === id))} onChange={setZones} disabled={isLoadingFilters} /></div>
            </div>
            {isLoadingFilters && <div className="hrf-filter-status"><LoaderCircle className="hrf-spin" /> Loading filters...</div>}
            {filterError && <div className="hrf-error" role="alert">{filterError} Please check your session/API connection and try refreshing.</div>}
          </section>
          {generationError && <div className="hrf-error" role="alert">{generationError}</div>}
          {isGenerating && <div className="hrf-filter-status" role="status">Generating health report...</div>}

          <section className="hrf-report-options">
            <h2>Report Options</h2>
            <div className="hrf-options-grid">
              <section className="hrf-period-panel">
                <h3>Select Period</h3>
                <div className="hrf-preset-list">
                  {PERIODS.map((period) => <button key={period} type="button" className={`hrf-preset ${preset === period ? "active" : ""}`} aria-pressed={preset === period} onClick={() => changePreset(period)}><Calendar /><span>{period}</span></button>)}
                </div>

                {preset === "Custom" && (
                  <div className={`hrf-custom-date-panel${isCustomRangeTooLong ? " hrf-custom-date-panel-invalid" : ""}`}>
                    <label className="hrf-date-field" htmlFor="hrf-from-date">
                      <span>From Date</span>
                      <input
                        id="hrf-from-date"
                        type="date"
                        value={fromDate}
                        max={todayISO()}
                        onChange={(event) => changeFromDate(event.target.value)}
                        aria-invalid={isCustomRangeTooLong}
                      />
                    </label>
                    <span className="hrf-to-label">to</span>
                    <label className="hrf-date-field" htmlFor="hrf-to-date">
                      <span>To Date</span>
                      <input
                        id="hrf-to-date"
                        type="date"
                        value={toDate}
                        min={fromDate}
                        max={todayISO()}
                        onChange={(event) => changeToDate(event.target.value)}
                        aria-invalid={isCustomRangeTooLong}
                      />
                    </label>
                    <div className="hrf-custom-date-note-row" role={isCustomRangeTooLong ? "alert" : "note"}>
                      <span className={isCustomRangeTooLong ? "hrf-custom-date-note hrf-custom-date-note-error" : "hrf-custom-date-note"}>
                        {isCustomRangeTooLong
                          ? `Selected range is ${customRangeDays} days. Maximum allowed is 90 days. Please select a shorter range.`
                          : "Note: Custom date range must be 90 days or fewer."}
                      </span>
                      <strong className={isCustomRangeTooLong ? "hrf-selected-days hrf-selected-days-error" : "hrf-selected-days"}>
                        Selected: {customRangeDays} {customRangeDays === 1 ? "day" : "days"}
                      </strong>
                    </div>
                  </div>
                )}
<div className="hrf-selected-period"><Calendar /><span><strong>Selected Period:</strong> {displayDate(fromDate)} to {displayDate(toDate)}</span></div>
              </section>

              <section className="hrf-time-panel">
                <h3>Time Range (Hours)</h3>
                <div className="hrf-time-values"><span className="hrf-time-chip"><small>From</small><strong>{timeText(startMinutes)}</strong></span><span className="hrf-time-arrow">→</span><span className="hrf-time-chip hrf-time-chip-end"><small>To</small><strong>{timeText(endMinutes)}</strong></span></div>
                <div className="hrf-time-slider" aria-label="Select report time range"><div className="hrf-slider-track" /><div className="hrf-slider-selected" style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }} />
                  <input className="hrf-slider-input hrf-slider-start" aria-label="Start time" type="range" min="0" max={Math.max(0, endMinutes - 1)} value={startMinutes} onChange={(event) => setStartMinutes(Math.min(Number(event.target.value), endMinutes - 1))} />
                  <input className="hrf-slider-input hrf-slider-end" aria-label="End time" type="range" min={Math.min(1439, startMinutes + 1)} max="1439" value={endMinutes} onChange={(event) => setEndMinutes(Math.max(Number(event.target.value), startMinutes + 1))} />
                </div>
                <div className="hrf-time-labels"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span></div>
              </section>
            </div>
          </section>

          <div className="hrf-action-bar"><div className="hrf-info"><FiInfo /><span>Review the filters, period and report options before generating.</span></div><div className="hrf-actions">
            <button type="button" className="hrf-button secondary" onClick={resetFilters}><FiRefreshCw />Reset</button>
            <button type="button" className="hrf-button primary" onClick={generateReport} disabled={isLoadingFilters || !!filterError || isGenerating || startMinutes >= endMinutes || isCustomRangeTooLong}><FiBarChart2 />{isGenerating ? "Generating..." : "Generate Report"} <span>→</span></button>
          </div></div>
        </section>
      </main>
      </div>
    </>
  );
}
