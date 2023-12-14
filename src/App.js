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
  const [zoom, setZoom] = useState(4);

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

    map.current.on("load", () => {
      map.current.addSource("single-point", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Point",
                coordinates: [-76.53063297271729, 39.18174077994108],
              },
            },
          ],
        },
      });

      map.current.addLayer({
        id: "point", // the layer's ID
        source: "single-point",
        type: "circle", // the layer type
        paint: {
          "circle-radius": 10,
          "circle-color": "#007cbf",
        },
      });

      map.current.addLayer({
        id: "boroughs-fill", // the layer's ID
        source: {
          type: "geojson",
          data: "http://localhost:3000/data/boroughs.geojson",
        },
        type: "fill", // the layer type
        paint: {
          "fill-color": "orange",
        },
      });
    });
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
