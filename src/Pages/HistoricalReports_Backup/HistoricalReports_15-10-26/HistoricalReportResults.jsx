import React, { useMemo, useState } from "react";
import {
  FileText,
  CalendarDays,
  MapPin,
  Activity,
  BarChart3,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from "recharts";
import "./HistoricalReportResults.css";
import { downloadExcel } from "../../CommonComponents/DownloadExcel";
import { downloadPDF } from "../../CommonComponents/DownloadPdf";
const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};
// Format API date strings without shifting the date through the browser timezone.
const formatDate = (value, includeTime = false, yearDigits = 4) => {
  if (value === undefined || value === null || value === "") return "—";
  const raw = String(value).trim().replace("T", " ");
  const match = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (!match) return raw;
  const [, year, month, day, hour, minute, second] = match;
  const shortYear = yearDigits === 2 ? year.slice(-2) : year;
  const date = `${day}-${month}-${shortYear}`;
  if (!includeTime || hour === undefined) return date;
  return `${date} ${hour}:${minute || "00"}${second !== undefined ? `:${second}` : ""}`;
};
const titleCaseReportType = (value) => {
  const normalized = String(value || "Historical")
    .trim()
    .toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};
const getSelectedZonesText = (criteria, reportData) => {
  const value =
    criteria?.ZoneName ??
    criteria?.zoneName ??
    criteria?.ZoneNames ??
    criteria?.zoneNames ??
    reportData?.selectedZones ??
    reportData?.ZoneName;
  if (Array.isArray(value))
    return (
      value
        .map((zone) =>
          typeof zone === "string"
            ? zone
            : (zone?.ZoneName ?? zone?.zone ?? zone?.name),
        )
        .filter(Boolean)
        .join(", ") || "All zones"
    );
  if (typeof value === "string" && value.trim()) return value;
  return "All zones";
};
const REPORT_PERIOD_CONFIG = {
  daywise: { key: "ReportDate", label: "Date" },
  hourwise: { key: "HourStart", label: "Hour" },
  weekwise: { key: "Week", label: "Week" },
  monthwise: { key: "Month", label: "Month" },
  yearwise: { key: "Year", label: "Year" },
};
const getPeriodConfig = (reportData, criteria) => {
  const reportType = String(
    reportData?.reportType || criteria?.reportType || "daywise",
  )
    .toLowerCase()
    .trim();
  return REPORT_PERIOD_CONFIG[reportType] || REPORT_PERIOD_CONFIG.daywise;
};
const isTotalValue = (value) =>
  typeof value === "string" && value.trim().toLowerCase().startsWith("total");
const getPeriodValue = (row, config) => {
  if (!row) return null; // Prefer the configured field for the selected report type.
  const configuredValue = row[config.key];
  if (
    configuredValue !== undefined &&
    configuredValue !== null &&
    String(configuredValue).trim() !== ""
  ) {
    return configuredValue;
  } // Fallbacks are useful when the API uses a slightly different field name.
  return (
    row.HourStart ??
    row.ReportDate ??
    row.DateTime ??
    row.Date ??
    row.Hour ??
    row.Week ??
    row.Month ??
    row.Year ??
    null
  );
};
const formatPeriodValue = (value, config) => {
  if (value === undefined || value === null || value === "") return "—";
  if (config.key === "HourStart") return formatDate(value, true, 2);
  if (config.key === "ReportDate") return formatDate(value, false, 2);
  return String(value);
};
const formatDateTime = (row, config) =>
  formatPeriodValue(getPeriodValue(row, config), config);
const isTotalRow = (row, config) => {
  if (!row) return false;
  const configuredValue = row[config.key];
  if (isTotalValue(configuredValue)) return true; // Some APIs use Hour: "Total" for totals regardless of report type.
  return isTotalValue(row.Hour);
};
const getPeriodText = (criteria) => {
  if (!criteria) return "—";
  const from =
    criteria.FromDateTime ||
    criteria.fromDateTime ||
    criteria.from ||
    criteria.FromDate ||
    criteria.fromDate;
  const to =
    criteria.ToDateTime ||
    criteria.toDateTime ||
    criteria.to ||
    criteria.ToDate ||
    criteria.toDate;
  if (!from && !to) return "—";
  const formatRangeDate = (value) => {
    if (!value) return "—";
    const raw = String(value).trim().replace("T", " ");
    const match = raw.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/,
    );
    if (!match) return raw;
    const [, year, month, day, hour, minute, second] = match;
    return `${day}-${month}-${year} ${hour ?? "00"}:${minute ?? "00"}:${second ?? "00"}`;
  };
  return `${formatRangeDate(from)} - ${formatRangeDate(to)}`;
};
const downloadCsv = (rows, config) => {
  const columns = [
    [config.label, (row) => formatDateTime(row, config)],
    ["Zone Name", (row) => row.ZoneName ?? ""],
    ["In Count", (row) => row.InCount ?? 0],
    ["Out Count", (row) => row.OutCount ?? 0],
    ["Occupancy", (row) => row.Occupancy ?? 0],
  ];
  const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [
    columns.map(([label]) => escapeCsv(label)).join(","),
    ...rows.map((row) =>
      columns.map(([, getValue]) => escapeCsv(getValue(row))).join(","),
    ),
  ].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "historical-report.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
function ChartSeriesToggles({ visible, onToggle }) {
  return (
    <div
      className="hrr-chart-legend-controls"
      aria-label="Chart series visibility"
    >
      <label className="hrr-chart-legend-option hrr-chart-legend-in">
        <input
          type="checkbox"
          checked={visible.InCount}
          onChange={(event) => onToggle("InCount", event.target.checked)}
          aria-label="Show In Count"
        />
        <span className="hrr-legend-dot" aria-hidden="true" />
        <span className="hrr-legend-label">In Count</span>
      </label>
      <label className="hrr-chart-legend-option hrr-chart-legend-out">
        <input
          type="checkbox"
          checked={visible.OutCount}
          onChange={(event) => onToggle("OutCount", event.target.checked)}
          aria-label="Show Out Count"
        />
        <span className="hrr-legend-dot" aria-hidden="true" />
        <span className="hrr-legend-label">Out Count</span>
      </label>
      <label className="hrr-chart-legend-option hrr-chart-legend-occupancy">
        <input
          type="checkbox"
          checked={visible.Occupancy}
          onChange={(event) => onToggle("Occupancy", event.target.checked)}
          aria-label="Show Occupancy"
        />
        <span className="hrr-legend-dot" aria-hidden="true" />
        <span className="hrr-legend-label">Occupancy</span>
      </label>
    </div>
  );
}
const METRIC_COLORS = {
  InCount: "#36A879",
  OutCount: "#E87979",
  Occupancy: "#6C8FE8",
};
const formatTooltipPeriod = (value) => {
  if (value === undefined || value === null || value === "") return "—";
  const raw = String(value).replace("T", " ");
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (match) {
    const [, year, month, day, hour, minute] = match;
    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour || 0),
      Number(minute || 0),
    );
    const datePart = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return hour ? `${datePart} ${hour}:${minute || "00"}` : datePart;
  }
  return raw;
};
function TrendTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload || {};
  const metrics = [
    ["In Count", point.InCount, METRIC_COLORS.InCount],
    ["Out Count", point.OutCount, METRIC_COLORS.OutCount],
    ["Occupancy", point.Occupancy, METRIC_COLORS.Occupancy],
  ];
  return (
    <div className="hrr-custom-tooltip hrr-trend-tooltip">
      <div className="hrr-tooltip-heading">
        {formatTooltipPeriod(point.time)}
      </div>
      <div className="hrr-tooltip-metrics">
        {metrics.map(([label, value, color]) => (
          <div className="hrr-tooltip-row" key={label}>
            <span className="hrr-tooltip-label">
              <i style={{ backgroundColor: color }} />
              {label}
            </span>
            <strong>{toNumber(value).toLocaleString()}</strong>
          </div>
        ))}
      </div>
      <div className="hrr-tooltip-bottom-border" />
    </div>
  );
}
function ZoneTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload || {};
  const zone = String(point.zone || "Unknown");
  const metrics = [
    ["In Count", point.InCount, METRIC_COLORS.InCount],
    ["Out Count", point.OutCount, METRIC_COLORS.OutCount],
    ["Occupancy", point.Occupancy, METRIC_COLORS.Occupancy],
  ];
  return (
    <div className="hrr-custom-tooltip hrr-zone-tooltip">
      <div className="hrr-tooltip-heading">Zone Information</div>
      <div className="hrr-tooltip-metrics">
        {metrics.map(([label, value, color]) => (
          <div className="hrr-tooltip-row" key={label}>
            <span className="hrr-tooltip-label">
              <i style={{ backgroundColor: color }} />
              {label}
            </span>
            <strong>{toNumber(value).toLocaleString()}</strong>
          </div>
        ))}
      </div>
      <div className="hrr-tooltip-zone-name" title={zone}>
        {zone}
      </div>
      <div className="hrr-tooltip-bottom-border" />
    </div>
  );
}
// const formatAxisPeriod = (value, config) => {
//   const text = String(value ?? "");
//   if (config.key === "HourStart") return text.replace("T", " ").slice(0, 10);
//   return text.length > 18 ? `${text.slice(0, 15)}…` : text;
// };
const formatAxisPeriod = (value, config) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }
  const text = String(value).trim();
  // Hourwise: formatted values may look like 15-10-26 09:00
  if (config.key === "HourStart") {
    const match = text.match(/^(\d{2})-(\d{2})-(\d{2,4})/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3].slice(-2)}`;
    }
    return text;
  }
  // Daywise: DD-MM-YY
  if (config.key === "ReportDate") {
    return text;
  }
  return text.length > 18 ? `${text.slice(0, 15)}…` : text;
};
function ZoneChartView({ data, visible, onToggle, expanded = false }) {
  const rowHeight = expanded ? 34 : 46;
  const chartHeight = expanded ? Math.max(300, data.length * rowHeight + 34) : Math.max(250, data.length * rowHeight + 30);
  const axisWidth = expanded ? 150 : 112;
  const formatZoneLabel = (value) => {
    const label = String(value ?? "");
    const maxLength = expanded ? 22 : 16;
    return label.length > maxLength ? `${label.slice(0, maxLength - 1)}…` : label;
  };
  return (
    <div className={expanded ? "hrr-zone-chart-scroll hrr-zone-chart-scroll-expanded" : "hrr-zone-chart-scroll hrr-zone-chart-scroll-compact"}>
      <div className="hrr-zone-chart-canvas" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 34, left: 0, bottom: 8 }}
            barGap={2}
            barCategoryGap={expanded ? "18%" : "16%"}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical stroke="#e6edf7" />
            <XAxis
              type="number"
              domain={[0, "dataMax + 20"]}
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="zone"
              width={axisWidth}
              tickFormatter={formatZoneLabel}
              tick={{ fontSize: expanded ? 11 : 10, fill: "#526783" }}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <Tooltip content={<ZoneTooltip />} cursor={{ fill: "#f3f7fd" }} />
            {visible.InCount && (
              <Bar dataKey="InCount" name="In Count" fill={METRIC_COLORS.InCount} radius={[0, 3, 3, 0]} maxBarSize={expanded ? 10 : 11}>
                <LabelList dataKey="InCount" position="right" formatter={(value) => toNumber(value).toLocaleString()} style={{ fontSize: 9, fill: "#526783" }} />
              </Bar>
            )}
            {visible.OutCount && (
              <Bar dataKey="OutCount" name="Out Count" fill={METRIC_COLORS.OutCount} radius={[0, 3, 3, 0]} maxBarSize={expanded ? 10 : 11}>
                <LabelList dataKey="OutCount" position="right" formatter={(value) => toNumber(value).toLocaleString()} style={{ fontSize: 9, fill: "#526783" }} />
              </Bar>
            )}
            {visible.Occupancy && (
              <Bar dataKey="Occupancy" name="Occupancy" fill={METRIC_COLORS.Occupancy} radius={[0, 3, 3, 0]} maxBarSize={expanded ? 10 : 11}>
                <LabelList dataKey="Occupancy" position="right" formatter={(value) => toNumber(value).toLocaleString()} style={{ fontSize: 9, fill: "#526783" }} />
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
export default function HistoricalReportResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const reportData = location.state?.reportData;
  const criteria = location.state?.criteria;
  const periodConfig = getPeriodConfig(reportData, criteria);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedChart, setExpandedChart] = useState(null);
  const [zoneLimit, setZoneLimit] = useState("all");
  const [visibleTrend, setVisibleTrend] = useState({
    InCount: true,
    OutCount: true,
    Occupancy: true,
  });
  const [visibleZone, setVisibleZone] = useState({
    InCount: true,
    OutCount: true,
    Occupancy: true,
  });
  const toggleSeries = (setter, key, checked) => {
    setter((current) => ({ ...current, [key]: checked }));
  };
  const [sort, setSort] = useState({
    key: periodConfig.key,
    direction: "asc",
  });
  const rawGrid = Array.isArray(reportData?.grid) ? reportData.grid : [];
  const rows = useMemo(
    () => rawGrid.filter((row) => row && !isTotalRow(row, periodConfig)),
    [rawGrid, periodConfig],
  );
  const totals = useMemo(() => {
    const totalRow = rawGrid.find((row) => isTotalRow(row, periodConfig));
    const source = totalRow
      ? {
          InCount: totalRow.InCount,
          OutCount: totalRow.OutCount,
          Occupancy: totalRow.Occupancy,
        }
      : rows.reduce(
          (acc, row) => ({
            InCount: acc.InCount + toNumber(row.InCount),
            OutCount: acc.OutCount + toNumber(row.OutCount),
            Occupancy: acc.Occupancy + toNumber(row.Occupancy),
          }),
          { InCount: 0, OutCount: 0, Occupancy: 0 },
        );
    return {
      inCount: toNumber(source.InCount),
      outCount: toNumber(source.OutCount),
      occupancy: toNumber(source.Occupancy),
      zones: new Set(rows.map((row) => row.ZoneName).filter(Boolean)).size,
    };
  }, [rawGrid, rows, periodConfig]);
  const chartData = useMemo(() => {
    const graph = Array.isArray(reportData?.graph) ? reportData.graph : [];
    const graphRows = graph.length > 0 ? graph : rows;
    const byPeriod = new Map();
    graphRows.forEach((row) => {
      if (!row || isTotalRow(row, periodConfig)) return;
      const periodValue = getPeriodValue(row, periodConfig);
      if (
        periodValue === undefined ||
        periodValue === null ||
        String(periodValue).trim() === "" ||
        isTotalValue(periodValue)
      ) {
        return;
      } // Exclude summary rows with an empty ZoneName when the API provides ZoneName.
      if (
        Object.prototype.hasOwnProperty.call(row, "ZoneName") &&
        !String(row.ZoneName ?? "").trim()
      ) {
        return;
      }
      const key = String(periodValue);
      const current = byPeriod.get(key) || {
        time: formatPeriodValue(periodValue, periodConfig),
        InCount: 0,
        OutCount: 0,
        Occupancy: 0,
      };
      current.InCount += toNumber(row.InCount);
      current.OutCount += toNumber(row.OutCount);
      current.Occupancy += toNumber(row.Occupancy);
      byPeriod.set(key, current);
    });
    return [...byPeriod.entries()]
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
      .map(([, value]) => value);
  }, [reportData, rows, periodConfig]);
  const zoneChartData = useMemo(() => {
    // The API's zoneSummary is the source of truth for the zone chart.
    const summary = Array.isArray(reportData?.zoneSummary)
      ? reportData.zoneSummary
      : [];
    return summary
      .filter(
        (row) =>
          row && String(row.ZoneName ?? row.zoneName ?? row.zone ?? "").trim(),
      )
      .map((row) => ({
        ...row,
        zone: row.ZoneName ?? row.zoneName ?? row.zone ?? "Unknown",
        InCount: row.InCount,
        OutCount: row.OutCount,
        Occupancy: row.Occupancy,
      }));
  }, [reportData?.zoneSummary]);
  const compactZoneChartData = useMemo(() => zoneChartData.slice(0, 5), [zoneChartData]);
  const displayedZoneChartData = useMemo(() => {
    if (zoneLimit === "all") return zoneChartData;
    return zoneChartData.slice(0, Number(zoneLimit));
  }, [zoneChartData, zoneLimit]);
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = rows.filter((row) => {
      if (!query) return true;
      return (
        String(row.ZoneName ?? "")
          .toLowerCase()
          .includes(query) ||
        formatDateTime(row, periodConfig).toLowerCase().includes(query) ||
        String(row.InCount ?? "").includes(query) ||
        String(row.OutCount ?? "").includes(query) ||
        String(row.Occupancy ?? "").includes(query)
      );
    });
    return [...result].sort((a, b) => {
      const key = sort.key;
      const aValue =
        key === periodConfig.key ? formatDateTime(a, periodConfig) : a[key];
      const bValue =
        key === periodConfig.key ? formatDateTime(b, periodConfig) : b[key];
      let comparison;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue, undefined, {
          numeric: true,
        });
      } else {
        comparison = toNumber(aValue) - toNumber(bValue);
      }
      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [rows, search, sort, periodConfig]);
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filteredRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const toggleSort = (key) => {
    setSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };
  if (!reportData) {
    return (
      <div className="hrr-page">
        <div className="hrr-empty-state">
          <div className="hrr-empty-icon">!</div>
          <h2>No report results found</h2>
          <p>Generate a report first. The results will appear here.</p>
          <button
            className="hrr-button hrr-button-primary"
            onClick={() => navigate(-1)}
          >
            Back to Filters
          </button>
        </div>
      </div>
    );
  }
  return (
    <main className="hrr-page">
      <header className="hrr-heading">
        <div>
          <h1>Historical Reports</h1>
          {/* <div className="hrr-breadcrumb">
            Reports <span>/</span> <strong>Results</strong>
          </div> */}
        </div>
      </header>
      <section className="hrr-summary-panel">
        <div className="hrr-summary-item">
          <span className="hrr-summary-icon">
            <FileText size={20} strokeWidth={2.1} aria-hidden="true" />
          </span>
          <div>
            <small>Report Type</small>
            <strong>
              {titleCaseReportType(
                reportData.reportType || criteria?.reportType || "Historical",
              )}
            </strong>
          </div>
        </div>
        <div className="hrr-summary-item hrr-summary-period">
          <span className="hrr-summary-icon">
            <CalendarDays size={20} strokeWidth={2.1} aria-hidden="true" />
          </span>
          <div>
            <small>Selected Period</small>
            <strong>{getPeriodText(criteria)}</strong>
          </div>
        </div>
        <div className="hrr-summary-item hrr-summary-zones">
          <span className="hrr-summary-icon">
            <MapPin size={20} strokeWidth={2.1} aria-hidden="true" />
          </span>
          <div>
            <small>Selected Zones</small>
            <strong
              className="hrr-selected-zones-text"
              title={getSelectedZonesText(criteria, reportData)}
            >
              {(() => {
                const zonesText = getSelectedZonesText(criteria, reportData);
                return zonesText.length > 40
                  ? `${zonesText.slice(0, 40)}…`
                  : zonesText;
              })()}
            </strong>
          </div>
        </div>
        <div className="hrr-summary-actions">
          <button className="hrr-button" onClick={() => navigate(-1)}>
            ← Back to Filters
          </button>
          {/* Uncomment to enable CSV export:
          <button
            className="hrr-button hrr-button-primary"
            onClick={() => downloadCsv(filteredRows, periodConfig)}
          >
            ↓ Export CSV
          </button>
          */}
        </div>
      </section>
      {/* Optional KPI cards
      <section className="hrr-kpi-grid">
        <article className="hrr-kpi-card">
          <span className="hrr-kpi-icon hrr-green">↘</span>
          <div><small>Total In</small><strong>{totals.inCount.toLocaleString()}</strong></div>
        </article>
        <article className="hrr-kpi-card">
          <span className="hrr-kpi-icon hrr-red">↗</span>
          <div><small>Total Out</small><strong>{totals.outCount.toLocaleString()}</strong></div>
        </article>
        <article className="hrr-kpi-card">
          <span className="hrr-kpi-icon hrr-orange">◉</span>
          <div><small>Total Occupancy</small><strong>{totals.occupancy.toLocaleString()}</strong></div>
        </article>
        <article className="hrr-kpi-card">
          <span className="hrr-kpi-icon hrr-blue">⌖</span>
          <div><small>Zones</small><strong>{totals.zones}</strong></div>
        </article>
      </section>
      */}
      <section className="hrr-chart-grid">
        <article className="hrr-panel">
          <div className="hrr-panel-title hrr-panel-title-with-action">
            <div className="hrr-panel-title-label">
              <span className="hrr-section-icon">
                <Activity size={19} strokeWidth={2.2} aria-hidden="true" />
              </span>
              <h2>Visitor Trend</h2>
            </div>
            <button
              type="button"
              className="hrr-expand-chart-button"
              onClick={() => setExpandedChart("trend")}
              aria-label="Expand visitor trend chart"
              title="Expand chart"
            >
              <Maximize2 size={15} strokeWidth={2.2} aria-hidden="true" />
              <span>Expand</span>
            </button>
          </div>
          {chartData.length ? (
            <>
              <div className="hrr-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 12, right: 14, left: -12, bottom: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e6edf7"
                    />
                    <XAxis
                      dataKey="time"
                      tickFormatter={(value) =>
                        formatAxisPeriod(value, periodConfig)
                      }
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={22}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<TrendTooltip />} />
                    {visibleTrend.InCount && (
                      <Line
                        type="monotone"
                        dataKey="InCount"
                        name="In Count"
                        stroke={METRIC_COLORS.InCount}
                        strokeWidth={2.5}
                        dot={chartData.length === 1}
                        activeDot={{ r: 5 }}
                      />
                    )}
                    {visibleTrend.OutCount && (
                      <Line
                        type="monotone"
                        dataKey="OutCount"
                        name="Out Count"
                        stroke={METRIC_COLORS.OutCount}
                        strokeWidth={2.5}
                        dot={chartData.length === 1}
                        activeDot={{ r: 5 }}
                      />
                    )}
                    {visibleTrend.Occupancy && (
                      <Line
                        type="monotone"
                        dataKey="Occupancy"
                        name="Occupancy"
                        stroke={METRIC_COLORS.Occupancy}
                        strokeWidth={2.5}
                        dot={chartData.length === 1}
                        activeDot={{ r: 5 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <ChartSeriesToggles
                visible={visibleTrend}
                onToggle={(key, checked) =>
                  toggleSeries(setVisibleTrend, key, checked)
                }
              />
            </>
          ) : (
            <p className="hrr-chart-empty">
              No graph data returned by the API.
            </p>
          )}
        </article>
        <article className="hrr-panel">
          <div className="hrr-panel-title hrr-panel-title-with-action">
            <div className="hrr-panel-title-label">
              <span className="hrr-section-icon">
                <BarChart3 size={19} strokeWidth={2.2} aria-hidden="true" />
              </span>
              <h2>Visitor Counts by Zone</h2>
            </div>
            <button type="button" className="hrr-expand-chart-button" onClick={() => setExpandedChart("zone")} aria-label="Expand visitor counts by zone chart" title="Expand chart">
              <Maximize2 size={15} strokeWidth={2.2} aria-hidden="true" />
              <span>Expand</span>
            </button>
          </div>
          {zoneChartData.length ? (
            <>
              <ZoneChartView
                data={compactZoneChartData}
                visible={visibleZone}
                onToggle={(key, checked) => toggleSeries(setVisibleZone, key, checked)}
              />
              <ChartSeriesToggles
                visible={visibleZone}
                onToggle={(key, checked) => toggleSeries(setVisibleZone, key, checked)}
              />
              <p className="hrr-zone-chart-caption">
                Showing first {compactZoneChartData.length} of {zoneChartData.length}. Expand to view all zones.
              </p>
            </>
          ) : (
            <p className="hrr-chart-empty">No zone data available.</p>
          )}
        </article>
      </section>
      {expandedChart && (
        <div
          className="hrr-chart-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setExpandedChart(null);
          }}
        >
          <section
            className="hrr-chart-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hrr-expanded-chart-title"
          >
            <header className="hrr-chart-modal-header">
              <div className="hrr-panel-title-label">
                <span className="hrr-section-icon">
                  {expandedChart === "trend" ? (
                    <Activity size={20} strokeWidth={2.2} aria-hidden="true" />
                  ) : (
                    <BarChart3 size={20} strokeWidth={2.2} aria-hidden="true" />
                  )}
                </span>
                <h2 id="hrr-expanded-chart-title">
                  {expandedChart === "trend"
                    ? "Visitor Trend"
                    : "Visitor Counts by Zone"}
                </h2>
              </div>
              <button
                type="button"
                className="hrr-chart-modal-close"
                onClick={() => setExpandedChart(null)}
                aria-label="Close expanded chart"
                title="Close"
              >
                <X size={20} strokeWidth={2.2} aria-hidden="true" />
              </button>
            </header>
            <div className="hrr-chart-modal-content">
              {expandedChart === "trend" ? (
                chartData.length ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 24, left: 8, bottom: 24 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e6edf7"
                        />
                        <XAxis
                          dataKey="time"
                          tickFormatter={(value) =>
                            formatAxisPeriod(value, periodConfig)
                          }
                          tick={{ fontSize: 12, fill: "#64748b" }}
                          tickLine={false}
                          axisLine={false}
                          minTickGap={24}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#64748b" }}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<TrendTooltip />} />
                        {visibleTrend.InCount && (
                          <Line
                            type="monotone"
                            dataKey="InCount"
                            name="In Count"
                            stroke={METRIC_COLORS.InCount}
                            strokeWidth={3}
                            dot={chartData.length === 1}
                            activeDot={{ r: 6 }}
                          />
                        )}
                        {visibleTrend.OutCount && (
                          <Line
                            type="monotone"
                            dataKey="OutCount"
                            name="Out Count"
                            stroke={METRIC_COLORS.OutCount}
                            strokeWidth={3}
                            dot={chartData.length === 1}
                            activeDot={{ r: 6 }}
                          />
                        )}
                        {visibleTrend.Occupancy && (
                          <Line
                            type="monotone"
                            dataKey="Occupancy"
                            name="Occupancy"
                            stroke={METRIC_COLORS.Occupancy}
                            strokeWidth={3}
                            dot={chartData.length === 1}
                            activeDot={{ r: 6 }}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                    <ChartSeriesToggles
                      visible={visibleTrend}
                      onToggle={(key, checked) =>
                        toggleSeries(setVisibleTrend, key, checked)
                      }
                    />
                  </>
                ) : (
                  <p className="hrr-chart-empty">
                    No graph data returned by the API.
                  </p>
                )
              ) : zoneChartData.length ? (
                <>
                  <div className="hrr-modal-zone-tools">
                    <label className="hrr-zone-limit-control">
                      <span>Show</span>
                      <select value={zoneLimit} onChange={(event) => setZoneLimit(event.target.value)} aria-label="Number of zones to show in expanded chart">
                        <option value="10">Top 10</option>
                        <option value="20">Top 20</option>
                        <option value="all">All zones</option>
                      </select>
                    </label>
                    <span className="hrr-zone-chart-caption">
                      Showing {displayedZoneChartData.length} of {zoneChartData.length} zones.
                    </span>
                  </div>
                  <ZoneChartView
                    data={displayedZoneChartData}
                    visible={visibleZone}
                    onToggle={(key, checked) => toggleSeries(setVisibleZone, key, checked)}
                    expanded
                  />
                  <ChartSeriesToggles
                    visible={visibleZone}
                    onToggle={(key, checked) => toggleSeries(setVisibleZone, key, checked)}
                  />
                </>
              ) : (
                <p className="hrr-chart-empty">No zone data available.</p>
              )}
            </div>
          </section>
        </div>
      )}
      <section className="hrr-panel hrr-table-panel">
        <div className="hrr-table-heading">
          <div className="hrr-panel-title">
            <span className="hrr-section-icon">
              <BarChart3 size={19} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <h2>Report Data</h2>
            <span className="hrr-record-badge">
              {filteredRows.length} records
            </span>
          </div>
          <div className="hrr-table-tools">
            <div className="hrr-export-actions">
              <button
                type="button"
                className="hrr-export-button"
                onClick={() => downloadExcel(
                  filteredRows.map((row) => ({
                    [periodConfig.label]: formatDateTime(row, periodConfig),
                    "Zone Name": row.ZoneName ?? "",
                    "In Count": toNumber(row.InCount),
                    "Out Count": toNumber(row.OutCount),
                    Occupancy: toNumber(row.Occupancy),
                  })),
                  "historical-report",
                  `${titleCaseReportType(reportData.reportType || criteria?.reportType || "Historical")} Report`,
                  { dateRange: getPeriodText(criteria), user: criteria?.user ?? criteria?.username ?? "—" }
                )}
              >
                <FileSpreadsheet size={16} aria-hidden="true" />
                Excel
              </button>
              <button
                type="button"
                className="hrr-export-button hrr-export-button-pdf"
                onClick={() => downloadPDF(
                  filteredRows.map((row) => ({
                    [periodConfig.label]: formatDateTime(row, periodConfig),
                    "Zone Name": row.ZoneName ?? "",
                    "In Count": toNumber(row.InCount),
                    "Out Count": toNumber(row.OutCount),
                    Occupancy: toNumber(row.Occupancy),
                  })),
                  "historical-report",
                  { reportName: `${titleCaseReportType(reportData.reportType || criteria?.reportType || "Historical")} Report`, dateRange: getPeriodText(criteria), user: criteria?.user ?? criteria?.username ?? "—" }
                )}
              >
                <FileDown size={16} aria-hidden="true" />
                PDF
              </button>
            </div>
            <input
              aria-label="Search report data"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={`Search by ${periodConfig.label.toLowerCase()} or zone...`}
            />
          </div>
        </div>
        <div className="hrr-table-scroll">
          <table className="hrr-table">
            <thead>
              <tr>
                <th>
                  <button onClick={() => toggleSort(periodConfig.key)}>
                    {periodConfig.label} ↕
                  </button>
                </th>
                <th>
                  <button onClick={() => toggleSort("ZoneName")}>
                    Zone Name ↕
                  </button>
                </th>
                <th>
                  <button onClick={() => toggleSort("InCount")}>
                    In Count ↕
                  </button>
                </th>
                <th>
                  <button onClick={() => toggleSort("OutCount")}>
                    Out Count ↕
                  </button>
                </th>
                <th>
                  <button onClick={() => toggleSort("Occupancy")}>
                    Occupancy ↕
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length ? (
                pageRows.map((row, index) => (
                  <tr
                    key={`${getPeriodValue(row, periodConfig) || "row"}-${
                      row.ZoneName || "zone"
                    }-${index}`}
                  >
                    <td>{formatDateTime(row, periodConfig)}</td>
                    <td>
                      <span className="hrr-zone-name">
                        {row.ZoneName || "—"}
                      </span>
                    </td>
                    <td>{toNumber(row.InCount).toLocaleString()}</td>
                    <td>{toNumber(row.OutCount).toLocaleString()}</td>
                    <td>{toNumber(row.Occupancy).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="hrr-no-results">
                    No matching report rows found.
                  </td>
                </tr>
              )}
            </tbody>
            {pageRows.length > 0 && (
              <tfoot>
                <tr>
                  <th colSpan="2">Page total</th>
                  <th>
                    {pageRows
                      .reduce((sum, row) => sum + toNumber(row.InCount), 0)
                      .toLocaleString()}
                  </th>
                  <th>
                    {pageRows
                      .reduce((sum, row) => sum + toNumber(row.OutCount), 0)
                      .toLocaleString()}
                  </th>
                  <th>
                    {pageRows
                      .reduce((sum, row) => sum + toNumber(row.Occupancy), 0)
                      .toLocaleString()}
                  </th>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        <div className="hrr-pagination">
          <span className="hrr-pagination-info">
            Showing{" "}
            {filteredRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            {"–"}
            {Math.min(currentPage * pageSize, filteredRows.length)} of{" "}
            {filteredRows.length} records
          </span>
          <div className="hrr-pagination-controls">
            <label className="hrr-rows-per-page">
              <span>Rows per page</span>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                aria-label="Rows per page"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
            <button
              disabled={currentPage <= 1}
              onClick={() => setPage((value) => value - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} strokeWidth={2.2} aria-hidden="true" />
            </button>
            <span>
              Page {currentPage} of {pageCount}
            </span>
            <button
              disabled={currentPage >= pageCount}
              onClick={() => setPage((value) => value + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={18} strokeWidth={2.2} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
