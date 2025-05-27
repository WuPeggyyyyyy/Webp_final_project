import React from 'react';
import {
  TextField,
  Typography,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const TruckFormFields = ({ formData, handleChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const labelColor = isDark ? '#e0e0e0' : '#000000';

  const truckTypes = [
    "台式料理", "中式料理", "日式料理", "韓式料理", "西式料理",
    "素食", "甜點／甜品", "飲料／咖啡", "麵食",
    "海鮮", "烤肉／燒烤", "速食", "早餐", "炸物", "其他"
  ];

  const locations = [
    "管理大樓", "工學大樓", "明德樓", "藴德樓"
  ];

  return (
    <Box mt={2}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: '#f9a825', fontWeight: 'bold' }}
      >
        新增餐車
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="餐車名稱"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          fullWidth
          variant="outlined"
          InputLabelProps={{ style: { color: labelColor } }}
          InputProps={{ style: { color: labelColor } }}
        />

        <FormControl fullWidth required>
          <InputLabel sx={{ color: labelColor }}>餐點類型</InputLabel>
          <Select
            name="type"
            value={formData.type}
            onChange={handleChange}
            label="餐點類型"
            sx={{ color: labelColor }}
          >
            {truckTypes.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth required>
          <InputLabel sx={{ color: labelColor }}>地點</InputLabel>
          <Select
            name="location"
            value={formData.location}
            onChange={handleChange}
            label="地點"
            sx={{ color: labelColor }}
          >
            {locations.map((loc) => (
              <MenuItem key={loc} value={loc}>{loc}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Box>
  );
};

export default TruckFormFields;
