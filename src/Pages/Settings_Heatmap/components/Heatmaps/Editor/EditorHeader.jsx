import Icon from "../common/Icon";
import Dropdown from "../common/Dropdown";
import { icons, MALLS, FLOORS, ZONES } from "../utils/constant";
import "../Styles/editor.css";

// ─── Editor Header ────────────────────────────────────────────────────────────
function EditorHeader({
  isEdit,
  malls,
  floors,
  zones,
  mall, setMall,
  floor, setFloor,
  zoneName, setZoneName,
  zone,
  saving,
  onSave,
  onCancel,
}) {
  // const floorOptions = mall !== "Select" ? FLOORS[mall] || [] : [];
  // const zoneOptions = floor !== "Select" ? ZONES[floor] || [] : [];

  // Zone options depend on Mall
  // Floor options depend on Zone
  const mallOptions = MALLS || [];
  const floorOptions =
    mall !== "Select"
      ? FLOORS[mall] || []
      : [];

  const zoneOptions =
    floor !== "Select"
      ? ZONES[floor] || []
      : [];
 
  // const mallOptions = malls.map(m => m.MallName);

  // const floorOptions = floors.map(f => f.FloorName);

  // const zoneOptions = zones.map(z => z.ZoneName);
  return (
    <div className="editor-header">
      {/* Top row: back + title */}
      <div className="editor-header-top">
        <button
          onClick={onCancel}
          className="btn btn-back"
        >
          <Icon d={icons.arrowLeft} size={14} />
          Back
        </button>
        <h1 className="editor-title">
          {isEdit ? "Edit Zone Image" : "Add Zone Image"}
        </h1>
      </div>

      {/* Controls row */}
      <div className="editor-header-controls">
        {/* Mall */}
        {/* 1. Mall */}
        <div className="editor-field-group">
          <span className="editor-field-label">Mall Name</span>
          <Dropdown
            label="Mall"
            value={mall}
            options={mallOptions}
            onChange={(v) => {
              setMall(v);
              setZoneName("Select"); 
              setFloor("Select");   
            }}
          />
        </div>


        {/* 2. Floor — depends on Zone */}
        <div className="editor-field-group">
          <span className="editor-field-label">Floor Name</span>
          <Dropdown
            label="Floor"
            value={floor}
            options={floorOptions}
            onChange={setFloor}
            // disabled={zoneName === "Select"}
            disabled={false}
          />
        </div>
        {/* 3. Zone — depends on Mall */}
        <div className="editor-field-group">
          <span className="editor-field-label">Zone Name</span>
          <Dropdown
            label="Zone"
            value={zoneName}
            options={zoneOptions}
            onChange={(v) => {
              setZoneName(v);
              // setFloor("Select");
            }}
            // disabled={mall === "Select"}
            disabled={false}
          />
        </div>

        {/* Save / Cancel */}
        <div className="editor-header-actions">
          <button onClick={onCancel} className="btn btn-cancel">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving || !zone?.closed}
            className={`btn btn-save ${
              !zone?.closed || saving ? "btn-save--disabled" : "btn-save--active"
            }`}
          >
            <Icon d={icons.save} size={14} />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditorHeader;
