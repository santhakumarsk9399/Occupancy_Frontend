import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { SlSettings } from "react-icons/sl";
import { useAuth } from "../Context/ContextProvider";
import { sidebarConfig } from "../Pages/SideBarConfig";
import "../Components/Styles/Sidebar.css";
import "../Components/Styles/Mainpage.css";
import Logout from "./Login/Logout";
import Icon from "./CommonComponents/icon";
import LogoutIcon1 from "../Components/Assets/logout.svg";
import usernameicon from "../Components/Assets/username_Icon.svg";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const username = sessionStorage.getItem("username");

  if (!user) return null;

  // ✅ Detect section based on current path
  useEffect(() => {
    const path = location.pathname;

    // Find which section this path belongs to
    let foundSection = "dashboard"; // default
    Object.keys(sidebarConfig).forEach((section) => {
      const sectionMenus = sidebarConfig[section]?.menus || [];
      if (sectionMenus.some((menu) => path.startsWith(menu.path))) {
        foundSection = section;
      }
    });

    setActiveSection(foundSection);
  }, [location.pathname]);

  // ✅ Filter menus by role
  const currentMenus = sidebarConfig[activeSection]?.menus.filter((menu) =>
    menu.roles.includes(user.role)
  );

  // ✅ Switch section manually (icon click)
  const handleSectionChange = (section) => {
    if (section === activeSection) return;
    setActiveSection(section);

    // Navigate to first menu in that section
    const firstMenu = sidebarConfig[section]?.menus.find((menu) =>
      menu.roles.includes(user.role)
    );
    if (firstMenu?.path) {
      navigate(firstMenu.path);
    }
  };

  // ✅ Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app">
      {/* Sidebar left icons */}
      <div className="sidebar-icons">
        <div className="menuIconsdiv">
          <button
            onClick={() => handleSectionChange("dashboard")}
            className={activeSection === "dashboard" ? "icon-btn-active" : "icon-btn"}
          >
            <RxDashboard />
          </button>
          <button
            onClick={() => handleSectionChange("settings")}
            className={activeSection === "settings" ? "icon-btn-active" : "icon-btn"}
          >
            <SlSettings />
          </button>
        </div>

        <div className="logoutDiv">
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="icon-btn logout"
          >
            <Icon img={LogoutIcon1} Img_width="40px" Img_height="40px" />
          </button>
          <Logout
            show={showLogoutModal}
            handleClose={() => setShowLogoutModal(false)}
            handleLogout={handleLogout}
          />
        </div>
      </div>

      {/* Sidebar panel with menus */}
      <div className="sidebar-panel">
        {/* <h2
          className="panel-title clickable-title"
          onClick={() => {
            // Case 2 → always go to dashboard when clicking title
            setActiveSection("dashboard");
            navigate("/liveOccupancy");
          }}
          style={{ cursor: "pointer" }}
        >
          Occupancy 2.0
        </h2> */}
<h2
  className="panel-title clickable-title"
  onClick={() => {
    // Case 2 → always go to dashboard AND refresh page
    setActiveSection("dashboard");
    navigate("/liveOccupancy");
    window.location.reload(); // ✅ force refresh
  }}
  style={{ cursor: "pointer" }}
>
  Occupancy 2.0
</h2>

        <p className="panel-subtitle">{sidebarConfig[activeSection]?.label}</p>

        <div>
          {currentMenus.map((menu) => (
            <NavLink
              key={menu.path}
              to={menu.path}
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              {({ isActive }) => (
                <>
                  <img
                    src={isActive ? menu.iconActive : menu.iconInActive}
                    alt={menu.label}
                    className="menu-icon"
                  />
                  <span>{menu.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="user-info">
          <Icon img={usernameicon} Img_width="40px" Img_height="40px" />
          <span className="sidebar_username">{username}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
