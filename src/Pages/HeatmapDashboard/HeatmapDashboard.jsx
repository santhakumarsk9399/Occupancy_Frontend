import React, { useState,useEffect } from "react";
import DashHeader from "../CommonComponents/Dashboard_Header";
import { Tab, Nav, Spinner } from "react-bootstrap";
import LiveTab from "./Tabs/LiveTab";
import MallwiseTab from "./Tabs/MallwiseTab";
import ZonewiseTab from "./Tabs/ZonewiseTab";
import MapwiseTab from "./Tabs/MapwiseTab";
// import MapwiseTab from "./Tabs/MapwiseWithGmaps";

import HeatmapFilter from "./Components/HeatmapFilter";
import "./Styles/heatmapDashboard.css"
import HeatmapCascadeFilter from "./Components/HeatmapCascadeFilter";
import useHeatmapDashFilters from "./Components/HeatmapDashFilter";


const HeatmapDashboard = () => {
  const [activeTab, setActiveTab] = useState("Live");
  const [pageLoading, setPageLoading] = useState(false);
  const [mallDate, setMallDate] = useState("");
  const [appliedMallDate, setAppliedMallDate] = useState("");

  const [zoneDate, setZoneDate] = useState("");
  const [appliedZoneDate, setAppliedZoneDate] = useState("");

  const [mapDate, setMapDate] = useState("");
  const [appliedMapDate, setAppliedMapDate] = useState("");
  const [selectedMallFromMap, setSelectedMallFromMap] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const {
    showFilters,
    setShowFilters,
    mallsData,
    floorsData,
    zonesData,
    selectedMallsData,
    selectedFloorsData,
    selectedZonesData,
    appliedFilters,
    handleApplyFilters,
    filtersLoaded,
    filterTree
  } = useHeatmapDashFilters();

  const currentDate =
    activeTab === "Mall"
      ? mallDate
      : activeTab === "Zone"
        ? zoneDate
        : activeTab === "Map"
          ? mapDate
          : "";

  const handleDateChange = (value) => {

    if (activeTab === "Mall") {
      setMallDate(value);
    }

    else if (activeTab === "Zone") {
      setZoneDate(value);
    }

    else if (activeTab === "Map") {
      setMapDate(value);
    }

  };

  const handleApply = () => {

    if (activeTab === "Mall") {
      console.log(mallDate,"malldate")
      setAppliedMallDate(mallDate);

    }

    else if (activeTab === "Zone") {
      setAppliedZoneDate(zoneDate)
    }

    else if (activeTab === "Map") {
      setAppliedMapDate(mapDate)
    }

  };

  const handleClear = () => {
    if (activeTab === "Mall") {
      setMallDate("");
      setAppliedMallDate("");
    } else if (activeTab === "Zone") {
      setZoneDate("");
      setAppliedZoneDate("");
    } else if (activeTab === "Map") {
      setMapDate("");
      setAppliedMapDate("");
    }
  };

// every 15seconds update
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTick(prev => prev + 1);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="Dashcontainer heatmap-scroll heatmap-dashboard-page">
      <DashHeader
        title="Heatmap - Overview"
        onFilterClick={() => {
          setShowFilters(true);
        }}
      />
      <HeatmapCascadeFilter
        show={showFilters}
        onClose={() => setShowFilters(false)}
        onSave={async (data) => {
          await handleApplyFilters(data);
        }}
        filterTree={filterTree}
        mallsData={mallsData}
        floorsData={floorsData}
        zonesData={zonesData}
        selectedMallsData={selectedMallsData}
        selectedFloorsData={selectedFloorsData}
        selectedZonesData={selectedZonesData}
      />
      <div className="tabsec_dash">
        {/* <Tab.Container
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || "Live")}
        > */}
        <Tab.Container
          activeKey={activeTab}
          onSelect={(k) => {
            setActiveTab(k || "Live");
            setRefreshTick(prev => prev + 1); // Immediate refresh
          }}
        >
          {/* TOP SECTION */}
          <div className="heatmap-top-section">
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="Live">Live</Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link eventKey="Mall">Mall-wise</Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link eventKey="Zone">Zone-wise</Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link eventKey="Map">Map-wise</Nav.Link>
              </Nav.Item>
            </Nav>

            {activeTab !== "Live" && (
              <HeatmapFilter
                value={currentDate}
                onChange={handleDateChange}
                onApply={handleApply}
                onClear={handleClear}
              />
            )}
          </div>

          <Tab.Content className="p-3">
            <Tab.Pane eventKey="Live">
              {pageLoading ? (
                <div className="loader-center">
                  <Spinner animation="border" />
                </div>
              ) : (
                <LiveTab
                  activeTab={activeTab}
                    appliedFilters={appliedFilters}
                    filtersLoaded={filtersLoaded}
                    refreshPage={refreshTick}
                />
              )}
            </Tab.Pane>

            <Tab.Pane eventKey="Mall">
              <MallwiseTab
                activeTab={activeTab}
                filterDate={appliedMallDate}
                appliedFilters={appliedFilters}
                filtersLoaded={filtersLoaded}
                selectedMallFromMap={selectedMallFromMap}
                refreshPage={refreshTick}
              />
            </Tab.Pane>

            <Tab.Pane eventKey="Zone">
              <ZonewiseTab
                activeTab={activeTab}
                appliedFilters={appliedFilters}
                filterDate={appliedZoneDate}
                filtersLoaded={filtersLoaded}
                refreshPage={refreshTick}
              />
            </Tab.Pane>

            <Tab.Pane eventKey="Map">
              <MapwiseTab
                activeTab={activeTab}
                appliedFilters={appliedFilters}
                filterDate={appliedMapDate}
                filtersLoaded={filtersLoaded}
                refreshPage={refreshTick}
                onViewMall={(mall) => {
                  setSelectedMallFromMap(mall);
                  setActiveTab("Mall");
              }}
              />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    </div>
  );
};

export default HeatmapDashboard;
