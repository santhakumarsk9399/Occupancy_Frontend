// import React, { useState, useEffect } from "react";
// import PropTypes from "prop-types";
// import "../../Pages/Historical Analytics/Filterbar.css";
// import { showError } from "../CommonComponents/Toaster";
// import DateFilter from "../CommonComponents/DateWidget"; // ✅ Using DateFilter
// import ExportButton from "../CommonComponents/Export";

// const formatDate = (date) =>
//   date.toLocaleDateString("en-GB").replace(/\//g, "-"); // DD-MM-YYYY

// const FilterBar = ({ filter, onApply, onClear, ExportData ,isDash2}) => {
//   const today = new Date();
// console.log(ExportData)
//   // 🧮 Helper: Find Nth weekday of a month (for last month/year same day)
//   const getNthWeekdayOfMonth = (year, month, weekday, weekNum) => {
//     const firstDay = new Date(year, month, 1);
//     const firstWeekday = firstDay.getDay();
//     const offset = (weekday - firstWeekday + 7) % 7;
//     const dayOfMonth = 1 + offset + (weekNum - 1) * 7;
//     return new Date(year, month, dayOfMonth);
//   };

//   // 🧮 Compute date based on label
//   const datefunction = (label) => {
//     const today = new Date();
//     let resultDate = new Date(today);

//     switch (label) {
//       case "Today":
//         return today;
//       case "Yesterday":
//         resultDate.setDate(today.getDate() - 1);
//         return resultDate;
//       case "Last Week Same Day":
//         resultDate.setDate(today.getDate() - 7);
//         return resultDate;
//       case "Last Month Same Day": {
//         const year = today.getFullYear();
//         const month = today.getMonth();
//         const weekday = today.getDay();
//         const weekNum = Math.ceil(today.getDate() / 7);
//         return getNthWeekdayOfMonth(year, month - 1, weekday, weekNum);
//       }
//       case "Last Year Same Day": {
//         const year = today.getFullYear() - 1;
//         const month = today.getMonth();
//         const weekday = today.getDay();
//         const weekNum = Math.ceil(today.getDate() / 7);
//         return getNthWeekdayOfMonth(year, month, weekday, weekNum);
//       }
//       default:
//         return today;
//     }
//   };

//   // Filter options
//   const options = [
//     { key: "Yesterday", label: "Yesterday" },
//     { key: "Last Week Same Day", label: "Last Week Same Day" },
//     { key: "Last Month Same Day", label: "Last Month Same Day" },
//     { key: "Last Year Same Day", label: "Last Year Same Day" },
//     { key: "Custom", label: "Custom" },
//   ];

//   // 🟢 States
//   const [selectedFilter, setSelectedFilter] = useState(filter); // dropdown selection (temporary)
//   const [customDate, setCustomDate] = useState("");
//   const [appliedFilter, setAppliedFilter] = useState(filter); // confirmed filter
//   const [appliedDate, setAppliedDate] = useState("");

//   // Initialize applied filter & date on mount or prop change
//   useEffect(() => {
//     const initialDate = datefunction(filter);
//     setAppliedFilter(filter);
//     setAppliedDate(formatDate(initialDate));
//     setSelectedFilter(filter);
//   }, [filter]);

//   // ✅ Apply button: confirm filter and trigger API
//   const handleApply = () => {
//     let date;
//     if (selectedFilter === "Custom") {
//       if (!customDate) {
//         showError("Please select a date before applying");
//         return;
//       }
//       date = new Date(customDate);
//     } else {
//       date = datefunction(selectedFilter);
//     }

//     const formatted = formatDate(date);
//     setAppliedFilter(selectedFilter);
//     setAppliedDate(formatted);
//     onApply(formatted); // trigger API
//   };


// const handleClear = () => {
//   // Only reset if applied filter is NOT already Yesterday
//   if (appliedFilter === "Yesterday") {
//     console.log("Already applied Yesterday filter — skipping API call");
//     return;
//   }

//   const yesterday = datefunction("Yesterday");
//   const formatted = formatDate(yesterday);

//   // Reset states
//   setSelectedFilter("Yesterday"); // update dropdown
//   setCustomDate(""); // reset date picker
//   setAppliedFilter("Yesterday"); // update applied filter
//   setAppliedDate(formatted);

//   // ✅ Trigger API for Yesterday
//   if (onApply) onApply(formatted);

//   // optional: notify parent clear
//   if (onClear) onClear();
// };

//   return (
//     <div className="filter-bar" onSubmit={(e) => e.preventDefault()}>
//       <div className="selctedlabel">
//         <h5 className="mb-0">
//           <span className="SelecedFilterLabel">{appliedFilter}</span>
//           <span className="SelecedFilterLabel">{appliedDate}</span>
//         </h5>
//       </div>

//       <div className="filteroptions">
//         <span>Filter</span>

//         {/* Dropdown — changes only local state */}
//         <select
//           className="filter-dropdown"
//           value={selectedFilter}
//           onChange={(e) => setSelectedFilter(e.target.value)}
//         >
//           {options.map((opt) => (
//             <option key={opt.key} value={opt.key}>
//               {opt.label}
//             </option>
//           ))}
//         </select>

//         {/* ✅ Show DateFilter only for Custom */}
//         {selectedFilter === "Custom" && (
//           <>
//           <DateFilter
//             value={customDate}
//             onChange={(e) => setCustomDate(e.target.value)}
//             onClear={handleClear}
//             onApply={handleApply}
//             disableClear={!customDate}
//             historical={true}
//           />
//             {isDash2 && (ExportData && ExportData.length > 0) && (<ExportButton data={ExportData} date={appliedDate} />)}
//             </>
//         )}

//         {/* ✅ Buttons for other filters */}
//         {selectedFilter !== "Custom" && (
//           <>
//             <button type="button" className="apply-btn" onClick={handleApply}>
//               Apply
//             </button>
//             <button type="button" className="clear-btn" onClick={handleClear}>
//               Clear
//             </button>
//             {isDash2 && (ExportData && ExportData.length > 0) && (<ExportButton data={ExportData} date={appliedDate} />)}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// FilterBar.propTypes = {
//   filter: PropTypes.string.isRequired,
//   onApply: PropTypes.func.isRequired,
//   onClear: PropTypes.func,
// };

// export default FilterBar;


import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import "../../Pages/Historical Analytics/Filterbar.css";

import { showError } from "../CommonComponents/Toaster";
import ExportButton from "../CommonComponents/Export";
import DateTimeFilter from "./DatetimeFilter";

// Format date as DD-MM-YYYY
const formatDate = (date) =>
  date.toLocaleDateString("en-GB").replace(/\//g, "-");

// Get current date and time defaults
const getDefaultValues = () => {
  const now = new Date();

  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");

  const currentTime =
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0");

  return {
    date,
    startTime: "00:00",
    endTime: currentTime
  };
};

const FilterBar = ({
  filter,
  onApply,
  onClear,
  ExportData,
  isDash2
}) => {

  // Find Nth weekday of a month
  const getNthWeekdayOfMonth = (
    year,
    month,
    weekday,
    weekNum
  ) => {
    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay();

    const offset =
      (weekday - firstWeekday + 7) % 7;

    const dayOfMonth =
      1 + offset + (weekNum - 1) * 7;

    return new Date(year, month, dayOfMonth);
  };

  // Calculate date based on selected filter
  const datefunction = (label) => {

    const today = new Date();
    let resultDate = new Date(today);

    switch (label) {

      case "Today":
        return today;

      case "Yesterday":
        resultDate.setDate(today.getDate() - 1);
        return resultDate;

      case "Last Week Same Day":
        resultDate.setDate(today.getDate() - 7);
        return resultDate;

      case "Last Month Same Day": {
        const year = today.getFullYear();
        const month = today.getMonth();
        const weekday = today.getDay();
        const weekNum = Math.ceil(today.getDate() / 7);

        return getNthWeekdayOfMonth(
          year,
          month - 1,
          weekday,
          weekNum
        );
      }

      case "Last Year Same Day": {
        const year = today.getFullYear() - 1;
        const month = today.getMonth();
        const weekday = today.getDay();
        const weekNum = Math.ceil(today.getDate() / 7);

        return getNthWeekdayOfMonth(
          year,
          month,
          weekday,
          weekNum
        );
      }

      default:
        return today;
    }
  };

  // Filter options
  const options = [
    { key: "Yesterday", label: "Yesterday" },
    { key: "Last Week Same Day", label: "Last Week Same Day" },
    { key: "Last Month Same Day", label: "Last Month Same Day" },
    { key: "Last Year Same Day", label: "Last Year Same Day" },
    { key: "Custom", label: "Custom" }
  ];

  // Dropdown and applied filter states
  const [selectedFilter, setSelectedFilter] = useState(filter);

  const [appliedFilter, setAppliedFilter] = useState(filter);
  const [appliedDate, setAppliedDate] = useState("");

  // Custom date and time states
  const [filters, setFilters] = useState(getDefaultValues);

  // Initialize filter when parent prop changes
  useEffect(() => {

    const initialDate = datefunction(filter);

    setAppliedFilter(filter);
    setAppliedDate(formatDate(initialDate));
    setSelectedFilter(filter);

  }, [filter]);

  // Apply button
  // const handleApply = () => {

  //   // CUSTOM DATE + TIME FILTER
  //   if (selectedFilter === "Custom") {

  //     const {
  //       date,
  //       startTime,
  //       endTime
  //     } = filters;

  //     if (!date || !startTime || !endTime) {
  //       showError(
  //         "Please select date, start time and end time"
  //       );
  //       return;
  //     }

  //     if (startTime >= endTime) {
  //       showError(
  //         "End time must be greater than start time"
  //       );
  //       return;
  //     }

  //     // Format YYYY-MM-DD into DD-MM-YYYY
  //     const [year, month, day] = date.split("-");

  //     const formatted = `${day}-${month}-${year}`;

  //     setAppliedFilter("Custom");
  //     setAppliedDate(formatted);

  //     // Send date and time values to parent
  //     onApply(formatted, {
  //       date,
  //       startTime,
  //       endTime
  //     });

  //     return;
  //   }

  //   // EXISTING PREDEFINED FILTERS
  //   const selectedDate = datefunction(selectedFilter);

  //   const formatted = formatDate(selectedDate);

  //   setAppliedFilter(selectedFilter);
  //   setAppliedDate(formatted);

  //   onApply(formatted);
  // };

  const handleApply = () => {

    // CUSTOM DATE + TIME FILTER
    if (selectedFilter === "Custom") {

      const { date, startTime, endTime } = filters;

      if (!date || !startTime || !endTime) {
        showError("Please select date, start time and end time");
        return;
      }

      if (startTime >= endTime) {
        showError("End time must be greater than start time");
        return;
      }

      // Convert YYYY-MM-DD to DD-MM-YYYY
      const [year, month, day] = date.split("-");
      const formatted = `${day}-${month}-${year}`;

      setAppliedFilter("Custom");
      setAppliedDate(formatted);

      // Only pass the time object as second argument
      const dateTimeFilter = {
        startTime,
        endTime
      };

      console.log("FilterBar sending:", {
        date: formatted,
        dateTimeFilter
      });

      onApply(formatted, dateTimeFilter);

      return;
    }

    // PREDEFINED FILTERS
    const selectedDate = datefunction(selectedFilter);
    const formatted = formatDate(selectedDate);

    setAppliedFilter(selectedFilter);
    setAppliedDate(formatted);

    // No time filter for predefined dates
    onApply(formatted, null);
  };
  
  // Clear button for predefined filters
  const handleClear = () => {

    if (appliedFilter === "Yesterday") {
      console.log(
        "Already applied Yesterday filter — skipping API call"
      );
      return;
    }

    const yesterday = datefunction("Yesterday");
    const formatted = formatDate(yesterday);

    setSelectedFilter("Yesterday");
    setAppliedFilter("Yesterday");
    setAppliedDate(formatted);

    // Reset custom date and time values
    setFilters({
      date: "",
      startTime: "",
      endTime: ""
    });

    if (onApply) {
      onApply(formatted);
    }

    if (onClear) {
      onClear();
    }
  };

  // Clear only Custom date and time
  const handleCustomClear = () => {

    setFilters({
      date: "",
      startTime: "",
      endTime: ""
    });

  };

  return (
    <div
      className="filter-bar"
      onSubmit={(e) => e.preventDefault()}
    >

      {/* Applied filter label */}
      <div className="selctedlabel">

        <h5 className="mb-0">

          <span className="SelecedFilterLabel">
            {appliedFilter}
          </span>

          <span className="SelecedFilterLabel">
            {appliedDate}
          </span>

        </h5>

      </div>

      <div className="filteroptions">

        <span>Filter</span>

        {/* Filter dropdown */}
        <select
          className="filter-dropdown"
          value={selectedFilter}
          onChange={(e) =>
            setSelectedFilter(e.target.value)
          }
        >

          {options.map((opt) => (
            <option
              key={opt.key}
              value={opt.key}
            >
              {opt.label}
            </option>
          ))}

        </select>

        {/* CUSTOM DATE + TIME FILTER */}
        {selectedFilter === "Custom" && (
          <>

            <DateTimeFilter
              date={filters.date}
              startTime={filters.startTime}
              endTime={filters.endTime}

              onDateChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  date: value
                }))
              }

              onStartTimeChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  startTime: value
                }))
              }

              onEndTimeChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  endTime: value
                }))
              }

              onClear={handleCustomClear}

              onApply={handleApply}

              disableClear={
                !filters.date &&
                !filters.startTime &&
                !filters.endTime
              }
            />

            {isDash2 &&
              ExportData &&
              ExportData.length > 0 && (
                <ExportButton
                  data={ExportData}
                  date={appliedDate}
                />
              )}

          </>
        )}

        {/* EXISTING PREDEFINED FILTER BUTTONS */}
        {selectedFilter !== "Custom" && (
          <>

            <button
              type="button"
              className="apply-btn"
              onClick={handleApply}
            >
              Apply
            </button>

            <button
              type="button"
              className="clear-btn"
              onClick={handleClear}
            >
              Clear
            </button>

            {isDash2 &&
              ExportData &&
              ExportData.length > 0 && (
                <ExportButton
                  data={ExportData}
                  date={appliedDate}
                />
              )}

          </>
        )}

      </div>

    </div>
  );
};

FilterBar.propTypes = {
  filter: PropTypes.string.isRequired,
  onApply: PropTypes.func.isRequired,
  onClear: PropTypes.func,
  ExportData: PropTypes.array,
  isDash2: PropTypes.bool
};

export default FilterBar;
