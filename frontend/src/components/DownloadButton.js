import React from "react";
import "../styles/DownloadButton.css";

function DownloadButton({ onClick }) {
    return (
        <button onClick={onClick} className="download-button">
            Download CSV
        </button>
    );
}

export default DownloadButton;