import React from "react";
import { Modal, Button, Form, Col } from "react-bootstrap";
import { Formik } from "formik";
import MultiSelectDropdown from "../CommonComponents/MultiSelectDropDown";
import "../../Components/Styles/Common.css"
function CascadeSelectorModal({
  show,
  onClose,
  onSave,
  countriesData,
  citiesData,
  zonesData,
  selectedCountriesData = [],
  selectedCitiesData = [],
  selectedZonesData = [],
}) {
  const initialValues = {
    countries: selectedCountriesData.map(({ value, label }) => ({
      value: String(value),
      label,
    })),
    cities: selectedCitiesData.map(({ value, label }) => ({
      value: String(value),
      label,
    })),
    zones: selectedZonesData.map(({ value, label }) => ({
      value: String(value),
      label,
    })),
  };

  return (
    <Modal show={show} onHide={onClose} size="md" centered  backdrop="static" dialogClassName="dashfilter-pop">
      <Formik
        key={JSON.stringify(initialValues)} 
        enableReinitialize
        initialValues={initialValues}
        onSubmit={(values) => onSave(values)}
      >
        {({ values, setFieldValue, handleSubmit, touched, errors }) => {
          const onCountriesChange = (countries) => {
            setFieldValue("countries", countries);

            const selectedCountryIds = countries.map((c) => c.value);
            const autoCities = citiesData.filter((ci) =>
              selectedCountryIds.includes(ci.countryId)
            );
            setFieldValue("cities", autoCities);

            const selectedCityIds = autoCities.map((c) => c.value);
            const autoZones = zonesData.filter((z) =>
              selectedCityIds.includes(z.cityId)
            );
            setFieldValue("zones", autoZones);
          };

          const onCitiesChange = (cities) => {
            setFieldValue("cities", cities);

            const selectedCityIds = cities.map((c) => c.value);
            const autoZones = zonesData.filter((z) =>
              selectedCityIds.includes(z.cityId)
            );
            setFieldValue("zones", autoZones);
          };

          const onZonesChange = (zones) => {
            setFieldValue("zones", zones);
          };

          return (
            <>
              <Modal.Header closeButton backdrop="static">
                <Modal.Title>Filters</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form.Group as={Col} className="mb-3">
                  <Form.Label>Countries</Form.Label>
                  <MultiSelectDropdown
                    options={countriesData}
                    value={values.countries}
                    onChange={onCountriesChange}
                    placeholder={
                      values.countries.length
                        ? `${values.countries.length} Selected`
                        : "Select Countries"
                    }
                    isInvalid={touched.countries && !!errors.countries}
                    error={errors.countries}
                  />
                </Form.Group>

                <Form.Group as={Col} className="mb-3">
                  <Form.Label>Cities</Form.Label>
                  <MultiSelectDropdown
                    options={citiesData} 
                    value={values.cities}
                    onChange={onCitiesChange}
                    placeholder={
                      values.cities.length
                        ? `${values.cities.length} Selected`
                        : "Select Cities"
                    }
                    isInvalid={touched.cities && !!errors.cities}
                    error={errors.cities}
                  />
                </Form.Group>

                <Form.Group as={Col} className="mb-3">
                  <Form.Label>Zones</Form.Label>
                  <MultiSelectDropdown
                    options={zonesData} // ✅ Show all zones
                    value={values.zones}
                    onChange={onZonesChange}
                    placeholder={
                      values.zones.length
                        ? `${values.zones.length} Selected`
                        : "Select Zones"
                    }
                    isInvalid={touched.zones && !!errors.zones}
                    error={errors.zones}
                  />
                </Form.Group>
              </Modal.Body>

              <Modal.Footer className="d-flex justify-content-center">

                <Button  className="btn-cancel"variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button className="btn-apply" variant="primary" onClick={handleSubmit}>
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

export default CascadeSelectorModal;
