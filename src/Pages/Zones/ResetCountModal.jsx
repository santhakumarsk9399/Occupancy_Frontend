import React from "react";
import { Modal, Button, Image } from "react-bootstrap";
import resetImage from "../../Components/Assets/reset.png";
import "./ResetCountModal.css";
import "../../Components/Styles/CustomButtons.css";

// Confirmation popup: if confirmed, reset count to 0
// onSubmit will receive (resetCount, zone, username)
const ResetCountModal = ({ show, zoneName = "", zone = null, onCancel, onSubmit }) => {
  const handleConfirm = () => {
    const username = sessionStorage.getItem('username') || 'Occupancy';
    if (zone) onSubmit?.(0, zone, username); else onSubmit?.(0, null, username);
  };

  return (
    <Modal show={show} onHide={onCancel} centered backdrop="static" size="md">
      <Modal.Header closeButton>
        <Modal.Title>Reset Count</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center reset-count-body">
        <Image src={resetImage} alt="Reset" className="reset-count-image mb-3" />
        <h5 className="mt-2">The Counts will be reset to '<strong>0</strong>' {zoneName ? ` for "${zoneName}"` : ""}. Do you want to continue?</h5>
      </Modal.Body>
      <Modal.Footer className="justify-content-center" style={{ gap:16 }}>
        <Button
          onClick={onCancel}
          disabled={false}
          style={{
            background:'#fff',
            color:'#1d4ed8',
            border:'1px solid #1d4ed8',
            minWidth:100,
            fontWeight:500,
            borderRadius:8
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          style={{
            background:'#1d4ed8',
            color:'#fff',
            border:'1px solid #1d4ed8',
            minWidth:100,
            fontWeight:500,
            borderRadius:8
          }}
        >
          Reset
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResetCountModal;
