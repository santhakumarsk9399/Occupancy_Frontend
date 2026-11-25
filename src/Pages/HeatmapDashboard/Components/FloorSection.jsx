// import React from "react";
// import ZoneCard from "./ZoneCard";

// const FloorSection = ({ floor }) => {
//     return (
//         <div className="floor-card">
//             <h5 className="floor-title">{floor.name}</h5>

//             <div
//                 className="zones-grid"
//                 style={{
//                     gridTemplateColumns: `repeat(${floor.columns || 3}, 1fr)`,
//                 }}
//             >
//                 {floor.zones.map((z, i) => (
//                     <div
//                         key={i}
//                         style={{
//                             gridRow: z.row,
//                             gridColumn: `${z.col} / span ${z.colSpan}`,
//                         }}
//                     >
//                         <ZoneCard zone={z} />
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default FloorSection;
import React from "react";
import ZoneCard from "./ZoneCard";

const FloorSection = ({ floor }) => {
    return (
        <div className="floor-card">
            <h5 className="floor-title">{floor.name}</h5>

            <div
                className="zones-grid"
                style={{
                    gridTemplateColumns: `repeat(${floor.columns || 3}, minmax(0, 1fr))`,
                }}
            >
                {/* {floor.zones.map((z, i) => (
                    <div
                        key={i}
                        style={{
                            gridRow: z.row,
                            gridColumn: `${z.col} / span ${z.colSpan}`,
                        }}
                    >
                        <ZoneCard zone={z} />
                    </div>
                ))} */}
                {floor.zones.map((z, i) => {
                    const startCol = ((z.col - 1) * z.colSpan) + 1;

                    return (
                        <div
                            key={i}
                            style={{
                                gridRow: z.row,
                                gridColumn: `${startCol} / span ${z.colSpan}`,
                            }}
                        >
                            <ZoneCard zone={z} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FloorSection;