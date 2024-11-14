import React, { useRef, useEffect, useState } from "react";
import L from 'leaflet';
import 'esri-leaflet';
import "leaflet/dist/leaflet.css";
import "../../src/index.css";
import smoothWheelZoom from './SmoothWheelZoom.js';
import Year from "./Year.js";
import Menu from "./Menu.js";
import Chart from "./Chart.js";
import FIRE_CAUSES from "../data/fire_causes.js"
import { BounceLoader } from "react-spinners"

const LeafletMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const geojsonRef = useRef(null);

  const [lng, setLng] = useState(-118.858224)
  const [lat, setLat] = useState(37.316818)
  const [zoom, setZoom] = useState(6)
  const [year, setYear] = useState(2023)
  const [loading, setLoading] = useState(true)
  const [dataCache, setDataCache] = useState({});
  const [chartData, setChartData] = useState([]);

  const startYear = 1950
  const currentYear = new Date().getFullYear()
  const years = Array.from(
    { length: currentYear - startYear},
    (_, i) => currentYear -1 - i
  )

  useEffect(() => {
    const preloadData = async () => {
      fetchAcresBurnedByYear();
      fetchWildfireData();
    }
    
    async function fetchAcresBurnedByYear() {
      const baseUrl = `https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/California_Fire_Perimeters/FeatureServer/2/query?where=YEAR_>=1950&outFields=YEAR_,GIS_ACRES&returnGeometry=false&f=geojson`;
      let resultOffset = 0;
      const pageSize = 2000;
      const acresByYear = {};
  
      while (true) {
        const url = `${baseUrl}&resultOffset=${resultOffset}&resultRecordCount=${pageSize}`;
        try {
          const response = await fetch(url);
          const data = await response.json();
          data.features.forEach(feature => {
            const year = feature.properties.YEAR_;
            const acres = feature.properties.GIS_ACRES || 0;
            if (acresByYear[year]) acresByYear[year] += acres;
            else acresByYear[year] = acres;
          });
          if (data.features.length < pageSize) break;
          resultOffset += pageSize;
        } catch (error) {
            console.error("Error fetching data:", error);
            break;
        }
      }
  
      const result = Object.entries(acresByYear).map(([year, acres]) => ({
          year: Number(year),
          acres: Math.round(acres),
      }));
  
      setChartData(result);
    }

    async function fetchWildfireData() {
      const cache = {};
      for (let year = currentYear; year >= currentYear - 10; year--) {
        const URL = await queryWildfiresByYear(year);
        await fetch(URL)
          .then((response) => response.json())
          .then((data) => {
            cache[year] = data;
            setDataCache(cache);
          })
      }
    }

    preloadData();
  }, []);

  useEffect(() => {
    if (map.current) return;

    map.current = L.map(mapContainer.current, {
      center: [lat, lng],
      zoom: zoom,
      zoomControl: false,
      scrollWheelZoom: false, 
      smoothWheelZoom: true, 
      smoothSensitivity: 10, 
      detectRetina: true,
    });

    L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${process.env.REACT_APP_MAPBOX_API_KEY}`, {
      attribution: '&copy; <a href="https://leafletjs.com">Leaflet</a> | &copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',      tileSize: 512,
      zoomOffset: -1,
    }).addTo(map.current);

    L.control.zoom({ position: 'topright' }).addTo(map.current);    

    map.current.fitBounds(
      [ [32.5121, -124.6509], [42.0126, -114.1312] ],
      { padding: [-50, -50] }
    );

    map.current.on("moveend", handleMapMove)
  }, []);

  useEffect(() => {
    loadFiresToMap(year)
  }, [year])

  async function loadFiresToMap(year) {
    if (!map.current) return;

    if (geojsonRef.current) {
      map.current.removeLayer(geojsonRef.current);
      geojsonRef.current = null;
    }

    let geojson;

    if (dataCache[year]) {
      geojson = dataCache[year];
    } else {
      const url = queryWildfiresByYear(year);
      const response = await fetch(url);
      geojson = await response.json();
      setDataCache({ ...dataCache, [year]: geojson });
    }

    if (geojsonRef.current) return
    geojsonRef.current = L.geoJSON(geojson, {
      style: {
        color: "#ff7800",
        fillOpacity: 0.8,
        weight: 1,
      },
      onEachFeature: (feature, layer) => {
        const fire = feature.properties
        const FIRE_NAME = fire.FIRE_NAME
        const FIRE_CAUSE = FIRE_CAUSES[fire.CAUSE]
        const ACRES_BURNED = Math.round(fire.GIS_ACRES).toLocaleString("en-US")
        const ALARM_DATE = new Date(fire.ALARM_DATE).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })

        const CONT_DATE = new Date(fire.CONT_DATE).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
        
        const popupContent = `
          <div class="popup-container">
            <h3><strong>${FIRE_NAME} FIRE</strong></h3>
            <h4>${ALARM_DATE} - ${CONT_DATE}</h4>
            <p>
              <strong>Acres Burned:</strong> ${ACRES_BURNED}<br>
              <strong>Cause:</strong> ${FIRE_CAUSE}
            </p>
            ${year >= 2013 ? `<p>${year} CAL FIRE <a href="https://www.fire.ca.gov/incidents/${year}" target="_blank">Incident Archive</a></p>` : ''}
          </div>
        `;
  
      const popup = L.popup().setContent(popupContent);
  
      layer.on({
        mouseover: (e) => {
          clearAllPopups();

          const layer = e.target;
          layer.setStyle({
            color: '#e11e1e',
            fillOpacity: 1,
          });

          const center = layer.getBounds().getCenter();
          popup.setLatLng(center).addTo(map.current);
        },  
        mouseout: (e) => {
          const layer = e.target;
          layer.setStyle({
            color: "#ff7800",
            fillOpacity: 0.8,
          });
        },
        click: (e) => {
          clearAllPopups();

          map.current.flyToBounds(e.target.getBounds());     
          popup.setLatLng(e.latlng).addTo(map.current);
        }
      });
      },
    }).addTo(map.current);

    setLoading(false)
  }

  async function handleYearChange(e) {
    clearAllPopups();

    let newYear
    if (e.target) {
      const targetId = e.target.id
      if (targetId === "-") newYear = year - 1 
      else if (targetId === "+") newYear = year + 1
      else if (targetId === "year") newYear = Number(e.target.value)
    } 
    
    if (newYear >= currentYear || newYear < 1950) return

    setLoading(true)
    setYear(newYear)
  }

  const handleMapMove = () => {
    setLng(map.current.getCenter().lng.toFixed(6))
    setLat(map.current.getCenter().lat.toFixed(6))
    setZoom(map.current.getZoom().toFixed(1))
  }

  const clearAllPopups = () => {
    map.current.eachLayer((layer) => {
      if (layer instanceof L.Popup) {
        map.current.removeLayer(layer);
      }
    });
  }

  const queryWildfiresByYear = (year) => {
    return `https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/California_Fire_Perimeters/FeatureServer/2/query?where=YEAR_=${year}&outFields=*&geometryType=esriGeometryPolygon&f=geojson`;
  };
  
  return (
    <div className="position-relative">

      {loading && (
        <div
          style={{
            position: "absolute",
            zIndex: "3",
            display: "flex",
            width: "100vw",
            height: "100vh",
          }}
        >
          <div style={{ margin: "auto", alignContent: "center" }}>
            <BounceLoader color="#36d7b7" />
          </div>
        </div>
      )}

      <Chart 
        data={chartData} 
        year={year} 
        setYear={setYear}
      />

      <Year 
        year={year} 
        years={years} 
        handleYearChange={handleYearChange} 
      />

      <Menu
        lat={lat}
        lng={lng}
        zoom={zoom}
      />

      <div ref={mapContainer} className="map-container z-1"/>
    </div>
  );
};

export default LeafletMap;