import React, { useState } from 'react';
import { Modal, Button, Image, Toast } from 'react-bootstrap';
import trashImage from '../../Components/Assets/trash.png';
import Loader from '../CommonComponents/Loader'; // assuming this exists
import axios from 'axios';
import { showError, showSuccess } from '../CommonComponents/Toaster';
const DeleteVendor = ({ show, handleClose, vendor, onDelete }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("token");
  const MainUsername = sessionStorage.getItem("username");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
        const deletePayload = {
            vendorname: vendor?.VendorName ,
            username: MainUsername,
            selected: "Delete"
      };

      const response = await axios.post(
          `${API_URL}/licensing/createEditDelete`,
        deletePayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(response.data ? response.data?.message[0].Message : "Vendor Deleted Successfully")
      // showSuccess(response.data ? response.data?.message[0].Message : "Vendor Deleted Successfully");
      showSuccess("Vendor Deleted Successfully");
      onDelete(response);
      handleClose();
    } catch (error) {
      console.error("Delete error:", error);
      showError (error ? error:"Something Went Wrong !")
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Modal
      show={show}
      onHide={loading ? null : handleClose}
      centered
      backdrop="static"
      keyboard={!loading}
      size="md"
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title>Delete Vendor</Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center delete_Modal_body">
        <Image
          src={trashImage}
          alt="Trash Bin"
          style={{ width: '152px', height: '200px' }}
          className="mb-3"
        />
        <h5 className="pb-2 pt-3">
          Do you want to delete <strong>"{vendor?.VendorName}"</strong> Vendor?
        </h5>

        <Modal.Footer className="justify-content-center border-0 pb-0">
          <Button
            variant="primary btn-sm"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary btn-sm delete"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>

        {/* Loader appears below the buttons */}
        {loading && (
          <div className="mt-3">
            <Loader />
          </div>
        )}
      </Modal.Body>
      </Modal>
    </>
  );
};

export default DeleteVendor;
