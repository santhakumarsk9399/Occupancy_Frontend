// import Icon from "../common/Icon";
// import Dropdown from "../common/Dropdown";
// import { icons, MALLS, FLOORS, ZONES } from "../utils/constant";
// import "../Styles/editor.css";
// import "../Styles/common.css";
// // ─── Editor Header ────────────────────────────────────────────────────────────
// function EditorHeader({
//   isEdit,
//   zones,
//   mall,
//   floor,
//   zoneName,
//   setZoneName,
//   zone,
//   saving,
//   onSave,
//   onCancel,
// })
// {

//   const mallOptions = MALLS || [];
//   const floorOptions =
//     mall !== "Select"
//       ? FLOORS[mall] || []
//       : [];

//   const zoneOptions =
//     floor !== "Select"
//       ? ZONES[floor] || []
//       : [];

//   return (
//     <div className="editor-header">
//       {/* Top row: back + title */}
//       <div className="editor-header-top">
//         <button
//           onClick={onCancel}
//           className="btn btn-cancel"
//         >
//           <Icon d={icons.arrowLeft} size={14} />
//           Back
//         </button>
//         <h1 className="editor-title">
//           {isEdit ? "Edit Zone Image" : "Add Zone Image"}
//         </h1>
//       </div>

//       {/* Controls row */}
//       <div className="editor-header-controls">
//         <div className="editor-field-group">
//           <span className="editor-field-label">Zone Name :</span>

//           <Dropdown
//             label="Zone"
//             value={zoneName}
//             options={zones}
//             onChange={setZoneName}
//           />
//         </div>

//         {zoneName && zoneName !== "Select Zone" && (
//           <>
//             <div className="editor-field-group">
//               <span className="editor-field-label">Mall Name :</span>

//               <input
//                 type="text"
//                 className="form-control"
//                 value={mall}
//                 disabled
//                 readOnly
//               />
//             </div>

//             <div className="editor-field-group">
//               <span className="editor-field-label">Floor Name :</span>

//               <input
//                 type="text"
//                 className="form-control"
//                 value={floor}
//                 disabled
//                 readOnly
//               />
//             </div>
//           </>
//         )}
//         {/* Save / Cancel */}
//         <div className="editor-header-actions">
//           <button onClick={onCancel} className="btn btn-cancel">
//             Cancel
//           </button>
//           <button
//             onClick={onSave}
//             disabled={saving || !zone?.closed}
//             className={`btn btn-save ${
//               !zone?.closed || saving ? "btn-save--disabled" : "btn-save--active"
//             }`}
//           >
//             <Icon d={icons.save} size={14} />
//             {saving ? "Saving..." : "Save"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default EditorHeader;
import Icon from "../common/Icon";
import Dropdown from "../common/Dropdown";
import { icons } from "../utils/constant";
import "../Styles/editor.css";
import "../Styles/common.css";

function EditorHeader({
  isEdit,
  zones,
  mall,
  floor,
  zoneName,
  setZoneName,
  zone,
  saving,
  onSave,
  onCancel,
}) {
  return (
    <div className="editor-header">

      {/* Top row */}
      <div className="editor-header-top">
        <button
          onClick={onCancel}
          className="btn btn-cancel"
        >
          <Icon
            d={icons.arrowLeft}
            size={14}
          />
          Back
        </button>

        <h1 className="editor-title">
          {isEdit
            ? "Edit Zone Image"
            : "Add Zone Image"}
        </h1>
      </div>

      {/* Controls */}
      <div className="editor-header-controls">

        {/* =====================================================
            ZONE NAME
            EDIT  -> readonly text
            ADD   -> dropdown
        ===================================================== */}

        <div className="editor-field-group">
          <span className="editor-field-label">
            Zone Name :
          </span>

          {isEdit ? (
            <input
              type="text"
              className="form-control"
              value={zoneName || ""}
              disabled
              readOnly
            />
          ) : (
            <Dropdown
              label="Zone"
              value={zoneName}
              options={zones}
              onChange={setZoneName}
            />
          )}
        </div>

        {/* =====================================================
            MALL NAME
        ===================================================== */}

        <div className="editor-field-group">
          <span className="editor-field-label">
            Mall Name :
          </span>

          <input
            type="text"
            className="form-control"
            value={mall || ""}
            disabled
            readOnly
          />
        </div>

        {/* =====================================================
            FLOOR NAME
        ===================================================== */}

        <div className="editor-field-group">
          <span className="editor-field-label">
            Floor Name :
          </span>

          <input
            type="text"
            className="form-control"
            value={floor || ""}
            disabled
            readOnly
          />
        </div>

        {/* =====================================================
            ACTIONS
        ===================================================== */}

        <div className="editor-header-actions">

          <button
            onClick={onCancel}
            className="btn btn-cancel"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            disabled={
              saving ||
              !zone?.closed
            }
            className={`btn btn-save ${!zone?.closed || saving
                ? "btn-save--disabled"
                : "btn-save--active"
              }`}
          >
            <Icon
              d={icons.save}
              size={14}
            />

            {saving
              ? "Saving..."
              : "Save"}
          </button>

        </div>
      </div>
    </div>
  );
}

export default EditorHeader;