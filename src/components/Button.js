const Button = ({ btnText, btnId, handleYearChange }) => {
  return (
    <div>
      <button
        id={btnId}
        onClick={(e) => {
          handleYearChange(e)
        }}
        style={{
          color: "rgba(3,42,100, 0.7)",
        }}
        className="bg-light fw-bold rounded-3 border-0 px-2 fs-3"
      >
        {btnText}
      </button>
    </div>
  )
}

export default Button
