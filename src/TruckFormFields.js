import React from 'react';

const TruckFormFields = ({ formData, handleChange }) => (
  <>
    <input
      type="text"
      name="name"
      placeholder="餐車名稱"
      value={formData.name}
      onChange={handleChange}
      required
    />
    <input
      type="text"
      name="type"
      placeholder="餐車類型"
      value={formData.type}
      onChange={handleChange}
      required
    />
    <input
      type="text"
      name="location"
      placeholder="地點"
      value={formData.location}
      onChange={handleChange}
      required
    />
  </>
);

export default TruckFormFields;
