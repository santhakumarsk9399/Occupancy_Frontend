import React from "react";
import { Modal, Button, Form, Col } from "react-bootstrap";
import Select from "react-select";
import { Formik } from "formik";
import MultiSelectDropdown from "../CommonComponents/MultiSelectDropDown";

const DashboardFiltersModal = ({ show, onClose, onApply }) => {
  const RequiredIcon = () => <span style={{ color: "red" }}> *</span>;
  const countryOptions = [
    { label: "India", value: 1 },
    { label: "USA", value: 2 },
  ];
  const cityOptions = [
    { label: "Chennai", value: 1 },
    { label: "Bangalore", value: 2 },
    { label: "Coimbatore", value: 3 },
  ];
  const zoneOptions = [
    { label: "Zone A", value: 1 },
    { label: "Zone B", value: 2 },
    { label: "Zone C", value: 3 },
  ];

  //   const defaultValues = {
  //     countries: [],
  //     cities: [],
  //     zones: [],
  //     ...initialValues,
  //   };
  const initialValues = {
    countries: [],
    cities: [],
    zones: [],
  };
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedZones, setSelectedZones] = useState([]);

  // Cities filtered by selected countries (if any), else show all
  const filteredCities = useMemo(() => {
    const selectedCountryIds = selectedCountries.map((c) => c.value);
    if (selectedCountryIds.length === 0) {
      return citiesData;
    }
    return citiesData.filter((city) =>
      selectedCountryIds.includes(city.countryId)
    );
  }, [selectedCountries]);

  // Zones filtered by selected cities, if any; else show all
  const filteredZones = useMemo(() => {
    const selectedCityIds = selectedCities.map((c) => c.value);
    if (selectedCityIds.length === 0) {
      return zonesData;
    }
    return zonesData.filter((z) => selectedCityIds.includes(z.cityId));
  }, [selectedCities]);

  const handleCountryChange = (newCountries) => {
    setSelectedCountries(newCountries);
    // Filter cities and zones accordingly on country change
    const allowedCountryIds = newCountries.map((c) => c.value);

    const validCities = selectedCities.filter((city) =>
      allowedCountryIds.includes(city.countryId)
    );
    setSelectedCities(validCities);

    const validZones = selectedZones.filter((zone) =>
      validCities.some((city) => city.value === zone.cityId)
    );
    setSelectedZones(validZones);
  };

  const handleCityChange = (newCities) => {
    setSelectedCities(newCities);

    // Auto-select related countries
    // const countryIds = [...new Set(newCities.map(c => c.countryId))];
    // const matchedCountries = countriesData.filter(c => countryIds.includes(c.value));
    // setSelectedCountries(matchedCountries);

    // Filter zones accordingly
    const allowedCityIds = newCities.map((c) => c.value);
    setSelectedZones(
      selectedZones.filter((z) => allowedCityIds.includes(z.cityId))
    );
  };

  const handleZoneChange = (newZones) => {
    setSelectedZones(newZones);
    // No reverse-select logic here
  };
  return (
    <Modal show={show} onHide={onClose} centered size="sm">
      <Formik
        initialValues={initialValues}
        onSubmit={(values) => {
          console.log(values);
          onApply(values); // Pass to parent
        }}
      >
        {({ values, handleSubmit, setFieldValue }) => (
          <Form onSubmit={handleSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>Filters</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group as={Col} className="mb-3">
                <Form.Label>Countries</Form.Label>
                <MultiSelectDropdown
                  options={countriesData}
                  value={selectedCountries}
                  onChange={handleCountryChange}
                  placeholder="Select Countries"
                />
              </Form.Group>

              <Form.Group as={Col} className="mb-3">
                <Form.Label>Cities</Form.Label>
                <MultiSelectDropdown
                  options={filteredCities}
                  value={selectedCities}
                  onChange={handleCityChange}
                  placeholder="Select Cities"
                />
              </Form.Group>

              <Form.Group as={Col} className="mb-3">
                <Form.Label>
                  Zones <RequiredIcon />
                </Form.Label>
                <MultiSelectDropdown
                  options={filteredZones}
                  value={selectedZones}
                  onChange={handleZoneChange}
                  placeholder="Select Zones"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-center">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Apply
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default DashboardFiltersModal;
