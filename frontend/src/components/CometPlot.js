import React from "react";
import "../styles/CometPlot.css";

function CometPlot({ data }) {
    if (!data || typeof data !== "string") {
        return (
            <div className="comet-plot">
                <p style={{ textAlign: "center", marginTop: "1rem" }}>
                    Click on a row to render a plot.
                </p>
            </div>
        );
    }

    // Assume 'data' is the model ID, and images are named like 'comets_vis_<mid>.png'
    const gridPlotPath = `/students_25/Team5/Segre-Lab-Metabolic-Data-Explorer/app/cometsplots/model_${data}_gridplot.png`;
    const linePlotPath = `/students_25/Team5/Segre-Lab-Metabolic-Data-Explorer/app/cometsplots/model_${data}_lineplot.png`;

    return (
        <div className="comet-plot" style={{ textAlign: "center", marginTop: "1rem" }}>
            {/* Display the grid plot */}
            <div style={{ marginBottom: "1rem" }}>
                <img 
                    src={gridPlotPath} 
                    alt="Comet Grid Plot" 
                    style={{ maxWidth: "90%", height: "auto", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}
                />
            </div>

            {/* Display the line plot */}
            <div>
                <img 
                    src={linePlotPath} 
                    alt="Comet Line Plot" 
                    style={{ maxWidth: "90%", height: "auto", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}
                />
            </div>
        </div>
    );
}


export default CometPlot;
