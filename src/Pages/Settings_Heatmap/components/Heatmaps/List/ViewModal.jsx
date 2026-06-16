import Icon from "../common/Icon";
import { icons, zoneColors } from "../utils/constant";
import "../Styles/common.css";
import { fixImageUrl } from "../utils/helpers";

// ─── View Modal ───────────────────────────────────────────────────────────────
function ViewModal({ viewRecord, onClose }) {
  if (!viewRecord) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <h3 className="modal-title">
            {viewRecord.ZoneName}
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <Icon d={icons.close} size={18} />
          </button>
        </div>

        {/* Zone Image + SVG Overlay */}
        {viewRecord?.ThumbnailURL && viewRecord?.ZoneData && (
          <div className="zone-view-container">
           <img
              src={fixImageUrl(viewRecord.ThumbnailURL)}
              alt="zone"
              className="zone-view-img"
            />
            <svg className="zone-view-svg">
              {(() => {
                const g =
                  zoneColors[viewRecord.ZoneData.gradientId] || zoneColors.blue;
                const points = viewRecord.ZoneData.points
                  .map((p) => `${p.x},${p.y}`)
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

        {/* Meta info */}
        <div className="modal-meta">
          <span>
            <strong style={{ color: "#374151" }}>Mall:</strong> {viewRecord.MallName}
          </span>
          <span>
            <strong style={{ color: "#374151" }}>Floor:</strong> {viewRecord.FloorName}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ViewModal;
