import React from "react";
import ZoneCard from "./ZoneCard";

const FloorSection = ({ floor }) => {
    return (
        <div className="floor-card">
            <h5 className="floor-title">{floor.name}</h5>

            <div
                className="zones-grid"
                style={{
                    gridTemplateColumns: `repeat(${floor.columns}, 1fr)`,
                }}
            >
                {floor.zones.map((z, i) => (
                    <div
                        key={i}
                        style={{
                            gridRow: z.row,
                            gridColumn: `${z.col} / span ${z.colSpan}`,
                        }}
                    >
                        <ZoneCard zone={z} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FloorSection;