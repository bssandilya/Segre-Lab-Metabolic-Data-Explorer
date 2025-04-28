import React, { useState } from 'react';

const AddModelForm = () => {
  const [formData, setFormData] = useState({
    carbon_source_name: '',
    species_name: '',
    model_file_path: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Build the submission object
    const submissionData = {
      carbon_source_name: formData.carbon_source_name,
      species_name: formData.species_name,
      model_file_path: formData.model_file_path,
      // Other fields will be filled in automatically by the backend
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

        // Optionally clear form after submission
        setFormData({
          carbon_source_name: '',
          species_name: '',
          model_file_path: ''
        });
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
        <label style={{ marginRight: '10px' }}>Carbon Source Name:</label>
        <input
          type="text"
          name="carbon_source_name"
          value={formData.carbon_source_name}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ marginRight: '10px' }}>Species Name:</label>
        <input
          type="text"
          name="species_name"
          value={formData.species_name}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ marginRight: '10px' }}>Model File Path (XML):</label>
        <input
          type="text"
          name="model_file_path"
          value={formData.model_file_path}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit">Submit Model</button>
    </form>
  );
};

export default AddModelForm;
