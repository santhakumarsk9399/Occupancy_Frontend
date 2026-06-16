import Icon from "../common/Icon";
import { icons } from "../utils/constant";
import "../Styles/deletemodal.css";
import { fixImageUrl } from "../utils/helpers";

function DeleteModal({ record, onCancel, onConfirm }) {
    console.log(record)
    return (
        <div className="modal-overlay">
            <div className="modal-container">
                {/* Header */}
                <div className="modal-header">
                    <h2 className="modal-title">Delete Zone Image</h2>
                    <button className="modal-close" onClick={onCancel}>
                        <Icon d={icons.close} size={18} />
                    </button>
                </div>

                {/* Zone Image Preview */}
                {/* Zone Image Preview */}
                <div className="modal-image-wrap">
                    {record?.ThumbnailURL ? (
                        <img
                            src={fixImageUrl(record.ThumbnailURL)}
                            alt="Zone Preview"
                            className="modal-image"
                            onError={(e) => console.log("Image failed to load:", e.target.src)}
                     />
                    ) : (
                        <div className="modal-image-placeholder">No image available</div>
                    )}
                </div>

                {/* Actions */}
                <div className="modal-actions">
                    <button className="btn-modal-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="btn-modal-delete" onClick={() => onConfirm(record.HeatMapID)}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteModal;