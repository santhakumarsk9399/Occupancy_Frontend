import React, { useState, useEffect } from "react";
import { Modal, Button, Image } from "react-bootstrap";
import { toast } from "react-toastify";
import trashImage from "../../Components/Assets/trash.png";
import "./DeleteZoneModal.css";
import "../../Components/Styles/CustomButtons.css";

const DeleteZoneModal = ({ show, onClose, zone, onSuccess }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset error when modal opens/closes or zone changes
  useEffect(() => {
    if (show) {
      setErrorMessage("");
      setIsDeleting(false);
    }
  }, [show, zone?.zoneName]);

  const handleDelete = async () => {
    if (!zone?.zoneName) {
      setErrorMessage("Invalid zone data");
      return;
    }
    
    setIsDeleting(true);
    setErrorMessage("");
    
    try {
      const token = sessionStorage.getItem("token");
      const vid = Number(sessionStorage.getItem("vid")) || 4;
      const username = sessionStorage.getItem("username") || "Occupancy";
      
      // Get API_BASE from environment or use default  
      const API_BASE = import.meta.env.VITE_API_URL || "http://delbi2dev.deloptanalytics.com:3000";
      
      const res = await fetch(`${API_BASE}/settings/zones/deleteZone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ vid, username, zonename: zone.zoneName }),
      });
      
      const data = await res.json().catch(() => ({}));

      // Debug: Inspect actual response
      // eslint-disable-next-line no-console
      console.log("DeleteZone API Response:", data);

      // Treat HTTP errors or explicit API failure as errors
      if (!res.ok || data?.success === false) {
        const msg = data?.message || `Failed to delete zone (${res.status})`;
        throw new Error(msg);
      }

      // If backend returns success:true but indicates it cannot be deleted due to SMS/Email config, show as warning
      if (
        data?.success === true &&
        typeof data?.message === "string" &&
        (
          data.message.toLowerCase().includes("cannot be deleted") ||
          data.message.toLowerCase().includes("configured sms/email") ||
          data.message.toLowerCase().includes("sms/email")
        )
      ) {
        // eslint-disable-next-line no-console
        console.log("Zone cannot be deleted, showing warning toast:", data.message);
        toast.warning(data.message, { position: "top-right" });
        handleClose();
        return;
      }

      // Success case
      toast.success(data?.message || "Zone deleted successfully", { position: "top-right" });
      
      // Call success callback to update parent component
      if (onSuccess) {
        onSuccess(zone);
      }
      
      // Close modal
      handleClose();
      
    } catch (error) {
      console.error("Delete zone error:", error);
      const message = error?.message || "Failed to delete zone";
      setErrorMessage(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setErrorMessage("");
    setIsDeleting(false);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" size="md" className="delete-zone-mdl">
      <Modal.Header closeButton>
        <Modal.Title>Delete Zone</Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center delete-zone-body">
        <Image src={trashImage} alt="Trash Bin" className="delete-zone-image mb-3" />
        <h5 className="mt-2">Do you want to delete {zone?.zoneName ? ` "${zone.zoneName}"` : ""} Zone?</h5>
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="justify-content-center">
        <Button className="btn btn-primary btn-sm" variant="light" onClick={handleClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteZoneModal;

