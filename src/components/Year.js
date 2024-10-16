import Button from "../components/Button"
const Year = ({ year, years, handleYearChange }) => {
  return (
    <div className="d-flex justify-content-start ">
      <div
        className="filter position-absolute ms-3 mt-3 z-1 p-2 rounded-2 d-flex align-items-center"
        style={{
          backgroundColor: "rgba(35, 55, 75,0.1)",
        }}
      >
        <Button btnText="&lt;" btnId="-" handleYearChange={handleYearChange} />

        <select
          id="year"
          onChange={(e) => {
            handleYearChange(e)
          }}
          value={year}
          style={{
            color: "rgba(3,42,100, 0.7)",
            fontSize: "2.5em",
          }}
          className="bg-light fw-bold rounded-3 border-0 px-2 mx-2"
        >
          {years.map((year, index) => (
            <option className="year-dropdown" style={{fontSize: "1em"}} key={index} value={year}>
              {year}
            </option>
          ))}
        </select>

        <Button btnText="&gt;" btnId="+" handleYearChange={handleYearChange} />
      </div>
    </div>
  )
}

export default Year
