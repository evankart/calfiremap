const Menu = ({ year, acresBurned, lat, lng, zoom }) => {
  return (
    <div>
      <div className="sidebar text-white font-monospace z-1 position-absolute bottom-0 mb-5 rounded-2 fs-6 px-3 py-2 mx-3">
        <div className="text-center mb-2">
          Lng: {lng} | Lat: {lat} | Zoom: {zoom}
        </div>
        <div className="fs-6 mb-2">
          {acresBurned} Acres Burned in {year}
        </div>

        <div className="fs-6">
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
    </div>
  );
};

export default Menu;
