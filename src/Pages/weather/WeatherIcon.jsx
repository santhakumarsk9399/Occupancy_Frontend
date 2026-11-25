// Minimal line-art icon set, one per weather category. Kept intentionally
// simple/geometric so it reads clearly at the small size of a calendar cell.
export default function WeatherIcon({ category, size = 26 }) {
  const stroke = "currentColor";
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 32 32",
    fill: "none",
    stroke,
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (category) {
    case "clear":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="6.5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line
              key={a}
              x1={16 + Math.cos((a * Math.PI) / 180) * 10}
              y1={16 + Math.sin((a * Math.PI) / 180) * 10}
              x2={16 + Math.cos((a * Math.PI) / 180) * 13.5}
              y2={16 + Math.sin((a * Math.PI) / 180) * 13.5}
            />
          ))}
        </svg>
      );
    case "cloudy":
      return (
        <svg {...common}>
          <path d="M9 21a5 5 0 0 1 1-9.9 6 6 0 0 1 11.6 2A4.5 4.5 0 0 1 21 21H9Z" />
        </svg>
      );
    case "fog":
      return (
        <svg {...common}>
          <path d="M8 13a5 5 0 0 1 9.6-1.9A4.5 4.5 0 0 1 19 20H8" />
          <line x1="6" y1="24" x2="26" y2="24" />
          <line x1="9" y1="27" x2="23" y2="27" />
        </svg>
      );
    case "drizzle":
      return (
        <svg {...common}>
          <path d="M9 16a5 5 0 0 1 1-9.9A6 6 0 0 1 21.6 8 4.5 4.5 0 0 1 21 16H9Z" />
          <line x1="12" y1="21" x2="11" y2="24" />
          <line x1="17" y1="21" x2="16" y2="24" />
          <line x1="22" y1="21" x2="21" y2="24" />
        </svg>
      );
    case "rain":
      return (
        <svg {...common}>
          <path d="M9 15a5 5 0 0 1 1-9.9A6 6 0 0 1 21.6 7 4.5 4.5 0 0 1 21 15H9Z" />
          <line x1="11" y1="20" x2="9.5" y2="25" />
          <line x1="16" y1="20" x2="14.5" y2="25" />
          <line x1="21" y1="20" x2="19.5" y2="25" />
        </svg>
      );
    case "showers":
      return (
        <svg {...common}>
          <path d="M9 14a5 5 0 0 1 1-9.9A6 6 0 0 1 21.6 6 4.5 4.5 0 0 1 21 14H9Z" />
          <line x1="10" y1="19" x2="8" y2="26" />
          <line x1="16" y1="19" x2="14" y2="26" />
          <line x1="22" y1="19" x2="20" y2="26" />
        </svg>
      );
    case "snow":
      return (
        <svg {...common}>
          <path d="M9 14a5 5 0 0 1 1-9.9A6 6 0 0 1 21.6 6 4.5 4.5 0 0 1 21 14H9Z" />
          {[10, 16, 22].map((x) => (
            <g key={x}>
              <line x1={x} y1="19" x2={x} y2="26" />
              <line x1={x - 2.5} y1="20.5" x2={x + 2.5} y2="24.5" />
              <line x1={x + 2.5} y1="20.5" x2={x - 2.5} y2="24.5" />
            </g>
          ))}
        </svg>
      );
    case "storm":
      return (
        <svg {...common}>
          <path d="M9 14a5 5 0 0 1 1-9.9A6 6 0 0 1 21.6 6 4.5 4.5 0 0 1 21 14H9Z" />
          <polyline points="17,18 13,24 17,24 14,29" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="10" />
          <line x1="16" y1="12" x2="16" y2="17" />
          <circle cx="16" cy="21" r="0.6" fill={stroke} />
        </svg>
      );
  }
}
