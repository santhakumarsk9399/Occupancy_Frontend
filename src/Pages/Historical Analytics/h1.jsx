import React, { useState, useEffect } from "react";
import FilterBar from "../../Pages/Historical Analytics/FilterBar";
import StatsCards from "../../Pages/Historical Analytics/StatsCard";
import HistoricalAnalyticsChart from "./HistoricalDash1Chart";
import axios from "axios";
import NoData from "../CommonComponents/NoDataAvailable";

const HistoricalDashboard1 = ({ zonesFromParent = [], filterDate }) => {
  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const yesterdayStr = formatDate(new Date(Date.now() - 86400000));

  const token = sessionStorage.getItem("token");
  const vid = sessionStorage.getItem("vid");
  const username = sessionStorage.getItem("username");
  const API_URL = import.meta.env.VITE_API_URL;

  const [zoneNames, setZoneNames] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  // --- Fetch Zones (initial load only) ---
  const getSelectedZones = async () => {
    try {
      const payload = { vid, username, country: "", city: "", zone: "" };
      const response = await axios.get(
        `${API_URL}/dashboard/dashboardFilter/getSelectedZones`,
        { headers: { Authorization: `Bearer ${token}` }, params: payload }
      );

      const rawData = response.data?.data || [];
      const zonesArray = Array.isArray(rawData)
        ? rawData[0]?.selectedZones || []
        : rawData.selectedZones || [];

      setZoneNames(zonesArray);
      getHistoricalData(zonesArray.join(","), yesterdayStr);
    } catch (e) {
      console.error("Error fetching zones:", e);
      setHistoricalData([]);
    } finally {
      setPageLoading(false);
    }
  };

  // --- Fetch Historical Data ---
  const getHistoricalData = async (zonesString, filterValue) => {
    if (!zonesString) return;
    setPageLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/dashboard/getHistoricalDashboard1Data`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { zoneName: zonesString, fromDate: filterValue },
        }
      );
      setHistoricalData(res.data || []);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      setHistoricalData([]);
    } finally {
      setPageLoading(false);
    }
  };

  // --- Effect: Initial Load ---
  useEffect(() => {
    if (!zonesFromParent.length) {
      getSelectedZones();
    }
  }, []);

  // --- Effect: When parent filter changes ---
  useEffect(() => {
    if (zonesFromParent.length) {
      setZoneNames(zonesFromParent);
      getHistoricalData(zonesFromParent.join(","), filterDate || yesterdayStr);
    }
  }, [zonesFromParent, filterDate]);

  return (
    <div className="analytics-container">
      {pageLoading ? (
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ height: "70vh" }}
        >
          <div
            className="spinner-border text-primary"
            style={{ width: "2rem", height: "2rem" }}
          />
          <p className="mt-3 text-muted">Loading data...</p>
        </div>
      ) : historicalData && historicalData?.data?.length > 0 ? (
        <>
          <StatsCards data={historicalData?.summary} />
          <HistoricalAnalyticsChart data={historicalData?.data} />
        </>
      ) : (
        <NoData name="no-data-Historical_dashboard" />
      )}
    </div>
  );
};

export default HistoricalDashboard1;
