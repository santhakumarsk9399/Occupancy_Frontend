import React from "react";
import dayjs from "dayjs";
import {
    HiOutlineBuildingOffice2,
} from "react-icons/hi2";
import {
    MdOutlineDashboardCustomize,
} from "react-icons/md";
import {
    FiGrid,
    FiClock,
} from "react-icons/fi";
import "./TVheader.css";

const TVHeader = ({
    mallName,
    floorName,
    zoneName,
}) => {

    return (
        <div className="tv-header">

            <div className="tv-title">

                <h2>Zone Wise Live Dashboard</h2>

                <div className="tv-breadcrumb">

                    <span>
                        <HiOutlineBuildingOffice2 />
                        {mallName || "-"}
                    </span>

                    <span>
                        <MdOutlineDashboardCustomize />
                        {floorName || "-"}
                    </span>

                    <span>
                        <FiGrid />
                        {zoneName || "-"}
                    </span>

                </div>

            </div>

            <div className="tv-date">

                <div>
                    {dayjs().format("DD MMM YYYY")}
                </div>

                <div>
                    <FiClock />
                    {dayjs().format("hh:mm:ss A")}
                </div>

            </div>

        </div>
    );
};

export default TVHeader;