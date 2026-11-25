import React, {
    useMemo,
    useState,
} from "react";
import {
    GoogleMap,
    Marker,
    HeatmapLayer,
    useLoadScript,
} from "@react-google-maps/api";
import "../Styles/mapwiseTab.css";
import { countryCenters } from "../data/CountryCenters";
import { occupancyData } from "../data/OccupancyData";

// GOOGLE LIBRARIES
const libraries = ["visualization"];
// MAP STYLE
const containerStyle = {
    width: "100%",
    height: "700px",
    borderRadius: "16px",
};

// MAP OPTIONS
const mapOptions = {
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
};

// MAIN COMPONENT
export default function MapwiseTab() {
    const [selectedCountry,
        setSelectedCountry] =
        useState("India");

    // LOAD GOOGLE MAPS
    const { isLoaded } =
        useLoadScript({
            googleMapsApiKey:
                import.meta.env .VITE_GOOGLE_MAPS_API_KEY, libraries,
        });

    const mapConfig =
        countryCenters[selectedCountry];

    const filteredData = useMemo(() => {
        return occupancyData.filter(
            (item) =>
                item.country === selectedCountry
        );
    }, [selectedCountry]);

    // HEATMAP DATA
    const heatmapData = useMemo(() => {
        if (!window.google) return [];
        return filteredData.map(
            (item) => ({
                location:
                    new window.google.maps.LatLng(
                        item.lat,
                        item.lng
                    ),
                weight: item.occupancy,
            })
        );
    }, [filteredData]);

    // LOADING
    if (!isLoaded) {
        return (
            <div>
                Loading Google Maps...
            </div>
        );
    }

    return (
        <div className="mapwise-wrapper">
            <div className="map-card">
                {/* HEADER */}
                <div className="map-header">
                    <h3>{selectedCountry}</h3>
                    <select
                        className="country-select"
                        value={selectedCountry}
                        onChange={(e) =>
                            setSelectedCountry(
                                e.target.value
                            )
                        }
                    >
                        {Object.keys(countryCenters).map(
                            (country) => (
                                <option
                                    key={country}
                                    value={country}
                                >
                                    {country}
                                </option>
                            )
                        )}
                    </select>
                </div>
                {/* LEGEND */}
                <div className="legend-wrapper">
                    <span>0%</span>
                    <div className="legend-bar"></div>
                    <span>100%</span>
                </div>

                {/* GOOGLE MAP */}
                <GoogleMap  mapContainerStyle={
                        containerStyle
                    }
                    center={{
                        lat: mapConfig.center[0],
                        lng: mapConfig.center[1],
                    }}
                    zoom={mapConfig.zoom}
                    options={mapOptions}
                >

                    {/* HEATMAP */}
                    <HeatmapLayer
                        data={heatmapData}
                        options={{
                            radius: 50,
                            opacity: 0.7,
                            gradient: [
                                "rgba(0,255,255,0)",
                                "#00c2ff",
                                "#00ff95",
                                "#ffe600",
                                "#ff9500",
                                "#ff0000",
                            ],
                        }}
                    />

                    {filteredData.map(
                        (item, index) => (
                            <Marker
                                key={index}
                                position={{
                                    lat: item.lat,
                                    lng: item.lng,
                                }}
                            />
                        )
                    )}
                </GoogleMap>
            </div>
        </div>

    );
}