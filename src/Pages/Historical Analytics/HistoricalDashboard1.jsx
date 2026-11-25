import React, { useState, useEffect, useRef } from "react";
import FilterBar from "../../Pages/Historical Analytics/FilterBar";
import StatsCards from "../../Pages/Historical Analytics/StatsCard";
import axios from "axios";
import NoData from "../CommonComponents/NoDataAvailable";
import HistoricalDash1Chart2 from "./HistoricalDash1Chart2";
import "../Historical Analytics/HistoricalChart.css";

const HistoricalDashboard1 = ({ filterVersion ,zonesFromParent }) => {
  // console.log(filterVersion)
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const today = new Date();
  const yesterdayDate = new Date(today);
  yesterdayDate.setDate(today.getDate() - 1);
  const yesterdayStr = formatDate(yesterdayDate);

  const token = sessionStorage.getItem("token");
  const vid = sessionStorage.getItem("vid");
  const username = sessionStorage.getItem("username");
  const API_URL = import.meta.env.VITE_API_URL;

  const [filter, setFilter] = useState("Yesterday");
  const [zoneNames, setZoneNames] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedFilterValue, setSelectedFilterValue] = useState(yesterdayStr);
  const [appliedDateTime, setAppliedDateTime] = useState(null);
  const [pageLoading, setPageLoading] = useState(true); // loader state

  const didFetch = useRef(false);

  const getSelectedZones = async () => {
    setPageLoading(true); // show loader
    try {
      const payload = { vid, username, country: "", city: "", zone: "" };
      const response = await axios.get(
        `${API_URL}/dashboard/dashboardFilter/getSelectedZones`,
        { headers: { Authorization: `Bearer ${token}` }, params: payload }
      );

      const rawData = response.data?.data || [];
      const zoneData = Array.isArray(rawData) ? rawData : [rawData];
      const zonesArray = zoneData[0]?.selectedZones || [];
      setZoneNames(zonesArray);
      await getHistoricalData(zonesArray.join(","), yesterdayStr);
    } catch (e) {
      console.error("Error fetching zones:", e);
      setHistoricalData([]);
    } finally {
      setPageLoading(false); // hide loader
    }
  };

//   const getHistoricalData = async (zonesInput, filterValue, dateTimeFilter = null ) => {
//     setPageLoading(true); // show loader
//     try {
//       const zonesString = Array.isArray(zonesInput)
//       ? zonesInput.map(z => (typeof z === "object" ? z.label : z)).join(",")
//       : zonesInput;
//       const payload = {
//         zoneName: zonesString,
//         fromDate: filterValue,
//       };

//       if (dateTimeFilter) {
//         payload.startTime = dateTimeFilter.startTime;
//         payload.endTime = dateTimeFilter.endTime;
//       }

//       const res = await axios.get(
//         `${API_URL}/dashboard/getHistoricalDashboard1Data`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           params: payload,
//           paramsSerializer: (params) => {
//             const query = new URLSearchParams();

//             query.append("zoneName", params.zoneName);
//             query.append("fromDate", params.fromDate);

//             if (params.startTime && params.endTime) {
//               query.append("startTime", params.startTime);
//               query.append("endTime", params.endTime);
//             }
// console.log(query,"---------------------------")
//             return query.toString();
//           },
//         }
//       );

//       setHistoricalData(res.data || []);
//     } catch (error) {
//       console.error("Error fetching historical data:", error);
//       setHistoricalData([]);
//     } finally {
//       setPageLoading(false); // hide loader
//     }
//   };

  const getHistoricalData = async (
    zonesInput,
    filterValue,
    dateTimeFilter = null
  ) => {
    setPageLoading(true);

    try {
      // Convert zones into comma-separated string
      const zonesString = Array.isArray(zonesInput)
        ? zonesInput
          .map((z) => typeof z === "object" ? z.label : z)
          .join(",")
        : zonesInput;

      // Default full-day time range for predefined filters
      const startTime = dateTimeFilter
        ? dateTimeFilter.startTime
        : "00:00";

      const endTime = dateTimeFilter
        ? dateTimeFilter.endTime
        : "23:59";

      // Construct API date-time values
      const payload = {
        zoneName: zonesString,
        fromDate:filterValue
        // startDate: `${filterValue}, ${startTime}:00`,
        // endDate: `${filterValue}, ${endTime}:59`
      };

      console.log("========== API REQUEST ==========");
      console.log("Payload:", payload);
      console.log("=================================");

      const res = await axios.get(
        `${API_URL}/dashboard/getHistoricalDashboard1Data`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: payload
        }
      );

      console.log("API Response:", res.data);

      setHistoricalData(res.data || []);

    } catch (error) {
      console.error("Error fetching historical data:", error);
      console.error("API Error:", error.response?.data);

      setHistoricalData([]);

    } finally {
      setPageLoading(false);
    }
  };


  const handleApply = (dateValue, dateTimeFilter = null) => {

    const finalDate = dateValue || selectedFilterValue;

    // Keep existing selected zones
    const finalZonesArray = zoneNames;

    setSelectedFilterValue(finalDate);
    setAppliedDateTime(dateTimeFilter);

    getHistoricalData(
      finalZonesArray,
      finalDate,
      dateTimeFilter
    );
  };

  // const handleApply = (dateValue, selectedZones, dateTimeFilter = null) => {
  //   const finalDate = dateValue || selectedFilterValue;
  //   const finalZonesArray = selectedZones?.length
  //     ? selectedZones
  //     : zoneNames;
  //   setSelectedFilterValue(finalDate);
  //   setZoneNames(finalZonesArray);
  //   setAppliedDateTime(dateTimeFilter);
  //   getHistoricalData(finalZonesArray,finalDate,dateTimeFilter);
  // };
  // const handleApply = (dateValue, selectedZones) => {
  //   const finalDate = dateValue || selectedFilterValue;
  //   const finalZonesArray = selectedZones?.length ? selectedZones : zoneNames;
  //   console.log(finalZonesArray)
  //   setSelectedFilterValue(finalDate);
  //   setZoneNames(finalZonesArray);
  //   getHistoricalData(finalZonesArray, finalDate);
  // };

  // const handleClear = () => {
  //   setSelectedFilterValue(yesterdayStr);
  //   getHistoricalData(zoneNames.join(","), yesterdayStr);
  // };
  const handleClear = () => {
    setSelectedFilterValue(yesterdayStr);
    setAppliedDateTime(null);

    getHistoricalData(
      zoneNames,
      yesterdayStr,
      null
    );
  };
  useEffect(() => {
    if (!didFetch.current) {
      getSelectedZones();
      didFetch.current = true;
    }
  }, []);
useEffect(() => {
  if (filterVersion > 0) {
    if (zonesFromParent?.length > 0) {
      getHistoricalData(
        zonesFromParent,
        selectedFilterValue,
        appliedDateTime
      );

      setZoneNames(zonesFromParent);
    }else {
      getSelectedZones();
    }
  }
}, [filterVersion, zonesFromParent]);

  return (
    // <div className="analytics-container">
          <div className="dash2-container historical-dash2">
      <FilterBar filter={filter} onApply={handleApply} onClear={handleClear} />
      {pageLoading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "70vh",
            borderRadius: "12px",
          }}
        >
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "2rem", height: "2rem" }}
          />
          <p className="mt-3 text-muted">Loading data...</p>
        </div>
      ) : historicalData && historicalData?.data?.length > 0 ? (
        <>
          <StatsCards data={historicalData?.summary} />
          {/* <HistoricalAnalyticsChart   data={dataz} /> */}
          <HistoricalDash1Chart2 data={historicalData?.data} />
          {/* data={historicalData?.data} */}
        </>
      ) : (
        <NoData name="no-data-Historical_dashboard" />
      )}
    </div>
  );
};

export default HistoricalDashboard1;