import Plot from 'react-plotly.js';

const Chart = (props) => {

    const handleClick = (e) => {
        const point = e.points[0];
        const year = point.x; 
        props.setYear(year);
    };

    return (
        <div className="chart position-absolute bottom-0 end-0 z-3 mb-5 me-4 rounded-3 p-1 bg-white d-flex justify-content-center align-items-center d-none d-xl-block" style={{ minHeight: '200px' }}>
            <Plot
                className={`${props.data.length === 0 ? 'd-none' : 'block'}`}
                data={[
                    {
                        x: props.data.map(d => d.year),
                        y: props.data.map(d => d.acres),
                        type: 'bar',
                        marker: { 
                            color: '#ff7800',
                            opacity: props.data.map(d => 
                                d.year === props.year ? '1' : '0.5'
                            ),
                            size: 6
                        },
                        hoverinfo: 'none',
                    },
                ]}
                layout={{
                    title: {
                        text: 'Total Acres Burned per Year',
                        font: { size: 16 },
                        x: 0.35,
                        xanchor: 'center', 
                        y: 0.9,
                        xanchor: 'left',
                        yanchor: 'top',
                    },
                    xaxis: {
                        showgrid: false,
                        zeroline: false,
                        color: '#777',
                        tickformat: '%Y', 
                        tickangle: -45, 
                        dtick: 5,

                    },
                    yaxis: {
                        title: {
                            text: 'Acres Burned',
                            standoff: 400, 
                        },
                        showgrid: true,
                        zeroline: false,
                        color: '#777',
                    },
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    paper_bgcolor: 'rgba(255,255,255,0.8)',
                    margin: { l: 50, r: 10, t: 50, b: 30 }, 
                    height: 200, 
                    annotations: [
                        {
                            x: 0.98,
                            y: 1.3,
                            xref: 'paper',
                            yref: 'paper',
                            text: `${props.year}: ${Math.round(props.data.find(d => d.year === props.year)?.acres).toLocaleString()} Acres`,
                            showarrow: false,
                            font: {
                                size: 12,
                                color: '#333',
                            },
                            bgcolor: '#ffffff',
                            bordercolor: 'rgba(255,120,0,0.7)',
                            borderradius: 4,
                            borderwidth: 1.25,
                            borderpad: 4,
                        }
                    ],
                }}
                config={{displayModeBar: false}}
                onClick={handleClick}
            />
        </div>
    );
};

export default Chart;
