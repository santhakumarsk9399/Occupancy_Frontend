import React from "react";
import { Modal, Button, Form, Col } from "react-bootstrap";
import { Formik } from "formik";

import MultiSelectDropdown
    from "../../CommonComponents/MultiSelectDropDown";

import "../../../Components/Styles/Common.css";

function HeatmapCascadeFilter({

    show,
    onClose,
    onSave,
    mallsData,
    floorsData,
    zonesData,

    selectedMallsData = [],
    selectedFloorsData = [],
    selectedZonesData = [],

}) {

    const initialValues = {

        malls: selectedMallsData.map(
            ({ value, label }) => ({
                value: String(value),
                label,
            })
        ),

        floors: selectedFloorsData.map(
            ({ value, label }) => ({
                value: String(value),
                label,
            })
        ),

        zones: selectedZonesData.map(
            ({ value, label }) => ({
                value: String(value),
                label,
            })
        ),

    };

    return (

        <Modal
            show={show}
            onHide={onClose}
            size="md"
            centered
            backdrop="static"
            dialogClassName="dashfilter-pop"
        >

            <Formik

                key={JSON.stringify(initialValues)}

                enableReinitialize

                initialValues={initialValues}

                onSubmit={(values) =>
                    onSave(values)
                }

            >

                {({
                    values,
                    setFieldValue,
                    handleSubmit,
                    touched,
                    errors,
                }) => {

                    // =====================================
                    // MALL CHANGE
                    // =====================================

                    const onMallChange = (malls) => {

                        setFieldValue(
                            "malls",
                            malls
                        );

                        const selectedMallIds =
                            malls.map((m) => m.value);

                        const autoFloors =
                            floorsData.filter((f) =>
                                selectedMallIds.includes(
                                    f.mallId
                                )
                            );

                        setFieldValue(
                            "floors",
                            autoFloors
                        );

                        const selectedFloorIds =
                            autoFloors.map((f) => f.value);

                        const autoZones =
                            zonesData.filter((z) =>
                                selectedFloorIds.includes(
                                    z.floorId
                                )
                            );

                        setFieldValue(
                            "zones",
                            autoZones
                        );

                    };

                    // =====================================
                    // FLOOR CHANGE
                    // =====================================

                    const onFloorChange = (floors) => {

                        setFieldValue(
                            "floors",
                            floors
                        );

                        const selectedFloorIds =
                            floors.map((f) => f.value);

                        const autoZones =
                            zonesData.filter((z) =>
                                selectedFloorIds.includes(
                                    z.floorId
                                )
                            );

                        setFieldValue(
                            "zones",
                            autoZones
                        );

                    };

                    // =====================================
                    // ZONE CHANGE
                    // =====================================

                    const onZoneChange = (zones) => {

                        setFieldValue(
                            "zones",
                            zones
                        );

                    };

                    return (

                        <>

                            <Modal.Header closeButton>

                                <Modal.Title>
                                    Filters
                                </Modal.Title>

                            </Modal.Header>

                            <Modal.Body>

                                {/* MALL */}

                                <Form.Group
                                    as={Col}
                                    className="mb-3"
                                >

                                    <Form.Label>
                                        Mall
                                    </Form.Label>

                                    <MultiSelectDropdown

                                        options={mallsData}

                                        value={values.malls}

                                        onChange={onMallChange}

                                        placeholder={
                                            values.malls.length
                                                ? `${values.malls.length} Selected`
                                                : "Select Mall"
                                        }

                                        isInvalid={
                                            touched.malls &&
                                            !!errors.malls
                                        }

                                        error={errors.malls}

                                    />

                                </Form.Group>

                                {/* FLOOR */}

                                <Form.Group
                                    as={Col}
                                    className="mb-3"
                                >

                                    <Form.Label>
                                        Floor
                                    </Form.Label>

                                    <MultiSelectDropdown

                                        options={floorsData}

                                        value={values.floors}

                                        onChange={onFloorChange}

                                        placeholder={
                                            values.floors.length
                                                ? `${values.floors.length} Selected`
                                                : "Select Floor"
                                        }

                                        isInvalid={
                                            touched.floors &&
                                            !!errors.floors
                                        }

                                        error={errors.floors}

                                    />

                                </Form.Group>

                                {/* ZONE */}

                                <Form.Group
                                    as={Col}
                                    className="mb-3"
                                >

                                    <Form.Label>
                                        Zone
                                    </Form.Label>

                                    <MultiSelectDropdown

                                        options={zonesData}

                                        value={values.zones}

                                        onChange={onZoneChange}

                                        placeholder={
                                            values.zones.length
                                                ? `${values.zones.length} Selected`
                                                : "Select Zone"
                                        }

                                        isInvalid={
                                            touched.zones &&
                                            !!errors.zones
                                        }

                                        error={errors.zones}

                                    />

                                </Form.Group>

                            </Modal.Body>

                            <Modal.Footer
                                className="d-flex justify-content-center"
                            >

                                <Button
                                    className="btn-cancel"
                                    variant="secondary"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    variant="primary btn-sm actv"
                                    onClick={handleSubmit}
                                >
                                    Apply
                                </Button>

                            </Modal.Footer>

                        </>

                    );

                }}

            </Formik>

        </Modal>

    );

}

export default HeatmapCascadeFilter;