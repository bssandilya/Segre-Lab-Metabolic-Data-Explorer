import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DataTable.css";

function DataTable({ columns, data }) {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRow, setSelectedRow] = useState(null);
    const rowsPerPage = 5;

    const totalPages = Math.ceil(data.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = data.slice(startIndex, startIndex + rowsPerPage);

    const handleRowClick = (row) => {
        setSelectedRow(row);
    };

    const handleMoreInfoClick = () => {
        if (selectedRow) {
            navigate(`/model/${selectedRow.model_id}`);  // 👈 fixed here: model_id
        }
    };

    return (
        <div className="data-table">
            <table>
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th key={index}>{column}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {currentData.map((row, index) => (
                        <tr 
                            key={index} 
                            onClick={() => handleRowClick(row)}
                            style={{
                                backgroundColor: selectedRow === row ? "#d3e5ff" : "transparent",
                                cursor: "pointer"
                            }}
                        >
                            {columns.map((column, colIndex) => (
                                <td key={colIndex}>{row[column]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="pagination">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                    ← Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                    Next →
                </button>
            </div>

            {/* More Info Button */}
            {selectedRow && (
                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                    <button onClick={handleMoreInfoClick} style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "1rem",
                    }}>
                        More Info About Selected Model
                    </button>
                </div>
            )}
        </div>
    );
}

export default DataTable;
