import React, { useState, useEffect } from 'react';
import DataTable from './components/DataTable';
import Header from './components/Header';

const App = () => {
    const [columns, setColumns] = useState([]); // Store the dynamically generated column names
    const [data, setData] = useState([]); // Store fetched data

    useEffect(() => {
        // Fetch data when the component is mounted
        fetch("/students_25/bsandi/Segre-Lab-Metabolic-Data-Explorer/app/api/tables")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then((fetchedData) => {
                setData(fetchedData);
                // Generate column names dynamically from the first object of the fetched data
                if (fetchedData.length > 0) {
                    setColumns(fetchedData);
                }
            })
            .catch((err) => console.error("Error fetching data:", err));
    }, []);

    return (
        <div>
            <Header />
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
