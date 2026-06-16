import React, {
    useEffect,
    useRef,
} from "react";

import h337 from "heatmap.js";

const DynamicHeatmap = ({
    image,
    points,
}) => {

    const heatmapRef = useRef(null);

    useEffect(() => {

        if (!heatmapRef.current) return;

        // Create Heatmap Instance
        const heatmapInstance = h337.create({
            container: heatmapRef.current,

            radius: 45,

            maxOpacity: 0.7,

            minOpacity: 0.1,

            blur: 0.85,

            gradient: {
                0.2: "#1E88E5",
                0.4: "#33B56A",
                0.7: "#FBC002",
                1.0: "#F44336",
            },
        });

        // Set Data
        heatmapInstance.setData({
            max: 100,
            data: points,
        });

    }, [points]);

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
            }}
        >

            {/* FLOOR IMAGE */}
            <img
                src={image}
                alt="floor"
                style={{
                    width: "100%",
                    display: "block",
                }}
            />

            {/* HEATMAP OVERLAY */}
            <div
                ref={heatmapRef}
                style={{
                    position: "absolute",
                    inset: 0,
                }}
            />

        </div>
    );
};

export default DynamicHeatmap;