// import {
//     useMemo,
// } from "react";

// const useHeatmap = ({

//     mode = "mall",

//     selectedFloor,

//     selectedZone,

// }) => {

//     /* =========================================
//        ZONES TO RENDER
//     ========================================= */

//     const zonesToRender =
//         useMemo(() => {

//             // ZONEWISE

//             if (
//                 mode === "zone"
//             ) {

//                 return selectedZone
//                     ? [selectedZone]
//                     : [];

//             }

//             // MALLWISE

//             return (
//                 selectedFloor?.zones ||
//                 []
//             );

//         }, [

//             mode,

//             selectedFloor,

//             selectedZone,

//         ]);

//     return {

//         zonesToRender,

//     };

// };

// export default useHeatmap;

import { useMemo } from "react";

const useHeatmap = ({
    selectedFloor,
    selectedZone = null,
    mode = "mall",
}) => {

    const zonesToRender = useMemo(() => {

        if (!selectedFloor)
            return [];

        const zones = selectedFloor.zones || [];

        switch (mode) {

            case "zone":

                return selectedZone
                    ? [selectedZone]
                    : [];

            case "tv":

                return zones;

            case "mall":

            default:

                return zones;
        }

    }, [
        selectedFloor,
        selectedZone,
        mode,
    ]);

    return {

        zonesToRender,

    };

};

export default useHeatmap;