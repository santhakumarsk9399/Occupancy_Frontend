import React, { useState, useEffect, useMemo } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Modal } from "react-bootstrap";
import axios from "axios";
import "./HealthDashboard.css";
import NoData from "../CommonComponents/NoDataAvailable";
import ZoneDetailsModal from "./ZoneDetailsModal";
import UnitDetailsModal from "./UnitDetailsModal";

const ZoneHealthStatusTab = () => {
  const [filterText, setFilterText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("online");
  const [loading, setLoading] = useState(false);
  const [zonesData, setZonesData] = useState([]);
  const [onlineZones, setOnlineZones] = useState([]);
  const [offlineZones, setOfflineZones] = useState([]);
  const [pieChartData, setPieChartData] = useState(null);
  const [showChartModal, setShowChartModal] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  useEffect(() => {
    setFilterText("");
  }, [selectedStatus]);

  const token = sessionStorage.getItem("token");
  const vid = sessionStorage.getItem("vid");
  const username = sessionStorage.getItem("username");
  const API_URL = import.meta.env.VITE_API_URL || "http://delbi2dev.deloptanalytics.com:3000";

  // Fetch pie chart data for zones
  useEffect(() => {
    const fetchPieChartData = async () => {
      try {
        const payload = {
          vid: vid || "52",
          username: username || "Occupancy",
        };

        const response = await axios.post(
          `${API_URL}/dashboard/healthDashboard/zoneHealthStatus`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success && Array.isArray(response.data.zoneHealthStatus)) {
          const zoneHealthStatus = response.data.zoneHealthStatus;
          const offlineItem = zoneHealthStatus[0]?.[0] || {};
          const onlineItem = zoneHealthStatus[1]?.[0] || {};

          const offlineCount = Number(offlineItem.StoreHealthOffline ?? 0) || 0;
          const onlineCount = Number(onlineItem.StoreHealthOnline ?? 0) || 0;

          setPieChartData({ online: onlineCount, offline: offlineCount });
        } else {
          setPieChartData({ online: 0, offline: 0 });
        }
      } catch (error) {
        console.error("Error fetching zone pie chart data:", error);
        setPieChartData({ online: 0, offline: 0 });
      }
    };

    if (vid && username && token) {
      fetchPieChartData();
    }
  }, [vid, username, token]);

  // Fetch online zones data
  useEffect(() => {
    const fetchOnlineZones = async () => {
      try {
        const payload = {
          vid: vid || "52",
          username: username || "Occupancy",
        };

        const response = await axios.post(
          `${API_URL}/dashboard/healthDashboard/onlineCounts`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success && response.data.onlineCounts) {
          const transformed = response.data.onlineCounts.map((item, idx) => ({
            id: idx + 1,
            name: item.MALLNAME,
            totalUnits: item.TOTALUNITS,
            status: "online"
          }));
          setOnlineZones(transformed);
        } else {
          setOnlineZones([]);
        }
      } catch (error) {
        console.error("Error fetching online zones data:", error);
        setOnlineZones([]);
      }
    };

    if (vid && username && token) {
      fetchOnlineZones();
    }
  }, [vid, username, token]);

  // Fetch offline zones data
  useEffect(() => {
    const fetchOfflineZones = async () => {
      try {
        const payload = {
          vid: vid || "52",
          username: username || "Occupancy",
        };

        const response = await axios.post(
          `${API_URL}/dashboard/healthDashboard/offlineCounts`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success && response.data.offlineCounts) {
          const transformed = response.data.offlineCounts.map((item, idx) => ({
            id: idx + 1,
            name: item.MALLNAME,
            totalUnits: item.TOTALUNITS,
            status: "offline"
          }));
          setOfflineZones(transformed);
        } else {
          setOfflineZones([]);
        }
      } catch (error) {
        console.error("Error fetching offline zones data:", error);
        setOfflineZones([]);
      }
    };

    if (vid && username && token) {
      fetchOfflineZones();
    }
  }, [vid, username, token]);

  // Fetch zones list data
  useEffect(() => {
    const fetchZonesData = async () => {
      try {
        setLoading(true);
        
        const payload = {
          vid: vid || "52",
          username: username || "Occupancy",
        };

        const response = await axios.post(
          `${API_URL}/dashboard/healthDashboard/zoneHealthList`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success && response.data.data) {
          // Transform API response to expected format
          const transformedZones = response.data.data.map((item, idx) => ({
            id: idx + 1,
            name: item.ZONENAME || item.name || "",
            totalUnits: item.TOTALUNITS || item.totalUnits || "0/0",
            status: item.STATUS || "Online",
            onlineUnits: item.ONLINEUNITS || 0,
            offlineUnits: item.OFFLINEUNITS || 0,
          }));

          setZonesData(transformedZones);
        } else {
          setZonesData([]);
        }
      } catch (error) {
        console.error("Error fetching zones data:", error);
        setZonesData([]);
      } finally {
        setLoading(false);
      }
    };

    if (vid && username && token) {
      fetchZonesData();
    }
  }, [vid, username, token]);

  const healthData = pieChartData || { online: 0, offline: 0 };
  const chartData = [
    { name: "Online", value: healthData.online, color: "#10b981" },
    { name: "Offline", value: healthData.offline, color: "#ef4444" },
  ];

  const totalZones = healthData.online + healthData.offline;
  const onlinePercentage = totalZones > 0 ? Math.round((healthData.online / totalZones) * 100) : 0;
  const offlinePercentage = totalZones > 0 ? Math.round((healthData.offline / totalZones) * 100) : 0;

  // Filter zones by status and search text
  const filteredZones = useMemo(() => {
    let data = [];
    if (selectedStatus === "online") {
      data = onlineZones;
    } else if (selectedStatus === "offline") {
      data = offlineZones;
    } else {
      data = zonesData;
    }

    if (filterText) {
      data = data.filter((zone) =>
        zone.name.toLowerCase().includes(filterText.toLowerCase())
      );
    }

    return data;
  }, [filterText, selectedStatus, onlineZones, offlineZones, zonesData]);

  // Handle zone row click
  const handleZoneClick = (zone) => {
    setSelectedZone(zone);
    setShowZoneModal(true);
    setSelectedUnit(null);
    setShowUnitModal(false);
  };

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
    const csvContent = [
      ["SL", "ZONE NAME", "TOTAL UNITS"],
      ...filteredZones.map((zone, idx) => [
        idx + 1,
        escapeCsvValue(zone.name),
        formatCsvTextCell(zone.totalUnits),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Zone-HealthStatus_Devices.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="health-status-content">
      {/* <div className="health-status-header">
        <h2>Zone Health Status</h2>
      </div> */}
      {/* Status Cards */}
      <div className="health-status-cards">
        <div 
          className={`health-status-card online ${selectedStatus === "online" ? "selected" : ""}`}
          onClick={() => setSelectedStatus(selectedStatus === "online" ? null : "online")}
          style={{ cursor: "pointer" }}
        >
          <span className="health-card-label">Online - {onlineZones.length}</span>
        </div>
        <div 
          className={`health-status-card offline ${selectedStatus === "offline" ? "selected" : ""}`}
          onClick={() => setSelectedStatus(selectedStatus === "offline" ? null : "offline")}
          style={{ cursor: "pointer" }}
        >
          <span className="health-card-label">Offline - {offlineZones.length}</span>
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
                <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/>
              </svg>
            </button>
          </div>
          
          <div className="health-chart-legends">
            <div className="legend-item">
              <span className="legend-value" style={{ color: "#10b981", fontWeight: "bold" }}>
                {onlinePercentage}%
              </span>
              <span className="legend-text">of the zones are online</span>
            </div>
            <div className="legend-item">
              <span className="legend-value" style={{ color: "#ef4444", fontWeight: "bold" }}>
                {offlinePercentage}%
              </span>
              <span className="legend-text">of the zones are offline</span>
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
          </div>
        </div>

        {/* Right Section - Table */}
        <div className="health-table-section">
          <div className="health-filters-row" style={{ justifyContent: "space-between" }}>
            <div className="health-filter-input-wrapper" style={{ flex: 1, maxWidth: "280px" }}>
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

          <div className="health-table-container">
            <table className="health-table">
              <thead>
                <tr>
                  <th>SL</th>
                  <th>ZONE NAME</th>
                  <th>TOTAL UNITS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="loading-state" style={{ textAlign: "center", padding: "20px" }}>
                      <div className="spinner" style={{ display: "inline-block" }}>
                        Loading zones...
                      </div>
                    </td>
                  </tr>
                ) : filteredZones.length > 0 ? (
                  filteredZones.map((zone, index) => (
                    <tr 
                      key={zone.id} 
                      onClick={() => handleZoneClick(zone)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{index + 1}</td>
                      <td>{zone.name}</td>
                      <td>{zone.totalUnits}</td>
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
          <Modal.Title>Zone Health Status</Modal.Title>
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
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Zone Details Modal */}
      <ZoneDetailsModal 
        show={showZoneModal}
        onHide={() => {
          setShowZoneModal(false);
          setShowUnitModal(false);
          setSelectedUnit(null);
        }}
        zone={selectedZone}
        onUnitClick={handleUnitClick}
      />

      <UnitDetailsModal
        show={showUnitModal}
        onHide={() => {
          setShowUnitModal(false);
          setSelectedUnit(null);
        }}
        unit={selectedUnit}
      />
    </div>
  );
};

export default ZoneHealthStatusTab;
