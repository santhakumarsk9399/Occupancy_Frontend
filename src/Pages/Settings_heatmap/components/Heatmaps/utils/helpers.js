// ─── Crop & encode zone as data URL ──────────────────────────────────────────
export async function captureZoneCrop(imageUrl, imageW, imageH, zonePoints, padding = 20) {
  if (!zonePoints || zonePoints.length < 3) return null;

  const xs = zonePoints.map((p) => p.x);
  const ys = zonePoints.map((p) => p.y);
  const minX = Math.max(0, Math.min(...xs) - padding);
  const minY = Math.max(0, Math.min(...ys) - padding);
  const maxX = Math.min(imageW, Math.max(...xs) + padding);
  const maxY = Math.min(imageH, Math.max(...ys) + padding);
  const cropW = maxX - minX;
  const cropH = maxY - minY;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext("2d");

      ctx.save();
      ctx.beginPath();
      zonePoints.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x - minX, p.y - minY);
        else ctx.lineTo(p.x - minX, p.y - minY);
      });
      ctx.closePath();

      // Draw full crop (bounding box with zone highlighted)
      ctx.drawImage(img, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

      // Draw zone overlay
      ctx.beginPath();
      zonePoints.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x - minX, p.y - minY);
        else ctx.lineTo(p.x - minX, p.y - minY);
      });
      ctx.closePath();
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "rgba(59,130,246,0.15)";
      ctx.fill();
      ctx.restore();

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}

// ─── Convert base64 string to File object ────────────────────────────────────
export function base64ToFile(base64, filename) {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

// ─── Fix relative image URLs ──────────────────────────────────────────────────
// const BASE_URL = "http://localhost:7000";
const BASE_URL = import.meta.env.VITE_API_URL;
export function fixImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  return `${BASE_URL}${url}`;
}

export function extractZoneData(zoneData) {
  if (!zoneData) return null;

  try {
    let parsed = zoneData;

    // First parse
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }

    // Handle:
    // { zoneData: "{\"id\":...,\"points\":[...]}" }
    if (parsed.zoneData) {
      parsed =
        typeof parsed.zoneData === "string"
          ? JSON.parse(parsed.zoneData)
          : parsed.zoneData;
    }

    const points = Array.isArray(parsed.points)
      ? parsed.points.map((p) => ({
        x: Number(p.x),
        y: Number(p.y),
      }))
      : [];

    return {
      id: parsed.id || Date.now(),
      points,
      closed: parsed.closed !== false,
      gradientId: parsed.gradientId || "blue",
    };
  } catch (err) {
    console.error("ZoneData parse error", err);
    return null;
  }
}
// ─── Get bounding box of zone points ─────────────────────────────────────────
export function getZoneBounds(points) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}
