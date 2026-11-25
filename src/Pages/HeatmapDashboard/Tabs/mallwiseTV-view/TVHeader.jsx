import React, { useEffect, useState } from "react";
import {
    FiMapPin,
    FiLayers,
    FiRefreshCw,
    FiCalendar,
} from "react-icons/fi";
import dayjs from "dayjs";
import "../../Styles/mallwiseTV.css"
const TVHeader = ({
    malls = [],
    selectedMall,
    selectedFloor,
    onMallChange,
    onFloorChange,
    onRefresh,
}) => {
    const [time, setTime] = useState(dayjs());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(dayjs());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="tv-header">

            <div className="tv-header-left">

                <h2>Heatmap Dashboard</h2>

                <p>Real-time occupancy overview</p>

            </div>

            <div className="tv-header-right">

                {/* Mall */}

                <div className="tv-select">

                    <FiMapPin />

                    <select
                        value={selectedMall?.mallId || ""}
                        onChange={(e) => onMallChange(e.target.value)}
                    >
                        {malls.map((mall) => (
                            <option
                                key={mall.mallId}
                                value={mall.mallId}
                            >
                                {mall.mallName}
                            </option>
                        ))}
                    </select>

                </div>

                {/* Floor */}
                <div className="tv-filter">
                    
                    <label>Floor</label>
                <div className="tv-select">

                    <FiLayers />

                    <select
                        value={selectedFloor?.floorId || ""}
                        onChange={(e) => onFloorChange(e.target.value)}
                    >
                        {selectedMall?.floors?.map((floor) => (
                            <option
                                key={floor.floorId}
                                value={floor.floorId}
                            >
                                {floor.floorName}
                            </option>
                        ))}
                    </select>

                    </div>
                    </div>

                <button
                    className="tv-refresh-btn"
                    onClick={onRefresh}
                >
                    <FiRefreshCw />
                    Refresh
                </button>

                <div className="tv-clock">

                    <FiCalendar />

                    <div>

                        <strong>
                            {time.format("DD MMM YYYY")}
                        </strong>

                        <span>
                            {time.format("hh:mm A")}
                        </span>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default TVHeader;