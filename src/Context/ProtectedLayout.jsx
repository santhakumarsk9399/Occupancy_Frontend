import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/ContextProvider";
import Sidebar from "../Pages/Sidebar";
import Header from "../Pages/CommonComponents/Header";
import Footer from "../Pages/CommonComponents/Footer";
import "../Components/Styles/ProtectedLayout.css";
import AutoLogoutHandler from "../Pages/CommonComponents/AutoLogoutHandler";

const ProtectedLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
//  console.log(user)
  if (!user) return <Navigate to="/login" />;

  // Routes to hide header and/or footer
  const hideHeaderOn = ["/users/view", "/liveOccupancy", "/historicalAnalytics", "/HeatmapDashboard", "/SettingsHeatmap"];
  const hideFooterOn = ["/analytics/raw", "/sms"];

  // Match exact or wildcard routes
  const matchAny = (paths) =>
    paths.some((path) => location.pathname.startsWith(path));

  const shouldHideHeader = matchAny(hideHeaderOn);
  const shouldHideFooter = matchAny(hideFooterOn);

  return (
    <div className="app">
      <Sidebar />
      <div className="main-content-wrapper">
         <AutoLogoutHandler />
        {!shouldHideHeader && <Header location={location} />}
        <div className="main-content">
          <Outlet />
        </div>
        {!shouldHideFooter && <Footer />}
      </div>
    </div>
  );
};

export default ProtectedLayout;

