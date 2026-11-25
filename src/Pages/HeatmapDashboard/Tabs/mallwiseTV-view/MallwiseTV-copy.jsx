import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import "../../Styles/mallwiseTV.css";
import HeatmapCanvasTV from "../../CommonComponents/HeatmapCanvasTV";
import HeatmapLegend from "../../CommonComponents/HeatmapLegend";
import {
  getDashboardWidgets,
  getHeatmapFilter1,
  getHeatmapMallandZoneDashboard,
} from "../../api/HeatmapDashboardApis";
import useHeatmap from "../../hooks/useHeatmap";
import TVSidebar from "./TVSidebar";
import TVFooter from "./TVFooter";
import { FiMapPin, FiShoppingBag, FiLayers } from "react-icons/fi";
import Select from "react-select";
import "../../Styles/LoaderOverlay.css";
import { Spinner } from "react-bootstrap";
// import OccupancyOverview from "./HeatmapBottomLegend";
// import HeatmapBottomLegend from "./HeatmapBottomLegend";

const MallWiseTV = () => {
  // ==========================================
  // Component State Management
  // ==========================================

  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState([]);
  const [selectedMall, setSelectedMall] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [cards, setCards] = useState({
    widget1: {},
    widget2: {},
    widget3: {},
    widget4: {},
  });

  const [widgetPayload, setWidgetPayload] = useState(null);
  const [dashboardPayload, setDashboardPayload] = useState(null);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const username = sessionStorage.getItem("username");
  const token = sessionStorage.getItem("token");
  const vid = sessionStorage.getItem("vid");

  // console.log(username);


  const selectedMallRef = useRef(null);
  const selectedFloorRef = useRef(null);
  // ==========================================
  // Load Filter Data and Prepare Request Payloads
  // ==========================================

  const loadFilters = async () => {
    try {
      const res = await getHeatmapFilter1(username);
      const responseData = res?.data || [];
      if (!responseData.length) return;

      // Dropdown Data

      setFilterData(responseData);
      setSelectedMall(responseData[0]);
      setSelectedFloor(responseData[0].floors[0]);

      // Widget Payload
      setWidgetPayload({
        mallname: responseData.map((m) => m.mallName).join(","),
        floorname: responseData
          .flatMap((m) => m.floors)
          .map((f) => f.floorName)
          .join(","),
        zonename: responseData
          .flatMap((m) => m.floors)
          .flatMap((f) => f.zones)
          .map((z) => z.zoneName)
          .join(","),
        inputDate: dayjs().format("YYYY-MM-DD"),
      });

      // Dashboard Payload
      setDashboardPayload({
        inputDate: dayjs().format("YYYY-MM-DD"),
        filters: responseData.flatMap((m) =>
          m.floors.flatMap((f) =>
            f.zones.map((z) => ({
              mallName: m.mallName,
              floorName: f.floorName,
              zoneName: z.zoneName,
            })),
          ),
        ),
      });

      setFiltersLoaded(true);
    } catch (err) {
      console.log(err);
    }
  };

  // ==========================================
  // Load Dashboard Widgets and Heatmap Data
  // ==========================================

  // const loadDashboard = async () => {
  //   try {
  //     if (!widgetPayload || !dashboardPayload) return;

  //     setLoading(true);

  //     const [widgets, dashboard] = await Promise.all([
  //       getDashboardWidgets(widgetPayload),
  //       getHeatmapMallandZoneDashboard(dashboardPayload),
  //     ]);

  //     const malls = (dashboard.malls || []).map((mall) => ({
  //       ...mall,
  //       floors: mall.floors.map((floor) => ({
  //         ...floor,
  //         zones: floor.zones.map((zone) => ({
  //           ...zone,
  //           points: zone.points?.points || [],
  //         })),
  //       })),
  //     }));

  //     setDashboardData(malls);
  //     setCards(widgets);
  //   } catch (err) {
  //     console.log(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const loadDashboard = async (showLoader = true) => {
    try {
      if (!widgetPayload || !dashboardPayload) return;

      if (showLoader) {
        setLoading(true);
      }

      const [widgets, dashboard] = await Promise.all([
        getDashboardWidgets(widgetPayload),
        getHeatmapMallandZoneDashboard(dashboardPayload),
      ]);

      const malls = (dashboard.malls || []).map((mall) => ({
        ...mall,
        floors: mall.floors.map((floor) => ({
          ...floor,
          zones: floor.zones.map((zone) => ({
            ...zone,
            points: zone.points?.points || [],
          })),
        })),
      }));

      setDashboardData(malls);
      setCards(widgets);

      // Preserve selected mall/floor

      const currentMall =
        malls.find((m) => m.mallId === selectedMallRef.current?.mallId) ||
        malls[0];
      setSelectedMall(currentMall);
      const currentFloor =
        currentMall?.floors.find(
          (f) => f.floorId === selectedFloorRef.current?.floorId,
        ) || currentMall?.floors?.[0];
      setSelectedFloor(currentFloor);
    } catch (err) {
      console.log(err);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };
  // ==========================================
  // Load Filter Data on Component Mount
  // ==========================================

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    selectedMallRef.current = selectedMall;
  }, [selectedMall]);

  useEffect(() => {
    selectedFloorRef.current = selectedFloor;
  }, [selectedFloor]);
  // ==========================================
  // Auto Refresh Dashboard Every 15 Seconds
  // ==========================================

  // useEffect(() => {
  //   if (!filtersLoaded) return;

  //   loadDashboard(); // <-- Initial load

  //   const interval = setInterval(() => {
  //     loadDashboard();
  //   }, 15000);

  //   return () => clearInterval(interval);
  // }, [filtersLoaded]);
  useEffect(() => {
    if (!filtersLoaded) return;

    // Initial Load (show loader)
    loadDashboard(true);

    const interval = setInterval(() => {
      // Background refresh (no loader)
      loadDashboard(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [filtersLoaded]);
  // ==========================================
  // Get Selected Mall and Floor from Dashboard Data
  // ==========================================

  const dashboardMall = dashboardData.find(
    (m) => m.mallId === selectedMall?.mallId,
  );

  const dashboardFloor = dashboardMall?.floors.find(
    (f) => f.floorId === selectedFloor?.floorId,
  );

  // ==========================================
  // Prepare Heatmap Data for Rendering
  // ==========================================

  const { zonesToRender } = useHeatmap({
    mode: "tv",
    selectedFloor: dashboardFloor,
  });

  // ==========================================
  // Extract Widget Data for Sidebar Cards
  // ==========================================

  const widget1 = cards?.widget1?.data?.[0] || {};
  const widget2 = cards?.widget2?.data?.[0] || {};
  const widget3 = cards?.widget3?.data?.[0] || {};
  const widget4 = cards?.widget4?.data?.[0] || {};

  // ==========================================
  //  Data for Mall Dropdown Options
  // ==========================================

  const mallOptions = dashboardData.map((mall) => ({
    value: mall.mallId,
    label: mall.mallName,
  }));

  // ==========================================
  // Data for Floor Dropdown Options
  // ==========================================

  const floorOptions =
    dashboardMall?.floors.map((floor) => ({
      value: floor.floorId,
      label: floor.floorName,
    })) || [];
  return (
    <div className="tv-page">
      {/*==========================================
                 Header Section
        ========================================== */}

      <div className="tv-header">
        <div className="tv-header-left">
          <h2>Heatmap Dashboard</h2>
        </div>
        {loading && (
          <div className="loader-overlay">
            <Spinner animation="border" variant="primary" />
            <p>Loading...</p>
          </div>
        )}
        <div className="tv-header-right">
          {/* Mall */}

          <div className="filter-group-horizontal">
            <label className="filter-inline-label">Mall :</label>

            <div className="tv-filter-card">
              <div className="tv-select-box">
                <FiShoppingBag className="tv-icon" />
                <Select
                  className="tv-react-select"
                  classNamePrefix="tv-select"
                  isSearchable={false}
                  options={mallOptions}
                  value={
                    mallOptions.find((m) => m.value === selectedMall?.mallId) ||
                    null
                  }
                  onChange={(option) => {
                    const mall = dashboardData.find(
                      (m) => m.mallId === option.value,
                    );

                    if (!mall) return;

                    setSelectedMall(mall);
                    setSelectedFloor(mall.floors?.[0] || null);
                  }}
                  // onChange={(option) => {
                  //   setSelectedMall(option.data);
                  //   setSelectedFloor(option.data.floors[0]);
                  // }}
                />
              </div>
            </div>
          </div>

          {/* Floor */}
          <div className="filter-group-horizontal">
            <label className="filter-inline-label">Floor :</label>

            <div className="tv-filter-card">
              <div className="tv-select-box">
                <FiLayers className="tv-icon" />
                <Select
                  className="tv-react-select"
                  classNamePrefix="tv-select"
                  isSearchable={false}
                  options={floorOptions}
                  value={
                    floorOptions.find(
                      (f) => f.value === selectedFloor?.floorId,
                    ) || null
                  }
                  // onChange={(option) => {
                  //   setSelectedFloor(option.data);
                  // }}
                  onChange={(option) => {
                    const floor = dashboardMall?.floors.find(
                      (f) => f.floorId === option.value,
                    );

                    if (floor) {
                      setSelectedFloor(floor);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
                  Sidebar Widgets
        ========================================== */}

      <div className="tv-content">
        <TVSidebar widget2={widget2} widget3={widget3} widget4={widget4} />

        {/* ==========================================
                  Heatmap Canvas
           ========================================== */}

        <div className="tv-map-container">
          {dashboardFloor && (
            <HeatmapCanvasTV
              selectedFloor={dashboardFloor}
              zones={zonesToRender}
            />
          )}
          {/* <HeatmapBottomLegend /> */}
                  </div>
        {/* <OccupancyOverview
          // occupancy={occupancy}
          // inside={inside}
          // capacity={822}
        /> */}
      </div>

      {/* ==========================================
               Footer Section
          ========================================== */}
      <TVFooter />
    </div>
  );
};

export default MallWiseTV;
