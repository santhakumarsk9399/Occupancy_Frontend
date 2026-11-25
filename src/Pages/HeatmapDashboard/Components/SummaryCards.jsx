import React from "react";
// import { FiEye, FiArrowLeft, FiCalendar, FiClock, FiBell, FiHome, FiTrendingUp } from "react-icons/fi";
import {
  FiUsers,
  FiCalendar,
  FiLogIn,
  FiClock,
  FiTrendingUp,
  FiMoreVertical,
} from "react-icons/fi";
import "../Styles/summarycards.css";
import SparkLine from "./sparkline";
import MiniBarChart from "./minibar";
import VisitorsProgress from "./VisitorsInsideProgress";
const SummaryCards = ({
  cards,
  variant = "default",
}) => {

  const isTV = variant === "tv";
  const widget1 = cards?.widget1?.data?.[0] || {};
  const widget2 = cards?.widget2?.data?.[0] || {};
  const widget3 = cards?.widget3?.data?.[0] || {};
  const widget4 = cards?.widget4?.data?.[0] || {};

  const getOccupancyColor = (percentage) => {
    if (percentage <= 20) return "#2D8CFF"; // Blue
    if (percentage <= 40) return "#22C55E"; // Green
    if (percentage <= 60) return "#FACC15"; // Yellow
    if (percentage <= 80) return "#F97316"; // Orange
    return "#EF4444"; // Red
  };
  const occupancyPercentage = Number(widget3.OccupancyPercentage ?? 0);

  const occupancyColor = getOccupancyColor(occupancyPercentage);
  const data = [
    {
      title: "Total Visitors",
      value: widget2.TodayTotalVisitors ?? "-",
      sub: "Today",
      icon: <FiUsers />,
      type: "normal",
      chart: "line",
    },
    {
      title: "Total Visitors",
      value: widget2.YesterdayTotalVisitors ?? "-",
      sub: "Yesterday",
      trend: `${Math.abs(widget2.OccupancyPercentage ?? 0).toFixed(2)}%`,
      trendType: widget2.Status === "Low" ? "down" : "up",
      icon: <FiCalendar />,
      type: "normal",
      chart: "bars",
    },
    {
      title: "Visitors Inside",
      value: widget3.LastHourTotalVisitors ?? "-",
      sub: "Last hour",
      trend: `${Math.abs(widget3.OccupancyPercentage ?? 0).toFixed(2)}%`,
      trendType: widget3.Status === "Low" ? "down" : "up",
      icon: <FiLogIn />,
      type: "normal",
      chart: "progress",
    },
    {
      title: "Peak Hour",
      value: widget4.PeakHour ?`${widget4.PeakHour} Hr`: "-",
      icon: <FiClock />,
      type: "peakHour",
    },
    {
      title: "Peak Occupancy",
      value: widget4.PeakHourOccupancy ?? "-",
      icon: <FiTrendingUp />,
      type: "peakOccupancy",
    },
  ];
  const hours = [1,2,3,4,5,6,7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  const totalVisitors = Number(widget2.TodayTotalVisitors ?? 0);
  const visitorsInside = Number(widget3.LastHourTotalVisitors ?? 0);

  const insidePercentage =
    totalVisitors > 0
      ? (visitorsInside / totalVisitors) * 100
      : 0;
  return (
    <div className={`summary ${isTV ? "summary-tv" : ""}`}>
      {data.map((item, i) => {
  
        if (item.type === "peakHour") {

          const peakValue = String(item.value || "");
          const startHour = parseInt(peakValue, 10);

          const timelineRanges = [];

          for (let h = startHour - 2; h <= startHour + 2; h++) {
            if (h >= 0 && h < 23) {
              timelineRanges.push({
                start: h,
                end: h + 1,
                isPeak: h === startHour,
              });
            }
          }
          
          // const startHour = Number(item.value.split(":")[0]);
          return (
            <div
              key={i}
              className={`summary-card modern ${isTV ? "tv-vertical-card" : ""
                }`}
          >
              <div className="card-top">
                <div className="title-area">
                  <span> {item.title}</span>
                </div>
                <div className="icon-circle">{item.icon}</div>
                {/* <FiMoreVertical className="menu-icon" /> */}
              </div>

              <div className="peak-box">
                <div className="peak-time">
                  {item.value}
                </div>
    
                <div className="timeline">
                  <div className="timeline-line"></div>

                  {timelineRanges.map((slot, index) => (
                    <div className="hour-item" key={index}>
                      <span className={`hour-label ${slot.isPeak ? "active" : ""}`}>
                        {slot.start}-{slot.end}
                      </span>

                      <div className={slot.isPeak ? "hour-dot active" : "hour-dot"} />

                      {slot.isPeak && (
                        <span className="peak-text">
                          Peak
                        </span>
                      )}
                    </div>
                  ))}
                </div>
          
              </div>
            </div>
          );
        }

        if (item.type === "peakOccupancy") {
          return (
            <div
              key={i}
              className={`summary-card modern ${isTV ? "tv-vertical-card" : ""
                }`}
          >
              <div className="card-top">
                <div className="title-area">
                  <span>{item.title}</span>
                </div>
                <div className="icon-circle">{item.icon}</div>
              </div>

              <div className="peak-percent" style={{ color: occupancyColor }}>
                {item.value}
              </div>

              <div className="progress">
                <div
                  className="progress-mask"
                  style={{
                    width: `${100 - occupancyPercentage}%`,
                  }}
                />
              </div>

              <div className="scale">
                <span>0%</span>

                <div
                  className="current-percentage"
                  style={{ color: occupancyColor }}
                >
                  {occupancyPercentage.toFixed(2)}%
                </div>

                <span>100%</span>
              </div>
            </div>
          );
        }

        return (
          <div
            key={i}
            className={`summary-card modern ${isTV ? "tv-vertical-card" : ""
              }`}
          >
            <div className="card-top">
              <div className="title-area">
                <span>{item.title}</span>
              </div>
              <div className="icon-circle">{item.icon}</div>
              {/* <FiMoreVertical className="menu-icon" /> */}
            </div>

            {/* <div className="divider" /> */}

            <div className="summary-body">
              <div className="value-wrapper">
                <div className="big-number">{item.value}</div>
              </div>

              {item.chart === "line" && <SparkLine />}
              {item.chart === "bars" && <MiniBarChart />}
              {item.chart === "progress" && (
                <VisitorsProgress
                  value={visitorsInside}
                  total={totalVisitors}
                  percentage={insidePercentage}
                />
              )}
            </div>

            <div className="footer-chip">
              <span>{item.sub}</span>

              {item.chart === "line" ? (
                <span className="live-chip">● Live</span>
              ) : (
                <span className={`trend-${item.trendType}`}>
                  {item.trendType === "up" ? "↗" : "↘"}
                  {item.trend}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
