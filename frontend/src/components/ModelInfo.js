import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CometPlot from "./CometPlot";

const ModelInfo = () => {
    const { modelId } = useParams();
    const navigate = useNavigate();
    const [model, setModel] = useState(null);
    const [plotData, setPlotData] = useState(null);

    useEffect(() => {
        fetch(`/students_25/bsandi/Segre-Lab-Metabolic-Data-Explorer/app/api/model/${modelId}`)
            .then(res => res.json())
            .then(({ model, plot }) => {
                setModel(model);
                setPlotData(plot);
            })
            .catch((err) => console.error("Error loading model detail:", err));
    }, [modelId]);

    if (!model) return <div>Loading model details...</div>;

    return (
        <div style={{ padding: "2rem" }}>
            <button onClick={() => navigate("/")}>← Back to Home</button>
            <h2>Model Detail: {modelId}</h2>
            <ul>
                {Object.entries(model).map(([key, value]) => (
                    <li key={key}><strong>{key}:</strong> {value}</li>
                ))}
            </ul>

            <h3>Comet Plot</h3>
            <CometPlot data={plotData} />
        </div>
    );
};

export default ModelInfo;
