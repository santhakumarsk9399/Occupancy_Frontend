import React from "react";

import {
    HiOutlineBuildingOffice2,
} from "react-icons/hi2";

import {
    MdOutlineDashboardCustomize,
} from "react-icons/md";

import {
    FiGrid,
} from "react-icons/fi";

import "../Styles/mallwiseTab.css";

const HeatmapHeader = ({

    mallName,
    floorName,
    zoneName,

}) => {

    return (

        <div className="heatmap-topbar">

            <div className="breadcrumb">

                {/* =====================================
                    MALL
                ===================================== */}

                <span className="breadcrumb-item">

                    <HiOutlineBuildingOffice2
                        size={18}
                        className="breadcrumb-icon"
                    />

                    {mallName}

                </span>

                {/* =====================================
                    FLOOR
                ===================================== */}

                <span className="breadcrumb-item">

                    <MdOutlineDashboardCustomize
                        size={18}
                        className="breadcrumb-icon"
                    />

                    {floorName}

                </span>

                {/* =====================================
                    ZONE
                    OPTIONAL
                ===================================== */}

                {zoneName && (

                    <span className="breadcrumb-item">

                        <FiGrid
                            size={18}
                            className="breadcrumb-icon"
                        />

                        {zoneName}

                    </span>

                )}

            </div>

        </div>

    );

};

export default HeatmapHeader;