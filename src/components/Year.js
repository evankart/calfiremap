const Year = ({ year, years, handleYearChange }) => {
  return (
    <div
      className="filter position-absolute"
      style={{
        // position: "absolute",
        top: "10px",
        left: "20px",
        margin: "10px 5px",
        zIndex: "1",
        backgroundColor: "rgba(35, 55, 75,0.1)",
        padding: "8px 10px",
        borderRadius: "8px",
        fontSize: "3rem",
        display: "flex",
        alignItems: "center",
      }}
    >
      <button
        id="-"
        onClick={(e) => {
          handleYearChange(e);
        }}
        style={{
          backgroundColor: "#f5f5f5",
          color: "rgba(3,42,100, 0.7)",
          fontWeight: "bold",
          borderRadius: "14px",
          boxShadow: "none",
          border: "none",
          padding: "4px 10px",
          fontSize: "2rem",
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
          color: "rgba(3,42,100, 0.7)",
          fontWeight: "bold",
          borderRadius: "14px",
          boxShadow: "none",
          border: "none",
          padding: "4px 10px",
          margin: "0 8px",
          fontSize: "3rem",
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
          color: "rgba(3,42,100, 0.7)",
          fontWeight: "bold",
          borderRadius: "14px",
          boxShadow: "none",
          border: "none",
          padding: "4px 10px",
          fontSize: "2rem",
        }}
      >
        &gt;
      </button>
    </div>
  );
};

export default Year;
