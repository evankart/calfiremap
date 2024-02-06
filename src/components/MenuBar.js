import { useRef, useState, useEffect } from "react";

const Menu = ({
  year,
  setYear,
  handleYearChange,
  acresBurned,
  lat,
  lng,
  zoom,
  map,
  wildlifeRangeDataSources,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDataSources, setFilteredDataSources] = useState([]);

  const animationInterval = useRef(null);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredDataSources(wildlifeRangeDataSources);
    } else {
      setFilteredDataSources(
        wildlifeRangeDataSources.filter((dataSource) =>
          dataSource.id
            .substring(0, dataSource.id.indexOf("-range-cwhr"))
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm]);

  // function animateMap() {
  //   console.log("animate map");
  //   let newYear = year;
  //   console.log(map);
  //   let count = 10;
  //   while (count > 0) {
  //     newYear -= 1;
  //     console.log(newYear);
  //     setYear(newYear);
  //     handleYearChange(newYear);
  //     map.current.once("idle", () => {
  //       console.log("map idle");
  //     });
  //     count -= 1;
  //   }

  //   // animationInterval.current = setInterval(() => {
  //   //   newYear -= 1;
  //   //   console.log(newYear);
  //   //   setYear(newYear);
  //   //   handleYearChange(newYear);
  //   // }, 2000);
  // }

  // function stopAnimation() {
  //   console.log("stop animation");
  //   if (animationInterval.current) {
  //     clearInterval(animationInterval.current);
  //     animationInterval.current = null;
  //   }
  // }

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

        <div className="mt-2">
          <input
            type="text"
            className="rounded-4 px-2 "
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {filteredDataSources ? (
            filteredDataSources.map((source) => (
              <div key={source.id}>
                <div className="fs-6 mb-2">
                  <div
                    className="legend px-2 w-50 mt-2 d-flex space-between justify-content-between"
                    style={{
                      backgroundColor: source.fillColor,
                      textShadow: "1px 1px 2px black",
                    }}
                  >
                    {source.id.substring(0, source.id.indexOf("-range-cwhr"))}
                    <input
                      type="checkbox"
                      // checked={isChecked}
                      // onChange={(e) => setIsChecked(e.target.checked)}
                    />
                    {/* {isChecked ? "Checked" : "Not checked"} */}
                  </div>
                </div>

                <div className="fs-6">
                  <div
                    className="legend"
                    style={{ backgroundColor: source.color }}
                  ></div>
                  <span>{source.name}</span>
                </div>
              </div>
            ))
          ) : (
            <div>No data sources found</div>
          )}
        </div>
        {/* {wildlifeRangeDataSources.map((source) => {
          return (
            
          );
        })} */}
        {/* <button onClick={animateMap}>Animate Map</button>
        <button onClick={stopAnimation}>Stop Animation</button> */}
      </div>
      {/* add legend for data source color */}
    </div>
  );
};

export default Menu;
