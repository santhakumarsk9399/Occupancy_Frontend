import {
    useMemo,
} from "react";

const useHeatmap = ({

    mode = "mall",

    selectedFloor,

    selectedZone,

}) => {

    /* =========================================
       ZONES TO RENDER
    ========================================= */

    const zonesToRender =
        useMemo(() => {

            // ZONEWISE

            if (
                mode === "zone"
            ) {

                return selectedZone
                    ? [selectedZone]
                    : [];

            }

            // MALLWISE

            return (
                selectedFloor?.zones ||
                []
            );

        }, [

            mode,

            selectedFloor,

            selectedZone,

        ]);

    return {

        zonesToRender,

    };

};

export default useHeatmap;