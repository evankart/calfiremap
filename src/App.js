import React, { useRef, useEffect, useState } from "react"
import mapboxgl from "mapbox-gl"
import * as turf from '@turf/turf';
import "mapbox-gl/dist/mapbox-gl.css"
import "./index.css"
import { BounceLoader } from "react-spinners"
import Menu from "./components/Menu.js"
import Year from "./components/Year.js"
// import { getDataSources } from "./data/dataSources.js"
import { queryWildfiresByYear } from "./data/dataSources.js"

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
}

function App() {
  mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_API_KEY
  const mapContainer = useRef(null)
  const map = useRef(null)

  let mq = window.matchMedia("(min-width: 420px)")
  let initialZoom
  let initialLat
  let initialLng
  if (mq.matches) {
    initialZoom = 5.2 // desktop zoom
    initialLat = 37.476313 // desktop lat
    initialLng = -120.82628 // desktop lng
  } else {
    initialZoom = 4.7 // mobile zoom
    initialLat = 35.955012 // mobile lat
    initialLng = -119.107817 // mobile lng
  }

  const [lng, setLng] = useState(initialLng)
  const [lat, setLat] = useState(initialLat)
  const [zoom, setZoom] = useState(initialZoom)
  const [year, setYear] = useState(2020)
  const [loading, setLoading] = useState(true)
  const [acresBurned, setAcresBurned] = useState(0)

  const startYear = 1950
  const currentYear = new Date().getFullYear() - 1
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => currentYear - i
  )

  function refreshAcres() {
    let fireArray = []
    let allFeatures = map.current.querySourceFeatures("cal-fires")
    setAcresBurned(0)
    let acresBurnedCount = 0

    allFeatures.forEach((feature) => {
      if (!fireArray.includes(feature.properties.FIRE_NAME)) {
        fireArray.push(feature.properties.FIRE_NAME)
        acresBurnedCount += feature.properties.GIS_ACRES
      }
    })

    acresBurnedCount = acresBurnedCount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })

    setAcresBurned(acresBurnedCount)
  }

  const createPopup = () => {
    return new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
    })
  }

  let popup
  const handleMouseEnter = (e) => {
    popup = createPopup()
    map.current.getCanvas().style.cursor = "pointer"

    const fire = e.features[0].properties
    const FIRE_NAME = fire.FIRE_NAME
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
    const FIRE_CAUSE = FIRE_CAUSES[fire.CAUSE]

    map.current.addLayer({
      id: "hover",
      type: "fill",
      source: "cal-fires",
      paint: {
        "fill-color": "#e11e1e",
        "fill-opacity": 1,
      },
      filter: ["==", "FIRE_NAME", FIRE_NAME],
    })

    popup
      .setLngLat([e.lngLat.lng.toFixed(6), e.lngLat.lat.toFixed(6)])
      .setHTML(
        `
        <div class="popup-container">
          <h3><strong>${FIRE_NAME} FIRE</strong></h3>
          <h4>${ALARM_DATE} - ${CONT_DATE}</h4>
          <p>
            <strong>Acres Burned:</strong> ${ACRES_BURNED}<br>
            <strong>Cause:</strong> ${FIRE_CAUSE}
          </p>
        </div> 
           `
      )
      .addTo(map.current)
  }

  const handleMouseLeave = (e) => {
    map.current.getCanvas().style.cursor = ""
    popup.remove()

    if (map.current.getLayer("hover")) {
      map.current.removeLayer("hover")
    }
  }

  const handleMapMove = () => {
    setLng(map.current.getCenter().lng.toFixed(6))
    setLat(map.current.getCenter().lat.toFixed(6))
    setZoom(map.current.getZoom().toFixed(1))
  }

  useEffect(() => {
    // initialize map
    if (map.current) return
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [lng, lat],
      zoom: zoom,
    })

    map.current.addControl(new mapboxgl.NavigationControl());

    map.current.on("style.load", () => {

      // Loops through dataSources array and adds all layers to map

      map.current.addSource("cal-fires", {
        type: "geojson",
        data: queryWildfiresByYear(year),
      })

      map.current.addLayer({
        id: "cal-fires-fill",
        type: "fill",
        source: "cal-fires",
        layout: {},
        paint: {
          "fill-color": "#ff601c",
          "fill-opacity": 0.8,
        },
      })
    })

    map.current.once("idle", () => {
      setLoading(false)
      fetchFullData()
      refreshAcres()
    })

    map.current.on("click", "cal-fires-fill", zoomToFire)
    map.current.on("move", handleMapMove)
    map.current.on("mouseenter", "cal-fires-fill", handleMouseEnter)
    map.current.on("mouseleave", "cal-fires-fill", handleMouseLeave)
  })

  function zoomToFire(e) {
    const bbox = turf.bbox(e.features[0])
    map.current.fitBounds(bbox, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 }, 
    });
  }

  async function fetchFullData() {
    await fetch(
      "https://gis.data.cnra.ca.gov/datasets/CALFIRE-Forestry::california-fire-perimeters-1950.geojson?where=1=1&outSR=%7B%22latestWkid%22%3A3857%2C%22wkid%22%3A102100%7D"
    )
      .then((response) => response.json())
      .then((data) => {
        map.current.getSource("cal-fires") 
            && map.current.getSource("cal-fires").setData(data.feature)
      })
      .catch((error) => console.error("Error:", error))
  }

  function handleYearChange(e) {
    let newYear
    setLoading(true)
    refreshAcres()

    if (e.target) {
      const targetId = e.target.id
      if (targetId === "-") {
        newYear = year - 1
      } else if (targetId === "+") {
        newYear = year + 1
      } else if (targetId === "year") {
        newYear = Number(e.target.value)
      }
    } else {
      newYear = e
    }

    setYear(newYear)

    map.current.getLayer("cal-fires-fill") 
      && map.current.removeLayer("cal-fires-fill")
    map.current.getSource("cal-fires") 
      && map.current.removeSource("cal-fires")

    map.current.addSource("cal-fires", {
      type: "geojson",
      data: queryWildfiresByYear(newYear),
    })

    map.current.addLayer({
      id: "cal-fires-fill",
      type: "fill",
      source: "cal-fires",
      layout: {},
      paint: {
        "fill-color": "#ff601c",
        "fill-opacity": 0.8,
      },
    })

    map.current.on("idle", () => {  
      setLoading(false)
    })

    function checkIfLayerIsPainted() {
      if (map.current.isSourceLoaded("cal-fires") && map.current.loaded()) {
        setLoading(false)
        refreshAcres()
        map.current.off("render", checkIfLayerIsPainted)
      }
    }

    map.current.on("render", checkIfLayerIsPainted)
  }

  return (
    <div>
      {loading && (
        <div
          style={{
            position: "absolute",
            zIndex: "1",
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

      <Year 
        year={year} 
        years={years} 
        handleYearChange={handleYearChange} 
      />

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
  )
}

export default App
