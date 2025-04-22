import React from "react";
import "../styles/Header.css";
import DownloadButton from "./DownloadButton";

function Header({ columns, data }) {
    const handleDownload = () => {
        if (!columns.length || !data.length) {
            console.error("No data available for download.");
            return;
        }
        // Convert data to CSV format
        const csvContent = [
            columns.join(","), // Add column headers
            ...data.map(row => columns.map(column => row[column]).join(",")) // Add rows
        ].join("\n");

        // Create a Blob and a download link
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "data.csv";
        link.click();
    };

    return (
        <div className="header">
            <h1>Segre Lab Metabolic Data Explorer</h1>
            <DownloadButton onClick={handleDownload} />
        </div>
    );
}

export default Header;