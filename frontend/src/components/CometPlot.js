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
    const imagePath = `/students_25/bsandi/Segre-Lab-Metabolic-Data-Explorer/app/cometplots/comets_vis_${data}.png`;

    return (
        <div className="comet-plot" style={{ textAlign: "center", marginTop: "1rem" }}>
            <img 
                src={imagePath} 
                alt="Comet Plot" 
                style={{ maxWidth: "90%", height: "auto", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}
            />
        </div>
    );
}

export default CometPlot;
