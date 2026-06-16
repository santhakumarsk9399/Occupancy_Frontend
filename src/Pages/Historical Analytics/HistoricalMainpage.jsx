import { Tab, Nav, Spinner } from "react-bootstrap";
import React, { useState, useEffect, useRef } from "react";
import CustomCard from "../CommonComponents/Card";
import NoData from "../CommonComponents/NoDataAvailable";
import "../../Components/Styles/HistoricalDashboard.css";
import HistoricalDashboard1 from "./HistoricalDashboard1";
import HistoricalDashboard2 from "./HistoricalDashboard2";
import DashHeader from "../CommonComponents/Dashboard_Header";
import useDashFilters from "./useDashFilters";
import { showSuccess } from "../CommonComponents/Toaster";
import DashFilters from "../Dashboard/CascadeMultiSelect";
const HistoricalMainpage = () => {
  const {
  showFilters,
  setShowFilters,
  countriesData,
  citiesData,
  zonesData,
  selectedCountriesData,
  selectedCitiesData,
  selectedZonesData,
  appliedFilters,
  filters,
  handleApplyFilters,
} = useDashFilters({ onSuccessToast: showSuccess /* optional */ });
console.log(selectedZonesData)
const [filterVersion, setFilterVersion] = useState(0); 
  const [activeTab, setActiveTab] = useState("Dash1");
  const [pageLoading, setPageLoading] = useState(true);
  return (
    <>
      <div className="historyDashmain">
    <DashHeader
        title="Historical Analytics"
        onFilterClick={async () => {
          await filters();
          setShowFilters(true);
        }}
      />

      {/* the reusable filter modal */}
      <DashFilters
        show={showFilters}
        onClose={() => setShowFilters(false)}
        onSave={async (data) => {
          await handleApplyFilters(data);
          // bump version to inform children to reload
          setFilterVersion((v) => v + 1);
        }}
        initialValues={appliedFilters}
        countriesData={countriesData}
        citiesData={citiesData}
        zonesData={zonesData}
        selectedCountriesData={selectedCountriesData}
        selectedCitiesData={selectedCitiesData}
        selectedZonesData={selectedZonesData}
      />
        <div className="tabsec_dash">
          <Tab.Container
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || "Dash1")}
          >
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="Dash1">Dashboard 1</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="Dash2">Dashboard 2</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content className="bg-white border p-3">
              <Tab.Pane eventKey="Dash1">
                <div className="Historical_Dash_TopSection">
                  <div className="Historical_Dash_Section">
                    <div>
                      <HistoricalDashboard1 filterVersion={filterVersion} zonesFromParent={selectedZonesData}/>
                    </div>
                  </div>
                </div>
              </Tab.Pane>
            </Tab.Content>

            <Tab.Content className="bg-white border p-3">
              <Tab.Pane eventKey="Dash2">
                <>
                  <HistoricalDashboard2 filterVersion={filterVersion} zonesFromParent={selectedZonesData}/>
                </>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
      </div>
    </>
  );
};

export default HistoricalMainpage;
