import React, { useState ,useEffect} from "react";
import { Modal, Button } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


/* Fix leaflet icon */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return (
        <Marker
            position={position}
            draggable
            eventHandlers={{
                dragend: (e) =>
                    setPosition(e.target.getLatLng()),
            }}
        />
    );
};

const MapPickerModal = ({
    show,
    onClose,
    onConfirm,
    latitude,
    longitude,
}) => {
    const DEFAULT_POSITION = {
        lat: 11.0168,
        lng: 76.9558, // common default (Coimbatore)
    };

    const [position, setPosition] = useState(DEFAULT_POSITION);
      

    useEffect(() => {
        if (!show) return;

        // EDIT MODE → use saved lat/lng
        if (latitude && longitude) {
            setPosition({
                lat: Number(latitude),
                lng: Number(longitude),
            });
        }
        // CREATE MODE → use common default
        else {
            setPosition(DEFAULT_POSITION);
        }
    }, [show, latitude, longitude]);
      
      
    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Select Location</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <MapContainer
                    center={position}
                    zoom={13}
                    style={{ height: "350px", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="© OpenStreetMap"
                    />
                    <LocationMarker
                        position={position}
                        setPosition={setPosition}
                    />
                </MapContainer>

                <div className="mt-2 text-muted">
                    Click or drag marker to choose location
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={() =>
                        onConfirm(
                            position.lat.toFixed(6),
                            position.lng.toFixed(6)
                        )
                    }
                >
                    Use this location
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default MapPickerModal;
