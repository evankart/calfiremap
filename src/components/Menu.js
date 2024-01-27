import { useRef } from "react";

const Menu = ({
  year,
  setYear,
  handleYearChange,
  acresBurned,
  lat,
  lng,
  zoom,
  map,
}) => {
  const animationInterval = useRef(null);

  function animateMap() {
    console.log("animate map");
    let newYear = year;
    console.log(map);
    let count = 10;
    while (count > 0) {
      newYear -= 1;
      console.log(newYear);
      setYear(newYear);
      handleYearChange(newYear);
      map.current.once("idle", () => {
        console.log("map idle");
      });
      count -= 1;
    }

    // animationInterval.current = setInterval(() => {
    //   newYear -= 1;
    //   console.log(newYear);
    //   setYear(newYear);
    //   handleYearChange(newYear);
    // }, 2000);
  }

  function stopAnimation() {
    console.log("stop animation");
    if (animationInterval.current) {
      clearInterval(animationInterval.current);
      animationInterval.current = null;
    }
  }

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
        <button onClick={animateMap}>Animate Map</button>
        <button onClick={stopAnimation}>Stop Animation</button>
      </div>
    </div>
  );
};

export default Menu;
