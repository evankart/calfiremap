const Location = ({ lat, lng, zoom }) => {
  return (
    <div
      className="location"
      style={{
        padding: "0 10px",
        lineHeight: "1rem",
        fontSize: "0.85rem",
        maxWidth: "350px",
        position: "absolute",
        bottom: "30px",
        right: " 10px",
        backgroundColor: "rgba(35, 55, 75,0.9)",
        color: "white",
        borderRadius: "4px",
        zIndex: "2",
      }}
    >
      <div style={{ margin: "10px 5px" }}>
        Lng: {lng} | Lat: {lat} | Zoom: {zoom}
      </div>
    </div>
  );
};

export default Location;
