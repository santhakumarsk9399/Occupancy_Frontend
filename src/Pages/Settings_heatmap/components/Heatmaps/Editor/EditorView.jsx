import { useState, useRef, useEffect, useCallback } from "react";
import EditorHeader from "./EditorHeader";
import EditorToolbar from "./EditorToolbar";
import EditorCanvas from "./EditorCanvas";
import {
  fixImageUrl,
  extractZoneData,
  getZoneBounds,
  captureZoneCrop,
  base64ToFile,
} from "../utils/helpers";

import "../Styles/editor.css";

import {
  getZonesList,
  getZoneDetails,
  getHeatmapZoneDetails,
} from "../../../Api/zoneImagesApis";

import { showError, showSuccess } from "../../../../CommonComponents/Toaster";

import { processFile } from "./ImageProcessFile";
import { getToken } from "../utils/sessionHelper";

function EditorView({ initialRecord, onSave, onCancel }) {
  const isEdit = !!initialRecord;

  // ============================================================
  // BASIC FORM STATE
  // ============================================================
  const [imageLoading, setImageLoading] = useState(false);
  const [mall, setMall] = useState(initialRecord?.MallName || "");

  const [floor, setFloor] = useState(initialRecord?.FloorName || "");

  const [zoneName, setZoneName] = useState(
    initialRecord?.ZoneName || "Select Zone",
  );

  // ============================================================
  // ZONE LIST
  // ============================================================

  const [zones, setZones] = useState([]);

  // ============================================================
  // IMAGE STATE
  // ============================================================

  const [image, setImage] = useState(null);

  const [heatmapImages, setHeatmapImages] = useState([]);

  const [selectedFloorImage, setSelectedFloorImage] = useState(null);

  const [floorImageExists, setFloorImageExists] = useState(false);

  const [useExistingImage, setUseExistingImage] = useState(true);

  const [existingFloorImage, setExistingFloorImage] = useState(null);

  // ============================================================
  // ZONE / DRAWING STATE
  // ============================================================

  const parsedInitialZone = extractZoneData(initialRecord?.ZoneData);

  const [zone, setZone] = useState(parsedInitialZone);

  const [selectedGradient, setSelectedGradient] = useState(
    parsedInitialZone?.gradientId || "blue",
  );

  const [currentZone, setCurrentZone] = useState(null);

  const [drawing, setDrawing] = useState(false);

  const [selectMode, setSelectMode] = useState(false);

  // ============================================================
  // HISTORY
  // ============================================================

  const [history, setHistory] = useState([]);

  const [redoStack, setRedoStack] = useState([]);

  // ============================================================
  // ZOOM / PAN
  // ============================================================

  const [zoom, setZoom] = useState(1);

  const [pan, setPan] = useState({
    x: 0,
    y: 0,
  });

  const [isPanning, setIsPanning] = useState(false);

  const [panStart, setPanStart] = useState(null);

  // ============================================================
  // SAVE
  // ============================================================

  const [saving, setSaving] = useState(false);

  // ============================================================
  // REFS
  // ============================================================

  const fileRef = useRef(null);

  const svgRef = useRef(null);

  const containerRef = useRef(null);

  // ============================================================
  // LOAD ZONE LIST
  // ============================================================

  useEffect(() => {
    const loadZones = async () => {
      try {
        const zoneList = await getZonesList();

        console.log("ZONE LIST:", zoneList);

        setZones(zoneList || []);
      } catch (error) {
        console.error("Failed to load zones:", error);

        setZones([]);
      }
    };

    loadZones();
  }, []);

  // ============================================================
  // LOAD HEATMAP ZONE DETAILS
  // ============================================================

  useEffect(() => {
    const loadHeatmapImages = async () => {
      try {
        const data = await getHeatmapZoneDetails();

        console.log("INITIAL HEATMAP ZONE DETAILS:", data);

        setHeatmapImages(data || []);
      } catch (error) {
        console.error("Failed to load heatmap zone details:", error);

        setHeatmapImages([]);
      }
    };

    loadHeatmapImages();
  }, []);


  // ============================================================
  // LOAD IMAGE WHEN EDITING AN EXISTING ZONE
  //
  // IMPORTANT:
  // initialRecord may NOT contain FullImageURL.
  // So we find the zone again from getHeatmapZoneDetails()
  // using ZoneName.
  // ============================================================

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    const loadEditZoneImage = async () => {
      setImageLoading(true);
      try {
        const zoneNameFromRecord = String(initialRecord?.ZoneName || "")
          .trim()
          .toLowerCase();

        if (!zoneNameFromRecord) {
          console.error("Edit mode: ZoneName is missing", initialRecord);

          return;
        }

        console.log("EDIT ZONE NAME:", initialRecord.ZoneName);

        // --------------------------------------------------------
        // Get latest heatmap zone data
        // --------------------------------------------------------

        const heatmapData = await getHeatmapZoneDetails();

        console.log("EDIT HEATMAP DATA:", heatmapData);

        setHeatmapImages(heatmapData || []);

        // --------------------------------------------------------
        // Find EXACT zone by ZoneName
        // --------------------------------------------------------

        const matchedZone = (heatmapData || []).find(
          (item) =>
            String(item?.ZoneName || "")
              .trim()
              .toLowerCase() === zoneNameFromRecord,
        );

        console.log("EDIT MATCHED ZONE:", matchedZone);

        if (!matchedZone) {
          console.error("EDIT ZONE NOT FOUND:", initialRecord.ZoneName);

          setImage(null);

          setFloorImageExists(false);

          setExistingFloorImage(null);

          setSelectedFloorImage(null);

          setUseExistingImage(false);

          return;
        }

        // --------------------------------------------------------
        // Mall / Floor
        // --------------------------------------------------------

        setMall(matchedZone.MallName || initialRecord.MallName || "");

        setFloor(matchedZone.FloorName || initialRecord.FloorName || "");

        // --------------------------------------------------------
        // Zone polygon
        // --------------------------------------------------------

        const zoneData = matchedZone.ZoneData || initialRecord.ZoneData || null;

        const parsedZone = extractZoneData(zoneData);

        console.log("EDIT PARSED ZONE:", parsedZone);

        setZone(parsedZone);

        setSelectedGradient(parsedZone?.gradientId || "blue");

        setCurrentZone(null);

        setDrawing(false);

        setSelectMode(false);

        // --------------------------------------------------------
        // IMAGE URL
        // --------------------------------------------------------

        const fullImageURL =
          matchedZone.FullImageURL || initialRecord.FullImageURL || null;

        console.log("EDIT FULL IMAGE URL:", fullImageURL);

        if (!fullImageURL) {
          console.error(
            "No FullImageURL for edit zone:",
            initialRecord.ZoneName,
          );

          setImage(null);

          setFloorImageExists(false);

          setExistingFloorImage(null);

          setSelectedFloorImage(null);

          setUseExistingImage(false);

          return;
        }

        // --------------------------------------------------------
        // Save existing image information
        // --------------------------------------------------------

        setExistingFloorImage({
          ...matchedZone,
          FullImageURL: fullImageURL,
        });

        setSelectedFloorImage(fullImageURL);

        setFloorImageExists(true);

        setUseExistingImage(true);

        console.log("EDIT IMAGE STATE SET:", fullImageURL);
      } catch (error) {
        console.error("EDIT IMAGE LOAD ERROR:", error);

        setImage(null);

        setFloorImageExists(false);

        setExistingFloorImage(null);

        setSelectedFloorImage(null);

        setUseExistingImage(false);
      }
    };

    loadEditZoneImage();
  }, [
    isEdit,
    initialRecord?._id,
    initialRecord?.ZoneID,
    initialRecord?.ZoneName,
  ]);

  // ============================================================
  // LOAD SELECTED FLOOR IMAGE
  //
  // Whenever selectedFloorImage changes, load it into
  // the EditorCanvas.
  // ============================================================

  useEffect(() => {
    if (!selectedFloorImage) {
      return;
    }

    // START LOADING
    setImageLoading(true);

    const imageUrl = fixImageUrl(selectedFloorImage);

    console.log("LOADING SELECTED FLOOR IMAGE:", imageUrl);

    const img = new Image();

    img.onload = () => {
      console.log("SELECTED FLOOR IMAGE LOADED:", imageUrl);

      setImage({
        url: imageUrl,
        w: img.naturalWidth || 1080,
        h: img.naturalHeight || 600,
        file: null,
      });

      setFloorImageExists(true);

      setExistingFloorImage({
        FullImageURL: selectedFloorImage,
      });

      setUseExistingImage(true);

      // STOP LOADING ONLY AFTER IMAGE IS READY
      setImageLoading(false);

// Show success toaster only in ADD mode
if (!isEdit) {
  showSuccess("Existing floor image found and loaded successfully.");
}
    };

    img.onerror = () => {
      console.error("SELECTED FLOOR IMAGE FAILED:", imageUrl);

      // STOP LOADING IF IMAGE FAILED
      setImageLoading(false);

      setImage(null);

      setFloorImageExists(false);

      setExistingFloorImage(null);

      setUseExistingImage(false);

      showError("Unable to load existing floor image.");
    };

    img.src = imageUrl;
  }, [selectedFloorImage]);
  // ============================================================
  // AUTO FIT IMAGE / ZONE
  // ============================================================

  useEffect(() => {
    if (!image || !zone || !zone.points?.length) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    const bounds = getZoneBounds(zone.points);

    const padding = 150;

    const scaleX = container.clientWidth / (bounds.width + padding);

    const scaleY = container.clientHeight / (bounds.height + padding);

    const newZoom = Math.min(scaleX, scaleY, 3);

    const centerX = (bounds.minX + bounds.maxX) / 2;

    const centerY = (bounds.minY + bounds.maxY) / 2;

    setZoom(newZoom);

    setPan({
      x: container.clientWidth / 2 - centerX * newZoom,

      y: container.clientHeight / 2 - centerY * newZoom,
    });
  }, [image, zone]);

  // ============================================================
  // KEEP GRADIENT IN SYNC
  // ============================================================

  useEffect(() => {
    if (zone) {
      setZone((z) =>
        z
          ? {
            ...z,
            gradientId: selectedGradient,
          }
          : z,
      );
    }

    if (currentZone) {
      setCurrentZone((z) =>
        z
          ? {
            ...z,
            gradientId: selectedGradient,
          }
          : z,
      );
    }
  }, [selectedGradient]);

  // ============================================================
  // HISTORY
  // ============================================================

  const pushHistory = useCallback((zoneSnap, currentZoneSnap) => {
    setHistory((h) => [
      ...h.slice(-50),

      {
        zone: zoneSnap ? JSON.parse(JSON.stringify(zoneSnap)) : null,

        currentZone: currentZoneSnap
          ? JSON.parse(JSON.stringify(currentZoneSnap))
          : null,

        drawing: !!currentZoneSnap,
      },
    ]);

    setRedoStack([]);
  }, []);

  // ============================================================
  // UNDO
  // ============================================================

  const undo = useCallback(() => {
    if (history.length === 0) {
      return;
    }

    const prev = history[history.length - 1];

    setRedoStack((r) => [
      ...r.slice(-50),

      {
        zone: zone ? JSON.parse(JSON.stringify(zone)) : null,

        currentZone: currentZone
          ? JSON.parse(JSON.stringify(currentZone))
          : null,

        drawing,
      },
    ]);

    setZone(prev.zone);

    setCurrentZone(prev.currentZone);

    setDrawing(prev.drawing);

    setHistory((h) => h.slice(0, -1));
  }, [history, zone, currentZone, drawing]);

  // ============================================================
  // REDO
  // ============================================================

  const redo = useCallback(() => {
    if (redoStack.length === 0) {
      return;
    }

    const next = redoStack[redoStack.length - 1];

    setHistory((h) => [
      ...h.slice(-50),

      {
        zone: zone ? JSON.parse(JSON.stringify(zone)) : null,

        currentZone: currentZone
          ? JSON.parse(JSON.stringify(currentZone))
          : null,

        drawing,
      },
    ]);

    setZone(next.zone);

    setCurrentZone(next.currentZone);

    setDrawing(next.drawing);

    setRedoStack((r) => r.slice(0, -1));
  }, [redoStack, zone, currentZone, drawing]);

  // ============================================================
  // FILE CHANGE
  // ============================================================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    processFile(file, setImage, showError);

    // New uploaded image is no longer
    // the existing floor image.
    setUseExistingImage(false);

    // Reset selected existing image.
    setSelectedFloorImage(null);

    setFloorImageExists(false);

    setExistingFloorImage(null);
  };

  // ============================================================
  // SVG POINT
  // ============================================================

  const svgPoint = (e) => {
    const svg = svgRef.current;

    if (!svg) {
      return {
        x: 0,
        y: 0,
      };
    }

    const pt = svg.createSVGPoint();

    pt.x = e.clientX;

    pt.y = e.clientY;

    const matrix = svg.getScreenCTM()?.inverse();

    if (!matrix) {
      return {
        x: 0,
        y: 0,
      };
    }

    const transformed = pt.matrixTransform(matrix);

    return {
      x: (transformed.x - pan.x) / zoom,

      y: (transformed.y - pan.y) / zoom,
    };
  };

  // ============================================================
  // SVG CLICK
  // ============================================================

  const handleSVGClick = (e) => {
    if (!selectMode || !image) {
      return;
    }

    const pt = svgPoint(e);

    if (!drawing) {
      pushHistory(zone, null);

      setZone(null);

      setDrawing(true);

      setCurrentZone({
        id: Date.now(),

        points: [pt],

        closed: false,

        gradientId: selectedGradient,
      });
    } else {
      pushHistory(zone, currentZone);

      setCurrentZone((z) =>
        z
          ? {
            ...z,

            points: [...z.points, pt],
          }
          : z,
      );
    }
  };

  // ============================================================
  // SVG DOUBLE CLICK
  // ============================================================

  const handleSVGDblClick = (e) => {
    if (!selectMode || !drawing || !currentZone) {
      return;
    }

    e.preventDefault();

    if (currentZone.points.length < 3) {
      showError("Please add at least 3 points.");

      return;
    }

    pushHistory(zone, currentZone);

    setZone({
      ...currentZone,

      closed: true,

      gradientId: selectedGradient,
    });

    setCurrentZone(null);

    setDrawing(false);

    setSelectMode(false);
  };

  // ============================================================
  // PANNING
  // ============================================================

  const handleMouseDown = (e) => {
    if (selectMode || e.button !== 0) {
      return;
    }

    setIsPanning(true);

    setPanStart({
      mx: e.clientX,
      my: e.clientY,
      px: pan.x,
      py: pan.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isPanning || !panStart) {
      return;
    }

    setPan({
      x: panStart.px + e.clientX - panStart.mx,

      y: panStart.py + e.clientY - panStart.my,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);

    setPanStart(null);
  };

  // ============================================================
  // WHEEL / ZOOM
  //
  // No preventDefault here because the browser reported
  // passive listener warning.
  // ============================================================

  const handleWheel = (e) => {
    setZoom((z) => Math.min(5, Math.max(0.2, z - e.deltaY * 0.001)));
  };

  // ============================================================
  // DRAG ZONE POINT
  // ============================================================

  const dragZonePoint = (zid, pi, x, y) => {
    setZone((z) =>
      z
        ? {
          ...z,

          points: z.points.map((p, i) =>
            i === pi
              ? {
                x,
                y,
              }
              : p,
          ),
        }
        : z,
    );
  };

  // ============================================================
  // CLEAR ZONE
  // ============================================================

  const handleClearZone = () => {
    pushHistory(zone, currentZone);

    setZone(null);

    setCurrentZone(null);

    setDrawing(false);

    setSelectMode(false);
  };

  // ============================================================
  // ZONE CHANGE

  const resetEditorStateForZoneChange = () => {
    // Clear previous zone editing state
    setZone(null);
    setCurrentZone(null);
    setDrawing(false);
    setSelectMode(false);

    // Clear Undo / Redo
    setHistory([]);
    setRedoStack([]);

    // Clear previous image temporarily
    setImage(null);

    // Reset image state
    setSelectedFloorImage(null);
    setExistingFloorImage(null);
    setFloorImageExists(false);
    setUseExistingImage(false);
  };

  const handleZoneChange = async (value) => {
    // NEW ZONE = NEW EDITING SESSION
    resetEditorStateForZoneChange();

    setZoneName(value);

    if (!value) {
      return;
    }

    try {
      let zoneList = heatmapImages;

      if (!zoneList || zoneList.length === 0) {
        zoneList = await getHeatmapZoneDetails();
        setHeatmapImages(zoneList || []);
      }

      const selectedZone = (zoneList || []).find(
        (item) =>
          String(item?.ZoneName || "")
            .trim()
            .toLowerCase() === String(value).trim().toLowerCase(),
      );

      let details = null;

      try {
        details = await getZoneDetails(value);
      } catch (zoneError) {
        console.warn("getZoneDetails failed:", zoneError);
      }

      const selectedMall = selectedZone?.MallName || details?.MallName || "";

      const selectedFloor = selectedZone?.FloorName || details?.FloorName || "";

      setMall(selectedMall);
      setFloor(selectedFloor);

      // ----------------------------------------------------------
      // Load ONLY SAVED polygon from API
      // ----------------------------------------------------------

      const zoneData = selectedZone?.ZoneData || details?.ZoneData || null;

      const newZone = extractZoneData(zoneData);

      setZone(newZone);

      setSelectedGradient(newZone?.gradientId || "blue");

      // These must remain clean after zone change
      setCurrentZone(null);
      setDrawing(false);
      setSelectMode(false);

      // ----------------------------------------------------------
      // Load image
      // ----------------------------------------------------------

      const fullImageURL =
        selectedZone?.FullImageURL || details?.FullImageURL || null;

      if (!fullImageURL) {
        setImage(null);
        setSelectedFloorImage(null);
        setFloorImageExists(false);
        setExistingFloorImage(null);
        setUseExistingImage(false);
        showError(`No existing floor image found for selected zone`);

        return;
      }

      setSelectedFloorImage(fullImageURL);

      setFloorImageExists(true);

      setExistingFloorImage({
        ...(selectedZone || details || {}),
        FullImageURL: fullImageURL,
      });

      setUseExistingImage(true);
    } catch (error) {
      console.error("handleZoneChange error:", error);

      resetEditorStateForZoneChange();

      showError("Unable to load zone details.");
    }
  };

  // ============================================================
  // ZONE OPTIONS
  // ============================================================

  const zoneOptions = [...new Set(zones.map((item) => item["ZoneName"]))];

  // ============================================================
  // FINISH ZONE
  // ============================================================

  const handleFinishZone = () => {
    if (!currentZone || currentZone.points.length < 3) {
      showError("Please add at least 3 points");

      return;
    }

    pushHistory(zone, currentZone);

    setZone({
      ...currentZone,

      closed: true,

      gradientId: selectedGradient,
    });

    setCurrentZone(null);

    setDrawing(false);

    setSelectMode(false);
  };

  // ============================================================
  // USE EXISTING IMAGE
  // ============================================================

  const handleUseExistingImage = () => {
    if (!existingFloorImage) {
      showError("No floor image found.");

      return;
    }

    const fullImageURL = existingFloorImage.FullImageURL;

    if (!fullImageURL) {
      showError("No existing image URL found.");

      return;
    }

    const imageUrl = fixImageUrl(fullImageURL);

    console.log("USE EXISTING IMAGE:", imageUrl);

    const img = new Image();

    img.onload = () => {
      setImage({
        url: imageUrl,

        w: img.naturalWidth || 1080,

        h: img.naturalHeight || 600,

        file: null,
      });

      setSelectedFloorImage(fullImageURL);

      setUseExistingImage(true);

      setFloorImageExists(true);
    };

    img.onerror = () => {
      console.error("Unable to load existing image:", imageUrl);

      showError("Unable to load existing floor image.");
    };

    img.src = imageUrl;
  };

  // ============================================================
  // UPLOAD NEW IMAGE
  // ============================================================

  const handleUploadNewImage = () => {
    setUseExistingImage(false);

    setSelectedFloorImage(null);

    setExistingFloorImage(null);

    setFloorImageExists(false);

    setImage(null);
  };

  // ============================================================
  // UPLOAD EXISTING IMAGE
  // ============================================================

  const existingImageUrlToFile = async (imageUrl) => {
    if (!imageUrl) {
      return null;
    }

    const finalUrl = fixImageUrl(imageUrl);

    console.log("CONVERTING EXISTING IMAGE TO FILE:");

    console.log("Image URL:", finalUrl);

    try {
      const response = await fetch(finalUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch existing image: ${response.status}`);
      }

      const blob = await response.blob();

      console.log("EXISTING IMAGE BLOB:", blob);

      const extension =
        blob.type === "image/png"
          ? "png"
          : blob.type === "image/webp"
            ? "webp"
            : "jpg";

      const file = new File(
        [blob],
        `${zoneName || "floor"}_existing.${extension}`,
        {
          type: blob.type || "image/jpeg",
        },
      );

      console.log("EXISTING IMAGE FILE:", file);

      return file;
    } catch (error) {
      console.error("Failed to convert existing image to File:", error);

      return null;
    }
  };


  const handleSave = async () => {
    if (!image || !zone || !zone.closed) {
      showError("Please draw and complete the zone before saving.");

      return;
    }

    if (zoneName === "Select Zone") {
      showError("Please select Zone Name");

      return;
    }

    setSaving(true);

    try {
      // ==========================================================
      // 1. GET IMAGE FILE
      //
      // New image:
      //     image.file exists
      //
      // Existing image:
      //     image.file is null
      //     so convert existing URL -> Blob -> File
      // ==========================================================

      let fullImageFile = image.file || null;

      if (!fullImageFile) {
        const existingImageUrl =
          selectedFloorImage ||
          existingFloorImage?.FullImageURL ||
          initialRecord?.FullImageURL ||
          "";

        console.log("EXISTING IMAGE URL FOR SAVE:", existingImageUrl);

        if (existingImageUrl) {
          fullImageFile = await existingImageUrlToFile(existingImageUrl);
        }
      }

      // ==========================================================
      // 2. Make sure we actually have an image file
      // ==========================================================

      if (!fullImageFile) {
        showError("Unable to prepare floor image for saving.");

        return;
      }

      console.log("FINAL FULL IMAGE FILE:", fullImageFile);

      // ==========================================================
      // 3. Create thumbnail
      // ==========================================================

      const cropBase64 = await captureZoneCrop(
        image.url,
        image.w,
        image.h,
        zone.points,
      );

      let cropFile = null;

      if (cropBase64) {
        cropFile = base64ToFile(cropBase64, `${zoneName}_thumb.png`);
      }

      // ==========================================================
      // 4. SAVE
      // ==========================================================

      onSave({
        id: initialRecord?._id || Date.now(),

        // Database IDs
        heatmapid: initialRecord?.HeatMapID || "",

        zoneid: initialRecord?.ZoneID || "",

        // Form values
        mall,

        floor,

        zoneName,

        // Image information
        imageW: image.w,

        imageH: image.h,

        // Zone polygon
        zoneData: JSON.parse(JSON.stringify(zone)),

        // IMPORTANT
        // New image OR existing image
        // will always be a File now.
        fullImageFile,

        cropFile,

        // Existing URL
        existingImage: initialRecord?.FullImageURL || selectedFloorImage || "",

        existingThumbnail: initialRecord?.ThumbnailURL || "",
      });
    } catch (error) {
      console.error("Save error:", error);

      showError("Unable to save zone.");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="editor-root">
      <div className="editor-card">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <EditorHeader
          isEdit={isEdit}
          zones={zoneOptions}
          mall={mall}
          floor={floor}
          zoneName={zoneName}
          setZoneName={handleZoneChange}
          zone={zone}
          saving={saving}
          onSave={handleSave}
          onCancel={onCancel}
        />

        {/* ======================================================
            TOOLBAR
        ====================================================== */}

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
          currentZone={currentZone}
          drawing={drawing}
          onFinishZone={handleFinishZone}
        />

        {/* ======================================================
            HIDDEN FILE INPUT
        ====================================================== */}

        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          style={{
            display: "none",
          }}
          onChange={handleFileChange}
        />

        {/* ======================================================
            CANVAS
        ====================================================== */}
        <div className="editor-canvas-wrapper">
          {imageLoading && (
            <div className="image-loading-overlay">
              <div className="image-loader"></div>

              <div className="image-loading-text">Loading floor image...</div>
            </div>
          )}

          <EditorCanvas
            image={image}
            zoneName={zoneName}
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
            onFileDrop={(file) => processFile(file, setImage, showError)}
            floorImageExists={floorImageExists}
            useExistingImage={useExistingImage}
            setUseExistingImage={setUseExistingImage}
            onUseExistingImage={handleUseExistingImage}
            onUploadNewImage={handleUploadNewImage}
          />
        </div>
      </div>
    </div>
  );
}

export default EditorView;
