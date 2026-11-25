import {
    FiHome,
    FiMap,
    FiGrid,
    FiActivity,
    FiBarChart2,
    FiTrendingUp,
    FiLayers,
    FiArrowRight
} from "react-icons/fi";
import { PiMonitorDuotone } from "react-icons/pi";
import { RiDashboardHorizontalFill } from "react-icons/ri";
import { RiDashboard3Line } from "react-icons/ri";
export const quickLinks = [
    {
        id: 1,
        name: "Single Zone Dashboard",
        desc: "Detailed single zone analytics",
        icon: PiMonitorDuotone,
        path: "",
        bgColor: "#EEF4FF",
        iconColor: "#2563EB",
        type: "others",
        view:"singlezone"
    },
    {
        id: 2,
        name: "Multi Zone Dashboard",
        desc: "Detailed multi zone analytics",
        icon: FiBarChart2,
        path: "",
        bgColor: "#FFF7E6",
        iconColor: "#F59E0B",
        type: "others",
        view: "multizone"
    },
    {
        id: 3,
        name: "Heatmap Mall Dashboard",
        desc: "Detailed mall heatmap analytics",
        icon: FiGrid,
        path: "",
        bgColor: "#E9F8EF",
        iconColor: "#22C55E",
        type: "others",
        view: "Heatmap_Mallwise-View"
    },
    {
        id: 4,
        name: "Heatmap Zone Dashboard",
        desc: "Detailed zone heatmap analytics",
        icon: FiMap,
        path: "",
        bgColor: "#F9ECFF",
        iconColor: "#C026D3",
        type: "others",
        view: "Heatmap_Zonewise-View"
    },

    // {
    //     id: 5,
    //     name: "Heatmap Dashboard",
    //     desc: "Heatmap Analytics",
    //     icon: RiDashboard3Line,
    //     path: "/HeatmapDashboard",
    //     bgColor: "#F3F0FF",
    //     iconColor: "#7C3AED",
    //     type: "web",
    //     view: ""
    // }
];


// export const quickLinks = [
//     {
//         id: 1,
//         name: "Mall Dashboard",
//         desc: "View overall mall performance",
//         icon: FiHome,
//         path: "/mall-dashboard"
//     },
//     {
//         id: 2,
//         name: "Zone Dashboard",
//         desc: "View zone occupancy",
//         icon: FiMap,
//         path: "/zone-dashboard"
//     },
//     {
//         id: 3,
//         name: "Single Mall View",
//         desc: "Detailed mall analytics",
//         icon: FiGrid,
//         path: "/single-mall"
//     },
//     {
//         id: 4,
//         name: "Single Zone View",
//         desc: "Detailed zone analytics",
//         icon: FiActivity,
//         path: "/single-zone"
//     },
//     {
//         id: 5,
//         name: "Dashboard 1",
//         desc: "Custom Dashboard",
//         icon: FiBarChart2,
//         path: "/dashboard1"
//     },
//     {
//         id: 6,
//         name: "Dashboard 2",
//         desc: "Custom Dashboard",
//         icon: FiTrendingUp,
//         path: "/dashboard2"
//     },
//     {
//         id: 7,
//         name: "Dashboard 3",
//         desc: "Custom Dashboard",
//         icon: FiLayers,
//         path: "/dashboard3"
//     },
//     {
//         id: 8,
//         name: "Heatmap Dashboard",
//         desc: "Heatmap Analytics",
//         icon: FiArrowRight,
//         path: "/heatmap-dashboard"
//     }
//   ];