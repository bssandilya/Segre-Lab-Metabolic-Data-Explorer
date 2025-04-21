import React, { useState } from 'react';

const AddModelForm = () => {
  const [formData, setFormData] = useState({
    model_id: '',
    carbon_id: '',
    species_id: '',
    media_id: '',
    experiment_id: '',
    gapfill_method: 'CarveMe',
    annotation_method: 'CarveMe',
    metabolite_ID: '',
    platform: 'CarveMe',
    biomass_composition: 'gram_pos',
    date_created: '',
    control_type: 'pos',
    notes: '',
    parent_model_id: '',
    model_file: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/api/add-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
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
      <h2>Add New Model</h2>
      {Object.keys(formData).map((key) => (
        <div key={key} style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '10px' }}>{key}:</label>
          {['gapfill_method', 'annotation_method', 'platform'].includes(key) ? (
            <select name={key} value={formData[key]} onChange={handleChange}>
              <option value="CarveMe">CarveMe</option>
              <option value="ModelSEED">ModelSEED</option>
              <option value="KBase">KBase</option>
            </select>
          ) : key === 'biomass_composition' ? (
            <select name={key} value={formData[key]} onChange={handleChange}>
              <option value="gram_pos">gram_pos</option>
              <option value="gram_neg">gram_neg</option>
              <option value="other">other</option>
            </select>
          ) : key === 'control_type' ? (
            <select name={key} value={formData[key]} onChange={handleChange}>
              <option value="pos">pos</option>
              <option value="neg">neg</option>
            </select>
          ) : key === 'date_created' ? (
            <input type="date" name={key} value={formData[key]} onChange={handleChange} />
          ) : (
            <input
              type="text"
              name={key}
              value={formData[key]}
              onChange={handleChange}
            />
          )}
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
};

export default AddModelForm;
