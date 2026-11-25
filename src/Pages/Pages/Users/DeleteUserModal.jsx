// import React from 'react'
// import { Modal, Button, Image } from 'react-bootstrap';
// import trashImage from '../../Components/Assets/trash.png'; // adjust path accordingly
// import Loader from '../CommonComponents/Loader';
// import axios from 'axios';
// const DeleteUserModal = ({ show, onClose, user, onDelete }) => {
//   const API_URL = import.meta.env.VITE_API_URL; // API main url
//   const token = sessionStorage.getItem("token"); // token
//   const MainUsername = sessionStorage.getItem("username"); // username

//   const handleDelete = async () => {
//     try {
//       let delteuser = user?.username;
//       let deletePayload = {
//         username: delteuser,
//         mainusername: MainUsername,
//       };
//       console.log(token);
//       console.log(deletePayload);
//       let response = await axios.post(
//         `${API_URL}/settings/users/deleteUser`,
//         deletePayload,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       console.log(token);
//       console.log(response);
//       onClose();
//       onDelete(response);
//     } catch (error) {
//       console.log(error);
//     }
//   };
//   // console.log(user)
//   return (
//     <Modal
//       show={show}
//       onHide={onClose}
//       centered
//       backdrop="static"
//       keyboard={false}
//       size="md"
//     >
//       <Modal.Header closeButton>
//         <Modal.Title>Delete User</Modal.Title>
//       </Modal.Header>

//       <Modal.Body className="text-center delete_Modal_body">
//         <Image
//           src={trashImage}
//           alt="Trash Bin"
//           style={{ width: '800', height: '200px' }}
//           className="mb-3"
//         />
//         <h5 class="pb-2 pt-3">Do you want to delete <strong>"{user?.username}"</strong> User?</h5>
//         <div className='loaderSection'>
//           {/* <Loader /> */}
//         </div>
        
//        <Modal.Footer className="justify-content-center border-0 pb-0">
//           <Button variant="primary btn-sm" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button variant="primary btn-sm delete" onClick={handleDelete}>
//             Delete
//           </Button>
//       </Modal.Footer>

//       </Modal.Body>

     

//     </Modal>
//   );
// };

// export default DeleteUserModal;

import React, { useState } from 'react';
import { Modal, Button, Image } from 'react-bootstrap';
import trashImage from '../../Components/Assets/trash.png';
import Loader from '../CommonComponents/Loader'; // assuming this exists
import axios from 'axios';
import { showSuccess } from "../CommonComponents/Toaster";

const DeleteUserModal = ({ show, handleClose, user, onDelete }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("token");
  const MainUsername = sessionStorage.getItem("username");
//  console.log(selectedUser)
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const deletePayload = {
        username: user?.username,
        mainusername: MainUsername,
      };

      const response = await axios.post(
        `${API_URL}/settings/users/deleteUser`,
        deletePayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showSuccess(response.data ?response.data?.message+"!!!":"User Deleted Successfully");
      onDelete(response);
      handleClose();
    } catch (error) {
      console.error("Delete error:", error);
      showError(error?error:"Something Went Wrong !")
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={loading ? null : handleClose}
      centered
      backdrop="static"
      keyboard={!loading}
      size="md"
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title>Delete User</Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center delete_Modal_body">
        <Image
          src={trashImage}
          alt="Trash Bin"
          style={{ width: '152px', height: '200px' }}
          className="mb-3"
        />
        <h5 className="pb-2 pt-3">
          Do you want to delete <strong>"{user?.username}"</strong> User?
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
  );
};

export default DeleteUserModal;
