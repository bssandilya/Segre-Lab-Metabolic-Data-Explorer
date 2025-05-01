import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DataTable.css";

function DataTable({ columns, data }) {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRow, setSelectedRow] = useState(null);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [filters, setFilters] = useState({
        species_name: "",
        c_source: "",
        growth_method: "",
        gapfill_method: "",
        annotation_method: "",
    });

    const filterLabels = {
        species_name: "Species Name",
        c_source: "Carbon Source",
        growth_method: "Growth Method",
        gapfill_method: "Gapfill Method",
        annotation_method: "Annotation Method",
    };

    const rowsPerPage = entriesPerPage;

    const filteredData = data.filter(row => {
        return Object.keys(filters).every(column => {
            const filterValue = filters[column].toLowerCase();
            return filterValue === "" || String(row[column]).toLowerCase().includes(filterValue);
        });
    });

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

    const handleRowClick = (row) => {
        setSelectedRow(row);
    };

    const handleMoreInfoClick = () => {
        if (selectedRow) {
            navigate(`/model/${selectedRow.model_id}`);
        }
    };

    const handleFilterChange = (column, value) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [column]: value
        }));
    };

    const handleEntriesPerPageChange = (event) => {
        setEntriesPerPage(Number(event.target.value));
        setCurrentPage(1);
    };

    const downloadCSV = () => {
        const csvHeader = columns.join(",");
        const csvRows = filteredData.map(row =>
            columns.map(col => `"${(row[col] || "").toString().replace(/"/g, '""')}"`).join(",")
        );
        const csvContent = [csvHeader, ...csvRows].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "filtered_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="data-table">
            {/* Filters */}
            <div className="filters" style={{ marginBottom: "1rem", textAlign: "center" }}>
                <h3>Filter by Category</h3>
                <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
                    {Object.keys(filters).map((column, index) => (
                        <div key={index} style={{ marginBottom: "0.5rem" }}>
                            <label htmlFor={column} style={{ marginRight: "0.5rem" }}>
                                {filterLabels[column]}
                            </label>
                            {column === "gapfill_method" || column === "annotation_method" ? (
                                <select
                                    id={column}
                                    value={filters[column]}
                                    onChange={(e) => handleFilterChange(column, e.target.value)}
                                    style={{ padding: "0.5rem", width: "200px" }}
                                >
                                    <option value="">Select {filterLabels[column]}</option>
                                    {column === "gapfill_method" && (
                                        <>
                                            <option value="ModelSEED">ModelSEED</option>
                                            <option value="CarveME">CarveME</option>
                                        </>
                                    )}
                                    {column === "annotation_method" && (
                                        <>
                                            <option value="RefSeq">RefSeq</option>
                                            <option value="eggNOG">eggNOG</option>
                                            <option value="RAST">RAST</option>
                                        </>
                                    )}
                                </select>
                            ) : (
                                <input
                                    id={column}
                                    type="text"
                                    value={filters[column]}
                                    onChange={(e) => handleFilterChange(column, e.target.value)}
                                    placeholder={
                                        column === "species_name"
                                            ? "e.g. Alteromonas macleodii"
                                            : column === "c_source"
                                            ? "e.g. cpd00001"
                                            : column === "growth_method"
                                            ? "e.g. Plate"
                                            : ""
                                    }
                                    style={{ padding: "0.5rem", width: "200px" }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Entries per page & download */}
            <div className="entries-controls" style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                    <label htmlFor="entriesPerPage" style={{ marginRight: "0.5rem" }}>Entries per page:</label>
                    <select
                        id="entriesPerPage"
                        value={entriesPerPage}
                        onChange={handleEntriesPerPageChange}
                        style={{ padding: "0.5rem", width: "150px" }}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </select>
                </div>
                <button
                    onClick={downloadCSV}
                    style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "1rem"
                    }}
                >
                    Download CSV
                </button>
            </div>

            {/* Table */}
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
            <div className="pagination" style={{ textAlign: "left", marginTop: "2rem" }}>
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
