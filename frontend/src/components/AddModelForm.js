import React, { useState } from 'react';

const AddModelForm = () => {
  const [formData, setFormData] = useState({
    carbon_source: '',
    model_file: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Build the full data object to match your team's database expectations
    const submissionData = {
      media: "mbm",
      gapfill_method: "ModelSEED",
      annotation_method: "RAST",
      scientist: "Helen Scott",
      species: "Alteramonas",
      growth_method: "Plate",
      carbon_source: formData.carbon_source,
      model_file: formData.model_file,
      // All other fields will be NULL / left blank by your backend handling
    };

    fetch('/api/add-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData)
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || 'Model added successfully!');
        console.log('Response:', data);
      })
      .catch((err) => {
        console.error('Error:', err);
        alert('Something went wrong!');
      });
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: '20px' }}>
      <h2>Add a New Model</h2>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ marginRight: '10px' }}>Carbon Source (extracted or entered manually):</label>
        <input
          type="text"
          name="carbon_source"
          value={formData.carbon_source}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ marginRight: '10px' }}>Model File Path (XML):</label>
        <input
          type="text"
          name="model_file"
          value={formData.model_file}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit">Submit Model</button>
    </form>
  );
};

export default AddModelForm;
