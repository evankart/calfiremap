const Menu = (props) => {
  return (
    <div>
      <div className="sidebar z-1 position-absolute mb-5 rounded-2 fs-6 px-4 py-3 mx-3">
        <div className="fs-6 mb-2">
          <strong>{props.acresBurned == 0 ? "" : props.acresBurned}</strong> Acres Burned in {props.year}
        </div>

        <div className="fs-6">
          {" "}
          Data provided by the{" "}
          <a
            href="https://gis.data.cnra.ca.gov/datasets/CALFIRE-Forestry::california-fire-perimeters-1950/about"
          >
            California Department of Forestry and Fire Protection
          </a>
          .
        </div>

        <div className="text-end lat-lng">
          Lng: {props.lng} | Lat: {props.lat} | Zoom: {props.zoom}
        </div>
      </div>
    </div>
  )
}

export default Menu
