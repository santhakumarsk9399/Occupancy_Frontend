export const getColor = (value) => {
    if (value < 30) return "#1e88e5"; // blue
    if (value < 70) return "#34a853"; // green
    if (value < 85) return "#fbbc05"; // yellow
    return "#ea4335"; // red
  };