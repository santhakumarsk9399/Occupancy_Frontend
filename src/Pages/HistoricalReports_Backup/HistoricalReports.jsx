import React, { useMemo, useState } from "react";
import {
  Globe2,
  Building2,
  Store,
  MapPinned,
  DoorOpen,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  CalendarClock,
  Calendar,
  BarChart3,
  RotateCcw,
  LoaderCircle,
  ArrowRight,
} from "lucide-react";
import "./HistoricalReports.css";
const REPORTS = [
    "Hour-wise",
    // "Day-wise",
    // "Week-wise",
    // "Month-wise",
    // "Year-wise",
];
const FILTER_LEVELS = [
    "Country",
    "City",
    "Mall",
    "Zone",
    "Entrance",
];
const REPORT_LEVELS = [
    {
        value: "Country",
        icon: "◎",
        description: "selected countries",
    },
    {
        value: "City",
        icon: "▦",
        description: "selected cities",
    },
    {
        value: "Mall",
        icon: "▤",
        description: "selected malls",
    },
    {
        value: "Zone",
        icon: "◆",
        description: "selected zones",
    },
    {
        value: "Entrance",
        icon: "⇥",
        description: "selected entrances",
    },
];
const REPORT_LEVEL_ICONS = {
  Country: Globe2,
  City: Building2,
  Mall: Store,
  Zone: MapPinned,
  Entrance: DoorOpen,
};

const PERIOD_ICONS = {
  Today: CalendarCheck,
  Yesterday: CalendarClock,
  "This Week": CalendarDays,
  "Last Week": CalendarRange,
  "This Month": Calendar,
  "Last Month": CalendarRange,
  "This Year": CalendarCheck,
  "Last Year": CalendarClock,
  Custom: CalendarRange,
};

const FILTER_LEVEL_ICONS = REPORT_LEVEL_ICONS;

const FILTER_OPTIONS = {
    Country: ["India", "UAE", "Singapore"],
    City: ["Coimbatore", "Chennai", "Bengaluru"],
    Mall: ["Brookefields", "Fun Republic", "Prozone"],
    Zone: ["Ground Floor", "Food Court", "Retail Zone"],
    Entrance: ["Main Entrance", "North Entrance", "South Entrance"],
};
const REPORT_CONFIG = {
    "Hour-wise": {
        periods: [
            "Today",
            "Yesterday",
            "This Week",
            "This Month",
            "Custom",
        ],
        defaultPeriod: "Today",
        customType: "dateRange",
        showTimeRange: true,
    },
    "Day-wise": {
        periods: [
            "Today",
            "Yesterday",
            "This Week",
            "This Month",
            "This Year",
            "Custom",
        ],
        defaultPeriod: "Today",
        customType: "dateRange",
        showTimeRange: false,
    },
    "Week-wise": {
        periods: [
            "This Week",
            "Last Week",
            "This Month",
            "This Year",
            "Custom",
        ],
        defaultPeriod: "This Week",
        customType: "weekRange",
        showTimeRange: false,
    },
    "Month-wise": {
        periods: [
            "This Month",
            "Last Month",
            "This Year",
            "Custom",
        ],
        defaultPeriod: "This Month",
        customType: "monthRange",
        showTimeRange: false,
    },
    "Year-wise": {
        periods: [
            "This Year",
            "Last Year",
            "Custom",
        ],
        defaultPeriod: "This Year",
        customType: "yearRange",
        showTimeRange: false,
    },
};
const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];
const YEARS_BACK = 10;
const YEARS_FORWARD = 2;
const getLocalDate = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const parseLocalDate = (value) => new Date(`${value}T12:00:00`);
const formatDate = (date) => getLocalDate(date);
const addDays = (dateString, days) => {
    const date = parseLocalDate(dateString);
    date.setDate(date.getDate() + days);
    return formatDate(date);
};
const getISOWeek = (dateString) => {
    const date = parseLocalDate(dateString);
    date.setHours(0, 0, 0, 0);
    // ISO week: Monday is the first day of the week.
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    const isoYear = date.getFullYear();
    const firstThursday = new Date(isoYear, 0, 4);
    firstThursday.setDate(
        firstThursday.getDate() +
        3 -
        ((firstThursday.getDay() + 6) % 7)
    );
    const week =
        1 +
        Math.round(
            (date.getTime() - firstThursday.getTime()) /
            (7 * 24 * 60 * 60 * 1000)
        );
    return { year: isoYear, week };
};
const getWeekCount = (year) => {
    // December 28 is always in the last ISO week of its year.
    return getISOWeek(`${year}-12-28`).week;
};
const getWeekStart = (year, week) => {
    const jan4 = new Date(year, 0, 4, 12, 0, 0);
    const monday = new Date(jan4);
    monday.setDate(
        jan4.getDate() -
        ((jan4.getDay() + 6) % 7) +
        (week - 1) * 7
    );
    return formatDate(monday);
};
const getWeekEnd = (year, week) =>
    addDays(getWeekStart(year, week), 6);
const getMonthStart = (year, month) =>
    `${year}-${String(month).padStart(2, "0")}-01`;
const getMonthEnd = (year, month) => {
    const date = new Date(year, month, 0, 12, 0, 0);
    return formatDate(date);
};
const getDateRangeForPeriod = (period, today) => {
    switch (period) {
        case "Yesterday": {
            const yesterday = addDays(today, -1);
            return { fromDate: yesterday, toDate: yesterday };
        }
        case "This Week": {
            const { year, week } = getISOWeek(today);
            return {
                fromDate: getWeekStart(year, week),
                toDate: today,
            };
        }
        case "Last Week": {
            const lastWeekDate = addDays(today, -7);
            const { year, week } = getISOWeek(lastWeekDate);
            return {
                fromDate: getWeekStart(year, week),
                toDate: getWeekEnd(year, week),
            };
        }
        case "This Month": {
            const date = parseLocalDate(today);
            return {
                fromDate: getMonthStart(
                    date.getFullYear(),
                    date.getMonth() + 1
                ),
                toDate: today,
            };
        }
        case "Last Month": {
            const date = parseLocalDate(today);
            const lastMonth = new Date(
                date.getFullYear(),
                date.getMonth() - 1,
                1,
                12
            );
            return {
                fromDate: getMonthStart(
                    lastMonth.getFullYear(),
                    lastMonth.getMonth() + 1
                ),
                toDate: getMonthEnd(
                    lastMonth.getFullYear(),
                    lastMonth.getMonth() + 1
                ),
            };
        }
        case "This Year":
            return {
                fromDate: `${parseLocalDate(today).getFullYear()}-01-01`,
                toDate: today,
            };
        case "Last Year": {
            const year = parseLocalDate(today).getFullYear() - 1;
            return {
                fromDate: `${year}-01-01`,
                toDate: `${year}-12-31`,
            };
        }
        case "Today":
        default:
            return { fromDate: today, toDate: today };
    }
};
const getReportDateRange = (report, period, today) => {
  const current = parseLocalDate(today);
  const year = current.getFullYear();
  const month = current.getMonth() + 1;

  if (report === "Week-wise") {
    if (period === "This Week") {
      const { year: weekYear, week } = getISOWeek(today);
      return {
        fromDate: getWeekStart(weekYear, week),
        toDate: getWeekEnd(weekYear, week),
      };
    }
    if (period === "This Month") {
      return { fromDate: getMonthStart(year, month), toDate: getMonthEnd(year, month) };
    }
    if (period === "This Year") {
      return { fromDate: `${year}-01-01`, toDate: `${year}-12-31` };
    }
  }

  if (report === "Month-wise") {
    if (period === "This Month") {
      return { fromDate: getMonthStart(year, month), toDate: getMonthEnd(year, month) };
    }
    if (period === "This Year") {
      return { fromDate: `${year}-01-01`, toDate: `${year}-12-31` };
    }
  }

  if (report === "Year-wise" && period === "This Year") {
    return { fromDate: `${year}-01-01`, toDate: `${year}-12-31` };
  }

  return getDateRangeForPeriod(period, today);
};

const getDefaultFilters = () => ({
    Country: "All Selected",
    City: "All Selected",
    Mall: "All Selected",
    Zone: "All Selected",
    Entrance: "All Selected",
});
export default function HistoricalReports() {
    const today = getLocalDate();
    const currentDate = parseLocalDate(today);
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentWeek = getISOWeek(today).week;
    const [report, setReport] = useState("Hour-wise");
    const [section, setSection] = useState("filters");
    const [reportLevel, setReportLevel] = useState("Entrance");
    const [filters, setFilters] = useState(getDefaultFilters());
    const [period, setPeriod] = useState("Today");
    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);
    const [fromYear, setFromYear] = useState(currentYear);
    const [toYear, setToYear] = useState(currentYear);
    const [fromWeek, setFromWeek] = useState(currentWeek);
    const [toWeek, setToWeek] = useState(currentWeek);
    const [fromMonth, setFromMonth] = useState(currentMonth);
    const [toMonth, setToMonth] = useState(currentMonth);
    const [reportData, setReportData] = useState("In");
    const [startHour, setStartHour] = useState(0);
    const [endHour, setEndHour] = useState(24);
    const [message, setMessage] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const reportConfig = REPORT_CONFIG[report];
    const visibleFilters = useMemo(() => {
        const selectedIndex = FILTER_LEVELS.indexOf(reportLevel);
        return FILTER_LEVELS.slice(0, selectedIndex + 1);
    }, [reportLevel]);
    const yearOptions = useMemo(
        () =>
            Array.from(
                { length: YEARS_BACK + YEARS_FORWARD + 1 },
                (_, index) => currentYear - YEARS_BACK + index
            ),
        [currentYear]
    );
    const availablePeriods = reportConfig.periods;
    const resetRangeToToday = () => {
        setFromDate(today);
        setToDate(today);
        setFromYear(currentYear);
        setToYear(currentYear);
        setFromWeek(currentWeek);
        setToWeek(currentWeek);
        setFromMonth(currentMonth);
        setToMonth(currentMonth);
    };
    const changeReport = (nextReport) => {
        const config = REPORT_CONFIG[nextReport];
        setReport(nextReport);
        setPeriod(config.defaultPeriod);
        setSection("filters");
        setMessage("");
        setIsGenerating(false);
        setStartHour(0);
        setEndHour(24);
        resetRangeToToday();
    };
    const changePeriod = (nextPeriod) => {
        setPeriod(nextPeriod);
        setMessage("");
        if (nextPeriod !== "Custom") {
            const range = getReportDateRange(report, nextPeriod, today);
            setFromDate(range.fromDate);
            setToDate(range.toDate);
            const fromWeekValue = getISOWeek(range.fromDate);
            const toWeekValue = getISOWeek(range.toDate);
            setFromYear(fromWeekValue.year);
            setFromWeek(fromWeekValue.week);
            setToYear(toWeekValue.year);
            setToWeek(toWeekValue.week);
            const fromDateValue = parseLocalDate(range.fromDate);
            const toDateValue = parseLocalDate(range.toDate);
            setFromMonth(fromDateValue.getMonth() + 1);
            setToMonth(toDateValue.getMonth() + 1);
        }
    };
    const changeReportLevel = (level) => {
        setReportLevel(level);
        setMessage("");
        const index = FILTER_LEVELS.indexOf(level);
        setFilters((previous) => {
            const next = { ...previous };
            FILTER_LEVELS.slice(index + 1).forEach((name) => {
                next[name] = "All Selected";
            });
            return next;
        });
    };
    const changeFilter = (name, value) => {
        const index = FILTER_LEVELS.indexOf(name);
        setFilters((previous) => {
            const next = { ...previous, [name]: value };
            FILTER_LEVELS.slice(index + 1).forEach((child) => {
                next[child] = "All Selected";
            });
            return next;
        });
        setMessage("");
    };
    const clearFilters = () => {
        setFilters(getDefaultFilters());
        setMessage("");
    };
    const resetForm = () => {
        setReport("Hour-wise");
        setSection("filters");
        setReportLevel("Entrance");
        setFilters(getDefaultFilters());
        setPeriod("Today");
        setReportData("In");
        setStartHour(0);
        setEndHour(24);
        setMessage("");
        setIsGenerating(false);
        resetRangeToToday();
    };
    const getCustomRange = () => {
        switch (reportConfig.customType) {
            case "dateRange":
                return { fromDate, toDate };
            case "weekRange":
                return {
                    fromYear,
                    fromWeek,
                    toYear,
                    toWeek,
                    fromDate: getWeekStart(fromYear, fromWeek),
                    toDate: getWeekEnd(toYear, toWeek),
                };
            case "monthRange":
                return {
                    fromYear,
                    fromMonth,
                    toYear,
                    toMonth,
                    fromDate: getMonthStart(fromYear, fromMonth),
                    toDate: getMonthEnd(toYear, toMonth),
                };
            case "yearRange":
                return {
                    fromYear,
                    toYear,
                    fromDate: `${fromYear}-01-01`,
                    toDate: `${toYear}-12-31`,
                };
            default:
                return null;
        }
    };
    const handleGenerate = async () => {
        if (isGenerating) return;

        const customRange = period === "Custom" ? getCustomRange() : null;
        const selectedRange = customRange || getReportDateRange(report, period, today);

        if (!selectedRange?.fromDate || !selectedRange?.toDate) {
            setMessage("Please select a valid reporting period.");
            setSection("options");
            return;
        }

        if (selectedRange.fromDate > selectedRange.toDate) {
            setMessage("The starting period must not be after the ending period.");
            setSection("options");
            return;
        }

        const payload = {
            reportType: report,
            hierarchyLevel: reportLevel,
            filters: Object.fromEntries(
                visibleFilters.map((name) => [name, filters[name]])
            ),
            period,
            dateRange: selectedRange,
            reportData,
            timeRange: reportConfig.showTimeRange
                ? {
                    startHour,
                    endHour,
                    startTime: `${String(startHour).padStart(2, "0")}:00`,
                    endTime: endHour === 24
                        ? "23:59"
                        : `${String(endHour).padStart(2, "0")}:00`,
                }
                : null,
        };

        try {
            setIsGenerating(true);
            setMessage("");
            console.log("Historical report configuration:", payload);

            // DEMO ONLY: replace this delay with your actual API request.
            // Keep the await around your API call so the loading state remains visible.
            await new Promise((resolve) => setTimeout(resolve, 600));

            setMessage(
                `${report} configuration is ready. Connect your report API to fetch the actual report.`
            );
        } catch (error) {
            console.error("Unable to generate historical report:", error);
            setMessage("Unable to generate the report. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };
    const updateFromYear = (year) => {
        setFromYear(year);
        setFromWeek((week) => Math.min(week, getWeekCount(year)));
        setMessage("");
    };
    const updateToYear = (year) => {
        setToYear(year);
        setToWeek((week) => Math.min(week, getWeekCount(year)));
        setMessage("");
    };
    const renderYearSelect = (id, value, onChange) => (
        <select
            id={id}
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
        >
            {yearOptions.map((year) => (
                <option key={year} value={year}>
                    {year}
                </option>
            ))}
        </select>
    );
    const renderWeekSelect = (id, year, value, onChange) => (
        <select
            id={id}
            value={value}
            onChange={(event) => {
                onChange(Number(event.target.value));
                setMessage("");
            }}
        >
            {Array.from(
                { length: getWeekCount(year) },
                (_, index) => index + 1
            ).map((week) => (
                <option key={week} value={week}>
                    Week {week}
                </option>
            ))}
        </select>
    );
    const selectedPeriodRange = period === "Custom"
        ? getCustomRange()
        : getReportDateRange(report, period, today);
    const selectedPeriodText = selectedPeriodRange?.fromDate && selectedPeriodRange?.toDate
        ? `${selectedPeriodRange.fromDate} – ${selectedPeriodRange.toDate}`
        : "";
    const renderMonthSelect = (id, value, onChange) => (
        <select
            id={id}
            value={value}
            onChange={(event) => {
                onChange(Number(event.target.value));
                setMessage("");
            }}
        >
            {MONTHS.map((month, index) => (
                <option key={month} value={index + 1}>
                    {month}
                </option>
            ))}
        </select>
    );
    return (
        <main className="historical-page">
            {/* <div className="historical-heading">
                <div>
                    <div className="historical-breadcrumb">
                        Home <span>›</span> Historical Analytics <span>›</span>{" "}
                        Historical Reports
                    </div>
                    <h1>Historical Reports</h1>
                    <p>Configure and generate occupancy reports</p>
                </div>
                <button
                    className="outline-button header-filter-button"
                    type="button"
                    onClick={() => setSection("filters")}
                >
                    <span aria-hidden="true">☷</span> Filters
                </button>
            </div> */}
            <div className="report-tabs" role="tablist" aria-label="Report frequency">
                {REPORTS.map((item) => (
                    <button
                        key={item}
                        type="button"
                        role="tab"
                        aria-selected={report === item}
                        className={`report-tab ${report === item ? "active" : ""}`}
                        onClick={() => changeReport(item)}
                    >
                        {item}
                    </button>
                ))}
            </div>
            <div className="report-workspace">
                <div className="report-stepper">
                    <button
                        type="button"
                        className={`step-item ${section === "filters" ? "active" : ""}`}
                        aria-current={section === "filters" ? "step" : undefined}
                        onClick={() => setSection("filters")}
                    >
                        <span className="step-number">1</span>
                        <span className="step-label">Report Type &amp; Filters</span>
                    </button>
                    <span className="step-connector" />
                    <button
                        type="button"
                        className={`step-item ${section === "options" ? "active" : ""}`}
                        aria-current={section === "options" ? "step" : undefined}
                        onClick={() => setSection("options")}
                    >
                        <span className="step-number">2</span>
                        <span className="step-label">Report Options</span>
                    </button>
                </div>
                {section === "filters" && (
                    <section className="report-section">
                        <div className="section-heading">
                            {/* <span className="section-number">1</span> */}
                            <div>
                                <h2>Report Type &amp; Filters</h2>
                                {/* <p>
                                    Choose the report type and select the filters for your report.
                                </p> */}
                            </div>
                        </div>
                        <div className="subsection">
                            <h3>Select Report Type</h3>
                            <div className="report-level-grid">
                                {REPORT_LEVELS.map((item) => (
                                    <button
                                        key={item.value}
                                        type="button"
                                        aria-pressed={reportLevel === item.value}
                                        className={`report-level-card ${reportLevel === item.value ? "selected" : ""
                                            }`}
                                        onClick={() => changeReportLevel(item.value)}
                                    >
                                        <span className="level-icon" aria-hidden="true">
                                            {(() => {
                                                const Icon = REPORT_LEVEL_ICONS[item.value];
                                                return <Icon size={23} strokeWidth={1.8} />;
                                            })()}
                                        </span>
                                        <span className="level-content">
                                            <strong>{item.value}</strong>
                                            <small>Generate report for</small>
                                            <small>{item.description}</small>
                                        </span>
                                        <span className="level-radio" aria-hidden="true">
                                            {reportLevel === item.value ? "●" : ""}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="filter-section">
                            <div className="filter-section-heading">
                                <div>
                                    <h3>Select Filters</h3>
                                    <p>
                                        Choose the filters for your report. You can select multiple
                                        values.
                                    </p>
                                </div>
                                {/* <div className="date-control">
                                    <label htmlFor="report-date">Date</label>
                                    <select
                                        id="report-date"
                                        value={
                                            period === "Yesterday" ? "Yesterday" : "Today"
                                        }
                                        onChange={(event) => changePeriod(event.target.value)}
                                    >
                                        <option value="Today">Today</option>
                                        <option value="Yesterday">Yesterday</option>
                                    </select>
                                </div> */}
                                {/* <button
                                    type="button"
                                    className="clear-button"
                                    onClick={clearFilters}
                                >
                                    Clear All
                                </button> */}
                            </div>
                            <div className="filter-grid">
                                {visibleFilters.map((name) => (
                                    <div className="filter-field" key={name}>
                                        <label htmlFor={`filter-${name}`}>
                                            <span className="filter-icon" aria-hidden="true">
                                                {(() => {
                                                    const Icon = FILTER_LEVEL_ICONS[name];
                                                    return <Icon size={18} strokeWidth={1.9} />;
                                                })()}
                                            </span>
                                            {name}(s)
                                        </label>
                                        <select
                                            id={`filter-${name}`}
                                            value={filters[name]}
                                            onChange={(event) =>
                                                changeFilter(name, event.target.value)
                                            }
                                        >
                                            <option value="All Selected">All Selected</option>
                                            {FILTER_OPTIONS[name].map((option) => (
                                                <option value={option} key={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
                {section === "options" && (
                    <section className="report-section options-section">
                        <div className="section-heading">
                            {/* <span className="section-number">2</span> */}
                            <div>
                                <h2>Report Options</h2>
                                {/* <p>
                                    Configure the time period and data type for the report.
                                </p> */}
                            </div>
                        </div>
                        <div className="options-form">
                            <div className="option-block">
                                <h3>Select Period</h3>
                                <div className="period-grid">
                                    {availablePeriods.map((item) => (
                                        <button
                                            type="button"
                                            key={item}
                                            className={`period-button ${period === item ? "active" : ""
                                                }`}
                                            aria-pressed={period === item}
                                            onClick={() => changePeriod(item)}
                                        >
                                            <span className="period-icon" aria-hidden="true">
                                                {(() => {
                                                    const Icon = PERIOD_ICONS[item] || CalendarDays;
                                                    return <Icon size={16} strokeWidth={1.8} />;
                                                })()}
                                            </span>
                                            {item}
                                        </button>
                                    ))}
                                </div>
                                {period === "Custom" && (
                                    <div className="custom-range-panel">
                                        {reportConfig.customType === "dateRange" && (
                                            <>
                                                <div className="range-field">
                                                    <label htmlFor="from-date">From Date</label>
                                                    <input
                                                        id="from-date"
                                                        type="date"
                                                        value={fromDate}
                                                        max={toDate}
                                                        onChange={(event) => {
                                                            setFromDate(event.target.value);
                                                            setMessage("");
                                                        }}
                                                    />
                                                </div>
                                                <span className="range-separator">to</span>
                                                <div className="range-field">
                                                    <label htmlFor="to-date">To Date</label>
                                                    <input
                                                        id="to-date"
                                                        type="date"
                                                        value={toDate}
                                                        min={fromDate}
                                                        onChange={(event) => {
                                                            setToDate(event.target.value);
                                                            setMessage("");
                                                        }}
                                                    />
                                                </div>
                                            </>
                                        )}
                                        {reportConfig.customType === "weekRange" && (
                                            <>
                                                <div className="range-group">
                                                    <strong>From</strong>
                                                    <div className="range-field">
                                                        <label htmlFor="from-week-year">Year</label>
                                                        {renderYearSelect(
                                                            "from-week-year",
                                                            fromYear,
                                                            updateFromYear
                                                        )}
                                                    </div>
                                                    <div className="range-field">
                                                        <label htmlFor="from-week">Week No.</label>
                                                        {renderWeekSelect(
                                                            "from-week",
                                                            fromYear,
                                                            fromWeek,
                                                            setFromWeek
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="range-separator">to</span>
                                                <div className="range-group">
                                                    <strong>To</strong>
                                                    <div className="range-field">
                                                        <label htmlFor="to-week-year">Year</label>
                                                        {renderYearSelect(
                                                            "to-week-year",
                                                            toYear,
                                                            updateToYear
                                                        )}
                                                    </div>
                                                    <div className="range-field">
                                                        <label htmlFor="to-week">Week No.</label>
                                                        {renderWeekSelect(
                                                            "to-week",
                                                            toYear,
                                                            toWeek,
                                                            setToWeek
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="range-summary">
                                                    {getWeekStart(fromYear, fromWeek)} –{" "}
                                                    {getWeekEnd(toYear, toWeek)}
                                                </p>
                                            </>
                                        )}
                                        {reportConfig.customType === "monthRange" && (
                                            <>
                                                <div className="range-group">
                                                    <strong>From</strong>
                                                    <div className="range-field">
                                                        <label htmlFor="from-month-year">Year</label>
                                                        {renderYearSelect(
                                                            "from-month-year",
                                                            fromYear,
                                                            setFromYear
                                                        )}
                                                    </div>
                                                    <div className="range-field">
                                                        <label htmlFor="from-month">Month</label>
                                                        {renderMonthSelect(
                                                            "from-month",
                                                            fromMonth,
                                                            setFromMonth
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="range-separator">to</span>
                                                <div className="range-group">
                                                    <strong>To</strong>
                                                    <div className="range-field">
                                                        <label htmlFor="to-month-year">Year</label>
                                                        {renderYearSelect(
                                                            "to-month-year",
                                                            toYear,
                                                            setToYear
                                                        )}
                                                    </div>
                                                    <div className="range-field">
                                                        <label htmlFor="to-month">Month</label>
                                                        {renderMonthSelect(
                                                            "to-month",
                                                            toMonth,
                                                            setToMonth
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="range-summary">
                                                    {getMonthStart(fromYear, fromMonth)} –{" "}
                                                    {getMonthEnd(toYear, toMonth)}
                                                </p>
                                            </>
                                        )}
                                        {reportConfig.customType === "yearRange" && (
                                            <>
                                                <div className="range-field">
                                                    <label htmlFor="from-year">From Year</label>
                                                    {renderYearSelect(
                                                        "from-year",
                                                        fromYear,
                                                        setFromYear
                                                    )}
                                                </div>
                                                <span className="range-separator">to</span>
                                                <div className="range-field">
                                                    <label htmlFor="to-year">To Year</label>
                                                    {renderYearSelect(
                                                        "to-year",
                                                        toYear,
                                                        setToYear
                                                    )}
                                                </div>
                                                <p className="range-summary">
                                                    {fromYear}-01-01 – {toYear}-12-31
                                                </p>
                                            </>
                                        )}
                                    </div>
                                )}
                                <div className="selected-period-summary" aria-live="polite">
                                    <CalendarRange size={17} strokeWidth={1.8} aria-hidden="true" />
                                    <span>
                                        <strong>Selected Period:</strong> {selectedPeriodText}
                                    </span>
                                </div>
                            </div>
                            <div className="option-block report-data-block">
                                <h3>Report Data</h3>
                                <div className="radio-options">
                                    <label>
                                        <input
                                            type="radio"
                                            name="reportData"
                                            value="In"
                                            checked={reportData === "In"}
                                            onChange={(event) =>
                                                setReportData(event.target.value)
                                            }
                                        />
                                        In
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="reportData"
                                            value="In & Out"
                                            checked={reportData === "In & Out"}
                                            onChange={(event) =>
                                                setReportData(event.target.value)
                                            }
                                        />
                                        In &amp; Out
                                    </label>
                                </div>
                            </div>
                            {reportConfig.showTimeRange && (
                                <div className="option-block time-range-block">
                                    <h3>Time Range (Hours)</h3>
                                    <div className="time-range-values">
                                        <span className="time-value-chip">
                                            <small>From</small>
                                            <strong>{String(startHour).padStart(2, "0")}:00</strong>
                                        </span>
                                        <span className="time-range-arrow" aria-hidden="true">→</span>
                                        <span className="time-value-chip time-value-chip-end">
                                            <small>To</small>
                                            <strong>{endHour === 24 ? "23:59" : `${String(endHour).padStart(2, "0")}:00`}</strong>
                                        </span>
                                    </div>
                                    <div className="time-range-slider" aria-label="Select report time range">
                                        <div className="time-slider-track" />
                                        <div
                                            className="time-slider-selected"
                                            style={{
                                                left: `${(startHour / 24) * 100}%`,
                                                width: `${((endHour - startHour) / 24) * 100}%`,
                                            }}
                                        />
                                        <input
                                            className="time-slider-input time-slider-start"
                                            aria-label="Start hour"
                                            type="range"
                                            min="0"
                                            max="24"
                                            step="1"
                                            value={startHour}
                                            style={{ zIndex: startHour > 20 ? 5 : 3 }}
                                            onChange={(event) => {
                                                const value = Number(event.target.value);
                                                setStartHour(Math.min(value, endHour - 1));
                                            }}
                                        />
                                        <input
                                            className="time-slider-input time-slider-end"
                                            aria-label="End hour"
                                            type="range"
                                            min="0"
                                            max="24"
                                            step="1"
                                            value={endHour}
                                            style={{ zIndex: startHour > 20 ? 3 : 4 }}
                                            onChange={(event) => {
                                                const value = Number(event.target.value);
                                                setEndHour(Math.max(value, startHour + 1));
                                            }}
                                        />
                                    </div>
                                    <div className="time-range-labels">
                                        <span>00:00</span>
                                        <span>06:00</span>
                                        <span>12:00</span>
                                        <span>18:00</span>
                                        <span>23:59</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}
                <div className="report-action-footer">
                    <div className="report-info">
                        <span className="info-icon" aria-hidden="true">i</span>
                        <span>
                            {section === "filters"
                                ? "Select your report type and filters, then open Report Options."
                                : "Review the period, report data and time range before generating."}
                        </span>
                    </div>
                    <div className="report-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={resetForm}
                            disabled={isGenerating}
                        >
                            <RotateCcw size={15} strokeWidth={1.8} />
                            Reset
                        </button>
                        <button
                            type="button"
                            className="primary-button"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <>
                                    <LoaderCircle className="report-loading-spinner" size={17} />
                                    Generating Report...
                                </>
                            ) : (
                                <>
                                    <BarChart3 size={17} strokeWidth={2} />
                                    Generate Report
                                    <ArrowRight size={15} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
                {message && (
                    <div className="report-message" role="status">
                        {message}
                    </div>
                )}
            </div>
        </main>
    );
}
