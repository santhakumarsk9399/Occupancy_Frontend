import React, { useState, useEffect, useMemo } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Modal } from "react-bootstrap";
import MultiSelectDropdown from "../CommonComponents/MultiSelectDropDown";
import NoData from "../CommonComponents/NoDataAvailable";
import UnitDetailsModal from "./UnitDetailsModal";
import axios from "axios";
import "./HealthDashboard.css";

const HealthStatusTab = ({ data, onRefresh }) => {
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState('online');
  const [showChartModal, setShowChartModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    countries: [],
    cities: [],
  });
  const [loading, setLoading] = useState(false);
  const [pieChartData, setPieChartData] = useState(null);
  const [unitsData, setUnitsData] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [statusRowCounts, setStatusRowCounts] = useState({
    online: 0,
    offline: 0,
    onlineIdle: 0,
  });

  const token = sessionStorage.getItem("token");
  const vid = sessionStorage.getItem("vid");
  const username = sessionStorage.getItem("username");
  const API_URL = import.meta.env.VITE_API_URL || "http://delbi2dev.deloptanalytics.com:3000";

  // ─── IST Conversion Utility ───────────────────────────────────────────────
const convertToIST = (utcDateStr) => {
  if (!utcDateStr) return "";
  // Normalize "YYYY-MM-DD HH:mm:ss.mmm" → "YYYY-MM-DDTHH:mm:ss.mmmZ"
  const normalized = utcDateStr.toString().trim().replace(" ", "T") + "Z";
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return utcDateStr;
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffsetMs);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${istDate.getUTCFullYear()}-` +
    `${pad(istDate.getUTCMonth() + 1)}-` +
    `${pad(istDate.getUTCDate())} ` +
    `${pad(istDate.getUTCHours())}:` +
    `${pad(istDate.getUTCMinutes())}:` +
    `${pad(istDate.getUTCSeconds())}`
  );
};
  // ─────────────────────────────────────────────────────────────────────────

  const handleCountryChange = (newCountries) => {
    setSelectedCountries(newCountries);
    setSelectedCities((prevCities) =>
      prevCities.filter((city) =>
        newCountries.some((country) => country.value === city.country)
      )
    );
  };

  const handleCityChange = (newCities) => {
    setSelectedCities(newCities);
  };

  // Fetch all available countries (no filters) - runs only on mount
  useEffect(() => {
    const fetchAllCountries = async () => {
      try {
        const payload = {
          vid: vid || "52",
          username: username || "Occupancy",
          country: "",
          city: "",
          zone: "",
        };

        console.log("Fetching all countries with payload:", payload);

        const response = await axios.post(
          `${API_URL}/dashboard/healthDashboard/Filter`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("All Countries API Response:", response.data);

        if (response.data.success) {
          const countriesData = (response.data.country || []).map((item) => ({
            value: item.Country || "",
            label: item.Country || "",
          }));

          console.log("Countries options updated:", countriesData);

          setFilterOptions((prev) => ({
            ...prev,
            countries: countriesData,
          }));
        }
      } catch (error) {
        console.error("Error fetching all countries:", {
          message: error.message,
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data,
        });
      }
    };

    if (vid && username && token) {
      fetchAllCountries();
    }
  }, [vid, username, token, API_URL]);

  // Fetch cities filtered by selected countries - runs when countries change
  useEffect(() => {
    const fetchCitiesByCountries = async () => {
      try {
        const payload = {
          vid: vid || "52",
          username: username || "Occupancy",
          country: selectedCountries.length > 0 ? selectedCountries.map(c => c.value).join(",") : "",
          city: "",
          zone: "",
        };

        console.log("Fetching cities with payload:", payload);

        const response = await axios.post(
          `${API_URL}/dashboard/healthDashboard/Filter`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Cities API Response:", response.data);

        if (response.data.success) {
          const citiesData = (response.data.city || []).map((item) => ({
            value: item.City || "",
            label: item.City || "",
            country: item.Country || "",
          }));

          console.log("Cities options updated:", citiesData);

          setFilterOptions((prev) => ({
            ...prev,
            cities: citiesData,
          }));
        }
      } catch (error) {
        console.error("Error fetching cities:", {
          message: error.message,
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data,
        });
      }
    };

    if (vid && username && token) {
      fetchCitiesByCountries();
    }
  }, [vid, username, token, selectedCountries, API_URL]);

  // Fetch row count for each status grid
  useEffect(() => {
    const fetchStatusGridCounts = async () => {
      try {
        const payload = {
          vid: vid || "52",
          username: username || "Occupancy",
          country: selectedCountries.length > 0 ? selectedCountries.map(c => c.value).join(",") : "",
          city: selectedCities.length > 0 ? selectedCities.map(c => c.value).join(",") : "",
        };

        const endpointMap = {
          online: "healthOnline",
          offline: "healthOffline",
          onlineIdle: "healthOnlineIdle",
        };

        const responses = await Promise.all(
          Object.values(endpointMap).map((endpoint) =>
            axios.post(
              `${API_URL}/dashboard/healthDashboard/${endpoint}`,
              payload,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            ).catch(() => ({ data: { success: false, data: [] } }))
          )
        );

        const counts = Object.keys(endpointMap).reduce((acc, status, index) => {
          const response = responses[index];
          const count =
            response?.data?.success && Array.isArray(response.data.data)
              ? response.data.data.length
              : 0;
          acc[status] = count;
          return acc;
        }, { online: 0, offline: 0, onlineIdle: 0 });

        setStatusRowCounts(counts);
      } catch (error) {
        console.error("Error fetching status grid counts:", {
          message: error.message,
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data,
        });
      }
    };

    if (vid && username && token) {
      fetchStatusGridCounts();
    }
  }, [vid, username, token, selectedCountries, selectedCities]);

  // Fetch mall health status data from API
  useEffect(() => {
    const fetchPieChartData = async () => {
      try {
        const payload = {
          vid: vid || "52",
          username: username || "Occupancy",
        };

        const response = await axios.post(
          `${API_URL}/dashboard/healthDashboard/pieChartStatus`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success && response.data.PiechartData) {
          const statusItem = response.data.PiechartData[0][0] || {};
          const transformedData = {
            online: Number(statusItem.HealthOnline || 0),
            offline: Number(statusItem.HealthOffline || 0),
            onlineIdle: Number(statusItem.HealthOnlineIdle || 0),
          };
          setPieChartData(transformedData);
          return;
        }

        setPieChartData(null);
      } catch (error) {
        console.error("Error fetching mall health status data:", {
          message: error.message,
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data,
        });
        setPieChartData(null);
      }
    };

    if (vid && username && token) {
      fetchPieChartData();
    }
  }, [vid, username, token]);

  // Get API endpoint based on selected status
  const getStatusApiEndpoint = (status) => {
    const statusMap = {
      online: "healthOnline",
      offline: "healthOffline",
      onlineIdle: "healthOnlineIdle",
    };
    return statusMap[status] || "healthOnline";
  };

  // Fetch units data from API based on selected status and filters
  useEffect(() => {
    const fetchUnitsData = async () => {
      try {
        setUnitsLoading(true);

        const payload = {
          vid: vid || "52",
          username: username || "Occupancy",
          country: selectedCountries.length > 0 ? selectedCountries.map(c => c.value).join(",") : "",
          city: selectedCities.length > 0 ? selectedCities.map(c => c.value).join(",") : "",
        };

        const endpoint = getStatusApiEndpoint(selectedStatus);
        const response = await axios.post(
          `${API_URL}/dashboard/healthDashboard/${endpoint}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success && response.data.data) {
          // Transform API response and convert lastFileReceived UTC → IST
          const transformedUnits = response.data.data.map((item, idx) => ({
            id: idx + 1,
            name: item.UNITNAME || item.name || "",
            lastFileReceived: convertToIST(item.LASTFILERECEIVED || item.lastFileReceived || ""),
            country: selectedCountries.length > 0 ? selectedCountries[0]?.value : "",
            city: selectedCities.length > 0 ? selectedCities[0]?.value : "",
            status: selectedStatus,
          }));

          setUnitsData(transformedUnits);
        }
      } catch (error) {
        console.error("Error fetching units data:", {
          message: error.message,
          status: error.response?.status,
          url: error.config?.url,
          endpoint: getStatusApiEndpoint(selectedStatus),
          data: error.response?.data,
        });
        setUnitsData([]);
      } finally {
        setUnitsLoading(false);
      }
    };

    if (vid && username && token && selectedStatus) {
      fetchUnitsData();
    }
  }, [vid, username, token, selectedStatus, selectedCountries, selectedCities]);

  const healthData = pieChartData || data || { online: 0, offline: 0, onlineIdle: 0 };
  const chartData = [
    { name: "Online", value: healthData.online, color: "#10b981" },
    { name: "Offline", value: healthData.offline, color: "#ef4444" },
    { name: "Online Idle", value: healthData.onlineIdle, color: "#9ca3af" },
  ];

  const totalSensors = healthData.online + healthData.offline + healthData.onlineIdle;
  const onlinePercentage = totalSensors > 0 ? Math.round((healthData.online / totalSensors) * 100) : 0;
  const offlinePercentage = totalSensors > 0 ? Math.round((healthData.offline / totalSensors) * 100) : 0;
  const idlePercentage = totalSensors > 0 ? Math.round((healthData.onlineIdle / totalSensors) * 100) : 0;

  // Memoize countries options
  const countriesOptions = useMemo(() => {
    return filterOptions.countries || [];
  }, [filterOptions.countries]);

  // Memoize cities options - filter by selected countries
  const citiesOptions = useMemo(() => {
    if (selectedCountries.length === 0) {
      return filterOptions.cities || [];
    }
    const selectedCountryValues = selectedCountries.map((c) => c.value);
    return (filterOptions.cities || []).filter((city) =>
      selectedCountryValues.includes(city.country)
    );
  }, [selectedCountries, filterOptions.cities]);

  // Keep only cities that still belong to the currently selected countries
  useEffect(() => {
    setSelectedCities((prevCities) => {
      if (selectedCountries.length === 0) {
        return [];
      }

      return prevCities.filter((city) =>
        selectedCountries.some((country) => country.value === city.country)
      );
    });
  }, [selectedCountries]);

  // Memoize filtered units
  const filteredUnits = useMemo(() => {
    let filtered = unitsData || [];
    if (filterText) {
      filtered = filtered.filter((u) =>
        u.name.toLowerCase().includes(filterText.toLowerCase())
      );
    }
    return filtered;
  }, [selectedStatus, selectedCountries, selectedCities, filterText, unitsData]);

  // Handle status card click
  const handleStatusClick = (status) => {
    const nextStatus = selectedStatus === status ? null : status;

    setSelectedStatus(nextStatus);
    setSelectedCountries([]);
    setSelectedCities([]);
    setFilterText("");
  };

  // Handle unit row click
  const handleUnitClick = (unit) => {
    setSelectedUnit(unit);
    setShowUnitModal(true);
  };

  const escapeCsvValue = (value) => {
    const text = value == null ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };

  const formatCsvTextCell = (value) => {
    const text = value == null ? "" : String(value);
    const escaped = text.replace(/"/g, '""');
    return `"=""${escaped}"""`;
  };

  const handleExport = () => {
    const rows = [
      ["SL", "UNIT NAME", "LAST FILE RECEIVED "],
      ...filteredUnits.map((unit, idx) => [
        idx + 1,
        escapeCsvValue(unit.name),
        // lastFileReceived is already converted to IST at load time
        formatCsvTextCell(unit.lastFileReceived),
      ]),
    ];

    const csvContent = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "HealthStatus_Devices.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="health-status-content">
      {/* Status Cards */}
      <div className="health-status-cards">
        <div
          className={`health-status-card online ${selectedStatus === 'online' ? 'selected' : ''}`}
          onClick={() => handleStatusClick('online')}
          style={{ cursor: 'pointer' }}
        >
          <span className="health-card-label">Online - {statusRowCounts.online}</span>
        </div>
        <div
          className={`health-status-card offline ${selectedStatus === 'offline' ? 'selected' : ''}`}
          onClick={() => handleStatusClick('offline')}
          style={{ cursor: 'pointer' }}
        >
          <span className="health-card-label">Offline - {statusRowCounts.offline}</span>
        </div>
        <div
          className={`health-status-card idle ${selectedStatus === 'onlineIdle' ? 'selected' : ''}`}
          onClick={() => handleStatusClick('onlineIdle')}
          style={{ cursor: 'pointer' }}
        >
          <span className="health-card-label">OnlineIdle - {statusRowCounts.onlineIdle}</span>
        </div>
      </div>

      <div className="health-main-layout">
        {/* Left Section - Pie Chart */}
        <div className="health-chart-section">
          <div className="health-chart-header">
            <button
              className="health-chart-enlarge-btn"
              onClick={() => setShowChartModal(true)}
              title="Enlarge Chart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z" />
              </svg>
            </button>
          </div>

          <div className="health-chart-legends">
            <div className="legend-item">
              <span className="legend-value" style={{ color: "#10b981", fontWeight: "bold" }}>
                {onlinePercentage}%
              </span>
              <span className="legend-text">of the malls are online</span>
            </div>
            <div className="legend-item">
              <span className="legend-value" style={{ color: "#ef4444", fontWeight: "bold" }}>
                {offlinePercentage}%
              </span>
              <span className="legend-text">of the malls are offline</span>
            </div>
            <div className="legend-item">
              <span className="legend-value" style={{ color: "#9ca3af", fontWeight: "bold" }}>
                {idlePercentage}%
              </span>
              <span className="legend-text">of the malls are online idle</span>
            </div>
          </div>

          <div className="health-pie-chart">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="health-chart-labels">
            <div className="chart-label-item">
              <span className="label-color online-color"></span>
              <span>Online</span>
            </div>
            <div className="chart-label-item">
              <span className="label-color offline-color"></span>
              <span>Offline</span>
            </div>
            <div className="chart-label-item">
              <span className="label-color idle-color"></span>
              <span>Online Idle</span>
            </div>
          </div>
        </div>

        {/* Right Section - Table */}
        <div className="health-table-section">
          <div className="health-filters-row">
            <div className="health-filters-row-left">
              <div className="health-dropdown-wrapper">
                <MultiSelectDropdown
                  options={countriesOptions}
                  value={selectedCountries}
                  onChange={handleCountryChange}
                  placeholder="Select Countries"
                  labelKey="label"
                  valueKey="value"
                />
              </div>
              <div className="health-dropdown-wrapper">
                <MultiSelectDropdown
                  options={citiesOptions}
                  value={selectedCities}
                  onChange={handleCityChange}
                  placeholder="Select Cities"
                  labelKey="label"
                  valueKey="value"
                />
              </div>
            </div>
            <button className="health-export-btn" onClick={handleExport}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                style={{ marginRight: "6px" }}
              >
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
              </svg>
              Export
            </button>
          </div>

          <div className="health-filter-input-wrapper">
            <FiSearch className="filter-icon" />
            <input
              type="text"
              className="health-filter-input"
              placeholder="Filter"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            {filterText ? (
              <button
                type="button"
                className="filter-clear-button"
                onClick={() => setFilterText("")}
                aria-label="Clear filter"
              >
                <FiX />
              </button>
            ) : null}
          </div>

          <div
            className="health-table-row-count"
            style={{ marginBottom: "10px", color: "#333", fontSize: "14px" }}
          >
            {/* Showing {filteredUnits.length} rows for {selectedStatus || 'all'} */}
          </div>

          <div className="health-table-container">
            <table className="health-table">
              <thead>
                <tr>
                  <th>SL</th>
                  <th>UNIT NAME</th>
                  <th>LAST FILE RECEIVED</th>
                </tr>
              </thead>
              <tbody>
                {unitsLoading ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="loading-state"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      <div className="spinner" style={{ display: "inline-block" }}>
                        Loading units...
                      </div>
                    </td>
                  </tr>
                ) : filteredUnits.length > 0 ? (
                  filteredUnits.map((unit, index) => (
                    <tr
                      key={unit.id}
                      onClick={() => handleUnitClick(unit)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{index + 1}</td>
                      <td>{unit.name}</td>
                      <td>{unit.lastFileReceived}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">
                      <NoData name="no-results" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for enlarged chart */}
      <Modal
        show={showChartModal}
        onHide={() => setShowChartModal(false)}
        centered
        size="lg"
        className="health-chart-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Health Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-chart-content">
            <div className="health-pie-chart">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={160}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="health-chart-labels">
              <div className="chart-label-item">
                <span className="label-color online-color"></span>
                <span>Online</span>
              </div>
              <div className="chart-label-item">
                <span className="label-color offline-color"></span>
                <span>Offline</span>
              </div>
              <div className="chart-label-item">
                <span className="label-color idle-color"></span>
                <span>Online Idle</span>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Unit Details Modal */}
      <UnitDetailsModal
        show={showUnitModal}
        onHide={() => setShowUnitModal(false)}
        unit={selectedUnit}
      />
    </div>
  );
};

export default HealthStatusTab;