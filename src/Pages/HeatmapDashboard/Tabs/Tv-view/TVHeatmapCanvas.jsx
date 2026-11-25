import React, { useEffect, useMemo, useRef, useState } from "react";
import simpleheat from "simpleheat";
import { getImageUrl } from "../../../Settings_Heatmap/components/Heatmaps/utils/imageHelper";
import "../../Styles/mallwiseTab.css";

// function toCanvasXY(imgX, imgY, imageH, scale) {
//     return {
//         cx: (imageH - imgY) * scale,
//         cy: imgX * scale,
//     };
// }
function toCanvasXY(imgX, imgY, scale) {
  return {
    cx: imgX * scale,
    cy: imgY * scale,
  };
}
const TVHeatmapCanvas = ({
  selectedFloor,
  selectedZone,
  zonesToRender = [],
}) => {
  const heatmapRef = useRef(null);

  if (!selectedFloor) return null;

  const imageW = selectedFloor.imageW;
  const imageH = selectedFloor.imageH;
    const [zoom, setZoom] = useState(3.5);

    const [offset, setOffset] = useState({
        x: 0,
        y: 0,
    });
  const availableWidth = window.innerWidth - 60;
  const availableHeight = window.innerHeight - 260;

  const scale = useMemo(() => {
    return Math.min(availableWidth / imageH, availableHeight / imageW);
  }, [imageW, imageH]);

  const canvasWidth = imageH * scale;
  const canvasHeight = imageW * scale;

  const imgStyle = {
    width: canvasWidth,
    height: canvasHeight,
    objectFit: "contain",
  };
    const focusSelectedZone = () => {

        if (!selectedZone?.points?.length) return;

        const xs = selectedZone.points.map(p => p.x);
        const ys = selectedZone.points.map(p => p.y);

        const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
        const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;

        const zoomLevel = 4;

        setZoom(zoomLevel);

        const viewWidth = window.innerWidth;
        const viewHeight = window.innerHeight - 240;

        setOffset({

            x: viewWidth / 2 - centerX * zoomLevel,

            y: viewHeight / 2 - centerY * zoomLevel,

        });

    };
    useEffect(() => {

        focusSelectedZone();

    }, [selectedZone]);
  const renderBorders = () => {
    return (
        <svg

            width={imageW}

            height={imageH}

            style={{
                position: "absolute",
                inset: 0,
                zIndex: 5,
            }}

    >
        {zonesToRender.map((zone) => {
          const polygon = zone.points
            .map((p) => {
                const { cx, cy } = toCanvasXY(
                    p.x,
                    p.y,
                    scale
                );

              return `${cx},${cy}`;
            })
            .join(" ");

          return (
            <polygon
              key={zone.zoneId}
              points={polygon}
              fill="rgba(255,255,255,.02)"
              stroke="#0d6efd"
              strokeWidth={5}
            />
          );
        })}
      </svg>
    );
  };
  return (
    <div className="tv-map-wrapper">
          <div
              className="tv-map-inner"
              style={{
                  width: imageW,
                  height: imageH,

                  transform: `translate(${offset.x}px,${offset.y}px) scale(${zoom})`,

                  transformOrigin: "top left",

                  position: "absolute",
              }}
          >
        <img
          src={getImageUrl(selectedFloor.floorImage)}
          className="tv-floor-image"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />

        <div ref={heatmapRef} className="tv-heat-layer" />

        {renderBorders()}
      </div>
    </div>
  );
};

export default TVHeatmapCanvas;
