const Menu = (props) => {
  return (
    <div>
      <div className="sidebar z-3 position-absolute mb-5 rounded-2 fs-6 px-4 py-3 mx-4 bottom-0 bg-white">
          Data provided by the{" "}
          <a href="https://gis.data.ca.gov/datasets/CALFIRE-Forestry::california-historical-fire-perimeters/about?layer=2" target="_blank">
              California Department of Forestry and Fire Protection
          </a>.
        <div className="text-end lat-lng">
          Lng: {props.lng} | Lat: {props.lat} | Zoom: {props.zoom}
        </div>
      </div>
    </div>
  )
}

export default Menu
