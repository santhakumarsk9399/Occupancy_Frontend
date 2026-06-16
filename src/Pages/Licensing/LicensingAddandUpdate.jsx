import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Row, Col, InputGroup } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { FaGlobe, FaEye, FaEyeSlash } from "react-icons/fa";
import MapPickerModal from "./MapPicker";
import axios from "axios";
import Loader from "../CommonComponents/Loader";

const LicensingVendorFormModal = ({
    show,
    handleClose,
    onSave,
    editingVendor,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;
    const token = sessionStorage.getItem("token");
    const formikRef = useRef(null);
    const RequiredIcon = () => <span style={{ color: "red" }}> *</span>;


    const formatDateForInput = (date) => {
        if (!date) return "";
        return new Date(date).toISOString().split("T")[0];
    };
    //------------------------------validity min and max date------------------------------//
    const today = new Date().toISOString().split("T")[0]; // min date

    //---------------------------------fetch vendors data---------------------------------//
    const fetchVendorKey = async () => {
        try {
            const res = await axios.get(
                `${API_URL}/licensing/vendorkey`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Adjust key based on backend response
            const vendorKey =
                res.data?.vendorkey ||
                res.data?.VendorKey ||
                res.data?.data ||
                res.data;

            formikRef.current?.setFieldValue("vendorKey", vendorKey);
        } catch (err) {
            console.error("Vendor key generation failed", err);
        }
    };

    /* ---------------- MODAL OPEN EFFECT ---------------- */
    useEffect(() => {
        if (show && !editingVendor) {
            fetchVendorKey();
        }
    }, [show]);
    useEffect(() => {
        if (show) {
            setShowPassword(false); // always hide password on open
        }
    }, [show, editingVendor]);
      
    /* ---------------- INITIAL VALUES ---------------- */
    const initialValues = {
        vendorName: editingVendor?.vendor?.VendorName || "",
        vendorKey: editingVendor?.vendor?.VendorKey || "",
        noOfUnits: editingVendor?.vendor?.NoOfUnits ?? "",
        noOfUsers: editingVendor?.vendor?.NoOfUsers ?? "",
        validity: editingVendor?.vendor?.Validity
            ? formatDateForInput(editingVendor.vendor.Validity)
            : today,
        systemKey: editingVendor?.vendor?.SystemKey || "",

        latitude: editingVendor?.vendor?.latitude || "",
        longitude: editingVendor?.vendor?.longitude || "",

        username: editingVendor?.user?.UserName || "",
        userEmail: editingVendor?.user?.UserEmailID || "",
        userPassword: editingVendor?.user?.UserPass || "",
        userAddress: editingVendor?.user?.UserAddress || "",

        remarks: editingVendor?.vendor?.Remarks || "",
        healthMail:
            editingVendor?.user?.HealthMail === true ||
            editingVendor?.user?.HealthMail === 1 ||
            editingVendor?.user?.HealthMail === "1",
    };


//---------------------------Field Validation---------------------------------//
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,20}$/;
    const validationSchema = Yup.object({
        vendorName: Yup.string().required("Vendor Name is required")
            .min(2, "Vendor Name must be at least 2 characters")
            .max(20, "Vendor Name cannot exceed 50 characters"),
        vendorKey: Yup.string().required("Vendor Key is required"),
        noOfUnits: Yup.number()
            .typeError("Only numbers allowed")
            .required("No of Units is required")
            .min(1, "Minimum 1 unit required")
            .max(200, "Maximum 200 units allowed"),

        noOfUsers: Yup.number()
            .typeError("Only numbers allowed")
            .required("No of Users is required")
            .min(1, "Minimum 1 user required")
            .max(100, "Maximum 100 users allowed"),

        validity: Yup.date()
            .typeError("Invalid date")
            .required("Validity is required")
            .min(
                new Date(new Date().setHours(0, 0, 0, 0)),
                "Validity date must be today or a future date"
            ),
          

        latitude: Yup.number()
            .transform((value, originalValue) =>
                originalValue === "" ? undefined : value
            )
            .typeError("Latitude must be a number")
            .min(-90, "Latitude must be between -90 and 90")
            .max(90, "Latitude must be between -90 and 90")
            .required("Latitude is required"),

        longitude: Yup.number()
            .transform((value, originalValue) =>
                originalValue === "" ? undefined : value
            )
            .typeError("Longitude must be a number")
            .min(-180, "Longitude must be between -180 and 180")
            .max(180, "Longitude must be between -180 and 180")
            .required("Longitude is required"),

        // username: Yup.string().required("Username is required"),

        // userEmail: Yup.string()
        //     .email("Invalid email")
        //     .required("User Email is required"),

        // userPassword: Yup.string().required("Password is required"),
         username: Yup.string()
              .matches(/^\S+$/, "Username cannot contain spaces")
              .min(3, "Username must be at least 3 characters")
              .max(20, "Username cannot exceed 20 characters")
              .required("Username is required"),
        
              userEmail: Yup.string()
              .required("Email is required")
              .test("no-spaces", "Spaces are not allowed", (value) => {
                if (!value) return false;
                return !/\s/.test(value);
              })
              .test(
                "valid-emails",
                "Enter valid email addresses separated by semicolons",
                (value) => {
                  if (!value) return false;
                  const emails = value
                    .split(";")
                    .map((e) => e.trim())
                    .filter(Boolean);
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  return (
                    emails.length > 0 && emails.every((email) => emailRegex.test(email))
                  );
                }
              )
              .test("no-duplicates", "Duplicate emails are not allowed", (value) => {
                if (!value) return true;
                const emails = value
                  .split(";")
                  .map((e) => e.trim().toLowerCase())
                  .filter(Boolean);
                const unique = new Set(emails);
                return emails.length === unique.size;
              }),
        
              userPassword: Yup.string()
              .matches(
                passwordRegex,
                "Use 6–20 characters with a letter, number, and symbol."
              )
              .matches(/^\S+$/, "Password cannot contain spaces")
              .required("Password is required"),
        

        userAddress: Yup.string().max(250),
        remarks: Yup.string().max(250),
    });


    //-----------------------------------langitude and latitude validation-------------------//
    
    const handleLatLngChange = (e, fieldName, setFieldValue) => {
        let value = e.target.value;

        // Allow only numbers and dot
        value = value.replace(/[^0-9.]/g, "");

        // Allow only ONE dot
        const parts = value.split(".");
        if (parts.length > 2) {
            value = parts[0] + "." + parts.slice(1).join("");
        }

        setFieldValue(fieldName, value);
    };
    return (
        <Modal
            show={show}
            onHide={loading ? null : handleClose}
            centered
            backdrop="static"
            keyboard={!loading}
            size="lg"
            scrollable
        >
            <Formik
                innerRef={formikRef}
                initialValues={initialValues}
                validationSchema={validationSchema}
                enableReinitialize={!!editingVendor}
                validateOnBlur={true}
                validateOnChange={true}
                onSubmit={async (values, { setTouched, validateForm }) => {
                    const errors = await validateForm();

                    if (Object.keys(errors).length > 0) {
                        const touchedFields = {};
                        Object.keys(errors).forEach((key) => {
                            touchedFields[key] = true;
                        });
                        setTouched(touchedFields);
                        return;
                    }

                    setLoading(true);
                    try {
                        // if (editingVendor) {
                        //     // await onSave(values);
                        //     await onSave({
                        //         ...values,
                        //         noOfUnits: Number(values.noOfUnits),
                        //         noOfUsers: Number(values.noOfUsers),
                        //       });
                        //     handleClose();
                        //     return;
                        // }

                        const payload = {
                            vendorname: values.vendorName,
                            vendorkey: values.vendorKey,
                            noofunits: values.noOfUnits,
                            noofusers: values.noOfUsers,
                            validity: values.validity,
                        };

                        const res = await axios.post(
                            `${API_URL}/licensing/encryptedSystemKey`,
                            payload,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        const systemKey =
                            res.data?.systemKey || res.data?.encryptedKey;

                        await onSave({
                            ...values,
                            systemKey,
                        });

                    } catch (err) {
                        console.error("Add / Update vendor failed", err);
                    } finally {
                        setLoading(false);
                      }
                }}
            >
                {({
                    handleSubmit,
                    handleChange,
                    values,
                    errors,
                    touched,
                    setFieldValue,
                }) => (
                    <>
                        <MapPickerModal
                            show={showMap}
                            latitude={values.latitude}
                            longitude={values.longitude}
                            onClose={() => setShowMap(false)}
                            onConfirm={(lat, lng) => {
                                setFieldValue("latitude", lat);
                                setFieldValue("longitude", lng);
                                setShowMap(false);
                            }}
                        />

                        <Form noValidate onSubmit={handleSubmit}>
                            <Modal.Header closeButton={!loading}>
                                <Modal.Title>
                                    {editingVendor ? "Edit Vendor License" : "Add Vendor License"}
                                </Modal.Title>
                            </Modal.Header>

                         <Modal.Body className="px-5 py-3"> 
                                {/* VENDOR */}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Vendor Name <RequiredIcon /></Form.Label>
                                            <Form.Control
                                                name="vendorName"
                                                value={values.vendorName}
                                                onChange={handleChange}
                                                disabled={!!editingVendor}
                                                isInvalid={touched.vendorName && errors.vendorName}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.vendorName}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Vendor Key</Form.Label>
                                            <Form.Control
                                                name="vendorKey"
                                                value={values.vendorKey}
                                                disabled
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* COUNTS */}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>No of Units <RequiredIcon /></Form.Label>
                                            <Form.Control
                                                name="noOfUnits"
                                                value={values.noOfUnits}
                                                onChange={(e) =>
                                                    setFieldValue(
                                                        "noOfUnits",
                                                        e.target.value.replace(/\D/g, "")
                                                    )
                                                }
                                                isInvalid={touched.noOfUnits && errors.noOfUnits}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.noOfUnits}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>No of Users <RequiredIcon /></Form.Label>
                                            <Form.Control
                                                name="noOfUsers"
                                                value={values.noOfUsers}
                                                onChange={(e) =>
                                                    setFieldValue(
                                                        "noOfUsers",
                                                        e.target.value.replace(/\D/g, "")
                                                    )
                                                }
                                                isInvalid={touched.noOfUsers && errors.noOfUsers}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.noOfUsers}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                    </Col>
                                </Row>
                                {/* USER */}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Username <RequiredIcon /></Form.Label>
                                            <Form.Control
                                                name="username"
                                                value={values.username}
                                                disabled={!!editingVendor}
                                                onChange={handleChange}
                                                isInvalid={touched.username && errors.username}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.username}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Password <RequiredIcon /></Form.Label>

                                            <InputGroup hasValidation>
                                                <Form.Control
                                                    type={showPassword ? "text" : "password"}
                                                    name="userPassword"
                                                    value={values.userPassword}
                                                    onChange={handleChange}
                                                    disabled={!!editingVendor}
                                                    isInvalid={touched.userPassword && !!errors.userPassword}
                                                />

                                                <InputGroup.Text
                                                    role="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                </InputGroup.Text>

                                                <Form.Control.Feedback type="invalid">
                                                    {errors.userPassword}
                                                </Form.Control.Feedback>
                                            </InputGroup>
                                        </Form.Group>

                                    </Col>
                                </Row>


                                {/* VALIDITY + SYSTEM KEY */}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>User Email <RequiredIcon /></Form.Label>
                                            <Form.Control
                                                name="userEmail"
                                                value={values.userEmail}
                                                onChange={handleChange}
                                                disabled={!!editingVendor}
                                                isInvalid={touched.userEmail && errors.userEmail}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.userEmail}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Validity <RequiredIcon /></Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="validity"
                                                value={values.validity}
                                                onChange={handleChange}
                                                min={today}
                                                isInvalid={touched.validity && errors.validity}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.validity}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                {/* LOCATION */}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Latitude <RequiredIcon /></Form.Label>

                                            <InputGroup hasValidation>
                                                <Form.Control
                                                    name="latitude"
                                                    value={values.latitude}
                                                    onChange={(e) =>
                                                        handleLatLngChange(e, "latitude", setFieldValue)
                                                    }
                                                    isInvalid={touched.latitude && !!errors.latitude}
                                                />


                                                <InputGroup.Text role="button" onClick={() => setShowMap(true)}>
                                                    <FaGlobe />
                                                </InputGroup.Text>

                                                <Form.Control.Feedback type="invalid">
                                                    {errors.latitude}
                                                </Form.Control.Feedback>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    {/* <RequiredIcon /> */}
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Longitude <RequiredIcon /></Form.Label>

                                            <InputGroup hasValidation>
                                                <Form.Control
                                                    name="longitude"
                                                    value={values.longitude}
                                                    onChange={(e) =>
                                                        handleLatLngChange(e, "longitude", setFieldValue)
                                                    }
                                                    isInvalid={touched.longitude && !!errors.longitude}
                                                />


                                                <InputGroup.Text role="button" onClick={() => setShowMap(true)}>
                                                    <FaGlobe />
                                                </InputGroup.Text>

                                                <Form.Control.Feedback type="invalid">
                                                    {errors.longitude}
                                                </Form.Control.Feedback>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                {editingVendor && <Form.Group className="mb-3">
                                    <Form.Label>System Key </Form.Label>
                                    <Form.Control
                                        name="systemKey"
                                        value={values.systemKey}
                                        placeholder="auto generated"
                                        disabled
                                    />
                                </Form.Group>}
                                <Form.Group className="mb-3">
                                    <Form.Label>User Address</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        name="userAddress"
                                        value={values.userAddress}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Remarks</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        name="remarks"
                                        value={values.remarks}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                {/* <Form.Check
                                    type="checkbox"
                                    label="Receive Health Mail"
                                    checked={values.healthMail}
                                    onChange={(e) =>
                                        setFieldValue("healthMail", e.target.checked)
                                    }
                                /> */}
                            </Modal.Body>

                            {/* <Modal.Footer className="justify-content-center">
                                <Button
                                    variant="secondary"
                                    onClick={handleClose}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={loading}
                                >
                                    {editingVendor ? "Update" : "Save"}
                                </Button>
                            </Modal.Footer> */}
                            <Modal.Footer className="d-flex flex-column align-items-center">
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="primary btn-sm"
                                        onClick={handleClose}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary btn-sm actv"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>{editingVendor ? "Updating..." : "Saving..."}</>
                                        ) : editingVendor ? (
                                            "Update"
                                        ) : (
                                            "Save"
                                        )}
                                    </Button>
                                </div>
                                {loading && (
                                    <div className="mt-2">
                                        <span
                                            className="spinner-border text-primary"
                                            role="status"
                                            style={{ width: "1.5rem", height: "1.5rem" }}
                                        ></span>
                                    </div>
                                )}
                            </Modal.Footer>
                            {/* 🔥 LOADER – BOTTOM CENTER (LIKE DELETE MODAL) */}
                            {/* {loading && (
                                <div className="text-center pb-3">
                                    <Loader />
                                </div>
                            )} */}
                        </Form>
                    </>
                )}
            </Formik>
        </Modal>
    );
};

export default LicensingVendorFormModal;
