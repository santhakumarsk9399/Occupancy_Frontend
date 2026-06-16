import React, { useState, useEffect, useRef } from "react";
import { Tab, Nav, Spinner } from "react-bootstrap";
import axios from "axios";
import DashHeader from "../CommonComponents/Dashboard_Header";
import HealthStatusTab from "./HealthStatusTab";
import ZoneHealthStatusTab from "./ZoneHealthStatusTab";
import LiveUnitHealthTracker from "./LiveUnitHealthTracker";
import "./HealthDashboard.css";

const HealthDashboard = () => {
  const [activeTab, setActiveTab] = useState("healthStatus");
  const [pageLoading, setPageLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);
  
  const token = sessionStorage.getItem("token");
  const vid = sessionStorage.getItem("vid");
  const username = sessionStorage.getItem("username");
  const API_URL = import.meta.env.VITE_API_URL || "http://delbi2dev.deloptanalytics.com:3000";

  const hasFetchedRef = useRef(false);

  // Fetch health data - handled by HealthStatusTab component
  const fetchHealthData = async (isFirstLoad = false) => {
    if (isFirstLoad) setPageLoading(false);
    // HealthStatusTab handles all API calls directly
  };

  // Initial load
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchHealthData(true);
  }, []);

  // Polling for active tab
  useEffect(() => {
    if (activeTab === "healthStatus") {
      const interval = setInterval(() => {
        fetchHealthData(false);
      }, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  return (
    <div className="health-dashboard-container">
      <div className="health-tabs-section">
        <Tab.Container
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || "healthStatus")}
        >
          <Nav variant="tabs" className="health-tabs">
            <Nav.Item>
              <Nav.Link eventKey="healthStatus">Health Status</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="zoneHealthStatus">Zone Health Status</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="liveUnitHealthTracker">
                Live Unit Health Tracker
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content className="health-tab-content">
            <Tab.Pane eventKey="healthStatus">
              {pageLoading ? (
                <div className="health-loader-container">
                  <Spinner
                    animation="border"
                    variant="primary"
                    style={{ width: "2rem", height: "2rem" }}
                  />
                  <p className="mt-3 text-muted">Loading health data...</p>
                </div>
              ) : (
                <HealthStatusTab data={healthData} onRefresh={() => fetchHealthData(false)} />
              )}
            </Tab.Pane>

            <Tab.Pane eventKey="zoneHealthStatus">
              <ZoneHealthStatusTab />
            </Tab.Pane>

            <Tab.Pane eventKey="liveUnitHealthTracker">
              <LiveUnitHealthTracker />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    </div>
  );
};

export default HealthDashboard;
