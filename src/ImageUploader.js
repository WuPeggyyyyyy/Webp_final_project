import React, { useState } from 'react';
import { Stack, Button, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const CLOUD_NAME = 'duij4v2sx';
const UPLOAD_PRESET = 'CGUfoodtruck_preset';
const MAX_IMAGES = 4;

const ImageUploader = ({ onUpload }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const textColor = isDark ? '#e0e0e0' : '#000000';

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, MAX_IMAGES);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    setUploading(true);
    const urls = [];

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        urls.push(data.secure_url);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    setUploadedUrls(urls);
    onUpload(urls);
    setUploading(false);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" sx={{ color: textColor }}>
        圖片上傳
      </Typography>

      <Button variant="contained" component="label" color="warning">
        選擇圖片
        <input
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFileChange}
          disabled={uploading}
        />
      </Button>

      <Button
        variant="outlined"
        onClick={handleUpload}
        disabled={uploading || selectedFiles.length === 0}
      >
        {uploading ? <CircularProgress size={20} /> : `上傳 ${selectedFiles.length} 張圖片`}
      </Button>

      {uploadedUrls.length > 0 && (
        <Stack direction="row" spacing={1}>
          {uploadedUrls.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`上傳圖片 ${idx + 1}`}
              style={{ width: 60, height: 60, borderRadius: 8 }}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default ImageUploader;