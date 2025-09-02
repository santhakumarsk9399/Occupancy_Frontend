import React from "react";
import { Modal, Button, Image } from "react-bootstrap";
import trashImage from "../../Components/Assets/trash.png";
import "./DeleteZoneModal.css";
import "../../Components/Styles/CustomButtons.css";
// Toast container is provided at App root

const DeleteZoneModal = ({ show, onClose, zone, onDelete }) => {
  return (
  <Modal show={show} onHide={onClose} centered backdrop="static" size="md" className="delete-zone-mdl">
      <Modal.Header closeButton>
        <Modal.Title>Delete Zone</Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center delete-zone-body">
        <Image src={trashImage} alt="Trash Bin" className="delete-zone-image mb-3" />
        <h5 className="mt-2">Do you want to delete {zone?.zoneName ? ` "${zone.zoneName}"` : ""} Zone?</h5>
      </Modal.Body>

      <Modal.Footer className="justify-content-center">
        <Button className="btn btn-primary btn-sm" variant="light" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            if (typeof onDelete === "function") onDelete(zone);
          }}
        >
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteZoneModal;

