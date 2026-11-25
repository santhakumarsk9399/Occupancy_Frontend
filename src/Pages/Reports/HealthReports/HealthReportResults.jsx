// import React, { useMemo, useState } from "react";
// import {
//   FiActivity,
//   FiCalendar,
//   FiMapPin,
//   FiArrowLeft,
//   FiBarChart2,
//   FiPieChart,
//   FiDownload,
//   FiSearch,
//   FiEye,
//   FiX,
// } from "react-icons/fi";
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import "./HealthReportResults.css";

// const flattenChart = (chart) => {
//   if (!Array.isArray(chart)) return [];
//   return chart.flatMap((entry) =>
//     Array.isArray(entry) ? entry.filter(Boolean) : entry ? [entry] : []
//   );
// };

// const formatDate = (value) => {
//   if (!value) return "—";
//   const text = String(value).slice(0, 10);
//   const parts = text.split("-");
//   return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : String(value);
// };

// const durationMinutes = (value) => {
//   const match = String(value ?? "").match(/(\d+)\s*:\s*(\d+)/);
//   return match ? Number(match[1]) * 60 + Number(match[2]) : 0;
// };

// const formatDuration = (minutes) => {
//   const safe = Math.max(0, Math.round(Number(minutes) || 0));
//   return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
// };

// const extractDuration = (value) => {
//   const match = String(value ?? "").match(/(\d+)\s*:\s*(\d+)/);
//   return match ? `${String(Number(match[1])).padStart(2, "0")}:${String(Number(match[2])).padStart(2, "0")}` : "00:00";
// };

// const parsePercent = (value) => {
//   const text = String(value ?? "").trim();
//   const parenthesized = text.match(/\(([-\d.]+)\s*%?\)/);
//   if (parenthesized) return Number(parenthesized[1]);
//   const percent = text.match(/([-\d.]+)\s*%/);
//   if (percent) return Number(percent[1]);
//   if (/^[-\d.]+$/.test(text)) return Number(text);
//   return 0;
// };

// const getRowDate = (row, fallbackDate = "") =>
//   row?.DATE ?? row?.Date ?? row?.ReportDate ?? row?.ReportPeriod ?? fallbackDate;

// const normalizeGridRow = (row, index, chartRows, defaultDate) => {
//   const uniqueId = String(row?.["UNIQUE ID"] ?? row?.UniqueID ?? row?.UniqueId ?? row?.uniqueId ?? "—");
//   const deviceName = String(row?.["DEVICE NAME"] ?? row?.DeviceName ?? row?.ZoneName ?? "—");

//   const chartRow =
//     chartRows.find((item) =>
//       item?.ZoneName && (item.ZoneName === deviceName || item.ZoneName === uniqueId)
//     ) ?? chartRows[index] ?? {};

//   const onlineText = String(row?.["ONLINE PERCENTAGE"] ?? row?.OnlinePercentage ?? row?.OnlineHours ?? "").trim();
//   const offlineText = String(row?.["OFFLINE HOURS"] ?? row?.OfflineHours ?? "").trim();
//   const internetText = String(row?.["INTERNET DOWN HOURS"] ?? row?.InternetDownHours ?? "").trim();

//   const pct = parsePercent(row?.OnlinePercentage ?? row?.["ONLINE PERCENTAGE"] ?? row?.onlinePercentage);
//   const onlineDuration = extractDuration(onlineText || chartRow?.OnlineHours);
//   const offlineDuration = extractDuration(offlineText || chartRow?.OfflineHours);
//   const internetDuration = extractDuration(internetText || row?.internetDownHours);

//   const hasPercentage =
//     row?.OnlinePercentage !== undefined ||
//     row?.["ONLINE PERCENTAGE"] !== undefined ||
//     row?.onlinePercentage !== undefined;
//   const hasChartMetrics = chartRow?.OnlineHours !== undefined || chartRow?.OfflineHours !== undefined;

//   let status = "No Data";
//   if (hasPercentage || hasChartMetrics) {
//     if (pct > 0 || (Number(chartRow?.OnlineHours) > 0 && !hasPercentage)) {
//       status = "Online";
//     } else if (
//       durationMinutes(offlineDuration) > 0 ||
//       (hasPercentage && pct === 0 && onlineDuration === "00:00")
//     ) {
//       status = "Offline";
//     }
//   }

//   return {
//     id: uniqueId,
//     device: deviceName,
//     date: String(getRowDate(row, defaultDate) || "—"),
//     online: onlineDuration,
//     offline: offlineDuration,
//     internetDown: internetDuration,
//     pct: Number.isFinite(pct) ? pct : 0,
//     status,
//     timeline: row?.timeline ?? row?.history ?? null,
//   };
// };

// const durationFromTotal = (value) => {
//   const match = String(value ?? "").match(/(\d+)\s*:\s*(\d+)/);
//   return match ? Number(match[1]) * 60 + Number(match[2]) : null;
// };

// const convertChartValueToMinutes = (value) => {
//   const number = Number(value ?? 0);
//   // The chart API returns 96 quarter-hour intervals for 24 hours.
//   return Math.max(0, number) > 24 ? Math.max(0, number) * 15 : Math.max(0, number) * 60;
// };

// const formatTooltipHours = (value) => {
//   const number = Number(value);
//   return `${Number.isFinite(number) ? number.toFixed(2) : "0.00"} hours`;
// };

// function HealthHoursTooltip({ active, payload, label }) {
//   if (!active || !payload?.length) return null;

//   const colors = { Online: "#35ad83", Offline: "#397df6" };
//   const visibleItems = payload.filter(
//     (item) => item?.value !== undefined && item?.value !== null
//   );

//   return (
//     <div className="health-report-custom-tooltip">
//       <div className="health-report-tooltip-heading">{label || "Total hours"}</div>
//       <div className="health-report-tooltip-metrics">
//         {visibleItems.map((item) => (
//           <div className="health-report-tooltip-row" key={item.dataKey || item.name}>
//             <span className="health-report-tooltip-label">
//               <i style={{ backgroundColor: colors[item.name] || item.color }} />
//               {item.name}
//             </span>
//             <strong>{formatTooltipHours(item.value)}</strong>
//           </div>
//         ))}
//       </div>
//       <div className="health-report-tooltip-bottom-border" />
//     </div>
//   );
// }

// function HealthStatusTooltip({ active, payload }) {
//   if (!active || !payload?.length) return null;

//   const item = payload[0];
//   if (!item) return null;

//   return (
//     <div className="health-report-custom-tooltip health-report-status-tooltip">
//       <div className="health-report-tooltip-heading">Online vs Offline</div>
//       <div className="health-report-tooltip-metrics">
//         <div className="health-report-tooltip-row">
//           <span className="health-report-tooltip-label">
//             <i style={{ backgroundColor: item.payload?.color || item.color }} />
//             {item.payload?.name || item.name || "Status"}
//           </span>
//           <strong>{`${Number(item.value || 0).toFixed(2)}%`}</strong>
//         </div>
//       </div>
//       <div className="health-report-tooltip-bottom-border" />
//     </div>
//   );
// }

// 
// [Legacy section: duplicate tooltip removed.]
// export default function HealthReportResults({ filters = {}, onBack, data }) {
//   const [search, setSearch] = useState("");
//   const [selected, setSelected] = useState(null);
//   const [showOnline, setShowOnline] = useState(true);
//   const [showOffline, setShowOffline] = useState(true);

//   // Support both a direct API payload and an Axios-wrapped payload (response.data).
//   const reportPayload = data?.data && (data.data.grid || data.data.chart)
//     ? data.data
//     : data;
//   const apiGrid = Array.isArray(reportPayload?.grid)
//     ? reportPayload.grid
//     : Array.isArray(reportPayload)
//       ? reportPayload
//       : [];
//   const chartRows = flattenChart(reportPayload?.chart);
//   const gridTotal = apiGrid.find((row) => String(getRowDate(row)).toLowerCase() === "total");
//   const gridRows = apiGrid.filter((row) => String(getRowDate(row)).toLowerCase() !== "total");
//   const defaultDate = filters.fromDate || "";

//   const rows = useMemo(
//     () => gridRows.map((row, index) => normalizeGridRow(row, index, chartRows, defaultDate)),
//     [gridRows, chartRows, defaultDate]
//   );

//   const filteredRows = useMemo(() => {
//     const query = search.trim().toLowerCase();
//     if (!query) return rows;
//     return rows.filter((row) =>
//       [row.date, row.id, row.device, row.online, row.offline, row.internetDown, row.pct, row.status]
//         .some((value) => String(value ?? "").toLowerCase().includes(query))
//     );
//   }, [rows, search]);

//   // Consolidated chart: one Total bar group for all selected devices/zones.
//   // Prefer the API's Total row; otherwise aggregate the chart series.
//   const chartTotalOnlineMinutes = durationFromTotal(
//     gridTotal?.["ONLINE PERCENTAGE"] ?? gridTotal?.OnlineHours
//   );
//   const chartTotalOfflineMinutes = durationFromTotal(
//     gridTotal?.["OFFLINE HOURS"] ?? gridTotal?.OfflineHours
//   );
//   const aggregateOnlineMinutes = chartTotalOnlineMinutes !== null
//     ? chartTotalOnlineMinutes
//     : chartRows.reduce((sum, row) => sum + convertChartValueToMinutes(row?.OnlineHours), 0);
//   const aggregateOfflineMinutes = chartTotalOfflineMinutes !== null
//     ? chartTotalOfflineMinutes
//     : chartRows.reduce((sum, row) => sum + convertChartValueToMinutes(row?.OfflineHours), 0);

//   const chartData = [{
//     name: "Total",
//     // Keep both series mounted when toggling the legend so the remaining bar
//     // stays in its original position. Null suppresses the value without
//     // changing the bar layout as Recharts' hide prop can do.
//     Online: showOnline ? Number((aggregateOnlineMinutes / 60).toFixed(2)) : null,
//     Offline: showOffline ? Number((aggregateOfflineMinutes / 60).toFixed(2)) : null,
//   }];
//   const maxChartHours = Math.max(
//     24,
//     Number(chartData[0].Online) || 0,
//     Number(chartData[0].Offline) || 0,
//   );
//   // Use a 24-hour step while allowing consolidated device-hours to exceed 24.
//   const yAxisMax = Math.ceil(maxChartHours / 24) * 24;

//   // The donut represents API availability percentages, not the number of devices.
//   // When several zones are returned, calculate a weighted average using
//   // TotalRecordedHours; fall back to a simple average if that field is absent.
//   const percentageRows = chartRows.filter((row) =>
//     row?.OnlinePercentage !== undefined || row?.OfflinePercentage !== undefined
//   );
//   const onlinePercentages = percentageRows.map((row) => ({
//     value: Math.min(100, Math.max(0, parsePercent(row.OnlinePercentage))),
//     weight: Math.max(0, Number(row.TotalRecordedHours) || 0),
//   }));
//   const offlinePercentages = percentageRows.map((row) => ({
//     value: Math.min(100, Math.max(0, parsePercent(row.OfflinePercentage))),
//     weight: Math.max(0, Number(row.TotalRecordedHours) || 0),
//   }));

//   const getAveragePercentage = (items, fallbackItems, metric) => {
//     if (items.length) {
//       const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
//       if (totalWeight > 0) {
//         return items.reduce((sum, item) => sum + item.value * item.weight, 0) / totalWeight;
//       }
//       return items.reduce((sum, item) => sum + item.value, 0) / items.length;
//     }
//     const onlineHours = fallbackItems.reduce((sum, row) => sum + Math.max(0, Number(row.OnlineHours) || 0), 0);
//     const offlineHours = fallbackItems.reduce((sum, row) => sum + Math.max(0, Number(row.OfflineHours) || 0), 0);
//     const totalHours = onlineHours + offlineHours;
//     if (!totalHours) return 0;
//     return ((metric === "offline" ? offlineHours : onlineHours) / totalHours) * 100;
//   };

//   const onlinePercentage = getAveragePercentage(onlinePercentages, chartRows, "online");
//   const offlinePercentage = getAveragePercentage(offlinePercentages, chartRows, "offline");
//   const statusData = [
//     { name: "Online", value: Number(onlinePercentage.toFixed(2)), color: "#35ad83" },
//     { name: "Offline", value: Number(offlinePercentage.toFixed(2)), color: "#397df6" },
//   ];

//   const zones = Array.isArray(filters.zones) && filters.zones.length
//     ? filters.zones.join(", ")
//     : "All zones";
//   const fromDate = formatDate(filters.fromDate || rows[0]?.date);
//   const toDate = formatDate(filters.toDate || filters.fromDate || rows[0]?.date);
//   const fromTime = String(filters.fromTime || "00:00:00").slice(0, 5);
//   const toTime = String(filters.toTime || "23:59:59").slice(0, 5);

//   const totalOnline = gridTotal
//     ? extractDuration(gridTotal["ONLINE PERCENTAGE"] ?? gridTotal.OnlineHours)
//     : formatDuration(rows.reduce((sum, row) => sum + durationMinutes(row.online), 0));
//   const totalOffline = gridTotal
//     ? extractDuration(gridTotal["OFFLINE HOURS"] ?? gridTotal.OfflineHours)
//     : formatDuration(rows.reduce((sum, row) => sum + durationMinutes(row.offline), 0));
//   const totalInternet = gridTotal
//     ? extractDuration(gridTotal["INTERNET DOWN HOURS"] ?? gridTotal.InternetDownHours)
//     : formatDuration(rows.reduce((sum, row) => sum + durationMinutes(row.internetDown), 0));
//   const totalPct = rows.length
//     ? (rows.reduce((sum, row) => sum + row.pct, 0) / rows.length).toFixed(2)
//     : "0.00";

//   const exportCsv = () => {
//     const csvRows = [
//       ["Date", "Unique ID", "Device / Zone", "Online Hours", "Offline Hours", "Internet Down Hours", "Online %", "Status"],
//       ...filteredRows.map((row) => [row.date, row.id, row.device, row.online, row.offline, row.internetDown, row.pct, row.status]),
//     ];
//     const csv = csvRows
//       .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
//       .join("\r\n");
//     const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }));
//     const anchor = document.createElement("a");
//     anchor.href = url;
//     anchor.download = "health-report.csv";
//     document.body.appendChild(anchor);
//     anchor.click();
//     anchor.remove();
//     URL.revokeObjectURL(url);
//   };

//   const handleBack = () => {
//     if (typeof onBack === "function") onBack();
//     else window.history.back();
//   };

//   return (
//     <div className="health-report-page">
//       <header className="health-report-header">
//         <div className="health-report-header-title">
//           {/* <FiActivity /> */}
//           <h1>Health Reports</h1>
//         </div>
//       </header>

//       <main className="health-report-main">
//         <section className="health-report-summary health-report-card">
//           <div className="health-report-summary-item health-report-period-item">
//             <span className="health-report-summary-icon"><FiCalendar /></span>
//             <div>
//               <small>Selected Period</small>
//               <strong>{fromDate} {fromTime}:00 - {toDate} {toTime}:59</strong>
//             </div>
//           </div>
//           <div className="health-report-summary-item health-report-zones-item">
//             <span className="health-report-summary-icon"><FiMapPin /></span>
//             <div>
//               <small>Selected Zones</small>
//               <strong title={zones}>{zones}</strong>
//             </div>
//           </div>
//           <button type="button" className="health-report-back" onClick={handleBack}>
//             <FiArrowLeft /> Back to Filters
//           </button>
//         </section>

//         <section className="health-report-charts">
//           <article className="health-report-card health-report-chart-card">
//             <div className="health-report-card-title">
//               <div>
//                 <h2><FiActivity /> Online vs Offline Hours</h2>
//                 <p className="health-report-chart-subtitle">Consolidated total hours</p>
//               </div>
//               <small>Hours</small>
//             </div>
//             <div className="health-report-chart">
//               {chartRows.length > 0 || rows.length > 0 ? (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart
//                     data={chartData}
//                     margin={{ top: 18, right: 18, left: 10, bottom: 12 }}
//                     barGap={8}
//                     barCategoryGap="35%"
//                   >
//                     <CartesianGrid strokeDasharray="3 3" stroke="#e5edf7" vertical={false} />
//                     <XAxis
//                       dataKey="name"
//                       tick={{ fontSize: 12, fill: "#526581" }}
//                       tickLine={false}
//                       axisLine={{ stroke: "#d7e2f0" }}
//                     />
//                     <YAxis
//                       domain={[0, yAxisMax]}
//                       allowDecimals={false}
//                       tick={{ fontSize: 12, fill: "#526581" }}
//                       tickLine={false}
//                       axisLine={false}
//                       label={{ value: "Hours", angle: -90, position: "insideLeft", fill: "#526581", fontSize: 13 }}
//                     />
//                     <Tooltip
//                       content={<HealthHoursTooltip />}
//                       cursor={false}
//                       isAnimationActive={false}
//                     />
//                     {/* Keep both series mounted so toggling one checkbox does not move the other bar. */}
//                     <Bar
//                       dataKey="Online"
//                       name="Online"
//                       fill="#35ad83"
//                       radius={[4, 4, 0, 0]}
//                       maxBarSize={72}
//                       isAnimationActive={false}
//                     />
//                     <Bar
//                       dataKey="Offline"
//                       name="Offline"
//                       fill="#397df6"
//                       radius={[4, 4, 0, 0]}
//                       maxBarSize={72}
//                       isAnimationActive={false}
//                     />
//                   </BarChart>
//                 </ResponsiveContainer>
//               ) : (
//                 <div className="health-report-chart-empty">No chart data available.</div>
//               )}
//             </div>
//             <div className="health-report-chart-checkbox-legend">
//               <label className="health-report-legend-option online">
//                 <input type="checkbox" aria-label="Show online hours" checked={showOnline} onChange={(event) => setShowOnline(event.target.checked)} />
//                 <span className="legend-swatch online" aria-hidden="true" />
//                 <span className="legend-label">Online</span>
//               </label>
//               <label className="health-report-legend-option offline">
//                 <input type="checkbox" aria-label="Show offline hours" checked={showOffline} onChange={(event) => setShowOffline(event.target.checked)} />
//                 <span className="legend-swatch offline" aria-hidden="true" />
//                 <span className="legend-label">Offline</span>
//               </label>
//             </div>
//           </article>

//           <article className="health-report-card health-report-chart-card">
//             <div className="health-report-card-title">
//               <h2><FiPieChart /> Online vs Offline Status</h2>
//             </div>
//             <div className="health-report-status-chart">
//               <div className="health-report-donut">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie
//                       data={statusData}
//                       dataKey="value"
//                       nameKey="name"
//                       innerRadius="62%"
//                       outerRadius="84%"
//                       paddingAngle={0}
//                       stroke="none"
//                       activeShape={false}
//                       isAnimationActive={false}
//                     >
//                       {statusData.map((item) => <Cell key={item.name} fill={item.color} />)}
//                     </Pie>
//                     <Tooltip
//                       content={<HealthStatusTooltip />}
//                       cursor={false}
//                       isAnimationActive={false}
//                     />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//               <div className="health-report-legend">
//                 {statusData.map((item) => (
//                   <div key={item.name}>
//                     <i style={{ background: item.color }} />
//                     <span>{item.name}</span>
//                     <strong>{item.value.toFixed(2)}%</strong>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </article>
//         </section>

//         <section className="health-report-card health-report-table-card">
//           <div className="health-report-table-toolbar">
//             <div className="health-report-table-heading">
//               <FiBarChart2 />
//               <h2>Report Data</h2>
//               <span>{filteredRows.length} records</span>
//             </div>
//             <div className="health-report-tools">
//               <button type="button" className="health-report-export excel" onClick={exportCsv}>
//                 <FiDownload /> Excel
//               </button>
//               <button type="button" className="health-report-export pdf" onClick={() => window.print()}>
//                 <FiDownload /> PDF
//               </button>
//               <label className="health-report-search">
//                 <FiSearch />
//                 <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by date or device..." />
//               </label>
//             </div>
//           </div>

//           <div className="health-report-table-scroll">
//             <table className="health-report-table">
//               <thead>
//                 <tr>
//                   <th>Date</th>
//                   <th>Unique ID</th>
//                   <th>Device / Zone</th>
//                   <th>Online Hours</th>
//                   <th>Offline Hours</th>
//                   <th>Internet Down Hours</th>
//                   <th>Online %</th>
//                   <th>Status</th>
//                   <th>Details</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredRows.map((row, index) => (
//                   <tr key={`${row.id}-${row.date}-${index}`} onClick={() => setSelected(row)}>
//                     <td>{formatDate(row.date)}</td>
//                     <td>{row.id}</td>
//                     <td>{row.device}</td>
//                     <td>{row.online}</td>
//                     <td>{row.offline}</td>
//                     <td>{row.internetDown}</td>
//                     <td>{row.pct.toFixed(2)}%</td>
//                     <td>
//                       <span className={`health-report-status ${row.status.toLowerCase().replace(/\s+/g, "-")}`}>
//                         <i />{row.status}
//                       </span>
//                     </td>
//                     <td>
//                       <button type="button" className="health-report-view" aria-label={`View details for ${row.device}`} onClick={(event) => { event.stopPropagation(); setSelected(row); }}>
//                         <FiEye />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {!filteredRows.length && (
//                   <tr>
//                     <td colSpan="8" className="health-report-empty">
//                       {reportPayload?.success === false ? "Unable to load health report data." : "No health report data found for the selected filters."}
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//               <tfoot>
//                 <tr>
//                   <td colSpan="3">Total</td>
//                   <td>{totalOnline}</td>
//                   <td>{totalOffline}</td>
//                   <td>{totalInternet}</td>
//                   <td>{totalPct}%</td>
//                   <td colSpan="2">—</td>
//                 </tr>
//               </tfoot>
//             </table>
//           </div>
//           {/* <p className="health-report-table-hint">Device timeline is shown only when the API provides history for the selected record.</p> */}
//         </section>
//       </main>

//       {selected && (
//         <div className="health-report-modal-bg" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
//           <section className="health-report-modal" role="dialog" aria-modal="true" aria-label="Device status details">
//             <header className="health-report-modal-header">
//               <div>
//                 <span className="health-report-modal-icon"><FiActivity /></span>
//                 <div>
//                   <h2>{selected.id}</h2>
//                   <p>{selected.device} · {formatDate(selected.date)}</p>
//                 </div>
//               </div>
//               <button type="button" onClick={() => setSelected(null)} aria-label="Close"><FiX /></button>
//             </header>
//             <div className="health-report-modal-legend">
//               <span><i className="health-report-online-dot" /> Online <strong>{selected.online}</strong></span>
//               <span><i className="health-report-offline-dot" /> Offline <strong>{selected.offline}</strong></span>
//               <span><i className="health-report-internet-dot" /> Internet down <strong>{selected.internetDown}</strong></span>
//             </div>
//             <div className="health-report-timeline health-report-timeline-empty">
//               <p>Timeline history is not available in the supplied report response.</p>
//             </div>
//             <div className="health-report-modal-bottom">
//               <span>Details are limited to fields returned by the API.</span>
//               <button type="button" onClick={() => setSelected(null)}>Close</button>
//             </div>
//           </section>
//         </div>
//       )}
//     </div>
//   );
// }

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import {
  FiActivity,
  FiCalendar,
  FiMapPin,
  FiArrowLeft,
  FiBarChart2,
  FiPieChart,
  FiDownload,
  FiSearch,
  FiEye,
  FiX,
  FiClock,
  FiLogIn,
  FiLogOut,
  FiWifi,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./HealthReportResults.css";
import { downloadExcel } from "../../CommonComponents/DownloadExcel";
import { downloadPDF } from "../../CommonComponents/DownloadPdf";
const baseURL = import.meta.env.VITE_API_URL;
const DEVICE_API = `${baseURL}/dashboard/healthDashboard/deviceHealthStatus`;
const SCHEDULE_API = `${baseURL}/dashboard/healthDashboard/healthTrackerScheduleChart`;
const ONLINE_COLOR = "#2eaa7d";
const OFFLINE_COLOR = "#397df6";
const COLORS = { Online: ONLINE_COLOR, Offline: OFFLINE_COLOR };

const formatDate = (value) => {
  if (!value) return "—";
  const text = String(value).slice(0, 10);
  const parts = text.split("-");
  return parts.length === 3
    ? `${parts[2]}-${parts[1]}-${parts[0]}`
    : String(value);
};
// Supports both day-wise and month-wise API responses.
const getRowDate = (row, fallback = "") =>
  row?.DATE ??
  row?.Date ??
  row?.ReportDate ??
  row?.ReportPeriod ??
  row?.MONTH ??
  row?.Month ??
  row?.month ??
  row?.YEAR ??
  row?.Year ??
  row?.year ??
  fallback;

// Detects a backend Total row regardless of whether its period key is DATE or MONTH.
const isApiTotalRow = (row) => {
  if (!row || typeof row !== "object") return false;

  const periodValues = [
    row.DATE,
    row.Date,
    row.ReportDate,
    row.ReportPeriod,
    row.MONTH,
    row.Month,
    row.month,
    row.YEAR,
    row.Year,
    row.year,
    row.Period,
    row.period,
  ];

  return periodValues.some((value) =>
    /^total(?:\b|\s|[-_:])/i.test(String(value ?? "").trim())
  );
};
const flatten = (value) =>
  Array.isArray(value) ? value.flat(Infinity).filter(Boolean) : [];
const unwrap = (value) => {
  let result = value;
  for (
    let i = 0;
    i < 3 && result?.data && typeof result.data === "object";
    i += 1
  )
    result = result.data;
  return result || {};
};
const durationMinutes = (value) => {
  const match = String(value ?? "").match(/(\d+)\s*:\s*(\d+)/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
};
const extractDuration = (value) => {
  const match = String(value ?? "").match(/(\d+)\s*:\s*(\d+)/);
  return match
    ? `${String(Number(match[1])).padStart(2, "0")}:${String(Number(match[2])).padStart(2, "0")}`
    : "00:00";
};
const formatDuration = (minutes) => {
  const n = Math.max(0, Math.round(Number(minutes) || 0));
  return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
};
const parsePercent = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value).trim();
  const match =
    text.match(/\(\s*(-?\d+(?:\.\d+)?)\s*%?\s*\)/) ||
    text.match(/(-?\d+(?:\.\d+)?)\s*%/);
  const numeric = match?.[1] ?? (/^-?\d+(?:\.\d+)?$/.test(text) ? text : null);
  if (numeric === null) return null;
  const n = Number(numeric);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : null;
};
const apiHours = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};
const tokenHeaders = () => {
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
const normalizeGridRow = (row, index, fallbackDate) => {
  const id = String(
    row?.["UNIQUE ID"] ??
    row?.UniqueID ??
    row?.UniqueId ??
    row?.uniqueId ??
    row?.UNIQUE_ID ??
    "—",
  );
  const device = String(
    row?.["DEVICE NAME"] ??
    row?.DeviceName ??
    row?.Device ??
    row?.ZoneName ??
    row?.Zone ??
    "—",
  );
  const onlineRaw =
    row?.["ONLINE PERCENTAGE"] ??
    row?.OnlinePercentage ??
    row?.OnlineHours ??
    row?.ONLINE_HOURS ??
    "";
  const offlineRaw =
    row?.["OFFLINE HOURS"] ?? row?.OfflineHours ?? row?.OFFLINE_HOURS ?? "";
  const internetRaw =
    row?.["INTERNET DOWN HOURS"] ??
    row?.InternetDownHours ??
    row?.INTERNET_DOWN_HOURS ??
    "";
  const explicitPct = row?.OnlinePercentage ?? row?.onlinePercentage;
  const pct =
    explicitPct !== undefined && explicitPct !== null
      ? parsePercent(explicitPct)
      : parsePercent(onlineRaw);
  const online = extractDuration(onlineRaw);
  const offline = extractDuration(offlineRaw);
  const internetDown = extractDuration(internetRaw);
  const statusValue = String(
    row?.STATUS ?? row?.Status ?? row?.DeviceStatus ?? "",
  ).toLowerCase();
  const status = statusValue.includes("offline")
    ? "Offline"
    : statusValue.includes("online")
      ? "Online"
      : pct !== null
        ? pct > 0
          ? "Online"
          : "Offline"
        : durationMinutes(onlineRaw) > 0
          ? "Online"
          : "No Data";
  return {
    id,
    device,
    date: String(getRowDate(row, fallbackDate) || "—"),
    online,
    offline,
    internetDown,
    pct: pct ?? 0,
    status,
    original: row,
    index,
  };
};
const extractHHMM = (apiTime) => {
  if (!apiTime) return "";
  const value = String(apiTime).trim();
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(value))
    return value.split(":").slice(0, 2).join(":").padStart(5, "0");
  if (value.includes("T")) return (value.split("T")[1] || "").slice(0, 5);
  const match = value.match(/(\d{1,2}:\d{2})/);
  return match ? match[1].padStart(5, "0") : value;
};
const formatScheduleTime = (apiTime) => {
  const hhmm = extractHHMM(apiTime);
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return hhmm;
  const [hourText, minuteText] = hhmm.split(":");
  const hour = Number(hourText);
  return `${hour % 12 || 12}:${minuteText} ${hour >= 12 ? "PM" : "AM"}`;
};
const getScheduleInterval = (startValue, endValue) => {
  const start = new Date(startValue).getTime();
  const end = new Date(endValue).getTime();
  return Number.isFinite(start) && Number.isFinite(end) && end > start
    ? (end - start) / 60000
    : 15;
};
const getScheduleLabelInterval = (barWidth = 14) => {
  const step = Math.max(1, Math.round(70 / (barWidth + 1)));
  return [1, 2, 4, 8, 12, 24, 48].find((item) => item >= step) || step;
};

function HoursTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="health-report-custom-tooltip">
      <strong>{label || "Hours"}</strong>
      {payload
        .filter((x) => x.value != null)
        .map((x) => (
          <div className="health-report-tooltip-row" key={x.dataKey}>
            <span>
              <i style={{ background: COLORS[x.name] }} />
              {x.name}
            </span>
            <b>{Number(x.value).toFixed(2)} hours</b>
          </div>
        ))}
    </div>
  );
}
function PercentTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="health-report-custom-tooltip">
      <strong>{item.name}</strong>
      <div className="health-report-tooltip-row">
        <span>
          <i style={{ background: item.payload?.color }} />
          {item.name}
        </span>
        <b>{Number(item.value || 0).toFixed(2)}%</b>
      </div>
    </div>
  );
}

function HoursChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const formatHours = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return value ?? "0";
    return number.toLocaleString("en-US", { maximumFractionDigits: 2 });
  };

  return (
    <div className="health-report-hours-tooltip">
      <div className="health-report-hours-tooltip-title">{label}</div>
      {payload
        .filter((entry) => entry.value !== null && entry.value !== undefined)
        .map((entry) => (
          <div
            className="health-report-hours-tooltip-row"
            key={entry.dataKey || entry.name}
          >
            <span
              className="health-report-hours-tooltip-dot"
              style={{ backgroundColor: entry.color || "#64748b" }}
            />
            <span className="health-report-hours-tooltip-name">
              {entry.name || entry.dataKey}
            </span>
            <strong>{formatHours(entry.value)} hours</strong>
          </div>
        ))}
    </div>
  );
}

export default function HealthReportResults({ filters = {}, onBack, data }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showOnline, setShowOnline] = useState(true);
  const [showOffline, setShowOffline] = useState(true);
  const [isHoursChartExpanded, setIsHoursChartExpanded] = useState(false);
  const [isHoursChartModalOpen, setIsHoursChartModalOpen] = useState(false);
  const [showPieOnline, setShowPieOnline] = useState(true);
  const [showPieOffline, setShowPieOffline] = useState(true);
  const [deviceDetails, setDeviceDetails] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(false);
  const [scheduleTooltip, setScheduleTooltip] = useState(null);
  const scheduleTooltipRef = useRef(null);

  const payload = useMemo(() => unwrap(data), [data]);
  const hourSummary = flatten(
    payload?.HourChartSummary ??
    payload?.hourChartSummary ??
    payload?.HourchartSummary,
  );
  const percentageSummary = flatten(
    payload?.PercentageChartSummary ?? payload?.percentageChartSummary,
  );
  const apiGrid = flatten(payload?.grid ?? payload?.Grid);
  // Keep the API-provided Total row separate from detail rows.
  // This works for both DATE: "Total" and MONTH: "Total" responses.
  const totalRow = apiGrid.find(isApiTotalRow);
  const rawRows = apiGrid.filter((row) => !isApiTotalRow(row));

  // Render only the columns and values actually returned by the API.
  // The Total row is shown only when the backend includes one.
  const apiGridColumns = rawRows.length ? Object.keys(rawRows[0]) : [];
  const isMonthWiseGrid = apiGridColumns.some((key) =>
    ["MONTH", "Month", "month"].includes(key)
  );
  const showViewColumn = !isMonthWiseGrid && apiGridColumns.some((key) =>
    ["DATE", "Date", "ReportDate"].includes(key)
  );
  const visibleApiRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rawRows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) =>
        !query ||
        Object.values(row).some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        )
      );
  }, [apiGrid, search]);

  const rows = useMemo(
    () =>
      rawRows.map((row, i) => normalizeGridRow(row, i, filters.fromDate || "")),
    [apiGrid, filters.fromDate],
  );
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? rows.filter((row) =>
        [
          row.date,
          row.id,
          row.device,
          row.online,
          row.offline,
          row.internetDown,
          row.pct,
          row.status,
        ].some((v) =>
          String(v ?? "")
            .toLowerCase()
            .includes(q),
        ),
      )
      : rows;
  }, [rows, search]);

  // Use the chart summary exactly as returned by the API.
  // Daily responses use DATE; monthly responses use MONTH (e.g. JUL-2026).
  // Do not aggregate or calculate monthly totals in the frontend.
  const parseIsoDate = (value) => {
    const text = String(value ?? "").trim();
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      return new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
      );
    }

    const monthMatch = text.match(/^([A-Z]{3})[-\s](\d{4})$/i);
    if (monthMatch) {
      const monthIndex = [
        "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
      ].indexOf(monthMatch[1].toUpperCase());

      if (monthIndex >= 0) {
        return new Date(Number(monthMatch[2]), monthIndex, 1);
      }
    }

    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const hasMonthlyHoursResponse = hourSummary.some(
    (row) =>
      row?.MONTH !== undefined ||
      row?.Month !== undefined ||
      row?.month !== undefined,
  );

  const chartStartDate = parseIsoDate(
    filters.fromDate ??
      filters.FromDateTime ??
      filters.fromDateTime ??
      filters.from,
  );
  const chartEndDate = parseIsoDate(
    filters.toDate ??
      filters.ToDateTime ??
      filters.toDateTime ??
      filters.to ??
      filters.fromDate,
  );
  const firstSummaryDate = parseIsoDate(
    hourSummary[0]?.MONTH ??
      hourSummary[0]?.Month ??
      hourSummary[0]?.month ??
      hourSummary[0]?.DATE ??
      hourSummary[0]?.Date,
  );
  const lastSummaryDate = parseIsoDate(
    hourSummary[hourSummary.length - 1]?.MONTH ??
      hourSummary[hourSummary.length - 1]?.Month ??
      hourSummary[hourSummary.length - 1]?.month ??
      hourSummary[hourSummary.length - 1]?.DATE ??
      hourSummary[hourSummary.length - 1]?.Date,
  );
  const effectiveStartDate = chartStartDate || firstSummaryDate;
  const effectiveEndDate = chartEndDate || lastSummaryDate;
  const selectedRangeDays =
    effectiveStartDate && effectiveEndDate
      ? Math.floor((effectiveEndDate - effectiveStartDate) / 86400000) + 1
      : hourSummary.length;

  const isMonthlyHoursView =
    hasMonthlyHoursResponse || selectedRangeDays > 31;

  const allHoursChartData = useMemo(() => {
    return hourSummary
      .filter((row) => !isApiTotalRow(row))
      .map((row, index) => {
        const monthValue = row?.MONTH ?? row?.Month ?? row?.month;
        const rawPeriod =
          monthValue ??
          row?.DATE ??
          row?.Date ??
          row?.ReportDate ??
          row?.ReportPeriod;
        const parsedDate = parseIsoDate(rawPeriod);

        // Keep one chart item for each API summary row; no frontend aggregation.
        const label = monthValue !== undefined && monthValue !== null
          ? String(monthValue)
          : parsedDate
            ? parsedDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              })
            : String(rawPeriod ?? `Item ${index + 1}`);

        return {
          periodKey: String(rawPeriod ?? index),
          name: label,
          Online: showOnline
            ? apiHours(row?.OnlineHours ?? row?.ONLINEHOURS)
            : null,
          Offline: showOffline
            ? apiHours(row?.OfflineHours ?? row?.OFFLINEHOURS)
            : null,
          sortDate: parsedDate?.getTime() ?? index,
        };
      })
      .sort((a, b) => a.sortDate - b.sortDate);
  }, [hourSummary, showOnline, showOffline]);
  const shouldShowExpandHoursChart = allHoursChartData.length > 7;
  // Keep the dashboard chart compact. Full daily/monthly data opens in a modal.
  const barData = shouldShowExpandHoursChart
    ? allHoursChartData.slice(-7)
    : allHoursChartData;
  const fullChartMax = Math.max(
    24,
    ...allHoursChartData.flatMap((item) => [
      Number(item.Online) || 0,
      Number(item.Offline) || 0,
    ]),
  );
  const fullChartYMax = Math.ceil(fullChartMax / 24) * 24;
  const chartMax = Math.max(
    24,
    ...barData.flatMap((item) => [Number(item.Online) || 0, Number(item.Offline) || 0]),
  );
  const yMax = Math.ceil(chartMax / 24) * 24;
  const avgPct = (key) =>
    percentageSummary.length
      ? percentageSummary.reduce(
        (sum, row) =>
          sum + (parsePercent(row?.[key] ?? row?.[key.toUpperCase()]) ?? 0),
        0,
      ) / percentageSummary.length
      : 0;
  const onlinePct = avgPct("OnlinePercentage");
  const offlinePct = avgPct("OfflinePercentage");
  const pieData = [
    ...(showPieOnline
      ? [{ name: "Online", value: onlinePct, color: ONLINE_COLOR }]
      : []),
    ...(showPieOffline
      ? [{ name: "Offline", value: offlinePct, color: OFFLINE_COLOR }]
      : []),
  ];

  const zones =
    Array.isArray(filters.zones) && filters.zones.length
      ? filters.zones.join(", ")
      : "All zones";
  const fromDate = formatDate(
    filters.fromDate ||
    rows[0]?.date ||
    hourSummary[0]?.DATE ||
    percentageSummary[0]?.DATE,
  );
  const toDate = formatDate(
    filters.toDate ||
    filters.fromDate ||
    rows[rows.length - 1]?.date ||
    hourSummary[hourSummary.length - 1]?.DATE,
  );
  const fromTime = String(filters.fromTime || "00:00:00").slice(0, 5);
  const toTime = String(filters.toTime || "23:59:59").slice(0, 5);
  const totalOnline = totalRow
    ? extractDuration(totalRow["ONLINE PERCENTAGE"] ?? totalRow.OnlineHours)
    : formatDuration(
      rows.reduce((sum, row) => sum + (durationMinutes(row.online) || 0), 0),
    );
  const totalOffline = totalRow
    ? extractDuration(totalRow["OFFLINE HOURS"] ?? totalRow.OfflineHours)
    : formatDuration(
      rows.reduce((sum, row) => sum + (durationMinutes(row.offline) || 0), 0),
    );
  const totalInternet = totalRow
    ? extractDuration(
      totalRow["INTERNET DOWN HOURS"] ?? totalRow.InternetDownHours,
    )
    : formatDuration(
      rows.reduce(
        (sum, row) => sum + (durationMinutes(row.internetDown) || 0),
        0,
      ),
    );
  // Prefer the percentage supplied by the backend Total row when available.
  // Otherwise preserve the existing fallback behavior.
  const apiTotalPct = totalRow
    ? parsePercent(
        totalRow.OnlinePercentage ??
        totalRow.onlinePercentage ??
        totalRow["ONLINE %"] ??
        totalRow["ONLINE PERCENTAGE"] ??
        totalRow.OnlinePct
      )
    : null;

  const totalPct = apiTotalPct !== null
    ? apiTotalPct.toFixed(2)
    : percentageSummary.length
      ? onlinePct.toFixed(2)
      : rows.length
        ? (rows.reduce((sum, row) => sum + row.pct, 0) / rows.length).toFixed(2)
        : "0.00";

  useEffect(() => {
    if (!selected) return undefined;
    const controller = new AbortController();
    const loadDetails = async () => {
      setModalLoading(true);
      setModalError("");
      setDeviceDetails(null);
      setSchedule([]);
      setIsScheduleExpanded(false);
      setScheduleTooltip(null);
      const unitName = selected.id;
      const vid = String(
        filters.vid ??
        filters.VID ??
        sessionStorage.getItem("vid") ??
        localStorage.getItem("vid") ??
        "52",
      );
      try {
        const [deviceResponse, scheduleResponse] = await Promise.all([
          axios.post(
            DEVICE_API,
            { uniqueid: unitName },
            { headers: tokenHeaders(), signal: controller.signal },
          ),
          axios.post(
            SCHEDULE_API,
            { vid, unitname: unitName },
            { headers: tokenHeaders(), signal: controller.signal },
          ),
        ]);
        const devicePayload = unwrap(deviceResponse.data);
        const schedulePayload = unwrap(scheduleResponse.data);
        const details = flatten(
          devicePayload?.deviceHealthStatus ??
          devicePayload?.DeviceHealthStatus,
        );
        const scheduleRows = flatten(
          schedulePayload?.healthTrackerScheduleChart ??
          schedulePayload?.HealthTrackerScheduleChart ??
          schedulePayload?.scheduleChart,
        );
        setDeviceDetails(
          details.find(
            (item) =>
              String(
                item?.UniqueID ?? item?.uniqueid ?? item?.UniqueId ?? "",
              ).toLowerCase() === unitName.toLowerCase(),
          ) ??
          details[0] ??
          null,
        );
        setSchedule(scheduleRows);
        if (!details.length && !scheduleRows.length)
          setModalError(
            "No device details or schedule data were returned for this device.",
          );
      } catch (error) {
        if (!controller.signal.aborted && !axios.isCancel(error))
          setModalError(
            `${error.response?.data?.message || error.message || "Unable to load device details"}. Check API access, CORS, and authentication.`,
          );
      } finally {
        if (!controller.signal.aborted) setModalLoading(false);
      }
    };
    loadDetails();
    return () => controller.abort();
  }, [selected, filters.vid, filters.VID]);

  // Use the same shared Excel/PDF utilities as Historical Reports.
  // Append one Total row after the exported detail rows.
  const exportRows = useMemo(() => {
    const detailRows = visibleApiRows.map(({ row }) => ({
      ...row,
    }));

    // Append Total only when the backend provides it.
    if (totalRow) {
      detailRows.push({ ...totalRow });
    }

    return detailRows;
  }, [visibleApiRows, totalRow]);

  // const exportRows = useMemo(() => {
  //   const detailRows = filteredRows.map((row) => ({
  //     Date: formatDate(row.date),
  //     "Unique ID": row.id,
  //     "Online Hours": row.online,
  //     "Offline Hours": row.offline,
  //     "Internet Down Hours": row.internetDown,
  //     "Online %": `${row.pct.toFixed(2)}%`,
  //     Status: row.status,
  //   }));

  //   detailRows.push({
  //     Date: "Total",
  //     "Unique ID": "",
  //     "Online Hours": totalOnline,
  //     "Offline Hours": totalOffline,
  //     "Internet Down Hours": totalInternet,
  //     "Online %": `${totalPct}%`,
  //     Status: "",
  //   });
  //   return detailRows;
  // }, [filteredRows, totalOnline, totalOffline, totalInternet, totalPct]);

  // Match Historical Reports filename behavior:
  // same day => HealthReport_DD-MM-YYYY
  // date range => HealthReport_DD-MM-YYYY_to_DD-MM-YYYY
  const getExportDateRange = () => {
    const from =
      filters.FromDateTime ??
      filters.fromDateTime ??
      filters.from ??
      filters.FromDate ??
      filters.fromDate;
    const to =
      filters.ToDateTime ??
      filters.toDateTime ??
      filters.to ??
      filters.ToDate ??
      filters.toDate;

    const formatDateForFilename = (value) => {
      if (!value) return "";
      const raw = String(value).trim();
      const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) {
        const [, year, month, day] = isoMatch;
        return `${day}-${month}-${year}`;
      }
      const localMatch = raw.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
      if (localMatch) {
        const [, day, month, year] = localMatch;
        return `${day}-${month}-${year}`;
      }
      return "";
    };

    const fromDate = formatDateForFilename(from || filters.fromDate || rows[0]?.date);
    const toDate = formatDateForFilename(to || filters.toDate || filters.fromDate || rows[0]?.date);
    if (!fromDate && !toDate) return "";
    if (!fromDate) return `_${toDate}`;
    if (!toDate || fromDate === toDate) return `_${fromDate}`;
    return `_${fromDate}_to_${toDate}`;
  };
  const exportFileName = `HealthReport${getExportDateRange()}`;
  const exportMetadata = {
    reportName: "Health Report",
    dateRange: `${fromDate} ${fromTime}:00 - ${toDate} ${toTime}:59`,
    user: sessionStorage.getItem("username") || sessionStorage.getItem("Username") || "Occupancy",
  };

  const closeModal = () => {
    setSelected(null);
    setDeviceDetails(null);
    setSchedule([]);
    setModalError("");
  };
  const handleBack = () =>
    typeof onBack === "function" ? onBack() : window.history.back();
  const kpi = deviceDetails || {};
  // Normalize API reasons so "InternetDown", "internet down", and
  // "Internet_Down" are displayed as one row. Unknown API reasons are retained.
  const normalizeScheduleReason = (value) => {
    const raw = String(value ?? "No Info").trim();
    const compact = raw.toLowerCase().replace(/[\s_-]+/g, "");
    if (compact === "online") return "Online";
    if (compact === "offline") return "Offline";
    if (
      ["internetdown", "internetdisconnected", "internetlost"].includes(compact)
    )
      return "Internet Down";
    if (["noinfo", "unknown", ""].includes(compact)) return "No Info";
    return raw;
  };
  const defaultScheduleColor = (reason) => {
    const normalized = String(reason).toLowerCase();
    if (normalized === "online") return "#2eaa7d";
    if (normalized === "offline") return "#397df6";
    if (normalized === "internet down") return "#f59e0b";
    if (normalized === "no info") return "#8b5cf6";
    return "#64748b";
  };
  const timelineBars = schedule.map((item, index) => {
    const startValue = item?.StartTime ?? item?.startTime ?? item?.starttime;
    const endValue = item?.EndTime ?? item?.endTime ?? item?.endtime;
    const reason = normalizeScheduleReason(item?.Reason ?? item?.reason);
    return {
      ...item,
      index,
      startValue,
      endValue,
      time: formatScheduleTime(startValue),
      reason,
      reasonKey: reason.toLowerCase(),
      duration: getScheduleInterval(startValue, endValue),
      color: item?.Color ?? item?.color ?? defaultScheduleColor(reason),
    };
  });
  const scheduleReasons = Array.from(
    new Set(timelineBars.map((item) => item.reason)),
  );
  const scheduleLabelInterval = getScheduleLabelInterval(14);
  const showScheduleTooltip = useCallback((event, item) => {
    setScheduleTooltip({
      x: event.clientX,
      y: event.clientY,
      start: formatScheduleTime(item.startValue),
      end: formatScheduleTime(item.endValue),
      reason: item.reason,
      color: item.color,
    });
  }, []);
  const moveScheduleTooltip = useCallback((event) => {
    setScheduleTooltip((previous) =>
      previous ? { ...previous, x: event.clientX, y: event.clientY } : null,
    );
  }, []);
  const hideScheduleTooltip = useCallback(() => setScheduleTooltip(null), []);
  const renderScheduleBars = (filterFn) => (
    <div className="health-report-schedule-bars-row">
      {timelineBars.map((item) => (
        <div
          key={`${item.index}-${item.startValue}`}
          className="health-report-schedule-bar"
          style={{
            backgroundColor: filterFn(item) ? item.color : "transparent",
          }}
          onMouseEnter={(event) => showScheduleTooltip(event, item)}
          onMouseMove={moveScheduleTooltip}
          onMouseLeave={hideScheduleTooltip}
          title={`${item.startValue} – ${item.endValue} · ${item.reason}`}
          aria-label={`${item.startValue} to ${item.endValue}: ${item.reason}`}
        />
      ))}
    </div>
  );
  const renderScheduleAxis = () => (
    <div className="health-report-schedule-axis-row">
      {timelineBars.map((item, index) =>
        index % scheduleLabelInterval === 0 ? (
          <span
            key={`${item.index}-label`}
            style={{
              left: `${timelineBars.length > 1 ? ((index + 0.5) / timelineBars.length) * 100 : 0}%`,
            }}
          >
            {item.time}
          </span>
        ) : null,
      )}
    </div>
  );

  return (
    <>
      {scheduleTooltip && selected && (
        <div
          ref={scheduleTooltipRef}
          className="health-report-schedule-tooltip"
          style={{ left: scheduleTooltip.x + 12, top: scheduleTooltip.y - 58 }}
        >
          <span
            className="health-report-schedule-tooltip-dot"
            style={{ backgroundColor: scheduleTooltip.color }}
          />
          <div>
            <strong>
              {scheduleTooltip.start} – {scheduleTooltip.end}
            </strong>
            <span>{scheduleTooltip.reason}</span>
          </div>
        </div>
      )}
      <div className="health-report-page">
        <header className="health-report-header">
          <div className="health-report-header-title">
            <h1>Health Reports</h1>
          </div>
        </header>
        <main className="health-report-main">
          <section className="health-report-summary health-report-card">
            <div className="health-report-summary-item health-report-period-item">
              <span className="health-report-summary-icon">
                <FiCalendar />
              </span>
              <div>
                <small>Selected Period</small>
                <strong>
                  {fromDate} {fromTime}:00 - {toDate} {toTime}:59
                </strong>
              </div>
            </div>
            <div className="health-report-summary-item health-report-zones-item">
              <span className="health-report-summary-icon">
                <FiMapPin />
              </span>
              <div>
                <small>Selected Zones</small>
                <strong title={zones}>{zones}</strong>
              </div>
            </div>
            <button
              type="button"
              className="health-report-back"
              onClick={handleBack}
            >
              <FiArrowLeft /> Back to Filters
            </button>
          </section>

          <section className="health-report-charts">
            <article className="health-report-card health-report-chart-card">
              <div className="health-report-card-title">
                <div>
                  <h2>
                    <FiActivity /> Online vs Offline Hours
                  </h2>
                  <p className="health-report-chart-subtitle">
                    {isMonthlyHoursView ? "Monthly online and offline hours" : "Daily online and offline hours"}
                    {shouldShowExpandHoursChart && !isHoursChartExpanded ? " · Latest 7 shown" : ""}
                  </p>
                </div>
                <div className="health-report-hours-chart-actions">
                  <small>Hours</small>
                  {shouldShowExpandHoursChart && (
                    <button
                      type="button"
                      className="health-report-chart-expand"
                      onClick={() => setIsHoursChartModalOpen(true)}
                      aria-haspopup="dialog"
                    >
                      {isMonthlyHoursView ? "Expand all months" : "Expand all days"}
                    </button>
                  )}
                </div>
              </div>
              <div className="health-report-chart">
                {barData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      margin={{ top: 20, right: 16, left: 8, bottom: 8 }}
                      barGap={10}
                      barCategoryGap="35%"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5edf7"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: "#526581" }}
                        tickLine={false}
                        axisLine={{ stroke: "#d7e2f0" }}
                      />
                      <YAxis
                        domain={[0, yMax]}
                        tick={{ fontSize: 12, fill: "#526581" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<HoursTooltip />} cursor={false} />
                      <Bar
                        dataKey="Online"
                        name="Online"
                        fill={ONLINE_COLOR}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={72}
                        isAnimationActive={false}
                      />
                      <Bar
                        dataKey="Offline"
                        name="Offline"
                        fill={OFFLINE_COLOR}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={72}
                        isAnimationActive={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="health-report-chart-empty">
                    No chart data available.
                  </div>
                )}
              </div>
              <div className="health-report-chart-checkbox-legend">
                <label className="health-report-legend-option online">
                  <input
                    type="checkbox"
                    checked={showOnline}
                    onChange={(e) => setShowOnline(e.target.checked)}
                  />
                  <span className="legend-swatch" />
                  <span>Online</span>
                </label>
                <label className="health-report-legend-option offline">
                  <input
                    type="checkbox"
                    checked={showOffline}
                    onChange={(e) => setShowOffline(e.target.checked)}
                  />
                  <span className="legend-swatch" />
                  <span>Offline</span>
                </label>
              </div>
            </article>

            <article className="health-report-card health-report-chart-card">
              <div className="health-report-card-title">
                <h2>
                  <FiPieChart /> Online vs Offline Status
                </h2>
              </div>
              <div className="health-report-status-chart">
                <div className="health-report-pie">
                  {percentageSummary.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          outerRadius="88%"
                          stroke="#fff"
                          strokeWidth={2}
                          isAnimationActive={false}
                          labelLine={false}
                          label={({ percent }) =>
                            percent > 0.07
                              ? `${(percent * 100).toFixed(1)}%`
                              : ""
                          }
                        >
                          {pieData.map((item) => (
                            <Cell key={item.name} fill={item.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<PercentTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="health-report-chart-empty">
                      No chart data available.
                    </div>
                  )}
                </div>
                <div className="health-report-legend">
                  {[
                    { name: "Online", value: onlinePct, color: ONLINE_COLOR },
                    {
                      name: "Offline",
                      value: offlinePct,
                      color: OFFLINE_COLOR,
                    },
                  ].map((item) => (
                    <div key={item.name}>
                      <i style={{ background: item.color }} />
                      <span>{item.name}</span>
                      <strong>{item.value.toFixed(2)}%</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="health-report-chart-checkbox-legend pie-legend">
                <label className="health-report-legend-option online">
                  <input
                    type="checkbox"
                    checked={showPieOnline}
                    onChange={(e) => setShowPieOnline(e.target.checked)}
                  />
                  <span className="legend-swatch" />
                  <span>Online</span>
                </label>
                <label className="health-report-legend-option offline">
                  <input
                    type="checkbox"
                    checked={showPieOffline}
                    onChange={(e) => setShowPieOffline(e.target.checked)}
                  />
                  <span className="legend-swatch" />
                  <span>Offline</span>
                </label>
              </div>
            </article>
          </section>

          <section className="health-report-card health-report-table-card">
            <div className="health-report-table-toolbar">
              <div className="health-report-table-heading">
                <FiBarChart2 />
                <h2>Report Data</h2>
                <span>{visibleApiRows.length} records</span>
              </div>
              <div className="health-report-tools">
                <button
                  type="button"
                  className="health-report-export excel"
                  onClick={() =>
                    downloadExcel(exportRows, exportFileName, exportMetadata.reportName, {
                      dateRange: exportMetadata.dateRange,
                      user: exportMetadata.user,
                    })
                  }
                >
                  <FiDownload /> Excel
                </button>
                <button
                  type="button"
                  className="health-report-export pdf"
                  onClick={() => downloadPDF(exportRows, exportFileName, exportMetadata)}
                >
                  <FiDownload /> PDF
                </button>
                <label className="health-report-search">
                  <FiSearch />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Unique ID..."
                  />
                </label>
              </div>
            </div>

            <div className="health-report-table-scroll">
              <table className="health-report-table">
                <thead>
                  <tr>
                    {apiGridColumns.map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                    {showViewColumn && <th>View</th>}
                  </tr>
                </thead>

                <tbody>
                  {visibleApiRows.map(({ row, index }) => {
                    const normalizedRow = rows.find((item) => item.index === index) ??
                      normalizeGridRow(row, index, filters.fromDate || "");

                    return (
                      <tr
                        key={`api-row-${index}`}
                        className={showViewColumn ? "health-report-clickable-row" : ""}
                        onClick={showViewColumn ? () => setSelected(normalizedRow) : undefined}
                      >
                        {apiGridColumns.map((column) => (
                          <td key={column}>
                            {row[column] === null || row[column] === undefined || row[column] === ""
                              ? "—"
                              : (["DATE", "Date", "ReportDate"].includes(column) &&
                                  /^\d{4}-\d{2}-\d{2}$/.test(String(row[column]).trim())
                                  ? (() => {
                                      const [year, month, day] = String(row[column]).trim().split("-");
                                      return `${day}-${month}-${year}`;
                                    })()
                                  : String(row[column]))}
                          </td>
                        ))}
                        {showViewColumn && (
                          <td>
                            <button
                              type="button"
                              className="health-report-view"
                              aria-label={`View details for ${normalizedRow.id}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelected(normalizedRow);
                              }}
                            >
                              <FiEye />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}

                  {!visibleApiRows.length && (
                    <tr>
                      <td
                        colSpan={Math.max(apiGridColumns.length + (showViewColumn ? 1 : 0), 1)}
                        className="health-report-empty"
                      >
                        {payload?.success === false
                          ? "Unable to load health report data."
                          : "No health report data found for the selected filters."}
                      </td>
                    </tr>
                  )}
                </tbody>

                {totalRow && (
                  <tfoot>
                    <tr className="health-report-total-row">
                      {apiGridColumns.map((column) => (
                        <td key={column}>
                          {totalRow[column] === null ||
                          totalRow[column] === undefined ||
                          totalRow[column] === ""
                            ? ""
                            : (["DATE", "Date", "ReportDate"].includes(column) &&
                                /^\d{4}-\d{2}-\d{2}$/.test(String(totalRow[column]).trim())
                                ? (() => {
                                    const [year, month, day] = String(totalRow[column]).trim().split("-");
                                    return `${day}-${month}-${year}`;
                                  })()
                                : String(totalRow[column]))}
                        </td>
                      ))}
                      {showViewColumn && <td>—</td>}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </section>
        </main>

        {isHoursChartModalOpen && (
          <div
            className="health-report-modal-bg health-report-hours-modal-bg"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setIsHoursChartModalOpen(false);
              }
            }}
          >
            <section
              className="health-report-modal health-report-hours-modal"
              role="dialog"
              aria-modal="true"
              aria-label={isMonthlyHoursView ? "All monthly online and offline hours" : "All daily online and offline hours"}
            >
              <header className="health-report-modal-header">
                <div>
                  <span className="health-report-modal-icon"><FiActivity /></span>
                  <div>
                    <h2>Online vs Offline Hours</h2>
                    <p>{isMonthlyHoursView ? "All months in the selected period" : "All days in the selected period"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHoursChartModalOpen(false)}
                  aria-label="Close chart"
                >
                  <FiX />
                </button>
              </header>

              <div className="health-report-hours-modal-chart">
                {allHoursChartData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={allHoursChartData}
                      margin={{ top: 20, right: 24, left: 8, bottom: 18 }}
                      barGap={8}
                      barCategoryGap={isMonthlyHoursView ? "28%" : "18%"}
                      cursor={false}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5edf7" vertical={false} />
                      <XAxis
                        dataKey="name"
                        interval={0}
                        angle={allHoursChartData.length > 15 ? -45 : 0}
                        textAnchor={allHoursChartData.length > 15 ? "end" : "middle"}
                        height={allHoursChartData.length > 15 ? 80 : 40}
                        tick={{ fontSize: 11, fill: "#526581" }}
                        tickLine={false}
                        axisLine={{ stroke: "#d7e2f0" }}
                      />
                      <YAxis
                        domain={[0, fullChartYMax]}
                        tick={{ fontSize: 11, fill: "#526581" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<HoursChartTooltip />} cursor={false} wrapperStyle={{ zIndex: 1300, outline: "none" }} />
                      <Legend verticalAlign="bottom" align="center" iconType="rect" iconSize={12} wrapperStyle={{ paddingTop: 12, fontSize: 12, color: "#526581" }} />
                      <Bar dataKey="Online" name="Online" fill={ONLINE_COLOR} radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Offline" name="Offline" fill={OFFLINE_COLOR} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="health-report-empty">No chart data found for the selected period.</div>
                )}
              </div>
            </section>
          </div>
        )}

        {selected && (
          <div
            className="health-report-modal-bg"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
          >
            <section
              className="health-report-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Device health details"
            >
              <header className="health-report-modal-header">
                <div className="health-report-modal-title">
                  <span className="health-report-modal-icon">
                    <FiActivity />
                  </span>
                  <div>
                    <h2>
                      {selected.id} <span>({formatDate(selected.date)})</span>
                    </h2>
                  </div>
                </div>
                <button type="button" onClick={closeModal} aria-label="Close">
                  <FiX />
                </button>
              </header>
              <div className="health-report-kpis">
                <article className="health-report-kpi green">
                  <FiLogIn />
                  <strong>{kpi.TotalIn ?? kpi.totalIn ?? "—"}</strong>
                  <span>Visitors In</span>
                </article>
                <article className="health-report-kpi red">
                  <FiLogOut />
                  <strong>{kpi.TotalOut ?? kpi.totalOut ?? "—"}</strong>
                  <span>Visitors Out</span>
                </article>
                <article className="health-report-kpi amber">
                  <FiClock />
                  <strong>{kpi.ProcessTime ?? kpi.processTime ?? "—"}</strong>
                  <span>Process Time</span>
                </article>
                <article className="health-report-kpi blue">
                  <FiWifi />
                  <strong>
                    {kpi.MacAddress ?? kpi.MACAddress ?? kpi.macAddress ?? "—"}
                  </strong>
                  <span>MAC Address</span>
                </article>
              </div>
              <section className="health-report-schedule-section">
                <div className="health-report-schedule-heading">
                  <h3>
                    <FiCalendar /> Device Schedule Chart
                  </h3>
                  <div className="health-report-schedule-legend">
                    {scheduleReasons.map((reason) => {
                      const item = timelineBars.find(
                        (entry) => entry.reason === reason,
                      );
                      return (
                        <span key={reason}>
                          <i
                            style={{
                              backgroundColor: item?.color || "#4361ee",
                            }}
                          />
                          {reason}
                        </span>
                      );
                    })}
                  </div>
                </div>
                {modalLoading ? (
                  <div className="health-report-modal-state">
                    Loading device details and schedule…
                  </div>
                ) : timelineBars.length ? (
                  <div className="health-report-schedule-chart-shell">
                    <div className="health-report-schedule-labels-col">
                      <button
                        type="button"
                        className="health-report-schedule-row-label clickable"
                        onClick={() => setIsScheduleExpanded((value) => !value)}
                        aria-expanded={isScheduleExpanded}
                      >
                        Status
                      </button>
                      {isScheduleExpanded &&
                        scheduleReasons.map((reason) => (
                          <div
                            key={reason}
                            className="health-report-schedule-row-label"
                          >
                            {reason}
                          </div>
                        ))}
                      <div className="health-report-schedule-axis-spacer-label" />
                    </div>
                    <div className="health-report-schedule-scroll-area">
                      <div className="health-report-schedule-scroll-inner">
                        {renderScheduleBars(() => true)}
                        {isScheduleExpanded &&
                          scheduleReasons.map((reason) => (
                            <React.Fragment key={reason}>
                              {renderScheduleBars(
                                (item) =>
                                  item.reasonKey === reason.toLowerCase(),
                              )}
                            </React.Fragment>
                          ))}
                        {renderScheduleAxis()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="health-report-modal-state">
                    {modalError ||
                      "No schedule data is available for this device."}
                  </div>
                )}
              </section>
              {modalError && !modalLoading && (
                <p className="health-report-api-error">{modalError}</p>
              )}
              <div className="health-report-modal-note">
                <FiActivity />
                <span>
                  Hover over an interval to view its start time, end time, and
                  status. Select “Status” to expand rows by schedule reason.
                </span>
              </div>
              <footer className="health-report-modal-bottom">
                <span>
                  {deviceDetails?.DeviceStatus ??
                    deviceDetails?.deviceStatus ??
                    "Device details"}
                </span>
                <button type="button" onClick={closeModal}>
                  Close
                </button>
              </footer>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
