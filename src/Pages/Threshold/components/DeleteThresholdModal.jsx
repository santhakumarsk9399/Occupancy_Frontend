import React from 'react';
import { Modal, Button, Image } from 'react-bootstrap';
import './DeleteThresholdModal.css';
import trashIcon from '../../../Components/Assets/trash.png';

// Matches styling/structure of DeleteZoneModal while preserving existing prop names.
const DeleteThresholdModal = ({ open, onClose, onDelete, thresholdName }) => {
  return (
    <Modal show={open} onHide={onClose} centered backdrop="static" size="md" className="delete-threshold-mdl">
      <Modal.Header closeButton>
        <Modal.Title>Delete Threshold</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center delete-threshold-body">
        <Image src={trashIcon} alt="Trash Bin" className="delete-threshold-image mb-3" />
        <h5 className="mt-2">
          Do you want to delete
          {thresholdName ? ` "${thresholdName}"` : ''} Threshold?
        </h5>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button className="btn btn-primary btn-sm" variant="light" onClick={onClose}>
          Cancel
        </Button>
        <Button
          clasName="btn btn-primary btn-sm delete"
          variant="danger"
            onClick={() => {
              if (typeof onDelete === 'function') onDelete();
            }}
        >
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteThresholdModal;
