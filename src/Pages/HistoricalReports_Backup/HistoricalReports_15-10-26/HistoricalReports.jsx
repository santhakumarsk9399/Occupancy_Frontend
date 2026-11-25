

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

import "./HistoricalReports.css";

import {
  getVid,
  getToken,
} from "../../Settings_Heatmap/components/Heatmaps/utils/sessionHelper";

import api from "../../Settings_heatmap/utils/AxiosInstance";

const REPORTS = [
  "Hour-wise",

  "Day-wise",

  "Week-wise",

  // "Month-wise",

  // "Year-wise",
];

const FILTER_LEVELS = ["Country", "City", "Zone"];

// Filter options are loaded from the dashboard filter API.
// Only response.allFilters is used; response.selectedFilters is intentionally ignored.
const EMPTY_FILTER_DATA = {
  countries: [],
  cities: [],
  zones: [],
};

const normalizeFilterData = (allFilters = {}) => ({
  countries: (Array.isArray(allFilters.countries) ? allFilters.countries : []).map(
    (country) => ({
      value: String(country.id),
      label: country.Country,
    }),
  ),
  cities: (Array.isArray(allFilters.cities) ? allFilters.cities : []).map(
    (city) => ({
      value: String(city.id),
      label: city.City,
      countryId: String(city.countryId),
    }),
  ),
  zones: (Array.isArray(allFilters.zones) ? allFilters.zones : []).map(
    (zone) => ({
      // Keep the zone name as the value because the report API expects ZoneName.
      value: zone.Zonename,
      label: zone.Zonename,
      zoneId: String(zone.id),
      cityId: String(zone.cityId),
    }),
  ),
});

const getDefaultFilters = (filterData = EMPTY_FILTER_DATA) => ({
  Country: filterData.countries.map((item) => item.value),
  City: filterData.cities.map((item) => item.value),
  Zone: filterData.zones.map((item) => item.value),
});

const FILTER_ICONS = {
  Country: Globe2,

  City: Building2,

  Zone: MapPinned,
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

const REPORT_CONFIG = {
  "Hour-wise": {
    periods: ["Today", "Yesterday", "This Week", "This Month", "Custom"],

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

    showTimeRange: true,
  },

  "Week-wise": {
    periods: ["This Week", "Last Week", "This Month", "This Year", "Custom"],

    defaultPeriod: "This Week",

    customType: "weekRange",

    showTimeRange: true,
  },

  "Month-wise": {
    periods: ["This Month", "Last Month", "This Year", "Custom"],

    defaultPeriod: "This Month",

    customType: "monthRange",

    showTimeRange: true,
  },

  "Year-wise": {
    periods: ["This Year", "Last Year", "Custom"],

    defaultPeriod: "This Year",

    customType: "yearRange",

    showTimeRange: true,
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

const addDays = (dateString, days) => {
  const date = parseLocalDate(dateString);

  date.setDate(date.getDate() + days);

  return getLocalDate(date);
};

const getISOWeek = (dateString) => {
  const date = parseLocalDate(dateString);

  date.setHours(0, 0, 0, 0);

  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));

  const isoYear = date.getFullYear();

  const firstThursday = new Date(isoYear, 0, 4);

  firstThursday.setDate(
    firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7),
  );

  const week =
    1 +
    Math.round(
      (date.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000),
    );

  return { year: isoYear, week };
};

const getWeekCount = (year) => getISOWeek(`${year}-12-28`).week;

const getWeekStart = (year, week) => {
  const jan4 = new Date(year, 0, 4, 12, 0, 0);

  const monday = new Date(jan4);

  monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (week - 1) * 7);

  return getLocalDate(monday);
};

const getWeekEnd = (year, week) => addDays(getWeekStart(year, week), 6);

const getMonthStart = (year, month) =>
  `${year}-${String(month).padStart(2, "0")}-01`;

const getMonthEnd = (year, month) => {
  const date = new Date(year, month, 0, 12, 0, 0);

  return getLocalDate(date);
};

const getDateRangeForPeriod = (period, today) => {
  switch (period) {
    case "Yesterday": {
      const yesterday = addDays(today, -1);

      return { fromDate: yesterday, toDate: yesterday };
    }

    case "This Week":

    case "Last Week": {
      const referenceDate = period === "Last Week" ? addDays(today, -7) : today;

      const { year, week } = getISOWeek(referenceDate);

      return period === "Last Week"
        ? {
            fromDate: getWeekStart(year, week),

            toDate: getWeekEnd(year, week),
          }
        : { fromDate: getWeekStart(year, week), toDate: today };
    }

    case "This Month": {
      const date = parseLocalDate(today);

      return {
        fromDate: getMonthStart(date.getFullYear(), date.getMonth() + 1),

        toDate: today,
      };
    }

    case "Last Month": {
      const date = parseLocalDate(today);

      const lastMonth = new Date(
        date.getFullYear(),

        date.getMonth() - 1,

        1,

        12,
      );

      return {
        fromDate: getMonthStart(
          lastMonth.getFullYear(),

          lastMonth.getMonth() + 1,
        ),

        toDate: getMonthEnd(
          lastMonth.getFullYear(),

          lastMonth.getMonth() + 1,
        ),
      };
    }

    case "This Year": {
      const year = parseLocalDate(today).getFullYear();

      return { fromDate: `${year}-01-01`, toDate: today };
    }

    case "Last Year": {
      const year = parseLocalDate(today).getFullYear() - 1;

      return { fromDate: `${year}-01-01`, toDate: `${year}-12-31` };
    }

    case "Today":

    default:
      return { fromDate: today, toDate: today };
  }
};

// const getReportDateRange = (report, period, today) => {
//   const current = parseLocalDate(today);

//   const year = current.getFullYear();

//   const month = current.getMonth() + 1;

//   if (report === "Week-wise") {
//     if (period === "This Week") {
//       const { year: weekYear, week } = getISOWeek(today);

//       return {
//         fromDate: getWeekStart(weekYear, week),

//         toDate: getWeekEnd(weekYear, week),
//       };
//     }

//     if (period === "This Month") {
//       return {
//         fromDate: getMonthStart(year, month),

//         toDate: getMonthEnd(year, month),
//       };
//     }

//     if (period === "This Year") {
//       return { fromDate: `${year}-01-01`, toDate: `${year}-12-31` };
//     }
//   }

//   if (report === "Month-wise") {
//     if (period === "This Month") {
//       return {
//         fromDate: getMonthStart(year, month),

//         toDate: getMonthEnd(year, month),
//       };
//     }

//     if (period === "This Year") {
//       return { fromDate: `${year}-01-01`, toDate: `${year}-12-31` };
//     }
//   }

//   if (report === "Year-wise" && period === "This Year") {
//     return { fromDate: `${year}-01-01`, toDate: `${year}-12-31` };
//   }

//   return getDateRangeForPeriod(period, today);
// };

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
      return {
        fromDate: getMonthStart(year, month),
        toDate: getMonthEnd(year, month),
      };
    }
    if (period === "This Year") {
      return {
        fromDate: `${year}-01-01`,
        toDate: today,
      };
    }
  }
  if (report === "Month-wise") {
    if (period === "This Month") {
      return {
        fromDate: getMonthStart(year, month),
        toDate: getMonthEnd(year, month),
      };
    }
    if (period === "This Year") {
      return {
        fromDate: `${year}-01-01`,
        toDate: today,
      };
    }
  }
  if (report === "Year-wise" && period === "This Year") {
    return {
      fromDate: `${year}-01-01`,
      toDate: `${year}-12-31`,
    };
  }
  return getDateRangeForPeriod(period, today);
};

function MultiSelectFilter({ label, options = [], value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectedValues = Array.isArray(value) ? value : [];
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

  const filteredOptions = options.filter((option) =>
    String(option.label ?? "").toLocaleLowerCase().includes(normalizedSearch),
  );

  const allSelected =
    options.length > 0 &&
    options.every((option) => selectedValues.includes(option.value));

  const displayText = allSelected
    ? "All Selected"
    : selectedValues.length === 0
      ? `Select ${label}`
      : `${selectedValues.length} Selected`;

  // Selects or clears every available option, not just search results.
  const toggleAll = () =>
    onChange(allSelected ? [] : options.map((option) => option.value));

  const toggleOption = (optionValue) =>
    onChange(
      selectedValues.includes(optionValue)
        ? selectedValues.filter((item) => item !== optionValue)
        : [...selectedValues, optionValue],
    );

  const closeDropdown = () => {
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="multi-filter">
      <button
        type="button"
        className="multi-filter-trigger"
        aria-expanded={open}
        onClick={() => {
          setOpen((previous) => {
            if (previous) setSearchTerm("");
            return !previous;
          });
        }}
      >
        <span>{displayText}</span>
        <span className="multi-filter-arrow" aria-hidden="true">
          ⌄
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="multi-filter-dismiss"
            aria-label={`Close ${label} options`}
            onClick={closeDropdown}
          />

          <div className="multi-filter-menu">
            <div className="multi-filter-search-wrap">
              <input
                type="search"
                className="multi-filter-search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={`Search ${label.replace(/\(s\)/gi, "").trim()}...`}
                aria-label={`Search ${label} options`}
                onClick={(event) => event.stopPropagation()}
              />
            </div>

            <label className="multi-filter-option multi-filter-select-all">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
              />
              <span>All Selected</span>
            </label>

            <div className="multi-filter-options-list">
              {filteredOptions.map((option) => (
                <label className="multi-filter-option" key={option.value}>
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => toggleOption(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}

              {filteredOptions.length === 0 && (
                <div className="multi-filter-empty">
                  {options.length === 0
                    ? "No options available"
                    : `No ${label.replace(/\(s\)/gi, "").toLowerCase()} found`}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function HistoricalReports() {
  const navigate = useNavigate();

  const today = getLocalDate();

  const currentDate = parseLocalDate(today);

  const currentYear = currentDate.getFullYear();

  const currentMonth = currentDate.getMonth() + 1;

  const currentWeek = getISOWeek(today).week;

  const [report, setReport] = useState("Hour-wise");

  const [filterData, setFilterData] = useState(EMPTY_FILTER_DATA);
  const [filters, setFilters] = useState(() => getDefaultFilters());
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);

  const [period, setPeriod] = useState("Today");

  const [fromDate, setFromDate] = useState(today);

  const [toDate, setToDate] = useState(today);

  const [fromYear, setFromYear] = useState(currentYear);

  const [toYear, setToYear] = useState(currentYear);

  const [fromWeek, setFromWeek] = useState(currentWeek);

  const [toWeek, setToWeek] = useState(currentWeek);

  const [fromMonth, setFromMonth] = useState(currentMonth);

  const [toMonth, setToMonth] = useState(currentMonth);

  const [startHour, setStartHour] = useState(0);

  const [endHour, setEndHour] = useState(24);

  const [message, setMessage] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadFilters = async () => {
      setIsLoadingFilters(true);
      try {
        const username =
          sessionStorage.getItem("username") ||
          sessionStorage.getItem("Username") ||
          "Occupancy";

        const response = await api.get("dashboard/dashboardFilter/filters", {
          params: {
            vid: getVid(),
            username,
          },
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        const result = response?.data;
        if (result?.success === false) {
          throw new Error(result?.message || "Unable to load report filters.");
        }

        // Use allFilters only. Do not use result.selectedFilters.
        const normalized = normalizeFilterData(result?.allFilters);

        if (isMounted) {
          setFilterData(normalized);
          // Reports start with every option selected.
          setFilters(getDefaultFilters(normalized));
        }
      } catch (error) {
        console.error("Unable to load historical report filters:", error);
        if (isMounted) {
          setFilterData(EMPTY_FILTER_DATA);
          setFilters(getDefaultFilters(EMPTY_FILTER_DATA));
          setMessage(
            error?.response?.data?.message ||
              error?.message ||
              "Unable to load Country, City and Zone filters.",
          );
        }
      } finally {
        if (isMounted) setIsLoadingFilters(false);
      }
    };

    loadFilters();

    return () => {
      isMounted = false;
    };
  }, []);

  const reportConfig = REPORT_CONFIG[report];

  const availablePeriods = reportConfig.periods;

  const yearOptions = useMemo(
    () =>
      Array.from(
        { length: YEARS_BACK + YEARS_FORWARD + 1 },

        (_, index) => currentYear - YEARS_BACK + index,
      ),

    [currentYear],
  );

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

  const changeFilter = (name, selectedValues) => {
    setFilters((previous) => {
      const next = { ...previous, [name]: selectedValues };

      if (name === "Country") {
        const matchingCities = filterData.cities.filter((city) =>
          selectedValues.includes(city.countryId),
        );
        const cityIds = matchingCities.map((city) => city.value);

        next.City = cityIds;
        next.Zone = filterData.zones
          .filter((zone) => cityIds.includes(zone.cityId))
          .map((zone) => zone.value);
      } else if (name === "City") {
        const matchingZones = filterData.zones.filter((zone) =>
          selectedValues.includes(zone.cityId),
        );
        next.Zone = matchingZones.map((zone) => zone.value);
      }

      return next;
    });

    setMessage("");
  };

  const availableCities = filterData.cities.filter((city) =>
    filters.Country.includes(city.countryId),
  );

  const availableZones = filterData.zones.filter((zone) =>
    filters.City.includes(zone.cityId),
  );

  const resetForm = () => {
    setReport("Hour-wise");

    setFilters(getDefaultFilters(filterData));

    setPeriod("Today");

    setStartHour(0);

    setEndHour(24);

    setMessage("");

    setIsGenerating(false);

    resetRangeToToday();
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
      {Array.from({ length: getWeekCount(year) }, (_, index) => index + 1).map(
        (week) => (
          <option key={week} value={week}>
            Week {week}
          </option>
        ),
      )}
    </select>
  );

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

  const selectedRange =
    period === "Custom"
      ? getCustomRange()
      : getReportDateRange(report, period, today);
  const formatDate = (date) => {
    if (!date) return "";

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const selectedPeriodText =
    selectedRange?.fromDate && selectedRange?.toDate
      ? `${formatDate(selectedRange.fromDate)} to ${formatDate(selectedRange.toDate)}`
          : "";
  // const selectedPeriodText =
  //   selectedRange?.fromDate && selectedRange?.toDate
  //     ? `${selectedRange.fromDate} – ${selectedRange.toDate}`
  //     : "";

  const getHeaders = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const handleGenerate = async () => {
    if (isGenerating) return;

    if (
      !selectedRange?.fromDate ||
      !selectedRange?.toDate ||
      selectedRange.fromDate > selectedRange.toDate
    ) {
      setMessage("Please select a valid reporting period.");

      return;
    }

    if (startHour >= endHour) {
      setMessage("The end time must be later than the start time.");

      return;
    }

    // Validate selected zones (multi-select array)

    if (!Array.isArray(filters.Zone) || filters.Zone.length === 0) {
      setMessage("Please select at least one zone.");

      return;
    }

    const reportTypeMap = {
      "Hour-wise": "hourwise",

      "Day-wise": "daywise",

      "Week-wise": "weekwise",

      "Month-wise": "monthwise",

      "Year-wise": "yearwise",
    };

    const fromTime = `${String(startHour).padStart(2, "0")}:00:00`;

    const toTime =
      endHour === 24 ? "23:59:59" : `${String(endHour).padStart(2, "0")}:00:00`;

    // filters.Zone is an array of selected zone values.

    const zoneName = filters.Zone.join(",");

    const payload = {
      reportType: reportTypeMap[report],

      ZoneName: zoneName,

      FromDateTime: `${selectedRange.fromDate} ${fromTime}`,

      ToDateTime: `${selectedRange.toDate} ${toTime}`,
    };

    try {
      setIsGenerating(true);

      setMessage("");

      const response = await api.post(
        "historicalReports/report",

        payload,

        getHeaders(),
      );

      // Axios returns the response body in response.data.

      const result = response.data;

      if (result?.success === false) {
        throw new Error(result?.message || "Failed to generate the report.");
      }

      if (!Array.isArray(result?.grid) && !Array.isArray(result?.graph)) {
        throw new Error(
          "The API response does not contain the expected grid or graph data.",
        );
      }

      navigate("/HistoricalReports/results", {
        state: {
          reportData: result,

          criteria: {
            ...payload,

            reportLabel: report,

            period,

            filters,
          },
        },
      });
    } catch (error) {
      console.error("Unable to generate historical report:", error);

      setMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to generate the report. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const startPercent = (startHour / 24) * 100;

  const endPercent = (endHour / 24) * 100;

  return (
    <>
      <header className="historical-page-header">
        <h1>Historical Reports</h1>
      </header>

      <main className="historical-page">
        {/* <div className="historical-heading">



                <div>



                    <h1>Historical Reports</h1>



                    <p>Configure and generate occupancy reports</p>



                </div>



            </div> */}

        <div className="report-workspace">
          {/* Report Type */}

          <section className="report-type-section">
            <h2>Report Type</h2>

            <div className="report-type-grid">
              {REPORTS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`report-type-button ${
                    report === item ? "active" : ""
                  }`}
                  aria-pressed={report === item}
                  onClick={() => changeReport(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          {/* Filters */}

          <section className="report-section filters-section">
            <div className="section-heading">
              <div>
                <h2>Filters</h2>

                <p>
                  {isLoadingFilters
                    ? "Loading Country, City and Zone filters..."
                    : "Select the filters for your report. You can select multiple values."}
                </p>
              </div>
            </div>

            <div className="filter-grid">
              <div className="filter-field">
                <label>
                  <span className="filter-icon" aria-hidden="true">
                    <Globe2 size={19} strokeWidth={1.9} />
                  </span>
                  Country(s)
                </label>
                <MultiSelectFilter
                  label="Country(s)"
                  options={filterData.countries}
                  value={filters.Country}
                  onChange={(values) => changeFilter("Country", values)}
                />
              </div>
              <div className="filter-field">
                <label>
                  <span className="filter-icon" aria-hidden="true">
                    <Building2 size={19} strokeWidth={1.9} />
                  </span>
                  City(s)
                </label>
                <MultiSelectFilter
                  label="City(s)"
                  options={availableCities}
                  value={filters.City.filter((id) =>
                    availableCities.some((city) => city.value === id),
                  )}
                  onChange={(values) => changeFilter("City", values)}
                />
              </div>
              <div className="filter-field">
                <label>
                  <span className="filter-icon" aria-hidden="true">
                    <MapPinned size={19} strokeWidth={1.9} />
                  </span>
                  Zone(s)
                </label>
                <MultiSelectFilter
                  label="Zone(s)"
                  options={availableZones}
                  value={filters.Zone.filter((id) =>
                    availableZones.some((zone) => zone.value === id),
                  )}
                  onChange={(values) => changeFilter("Zone", values)}
                />
              </div>
            </div>
          </section>

          {/* Report Options */}

          <section className="report-section options-section">
            <div className="section-heading">
              <div>
                <h2>Report Options</h2>
              </div>
            </div>

            <div className="options-form">
              {/* Period selection */}

              <div className="option-block period-options-block">
                <h3>Select Period</h3>

                <div className="period-grid">
                  {availablePeriods.map((item) => {
                    const Icon = PERIOD_ICONS[item] || CalendarDays;

                    return (
                      <button
                        type="button"
                        key={item}
                        className={`period-button ${
                          period === item ? "active" : ""
                        }`}
                        aria-pressed={period === item}
                        onClick={() => changePeriod(item)}
                      >
                        <span className="period-icon" aria-hidden="true">
                          <Icon size={16} strokeWidth={1.8} />
                        </span>

                        {item}
                      </button>
                    );
                  })}
                </div>

                {/* Custom date range */}

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

                              updateFromYear,
                            )}
                          </div>

                          <div className="range-field">
                            <label htmlFor="from-week">Week No.</label>

                            {renderWeekSelect(
                              "from-week",

                              fromYear,

                              fromWeek,

                              setFromWeek,
                            )}
                          </div>
                          <p className="range-summary">
                            {formatDate(getWeekStart(fromYear, fromWeek))} to {formatDate(getWeekEnd(fromYear, fromWeek))}
                          </p>
                        </div>

                        <span className="range-separator">to</span>

                        <div className="range-group">
                          <strong>To</strong>

                          <div className="range-field">
                            <label htmlFor="to-week-year">Year</label>

                            {renderYearSelect(
                              "to-week-year",

                              toYear,

                              updateToYear,
                            )}
                          </div>

                          <div className="range-field">
                            <label htmlFor="to-week">Week No.</label>

                            {renderWeekSelect(
                              "to-week",

                              toYear,

                              toWeek,

                              setToWeek,
                            )}
                          </div>
                          <p className="range-summary">
                            {formatDate(getWeekStart(toYear, toWeek))} – {formatDate(getWeekEnd(toYear, toWeek))}
                          </p>
                        </div>
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

                              setFromYear,
                            )}
                          </div>

                          <div className="range-field">
                            <label htmlFor="from-month">Month</label>

                            {renderMonthSelect(
                              "from-month",

                              fromMonth,

                              setFromMonth,
                            )}
                          </div>
                          <p className="range-summary">
                            {formatDate(getMonthStart(fromYear, fromMonth))} – {formatDate(getMonthEnd(fromYear, fromMonth))}
                          </p>
                        </div>

                        <span className="range-separator">to</span>

                        <div className="range-group">
                          <strong>To</strong>

                          <div className="range-field">
                            <label htmlFor="to-month-year">Year</label>

                            {renderYearSelect(
                              "to-month-year",

                              toYear,

                              setToYear,
                            )}
                          </div>

                          <div className="range-field">
                            <label htmlFor="to-month">Month</label>

                            {renderMonthSelect(
                              "to-month",

                              toMonth,

                              setToMonth,
                            )}
                          </div>
                          <p className="range-summary">
                            {formatDate(getMonthStart(toYear, toMonth))} – {formatDate(getMonthEnd(toYear, toMonth))}
                          </p>
                        </div>
                      </>
                    )}

                    {reportConfig.customType === "yearRange" && (
                      <>
                        <div className="range-field">
                          <label htmlFor="from-year">From Year</label>

                          {renderYearSelect("from-year", fromYear, setFromYear)}
                        </div>

                        <span className="range-separator">to</span>

                        <div className="range-field">
                          <label htmlFor="to-year">To Year</label>

                          {renderYearSelect("to-year", toYear, setToYear)}
                        </div>
                      </>
                    )}

                    {reportConfig.customType === "yearRange" && (
                      <p className="range-summary">
                        {formatDate(`${fromYear}-01-01`)} – {formatDate(`${toYear}-12-31`)}
                      </p>
                    )}
                  </div>
                )}

                <div className="selected-period-summary" aria-live="polite">
                  <CalendarRange
                    size={17}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  <span>
                    <strong>Selected Period:</strong> {selectedPeriodText}
                  </span>
                </div>
              </div>

              {/* Time range is only for Hour-wise reports */}

              {reportConfig.showTimeRange && (
                <div className="option-block time-range-block">
                  <h3>Time Range (Hours)</h3>

                  <div className="time-range-values">
                    <span className="time-value-chip">
                      <small>From</small>

                      <strong>{String(startHour).padStart(2, "0")}:00</strong>
                    </span>

                    <span className="time-range-arrow" aria-hidden="true">
                      →
                    </span>

                    <span className="time-value-chip time-value-chip-end">
                      <small>To</small>

                      <strong>
                        {endHour === 24
                          ? "23:59"
                          : `${String(endHour).padStart(2, "0")}:00`}
                      </strong>
                    </span>
                  </div>

                  <div
                    className="time-range-slider"
                    aria-label="Select report time range"
                  >
                    <div className="time-slider-track" />

                    <div
                      className="time-slider-selected"
                      style={{
                        left: `${startPercent}%`,

                        width: `${endPercent - startPercent}%`,
                      }}
                    />

                    <input
                      className="time-slider-input time-slider-start"
                      aria-label="Start hour"
                      type="range"
                      min="0"
                      max="23"
                      step="1"
                      value={startHour}
                      style={{ zIndex: startHour > 20 ? 5 : 3 }}
                      onChange={(event) => {
                        const value = Number(event.target.value);

                        setStartHour(Math.min(value, endHour - 1));

                        setMessage("");
                      }}
                    />

                    <input
                      className="time-slider-input time-slider-end"
                      aria-label="End hour"
                      type="range"
                      min="1"
                      max="24"
                      step="1"
                      value={endHour}
                      style={{ zIndex: startHour > 20 ? 3 : 4 }}
                      onChange={(event) => {
                        const value = Number(event.target.value);

                        setEndHour(Math.max(value, startHour + 1));

                        setMessage("");
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

          {/* Footer */}

          <div className="report-action-footer">
            <div className="report-info">
              <span className="info-icon" aria-hidden="true">
                i
              </span>

              <span>
                Review the filters, period and report options before generating.
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
                    <LoaderCircle
                      className="report-loading-spinner"
                      size={17}
                    />
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
    </>
  );
}
