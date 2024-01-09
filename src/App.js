import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; //eslint-disable-line import/no-webpack-loader-syntax
import { BounceLoader } from "react-spinners";
import Sidebar from "./components/sidebar";

function App() {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiZXZhbmthcnQiLCJhIjoiY2xxMnkzaG83MDY4aDJpbW54b2huZmNxOCJ9.4InAygCOj9qFzofUUuu-FA";

  const URBAN_COLOR = "#000000";
  const FIRE_COLOR = "#ff601c";

  const mapContainer = useRef(null);
  const map = useRef(null);

  // map starting location and zoom
  const [lng, setLng] = useState(-119.0184);
  const [lat, setLat] = useState(37.7734);
  const [zoom, setZoom] = useState(5.5);
  const [year, setYear] = useState(2020);
  const [loading, setLoading] = useState(true);
  const [acresBurned, setAcresBurned] = useState(0);

  // Array of years to populate dropdown in sidebar
  const startYear = 1950;
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => currentYear - i
  );

  // Creates query link for cal fire data for a given year
  function queryByYear(year) {
    return `https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/California_Fire_Perimeters/FeatureServer/2/query?where=YEAR_=${year}&outFields=*&geometryType=esriGeometryPolygon&f=geojson`;
  }

  function refreshAcres() {
    let fireArray = [];
    let allFeatures = map.current.querySourceFeatures("cal-fires");
    setAcresBurned(0);
    let acresBurnedCount = 0;
    allFeatures.forEach((feature) => {
      if (!fireArray.includes(feature.properties.FIRE_NAME)) {
        fireArray.push(feature.properties.FIRE_NAME);
        acresBurnedCount += feature.properties.GIS_ACRES;
      }
    });
    acresBurnedCount = acresBurnedCount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }); // format as a number with commas and two decimal places
    setAcresBurned(acresBurnedCount);
  }

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [lng, lat],
      zoom: zoom,
    });

    // Remove the loading animation once the map is idle (i.e. has fully finished loading)
    map.current.once("idle", () => {
      setLoading(false);
      refreshAcres();
    });

    // Update sidebar on map move
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    // URBAN AREAS
    map.current.on("style.load", () => {
      // Get urban areas data
      map.current.addSource("urban-areas", {
        type: "geojson",
        data: "https://docs.mapbox.com/mapbox-gl-js/assets/ne_50m_urban_areas.geojson",
      });

      // Add urban areas shapes to map
      map.current.addLayer({
        id: "urban-areas-fill",
        type: "fill",
        slot: "middle",
        source: "urban-areas",
        layout: {},
        paint: {
          "fill-color": URBAN_COLOR,
          "fill-opacity": 0.15,
        },
      });
    });

    // CAL FIRES
    map.current.on("style.load", () => {
      // Get cal fires data
      // map.current.addSource("cal-fires-full", {
      //   type: "geojson",
      //   data: "https://gis.data.cnra.ca.gov/datasets/CALFIRE-Forestry::california-fire-perimeters-1950.geojson?where=1=1&outSR=%7B%22latestWkid%22%3A3857%2C%22wkid%22%3A102100%7D",
      // });

      map.current.addSource("cal-fires", {
        type: "geojson",
        data: queryByYear(2020),
      });

      // Add cal fires shapes to map
      map.current.addLayer({
        id: "cal-fires-fill",
        type: "fill",
        slot: "middle",
        source: "cal-fires",
        layout: {},
        paint: {
          "fill-color": FIRE_COLOR,
          "fill-opacity": 1,
        },
        // Filter by the year selected in sidebar
        filter: ["==", ["get", "YEAR_"], year.toString()],
      });
    });

    // Create a popup for info (not added to map yet)
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    // Do action when mouse hovers over a fire
    map.current.on("mouseenter", "cal-fires-fill", (e) => {
      // Change the cursor style as a UI indicator.
      map.current.getCanvas().style.cursor = "pointer";

      // Get data for hovered fire
      const fire = e.features[0].properties;
      const fireId = e.features[0].properties.id;
      const FIRE_NAME = fire.FIRE_NAME;
      const ACRES_BURNED = Math.round(fire.GIS_ACRES).toLocaleString("en-US");
      const ALARM_DATE = new Date(fire.ALARM_DATE).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const CONT_DATE = new Date(fire.CONT_DATE).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      // Add a new layer for the hovered feature with a different fill color
      map.current.addLayer({
        id: "hover",
        type: "fill",
        source: "cal-fires",
        paint: {
          "fill-color": "#e11e1e          ",
          "fill-opacity": 1,
        },
        filter: ["==", "FIRE_NAME", FIRE_NAME],
      });

      // Index of fire causes values
      const FIRE_CAUSES = {
        1: "Lightning",
        2: "Equipment Use",
        3: "Smoking",
        4: "Campfire",
        5: "Debris",
        6: "Railroad",
        7: "Arson",
        8: "Playing with fire",
        9: "Miscellaneous",
        10: "Vehicle",
        11: "Powerline",
        12: "Firefighter Training",
        13: "Non-Firefighter Training",
        14: "Unknown",
        15: "Structure",
        16: "Aircraft",
        17: "Unknown",
        18: "Escaped Prescribed Burn",
        19: "Campfire",
      };
      // Get cause of fire from value in fire data
      const FIRE_CAUSE = FIRE_CAUSES[fire.CAUSE];
      // Populate the popup with info about the fire and add it to map
      popup
        .setLngLat([e.lngLat.lng, e.lngLat.lat])
        .setHTML(
          `<h3>${FIRE_NAME} FIRE</h3>
            <h4>
              ${ALARM_DATE} - ${CONT_DATE}
            </h4>
            <div>Acres Burned: ${ACRES_BURNED}</div>
            <div>Cause: ${FIRE_CAUSE}</div>
          `
        )
        .addTo(map.current);
    });

    // When moving hover away from area, return curson styling and remove popup
    map.current.on("mouseleave", "cal-fires-fill", () => {
      map.current.getCanvas().style.cursor = "";
      popup.remove();

      // remove hover color
      if (map.current.getLayer("hover")) {
        map.current.removeLayer("hover");
      }
    });
  });

  // Update map with a filter for the selected year
  function handleYearChange(e) {
    const val = e.target.id;
    let newYear;
    if (val === "-") {
      newYear = year - 1;
    } else if (val === "+") {
      newYear = year + 1;
    } else if (val === "year") {
      newYear = e.target.value;
    }
    setYear(newYear);
    map.current.setFilter("cal-fires-fill", [
      "==",
      ["get", "YEAR_"],
      newYear.toString(),
    ]);

    // Update map with data for the new year selected
    map.current.getSource("cal-fires").setData(queryByYear(newYear));

    // Show loading animation until map is idle
    setLoading(true);
    map.current.once("idle", () => {
      setLoading(false);
      refreshAcres();
    });
  }

  let FULL_DATASET;
  async function fetchFullData() {
    fetch(
      "https://gis.data.cnra.ca.gov/datasets/CALFIRE-Forestry::california-fire-perimeters-1950.geojson?where=1=1&outSR=%7B%22latestWkid%22%3A3857%2C%22wkid%22%3A102100%7D"
    )
      .then((response) => response.json())
      .then((data) => {
        FULL_DATASET = data;
        console.log("fetched data: ", FULL_DATASET);
        console.log(
          `${FULL_DATASET.features.length.toLocaleString()} fires since 1950`
        );
        // FULL_DATASET.features.forEach((feature) => {
        //   console.log(feature.properties.CAUSE);
        // });
      })
      .catch((error) => console.error("Error:", error));
  }

  fetchFullData();

  return (
    <div>
      {/* Show loading animation until map is idle */}
      {loading && (
        <div
          style={{
            position: "absolute",
            zIndex: "1",
            display: "flex",
            background: "rgba(3,42,100, 0.5)",
            width: "100vw",
            height: "100vh",
          }}
        >
          <div style={{ margin: "auto", alignContent: "center" }}>
            <BounceLoader color="#36d7b7" />
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className="sidebar"
        style={{ padding: "0 10px", lineHeight: "1.15em", fontSize: "1.4em" }}
      >
        <div style={{ margin: "10px 5px" }}>
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom} | {acresBurned}{" "}
          Acres Burned
        </div>
        <div className="filter" style={{ margin: "10px 5px" }}>
          <button
            id="-"
            onClick={(e) => {
              handleYearChange(e);
            }}
            style={{
              backgroundColor: "#f5f5f5",
              color: "rgba(3,42,100, 0.5)",
              fontWeight: "bold",
              borderRadius: "14px",
              boxShadow: "none",
              border: "none",
              padding: "4px 10px",
            }}
          >
            &lt;
          </button>
          {/* dropdown for selecting the year */}
          <select
            id="year"
            onChange={(e) => {
              handleYearChange(e);
            }}
            value={year}
            style={{
              backgroundColor: "#f5f5f5",
              color: "rgba(3,42,100, 0.5)",
              fontWeight: "bold",
              borderRadius: "14px",
              boxShadow: "none",
              border: "none",
              padding: "4px 10px",
              margin: "0 8px",
            }}
          >
            {years.map((year, index) => (
              <option key={index} value={year}>
                {year}
              </option>
            ))}
          </select>
          <button
            id="+"
            onClick={(e) => {
              handleYearChange(e);
            }}
            style={{
              backgroundColor: "#f5f5f5",
              color: "rgba(3,42,100, 0.5)",
              fontWeight: "bold",
              borderRadius: "14px",
              boxShadow: "none",
              border: "none",
              padding: "4px 10px",
            }}
          >
            &gt;
          </button>
        </div>
        <div style={{ fontSize: "0.8em" }}>
          {" "}
          Data provided by the{" "}
          <a
            href="https://gis.data.cnra.ca.gov/datasets/CALFIRE-Forestry::california-fire-perimeters-1950/about"
            style={{ color: "white" }}
          >
            California Department of Forestry and Fire Protection
          </a>
          .
        </div>
      </div>

      <div ref={mapContainer} className="map-container" />
    </div>
  );
}

export default App;
