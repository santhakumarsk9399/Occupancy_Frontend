import React, { useEffect, useState } from "react";
import "../../Styles/mallwiseTab.css";
import "../../Styles/LoaderOverlay.css";
import { mallsData } from "../../data/MallsMockData";
import HeatmapSidebar from "../../CommonComponents/HeatmapSidebar";
import HeatmapHeader from "../../CommonComponents/HeatmapHeader";
import HeatmapLegend from "../../CommonComponents/HeatmapLegend";
import HeatmapCanvas from "../../CommonComponents/HeatmapCanvas";
import HeatmapStatsCard from "../../CommonComponents/HeatmapStatsCard";
import useHeatmap from "../../hooks/useHeatmap";
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
} from "../../api/HeatmapDashboardApis";
import NoData from "../../../CommonComponents/NoDataAvailable";
import "./zoneWiseTV.css";
const ZoneWiseTV = ({}) => {
  const [zoom, setZoom] = useState(1);
  const [gradientType, setGradientType] = useState("default");
  const [selectedMall, setSelectedMall] = useState(mallsData[0]);
  const [selectedFloor, setSelectedFloor] = useState(mallsData[0].floors[0]);
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

  const [zoneIndex, setZoneIndex] = useState(0);

  const allZones = selectedFloor?.zones || [];

  /* =========================================
     FILTER DATE
  ========================================= */
  const loadDashboard = async () => {
    try {
      const widgetPayload = {
        mallname: "Heatmap2",
        floorname: "First Floor,Occ-Floor",
        zonename: "abin-zone,san-zone",
        inputDate: dayjs().format("YYYY-MM-DD"),
      };

      const dashboardPayload = {
        inputDate: dayjs().format("YYYY-MM-DD"),
        filters: [
          {
            mallName: "Heatmap2",
            floorName: "First Floor",
            zoneName: "abin-zone",
          },
          {
            mallName: "Heatmap2",
            floorName: "Occ-Floor",
            zoneName: "san-zone",
          },
        ],
      };

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
      if (malls.length > 0) {
        const mall = malls[0];
        const floor = mall.floors[0];
        const zone = floor.zones[0];

        setSelectedMall(mall);
        setSelectedFloor(floor);
        setSelectedZone(zone);
      }

      setCards(widgets);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(loadDashboard, 15000);

    return () => clearInterval(interval);
  }, []);

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


  useEffect(() => {
    if (!allZones.length) return;

    const timer = setInterval(() => {
      setZoneIndex((prev) => {
        const next = (prev + 1) % allZones.length;

        setSelectedZone(allZones[next]);

        return next;
      });
    }, 15000);

    return () => clearInterval(timer);
  }, [allZones]);

  const widget1 = cards?.widget1?.data?.[0] || {};
  const widget2 = cards?.widget2?.data?.[0] || {};
  const widget3 = cards?.widget3?.data?.[0] || {};
  const widget4 = cards?.widget4?.data?.[0] || {};
  // console.log(dashboardData.length)
  return (
      <div className="zonewise-tv-layout">
      <div className="tv-header">
        <div className="tv-header-title">
          Occupancy Solution <span>2.0</span>
        </div>

        <div className="tv-header-right">
          <label>Zone</label>

          <select
            value={zoneIndex}
            onChange={(e) => {
              const index = Number(e.target.value);
              setZoneIndex(index);
              setSelectedZone(allZones[index]);
            }}
          >
            {allZones.map((z, index) => (
              <option key={z.zoneId} value={index}>
                {z.zoneName}
              </option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <div className="loader-overlay">
          <Spinner animation="border" variant="primary" />
          <p>Loading...</p>
        </div>
      ) : dashboardData && dashboardData.length === 0 ? (
        <NoData name="no-data-Historical_dashboard" />
      ) : (
        <>
          {/* <div className="zonewise-tv-page"> */}
          <div className="tv-body">
            <div className="tv-cards">
              <div className="stats-panel">
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
                  value={widget4.PeakHour ?? "-"}
                  title="Peak Hour & Occupancy"
                //   subText={`${widget4.PeakHourOccupancy ?? "-"} Visitors`}
                  icon={<FiClock />}
                  iconClass="violet"
                    />
                    <HeatmapStatsCard
                      value={widget4.PeakHourOccupancy ?? "-"}
                      title="Peak Occupancy"
                      //   subText={`${widget4.PeakHourOccupancy ?? "-"} Visitors`}
                      icon={<FiClock />}
                      iconClass="violet"
                    />                   
                   
              </div>
            </div>
            <div className="tv-map">
              <div className="right-panel singleZoneview">
                {/* // <select
            //   value={zoneIndex}
            //   onChange={(e) => setZoneIndex(Number(e.target.value))}
            // >
            //   {allZones.map((z, index) => (
            //     <option key={z.zoneId} value={index}>
            //       {z.zoneName}
            //     </option>
            //   ))}
            // </select> */}
                <div className="heatmap-card">
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
            </div>
            {/* </div> */}
          </div>
        </>
      )}
    </div>
  );
};
export default ZoneWiseTV;
