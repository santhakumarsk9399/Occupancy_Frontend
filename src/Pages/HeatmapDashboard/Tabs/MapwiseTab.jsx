// import React, {
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
//   useMap,
// } from "react-leaflet";

// import L from "leaflet";
// import "leaflet.heat";

// import "../Styles/mapwiseTab.css";

// import { countryCenters } from "../data/CountryCenters";
// import { occupancyData } from "../data/OccupancyData";



// // ---------------- FIX DEFAULT MARKER ISSUE ----------------

// import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// import markerIcon from "leaflet/dist/images/marker-icon.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";

// delete L.Icon.Default.prototype._getIconUrl;

// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });



// // ---------------- RESIZE MAP FIX ----------------
// // IMPORTANT FOR TABS

// function ResizeMap() {
//   const map = useMap();

//   useEffect(() => {
//     setTimeout(() => {
//       map.invalidateSize();
//     }, 300);
//   }, [map]);

//   return null;
// }



// // ---------------- HEATMAP LAYER ----------------

// function HeatLayer({ points }) {

//   const map = useMap();

//   useEffect(() => {

//     if (!map) return;

//     if (!points || points.length === 0) return;



//     // WAIT FOR MAP SIZE

//     const timer = setTimeout(() => {

//       map.invalidateSize();



//       const heatPoints = points.map((item) => [
//         item.lat,
//         item.lng,
//         item.occupancy / 100,
//       ]);



//       const heatLayer = L.heatLayer(
//         heatPoints,
//         {
//           radius: 45,
//           blur: 35,
//           maxZoom: 10,

//           gradient: {
//             0.2: "#00c2ff",
//             0.4: "#00ff95",
//             0.6: "#ffe600",
//             0.8: "#ff9500",
//             1.0: "#ff0000",
//           },
//         }
//       );



//       heatLayer.addTo(map);



//       return () => {
//         map.removeLayer(heatLayer);
//       };

//     }, 500);



//     return () => clearTimeout(timer);

//   }, [map, points]);



//   return null;
// }



// // ---------------- MAIN COMPONENT ----------------

// export default function MapwiseTab() {

//   // DEFAULT COUNTRY

//   const [selectedCountry, setSelectedCountry] =
//     useState("India");



//   // COUNTRY CONFIG

//   const mapConfig =
//     countryCenters[selectedCountry];



//   // FILTER COUNTRY DATA

//   const filteredData = useMemo(() => {

//     return occupancyData.filter(
//       (item) =>
//         item.country === selectedCountry
//     );

//   }, [selectedCountry]);



//   return (
//     <div className="mapwise-wrapper">

//       <div className="map-card">

//         {/* HEADER */}

//         <div className="map-header">

//           <h4 className="map-title">
//             {selectedCountry}
//           </h4>



//           {/* COUNTRY DROPDOWN */}

//           <select
//             className="country-select"
//             value={selectedCountry}
//             onChange={(e) =>
//               setSelectedCountry(e.target.value)
//             }
//           >

//             {Object.keys(countryCenters).map(
//               (country) => (
//                 <option
//                   key={country}
//                   value={country}
//                 >
//                   {country}
//                 </option>
//               )
//             )}

//           </select>

//         </div>



//         {/* LEGEND */}

//         <div className="legend-wrapper">

//           <span className="legend-text">
//             0%
//           </span>

//           <div className="legend-bar"></div>

//           <span className="legend-text">
//             100%
//           </span>

//         </div>



//         {/* MAP */}

//         <MapContainer
//           key={selectedCountry}
//           center={mapConfig.center}
//           zoom={mapConfig.zoom}
//           scrollWheelZoom={true}
//           className="map-container"
//         >
//           {/* IMPORTANT TAB FIX */}

//           <ResizeMap />



//           {/* TILE LAYER */}

//           <TileLayer
//             attribution="&copy; OpenStreetMap contributors"
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           />



//           {/* HEATMAP */}

//           <HeatLayer
//             points={filteredData}
//           />



//           {/* MARKERS */}

//           {filteredData.map((item, index) => (

//             <Marker
//               key={index}
//               position={[
//                 item.lat,
//                 item.lng,
//               ]}
//             >

//               <Popup>

//                 <div>

//                   <h5>
//                     {item.city}
//                   </h5>

//                   <p>
//                     Occupancy:
//                     {" "}
//                     <strong>
//                       {item.occupancy}%
//                     </strong>
//                   </p>

//                 </div>

//               </Popup>

//             </Marker>

//           ))}

//         </MapContainer>

//       </div>
//     </div>
//   );
// }

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet.heat";

import "../Styles/mapwiseTab.css";

import { countryCenters } from "../data/CountryCenters";
import { occupancyData } from "../data/OccupancyData";



// FIX MARKER

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});



// HEATMAP

function HeatLayer({ points }) {

  const map = useMap();

  const heatLayerRef = useRef(null);



  useEffect(() => {

    if (!map) return;

    if (!points?.length) return;



    const timer = setTimeout(() => {

      map.invalidateSize();



      if (heatLayerRef.current) {

        map.removeLayer(
          heatLayerRef.current
        );

      }



      const heatPoints = points.map(
        (item) => [
          item.lat,
          item.lng,
          item.occupancy / 100,
        ]
      );



      heatLayerRef.current =
        L.heatLayer(heatPoints, {

          radius: 45,

          blur: 35,

          maxZoom: 10,

          gradient: {
            0.2: "#00c2ff",
            0.4: "#00ff95",
            0.6: "#ffe600",
            0.8: "#ff9500",
            1.0: "#ff0000",
          },

        });



      heatLayerRef.current.addTo(map);

    }, 1000);



    return () => {

      clearTimeout(timer);

    };

  }, [map, points]);



  return null;
}



// MAIN COMPONENT

export default function MapwiseTab() {

  const [selectedCountry,
    setSelectedCountry] =
    useState("India");



  const [showMap,
    setShowMap] =
    useState(false);



  // TAB FIX

  useEffect(() => {

    const timer = setTimeout(() => {

      setShowMap(true);

    }, 1000);



    return () => clearTimeout(timer);

  }, []);




  const mapConfig =
    countryCenters[selectedCountry];



  const filteredData = useMemo(() => {

    return occupancyData.filter(
      (item) =>
        item.country === selectedCountry
    );

  }, [selectedCountry]);



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



        {/* MAP */}

        <div className="map-wrapper">

          {showMap && (

            <MapContainer

              key={selectedCountry}

              center={mapConfig.center}

              zoom={mapConfig.zoom}

              scrollWheelZoom={true}

              className="map-container"

              preferCanvas={true}
            >

              <TileLayer
                attribution="&copy; OpenStreetMap contributors"

                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />



              <HeatLayer
                points={filteredData}
              />



              {filteredData.map(
                (item, index) => (

                  <Marker
                    key={index}

                    position={[
                      item.lat,
                      item.lng,
                    ]}
                  >

                    <Popup>

                      <div>

                        <h5>
                          {item.city}
                        </h5>

                        <p>
                          Occupancy:
                          {" "}

                          {item.occupancy}%
                        </p>

                      </div>

                    </Popup>

                  </Marker>

                )
              )}

            </MapContainer>

          )}

        </div>

      </div>

    </div>

  );
}