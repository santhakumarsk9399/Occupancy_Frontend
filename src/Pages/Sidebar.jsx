import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaTable, FaCog, FaPowerOff, FaUser } from "react-icons/fa";
import { RxDashboard } from "react-icons/rx";
import { SlSettings } from "react-icons/sl";
import { useAuth } from "../Context/ContextProvider";
import { sidebarConfig } from "../Pages/SideBarConfig";
import dash from "../Components/Assets/dashboard.png";
import dash1 from "../Components/Assets/bluedash.png";
import "../Components/Styles/Sidebar.css";
import "../Components/Styles/Mainpage.css";
import Logout from "./Login/Logout";
import logoutIcon from "../Components/Assets/Logout1.png"
import Icon from "./CommonComponents/icon";
import LogoutIcon1 from "../Components/Assets/logout.svg"
import usernameicon from "../Components/Assets/username_Icon.svg"
const Sidebar = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
 const username = sessionStorage.getItem("username"); // username
  // console.log(user)
  if (!user) return null;

  const currentMenus = sidebarConfig[activeSection]?.menus.filter((menu) =>
    menu.roles.includes(user.role)
  );
  const handleSectionChange = (section) => {
    if (section === activeSection) return; // prevent unnecessary rerender
    setActiveSection(section);

    // After section is changed, navigate to the first allowed menu
    const firstMenu = sidebarConfig[section]?.menus.find((menu) =>
      menu.roles.includes(user.role)
    );

    if (firstMenu?.path) {
      navigate(firstMenu.path);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <div className="sidebar-icons">
        <div className="menuIconsdiv">
          <button
            // onClick={() => setActiveSection("dashboard")}
            onClick={() => handleSectionChange("dashboard")}
            className={
              activeSection == "dashboard" ? "icon-btn-active" : "icon-btn"
            }
          >
            <RxDashboard />
            {/* {activeSection === 'dashboard' ?<img className='' src={dash1} width='20px' height='20px' /> :<img className='' src={dash} width='20px' height='20px' />} */}
          </button>
          <button
            // onClick={() => setActiveSection("settings")}
            onClick={() => handleSectionChange("settings")}
            className={
              activeSection === "settings" ? "icon-btn-active" : "icon-btn"
            }
          >
            <SlSettings />
          </button>
        </div>

        <div className="logoutDiv">
          <button
            type="button"
            // onClick={handleLogout}
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

      <div className="sidebar-panel">
        <h2 className="panel-title">
          Occupancy 2.0
          {/* <span className="version-tag">2.0</span> */}
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
          {/* <FaUser /> */}
            <Icon img={usernameicon} Img_width="40px" Img_height="40px" />
          <span className="sidebar_username">{username}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
