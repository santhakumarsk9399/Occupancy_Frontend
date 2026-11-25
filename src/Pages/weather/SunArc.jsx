// The signature visual for each cell: a brass dial arc tracing sunrise to
// sunset, the same way a station log would sketch the day's daylight span.
export default function SunArc({ sunrise, sunset }) {
  if (!sunrise || !sunset) return null;

  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const riseMin = toMinutes(sunrise);
  const setMin = toMinutes(sunset);
  const dayLenMin = Math.max(setMin - riseMin, 1);

  const w = 62;
  const h = 22;
  const r = 24;
  const cx = w / 2;
  const cy = h + 2;

  const arcPoint = (frac) => {
    const angle = Math.PI - frac * Math.PI;
    return [cx + r * Math.cos(angle), cy - r * Math.sin(angle)];
  };

  const [x1, y1] = arcPoint(0);
  const [x2, y2] = arcPoint(1);

  return (
    <svg className="sun-arc" width={w} height={h + 4} viewBox={`0 0 ${w} ${h + 4}`}>
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`} className="sun-arc-track" fill="none" />
      <circle cx={x1} cy={y1} r="1.6" className="sun-arc-dot" />
      <circle cx={x2} cy={y2} r="1.6" className="sun-arc-dot" />
      <text x={x1} y={h + 4} className="sun-arc-label sun-arc-label-left">
        {sunrise}
      </text>
      <text x={x2} y={h + 4} className="sun-arc-label sun-arc-label-right">
        {sunset}
      </text>
    </svg>
  );
}
