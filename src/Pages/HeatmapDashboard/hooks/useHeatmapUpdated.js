import { useMemo } from "react";

const useHeatmapUpdated = ({
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

export default useHeatmapUpdated;