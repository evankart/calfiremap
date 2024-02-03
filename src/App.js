import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; //eslint-disable-line import/no-webpack-loader-syntax
import { simplify } from "simplify-geojson";
import { BounceLoader } from "react-spinners";
import Menu from "./components/Menu.js";
import Year from "./components/Year.js";
import { getDataSources } from "./data/dataSources.js";
import {
  queryWildfiresByYear,
  wildlifeRangeDataSources,
} from "./data/dataSources.js";

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

function App() {
  mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_API_KEY;
  const URBAN_AREA_COLOR = "#5b8fcf";
  const FIRE_AREA_COLOR = "#ff601c";
  const mapContainer = useRef(null);
  const map = useRef(null);

  let isDataDownloaded = false;

  // Set initial map zoom and location based on screen size
  let mq = window.matchMedia("(min-width: 420px)");
  let initialZoom;
  let initialLat;
  let initialLng;
  if (mq.matches) {
    initialZoom = 5.2; //set map zoom level for desktop size
    initialLat = 37.476313; //set lat for desktop size
    initialLng = -120.82628; //set lng level for desktop size
  } else {
    initialZoom = 4.7; //set map zoom level for mobile size
    initialLat = 35.955012; //set lat for mobile size
    initialLng = -119.107817; //set lng level for mobile size
  }

  // initialize state variables
  const [lng, setLng] = useState(initialLng);
  const [lat, setLat] = useState(initialLat);
  const [zoom, setZoom] = useState(initialZoom);
  const [year, setYear] = useState(2020);
  const [loading, setLoading] = useState(true);
  const [acresBurned, setAcresBurned] = useState(0);

  // const dataSources = getDataSources(year);
  const dataSources = wildlifeRangeDataSources;

  // Populate dropdown in sidebar with years from 1950
  const startYear = 1950;
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => currentYear - i
  );

  // Function to refresh acres burned count in sidebar
  function refreshAcres() {
    let fireArray = [];
    // get all fires from the current year
    let allFeatures = map.current.querySourceFeatures("cal-fires");
    setAcresBurned(0);
    let acresBurnedCount = 0;
    // loop through all fires and add acres burned to total
    allFeatures.forEach((feature) => {
      if (!fireArray.includes(feature.properties.FIRE_NAME)) {
        fireArray.push(feature.properties.FIRE_NAME);
        acresBurnedCount += feature.properties.GIS_ACRES;
      }
    });
    // format as a number with commas and two decimal places
    acresBurnedCount = acresBurnedCount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    setAcresBurned(acresBurnedCount);
  }

  const createPopup = () => {
    return new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
    });
  };
  // create a blank popup
  let popup = createPopup();

  const handleMouseEnter = (e) => {
    // create a new popup
    const popup = createPopup();

    // Change the cursor style as a UI indicator.
    map.current.getCanvas().style.cursor = "pointer";

    // Get data for the hovered fire
    const fire = e.features[0].properties;
    const FIRE_NAME = fire.FIRE_NAME;
    const ACRES_BURNED = Math.round(fire.GIS_ACRES).toLocaleString("en-US");
    // fire start date
    const ALARM_DATE = new Date(fire.ALARM_DATE).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    // fire stop date
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

    // Get cause of fire from value in fire data fire.CAUSE
    const FIRE_CAUSE = FIRE_CAUSES[fire.CAUSE];

    // Populate the popup with info about the fire and add it to map at the fire location
    popup
      .setLngLat([e.lngLat.lng.toFixed(6), e.lngLat.lat.toFixed(6)])
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
  };

  const handleMouseLeave = (e) => {
    map.current.getCanvas().style.cursor = "";
    popup.remove();

    // remove hover color
    if (map.current.getLayer("hover")) {
      map.current.removeLayer("hover");
    }
  };

  // Update sidebar on map move
  const handleMapMove = () => {
    setLng(map.current.getCenter().lng.toFixed(6));
    setLat(map.current.getCenter().lat.toFixed(6));
    setZoom(map.current.getZoom().toFixed(1));
  };

  // useEffect hook that runs on every render
  useEffect(() => {
    // initialize map if not already initialized
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [lng, lat],
      zoom: zoom,
    });

    // Update sidebar on map move
    map.current.on("move", handleMapMove);

    // Add Map Features
    map.current.on("style.load", () => {
      console.log(`dataSources`, dataSources);

      // Loops through dataSources array and adds all layers to map
      dataSources.forEach((source) => {
        console.log(`loading ${source.id}`);
        map.current.addSource(source.id, {
          type: "geojson",
          data: source.url,
        });
        map.current.addLayer({
          id: `${source.id}-fill`,
          type: "fill",
          source: source.id,
          layout: {},
          paint: {
            "fill-color": source.fillColor,
            "fill-opacity": source.opacity,
          },
        });
        if (source.filter) {
          map.current.setFilter(`${source.id}-fill`, source.filter);
        }
        console.log(`${source.id} loaded`);
      });
    });

    // calls handleMouseEnter when hovering over a fire. Change cursor, highlight fire, generates a popup
    map.current.on("mouseenter", "cal-fires-fill", handleMouseEnter);

    // calls handleMouseLeave on mouse leave, returns cursor styling and removes popup and highlight
    map.current.on("mouseleave", "cal-fires-fill", handleMouseLeave);

    // RRuns once the map is idle (i.e. has fully finished loading)
    map.current.once("idle", () => {
      setLoading(false);
      refreshAcres();

      // Fetch full dataset after the map has initially loaded
      fetchFullData();
    });
  });

  // Fetch full dataset after the map has initially loaded
  let FULL_DATASET;
  async function fetchFullData() {
    console.log("downloading full dataset...");
    await fetch(
      "https://gis.data.cnra.ca.gov/datasets/CALFIRE-Forestry::california-fire-perimeters-1950.geojson?where=1=1&outSR=%7B%22latestWkid%22%3A3857%2C%22wkid%22%3A102100%7D"
    )
      .then((response) => response.json())
      .then((data) => {
        const geojson = data.features;
        FULL_DATASET = simplify(geojson, 0.1);
        // FULL_DATASET = data;

        console.log("full dataset successfully downloaded: ", FULL_DATASET);
        isDataDownloaded = true;
        // set data source to full dataset once downloaded
        if (map.current) {
          map.current.getSource("cal-fires").setData(FULL_DATASET);
          console.log("data source updated to full dataset");
        }
      })
      .catch((error) => console.error("Error:", error));
  }

  // Update map with a filter for the selected year when changed
  function handleYearChange(e) {
    // Fade out
    // map.current.setPaintProperty("cal-fires-fill", "fill-opacity", 0);

    let newYear;

    // Logic for updating year selected
    if (e.target) {
      console.log(e.target)
      const targetId = e.target.id;
      if (targetId === "-") {
        newYear = year - 1;
      } else if (targetId === "+") {
        newYear = year + 1;
      } else if (targetId === "year") {
        console.log(e);
        newYear = e.target.value;
      }
    } else {
      newYear = e;
    }

    setYear(newYear);

    // If full dataset isn't downloaded yet, use queryWildfiresByYear to get updated data selection
    if (isDataDownloaded === false) {
      map.current.getSource("cal-fires").setData(queryWildfiresByYear(newYear));
    }

    // Update filter for new year selected
    map.current.setFilter("cal-fires-fill", [
      "==",
      ["get", "YEAR_"],
      newYear.toString(),
    ]);

    // Fade in after data is updated
    // map.current.setPaintProperty("cal-fires-fill", "fill-opacity", 0.8);

    // Show loading animation until map is idle
    function checkIfLayerIsPainted() {
      if (map.current.isSourceLoaded("cal-fires") && map.current.loaded()) {
        setLoading(false);
        refreshAcres();
        map.current.off("render", checkIfLayerIsPainted);
      }
    }

    map.current.on("render", checkIfLayerIsPainted);
  }

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

      <Year year={year} years={years} handleYearChange={handleYearChange} />

      <Menu
        year={year}
        setYear={setYear}
        years={years}
        handleYearChange={handleYearChange}
        acresBurned={acresBurned}
        lat={lat}
        lng={lng}
        zoom={zoom}
        map={map}
      />

      <div ref={mapContainer} className="map-container" />
    </div>
  );
}

export default App;
