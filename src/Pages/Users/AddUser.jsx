import React from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import MultiSelectDropdown from "../CommonComponents/MultiSelectDropDown";
import SingleSelectDropdown from "../CommonComponents/SingleSelectDropdown";
import "../../Components/Styles/UsersPage.css";

/**
 * Reusable tiny info icon that shows a tooltip on hover.
 */
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

const UserFormModal = ({
  show,
  handleClose,
  onSave,
  editingUser,
  Zones,
  userdata,
  isSaving,
}) => {
  const role = sessionStorage.getItem("role");

  const RequiredIcon = () => <span style={{ color: "red" }}> *</span>;

  let userTypes;
  if (role === "Admin") {
    userTypes = [
      { label: "Operator", value: "Operator" },
      { label: "Viewer", value: "Viewer" },
    ];
  } else if (role === "Operator") {
    userTypes = [{ label: "Viewer", value: "Viewer" }];
  } else {
    userTypes = [];
  }

  const safeMappedZones = Array.isArray(userdata?.mappedZones)
    ? userdata.mappedZones
    : [];

  const getInitialValues = () => ({
    username: editingUser?.username || "",
    useremailid: editingUser?.useremailid || "",
    password: editingUser?.password || "",
    confirmPassword: editingUser?.password || "",
    usertype:
      editingUser?.usertype || (userTypes.length > 0 ? userTypes[0].value : ""),
    selectedZones: editingUser
      ? Zones.filter((zone) =>
          safeMappedZones.some((z) => z.zonename === zone.label)
        )
      : [],
    useraddress: editingUser?.address || "",
    receiveHealthMail:
      editingUser?.healthMail === true || editingUser?.healthMail === "true",
    userblock:
      editingUser?.userBlock === true || editingUser?.userBlock === "true",
  });

  // Regex: at least one letter, one number, one special char; total length 6-20.
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,20}$/;

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .matches(/^\S+$/, "Username cannot contain spaces")
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters")
      .required("Username is required"),

    useremailid: Yup.string()
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

    selectedZones: Yup.array().min(1, "Select at least one zone"),

    useraddress: Yup.string().max(100, "Address can be at most 100 characters"),
  });

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      size="md"
      dialogClassName="custom-user-modal"
    >
      <Formik
        initialValues={getInitialValues()}
        validationSchema={validationSchema}
        enableReinitialize={true}
        onSubmit={async (values, { resetForm }) => {
          const payload = {
            ...values,
            username: values.username.trim(),
            useraddress: values.useraddress?.trim() || "",
          };

          try {
            const response = await onSave(payload);

            // ✅ Only close modal if API returns success: true
            if (response?.success) {
              resetForm();
              handleClose();
            }
          } catch (error) {
            console.error("Error saving user:", error);
          }
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
                {editingUser ? "Edit User" : "Add User"}
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Row>
                <Form.Group as={Col} className="mb-3 user">
                  <Form.Label>
                    User Name
                    <RequiredIcon />
                    <InfoTooltip id="tt-username">
                      <div>
                        {" "}
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
                    disabled={!!editingUser}
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
                        <br />• It should contains atleast one aplhanumeric and
                        special characters
                        <br />• It should not accept spaces
                      </div>
                    </InfoTooltip>
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    autoComplete="new-password"
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
                    autoComplete="new-password"
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

              <Row>
                <Form.Group as={Col} className="mb-3 user">
                  <Form.Label>User Type</Form.Label>
                  <SingleSelectDropdown
                    options={userTypes}
                    value={
                      userTypes.find((opt) => opt.value === values.usertype) ||
                      null
                    }
                    onChange={(selected) =>
                      setFieldValue("usertype", selected?.value || "")
                    }
                    isInvalid={touched.usertype && !!errors.usertype}
                  />
                  {touched.usertype && errors.usertype && (
                    <div className="invalid-feedback d-block">
                      {errors.usertype}
                    </div>
                  )}
                </Form.Group>

                <Form.Group as={Col} className="mb-3 user">
                  <Form.Label>
                    Zones <RequiredIcon />
                  </Form.Label>
                  <MultiSelectDropdown
                    className="multi-select-container"
                    options={Zones}
                    value={values.selectedZones}
                    placeholder="Select Zones"
                    onChange={(selected) =>
                      setFieldValue("selectedZones", selected)
                    }
                  />
                  {touched.selectedZones && errors.selectedZones && (
                    <div className="invalid-feedback d-block">
                      {errors.selectedZones}
                    </div>
                  )}
                </Form.Group>
              </Row>

              <Form.Group className="mb-1 user">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="useraddress"
                  maxLength={100}
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

              <Row className="mt-2">
                <Form.Group as={Col} className="mb-3 user">
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
                {editingUser && (
                  <Form.Group as={Col} className="mb-3 user">
                    <Form.Check
                      type="checkbox"
                      name="userblock"
                      label="User Block"
                      checked={!!values.userblock}
                      onChange={(e) =>
                        setFieldValue("userblock", e.target.checked)
                      }
                    />
                  </Form.Group>
                )}
              </Row>
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
                    <>{editingUser ? "Updating..." : "Saving..."}</>
                  ) : editingUser ? (
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

export default UserFormModal;
