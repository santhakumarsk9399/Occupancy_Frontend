import React, { useEffect, useState } from "react";
import "../Styles/mallwiseTab.css";
import "../Styles/LoaderOverlay.css";
import { mallsData } from "../data/MallsMockData";
import HeatmapSidebar from "../CommonComponents/HeatmapSidebar";
import HeatmapHeader from "../CommonComponents/HeatmapHeader";
import HeatmapLegend from "../CommonComponents/HeatmapLegend";
import HeatmapCanvas from "../CommonComponents/HeatmapCanvas";
import HeatmapStatsCard from "../CommonComponents/HeatmapStatsCard";
import useHeatmap from "../hooks/useHeatmap";
import {
  FiUsers,
  FiLogIn,
  FiClock,
  FiActivity,
  FiAlertCircle,
  FiCalendar,
} from "react-icons/fi";
import dayjs from "dayjs";
import { Spinner } from "react-bootstrap";
import {
  getDashboardWidgets,
  getHeatmapMallandZoneDashboard,
} from "../api/HeatmapDashboardApis";
import NoData from "../../CommonComponents/NoDataAvailable";
const ZonewiseTab = ({
  activeTab,
  filterDate,
  appliedFilters,
  filtersLoaded,
  refreshPage,
}) => {
  const [zoom, setZoom] = useState(1);
  const [gradientType, setGradientType] = useState("default");
  const [selectedMall, setSelectedMall] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState([]);
  const [selectedZone, setSelectedZone] = useState(
    mallsData[0].floors[0].zones[0],
  );
  const { zonesToRender } = useHeatmap({
    mode: "zone",
    selectedFloor,
    selectedZone,
  });
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);
  const [cards, setCards] = useState({
    widget1: {},
    widget2: {},
    widget3: {},
    widget4: {},
  });

  /* =========================================
     FILTER DATE
  ========================================= */
  //---------------------------inital load------------------------------------------//
  useEffect(() => {
    if (!filtersLoaded) return;
    if (activeTab !== "Zone") return;
    if (!appliedFilters) return;

    ZoneDashboard(false);
  }, [filtersLoaded, activeTab, appliedFilters, filterDate]);

  //---------------------------- auto refresh----------------------------------------//
  const isToday = !filterDate || dayjs(filterDate).isSame(dayjs(), "day");

  useEffect(() => {
    if (!filtersLoaded) return;
    if (activeTab !== "Zone") return;
    if (!appliedFilters) return;
    if (!isToday) return;

    ZoneDashboard(true);
  }, [refreshPage, activeTab, isToday, filtersLoaded, appliedFilters]);
  // useEffect(() => {
  //   if (!filtersLoaded) return;
  //   if (activeTab !== "Zone") return;
  //   if (!appliedFilters) return;

  //   ZoneDashboard();
  // }, [filtersLoaded, activeTab, appliedFilters, filterDate]);

  /* =========================================
     FLOOR CHANGE
  ========================================= */
  useEffect(() => {
    if (selectedFloor?.zones?.length) {
      setSelectedZone(selectedFloor.zones[0]);
    } else {
      setSelectedZone(null);
    }
  }, [selectedFloor]);

  // const malls = appliedFilters?.malls || [];
  // const floors = appliedFilters?.floors || [];
  // const zones = appliedFilters?.zones || [];

  const ZoneDashboard = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      const widget_payload = {
        mallname:
          (appliedFilters?.malls || []).map((m) => m.label).join(",") || "",
        floorname:
          (appliedFilters?.floors || []).map((f) => f.label).join(",") || "",
        zonename:
          (appliedFilters?.zones || []).map((f) => f.label).join(",") || "",
        inputDate: filterDate || dayjs().format("YYYY-MM-DD"),
      };

      const Dashboard_payload = {
        inputDate: filterDate || dayjs().format("YYYY-MM-DD"),
        filters: appliedFilters.filters,
      };
      const [widgets, dashboard] = await Promise.all([
        getDashboardWidgets(widget_payload),
        getHeatmapMallandZoneDashboard(Dashboard_payload),
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

      if (!malls.length) {
        setNoData(true);
        setDashboardData([]);
        setSelectedMall(null);
        setSelectedFloor(null);
        setSelectedZone(null);
      } else {
        setNoData(false);
        setDashboardData(malls);

        // Preserve selected mall
        const currentMall =
          malls.find((m) => m.mallId === selectedMall?.mallId) || malls[0];

        setSelectedMall(currentMall);

        // Preserve selected floor
        const floors = currentMall?.floors || [];

        const currentFloor =
          floors.find((f) => f.floorId === selectedFloor?.floorId) ||
          floors[0] ||
          null;

        setSelectedFloor(currentFloor);

        // Preserve selected zone
        const zones = currentFloor?.zones || [];

        const currentZone =
          zones.find((z) => z.zoneId === selectedZone?.zoneId) ||
          zones[0] ||
          null;

        setSelectedZone(currentZone);
        // setNoData(false);
        // setDashboardData(malls);
        // setSelectedMall(malls[0]);
        // const floor = malls[0].floors[0];
        // setSelectedFloor(floor);
        // setSelectedZone(floor.zones?.[0] || null);
      }

      setCards(widgets);
    } catch (err) {
      console.log(err);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  };
  const widget1 = cards?.widget1?.data?.[0] || {};
  const widget2 = cards?.widget2?.data?.[0] || {};
  const widget3 = cards?.widget3?.data?.[0] || {};
  const widget4 = cards?.widget4?.data?.[0] || {};
  console.log(selectedFloor, selectedZone, zonesToRender);
  return (
    <div className="mallwise-layout position-relative">
      {loading ? (
        <div className="loader-overlay">
          <Spinner animation="border" variant="primary" />
          <p>Loading...</p>
        </div>
      ) : dashboardData && dashboardData.length === 0 ? (
        <NoData name="no-data-Historical_dashboard" />
      ) : (
        <>
          {/* =====================================
              LEFT PANEL
          ===================================== */}
          <HeatmapSidebar
            mode="zone"
            mallsData={dashboardData || []}
            selectedMall={selectedMall}
            setSelectedMall={setSelectedMall}
            selectedFloor={selectedFloor}
            setSelectedFloor={setSelectedFloor}
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
          >
            {/* =================================
                  STATS CARDS
              ================================= */}
            {isToday && (
              <>
                <HeatmapStatsCard
                  value={widget2.TodayTotalVisitors ?? "-"}
                  title="Total Visitors"
                  subText="Today"
                  icon={<FiUsers />}
                  iconClass="blue"
                />
                <HeatmapStatsCard
                  value={widget2.YesterdayTotalVisitors ?? "-"}
                  title="Total Visitors"
                  subText="Yesterday"
                  trend={`${Math.abs(widget2.OccupancyPercentage ?? 0).toFixed(2)}%`}
                  trendType={widget2.Status == "Low" ? "down" : "up"}
                  icon={<FiCalendar />}
                  iconClass="blue"
                />

                <HeatmapStatsCard
                  value={widget3.LastHourTotalVisitors ?? "-"}
                  title="Visitors Inside"
                  subText="Last hour"
                  trend={`${Math.abs(widget3.OccupancyPercentage ?? "-").toFixed(2)}%`}
                  trendType={widget3.Status == "Low" ? "down" : "up"}
                  icon={<FiLogIn />}
                  iconClass="purple"
                />
                <HeatmapStatsCard
                  value={widget4.PeakHour ? `${widget4.PeakHour} Hr` : "-"}
                  title="Peak Hour & Occupancy"
                  subText={`${widget4.PeakHourOccupancy ?? "-"} Visitors`}
                  icon={<FiClock />}
                  iconClass="violet"
                />
              </>
            )}
          </HeatmapSidebar>

          {/* =====================================
              RIGHT PANEL
          ===================================== */}
          <div className="right-panel">
            <div className="heatmap-card">
              {selectedMall && selectedFloor && (
                <HeatmapHeader
                  mallName={selectedMall.mallName}
                  floorName={selectedFloor.floorName}
                  zoneName={selectedZone?.zoneName}
                />
              )}
              <HeatmapLegend gradientType={gradientType} />
              {selectedFloor && (
                <HeatmapCanvas
                  selectedFloor={selectedFloor}
                  zonesToRender={zonesToRender}
                  selectedZone={selectedZone}
                  zoom={zoom}
                  setZoom={setZoom}
                  gradientType={gradientType}
                  setGradientType={setGradientType}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default ZonewiseTab;
