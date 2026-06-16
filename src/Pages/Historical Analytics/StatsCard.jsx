import React from "react";
import "../../Components/Styles/StatsCards.css";
import Icon from "../CommonComponents/icon";
import { useSpring, animated } from "@react-spring/web";
import RemainingCapacity from "../../Components/Assets/dashboard/sv_remainingcapacity.svg";
import LowOccupancy from "../../Components/Assets/dashboard/sv_peakoccupancy.svg";
import LowHour from "../../Components/Assets/dashboard/sv_peakhour.svg";
import PeakOccupancy from "../../Components/Assets/dashboard/peakoccupancy.svg";
import PeakHour from "../../Components/Assets/dashboard/peakHour.svg";
import OccupancyIcon from "../../Components/Assets/dashboard/sv_occupancy.svg";
const StatsCards = ({ data }) => {
  console.log(data);
  return (
    <>
      <div className="container-fluid mt-3 px-0">
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3  g-3 mx1-0">
          <div className="col">
            <StatCard
              icon={OccupancyIcon}
              value={data?.totalVisitors || "-"}
              label="Total Visitors"
            />
          </div>
          <div className="col">
            <StatCard
              icon={PeakOccupancy}
              value={data?.peakOccupancy || ""}
              label="Peak Occupancy"
            />
          </div>
          <div className="col">
            <StatCard
              icon={PeakHour}
              value={data?.peakHour || ""}
              isHour
              label="Peak Hour"
            />
          </div>
        </div>
      </div>
    </>
  );
};
const StatCard = ({
  icon,
  value,
  label,
  isPercentage = false,
  isHour = false,
}) => {
  const props = useSpring({ val: Number(value) || 0, from: { val: 0 } });
  return (
    <div className="dash3-stat-card">
      <div className="cardsec1">
        <Icon img={icon} Img_width="35px" Img_height="35px" />
        <div className="dash3-stat-main">
          {isHour ? (
            <span>
              {value}
             {(value)!="0" ? <span className="hrtext">Hr</span> :"-" }
            </span>
          ) : (
            <animated.div className="dash3-stat-main_historical">
              {props.val.to((n) =>
                isPercentage
                  ? `${Math.floor(n)}%`
                  : isHour
                  ? `${n} Hr`
                  : Math.floor(n)
              )}
            </animated.div>
          )}
        </div>
      </div>
      <div className="dash3-stat-label">{label}</div>
    </div>
  );
};

export default StatsCards;
