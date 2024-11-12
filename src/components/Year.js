import Button from "../components/Button"

const Year = (props) => {
  return (
    <div className="d-flex justify-content-start ">
      <div
        className="filter position-absolute ms-3 mt-3 z-1 p-2 rounded-2 d-flex align-items-center"
        style={{
          backgroundColor: "rgba(35, 55, 75,0.1)",
        }}
      >
        <Button btnText="&lt;" btnId="-" handleYearChange={props.handleYearChange} year={props.year} currentYear={props.currentYear}/>

        <select
          id="year"
          onChange={(e) => {
            props.handleYearChange(e)
          }}
          value={props.year}
          style={{
            color: "rgba(3,42,100, 0.7)",
            fontSize: "2.5em",
          }}
          className="bg-light fw-bold rounded-3 border-0 px-2 mx-2"
        >
          {props.years.map((year, index) => (
            <option className="year-dropdown" style={{fontSize: "1em"}} key={index} value={year}>
              {year}
            </option>
          ))}
        </select>

        <Button btnText="&gt;" btnId="+" handleYearChange={props.handleYearChange} year={props.year} currentYear={props.currentYear} />
      </div>
    </div>
  )
}

export default Year
