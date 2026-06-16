import React, {
    useEffect,
    useRef,
} from "react";

import simpleheat from "simpleheat";

import "../Styles/mallwiseTab.css";

/* =========================================================
   HELPERS
========================================================= */

function toCanvasXY(
    imgX,
    imgY,
    imageH,
    zoom
) {

    return {

        cx: (imageH - imgY) * zoom,

        cy: imgX * zoom,

    };

}

/* =========================================================
   COMPONENT
========================================================= */

const HeatmapCanvas = ({

    selectedFloor,

    zonesToRender = [],

    zoom,
    setZoom,

    gradientType,
    setGradientType,

}) => {

    const heatmapRef =
        useRef(null);

    const {
        imageW,
        imageH,
    } = selectedFloor;

    const canvasW =
        imageH * zoom;

    const canvasH =
        imageW * zoom;

    const imgStyle = {

        width:
            imageW * zoom,

        height:
            imageH * zoom,

    };

    /* =====================================================
       HEATMAP
    ===================================================== */

    useEffect(() => {

        if (!heatmapRef.current)
            return;

        heatmapRef.current.innerHTML =
            "";

        const canvas =
            document.createElement(
                "canvas"
            );

        canvas.width =
            canvasW;

        canvas.height =
            canvasH;

        heatmapRef.current.appendChild(
            canvas
        );

        const heat =
            simpleheat(canvas);

        const points = [];

        zonesToRender.forEach(
            (zone) => {

                /* =====================================
                   OCCUPANCY DATA
                ===================================== */

                const occCount =
                    zone.occupancy || 0;

                // max allowed people
                const capacity =
                    zone.capacity || 1;

                // occupancy ratio (0 - 1)
                const occupancyRatio =
                    Math.min(
                        occCount / capacity,
                        1
                    );

                // occupancy %
                const occupancyPercentage =
                    Math.round(
                        occupancyRatio * 100
                    );

                /* =====================================
                   CENTER
                ===================================== */

                const centerX =
                    zone.points.reduce(
                        (sum, p) =>
                            sum + p.x,
                        0
                    ) /
                    zone.points.length;

                const centerY =
                    zone.points.reduce(
                        (sum, p) =>
                            sum + p.y,
                        0
                    ) /
                    zone.points.length;

                /* =====================================
                   AVG RADIUS
                ===================================== */

                const avgRadius =
                    zone.points.reduce(
                        (
                            sum,
                            p
                        ) => {

                            const dx =
                                p.x -
                                centerX;

                            const dy =
                                p.y -
                                centerY;

                            return (
                                sum +
                                Math.sqrt(
                                    dx *
                                    dx +
                                    dy *
                                    dy
                                )
                            );

                        },
                        0
                    ) /
                    zone.points.length;

                /* =====================================
                   AREA FACTOR
                ===================================== */

                const zoneArea =
                    avgRadius *
                    avgRadius;

                const areaFactor =
                    Math.min(
                        Math.max(
                            zoneArea /
                            90000,
                            0.55
                        ),
                        1.4
                    );

                /* =====================================
                   DENSITY
                ===================================== */

                const density =
                    Math.floor(
                        (
                            120 +
                            occupancyRatio *
                            900
                        ) *
                        areaFactor
                    );

                /* =====================================
                   POINTS
                ===================================== */

                for (
                    let i = 0;
                    i < density;
                    i++
                ) {

                    const angle =
                        Math.random() *
                        Math.PI *
                        2;

                    const radius =
                        Math.pow(
                            Math.random(),
                            0.65
                        ) *
                        avgRadius *
                        1.15;

                    const px =
                        centerX +
                        Math.cos(
                            angle
                        ) *
                        radius;

                    const py =
                        centerY +
                        Math.sin(
                            angle
                        ) *
                        radius;

                    const falloff =
                        Math.pow(
                            1 -
                            radius /
                            (
                                avgRadius *
                                1.15
                            ),
                            1.8
                        );

                    let baseIntensity =
                        0.12 +
                        occupancyRatio *
                        0.55;

                    if (
                        occupancyRatio <
                        0.08
                    ) {

                        baseIntensity *=
                            0.45;

                    }

                    else if (
                        occupancyRatio <
                        0.18
                    ) {

                        baseIntensity *=
                            0.65;

                    }

                    else if (
                        occupancyRatio <
                        0.35
                    ) {

                        baseIntensity *=
                            0.82;

                    }

                    const intensity =
                        baseIntensity *
                        falloff;

                    const {
                        cx,
                        cy,
                    } = toCanvasXY(
                        px,
                        py,
                        selectedFloor.imageH,
                        zoom
                    );

                    points.push([
                        cx,
                        cy,
                        Math.max(
                            0.02,
                            intensity
                        ),
                    ]);

                }

                // optional console log
                console.log({
                    zone:
                        zone.zoneName,
                    occupancy:
                        occCount,
                    capacity,
                    occupancyPercentage,
                });

            }
        );

        heat.data(points);

        /* =====================================
           GRADIENT
        ===================================== */

        heat.gradient(

            gradientType ===
                "purple"

                ? {

                    0.05: "#f7e8ff",

                    0.18: "#efccff",

                    0.35: "#df9fff",

                    0.52: "#c86dff",

                    0.70: "#a63dff",

                    0.85: "#8d5be2",

                    1.0: "#6525be",

                }

                : {

                    0.05:
                        "#c7f3ff",

                    0.18:
                        "#8be8ff",

                    0.38:
                        "#8dffb2",

                    0.55:
                        "#e8ff8d",

                    0.72:
                        "#ffe08a",

                    0.86:
                        "#ffb36b",

                    0.94:
                        "#ff7b5c",

                    1.0:
                        "#ff4d4d",

                }

        );

        /* =====================================
           RADIUS
        ===================================== */

        heat.radius(

            zoom >= 1.5

                ? 78

                : zoom >= 1

                    ? 66

                    : 54,

            48
        );

        heat.max(1);

        heat.draw(0.04);

    }, [

        selectedFloor,

        zonesToRender,

        zoom,

        gradientType,

        canvasW,

        canvasH,

    ]);

    /* =====================================================
       LABELS
    ===================================================== */

    const renderLabels = () => {

        return zonesToRender.map(
            (zone) => {

                const centerX =
                    zone.points.reduce(
                        (
                            sum,
                            p
                        ) =>
                            sum +
                            p.x,
                        0
                    ) /
                    zone.points.length;

                const centerY =
                    zone.points.reduce(
                        (
                            sum,
                            p
                        ) =>
                            sum +
                            p.y,
                        0
                    ) /
                    zone.points.length;

                const {
                    cx,
                    cy,
                } = toCanvasXY(
                    centerX,
                    centerY,
                    imageH,
                    zoom
                );

                const occupancy =
                    zone.occupancy || 0;

                const capacity =
                    zone.capacity || 1;

                const occupancyPercentage =
                    Math.round(
                        (
                            occupancy /
                            capacity
                        ) * 100
                    );

                return (

                    <div

                        key={
                            zone.zoneId
                        }

                        className="zone-label"

                        style={{

                            left: cx,

                            top: cy,

                        }}

                    >

                        <h4>
                            {
                                zone.zoneName
                            }
                        </h4>

                        <p>

                            {
                                occupancy.toLocaleString()
                            }

                            {" / "}

                            {/* {capacity} */}

                            {" ("}

                            {
                                occupancyPercentage
                            }

                            {"%)"}

                        </p>

                    </div>

                );

            }
        );

    };

    /* =====================================================
       JSX
    ===================================================== */

    return (

        <div className="map-wrapper">

            <div className="map-scroll">

                <div

                    className="map-inner"

                    style={{

                        width: canvasW,

                        height: canvasH,

                    }}

                >

                    {/* FLOOR IMAGE */}

                    <img

                        src={
                            selectedFloor.floorImage
                        }

                        alt=""

                        className="floor-image"

                        style={imgStyle}

                    />

                    {/* HEATMAP */}

                    <div

                        ref={heatmapRef}

                        className="heatmap-layer"

                    />

                    {/* LABELS */}

                    {renderLabels()}

                </div>

            </div>

            {/* =====================================
               TOOLS
            ===================================== */}

            <div className="map-tools">

                {/* ZOOM IN */}

                <button
                    onClick={() =>
                        setZoom(
                            (p) =>
                                +(
                                    p +
                                    0.1
                                ).toFixed(
                                    1
                                )
                        )
                    }
                >
                    +
                </button>

                {/* ZOOM OUT */}

                <button
                    onClick={() =>
                        setZoom(
                            (p) =>
                                +Math.max(
                                    0.3,
                                    p -
                                    0.1
                                ).toFixed(
                                    1
                                )
                        )
                    }
                >
                    −
                </button>

                {/* DEFAULT */}

                <div

                    className="gradient-tool first"

                    onClick={() =>
                        setGradientType(
                            "default"
                        )
                    }

                />

                {/* PURPLE */}

                <div

                    className="gradient-tool second"

                    onClick={() =>
                        setGradientType(
                            "purple"
                        )
                    }

                />

            </div>

        </div>

    );

};

export default HeatmapCanvas;