// import React, { useState, useEffect } from "react";
// import "../../Components/Styles/Tooltip.css";

// const SmoothTooltip = ({ active, payload, coordinate }) => {
//   const [visible, setVisible] = useState(false);
//   const [tooltipData, setTooltipData] = useState(null);
//   const [position, setPosition] = useState({ left: 0, top: 0 });

//   useEffect(() => {
//     if (active && payload && payload.length && payload[0].payload) {
//       setTooltipData(payload[0].payload);
//       setPosition({
//         left: coordinate.x + 12,
//         top: coordinate.y - 48,
//       });
//       setVisible(true);
//     } else {
//       const timeout = setTimeout(() => setVisible(false), 150);
//       return () => clearTimeout(timeout);
//     }
//   }, [active, payload, coordinate]);

//   if (!tooltipData) return null;
//   // console.log(tooltipData);
//   const zoneType = tooltipData.type?.toLowerCase() || "low";

//   return (
//     <div
//       className={`custom-tooltip ${
//         visible ? "fade-in-tooltip" : "fade-out-tooltip"
//       } ${zoneType}-tooltip`}
//       style={{
//         position: "absolute",
//         left: position.left,
//         top: position.top,
//         pointerEvents: "none",
//       }}
//     >
//       {tooltipData.Incount && (
//         <div className="tooltip-line">
//           In: <span className="tooltip-count">{tooltipData.Incount}</span>
//         </div>
//       )}
//       {tooltipData.Outcount && (
//         <div className="tooltip-line">
//           Out: <span className="tooltip-count">{tooltipData.Outcount}</span>
//         </div>
//       )}
//       {tooltipData.Occupancy && (
//         <div className="tooltip-line">
//           Occupancy:{" "}
//           <span className="tooltip-count">{tooltipData.Occupancy}</span>
//         </div>
//       )}
//       {tooltipData.Totalvisitors && (
//         <div className="tooltip-line">
//           Total Visitors:{" "}
//           <span className="tooltip-count">{tooltipData.Totalvisitors}</span>
//         </div>
//       )}
//             {tooltipData.Counts && (
//         <div className="tooltip-line">
//           Total Visitors:{" "}
//           <span className="tooltip-count">{tooltipData.Counts}</span>
//         </div>
//       )}
//       {tooltipData.ZoneName && (
//         <div className="tooltip-line">
//           Zone Name:{" "}
//           <span className="tooltip-count">{tooltipData.ZoneName}</span>
//         </div>
//       )}
//       {tooltipData.hour && (
//         <div className="tooltip-line">
//           Hours: <span className="tooltip-count">{tooltipData.hour}</span>
//         </div>
//       )}
//           {tooltipData.techzone && (
//         <div className="tooltip-line">
//           Zone Name: <span className="tooltip-count">{tooltipData.techzone}</span>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SmoothTooltip;
import React, { useState, useEffect } from "react";
import "../../Components/Styles/Tooltip.css";
import { FiMapPin, FiArrowDownCircle, FiArrowUpCircle, FiUsers } from "react-icons/fi";
import { createPortal } from "react-dom";

const SmoothTooltip = ({ active, payload, coordinate }) => {
  const [visible, setVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState(null);
  // const [position, setPosition] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (active && payload && payload.length && payload[0].payload) {
      setTooltipData(payload[0].payload);
      // setPosition({
      //   left: coordinate.x + 12,
      //   top: coordinate.y - 48,
      // });

      // const TOOLTIP_WIDTH = 240;
      // const TOOLTIP_HEIGHT = 180;
      // const PADDING = 16;

      // let left = coordinate.x + 15;
      // let top = coordinate.y - TOOLTIP_HEIGHT / 2;

      // // Move to the left if the tooltip would overflow on the right
      // if (left + TOOLTIP_WIDTH > window.innerWidth - PADDING) {
      //   left = coordinate.x - TOOLTIP_WIDTH - 15;
      // }

      // // Keep inside top
      // if (top < PADDING) {
      //   top = PADDING;
      // }

      // // Keep inside bottom
      // if (top + TOOLTIP_HEIGHT > window.innerHeight - PADDING) {
      //   top = window.innerHeight - TOOLTIP_HEIGHT - PADDING;
      // }

      // setPosition({
      //   left,
      //   top,
      // });
      setVisible(true);
    } else {
      const timeout = setTimeout(() => setVisible(false), 150);
      return () => clearTimeout(timeout);
    }
  }, [active, payload, coordinate]);

  if (!tooltipData) return null;
  const zoneType = tooltipData.type?.toLowerCase() || "low";
  const zoneName =
    tooltipData.ZoneName || tooltipData.techzone || "";

  const displayZoneName =
    zoneName.length > 20
      ? `${zoneName.substring(0, 20)}...`
      : zoneName;

  return (
    // <div
    //   className={`custom-tooltip ${
    //     visible ? "fade-in-tooltip" : "fade-out-tooltip"
    //   } ${zoneType}-tooltip`}
    //   style={{
    //     position: "absolute",
    //     left: position.left,
    //     top: position.top,
    //     pointerEvents: "none",
    //   }}
    // >
    //   {/* {tooltipData.Incount && (
    //     <div className="tooltip-line">
    //       In: <span className="tooltip-count">{tooltipData.Incount}</span>
    //     </div>
    //   )}
    //   {tooltipData.Outcount && (
    //     <div className="tooltip-line">
    //       Out: <span className="tooltip-count">{tooltipData.Outcount}</span>
    //     </div>
    //   )}
    //   {tooltipData.Occupancy && (
    //     <div className="tooltip-line">
    //       Occupancy:{" "}
    //       <span className="tooltip-count">{tooltipData.Occupancy}</span>
    //     </div>
    //   )}
    //   {tooltipData.Totalvisitors && (
    //     <div className="tooltip-line">
    //       Total Visitors:{" "}
    //       <span className="tooltip-count">{tooltipData.Totalvisitors}</span>
    //     </div>
    //   )}
    //         {tooltipData.Counts && (
    //     <div className="tooltip-line">
    //       Total Visitors:{" "}
    //       <span className="tooltip-count">{tooltipData.Counts}</span>
    //     </div>
    //   )} */}
    //   {tooltipData.Incount != null && (
    //     <div className="tooltip-line">
    //       In Count: <span className="tooltip-count">{tooltipData.Incount}</span>
    //     </div>
    //   )}

    //   {tooltipData.Outcount != null && (
    //     <div className="tooltip-line">
    //       Out Count: <span className="tooltip-count">{tooltipData.Outcount}</span>
    //     </div>
    //   )}

    //   {tooltipData.Occupancy != null && (
    //     <div className="tooltip-line">
    //       Occupancy Count: <span className="tooltip-count">{tooltipData.Occupancy}</span>
    //     </div>
    //   )}

    //   {tooltipData.Totalvisitors != null && (
    //     <div className="tooltip-line">
    //       Total Visitors: <span className="tooltip-count">{tooltipData.Totalvisitors}</span>
    //     </div>
    //   )}

    //   {tooltipData.Counts != null && (
    //     <div className="tooltip-line">
    //       Total Visitors: <span className="tooltip-count">{tooltipData.Counts}</span>
    //     </div>
    //   )}
    //   {tooltipData.ZoneName && (
    //     <div className="tooltip-line">
    //       Zone Name:{" "}
    //       <span className="tooltip-count">{tooltipData.ZoneName?.length > 14
    //         ? `${tooltipData.ZoneName.substring(0, 13)}...`
    //         : tooltipData.ZoneName}</span>
    //     </div>
    //   )}
    //   {tooltipData.hour && (
    //     <div className="tooltip-line">
    //       Hours: <span className="tooltip-count">{tooltipData.hour}</span>
    //     </div>
    //   )}
    //       {tooltipData.techzone && (
    //     <div className="tooltip-line">
    //       Zone Name: <span className="tooltip-count">{tooltipData.techzone}</span>
    //     </div>
    //   )}
    // </div>
    <div
      className={`custom-tooltip ${visible ? "fade-in-tooltip" : "fade-out-tooltip"
        }`}
    >

      <div className="tooltip-heading">
        Zone Information
      </div>
      <div className="tooltip-divider"></div>
      {tooltipData.Incount != null && (
        <div className="tooltip-line">
          <span className="dot green"></span>
          In Count

          <span className="tooltip-count">
            {tooltipData.Incount}
          </span>
        </div>
      )}

      {tooltipData.Outcount != null && (
        <div className="tooltip-line">
          <span className="dot red"></span>
          Out Count

          <span className="tooltip-count">
            {tooltipData.Outcount}
          </span>
        </div>
      )}

      {tooltipData.Occupancy != null && (
        <div className="tooltip-line">
          <span className="dot blue"></span>
          Occupancy

          <span className="tooltip-count">
            {tooltipData.Occupancy}
          </span>
        </div>
      )}

      {tooltipData.Totalvisitors != null && (
        <div className="tooltip-line">
          <span className="dot purple"></span>
          Visitors

          <span className="tooltip-count">
            {tooltipData.Totalvisitors}
          </span>
        </div>
      )}
      {tooltipData.hour != null && (
        <div className="tooltip-row">
          <div className="tooltip-label">
            Hours
          </div>
          <div className="tooltip-value">{tooltipData.hour}</div>
        </div>
      )}

      {/* {tooltipData.techzone && (
        <div className="tooltip-row">
          <div className="tooltip-label">
             Zone Name
          </div>
          <div className="tooltip-value"> {tooltipData.techzone.length > 14
            ? `${tooltipData.techzone.substring(0, 14)}...`
            : tooltipData.techzone}</div>
        </div>
      )} */}
      <div className="tooltip-divider"></div>

      {zoneName && (
        <div
          className="tooltip-zone-name"
          title={zoneName} // Shows full name on browser hover
        >
          {displayZoneName}
        </div>
      )}

    </div>
  );
};

export default SmoothTooltip;
