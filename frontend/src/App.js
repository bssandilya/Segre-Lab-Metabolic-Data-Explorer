import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DataTable from './components/DataTable';
import Header from './components/Header';
import ModelInfo from './components/ModelInfo';

const App = () => {
    const [columns, setColumns] = useState([]);
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch("/students_25/bsandi/Segre-Lab-Metabolic-Data-Explorer/app/api/joined-data")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then((fetchedData) => {
                setColumns(fetchedData.columns || []);
                const formatted = (fetchedData.rows || []).map((row) =>
                    Object.fromEntries(fetchedData.columns.map((col, i) => [col, row[i]]))
                );
                setData(formatted);
            })
            .catch((err) => console.error("Error fetching model table:", err));
    }, []);

    return (
        <Router basename="/students_25/bsandi/Segre-Lab-Metabolic-Data-Explorer/app">
            <div>
                <Header columns={columns} data={data} />
                <br />
                <Routes>
                    <Route 
                        index 
                        element={
                            <div>
                                {columns.length > 0 ? (
                                    <DataTable columns={columns} data={data} />
                                ) : (
                                    <div id='data_table_loading'>Loading table...</div>
                                )}
                            </div>
                        }
                    />
                    <Route path="model/:modelId" element={<ModelInfo />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
