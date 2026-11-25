import React from "react";
import { Modal, Button } from "react-bootstrap";
import "../../Components/Styles/Logout.css";
import logoutIcon from "../../Components/Assets/logout_icon.png";

const Logout = ({ show, handleClose, handleLogout }) => {
  return (
    <Modal show={show} onHide={handleClose} centered className="custom-modal"   backdrop="static"  closeButton>
      {/* <Modal.Header >
        <Modal.Title>Add User</Modal.Title>
      </Modal.Header> */}
      <Modal.Body className="text-center">
        <div class="logout-cnt"><img src={logoutIcon} alt="Logout" className="logout-icon mb-3" /></div>
        <h4 className="mb-4 pb-1">Do you want to Logout ?</h4>
        <div className="d-flex justify-content-center gap-3 pb-2">
          <Button variant="btn btn-primary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary logout-btn" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default Logout;
