import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import "../Styles/mapwiseTab.css";
import "../Styles/LoaderOverlay.css";
// import { countryCenters } from "../data/CountryCenters";
// import { occupancyData } from "../data/OccupancyData";
// FIX MARKER
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import dayjs from "dayjs";
import { getHeatmapMapwiseDashboard } from "../api/HeatmapDashboardApis";
import Loader from "../../CommonComponents/Loader";
import NoData from "../../CommonComponents/NoDataAvailable";
import { Spinner } from "react-bootstrap";
import { mapwiseMockData } from "../data/mapData";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function ChangeMapView({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

function HeatLayer({ points }) {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!map || !points?.length) return;

    const createHeat = () => {
      if (!map.getContainer()) return;

      map.invalidateSize();

      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }

      const zoom = map.getZoom();

      let radius = 30;

      if (zoom <= 5) {
        radius = 30;
      } else if (zoom <= 7) {
        radius = 25;
      } else {
        radius = 18;
      }
      // const heatPoints = points.map((item) => [
      //   item.lat,
      //   item.lng,
      //   item.occupancy / 100,
      // ]);
      const heatPoints = points
        .filter((item) => item.center)
        .map((item) => [
          item.center.lat,
          item.center.lng,
          item.occupancy / 100,
        ]);
      heatLayerRef.current = L.heatLayer(heatPoints, {
        radius,
        blur: radius / 2,
        maxZoom: 18,
      });

      heatLayerRef.current.addTo(map);
    };

    setTimeout(createHeat, 300);

    map.on("zoomend", createHeat);

    return () => {
      map.off("zoomend", createHeat);

      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, points]);

  return null;
}
// MAIN COMPONENT

const MapwiseTab = ({ activeTab, filterDate, appliedFilters, filtersLoaded, onViewMall, refreshPage }) => {
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");


  //---------------------------inital load------------------------------------------//
  useEffect(() => {
    if (!filtersLoaded) return;
    if (activeTab !== "Map") return;
    if (!appliedFilters) return;

    loadMapDashboard(false);

  }, [filtersLoaded, activeTab, appliedFilters, filterDate]);

  //---------------------------- auto refresh----------------------------------------//
  const isToday = !filterDate || dayjs(filterDate).isSame(dayjs(), "day");

  useEffect(() => {
    if (!filtersLoaded) return;
    if (activeTab !== "Map") return;
    if (!appliedFilters) return;
    if (!isToday) return;

    loadMapDashboard(true);

  }, [refreshPage, activeTab, isToday, filtersLoaded, appliedFilters]);

  // const malls = appliedFilters?.malls || [];
  // const floors = appliedFilters?.floors || [];
  // const zones = appliedFilters?.zones || [];

  
  const loadMapDashboard = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      const payload = {
        inputDate: filterDate || dayjs().format("YYYY-MM-DD"),
        filters: appliedFilters.filters,
      };

      const response = await getHeatmapMapwiseDashboard(payload);

      const countries = response.country || [];

      setCountries(countries);
      setMapData(response.data || []);
      
      const currentCountry =
          countries.find(c => c.countryName === selectedCountry)?.countryName ||
          countries[0]?.countryName ||
          "";
      
      setSelectedCountry(currentCountry);


      // setCountries(response.country || []);
      // setMapData(response.data || []);

      // if (response.country?.length > 0) {
      //   setSelectedCountry(response.country[0].countryName);
      // }
    } catch (err) {
      console.log(err);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  };
  const mapConfig = useMemo(() => {
    const country = countries.find((c) => c.countryName === selectedCountry);

    if (!country) {
      return {
        center: [20.5937, 78.9629],
        zoom: 5,
      };
    }

    return {
      center: [country.center.lat, country.center.lng],
      zoom: 5,
    };
  }, [countries, selectedCountry]);
  const filteredData = useMemo(() => {
    return mapData.filter((item) => item.country === selectedCountry);
  }, [mapData, selectedCountry]);
  // Add this helper near the top of the file, alongside other helpers
  const getStatusColor = (value) => {
    if (value <= 20) return "#0095ff";
    if (value <= 40) return "#00d84a";
    if (value <= 60) return "#ffe600";
    if (value <= 80) return "#ff9800";
    return "#ff0000";
  };
  return (
    <div className="mapwise-wrapper">
      {loading ? (
        <div className="loader-overlay">
          <Spinner animation="border" variant="primary" />
          <p>Loading...</p>
        </div>
      ) : mapData?.length === 0 ? (
        <NoData name="no-data-Historical_dashboard" />
      ) : (
        <div className="map-card">
              <div className="map-header">
                <h3>{selectedCountry}</h3>

                <div className="country-field">
                  <label htmlFor="country-select">Country : </label>

                  <select
                    id="country-select"
                    className="country-select"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                  >
                    {countries?.map((country, index) => (
                      <option
                        key={`${country.countryName}-${index}`}
                        value={country.countryName}
                      >
                        {country.countryName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

          {/* Legend */}
          <div className="legend-wrapper">
            <span>0%</span>
            <div className="legend-bar"></div>
            <span>100%</span>
          </div>

          {/* Map */}
          <div className="map-wrapper">
            <MapContainer
              center={mapConfig.center}
              zoom={mapConfig.zoom}
              className="map-container"
            >
              <ChangeMapView center={mapConfig.center} zoom={mapConfig.zoom} />

              {/* <TileLayer
                attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              /> */}
                  <TileLayer
                    attribution="&copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS User Community"
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={19}
                  />
              <HeatLayer points={filteredData} />
              {filteredData
                .filter(
                  (item) =>
                    item.center &&
                    item.center.lat != null &&
                    item.center.lng != null,
                )
                .map((item, index) => {
                  const statusColor = getStatusColor(item.occupancy ?? 0);

                  return (
                    <Marker
                      key={index}
                      position={[item.center.lat, item.center.lng]}
                      eventHandlers={{
                        mouseover: (e) => e.target.openPopup(),
                        // mouseout: (e) => e.target.closePopup(),
                      }}
                  >
                      <Popup
                        className="mall-popup-v2"
                        closeButton={true}
                        offset={[0, -6]}
                      >
                        <div className="zdp-card">
                          <div className="zdp-header">
                            <span
                              className="zdp-dot"
                              style={{ "--zone-color": statusColor }}
                            />
                            <span className="zdp-name">{item.mallName}</span>
                          </div>

                          <div className="zdp-hero">
                            <span
                              className="zdp-hero-value"
                              style={{ color: statusColor }}
                            >
                              {item.occupancy ?? 0}
                              <span className="zdp-hero-pct">%</span>
                            </span>
                            <span className="zdp-hero-label">occupancy</span>
                          </div>

                          <div className="zdp-bar-track">
                            <div
                              className="zdp-bar-fill"
                              style={{
                                width: `${Math.min(item.occupancy ?? 0, 100)}%`,
                                background: statusColor,
                              }}
                            />
                          </div>

                          <div className="zdp-divider" />

                          <div className="zdp-row">
                            <span className="zdp-label">City</span>
                            <span className="zdp-value">{item.city}</span>
                          </div>
                          <div className="zdp-row">
                            <span className="zdp-label">Total Occupancy</span>
                            <span className="zdp-value">
                              {item.TotalVisitors}
                            </span>
                          </div>
                          <div className="zdp-row mt-3">
                            <button
                              className="btn btn-primary btn-sm w-100"
                              onClick={() => onViewMall?.(item)}
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};
export default MapwiseTab;
