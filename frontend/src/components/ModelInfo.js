import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CometPlot from "./CometPlot";

const ModelInfo = () => {
    const { modelId } = useParams();
    const navigate = useNavigate();
    const [model, setModel] = useState(null);
    const [plotData, setPlotData] = useState(null);
    const [filename, setFilename] = useState(null);

    useEffect(() => {
        fetch(`/students_25/Team5/Segre-Lab-Metabolic-Data-Explorer/app/api/model/${modelId}`)
            .then(res => res.json())
            .then(({ model, plot }) => {
                setModel(model);
                setPlotData(plot);

                const entries = Object.entries(model);
                if (entries.length >= 10) {
                    const fullPath = entries[9][1];  // 10th key-value pair (model_file)
                    const file = fullPath?.split("/").pop();  // extract filename
                    setFilename(file);
                }
            })
            .catch((err) => console.error("Error loading model detail:", err));
    }, [modelId]);

    if (!model) return <div>Loading model details...</div>;

    const modelInfo = Object.entries(model)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");

    const downloadModelInfo = () => {
        const blob = new Blob([modelInfo], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "model_info.txt";
        link.click();
    };

    return (
        <div style={{ padding: "2rem" }}>
            <button onClick={() => navigate("/")}>← Back to Home</button>
            <h2>Model Detail: {modelId}</h2>
            <ul>
                {Object.entries(model).map(([key, value]) => (
                    <li key={key}><strong>{key}:</strong> {value}</li>
                ))}
            </ul>

            <div style={{ marginTop: "1rem" }}>
                {/* Download Model File Button */}
                {filename && (
                    <a
                        href={`/students_25/Team5/Segre-Lab-Metabolic-Data-Explorer/app/xml_files/${encodeURIComponent(filename)}`}
                        download
                        style={{
                            display: "inline-block",
                            padding: "0.5rem 1rem",
                            backgroundColor: "#007BFF",
                            color: "#fff",
                            borderRadius: "4px",
                            textDecoration: "none",
                            marginRight: "1rem",
                        }}
                    >
                        Download Model File
                    </a>
                )}

                {/* Download Model Info Button */}
                <button
                    onClick={downloadModelInfo}
                    style={{
                        display: "inline-block",
                        padding: "0.5rem 1rem",
                        backgroundColor: "#007BFF",
                        color: "#fff",
                        borderRadius: "4px",
                        textDecoration: "none",
                        marginRight: "1rem",
                    }}
                >
                    Download Model Info
                </button>
            </div>

            <h3>Comet Plot</h3>
            <CometPlot data={plotData} />
        </div>
    );
};

export default ModelInfo;
