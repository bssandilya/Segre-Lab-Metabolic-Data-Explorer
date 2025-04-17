import React from "react";
import "../styles/CometPlot.css";

function CometPlot({ data }) {
    return (
        <div className="comet-plot">
            {data && data.length > 0 ? (
                // Render the comet plot using the provided data
                <svg width="800" height="600">
                    {data.map((point, index) => (
                        <circle
                            key={index}
                            cx={point.x}
                            cy={point.y}
                            r={point.radius}
                            fill={point.color}
                        />
                    ))}
                </svg>
            ) : (
                // Show message when no data is available
                <p>Click on a row to render a plot</p>
            )}
        </div>
    );
}

export default CometPlot;