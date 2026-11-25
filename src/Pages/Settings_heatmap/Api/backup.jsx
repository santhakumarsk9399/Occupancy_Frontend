import { useState, useRef, useEffect, useCallback } from "react";
import { getZones,createZone,updateZone,deleteZone } from "../Api/zoneImagesApis";

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MALLS = ["Nexus Mall - BLR", "Phoenix Mall - MUM", "Select City - DEL", "DLF Mall of India"];
const FLOORS = {
  "Nexus Mall - BLR": ["Ground Floor", "First Floor", "Second Floor", "Fourth Floor"],
  "Phoenix Mall - MUM": ["Ground Floor", "First Floor"],
  "Select City - DEL": ["Ground Floor", "Level 1"],
  "DLF Mall of India": ["Ground Floor", "Second Floor", "Third Floor"],
};
const ZONES = {
  "Ground Floor": ["Food Zone", "Retail Zone", "Entertainment Zone", "Electronics Zone"],
  "First Floor": ["Fashion Zone", "Electronics Zone", "Supermarket Zone"],
  "Second Floor": ["Food Court", "Multiplex", "Entertainment Zone"],
  "Level 1": ["Zone A", "Zone B"],
  "Fourth Floor": ["Retail Zone"],
  "Third Floor": ["Supermarket Zone"],
};

// ─── Zone gradient presets ────────────────────────────────────────────────────
const ZONE_GRADIENTS = [
  { id: "blue", label: "Ocean Blue", fill: "rgba(59,130,246,0.22)", stroke: "#2563eb", gradient: ["#bfdbfe", "#3b82f6"] },
  { id: "green", label: "Forest Green", fill: "rgba(34,197,94,0.22)", stroke: "#16a34a", gradient: ["#bbf7d0", "#22c55e"] },
  { id: "purple", label: "Royal Purple", fill: "rgba(139,92,246,0.22)", stroke: "#7c3aed", gradient: ["#ede9fe", "#8b5cf6"] },
  { id: "orange", label: "Sunset Orange", fill: "rgba(249,115,22,0.22)", stroke: "#ea580c", gradient: ["#fed7aa", "#f97316"] },
  { id: "red", label: "Crimson Red", fill: "rgba(239,68,68,0.22)", stroke: "#dc2626", gradient: ["#fecaca", "#ef4444"] },
  { id: "teal", label: "Teal", fill: "rgba(20,184,166,0.22)", stroke: "#0d9488", gradient: ["#ccfbf1", "#14b8a6"] },
];
// ✅ ADD THIS ABOVE RETURN (around line ~20-40)
const zoneColors = {
  blue: { fill: "rgba(59,130,246,0.22)", stroke: "#2563eb", gradient: ["#bfdbfe", "#3b82f6"] },
  green: { fill: "rgba(34,197,94,0.22)", stroke: "#16a34a", gradient: ["#bbf7d0", "#22c55e"] },
  red: { fill: "rgba(239,68,68,0.22)", stroke: "#dc2626", gradient: ["#fecaca", "#ef4444"] },
  orange: { fill: "rgba(249,115,22,0.22)", stroke: "#ea580c", gradient: ["#fed7aa", "#f97316"] },
  purple: { fill: "rgba(139,92,246,0.22)", stroke: "#7c3aed", gradient: ["#ede9fe", "#8b5cf6"] },
  teal: { fill: "rgba(20,184,166,0.22)", stroke: "#0d9488", gradient: ["#ccfbf1", "#14b8a6"] }
};

// ✅ ADD THIS (just before render)
// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  redo: "M21 7v6h-6M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7",
  undo: "M3 7v6h6M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13",
  zoomIn: "M11 8v6M8 11h6M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  zoomOut: "M8 11h6M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  lasso: "M4.5 12a7.5 7.5 0 1015 0 7.5 7.5 0 00-15 0zM4.5 12c0 3 3 5.5 7.5 5.5",
  undo2: "M9 14L4 9l5-5M4 9h11a5 5 0 010 10h-1",
  chevronDown: "M6 9l6 6 6-6",
  plus: "M12 5v14M5 12h14",
  close: "M18 6L6 18M6 6l12 12",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  search: "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  arrowLeft: "M19 12H5M12 19l-7-7 7-7",
  save: "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8",
};

// ─── Dropdown ─────────────────────────────────────────────────────────────────
function Dropdown({ label, value, options, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative", minWidth: 190 }}>
      <button
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 12px", border: "1.5px solid #d1d5db", borderRadius: 8, background: disabled ? "#f9fafb" : "white",
          cursor: disabled ? "default" : "pointer", fontSize: 14, color: (!value || value === "Select") ? "#9ca3af" : "#111827", gap: 8,
        }}
      >
        <span>{value && value !== "Select" ? value : `Select ${label}`}</span>
        <Icon d={icons.chevronDown} size={14} strokeWidth={2} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "white",
          border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          zIndex: 200, overflow: "hidden",
        }}>
          {options.map(opt => (
            <div key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              style={{ padding: "9px 14px", fontSize: 14, cursor: "pointer", background: value === opt ? "#eff6ff" : "white", color: value === opt ? "#2563eb" : "#374151" }}
              onMouseEnter={e => e.currentTarget.style.background = value === opt ? "#eff6ff" : "#f9fafb"}
              onMouseLeave={e => e.currentTarget.style.background = value === opt ? "#eff6ff" : "white"}
            >{opt}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Zone Polygon ──────────────────────────────────────────────────────────────
function ZonePolygon({ zone, isSelected, onPointDrag, gradientId }) {
  if (zone.points.length < 2) return null;
  const pts = zone.points.map(p => `${p.x},${p.y}`).join(" ");
  const g = ZONE_GRADIENTS.find(x => x.id === zone.gradientId) || ZONE_GRADIENTS[0];
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
        <polyline points={pts} fill="none" stroke={g.stroke} strokeWidth={3} strokeDasharray="7 4" strokeLinejoin="round" />
      )}
      {isSelected && zone.points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={6} fill="white" stroke={g.stroke} strokeWidth={2.5}
          style={{ cursor: "move" }}
          onMouseDown={(e) => {
            e.stopPropagation();
            const start = { mx: e.clientX, my: e.clientY, ox: p.x, oy: p.y };
            const move = (me) => onPointDrag(zone.id, i, start.ox + me.clientX - start.mx, start.oy + me.clientY - start.my);
            const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
            window.addEventListener("mousemove", move);
            window.addEventListener("mouseup", up);
          }}
        />
      ))}
    </g>
  );
}

// ─── Crop & encode zone as data URL ──────────────────────────────────────────
async function captureZoneCrop(imageUrl, imageW, imageH, zonePoints, padding = 20) {
  if (!zonePoints || zonePoints.length < 3) return null;
  const xs = zonePoints.map(p => p.x);
  const ys = zonePoints.map(p => p.y);
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

      // Clip to zone shape
      ctx.save();
      ctx.beginPath();
      zonePoints.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x - minX, p.y - minY);
        else ctx.lineTo(p.x - minX, p.y - minY);
      });
      ctx.closePath();
      // Draw full crop (no clipping — show full bounding box with zone highlighted)
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

function EditorView({ initialRecord, onSave, onCancel }) {
  const BASE_URL = "http://localhost:7000";

  const fixImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("blob:")) return url;
    return `${BASE_URL}${url}`;
  };

  // ✅ FIX 1: Safely extract zoneData from MongoDB subdocument
  // MongoDB subdocuments have extra Mongoose fields — only take what we need
  const extractZoneData = (zoneData) => {
    if (!zoneData) return null;
    const points = Array.isArray(zoneData.points)
      ? zoneData.points.map(p => ({ x: Number(p.x), y: Number(p.y) }))
      : [];
    return {
      id: zoneData.id || Date.now(),
      points,
      closed: zoneData.closed === true,
      gradientId: zoneData.gradientId || "blue",
    };
  };

  const isEdit = !!initialRecord;
  const [mall, setMall] = useState(initialRecord?.mall || "Select");
  const [floor, setFloor] = useState(initialRecord?.floor || "Select");
  const [zoneName, setZoneName] = useState(initialRecord?.zoneName || "Select");

  const [image, setImage] = useState(
    initialRecord?.fullImage
      ? {
        url: fixImageUrl(initialRecord.fullImage),
        w: initialRecord.imageW || 1080,
        h: initialRecord.imageH || 600,
      }
      : null
  );

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectMode, setSelectMode] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [currentZone, setCurrentZone] = useState(null);

  // ✅ FIX 2: Use extractZoneData to safely parse MongoDB subdocument
  const [zone, setZone] = useState(() => extractZoneData(initialRecord?.zoneData));

  const [selectedGradient, setSelectedGradient] = useState(
    initialRecord?.zoneData?.gradientId || "blue"
  );

  const [history, setHistory] = useState([]);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();
  const svgRef = useRef();

  // ✅ FIX 3: Auto-fit zoom+pan when image and zone both load on Edit
  // This makes the zone visible immediately at a sensible zoom level
  const containerRef = useRef();
  const getZoneBounds = (points) => {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);

    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
    };
  };
  // useEffect(() => {
  //   if (!image || !zone || !zone.points.length) return;
  //   // Give the DOM a tick to measure the container
  //   const timer = setTimeout(() => {
  //     const container = containerRef.current;
  //     if (!container) return;
  //     const containerW = container.clientWidth || 800;
  //     const containerH = container.clientHeight || 480;

  //     // Calculate scale to fit the full image in the container
  //     const scaleX = containerW / image.w;
  //     const scaleY = containerH / image.h;
  //     const fitZoom = Math.min(scaleX, scaleY, 1); // never zoom in beyond 100%

  //     // Center the image
  //     const scaledW = image.w * fitZoom;
  //     const scaledH = image.h * fitZoom;
  //     const panX = (containerW - scaledW) / 2;
  //     const panY = (containerH - scaledH) / 2;

  //     setZoom(fitZoom);
  //     setPan({ x: panX, y: panY });
  //   }, 50);
  //   return () => clearTimeout(timer);
  // }, [image, zone]); // runs once when both image and zone are ready
  useEffect(() => {
    if (!image || !zone || !zone.points?.length) return;

    const container = containerRef.current;
    if (!container) return;

    const bounds = getZoneBounds(zone.points);

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    const padding = 250; // space around zone

    const scaleX = containerW / (bounds.width + padding);
    const scaleY = containerH / (bounds.height + padding);

    const newZoom = Math.min(scaleX, scaleY, 1.8);

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    const panX = containerW / 2 - centerX * newZoom;
    const panY = containerH / 2 - centerY * newZoom;

    setZoom(newZoom);
    setPan({ x: panX, y: panY });

  }, [image, zone]);
  const saveHistory = useCallback(() => {
    setHistory(h => [...h.slice(-30), { zone: zone ? JSON.parse(JSON.stringify(zone)) : null }]);
  }, [zone]);

  const handleFileLoad = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImage({ url, w: img.naturalWidth, h: img.naturalHeight, file: file });
      // Reset view when new image loaded
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    img.src = url;
  };
  const svgPoint = (e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const m = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: (m.x - pan.x) / zoom, y: (m.y - pan.y) / zoom };
  };

  const handleSVGClick = (e) => {
    if (!selectMode || !image) return;
    const pt = svgPoint(e);
    if (!drawing) {
      setDrawing(true);
      setZone(null);
      const newZone = { id: Date.now(), points: [pt], closed: false, gradientId: selectedGradient };
      setCurrentZone(newZone);
      saveHistory();
    } else {
      setCurrentZone(z => z ? { ...z, points: [...z.points, pt] } : z);
    }
  };

  const handleSVGDblClick = (e) => {
    if (!selectMode || !drawing || !currentZone) return;
    e.preventDefault();
    const closed = { ...currentZone, closed: true, gradientId: selectedGradient };
    setZone(closed);
    setCurrentZone(null);
    setDrawing(false);
    setSelectMode(false);
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setZone(prev.zone);
    setHistory(h => h.slice(0, -1));
    setCurrentZone(null); setDrawing(false);
  };

  const dragZonePoint = (zid, pi, x, y) => {
    setZone(z => z ? { ...z, points: z.points.map((p, i) => i === pi ? { x, y } : p) } : z);
  };

  const handleMouseDown = (e) => {
    if (selectMode || e.button !== 0) return;
    setIsPanning(true);
    setPanStart({ mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y });
  };
  const handleMouseMove = (e) => {
    if (!isPanning || !panStart) return;
    setPan({ x: panStart.px + e.clientX - panStart.mx, y: panStart.py + e.clientY - panStart.my });
  };
  const handleMouseUp = () => { setIsPanning(false); setPanStart(null); };

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom(z => Math.min(5, Math.max(0.2, z - e.deltaY * 0.001)));
  };

  useEffect(() => {
    if (zone) setZone(z => ({ ...z, gradientId: selectedGradient }));
    if (currentZone) setCurrentZone(z => z ? { ...z, gradientId: selectedGradient } : z);
  }, [selectedGradient]);


  const base64ToFile = (base64, filename) => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };
  // const handleSave = async () => {

  //   console.log("Final Zone Points:", zone);
  //   console.log("Image Size:", image.w, image.h);
  //   console.table(zone.points);   // ✅ BEST place
  //   if (!image || !zone || !zone.closed) return;
  //   if (mall === "Select" || floor === "Select" || zoneName === "Select") {
  //     alert("Please select Mall, Floor, and Zone Name.");
  //     return;
  //   }
  //   setSaving(true);
  //   const cropUrl = await captureZoneCrop(image.url, image.w, image.h, zone.points);
  //   setSaving(false);
  //   onSave({
  //     id: initialRecord?.id || Date.now(),
  //     _id: initialRecord?._id,
  //     mall, floor, zoneName,
  //     fullImage: image.url,
  //     imageW: image.w,
  //     imageH: image.h,
  //     zoneData: zone,
  //     cropUrl,
  //   });
  // };
  const handleSave = async () => {

    console.log("Final Zone Points:", zone);
    console.log("Image Size:", image.w, image.h);
    console.table(zone.points);

    if (!image || !zone || !zone.closed) return;

    if (mall === "Select" || floor === "Select" || zoneName === "Select") {
      alert("Please select Mall, Floor, and Zone Name.");
      return;
    }

    setSaving(true);

    // 1️⃣ get crop (base64)
    const cropBase64 = await captureZoneCrop(
      image.url,
      image.w,
      image.h,
      zone.points
    );

    // 2️⃣ convert base64 → File
    const cropFile = base64ToFile(cropBase64, "crop.png");

    setSaving(false);

    // 3️⃣ send correct data
    // onSave({
    //   id: initialRecord?.id || Date.now(),
    //   _id: initialRecord?._id,
    //   mall,
    //   floor,
    //   zoneName,
    //   imageW: image.w,
    //   imageH: image.h,
    //   zoneData: zone,
    //   fullImageFile: image.file,  
    //   cropFile: cropFile,        
    // });
    onSave({
      id: initialRecord?._id || Date.now(),
      _id: initialRecord?._id,
      mall,
      floor,
      zoneName,

      imageW: image.w,
      imageH: image.h,

      // ✅ FORCE fresh copy
      zoneData: JSON.parse(JSON.stringify(zone)),

      fullImageFile: image.file,
      cropFile: cropFile,
    });
  };
  const floorOptions = mall !== "Select" ? (FLOORS[mall] || []) : [];
  const zoneOptions = floor !== "Select" ? (ZONES[floor] || []) : [];
  const imgW = image?.w || 1080;
  const imgH = image?.h || 500;
  const g = ZONE_GRADIENTS.find(x => x.id === selectedGradient) || ZONE_GRADIENTS[0];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f1f5f9", minHeight: "100vh", padding: 24 }}>
      <div style={{ background: "white", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.08)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "20px 28px 0", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <button onClick={onCancel} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "1px solid #e5e7eb", borderRadius: 8, background: "white", cursor: "pointer", fontSize: 13, color: "#374151" }}>
              <Icon d={icons.arrowLeft} size={14} />
              Back
            </button>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              {isEdit ? "Edit Zone Image" : "Add Zone Image"}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#475569", whiteSpace: "nowrap" }}>Mall Name</span>
              <Dropdown label="Mall" value={mall} options={MALLS} onChange={v => { setMall(v); setFloor("Select"); setZoneName("Select"); }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#475569", whiteSpace: "nowrap" }}>Floor Name</span>
              <Dropdown label="Floor" value={floor} options={floorOptions} onChange={v => { setFloor(v); setZoneName("Select"); }} disabled={mall === "Select"} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#475569", whiteSpace: "nowrap" }}>Zone Name</span>
              <Dropdown label="Zone" value={zoneName} options={zoneOptions} onChange={setZoneName} disabled={floor === "Select"} />
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              <button onClick={onCancel}
                style={{ padding: "8px 20px", border: "1px solid #d1d5db", borderRadius: 8, background: "white", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#374151" }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !zone?.closed}
                style={{ padding: "8px 20px", border: "none", borderRadius: 8, background: (!zone?.closed || saving) ? "#93c5fd" : "#2563eb", cursor: (!zone?.closed || saving) ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon d={icons.save} size={14} />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ padding: "12px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => fileRef.current.click()}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", border: "1px solid #d1d5db", borderRadius: 8, background: "white", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#374151" }}>
              <Icon d={icons.plus} size={14} strokeWidth={2.5} />
              Load Image
            </button>
            <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display: "none" }} onChange={e => handleFileLoad(e.target.files[0])} />
            <button onClick={() => { setSelectMode(s => !s); setDrawing(false); setCurrentZone(null); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", border: `1.5px solid ${selectMode ? "#2563eb" : "#d1d5db"}`, borderRadius: 8, background: selectMode ? "#eff6ff" : "white", cursor: "pointer", fontSize: 13, fontWeight: 500, color: selectMode ? "#2563eb" : "#374151" }}>
              <Icon d={icons.lasso} size={14} />
              Select Area
            </button>
            <button onClick={undo} disabled={history.length === 0}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", border: "1px solid #d1d5db", borderRadius: 8, background: "white", cursor: history.length === 0 ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 500, color: history.length === 0 ? "#9ca3af" : "#374151", opacity: history.length === 0 ? 0.6 : 1 }}>
              <Icon d={icons.undo2} size={14} />
              Undo Last
            </button>
            {zone && (
              <button onClick={() => { saveHistory(); setZone(null); }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", border: "1px solid #fecaca", borderRadius: 8, background: "#fef2f2", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#dc2626" }}>
                <Icon d={icons.close} size={13} strokeWidth={2.5} />
                Clear Zone
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 4, marginRight: 8 }}>
              {ZONE_GRADIENTS.map(grad => (
                <button key={grad.id} title={grad.label} onClick={() => setSelectedGradient(grad.id)}
                  style={{ width: 22, height: 22, borderRadius: "50%", border: `2.5px solid ${selectedGradient === grad.id ? "#0f172a" : "transparent"}`, background: `linear-gradient(135deg, ${grad.gradient[0]}, ${grad.gradient[1]})`, cursor: "pointer", padding: 0, outline: selectedGradient === grad.id ? "2px solid white" : "none", outlineOffset: -4 }} />
              ))}
            </div>
            {[
              { icon: icons.redo, title: "Redo", action: () => { } },
              {
                icon: icons.undo, title: "Reset Pan", action: () => {
                  // ✅ Reset pan also re-fits the image
                  if (image) {
                    const container = containerRef.current;
                    if (container) {
                      const scaleX = container.clientWidth / image.w;
                      const scaleY = container.clientHeight / image.h;
                      const fitZoom = Math.min(scaleX, scaleY, 1);
                      setZoom(fitZoom);
                      setPan({ x: (container.clientWidth - image.w * fitZoom) / 2, y: (container.clientHeight - image.h * fitZoom) / 2 });
                    } else {
                      setPan({ x: 0, y: 0 });
                    }
                  } else {
                    setPan({ x: 0, y: 0 });
                  }
                }
              },
              { icon: icons.zoomIn, title: "Zoom In", action: () => setZoom(z => Math.min(5, z + 0.2)) },
              { icon: icons.zoomOut, title: "Zoom Out", action: () => setZoom(z => Math.max(0.2, z - 0.2)) },
            ].map(({ icon, title, action }) => (
              <button key={title} title={title} onClick={action}
                style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e5e7eb", borderRadius: 8, background: "white", cursor: "pointer", color: "#374151" }}>
                <Icon d={icon} size={15} />
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div style={{ padding: "20px 28px 28px" }}>
          {/* ✅ FIX: attach containerRef so we can measure it for auto-fit */}
          <div
            ref={containerRef}
            style={{ border: "2px dashed #cbd5e1", borderRadius: 12, background: "#f8fafc", overflow: "hidden", position: "relative", minHeight: 480, cursor: image ? (selectMode ? "crosshair" : isPanning ? "grabbing" : "grab") : "default" }}
            onWheel={handleWheel}
          >
            {!image ? (
              <div
                style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFileLoad(e.dataTransfer.files[0]); }}
              >
                <div style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", background: "#eff6ff", borderRadius: "50%" }}>
                  <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 7l-4-4-4 4M12 3v13" /></svg>
                </div>
                {/* <p style={{ fontSize: 15, fontWeight: 600, color: "#334155", margin: 0 }}>Drop floor plan image here</p>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>or click Load Image above</p> */}
                <button onClick={() => fileRef.current.click()} style={{ padding: "8px 20px", border: "none", borderRadius: 8, background: "#2563eb", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, marginTop: 4 }}>Browse Files</button>
              </div>
            ) : (
              <svg
                ref={svgRef}
                width="100%" height="100%"
                style={{ display: "block", minHeight: 480 }}
                onClick={handleSVGClick}
                onDoubleClick={handleSVGDblClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <defs>
                  <linearGradient id="grad-zone" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={g.gradient[0]} stopOpacity="0.55" />
                    <stop offset="100%" stopColor={g.gradient[1]} stopOpacity="0.38" />
                  </linearGradient>
                </defs>
                <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
                  <image href={image.url} x={0} y={0} width={imgW} height={imgH} />
                  {zone && (
                    <ZonePolygon zone={zone} isSelected={true} onPointDrag={dragZonePoint} gradientId="zone" />
                  )}
                  {drawing && currentZone && currentZone.points.length > 0 && (
                    <g>
                      <polyline points={currentZone.points.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke={g.stroke} strokeWidth={3} strokeDasharray="7 4" strokeLinejoin="round" />
                      {currentZone.points.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r={5} fill={g.stroke} />
                      ))}
                    </g>
                  )}
                </g>
              </svg>
            )}
            {image && (
              <div style={{ position: "absolute", bottom: 12, right: 16, background: "rgba(0,0,0,0.45)", color: "white", fontSize: 12, padding: "3px 8px", borderRadius: 6, fontWeight: 500 }}>
                {Math.round(zoom * 100)}%
              </div>
            )}
            {image && selectMode && (
              <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(37,99,235,0.9)", color: "white", fontSize: 12, padding: "5px 10px", borderRadius: 6 }}>
                {drawing ? "Click to add points • Double-click to close zone" : "Click to start drawing a zone"}
              </div>
            )}
            {image && !selectMode && !zone && (
              <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.5)", color: "white", fontSize: 12, padding: "5px 10px", borderRadius: 6 }}>
                Click "Select Area" to draw a zone
              </div>
            )}
          </div>
          {zone?.closed && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: g.stroke }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Zone drawn — {zone.points.length} points</span>
              <span style={{ fontSize: 12, color: "#6b7280" }}>· Click "Save" to store this zone</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ─── List View ────────────────────────────────────────────────────────────────
function ListView({ records, onAdd, onEdit, onView, onDelete }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);

  const filtered = records.filter(r =>
    r.zoneName.toLowerCase().includes(search.toLowerCase()) ||
    r.floor.toLowerCase().includes(search.toLowerCase()) ||
    r.mall.toLowerCase().includes(search.toLowerCase())
  );

  const handleRowClick = (r) => setSelected(s => s === r.id ? null : r.id);
  const selectedRecord = records.find(r => r.id === selected);
  console.log(selectedRecord)
      console.log("VIEW DATA:", viewRecord);
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f1f5f9", minHeight: "93vh", padding: 24 }}>
      <div style={{ background: "white", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.08)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #f1f5f9" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Heat Map</h1>
        </div>

        {/* Tab */}
        <div style={{ padding: "12px 28px 0", borderBottom: "1px solid #f1f5f9" }}>
          <button style={{ padding: "8px 18px", border: "1.5px solid #2563eb", borderRadius: 8, background: "#eff6ff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#2563eb" }}>
            Zone Image List
          </button>
        </div>

        {/* Toolbar */}
        <div style={{ padding: "16px 28px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 300 }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              style={{ width: "100%", padding: "8px 12px 8px 36px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, color: "#111827", outline: "none", boxSizing: "border-box" }}
            />
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>
              <Icon d={icons.search} size={15} />
            </div>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {/* <button
              onClick={() => selected && setViewRecord(selectedRecord)}
              disabled={!selected}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", border: `1px solid ${selected ? "#d1d5db" : "#e5e7eb"}`, borderRadius: 8, background: "white", cursor: selected ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 500, color: selected ? "#374151" : "#9ca3af", opacity: selected ? 1 : 0.55 }}>
              <Icon d={icons.eye} size={14} />
              View Zone Image
            </button> */}
            <button onClick={() => selected && onEdit(selectedRecord)}
              disabled={!selected}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", border: `1px solid ${selected ? "#d1d5db" : "#e5e7eb"}`, borderRadius: 8, background: "white", cursor: selected ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 500, color: selected ? "#374151" : "#9ca3af", opacity: selected ? 1 : 0.55 }}>
              <Icon d={icons.edit} size={14} />
              Edit Zone Image
            </button>
            {/* <button onClick={() => selected && onDelete(selected)}
              disabled={!selected}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", border: `1px solid ${selected ? "#fecaca" : "#e5e7eb"}`, borderRadius: 8, background: selected ? "#fef2f2" : "white", cursor: selected ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 500, color: selected ? "#dc2626" : "#9ca3af", opacity: selected ? 1 : 0.55 }}>
              <Icon d={icons.trash} size={14} />
              Delete Zone Image
            </button> */}
            <button onClick={onAdd}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", border: "1.5px solid #2563eb", borderRadius: 8, background: "#2563eb", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "white" }}>
              <Icon d={icons.plus} size={14} strokeWidth={2.5} />
              Add Zone Image
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ padding: "0 28px 28px" }}>
          <div style={{ border: "1px solid #f1f5f9", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["SL", "ZONE IMAGE", "ZONE NAME", "FLOOR NAME", "MALL NAME"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "48px 16px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                      No zone images found. Click "+ Add Zone Image" to get started.
                    </td>
                  </tr>
                ) : filtered.map((r, i) => (
                  <tr key={r.id}
                    onClick={() => handleRowClick(r)}
                    style={{ background: selected === r.id ? "#eff6ff" : i % 2 === 0 ? "white" : "#fafafa", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => { if (selected !== r.id) e.currentTarget.style.background = "#f9fafb"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = selected === r.id ? "#eff6ff" : i % 2 === 0 ? "white" : "#fafafa"; }}
                  >
                    <td style={{ padding: "12px 16px", color: "#374151", borderBottom: "1px solid #f1f5f9" }}>{i + 1}</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                      {r.cropUrl ? (
                        <img src={r.cropUrl} alt="zone crop" style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb" }} />
                      ) : (
                        <div style={{ width: 48, height: 36, background: "#f1f5f9", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                          <Icon d={icons.lasso} size={16} />
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#111827", fontWeight: 500, borderBottom: "1px solid #f1f5f9" }}>{r.zoneName}</td>
                    <td style={{ padding: "12px 16px", color: "#374151", borderBottom: "1px solid #f1f5f9" }}>{r.floor}</td>
                    <td style={{ padding: "12px 16px", color: "#374151", borderBottom: "1px solid #f1f5f9" }}>{r.mall}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewRecord && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
          onClick={() => setViewRecord(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 24, maxWidth: 600, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{viewRecord.zoneName}</h3>
              <button onClick={() => setViewRecord(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af" }}><Icon d={icons.close} size={18} /></button>
            </div>
            {/* {viewRecord.cropUrl &&
              <img src={viewRecord.cropUrl} alt="zone" style={{ width: "100%", borderRadius: 10, border: "1px solid #e5e7eb" }} />
            
            } */}
            {/* {viewRecord.cropUrl && (
              <div style={{
                maxWidth: "800px",
                margin: "0 auto"
              }}>
                <img
                  src={viewRecord.cropUrl}
                  style={{
                    width: "100%",
                    height: "auto"
                  }}
                />
              </div>
            )} */}
            {viewRecord?.cropUrl && viewRecord?.zoneData && (
              <div
                style={{
                  width: "100%",
                  height: "400px",
                  position: "relative",
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid #e5e7eb"
                }}
              >
                {/* IMAGE */}
                <img
                  src={viewRecord.cropUrl}
                  alt="zone"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain"
                  }}
                />

                {/* SVG OVERLAY */}
                <svg
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none"
                  }}
                >
                  {(() => {
                    const g =
                      zoneColors[viewRecord.zoneData.gradientId] || zoneColors.blue;

                    const points = viewRecord.zoneData.points
                      .map(p => `${p.x},${p.y}`)
                      .join(" ");

                    return (
                      <polygon
                        points={points}
                        fill={g.fill}
                        stroke={g.stroke}
                        strokeWidth={3}
                      />
                    );
                  })()}
                </svg>
              </div>
            )}
            <div style={{ marginTop: 12, display: "flex", gap: 16, fontSize: 13, color: "#6b7280" }}>
              <span><strong style={{ color: "#374151" }}>Mall:</strong> {viewRecord.mall}</span>
              <span><strong style={{ color: "#374151" }}>Floor:</strong> {viewRecord.floor}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── App Root — fix _id vs id for MongoDB records ─────────────────────────────
export default function HeatMap() {
  const [view, setView] = useState("list");
  const [records, setRecords] = useState([]);
  const [editRecord, setEditRecord] = useState(null);

  useEffect(() => { loadZones(); }, []);

  const loadZones = async () => {
    const data = await getZones();
    // ✅ FIX: normalize _id → id so the rest of the UI works uniformly
    const normalized = data.map(r => ({ ...r, id: r._id }));
    setRecords(normalized);
  };

  const handleSave = async (record) => {
    try {
      if (record._id) {
        await updateZone(record._id, record);  // UPDATE
      } else {
        await createZone(record);              // CREATE
      }

      await loadZones();  // refresh list

      setView("list");
      setEditRecord(null);

    } catch (err) {
      console.error("Save Error:", err);
      alert(err.message || "Something went wrong while saving");
    }
  };
  const handleDelete = async (id) => {
    try {
      const record = records.find(r => r.id === id);

      if (!record) {
        alert("Record not found");
        return;
      }

      if (!window.confirm("Delete this zone image?")) return;

      await deleteZone(record._id);  // DELETE

      await loadZones(); // refresh list

    } catch (err) {
      console.error("Delete Error:", err);
      alert(err.message || "Something went wrong while deleting");
    }
  };

  if (view === "add") {
    return <EditorView onSave={handleSave} onCancel={() => setView("list")} />;
  }
  if (view === "edit" && editRecord) {
    return <EditorView initialRecord={editRecord} onSave={handleSave} onCancel={() => { setView("list"); setEditRecord(null); }} />;
  }
  return (
    <ListView
      records={records}
      onAdd={() => setView("add")}
      onEdit={(r) => { setEditRecord(r); setView("edit"); }}
      onView={(r) => {
        setEditRecord(r);
        setView("view");
      }}
      onDelete={handleDelete}
    />
  );
}
