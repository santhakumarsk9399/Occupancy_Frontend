// sidebarConfig.js
import {
  FaUsers,
  FaMapMarkerAlt,
  FaSms,
  FaEnvelope,
  FaFileAlt,
  FaChartBar,
} from "react-icons/fa";
import User_active from "../Components/Assets/User_Inactive.png";
import User_Inactive from "../Components/Assets/User_Inactive.png";
import zone_active from "../Components/Assets/Zone_Active.png";
import zone_Inactive from "../Components/Assets/Zone_Inactive.png";
import threshold_active from "../Components/Assets/Threshold_Active.png";
import threshold_Inactive from "../Components/Assets/Threshold_Inactive.png";
import Sms_active from "../Components/Assets/Sms_Active.png";
import Sms_Inactive from "../Components/Assets/Sms_Inactive.png";
import Email_active from "../Components/Assets/Email_Active.png";
import Email_Inactive from "../Components/Assets/Email_Inactive.png";
import Logs_active from "../Components/Assets/Logs_Active.png";
import Logs_Inactive from "../Components/Assets/Logs_Inactive.png";
import { BsGrid3X3GapFill } from "react-icons/bs";

import Dash_active from "../Components/Assets/Dashboard_active.png";
import Dash_Inactive from "../Components/Assets/Dashboard_Inactive.png";
import Historical_active from "../Components/Assets/Historical_active.png";
import Historical_Inactive from "../Components/Assets/Historical_Inactive.png";
import Predictions_active from "../Components/Assets/Prediction_active.png";
import Predictions_Inactive from "../Components/Assets/Prediction_Inactive.png";
import SubmenuIcons from "./CommonComponents/submenuIcons";
import vendorAcitive from "../Components/Assets/vendor-blue.png";
export const sidebarConfig = {
  dashboard: {
    label: "Dashboard",
    menus: [
      {
        path: "/liveOccupancy",
        label: "Live Occupancy",
        roles: ["Admin","Operator","Viewer"],
        iconActive: Dash_active,
        iconInActive: Dash_Inactive,
      },
      {
        path: "/historicalAnalytics",
        label: "Historical Analytics",
        roles: ["Admin","Operator","Viewer"],
        iconActive: Historical_active,
        iconInActive: Historical_Inactive,
      },
      {
        path: "/HeatmapDashboard",
        label: "Heatmap Dashboard",
        roles: ["Admin","Operator","Viewer"],
        iconActive: Predictions_active,
        iconInActive: Predictions_Inactive,
      },
      {
        path: "/HealthDashboard",
        label: "Health Dashboard",
        roles: ["Admin", "Operator", "Viewer"],
        iconActive: Predictions_active,
        iconInActive: Predictions_Inactive,
      }
    ],
  },
  settings: {
    label: "Settings",
    menus: [
      {
        path: "/users",
        label: "Users",
        roles: ["Admin","Operator","Viewer"],
        iconActive: User_active,
        iconInActive: User_Inactive,
      },
      {
        path: "/zones",
        label: "Zone",
        roles: ["Admin"],
        iconActive: zone_active,
        iconInActive: zone_Inactive,
      },
      {
        path: "/threshold",
        label: "Threshold",
        roles:["Admin"],
        iconActive: threshold_active,
        iconInActive: threshold_Inactive,
      },
      {
        path: "/sms",
        label: "SMS",
        roles: ["Admin"],
        iconActive: Sms_active,
        iconInActive: Sms_Inactive,
      },
      {
        path: "/email",
        label: "Email",
        roles: ["Admin"],
        iconActive: Email_active,
        iconInActive: Email_Inactive,
      },
      {
        path: "/email",
        label: "Email",
        roles: ["Admin"],
        iconActive: Email_active,
        iconInActive: Email_Inactive,
      },
      {
        path: "/logs",
        label: "Logs",
       roles: ["Admin","Operator","Viewer"],
        iconActive: Logs_active,
        iconInActive: Logs_Inactive,
      },
      {
        path: "/SettingsHeatmap",
        label: "Heatmap",
        roles: ["Admin", "Operator", "Viewer"],
        iconActive: Predictions_active,
        iconInActive: Predictions_Inactive,
      },

    ],
  },
  licensing: {
    label: "Licensing",
    menus: [
      {
        label: "Vendors",
        path: "/licensing",
        roles: ["Licensing"],
        iconActive: vendorAcitive,
        iconInActive: vendorAcitive,
      },
    ],
  },
};
