import React from "react";
import { Modal, Button, Image, OverlayTrigger, Tooltip } from "react-bootstrap";
import trashIcon from "../../Components/Assets/trash.png"; // reuse global trash for consistency
import "./DeleteEmailGroup.css";

const DeleteSMSGroup = ({ show, group, onClose, onConfirm }) => {
  const name = (group?.name || group?.groupName || group?.GroupName || "").toString();
  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" size="md" className="delete-threshold-mdl">
      <Modal.Header closeButton>
         <Modal.Title style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Delete SMS Group</span>
           </Modal.Title> 
        {/* <Modal.Title style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Delete SMS Group</span>
          <OverlayTrigger
            placement="right"
            overlay={<Tooltip id="del-sms-info-tooltip">Permanently deletes this SMS group and its mappings (contacts, zones, threshold).</Tooltip>}
          >
            <span className="info-icon" role="img" aria-label="Info" tabIndex={0}>i</span>
          </OverlayTrigger>
        </Modal.Title> */}
      </Modal.Header>
      <Modal.Body className="text-center delete-threshold-body">
        <Image src={trashIcon} alt="Trash Bin" className="delete-threshold-image mb-3" />
        <h5 className="mt-2">
          Do you want to delete{name ? ` "${name}"` : ""} SMS Group?
        </h5>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button className="btn btn-primary btn-sm" variant="light" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="btn btn-primary btn-sm delete"
          variant="danger"
          onClick={() => { if (group && typeof onConfirm === 'function') onConfirm(group); }}
          disabled={!group}
        >
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteSMSGroup;
