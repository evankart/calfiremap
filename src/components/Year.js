const Year = (props) => {
  return (
    <div className="d-flex justify-content-start z-3">
      <div
        className="filter position-absolute ms-3 mt-3 z-3 p-2 rounded-2 d-flex align-items-center"
        style={{ backgroundColor: "rgba(35, 55, 75,0.1)"}}
      >
        <button
          id="-"
          onClick={props.handleYearChange}
          style={{color: "rgba(3,42,100, 0.7)"}}
          className="bg-light fw-bold rounded-3 border-0 px-2 fs-3"
        >
          &lt;
        </button>

        <select
          id="year"
          onChange={props.handleYearChange}
          value={props.year}
          style={{color: "rgba(3,42,100, 0.7)", fontSize: "2.5em"}}
          className="bg-light fw-bold rounded-3 border-0 px-2 mx-2"
        >
          {props.years.map((year, index) => (
            <option className="year-dropdown" key={index} value={year}>{year}</option>
          ))}
        </select>

        <button
          id="+"
          onClick={props.handleYearChange}
          style={{color: "rgba(3,42,100, 0.7)"}}
          className="bg-light fw-bold rounded-3 border-0 px-2 fs-3"
        >
          &gt;
        </button>
      </div>
    </div>
  )
}

export default Year
