import { useEffect, useRef, useState, useCallback } from "react";
import { zoneColors } from "../utils/constant";
import { fixImageUrl, getZoneBounds } from "../utils/helpers";
import "../Styles/list.css";
import "../Styles/common.css";

function ViewPage({ viewRecord, onBack }) {
    const containerRef = useRef();
    const [dims, setDims] = useState({ w: 0, h: 0 });
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState(null);
    const [fitted, setFitted] = useState(false);
    const touchRef = useRef(null);

    const imgW = Number(viewRecord.ImageWidth) || 1080;
    const imgH = Number(viewRecord.ImageHeight) || 600;
    const zoneData =
        typeof viewRecord.ZoneData === "string"
            ? JSON.parse(viewRecord.ZoneData)
            : viewRecord.ZoneData;
    // ── Measure container ──
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            const w = el.clientWidth;
            const h = el.clientHeight;
            if (w > 0 && h > 0) setDims({ w, h });
        });
        ro.observe(el);
        // Also set immediately
        if (el.clientWidth > 0) setDims({ w: el.clientWidth, h: el.clientHeight });
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (dims.w === 0 || dims.h === 0) return;

        const points = zoneData?.points;
        if (!points?.length) return;

        const bounds = getZoneBounds(points);

        // Small margin around zone
        const padding = 50;

        const zoneWidth = bounds.width + padding;
        const zoneHeight = bounds.height + padding;

        const scaleX = dims.w / zoneWidth;
        const scaleY = dims.h / zoneHeight;

        const fitZoom = Math.min(scaleX, scaleY);

        // allow much larger zoom
        const newZoom = Math.min(fitZoom, 12);

        const centerX = (bounds.minX + bounds.maxX) / 2;
        const centerY = (bounds.minY + bounds.maxY) / 2;

        setZoom(newZoom);

        setPan({
            x: dims.w / 2 - centerX * newZoom,
            y: dims.h / 2 - centerY * newZoom,
        });
    }, [dims, zoneData]);

    // ── Wheel zoom (zoom toward cursor) ──
    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        setZoom((prevZoom) => {
            const delta = -e.deltaY * 0.001;
            const newZoom = Math.min(8, Math.max(0.2, prevZoom + delta * prevZoom));
            const scale = newZoom / prevZoom;
            setPan((prev) => ({
                x: mouseX - scale * (mouseX - prev.x),
                y: mouseY - scale * (mouseY - prev.y),
            }));
            return newZoom;
        });
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener("wheel", handleWheel, { passive: false });
        return () => el.removeEventListener("wheel", handleWheel);
    }, [handleWheel]);

    // ── Mouse pan ──
    const handleMouseDown = (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y });
    };
    const handleMouseMove = (e) => {
        if (!isPanning || !panStart) return;
        setPan({
            x: panStart.px + e.clientX - panStart.mx,
            y: panStart.py + e.clientY - panStart.my,
        });
    };
    const handleMouseUp = () => { setIsPanning(false); setPanStart(null); };

    // ── Touch pan ──
    const handleTouchStart = (e) => {
        if (e.touches.length !== 1) return;
        touchRef.current = {
            mx: e.touches[0].clientX,
            my: e.touches[0].clientY,
            px: pan.x,
            py: pan.y,
        };
    };
    const handleTouchMove = (e) => {
        if (!touchRef.current || e.touches.length !== 1) return;
        setPan({
            x: touchRef.current.px + e.touches[0].clientX - touchRef.current.mx,
            y: touchRef.current.py + e.touches[0].clientY - touchRef.current.my,
        });
    };

    const imageUrl = fixImageUrl(
        viewRecord.FullImageURL || viewRecord.ThumbnailURL
    );

    // const zoneData =
    //     typeof viewRecord.ZoneData === "string"
    //         ? JSON.parse(viewRecord.ZoneData)
    //         : viewRecord.ZoneData;
    
    const g = zoneColors[zoneData?.gradientId] || zoneColors.blue;

    const buildPoints = (points) =>
        points.map((p) => `${p.x * zoom + pan.x},${p.y * zoom + pan.y}`).join(" ");

    const pts = zoneData?.points?.length ? buildPoints(zoneData.points) : null;

    return (
        <div className="list-root">

            <div className="view-page-header">
                <div className="view-page-fields">
                    <div className="editor-field-group">
                        <span className="editor-field-label">Mall Name</span>
                        <div className="view-page-field-value"> {viewRecord.MallName}</div>
                    </div>
                    <div className="editor-field-group">
                        <span className="editor-field-label">Floor Name</span>
                        <div className="view-page-field-value">{viewRecord.FloorName}</div>
                    </div>
                    <div className="editor-field-group">
                        <span className="editor-field-label">Zone Name</span>
                        <div className="view-page-field-value">{viewRecord.ZoneName}</div>
                    </div>
                </div>
                <button className="btn btn-cancel" onClick={onBack}>Back</button>
            </div>

            <div className="list-card">

                {/* Header */}

                {/* Canvas */}
                <div className="view-page-canvas-wrap">
                    <div
                        className="view-page-canvas"
                        ref={containerRef}
                        style={{ cursor: isPanning ? "grabbing" : "grab" }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                    >
                        {/* Image */}
                        {imageUrl && (
                            <img
                                src={imageUrl}
                                alt="zone"
                                draggable={false}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: imgW,
                                    height: imgH,
                                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                    transformOrigin: "0 0",
                                    userSelect: "none",
                                    pointerEvents: "none",
                                }}
                            />
                        )}

                        {/* SVG overlay */}
                        {pts && (
                            <svg
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    pointerEvents: "none",
                                    overflow: "visible",
                                }}
                            >
                                <defs>
                                    <pattern
                                        id="vp-hatch"
                                        patternUnits="userSpaceOnUse"
                                        width="10"
                                        height="10"
                                        patternTransform="rotate(45)"
                                    >
                                        <line
                                            x1="0" y1="0" x2="0" y2="10"
                                            stroke={g.stroke}
                                            strokeWidth="2.5"
                                            strokeOpacity="0.4"
                                        />
                                    </pattern>
                                </defs>

                                <polygon points={pts} fill="url(#vp-hatch)" stroke="none" />
                                <polygon points={pts} fill={g.fill} stroke="none" />
                                <polygon
                                    points={pts}
                                    fill="none"
                                    stroke={g.stroke}
                                    strokeWidth={2.5}
                                />

                                {zoneData.points.map((p, i) => (
                                    <circle
                                        key={i}
                                        cx={p.x * zoom + pan.x}
                                        cy={p.y * zoom + pan.y}
                                        r={5}
                                        fill="white"
                                        stroke={g.stroke}
                                        strokeWidth={2}
                                    />
                                ))}
                            </svg>
                        )}

                        {/* Zoom badge */}
                        <div className="editor-zoom-badge">{Math.round(zoom * 100)}%</div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ViewPage;