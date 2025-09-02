import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import "../../Components/Styles/UsersPage.css";

// Tooltip Component
const InfoTooltip = ({ id, children }) => (
  <OverlayTrigger
    placement="top"
    overlay={<Tooltip id={id}>{children}</Tooltip>}
    delay={{ show: 150, hide: 100 }}
  >
    <span
      role="img"
      aria-label="info"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 4,
        width: 14,
        height: 14,
        borderRadius: "50%",
        border: "1px solid #6c757d",
        fontSize: 10,
        lineHeight: 1,
        cursor: "help",
        userSelect: "none",
      }}
    >
      i
    </span>
  </OverlayTrigger>
);

const EditProfile = ({
  show,
  handleClose,
  onSave,
  editingUser,
  selectedMainuser,
  isSaving,
}) => {
  const [profileData, setProfileData] = useState({});
  const [allZones, setAllZones] = useState([]);
  const [mappedZones, setAllMappedZones] = useState([]);

  useEffect(() => {
    if (
      Array.isArray(selectedMainuser?.user) &&
      selectedMainuser.user.length > 0
    ) {
      setProfileData(selectedMainuser.user[0]);
      if (Array.isArray(selectedMainuser?.mappedZones)) {
        setAllMappedZones(selectedMainuser.mappedZones);
      }
      if (Array.isArray(selectedMainuser?.allZones)) {
        setAllZones(selectedMainuser.allZones);
      }
    }
  }, [selectedMainuser]);

  const RequiredIcon = () => <span style={{ color: "red" }}> *</span>;

  const getInitialValues = () => ({
    username: profileData?.username || "",
    useremailid: profileData?.useremailid || "",
    password: profileData?.password || "",
    confirmPassword: profileData?.password || "",
    usertype: profileData?.usertype || "",
    selectedZones:
      mappedZones.map((z) => ({
        label: z.zonename,
        value: z.sl,
      })) || [],
    useraddress: profileData?.address || "",
    receiveHealthMail:
      profileData?.healthMail === true || profileData?.healthMail === "true",
  });

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,20}$/;

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .matches(/^\S+$/, "Username cannot contain spaces")
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters")
      .required("User name is required"),

  useremailid: Yup.string()
    .required("Email is required")
    .test(
      "no-spaces",
      "Spaces are not allowed",
      (value) => {
        if (!value) return false;
        return !/\s/.test(value); 
      }
    )
    .test(
      "valid-emails",
      "Enter valid email addresses separated by semicolons",
      (value) => {
        if (!value) return false;
  
        const emails = value.split(";").map((e) => e.trim()).filter(Boolean);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
        return (
          emails.length > 0 &&
          emails.every((email) => emailRegex.test(email))
        );
      }
    )
    .test(
      "no-duplicates",
      "Duplicate emails are not allowed",
      (value) => {
        if (!value) return true;
  
        const emails = value
          .split(";")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);
  
        const unique = new Set(emails);
        return emails.length === unique.size;
      }
    ),

    password: Yup.string()
      .matches(
        passwordRegex,
        "Use 6–20 characters with a letter, number, and symbol."
      )
      .matches(/^\S+$/, "Password cannot contain spaces")
      .required("Password is required"),

    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm Password is required"),

    useraddress: Yup.string().max(100, "Address can be at most 100 characters"),
  });

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      dialogClassName="user-edit-modal"
    >
      <Formik
        initialValues={getInitialValues()}
        validationSchema={validationSchema}
        enableReinitialize={true}
        onSubmit={async (values, { resetForm }) => {
          await onSave(values);
          resetForm();
          handleClose();
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          values,
          errors,
          touched,
        }) => (
          <Form noValidate onSubmit={handleSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>
                {profileData ? "Edit Profile" : "Add Profile"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Form.Group as={Col} className="mb-3 user">
                  <Form.Label>
                    User Name <RequiredIcon />
                    <InfoTooltip id="tt-username">
                      <div>
                        • Username should contain 3 to 20 characters
                        <br />• It should not accept spaces
                      </div>
                    </InfoTooltip>
                  </Form.Label>
                  <Form.Control
                    name="username"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.username && !!errors.username}
                    disabled={!!profileData}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} className="mb-3 user">
                  <Form.Label>
                    Email <RequiredIcon />
                    <InfoTooltip id="tt-email">
                      <div>
                        • Enter one or more emails
                        <br />• Separate multiple emails with a semicolon (;)
                      </div>
                    </InfoTooltip>
                  </Form.Label>
                  <Form.Control
                    name="useremailid"
                    value={values.useremailid}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.useremailid && !!errors.useremailid}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.useremailid}
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>

              <Row>
                <Form.Group as={Col} className="mb-3 user">
                  <Form.Label>
                    Password <RequiredIcon />
                    <InfoTooltip id="tt-password">
                           <div>
                              • It must be 6–20 characters
                        <br />• It should contains atleast one aplhanumeric and special characters
                        <br />• It should not accept spaces
                      </div>
                    </InfoTooltip>
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

                <Form.Group as={Col} className="mb-3 user">
                  <Form.Label>
                    Confirm Password <RequiredIcon />
                    <InfoTooltip id="tt-confirm">
                      <div>• Must match with the Password</div>
                    </InfoTooltip>
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

              <Form.Group className="mb-1 useredit">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="useraddress"
                  value={values.useraddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.useraddress && !!errors.useraddress}
                />
                <div className="d-flex justify-content-between mt-1">
                  <small className="text-muted"></small>
                  <small className="text-muted">
                    {values.useraddress?.length || 0}/100
                  </small>
                </div>
                <Form.Control.Feedback type="invalid">
                  {errors.useraddress}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3 user">
                <Form.Check
                  type="checkbox"
                  name="receiveHealthMail"
                  label="Receive Health Mail"
                  checked={values.receiveHealthMail}
                  onChange={(e) =>
                    setFieldValue("receiveHealthMail", e.target.checked)
                  }
                />
              </Form.Group>
            </Modal.Body>

            <Modal.Footer className="d-flex flex-column align-items-center">
              <div className="d-flex gap-2">
                <Button
                  variant="primary btn-sm"
                  onClick={handleClose}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary btn-sm actv"
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <> {profileData ? "Updating..." : "Saving..."}</>
                  ) : profileData ? (
                    "Update"
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
              {isSaving && (
                <div className="mt-2">
                  <span
                    className="spinner-border text-primary"
                    role="status"
                    style={{ width: "1.5rem", height: "1.5rem" }}
                  ></span>
                </div>
              )}
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default EditProfile;
