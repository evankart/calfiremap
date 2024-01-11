const Sidebar = ({ year, years, acresBurned, handleYearChange }) => {
  return (
    <div
      className="sidebar"
      style={{
        padding: "0 10px",
        lineHeight: "1.15em",
        fontSize: "0.9rem",
        maxWidth: "375px",
      }}
    >
      <div style={{ margin: "10px 5px" }}>{acresBurned} Acres Burned</div>

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
  );
};

export default Sidebar;
