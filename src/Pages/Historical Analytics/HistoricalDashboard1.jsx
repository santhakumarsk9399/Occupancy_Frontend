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

  const getHistoricalData = async (zonesInput, filterValue) => {
    setPageLoading(true); // show loader
    try {
      const zonesString = Array.isArray(zonesInput)
      ? zonesInput.map(z => (typeof z === "object" ? z.label : z)).join(",")
      : zonesInput;
      const payload = {
        zoneName: zonesString,
        fromDate: filterValue,
      };

      const res = await axios.get(
        `${API_URL}/dashboard/getHistoricalDashboard1Data`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: payload,
          paramsSerializer: (params) => {
            const query = new URLSearchParams();
            query.append("zoneName", params.zoneName);
            query.append("fromDate", params.fromDate);
            return query.toString();
          },
        }
      );

      setHistoricalData(res.data || []);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      setHistoricalData([]);
    } finally {
      setPageLoading(false); // hide loader
    }
  };

  const handleApply = (dateValue, selectedZones) => {
    const finalDate = dateValue || selectedFilterValue;
    const finalZonesArray = selectedZones?.length ? selectedZones : zoneNames;
    console.log(finalZonesArray)
    setSelectedFilterValue(finalDate);
    setZoneNames(finalZonesArray);
    getHistoricalData(finalZonesArray, finalDate);
  };

  const handleClear = () => {
    setSelectedFilterValue(yesterdayStr);
    getHistoricalData(zoneNames.join(","), yesterdayStr);
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
      getHistoricalData(zonesFromParent, selectedFilterValue);
      setZoneNames(zonesFromParent);
    } else {
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