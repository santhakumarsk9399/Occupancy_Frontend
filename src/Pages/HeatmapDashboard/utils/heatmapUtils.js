/* =========================================================
   GET ZONE CENTER
========================================================= */

export const getZoneCenter = (
    points = []
) => {

    const centerX =
        points.reduce(
            (sum, p) =>
                sum + p.x,
            0
        ) / points.length;

    const centerY =
        points.reduce(
            (sum, p) =>
                sum + p.y,
            0
        ) / points.length;

    return {

        centerX,
        centerY,

    };

};

/* =========================================================
   AVG RADIUS
========================================================= */

export const getAverageRadius = (
    points = []
) => {

    const {
        centerX,
        centerY,
    } = getZoneCenter(
        points
    );

    return (

        points.reduce(
            (sum, p) => {

                const dx =
                    p.x -
                    centerX;

                const dy =
                    p.y -
                    centerY;

                return (
                    sum +
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    )
                );

            },
            0
        ) / points.length

    );

};

/* =========================================================
   OCCUPANCY RATIO
========================================================= */

export const getOccupancyRatio = (
    occupancy = 0,
    max = 2000
) => {

    return occupancy / max;

};

/* =========================================================
   ZONE AREA FACTOR
========================================================= */

export const getAreaFactor = (
    avgRadius
) => {

    const zoneArea =
        avgRadius *
        avgRadius;

    return Math.min(

        Math.max(
            zoneArea / 90000,
            0.55
        ),

        1.4

    );

};

/* =========================================================
   POINT DENSITY
========================================================= */

export const getDensity = (
    occupancyRatio,
    areaFactor
) => {

    return Math.floor(

        (
            120 +
            occupancyRatio *
            900
        ) *
        areaFactor

    );

};

/* =========================================================
   BASE INTENSITY
========================================================= */

export const getBaseIntensity = (
    occupancyRatio
) => {

    let baseIntensity =
        0.12 +
        occupancyRatio *
        0.55;

    if (
        occupancyRatio < 0.08
    ) {

        baseIntensity *=
            0.45;

    }

    else if (
        occupancyRatio < 0.18
    ) {

        baseIntensity *=
            0.65;

    }

    else if (
        occupancyRatio < 0.35
    ) {

        baseIntensity *=
            0.82;

    }

    return baseIntensity;

};

/* =========================================================
   CANVAS ROTATION
========================================================= */

export const toCanvasXY = (

    imgX,
    imgY,
    imageH,
    zoom

) => {

    return {

        cx:
            (imageH - imgY) *
            zoom,

        cy:
            imgX * zoom,

    };

};