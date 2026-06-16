
// export default EditorToolbar;
import Icon from "../common/Icon";
import { icons, ZONE_GRADIENTS } from "../utils/constant";
import "../Styles/editor.css";

function EditorToolbar({
  image,
  selectMode,
  setSelectMode,
  setDrawing,
  setCurrentZone,
  history,
  redoStack,
  zone,
  selectedGradient,
  setSelectedGradient,
  containerRef,
  setZoom,
  setPan,
  onUndo,
  onRedo,
  onClearZone,
  fileRef,
}) {
  const handleResetPan = () => {
    if (image) {
      const container = containerRef.current;
      if (container) {
        const scaleX = container.clientWidth / image.w;
        const scaleY = container.clientHeight / image.h;
        const fitZoom = Math.min(scaleX, scaleY, 1);
        setZoom(fitZoom);
        setPan({
          x: (container.clientWidth - image.w * fitZoom) / 2,
          y: (container.clientHeight - image.h * fitZoom) / 2,
        });
      } else {
        setPan({ x: 0, y: 0 });
      }
    } else {
      setPan({ x: 0, y: 0 });
    }
  };

  const iconButtons = [
    // {
    //   icon: icons.undo,
    //   title: "Reset Pan",
    //   action: handleResetPan,
    //   disabled: false,
    // },
    {
      icon: icons.zoomIn,
      title: "Zoom In",
      action: () => setZoom((z) => Math.min(5, z + 0.2)),
      disabled: false,
    },
    {
      icon: icons.zoomOut,
      title: "Zoom Out",
      action: () => setZoom((z) => Math.max(0.2, z - 0.2)),
      disabled: false,
    },
  ];

  return (
    <div className="editor-toolbar">

      {/* ── Left: action buttons ── */}
      <div className="editor-toolbar-left">

        {/* Load Image */}
        <button
          onClick={() => fileRef.current.click()}
          className="btn btn-tool"
        >
          <Icon d={icons.plus} size={14} strokeWidth={2.5} />
          Load Image
        </button>

        {/* Select Area */}
        <button
          onClick={() => {
            setSelectMode((s) => !s);
            setDrawing(false);
            setCurrentZone(null);
          }}
          className={`btn btn-tool ${selectMode ? "btn-tool--active" : ""}`}
        >
          <Icon d={icons.lasso} size={14} />
          Select Area
        </button>

        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={history.length === 0}
          className={`btn btn-tool ${history.length === 0 ? "btn-tool--disabled" : ""}`}
        >
          <Icon d={icons.undo2} size={14} />
          Undo
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          disabled={redoStack.length === 0}
          className={`btn btn-tool ${redoStack.length === 0 ? "btn-tool--disabled" : ""}`}
        >
          <Icon d={icons.redo} size={14} />
          Redo
        </button>

        {/* Clear Zone — only shown when a zone exists */}
        {zone && (
          <button onClick={onClearZone} className="btn btn-clear">
            <Icon d={icons.close} size={13} strokeWidth={2.5} />
            Clear Zone
          </button>
        )}
      </div>

      {/* ── Right: gradient swatches + icon controls ── */}
      <div className="editor-toolbar-right">

        {/* Gradient colour swatches */}
        <div className="editor-gradient-swatches">
          {ZONE_GRADIENTS.map((grad) => (
            <button
              key={grad.id}
              title={grad.label}
              onClick={() => setSelectedGradient(grad.id)}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                border: `2.5px solid ${selectedGradient === grad.id ? "#0f172a" : "transparent"}`,
                background: `linear-gradient(135deg, ${grad.gradient[0]}, ${grad.gradient[1]})`,
                cursor: "pointer",
                padding: 0,
                outline: selectedGradient === grad.id ? "2px solid white" : "none",
                outlineOffset: -4,
              }}
            />
          ))}
        </div>

        {/* Zoom / Reset Pan icon buttons */}
        {iconButtons.map(({ icon, title, action, disabled }) => (
          <button
            key={title}
            title={title}
            onClick={action}
            disabled={disabled}
            className={`btn btn-icon ${disabled ? "btn-tool--disabled" : ""}`}
          >
            <Icon d={icon} size={15} />
          </button>
        ))}
      </div>

    </div>
  );
}

export default EditorToolbar;