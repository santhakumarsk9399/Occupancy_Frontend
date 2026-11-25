// import React, { useState } from 'react';
// import { Modal, Button, Form } from 'react-bootstrap';
// import axios from 'axios';

// const AddUserModal = ({ show, handleClose }) => {
//   const [formData, setFormData] = useState({
//     user: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     userType: '',
//     startOfWeek: '',
//     address: '',
//     receiveHealthMail: true,
//     camera: '',
//   });

//   const [errors, setErrors] = useState({});

//   const validate = () => {
//     let temp = {};

//     temp.user = formData.user ? '' : 'User name is required';
//     temp.email = /^\S+@\S+\.\S+$/.test(formData.email) ? '' : 'Email is not valid';
//     temp.password = formData.password ? '' : 'Password is required';
//     temp.confirmPassword =
//       formData.confirmPassword === formData.password ? '' : 'Passwords do not match';
//     temp.userType = formData.userType ? '' : 'User type is required';
//     temp.startOfWeek = formData.startOfWeek ? '' : 'Start of the week is required';
//     temp.camera = formData.camera ? '' : 'Camera selection is required';

//     setErrors(temp);
//     return Object.values(temp).every((x) => x === '');
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === 'checkbox' ? checked : value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     try {
//       // Replace with your actual endpoint
//       const response = await axios.post('https://your-api-url.com/users', formData);
//       alert('User added successfully!');
//       handleClose();
//     } catch (error) {
//       console.error(error);
//       alert('Error adding user.');
//     }
//   };

//   return (
//     <Modal show={show} onHide={handleClose}>
//       <Form onSubmit={handleSubmit}>
//         <Modal.Header closeButton>
//           <Modal.Title>Add User</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-2">
//             <Form.Label>User *</Form.Label>
//             <Form.Control
//               type="text"
//               name="user"
//               value={formData.user}
//               onChange={handleChange}
//               isInvalid={!!errors.user}
//             />
//             <Form.Control.Feedback type="invalid">{errors.user}</Form.Control.Feedback>
//           </Form.Group>

//           <Form.Group className="mb-2">
//             <Form.Label>Email *</Form.Label>
//             <Form.Control
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               isInvalid={!!errors.email}
//             />
//             <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
//           </Form.Group>

//           <Form.Group className="mb-2">
//             <Form.Label>Password *</Form.Label>
//             <Form.Control
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               isInvalid={!!errors.password}
//             />
//             <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
//           </Form.Group>

//           <Form.Group className="mb-2">
//             <Form.Label>Confirm Password *</Form.Label>
//             <Form.Control
//               type="password"
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               isInvalid={!!errors.confirmPassword}
//             />
//             <Form.Control.Feedback type="invalid">
//               {errors.confirmPassword}
//             </Form.Control.Feedback>
//           </Form.Group>

//           <Form.Group className="mb-2">
//             <Form.Label>User Type *</Form.Label>
//             <Form.Select
//               name="userType"
//               value={formData.userType}
//               onChange={handleChange}
//               isInvalid={!!errors.userType}
//             >
//               <option value="">Select</option>
//               <option>Admin</option>
//               <option>Manager</option>
//               <option>User</option>
//             </Form.Select>
//             <Form.Control.Feedback type="invalid">{errors.userType}</Form.Control.Feedback>
//           </Form.Group>

//           <Form.Group className="mb-2">
//             <Form.Label>Start of the Week *</Form.Label>
//             <Form.Select
//               name="startOfWeek"
//               value={formData.startOfWeek}
//               onChange={handleChange}
//               isInvalid={!!errors.startOfWeek}
//             >
//               <option value="">Select</option>
//               <option>Sunday</option>
//               <option>Monday</option>
//               <option>Saturday</option>
//             </Form.Select>
//             <Form.Control.Feedback type="invalid">
//               {errors.startOfWeek}
//             </Form.Control.Feedback>
//           </Form.Group>

//           <Form.Group className="mb-2">
//             <Form.Label>Address</Form.Label>
//             <Form.Control
//               as="textarea"
//               name="address"
//               value={formData.address}
//               onChange={handleChange}
//               rows={2}
//             />
//           </Form.Group>

//           <Form.Group className="mb-2">
//             <Form.Check
//               type="checkbox"
//               name="receiveHealthMail"
//               checked={formData.receiveHealthMail}
//               onChange={handleChange}
//               label="Receive Health Mail"
//             />
//           </Form.Group>

//           <Form.Group className="mb-2">
//             <Form.Label>Camera(s) *</Form.Label>
//             <Form.Select
//               name="camera"
//               value={formData.camera}
//               onChange={handleChange}
//               isInvalid={!!errors.camera}
//             >
//               <option value="">Select</option>
//               <option>Camera 1</option>
//               <option>Camera 2</option>
//               <option>Camera 3</option>
//             </Form.Select>
//             <Form.Control.Feedback type="invalid">{errors.camera}</Form.Control.Feedback>
//           </Form.Group>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleClose}>
//             Cancel
//           </Button>
//           <Button variant="primary" type="submit">
//             Save
//           </Button>
//         </Modal.Footer>
//       </Form>
//     </Modal>
//   );
// };

// export default AddUserModal;

import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import RequiredIcon from "../CommonComponents/RequiredIcon";
import Buttons from "../CommonComponents/Button";
import { FaPlus } from "react-icons/fa";
const AddUserFormikModal = ({ show, handleClose }) => {
  const validationSchema = Yup.object().shape({
    user: Yup.string()
      .min(3, "Minimum 3 characters")
      .max(20, "Maximum 20 characters")
      .required("User name is required"),
    // email: Yup.string()
    //   .email("Invalid email format")
    //   .required("Email is required"),

    email: Yup.string()
      .required("Email is required")
      //   .required('At least one email is required')
      .test("multiple-emails", "invalid email", (value) => {
        if (!value) return false;
        const emails = value
          .split(";")
          .map((e) => e.trim())
          .filter(Boolean);
        const emailRegex = /^\S+@\S+\.\S+$/;
        return emails.every((email) => emailRegex.test(email));
      }),

    password: Yup.string()
      .min(8, "Minimum 8 characters")
      .matches(/[a-z]/, "Must contain lowercase")
      .matches(/[A-Z]/, "Must contain uppercase")
      .matches(/\d/, "Must contain number")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
    userType: Yup.string().required("User type is required"),
    startOfWeek: Yup.string().required("Start of week is required"),
    address: Yup.string().max(200, "Max 200 characters"),
    camera: Yup.string().required("Please select a camera"),
    receiveHealthMail: Yup.boolean(),
  });

  const initialValues = {
    user: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "Admin",
    startOfWeek: "Sunday",
    address: "",
    receiveHealthMail: true,
    camera: "",
  };
 const [formData, setFormData] = useState({ name: '', email: '' });
  const [dataList, setDataList] = useState([]);

  // Load from localStorage on mount
useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userList')) || [];
    setDataList(storedData);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const updatedList = [...dataList, formData];
//     setDataList(updatedList);
//     localStorage.setItem('userList', JSON.stringify(updatedList));
//     setFormData({ name: '', email: '' });
//   };
  const handleSubmits = async (values, { setSubmitting, resetForm }) => {
           console.log("Form Data:", values);
    // try {
    //   console.log("Form Data:", values);
    //   // await axios.post('YOUR_API_ENDPOINT', values);
    //   alert("User added successfully");
    //   handleClose();
    //   resetForm();
    // } catch (error) {
    //   console.error(error);
    //   alert("Error submitting form");
    // } finally {
    //   setSubmitting(false);
    // }
  };
// const handleFormikSubmit = async (values, { setSubmitting, resetForm }) => {
//   try {
//     console.log("Form Data:", values);
//     alert("User added successfully");
//     resetForm();
//     handleClose();
//   } catch (error) {
//     console.error(error);
//     alert("Error submitting form");
//   } finally {
//     setSubmitting(false);
//   }
// };
  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="md"
      centered
      backdrop="static"
      keyboard={false}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        // onSubmit={handleSubmits}
         onSubmit={(values) => {
        console.log('Submitted:', values);
        alert(JSON.stringify(values, null, 2));
      }}
//        onSubmit={(values, { resetForm }) => {
//   console.log('Form submitted:', values);
//   resetForm();
//   handleClose(); // If you want to close modal
// }}
      >
        {({
          handleSubmit,
          handleChange,
          values,
          errors,
          touched,
          handleBlur,
        }) => (
          <Form onSubmit={handleSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>Add User</Modal.Title>
            </Modal.Header>
            <Modal.Body className="add_user_Body">
              {/* User */}

              <Row className="mb-3">
                <Form.Group as={Col} className="mb-2">
                  <Form.Label>
                    User <RequiredIcon />
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="user"
                    value={values.user}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.user && !!errors.user}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.user}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Email */}
                <Form.Group as={Col} className="mb-2">
                  <Form.Label>
                    Email <RequiredIcon />
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.email && !!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>

              <Row className="mb-3">
                {/* Password */}
                <Form.Group as={Col} className="mb-2">
                  <Form.Label>
                    Password <RequiredIcon />
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.password && !!errors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>
                {/* Confirm Password */}
                <Form.Group as={Col} className="mb-2">
                  <Form.Label>
                    Confirm Password <RequiredIcon />
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={
                      touched.confirmPassword && !!errors.confirmPassword
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
              <Row className="mb-3">
                {/* User Type */}
                <Form.Group as={Col} className="mb-2">
                  <Form.Label>User Type </Form.Label>
                  <Form.Select
                    name="userType"
                    value={values.userType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.userType && !!errors.userType}
                  >
                    {/* <option value="">Select</option> */}
                    <option >Admin</option>
                    <option>Operator</option>
                    <option>Viewer</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.userType}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Start of Week */}
                <Form.Group as={Col} className="mb-2">
                  <Form.Label>Start of the Week </Form.Label>
                  <Form.Select
                    name="startOfWeek"
                    value={values.startOfWeek}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.startOfWeek && !!errors.startOfWeek}
                  >
                    {/* <option value="">Select</option> */}
                    <option>Sunday</option>
                    <option>Monday</option>
                    {/* <option>Saturday</option> */}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.startOfWeek}
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
              {/* Address */}
              <Form.Group className="mb-2">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="address"
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.address && !!errors.address}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.address}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Receive Health Mail */}
              <Form.Group className="mb-2">
                <Form.Check
                  type="checkbox"
                  name="receiveHealthMail"
                  label="Receive Health Mail"
                  checked={values.receiveHealthMail}
                  onChange={handleChange}
                />
              </Form.Group>

              {/* Camera */}
              {/* <Form.Group className="mb-2">
                <Form.Label>Camera(s) *</Form.Label>
                <Form.Select
                  name="camera"
                  value={values.camera}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.camera && !!errors.camera}
                >
                  <option value="">Select</option>
                  <option>Camera 1</option>
                  <option>Camera 2</option>
                  <option>Camera 3</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.camera}
                </Form.Control.Feedback>
              </Form.Group> */}
            </Modal.Body>
            <Modal.Footer className="modal_footer">
              <Button
                className="footer_cancel_btn"
                variant="secondary"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                className="footer_save_btn"
                variant="primary"
                type="submit"
              >
                Save
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default AddUserFormikModal;
