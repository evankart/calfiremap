const Button = (props) => {
  return (
    <div>
      <button
        id={props.btnId}
        onClick={(e) => {
          props.handleYearChange(e)
        }}
        style={{
          color: "rgba(3,42,100, 0.7)",
        }}
        className="bg-light fw-bold rounded-3 border-0 px-2 fs-3"
      >
        {props.btnText}
      </button>
    </div>
  )
}

export default Button
