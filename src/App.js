import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; //eslint-disable-line import/no-webpack-loader-syntax
import "./App.css";

function App() {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiZXZhbmthcnQiLCJhIjoiY2xxMnkzaG83MDY4aDJpbW54b2huZmNxOCJ9.4InAygCOj9qFzofUUuu-FA";

  const map = useRef(null);
  const mapContainer = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [lng, lat],
      zoom: zoom,
    });
    console.log(map.current);
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    // map.current.addSource("some id", {
    //   type: "geojson",
    //   data: "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_ports.geojson",
    // });

    // map.current.addSource("batMap", {
    //   type: "Feature Service",
    //   serviceUrl:
    //     "https://services2.arcgis.com/Uq9r85Potqm3MfRV/arcgis/rest/services/biosds2825_fpu/FeatureServer/0",
    //   sourceLastModified: "2023-11-29T18:33:44.082Z",
    // });
  });

  return (
    <div className="App">
      <div>
        <div className="sidebar">
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
        <div ref={mapContainer} className="map-container" />
      </div>
    </div>
  );
}

export default App;
