import React from "react";
import FloorSection from "./FloorSection";

const chunk = (arr, size = 3) => {
    const res = [];
    for (let i = 0; i < arr.length; i += size) {
        res.push(arr.slice(i, i + size));
    }
    return res;
};

const MallSection = ({ mall }) => {
    const rows = chunk(mall.floors, 3);

    return (
        <div className="mallsection" >
            {/* <div className="mall-header">
                <h4 className="mall-title">Malls</h4>

                <div className="occupancy-wrapper">
                    <span className="occupancy-label">Occupancy</span>

                    <div className="gradient-bar"></div>

                    <div className="range">
                        <span>0%</span>
                        <span>100%</span>
                    </div>
                </div>
            </div> */}

            {/* Mall Name */}
            <h3>{mall.name}</h3>

            {/* Floors */}
            {rows.map((row, i) => (
                <div className="floor-row" key={i}>
                    {row.map((floor, idx) => (
                        <FloorSection key={idx} floor={floor} />
                    ))}
                </div>
            ))}
        </div>
    );
  };

export default MallSection;