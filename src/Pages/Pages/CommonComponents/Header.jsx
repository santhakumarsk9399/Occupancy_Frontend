// src/Pages/CommonComponents/Header.jsx
import React from "react";
import "../../Components/Styles/Header.css";

const routeTitles = {
  "/users": "Users",
  "/zones": "Zone",
  "/liveOccupancy": "Live Occupancy",
  "/historicalAnalytics": "Historical Analytics",
  "/predictions": "Predictions",
  "/threshold": "Threshold",
  "/sms": "SMS",
  "/email": "Email",
  "/logs": "Logs"
};

const Header = ({ location }) => {
  const title = routeTitles[location.pathname] || "Dashboard";

  return (
    <header className="header">
      <h3>{title}</h3>
    </header>
  );
};

export default Header;
