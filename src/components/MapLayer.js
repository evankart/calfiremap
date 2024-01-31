// const dataSources = {
//   urbanAreas: {
//     url: "https://docs.mapbox.com/mapbox-gl-js/assets/ne_50m_urban_areas.geojson",
//     layerName: "urban-areas",
//     // },
//     // counties: {
//     //   url: "https://raw.githubusercontent.com/uber/react-map-gl/master/examples/.data/us-counties.json",
//     //   layerName: "counties",
//     //
//   },
// };
// // };
// // map.current.on("style.load", () => {
// //   dataSources.map((source) => {
// //     map.current.addSource(source.layerName, {
// //       type: "geojson",
// //       data: source.url,
// //     });
// //     map.current.addLayer({
// //       id: `${source.layerName}-fill`,
// //       type: "fill",
// //       source: source.layerName,
// //       layout: {},
// //       paint: {
// //         "fill-color": "#0000f8",
// //         "fill-opacity": 1,
// //       },
// //     });
// //   });
// // });

// const MapLayer = ({ map, dataURL, layerName }) => {
//   map.current.on("style.load", () => {
//     // Get urban areas data
//     map.current.addSource(layerName, {
//       type: "geojson",
//       data: dataURL,
//     });

//     // Add area shapes to map
//     map.current.addLayer({
//       id: `${layerName}-fill`,
//       type: "fill",
//       slot: "middle",
//       source: layerName,
//       layout: {},
//       paint: {
//         "fill-color": "#0000f8",
//         "fill-opacity": 1,
//       },
//     });
//   });

//   return;
// };

// export default MapLayer;
