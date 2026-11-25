import { ZONE_GRADIENTS } from "../utils/constant";

// ─── Zone Polygon ──────────────────────────────────────────────────────────────
function ZonePolygon({ zone, isSelected, onPointDrag, gradientId }) {
  if (zone.points.length < 2) return null;

  const pts = zone.points.map((p) => `${p.x},${p.y}`).join(" ");
  const g = ZONE_GRADIENTS.find((x) => x.id === zone.gradientId) || ZONE_GRADIENTS[0];

  return (
    <g>
      {zone.closed ? (
        <polygon
          points={pts}
          fill={`url(#grad-${gradientId})`}
          stroke={g.stroke}
          strokeWidth={3.5}
          strokeLinejoin="round"
          opacity={0.92}
        />
      ) : (
        <polyline
          points={pts}
          fill="none"
          stroke={g.stroke}
          strokeWidth={3}
          strokeDasharray="7 4"
          strokeLinejoin="round"
        />
      )}

      {isSelected &&
        zone.points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={6}
            fill="white"
            stroke={g.stroke}
            strokeWidth={2.5}
            style={{ cursor: "move" }}
            onMouseDown={(e) => {
              e.stopPropagation();
              const start = {
                mx: e.clientX,
                my: e.clientY,
                ox: p.x,
                oy: p.y,
              };
              const move = (me) =>
                onPointDrag(
                  zone.id,
                  i,
                  start.ox + me.clientX - start.mx,
                  start.oy + me.clientY - start.my
                );
              const up = () => {
                window.removeEventListener("mousemove", move);
                window.removeEventListener("mouseup", up);
              };
              window.addEventListener("mousemove", move);
              window.addEventListener("mouseup", up);
            }}
          />
        ))}
    </g>
  );
}

export default ZonePolygon;
