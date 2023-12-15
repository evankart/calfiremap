import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; //eslint-disable-line import/no-webpack-loader-syntax
import "./App.css";

function App() {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiZXZhbmthcnQiLCJhIjoiY2xxMnkzaG83MDY4aDJpbW54b2huZmNxOCJ9.4InAygCOj9qFzofUUuu-FA";

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-122.439331);
  const [lat, setLat] = useState(37.773446);
  const [zoom, setZoom] = useState(5);
  const [year, setYear] = useState(2020);
  const [fireName, setFireName] = useState(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    map.current.on("style.load", () => {
      map.current.addSource("urban-areas", {
        type: "geojson",
        data: "https://docs.mapbox.com/mapbox-gl-js/assets/ne_50m_urban_areas.geojson",
      });

      map.current.addLayer({
        id: "urban-areas-fill",
        type: "fill",
        // This property allows you to identify which `slot` in
        // the Mapbox Standard your new layer should be placed in (`bottom`, `middle`, `top`).
        slot: "middle",
        source: "urban-areas",
        layout: {},
        paint: {
          "fill-color": "#000000",
          "fill-opacity": 0.4,
        },
      });
    });

    // map.current.on("style.load", () => {
    //   map.current.addSource("black-bear-range", {
    //     type: "geojson",
    //     data: black_bear_range,
    //   });

    //   map.current.addLayer({
    //     id: "black-bears-fill",
    //     type: "fill",
    //     // This property allows you to identify which `slot` in
    //     // the Mapbox Standard your new layer should be placed in (`bottom`, `middle`, `top`).
    //     slot: "middle",
    //     source: "black-bear-range",
    //     layout: {},
    //     paint: {
    //       "fill-color": "#522910",
    //       "fill-opacity": 0.7,
    //     },
    //   });
    // });

    map.current.on("style.load", () => {
      map.current.addSource("cal-fires", {
        type: "geojson",
        data: "https://gis.data.cnra.ca.gov/datasets/CALFIRE-Forestry::california-fire-perimeters-1950.geojson?where=1=1&outSR=%7B%22latestWkid%22%3A3857%2C%22wkid%22%3A102100%7D",
      });

      map.current.addLayer({
        id: "cal-fires-fill",
        type: "fill",
        // This property allows you to identify which `slot` in
        // the Mapbox Standard your new layer should be placed in (`bottom`, `middle`, `top`).
        slot: "middle",
        source: "cal-fires",
        layout: {},
        paint: {
          "fill-color": "#ff601c",
          "fill-opacity": 1,
        },
        filter: ["==", ["get", "YEAR_"], year.toString()],
      });
    });

    map.current.on("style.load", () => {
      // Add a geojson point source.
      // Heatmap layers also work with a vector tile source.
      map.current.addSource("earthquakes", {
        type: "geojson",
        data: "https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson",
      });

      map.current.addLayer(
        {
          id: "earthquakes-heat",
          type: "heatmap",
          source: "earthquakes",
          maxzoom: 9,
          paint: {
            // Increase the heatmap weight based on frequency and property magnitude
            "heatmap-weight": [
              "interpolate",
              ["linear"],
              ["get", "mag"],
              0,
              0,
              6,
              1,
            ],
            // Increase the heatmap color weight weight by zoom level
            // heatmap-intensity is a multiplier on top of heatmap-weight
            "heatmap-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              1,
              9,
              3,
            ],
            // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
            // Begin color ramp at 0-stop with a 0-transparancy color
            // to create a blur-like effect.
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(33,102,172,0)",
              0.2,
              "rgb(103,169,207)",
              0.4,
              "#92cec8",
              0.6,
              "#e7bc00",
              0.8,
              "#f47941",
              1,
              "#ee544b",
            ],
            // Adjust the heatmap radius by zoom level
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              2,
              9,
              20,
            ],
            // Transition from heatmap to circle layer by zoom level
            "heatmap-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              7,
              1,
              9,
              0,
            ],
          },
        },
        "waterway-label"
      );

      map.current.addLayer(
        {
          id: "earthquakes-point",
          type: "circle",
          source: "earthquakes",
          minzoom: 7,
          paint: {
            // Size circle radius by earthquake magnitude and zoom level
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              7,
              ["interpolate", ["linear"], ["get", "mag"], 1, 1, 6, 4],
              16,
              ["interpolate", ["linear"], ["get", "mag"], 1, 5, 6, 50],
            ],
            // Color circle by earthquake magnitude
            "circle-color": [
              "interpolate",
              ["linear"],
              ["get", "mag"],
              1,
              "rgba(33,102,172,0)",
              2,
              "rgb(103,169,207)",
              3,
              "rgb(209,229,240)",
              4,
              "rgb(253,219,199)",
              5,
              "rgb(239,138,98)",
              6,
              "rgb(178,24,43)",
            ],
            "circle-stroke-color": "white",
            "circle-stroke-width": 1,
            // Transition from heatmap to circle layer by zoom level
            "circle-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0, 8, 1],
          },
        },
        "waterway-label"
      );
    });

    // map.current.on("style.load", () => {
    //   map.current.addSource("boroughs", {
    //     type: "geojson",
    //     data: boroughs,
    //   });

    //   map.current.addLayer({
    //     id: "boroughs-fill",
    //     type: "fill",
    //     // This property allows you to identify which `slot` in
    //     // the Mapbox Standard your new layer should be placed in (`bottom`, `middle`, `top`).
    //     slot: "middle",
    //     source: "boroughs",
    //     layout: {},
    //     paint: {
    //       "fill-color": "#fca103",
    //       "fill-opacity": 0.4,
    //     },
    //   });
    // });

    // map.current.on("style.load", () => {
    //   map.current.addSource("SF_Tides", {
    //     type: "geojson",
    //     data: SF_Tides,
    //   });

    //   map.current.addLayer({
    //     id: "SF_Tides-points",
    //     type: "circle",
    //     // This property allows you to identify which `slot` in
    //     // the Mapbox Standard your new layer should be placed in (`bottom`, `middle`, `top`).
    //     slot: "middle",
    //     source: "SF_Tides",
    //     layout: {},
    //     paint: {
    //       "circle-radius": 6,
    //       "circle-color": "#B42222",
    //     },
    //     filter: ["==", "$type", "Point"],
    //   });
    // });
  });

  useEffect(() => {
    console.log(year);
    console.log(map.current);
  }, [year]);

  function handleYearChange(e) {
    const val = e.target.id;
    let newYear;
    val === "-" ? (newYear = year - 1) : (newYear = year + 1);
    setYear(newYear);
    map.current.setFilter("cal-fires-fill", [
      "==",
      ["get", "YEAR_"],
      newYear.toString(),
    ]);
  }

  return (
    <div>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        <div className="filter">
          <button
            id="-"
            onClick={(e) => {
              handleYearChange(e);
            }}
          >
            -
          </button>
          <button
            id="+"
            onClick={(e) => {
              handleYearChange(e);
            }}
          >
            +
          </button>{" "}
          Year: {year.toString()} | Fire: {fireName}
        </div>
      </div>

      <div ref={mapContainer} className="map-container" />
    </div>
  );
}

export default App;
