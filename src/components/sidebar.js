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
  );
};

export default Sidebar;
