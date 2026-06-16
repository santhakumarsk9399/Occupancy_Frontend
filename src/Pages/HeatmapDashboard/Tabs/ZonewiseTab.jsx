import React, {
  useEffect,
  useState,
} from "react";

import "../Styles/mallwiseTab.css";

import {
  mallsData,
} from "../data/MallsMockData";

import HeatmapSidebar
  from "../CommonComponents/HeatmapSidebar";

import HeatmapHeader
  from "../CommonComponents/HeatmapHeader";

import HeatmapLegend
  from "../CommonComponents/HeatmapLegend";

import HeatmapCanvas
  from "../CommonComponents/HeatmapCanvas";

import HeatmapStatsCard
  from "../CommonComponents/HeatmapStatsCard";

import useHeatmap
  from "../hooks/useHeatmap";

import {

  FiUsers,
  FiLogIn,
  FiClock,
  FiActivity,
  FiAlertCircle,

} from "react-icons/fi";

const ZonewiseTab = ({
  filterDate,
  appliedFilters,
}) => {

  /* =========================================
     STATES
  ========================================= */

  const [zoom, setZoom] =
    useState(1);

  const [gradientType,
    setGradientType] =
    useState("default");

  const [selectedMall,
    setSelectedMall] =
    useState(
      mallsData[0]
    );

  const [selectedFloor,
    setSelectedFloor] =
    useState(
      mallsData[0]
        .floors[0]
    );

  const [selectedZone,
    setSelectedZone] =
    useState(
      mallsData[0]
        .floors[0]
        .zones[0]
    );

  /* =========================================
     COMMON HOOK
  ========================================= */

  const {
    zonesToRender,
  } = useHeatmap({

    mode: "zone",

    selectedFloor,

    selectedZone,

  });

  /* =========================================
     FILTER DATE
  ========================================= */

  useEffect(() => {

    console.log(
      "Zone Filter Date:",
      filterDate
    );

    console.log(
      "Applied Filters:",
      appliedFilters
    );

    // API CALL HERE

  }, [
    filterDate,
    appliedFilters,
  ]);

  /* =========================================
     FLOOR CHANGE
  ========================================= */

  useEffect(() => {

    if (
      selectedFloor?.zones?.length
    ) {

      setSelectedZone(
        selectedFloor.zones[0]
      );

    }

  }, [selectedFloor]);

  /* =========================================
     JSX
  ========================================= */

  return (

    <div className="mallwise-layout">

      {/* =====================================
              LEFT PANEL
          ===================================== */}

      <HeatmapSidebar

        mode="zone"

        mallsData={mallsData}

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

         <HeatmapStatsCard

          value={
            selectedZone?.occupancy
              ?.toLocaleString()
          }

          title="Total Visitors"

          subText="Yesterday"

          trend="↗ 3.0%"

          trendType="positive"

          icon={<FiUsers />}

          iconClass="blue"

        />

        <HeatmapStatsCard

          value="905"

          title="Visitors Inside"

          subText="Last hour"

          trend="↙ 4.8%"

          trendType="negative"

          icon={<FiLogIn />}

          iconClass="purple"

        />

        <HeatmapStatsCard

          value="16:30"

          title="Peak Hour"

          subText="957 Visitors"

          icon={<FiClock />}

          iconClass="violet"

        />

        <HeatmapStatsCard

          value="37min"

          title="Avg Dwell Time"

          subText="Yesterday"

          trend="↙ 9.3%"

          trendType="negative"

          icon={<FiActivity />}

          iconClass="pink"

        />

        <HeatmapStatsCard

          value="2"

          title="Active Alerts"

          subText="1 New alert"

          icon={<FiAlertCircle />}

          iconClass="red"

        /> 

      </HeatmapSidebar>

      {/* =====================================
              RIGHT PANEL
          ===================================== */}

      <div className="right-panel">
        <div className="heatmap-card">
          <HeatmapHeader
            mallName={
              selectedMall.mallName
            }

            floorName={
              selectedFloor.floorName
            }

            zoneName={
              selectedZone?.zoneName
            }

          />
          <HeatmapLegend
            gradientType={
              gradientType
            }
          />

          <HeatmapCanvas
            selectedFloor={
              selectedFloor
            }
            zonesToRender={
              zonesToRender
            }
            zoom={zoom} setZoom={setZoom}

            gradientType={
              gradientType
            }
            setGradientType={
              setGradientType
            }

          />

        </div>

      </div>

    </div>

  );

};

export default ZonewiseTab;