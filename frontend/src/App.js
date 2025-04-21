import React, { useState, useEffect } from 'react';
import DataTable from './components/DataTable';
import Header from './components/Header';
import CometPlot from './components/CometPlot';
import AddModelForm from './components/AddModelForm';


const App = () => {
    const [columns, setColumns] = useState([]); // Store the dynamically generated column names
    const [data, setData] = useState([]); // Store fetched data
    const [cometImage, setCometImage] = useState(null); // Store the comet image

    useEffect(() => {
        fetch("/students_25/bsandi/Segre-Lab-Metabolic-Data-Explorer/app/api/tables")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then((fetchedData) => {
                setData(fetchedData);
                if (fetchedData.length > 0) {
                    setColumns(fetchedData); // Extract column names from the first row
                }
            })
            .catch((err) => console.error("Error fetching data:", err));
    }, []);

    return (
        <div>
            {/* Pass columns and data to the Header */}
            <Header columns={columns} data={data} />
            <br />
            {/* Add New Model Form */}
            <AddModelForm />
            <br />
            <CometPlot data={cometImage} />
            <br />
            {columns.length > 0 ? (
                <DataTable columns={columns} data={data} />
            ) : (
                <div id='data_table_loading'>Loading...</div>
            )}
        </div>
    );
};

export default App;