// import React from "react";
// import dayjs from "dayjs";
// import { FiClock } from "react-icons/fi";

// import deloptLogo from "../../../../Components/Assets/footer-logo.svg";
// // import jkLogo from "../../../../Components/Assets/footer-logo.png";

// import "../../Styles/tvFooter.css";

// const TVFooter = () => {
//     return (
//         <div className="tv-footer">

//             <div className="tv-footer-left">
//                 <FiClock className="tv-footer-icon" />

//                 <span>
//                     {dayjs().format("hh:mm A, DD MMM YYYY")}
//                 </span>
//             </div>

//             <div className="tv-footer-right">

//                 <span className="tv-footer-copy">
//                     Copyright © {dayjs().year()} All Rights Reserved
//                 </span>

//                 <img
//                     src={deloptLogo}
//                     alt="Delopt"
//                     className="tv-footer-logo"
//                 />

//                 {/* <img
//                     src={jkLogo}
//                     alt="JK Papers"
//                     className="tv-footer-logo jk-logo"
//                 /> */}

//             </div>

//         </div>
//     );
// };

// export default TVFooter;
import React from "react";
import dayjs from "dayjs";
import { FiClock, FiInfo } from "react-icons/fi";

import deloptLogo from "../../../../Components/Assets/footer-logo.svg";

import "../../Styles/tvFooter.css";

const TVFooter = ({ rotationText = "" }) => {
    return (
        <div className="tv-footer">

            {/* Left */}
            <div className="tv-footer-left">
                <FiClock className="tv-footer-icon" />
                <span>
                    {dayjs().format("hh:mm A, DD MMM YYYY")}
                </span>
            </div>

            {/* Center */}
            {rotationText && (
                <div className="tv-footer-center">
                    <FiInfo className="tv-footer-info-icon" />
                    <span>{rotationText}</span>
                </div>
            )}

            {/* Right */}
            <div className="tv-footer-right">

                <span className="tv-footer-copy">
                    Copyright © {dayjs().year()} All Rights Reserved
                </span>

                <img
                    src={deloptLogo}
                    alt="Delopt"
                    className="tv-footer-logo"
                />
            </div>

        </div>
    );
};

export default TVFooter;