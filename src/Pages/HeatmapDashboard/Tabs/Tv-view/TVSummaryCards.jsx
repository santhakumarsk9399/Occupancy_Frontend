import React from "react";
import { FiUsers, FiLogIn, FiActivity, FiClock } from "react-icons/fi";
import "./summaryCards.css";

const TVSummaryCards = ({ widget2, widget3, widget4 }) => {
  const cards = [
    {
      title: "Today's Visitors",
      value: widget2?.TodayTotalVisitors ?? 0,
      icon: <FiUsers />,
      color: "#2563eb",
    },

    {
      title: "Visitors Inside",
      value: widget3?.LastHourTotalVisitors ?? 0,
      icon: <FiLogIn />,
      color: "#8b5cf6",
    },

    {
      title: "Occupancy",
      value: `${Math.abs(widget3?.OccupancyPercentage ?? 0).toFixed(1)}%`,
      icon: <FiActivity />,
      color: "#16a34a",
    },

    {
      title: "Peak Hour",
      value: widget4?.PeakHour ?? "--",
      icon: <FiClock />,
      color: "#f97316",
    },
  ];

  return (
    <div className="tv-summary-grid">
      {cards.map((card, index) => (
        <div
          key={index}
          className="tv-summary-card"
          style={{
            borderTop: `6px solid ${card.color}`,
          }}
        >
          <div
            className="tv-card-icon"
            style={{
              color: card.color,
            }}
          >
            {card.icon}
          </div>

          <div className="tv-card-info">
            <h3>{card.value}</h3>

            <p>{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TVSummaryCards;
