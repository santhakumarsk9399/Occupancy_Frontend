import { useRef } from "react";
import ZonePolygon from "../common/ZonePolygon";
import { ZONE_GRADIENTS } from "../utils/constant";
import "../Styles/editor.css";

// ─── Editor Canvas ────────────────────────────────────────────────────────────
function EditorCanvas({
  image,
  zone,
  currentZone,
  drawing,
  selectMode,
  isPanning,
  zoom,
  pan,
  selectedGradient,
  svgRef,
  containerRef,
  fileRef,
  onSVGClick,
  onSVGDblClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
  onDragZonePoint,
}) {
  const imgW = image?.w || 1080;
  const imgH = image?.h || 500;
  const g =
    ZONE_GRADIENTS.find((x) => x.id === selectedGradient) || ZONE_GRADIENTS[0];

  return (
    <div className="editor-canvas-wrapper">
      <div
        ref={containerRef}
        className="editor-canvas"
        style={{
          cursor: image
            ? selectMode
              ? "crosshair"
              : isPanning
              ? "grabbing"
              : "grab"
            : "default",
        }}
        onWheel={onWheel}
      >
        {!image ? (
          /* ── Empty / drop target ── */
          <div
            className="editor-canvas-empty"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) fileRef.current.dispatchEvent(
                Object.assign(new Event("change"), { target: { files: [file] } })
              );
            }}
          >
            <div className="editor-canvas-empty-icon">
              <svg
                width={28}
                height={28}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3b82f6"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 7l-4-4-4 4M12 3v13" />
              </svg>
            </div>
             <p style={{ fontSize: 15, fontWeight: 600, color: "#334155", margin: 0 }}>Drop floor plan image here</p>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>or click Load Image above</p> 
            <button
              onClick={() => fileRef.current.click()}
              style={{
                padding: "8px 20px",
                border: "none",
                borderRadius: 8,
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                marginTop: 4,
              }}
            >
              Browse Files
            </button>
          </div>
        ) : (
          /* ── SVG canvas ── */
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            style={{ display: "block", minHeight: 480 }}
            onClick={onSVGClick}
            onDoubleClick={onSVGDblClick}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <defs>
              <linearGradient
                id="grad-zone"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={g.gradient[0]}
                  stopOpacity="0.55"
                />
                <stop
                  offset="100%"
                  stopColor={g.gradient[1]}
                  stopOpacity="0.38"
                />
              </linearGradient>
            </defs>

            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              {/* <image href={image.url} x={0} y={0} width={imgW} height={imgH} /> */}
                <image
                  href={image.url}
                  xlinkHref={image.url}
                  x={0}
                  y={0}
                  width={imgW}
                  height={imgH}
                  preserveAspectRatio="none"
                />
              {/* Saved / committed zone */}
              {zone && (
                <ZonePolygon
                  zone={zone}
                  isSelected
                  onPointDrag={onDragZonePoint}
                  gradientId="zone"
                />
              )}

              {/* In-progress drawing */}
              {drawing && currentZone && currentZone.points.length > 0 && (
                <g>
                  <polyline
                    points={currentZone.points
                      .map((p) => `${p.x},${p.y}`)
                      .join(" ")}
                    fill="none"
                    stroke={g.stroke}
                    strokeWidth={3}
                    strokeDasharray="7 4"
                    strokeLinejoin="round"
                  />
                  {currentZone.points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r={5} fill={g.stroke} />
                  ))}
                </g>
              )}
            </g>
          </svg>
        )}

        {/* Zoom badge */}
        {image && (
          <div className="editor-zoom-badge">{Math.round(zoom * 100)}%</div>
        )}

        {/* Drawing hint */}
        {image && selectMode && (
          <div className={`editor-hint editor-hint--select`}>
            {drawing
              ? "Click to add points • Double-click to close zone"
              : "Click to start drawing a zone"}
          </div>
        )}
        {image && !selectMode && !zone && (
          <div className={`editor-hint editor-hint--idle`}>
            Click "Select Area" to draw a zone
          </div>
        )}
      </div>

      {/* Zone status */}
      {zone?.closed && (
        <div className="editor-zone-status">
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: g.stroke,
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
            Zone drawn — {zone.points.length} points
          </span>
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            · Click "Save" to store this zone
          </span>
        </div>
      )}
    </div>
  );
}

export default EditorCanvas;
