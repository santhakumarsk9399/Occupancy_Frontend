import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./HealthDashboard.css";
import NoData from "../CommonComponents/NoDataAvailable";
import UnitDetailsModal from "./UnitDetailsModal";

const LiveUnitHealthTracker = () => {
  const [unitsData, setUnitsData] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showUnitModal, setShowUnitModal] = useState(false);

  const token = sessionStorage.getItem("token");
  const vid = sessionStorage.getItem("vid");
  const username = sessionStorage.getItem("username");
  const API_URL = import.meta.env.VITE_API_URL || "http://delbi2dev.deloptanalytics.com:3000";

  // Fetch all units data from API
  useEffect(() => {
    const fetchUnitsData = async () => {
      try {
        setUnitsLoading(true);

        const payload = {
          vid: vid || "52",
          username: username || "Occupancy",
          country: "",
          city: "",
        };

        // Fetch all status types: online, offline, and onlineIdle
        const endpoints = ["healthOnline", "healthOffline", "healthOnlineIdle"];
        const responses = await Promise.all(
          endpoints.map((endpoint) =>
            axios.post(
              `${API_URL}/healthDashboard/${endpoint}`,
              payload,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            ).catch((error) => ({ data: { success: false, data: [] } }))
          )
        );

        // Combine all units from all responses
        let allUnits = [];
        responses.forEach((response) => {
          if (response?.data?.success && Array.isArray(response.data.data)) {
            allUnits = allUnits.concat(response.data.data);
          }
        });

        // Transform API response to expected format
        const transformedUnits = allUnits.map((item, idx) => ({
          id: idx + 1,
          name: item.UNITNAME || item.name || "",
          uniqueId: item.UNITNAME || item.name || "",
        }));

        setUnitsData(transformedUnits);
      } catch (error) {
        console.error("Error fetching units data:", error);
        setUnitsData([]);
      } finally {
        setUnitsLoading(false);
      }
    };

    if (vid && username && token) {
      fetchUnitsData();
    }
  }, [vid, username, token]);

  // Memoize filtered units
  const filteredUnits = useMemo(() => {
    if (!filterText.trim()) {
      return unitsData;
    }

    return unitsData.filter((unit) =>
      unit.uniqueId.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [filterText, unitsData]);

  // Handle unit row click
  const handleUnitClick = (unit) => {
    setSelectedUnit(unit);
    setShowUnitModal(true);
  };

  return (
    <div className="live-unit-tracker-container">
      <div className="health-filters-row" style={{ justifyContent: "space-between" }}>
        <div className="health-filter-input-wrapper" style={{ flex: 1, maxWidth: "280px" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
            className="filter-icon"
          >
            <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
          </svg>
          <input
            type="text"
            className="health-filter-input"
            placeholder="Filter"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      </div>

      <div className="health-table-container">
        <table className="health-table">
          <thead>
            <tr>
              <th>SL</th>
              <th>UNIQUE ID</th>
            </tr>
          </thead>
          <tbody>
            {unitsLoading ? (
              <tr>
                <td colSpan="2" className="loading-state" style={{ textAlign: "center", padding: "20px" }}>
                  Loading units...
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
                  <td>{unit.uniqueId}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" style={{ textAlign: "center", padding: "20px" }}>
                  <NoData name="no-results" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

export default LiveUnitHealthTracker;
