import React from 'react';
import { TextField, Box } from '@mui/material';

const TruckFormFields = ({ formData, handleChange }) => (
  <Box mt={2}>
    <TextField
      label="餐車名稱"
      name="name"
      value={formData.name}
      onChange={handleChange}
      required
      fullWidth
      margin="normal"
      variant="filled"
      size="small"
      InputLabelProps={{ shrink: true, style: { color: '#e0e0e0' } }}
    />
    <TextField
      label="餐車類型"
      name="type"
      value={formData.type}
      onChange={handleChange}
      required
      fullWidth
      margin="normal"
      variant="filled"
      size="small"
      InputLabelProps={{ shrink: true, style: { color: '#e0e0e0' } }}
    />
    <TextField
      label="地點"
      name="location"
      value={formData.location}
      onChange={handleChange}
      required
      fullWidth
      margin="normal"
      variant="filled"
      size="small"
      InputLabelProps={{ shrink: true, style: { color: '#e0e0e0' } }}
    />
  </Box>
);

export default TruckFormFields;
