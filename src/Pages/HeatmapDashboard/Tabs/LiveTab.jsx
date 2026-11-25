import React, { use, useEffect, useState } from "react";
import SummaryCards from "../components/SummaryCards";
import MallSection from "../components/MallSection";
import { mallsData } from "../data/mockData";
import "../Styles/liveTab.css";
import "../Styles/LoaderOverlay.css";
import HeatmapStatsCard from "../CommonComponents/HeatmapStatsCard";
import HeatmapSidebar from "../CommonComponents/HeatmapSidebar";
import {
  FiUsers,
  FiLogIn,
  FiClock,
  FiActivity,
  FiAlertCircle,
} from "react-icons/fi";
import {
  getDashboardWidgets,
  getHeatmapLiveDashboard,
} from "../api/HeatmapDashboardApis";
import dayjs from "dayjs";
import Loader from "../../CommonComponents/Loader";
import { Spinner } from "react-bootstrap";
import NoData from "../../CommonComponents/NoDataAvailable";
import SummaryCards2 from "../Components/summaryCards2";
const LiveTab = ({ activeTab, appliedFilters, filtersLoaded, refreshPage }) => {
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true); // First load
  const [refreshing, setRefreshing] = useState(false); // auto refresh
  const [cards, setCards] = useState({
    widget1: {},
    widget2: {},
    widget3: {},
    widget4: {},
  });
  // initial load
  useEffect(() => {
    if (!filtersLoaded) return;
    if (activeTab !== "Live") return;

    loadLiveDashboard(false);
  }, [filtersLoaded, activeTab, appliedFilters]);

  console.log(appliedFilters)
  //auto refresh
  useEffect(() => {
    if (!filtersLoaded) return;
    if (activeTab !== "Live") return;

    loadLiveDashboard(true);
  }, [refreshPage]);

  const loadLiveDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const Dashboard_payload = {
        inputDate: dayjs().format("YYYY-MM-DD"),
        filters: appliedFilters.filters,
      };

      const widget_payload = {
        mallname:
          (appliedFilters?.malls || []).map((m) => m.label).join(",") || "",
        floorname:
          (appliedFilters?.floors || []).map((f) => f.label).join(",") || "",
        zonename:
          (appliedFilters?.zones || []).map((f) => f.label).join(",") || "",
        inputDate: dayjs().format("YYYY-MM-DD"),
      };

      const [widgets, dashboard] = await Promise.all([
        getDashboardWidgets(widget_payload),
        getHeatmapLiveDashboard(Dashboard_payload),
      ]);

      setCards(widgets);
      setDashboardData(dashboard.data || []);
      console.log(dashboard.data);
    } catch (err) {
      console.log(err);
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };
  // console.log(dashboardData.length);
  return (
    <div className="mall-content">
      <div className="live-content-wrapper">
        {loading ? (
          <div className="loader-overlay">
            <Spinner animation="border" variant="primary" />
            <p>Loading...</p>
          </div>
        ) : dashboardData?.length === 0 ? (
          <NoData name="no-data-Heatmap_dashboard" />
        ) : (
          <>
                <SummaryCards cards={cards} />
                {/* <SummaryCards2 cards={cards} /> */}

            <div className="mall-container">
              <div className="mall-header">
                <h4 className="mall-title">Malls</h4>

                <div className="occupancy-wrapper">
                  <span className="occupancy-label">Occupancy</span>
                  <div className="gradient-bar"></div>
                  <div className="range">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {dashboardData.map((mall, index) => (
                <MallSection key={index} mall={mall} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveTab;
