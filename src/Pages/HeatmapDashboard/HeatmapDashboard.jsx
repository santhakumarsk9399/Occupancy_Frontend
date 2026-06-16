// import React, { useState } from 'react'
// import DashHeader from '../CommonComponents/Dashboard_Header';
// import { Tab, Nav, Spinner } from "react-bootstrap";

// const HeatmapDashboard = () => {
//   const [activeTab, setActiveTab] = useState("Live");
//     const [pageLoading, setPageLoading] = useState(true);
//   return (
//     <div className="Dashcontainer">
//       <DashHeader
//         title="Heatmap-Overview"
//         onFilterClick={async () => {
//           await filters();
//           setShowFilters(true);
//         }}
//       />

//       <div className="tabsec_dash">
//         <Tab.Container
//           activeKey={activeTab}
//           onSelect={(k) => setActiveTab(k || "Live")}
//         >
//           <Nav variant="tabs">
//             <Nav.Item>
//               <Nav.Link eventKey="Live">Live</Nav.Link>
//             </Nav.Item>
//             <Nav.Item>
//               <Nav.Link eventKey="Mall">Mall-wise</Nav.Link>
//             </Nav.Item>
//             <Nav.Item>
//               <Nav.Link eventKey="Zone">Zone-wise</Nav.Link>
//             </Nav.Item>
//             <Nav.Item>
//               <Nav.Link eventKey="Map">Map-wise</Nav.Link>
//             </Nav.Item>
//           </Nav>

//           <Tab.Content className="bg-white border p-3">
//             <Tab.Pane eventKey="Live">
//               <div className="Dash_TopSection">
//                 <div className="Dash_Section">
//                   <div>
//                     {/* <div className="mt-1">
//                       {pageLoading ? (
//                         <div
//                           style={{
//                             display: "flex",
//                             flexDirection: "column",
//                             justifyContent: "center",
//                             alignItems: "center",
//                             height: "90vh",
//                             // background: "rgba(250,250,250,0.7)",
//                             borderRadius: "12px",
//                           }}
//                         >
//                           <Spinner
//                             animation="border"
//                             variant="primary"
//                             style={{ width: "2rem", height: "2rem" }}
//                           />
//                           <p className="mt-3 text-muted">Loading chart...</p>
//                         </div>
//                       ) : dashboardData && dashboardData.length > 0 ? (
//                         <CustomCard
//                           title=""
//                           size="md"
//                           style={{ background: "white", padding: "10px" }}
//                         >
//                           <LiveOccupancyChart2 data={dashboardData} />
//                         </CustomCard>
//                       ) : (
//                         <div className="dash3NodataDiv">
//                           {" "}
//                           <NoData name="no-data-container" />
//                         </div>
//                       )}
//                     </div> */}
//                   </div>
//                 </div>
//               </div>
//             </Tab.Pane>
//           </Tab.Content>

//           <Tab.Content className="bg-white border p-3">
//             <Tab.Pane eventKey="Mall">
//               {/* <Dashboard2 zones={zones} isActive={activeTab === "Mall"} /> */}
//             </Tab.Pane>
//           </Tab.Content>

//           <Tab.Content className="bg-white border p-3">
//             <Tab.Pane eventKey="Zone">
//               {/* <Dashboard3 zones={zones} isActive={activeTab === "Zone"} /> */}
//             </Tab.Pane>
//           </Tab.Content>

//           <Tab.Content className="bg-white border p-3">
//             <Tab.Pane eventKey="Map">
//               {/* <Dashboard3 zones={zones} isActive={activeTab === "Map"} /> */}
//             </Tab.Pane>
//           </Tab.Content>
//         </Tab.Container>
//       </div>
//     </div>
//   )
// }

// export default HeatmapDashboard

import React, { useState } from "react";
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
  const [zoneDate, setZoneDate] = useState("");
  const [mapDate, setMapDate] = useState("");
  const {
    showFilters, setShowFilters, mallsData, floorsData, zonesData, selectedMallsData, setSelectedMallsData, selectedFloorsData, setSelectedFloorsData, selectedZonesData,
    setSelectedZonesData, appliedFilters, handleApplyFilters } = useHeatmapDashFilters();

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
      console.log("Mall Date:", mallDate);
    }

    else if (activeTab === "Zone") {
      console.log("Zone Date:", zoneDate);
    }

    else if (activeTab === "Map") {
      console.log("Map Date:", mapDate);
    }

  };

  const handleClear = () => {

    if (activeTab === "Mall") {
      setMallDate("");
    }

    else if (activeTab === "Zone") {
      setZoneDate("");
    }

    else if (activeTab === "Map") {
      setMapDate("");
    }

  };
  return (
    <div className="Dashcontainer heatmap-scroll heatmap-dashboard-page">
      <DashHeader
        title="Heatmap - Overview"
        onFilterClick={() => {
          setShowFilters(true);
        }}
      />
      {/* <HeatmapCascadeFilter
        show={showFilters}
        onClose={() =>
          setShowFilters(false)
        }
        onSave={async (data) => {

          setSelectedMallsData(
            data.malls
          );
          setSelectedFloorsData(
            data.floors
          );
          setSelectedZonesData(
            data.zones
          );
          await handleApplyFilters();
        }}

        mallsData={mallsData}

        floorsData={floorsData}

        zonesData={zonesData}

        selectedMallsData={
          selectedMallsData
        }

        selectedFloorsData={
          selectedFloorsData
        }

        selectedZonesData={
          selectedZonesData
        }

      /> */}

      <div className="tabsec_dash">
        <Tab.Container
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || "Live")}
        >
          {/* Tabs */}
          {/* TOP SECTION */}

          <div className="heatmap-top-section">

            {/* TABS */}

            <Nav variant="tabs">

              <Nav.Item>
                <Nav.Link eventKey="Live">
                  Live
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link eventKey="Mall">
                  Mall-wise
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link eventKey="Zone">
                  Zone-wise
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link eventKey="Map">
                  Map-wise
                </Nav.Link>
              </Nav.Item>

            </Nav>

            {/* FILTER */}
            {activeTab !== "Live" && (
              <HeatmapFilter
                value={currentDate}
                onChange={handleDateChange}
                onApply={handleApply}
                onClear={handleClear}
              />
            )}
          </div>

          {/* ✅ SINGLE Tab.Content */}
          <Tab.Content className="p-3">

            <Tab.Pane eventKey="Live">
              {pageLoading ? (
                <div className="loader-center">
                  <Spinner animation="border" />
                </div>
              ) : (
                <LiveTab
                  appliedFilters={appliedFilters}
                />
              )}
            </Tab.Pane>

            <Tab.Pane eventKey="Mall">
              <MallwiseTab
                filterDate={mallDate}
                appliedFilters={appliedFilters}
              />
            </Tab.Pane>

            <Tab.Pane eventKey="Zone">
              <ZonewiseTab
                appliedFilters={appliedFilters}
                filterDate={zoneDate}
              />
            </Tab.Pane>

            <Tab.Pane eventKey="Map">
              <MapwiseTab
                appliedFilters={appliedFilters}
                filterDate={mapDate}
              />
            </Tab.Pane>

          </Tab.Content>
        </Tab.Container>
      </div>

    </div>
  );
};

export default HeatmapDashboard;