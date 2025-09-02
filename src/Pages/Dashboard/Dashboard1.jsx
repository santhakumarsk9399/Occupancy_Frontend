import React, { useState, useEffect, useRef } from "react";
import DashboardFilters from "./DashboardFilters";
import LiveOccupancyChart from "./LiveOccupancyChart";
import DashboardFiltersModal from "./DashboardFilters";
import DashHeader from "../CommonComponents/Dashboard_Header";
import "../../Components/Styles/LiveChart.css";
import LiveOccupancyChart2 from "./OccupancyChart2";
import CustomCard from "../CommonComponents/Card";
import axios from "axios";
import { Tab, Nav } from "react-bootstrap";
import DashFilters from "./CascadeMultiSelect";
import { filters } from "./Dashboard_APIs";
const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [countriesData, setCountriesData] = useState([]);
  const [citiesData, setCitiesData] = useState([]);
  const [zonesData, setZonesData] = useState([]);
  const [selectedCountriesData, setselectedCountriesData] = useState([]);
  const [selectedCitiesData, setselectedCitiesData] = useState([]);
  const [selectedZonesData, setselectedZonesData] = useState([]);
  // 🔑 Always store applied filters safely
  const [appliedFilters, setAppliedFilters] = useState({
    countries: [],
    cities: [],
    zones: [],
  });

  const token = sessionStorage.getItem("token");
  const vid = sessionStorage.getItem("vid");
  const username = sessionStorage.getItem("username");
  const API_URL = import.meta.env.VITE_API_URL;
  const hasFetchedRef = useRef(false);
  const tableWrapperRef = useRef(null);

  const fetchDashData = async () => {
    try {
      const payload = {
        selectedZones: ["HighZone", "LowZone"],
      };
      const res = await axios.post(
        `${API_URL}/dashboard/dashboard1/generateDashboardData`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // console.log(res.data?.data);
      // setDashboardData(res.data?.data)
    } catch (err) {
      console.log(err);
    }
  };
   console.log(username)
  const filters = async () => {
   
    try {
      let payload = {
        vid: vid,
        username: username,
        country: "",
        city: "",
        zone: "",
      };
      const res = await axios.post(
        `${API_URL}/dashboard/dashboard1filter/filters`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(res.data?.selectedFilters,res.data?.allFilters );
      setCountriesData(
        (res.data?.allFilters?.countries || []).map((c) => ({
          value: String(c.id),
          label: c.Country,
        }))
      );
      setCitiesData(
        (res.data?.allFilters?.cities || []).map((ci) => ({
          value: String(ci.id),
          label: ci.City,
          countryId: String(ci.countryId),
        }))
      );
      setZonesData(
        (res.data?.allFilters?.zones || []).map((z) => ({
          value: String(z.id),
          label: z.Zonename,
          cityId: String(z.cityId),
        }))
      );
      setselectedCountriesData(
        (res.data?.selectedFilters?.countries || []).map((c) => ({
          value: String(c.id),
          label: c.Country,
        }))
      );
      setselectedCitiesData(
        (res.data?.selectedFilters?.cities || []).map((ci) => ({
          value: String(ci.id),
          label: ci.City,
          countryId: String(ci.countryId),
        }))
      );
      setselectedZonesData(
        (res.data?.selectedFilters?.zones || []).map((z) => ({
          value: String(z.id),
          label: z.Zonename,
          cityId: String(z.cityId),
        }))
      );
    } catch (err) {
      console.error("Error loading master data:", err);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tableWrapperRef.current &&
        !tableWrapperRef.current.contains(event.target)
      ) {
        // setSelectedRowId(null);
      }
    };
           
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  
  }, []);

  useEffect(() => {
if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchDashData();
    filters();
  }, []);

  useEffect(() => {
    const datas = [
      {
        ZoneName: "Bana Zone1",
        Incount: 850,
        Outcount: 68,
        Occupancy: 782,
        Status: "Medium",
      },
      {
        ZoneName: "SEZ Zone1",
        Incount: 340,
        Outcount: 11,
        Occupancy: 329,
        Status: "Low",
      },
      {
        ZoneName: "Tidal Zone1",
        Incount: 503,
        Outcount: 17,
        Occupancy: 486,
        Status: "Low",
      },
      {
        ZoneName: "Bana Zone2",
        Incount: 980,
        Outcount: 18,
        Occupancy: 962,
        Status: "High",
      },
      {
        ZoneName: "SEZ Zone2",
        Incount: 756,
        Outcount: 40,
        Occupancy: 716,
        Status: "Medium",
      },
      {
        ZoneName: "Tidal Zone2",
        Incount: 402,
        Outcount: 28,
        Occupancy: 374,
        Status: "Low",
      },
      {
        ZoneName: "Bana Zone3",
        Incount: 385,
        Outcount: 24,
        Occupancy: 361,
        Status: "Low",
      },
      {
        ZoneName: "SEZ Zone3",
        Incount: 428,
        Outcount: 23,
        Occupancy: 405,
        Status: "Low",
      },
      {
        ZoneName: "Tidal Zone3",
        Incount: 950,
        Outcount: 39,
        Occupancy: 911,
        Status: "High",
      },
      {
        ZoneName: "Bana Zone4",
        Incount: 214,
        Outcount: 10,
        Occupancy: 204,
        Status: "Low",
      },
      {
        ZoneName: "Zone4",
        Incount: 220,
        Outcount: 10,
        Occupancy: 210,
        Status: "Low",
      },
      {
        ZoneName: "Zone6",
        Incount: 367,
        Outcount: 13,
        Occupancy: 354,
        Status: "Low",
      },
      {
        ZoneName: "Zone 9",
        Incount: 197,
        Outcount: 87,
        Occupancy: 110,
        Status: "Low",
      },
      {
        ZoneName: "Zone6",
        Incount: 112,
        Outcount: 32,
        Occupancy: 80,
        Status: "Low",
      },
    ];
    setDashboardData(datas);
  }, []);

  const handleApplyFilters = async (filters) => {
    console.log("Filters from modal:", filters);
    const payload = {
      vid,
      username,
      zone: filters.zones?.map((o) => o.label).join(",") || "",
    };

    console.log("Payload to API:", payload);

    try {
      let response = await axios.post(
        `${API_URL}/dashboard/dashboard1filter/updateFilterSettings`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Filtered data:", response.data);

      if (response.data?.data) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      console.error("Error applying filters:", err);
    }

    setShowFilters(false);
  };
  return (
    <div className="p-4">
      <DashHeader
        title="Live Occupancy"
        onFilterClick={() => setShowFilters(true)}
      />

      {/* Cascade Filter Modal */}
      <DashFilters
        show={showFilters}
        onClose={() => setShowFilters(false)}
        onSave={handleApplyFilters}
        initialValues={appliedFilters} 
        countriesData={countriesData}
        citiesData={citiesData}
        zonesData={zonesData}
        selectedCountriesData={selectedCountriesData}
        selectedCitiesData={selectedCitiesData}
        selectedZonesData={selectedZonesData}
      />

      <div className="tabsec_dash">
        <Tab.Container defaultActiveKey="Dash1">
          <Nav variant="tabs">
            <Nav.Item>
              <Nav.Link eventKey="Dash1">Dashboard 1</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="Dash2">Dashboard 2</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="Dash3">Dashboard 3</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content className="bg-white border p-3">
            <Tab.Pane eventKey="Dash1">
              <div className="UserTable_TopSection" ref={tableWrapperRef}>
                <div className="UserTable_Section">
                  <div style={{ maxHeight: "650px" }}>
                    <div className="mt-4">
                      {dashboardData && dashboardData.length > 0 ? (
                        <CustomCard title="" size="md">
                          <LiveOccupancyChart2 data={dashboardData} />
                        </CustomCard>
                      ) : (
                        <p>No data loaded yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Pane>

            <Tab.Pane eventKey="Dash2">
              <div className="UserTable_TopSection" ref={tableWrapperRef}>
                <div className="UserTable_Section"></div>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    </div>
  );
};

export default DashboardPage;
