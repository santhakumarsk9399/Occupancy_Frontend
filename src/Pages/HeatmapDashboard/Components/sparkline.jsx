const SparkLine = ({ color = "#3B82F6" }) => {
    return (
        <svg
            width="100%"
            height="34"
            viewBox="0 0 220 40"
            fill="none"
            style={{ display: "block" }}
        >
            <defs>
                <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>

            <path
                d="
          M5 30
          C25 28,35 15,55 14
          S90 24,105 18
          S135 5,155 13
          S185 28,205 10
          S215 6,218 2"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
            />

            <path
                d="
          M5 30
          C25 28,35 15,55 14
          S90 24,105 18
          S135 5,155 13
          S185 28,205 10
          S215 6,218 2
          L218 40
          L5 40 Z"
                fill="url(#sparkFill)"
            />
        </svg>
    );
};

export default SparkLine;