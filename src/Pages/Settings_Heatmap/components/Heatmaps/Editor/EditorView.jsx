import { useState, useRef, useEffect, useCallback } from "react";
import EditorHeader from "./EditorHeader";
import EditorToolbar from "./EditorToolbar";
import EditorCanvas from "./EditorCanvas";
import { ZONE_GRADIENTS } from "../utils/constant";
import {
  fixImageUrl,
  extractZoneData,
  getZoneBounds,
  captureZoneCrop,
  base64ToFile,
} from "../utils/helpers";
import "../Styles/editor.css";
import { getMFZ } from "../../../Api/zoneImagesApis";
function EditorView({ initialRecord, onSave, onCancel }) {
  const isEdit = !!initialRecord;
// console.log(initialRecord)
  const [mall, setMall] = useState(
    initialRecord?.MallName || "Select"
  );

  const [floor, setFloor] = useState(
    initialRecord?.FloorName || "Select"
  );

  const [zoneName, setZoneName] = useState(
    initialRecord?.ZoneName || "Select"
  );
  const [filterData, setFilterData] = useState({
    malls: [],
    floors: [],
    zones: [],
  });
  const [image, setImage] = useState(
    initialRecord?.FullImageURL
      ? {
        url: fixImageUrl(initialRecord.FullImageURL),
        w: initialRecord.ImageWidth || 1080,
        h: initialRecord.ImageHeight || 600,
      }
      : null
  );

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectMode, setSelectMode] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [currentZone, setCurrentZone] = useState(null);

  const parsedZone = extractZoneData(initialRecord?.ZoneData);
  // console.log("Parsed Zone", parsedZone);
  const [zone, setZone] = useState(parsedZone);

  const [selectedGradient, setSelectedGradient] = useState(
    parsedZone?.gradientId || "blue"
  );
  // const [zone, setZone] = useState(() => extractZoneData(initialRecord?.ZoneData));
  // const [selectedGradient, setSelectedGradient] = useState(
  //   initialRecord?.zoneData?.gradientId || "blue"
  // );

  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [saving, setSaving] = useState(false);

  const fileRef = useRef();
  const svgRef = useRef();
  const containerRef = useRef();



  useEffect(() => {
    const loadFilters = async () => {
      try {
        const res = await getMFZ(); // your getMFZ API

        setFilterData({
          malls: res.data.Mall || [],
          floors: res.data.Floor || [],
          zones: res.data.Zones || [],
        });
      } catch (err) {
        console.error(err);
      }
    };

    loadFilters();
  }, []);

  // // Auto-fit zoom+pan when editing
  // useEffect(() => {
  //   if (!image || !zone || !zone.points?.length) return;
  //   const container = containerRef.current;
  //   if (!container) return;
  //   const bounds = getZoneBounds(zone.points);
  //   const padding = 250;
  //   const scaleX = container.clientWidth / (bounds.width + padding);
  //   const scaleY = container.clientHeight / (bounds.height + padding);
  //   const newZoom = Math.min(scaleX, scaleY, 1.8);
  //   const centerX = (bounds.minX + bounds.maxX) / 2;
  //   const centerY = (bounds.minY + bounds.maxY) / 2;
  //   setZoom(newZoom);
  //   setPan({
  //     x: container.clientWidth / 2 - centerX * newZoom,
  //     y: container.clientHeight / 2 - centerY * newZoom,
  //   });
  // }, [image, zone]);

  useEffect(() => {
    if (!image || !zone || !zone.points?.length) return;

    const container = containerRef.current;
    if (!container) return;

    const bounds = getZoneBounds(zone.points);

    const padding = 150;

    const scaleX =
      container.clientWidth / (bounds.width + padding);

    const scaleY =
      container.clientHeight / (bounds.height + padding);

    const newZoom = Math.min(scaleX, scaleY, 3);

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    setZoom(newZoom);

    setPan({
      x: container.clientWidth / 2 - centerX * newZoom,
      y: container.clientHeight / 2 - centerY * newZoom,
    });
  }, [image, zone]);

  useEffect(() => {
    // Auto-fit zoom logic
  }, [image, zone]);


  useEffect(() => {
    if (!initialRecord?.FullImageURL) return;
  
    const imageUrl = fixImageUrl(
      initialRecord.FullImageURL
    );
  
    console.log("Loading Image:", imageUrl);
  
    const img = new Image();
  
    img.onload = () => {
      console.log("Image Loaded");
  
      setImage({
        url: imageUrl,
        w:
          Number(initialRecord.ImageWidth) ||
          img.width,
        h:
          Number(initialRecord.ImageHeight) ||
          img.height,
        file: null,
      });
    };
  
    img.onerror = () => {
      console.error(
        "Image Failed:",
        imageUrl
      );
    };
  
    img.src = imageUrl;
  }, [initialRecord]);



  // Keep gradient in sync
  useEffect(() => {
    if (zone) setZone((z) => ({ ...z, gradientId: selectedGradient }));
    if (currentZone) setCurrentZone((z) => z ? { ...z, gradientId: selectedGradient } : z);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGradient]);

  // Push snapshot BEFORE every change
  const pushHistory = useCallback((zoneSnap, currentZoneSnap) => {
    setHistory((h) => [
      ...h.slice(-50),
      {
        zone: zoneSnap ? JSON.parse(JSON.stringify(zoneSnap)) : null,
        currentZone: currentZoneSnap ? JSON.parse(JSON.stringify(currentZoneSnap)) : null,
        drawing: !!currentZoneSnap,
      },
    ]);
    setRedoStack([]);
  }, []);

  // Undo
  const undo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setRedoStack((r) => [
      ...r.slice(-50),
      {
        zone: zone ? JSON.parse(JSON.stringify(zone)) : null,
        currentZone: currentZone ? JSON.parse(JSON.stringify(currentZone)) : null,
        drawing,
      },
    ]);
    setZone(prev.zone);
    setCurrentZone(prev.currentZone);
    setDrawing(prev.drawing);
    setHistory((h) => h.slice(0, -1));
  }, [history, zone, currentZone, drawing]);

  // Redo
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory((h) => [
      ...h.slice(-50),
      {
        zone: zone ? JSON.parse(JSON.stringify(zone)) : null,
        currentZone: currentZone ? JSON.parse(JSON.stringify(currentZone)) : null,
        drawing,
      },
    ]);
    setZone(next.zone);
    setCurrentZone(next.currentZone);
    setDrawing(next.drawing);
    setRedoStack((r) => r.slice(0, -1));
  }, [redoStack, zone, currentZone, drawing]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    const img = new Image();
    img.onload = () => {
      setImage({
        url,
        w: img.naturalWidth,
        h: img.naturalHeight,
        file // ✅ MUST exist
      });
    };

    img.src = url;
  };
  // SVG coordinate helper
  const svgPoint = (e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const m = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: (m.x - pan.x) / zoom, y: (m.y - pan.y) / zoom };
  };

  // Drawing handlers
  const handleSVGClick = (e) => {
    if (!selectMode || !image) return;
    const pt = svgPoint(e);
    if (!drawing) {
      pushHistory(zone, null);
      setZone(null);
      setDrawing(true);
      setCurrentZone({ id: Date.now(), points: [pt], closed: false, gradientId: selectedGradient });
    } else {
      pushHistory(zone, currentZone);
      setCurrentZone((z) => z ? { ...z, points: [...z.points, pt] } : z);
    }
  };

  const handleSVGDblClick = (e) => {
    if (!selectMode || !drawing || !currentZone) return;
    e.preventDefault();
    pushHistory(zone, currentZone);
    setZone({ ...currentZone, closed: true, gradientId: selectedGradient });
    setCurrentZone(null);
    setDrawing(false);
    setSelectMode(false);
  };

  // Panning
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
    setZoom((z) => Math.min(5, Math.max(0.2, z - e.deltaY * 0.001)));
  };

  // Point drag
  const dragZonePoint = (zid, pi, x, y) => {
    setZone((z) =>
      z ? { ...z, points: z.points.map((p, i) => (i === pi ? { x, y } : p)) } : z
    );
  };

  // Clear zone
  const handleClearZone = () => {
    pushHistory(zone, currentZone);
    setZone(null);
    setCurrentZone(null);
    setDrawing(false);
  };
  const compressImage = (file, maxWidth = 1600) =>
    new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = maxWidth / img.width;

        canvas.width = maxWidth;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => resolve(new File([blob], file.name, { type: "image/jpeg" })),
          "image/jpeg",
          0.7 // quality (0.6–0.8 is good)
        );
      };

      reader.readAsDataURL(file);
    });
  
  
  const handleSave = async () => {
    if (!image || !zone || !zone.closed) return;

    if (
      mall === "Select" ||
      floor === "Select" ||
      zoneName === "Select"
    ) {
      alert("Please select Mall, Floor, and Zone Name.");
      return;
    }

    setSaving(true);

    try {
      const cropBase64 = await captureZoneCrop(
        image.url,
        image.w,
        image.h,
        zone.points
      );
      // console.log("cropBase64", cropBase64);
      let cropFile = null;

      if (cropBase64) {
        cropFile = base64ToFile(
          cropBase64,
          `${zoneName}_thumb.png`
        );
      }

      console.log("Full Image:", image.file);
      console.log("Crop Image:", cropFile);

      console.log({
        heatmapid: initialRecord?.HeatMapID,
        zoneid: initialRecord?.ZoneID,
        fullImageFile: image.file,
        cropFile,
        existingImage: initialRecord?.FullImageURL,
        existingThumbnail: initialRecord?.ThumbnailURL,
      });
      onSave({
        id: initialRecord?._id || Date.now(),

        // Database IDs
        heatmapid: initialRecord?.HeatMapID || "",
        zoneid: initialRecord?.ZoneID || "",

        // Form values
        mall,
        floor,
        zoneName,

        // Image info
        imageW: image.w,
        imageH: image.h,

        // Zone polygon
        zoneData: JSON.parse(JSON.stringify(zone)),

        // Files
        fullImageFile: image.file || null,
        cropFile,

        // Existing URLs for update
        existingImage:
          initialRecord?.FullImageURL || "",

        existingThumbnail:
          initialRecord?.ThumbnailURL || "",
      });
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="editor-root">
      <div className="editor-card">
        <EditorHeader
          isEdit={isEdit}
          mall={mall} setMall={setMall}
          floor={floor} setFloor={setFloor}
          zoneName={zoneName} setZoneName={setZoneName}
          malls={filterData.malls}
          floors={filterData.floors}
          zones={filterData.zones}
          zone={zone}
          saving={saving}
          onSave={handleSave}
          onCancel={onCancel}
        />

        <EditorToolbar
          image={image}
          selectMode={selectMode}
          setSelectMode={setSelectMode}
          setDrawing={setDrawing}
          setCurrentZone={setCurrentZone}
          history={history}
          redoStack={redoStack}
          zone={zone}
          selectedGradient={selectedGradient}
          setSelectedGradient={setSelectedGradient}
          containerRef={containerRef}
          setZoom={setZoom}
          setPan={setPan}
          onUndo={undo}
          onRedo={redo}
          onClearZone={handleClearZone}
          fileRef={fileRef}
        />
        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <EditorCanvas
          image={image}
          zone={zone}
          currentZone={currentZone}
          drawing={drawing}
          selectMode={selectMode}
          isPanning={isPanning}
          zoom={zoom}
          pan={pan}
          selectedGradient={selectedGradient}
          svgRef={svgRef}
          containerRef={containerRef}
          fileRef={fileRef}
          onSVGClick={handleSVGClick}
          onSVGDblClick={handleSVGDblClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onDragZonePoint={dragZonePoint}
        />
      </div>
    </div>
  );
}

export default EditorView;