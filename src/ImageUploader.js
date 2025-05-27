import React, { useState } from 'react';
import { Stack, Button, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const CLOUD_NAME = 'duij4v2sx';
const UPLOAD_PRESET = 'CGUfoodtruck_preset';
const MAX_IMAGES = 4;

const ImageUploader = ({ onUpload = () => {} }) => { // 提供預設值
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
    if (!selectedFiles.length) {
      alert('請先選擇圖片');
      return;
    }

    setUploading(true);
    const urls = [];

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`上傳失敗: ${res.statusText}`);
        }

        const data = await res.json();
        urls.push(data.secure_url);
      }

      setUploadedUrls(urls);
      
      // 確保 onUpload 是函數後再呼叫
      if (typeof onUpload === 'function') {
        onUpload(urls);
      }
      
    } catch (err) {
      console.error('Upload failed:', err);
      alert('圖片上傳失敗，請重試');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" color={textColor}>
        圖片上傳
      </Typography>
      
      <Button
        variant="outlined"
        component="label"
        disabled={uploading}
      >
        選擇圖片
        <input
          type="file"
          hidden
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
      </Button>

      {selectedFiles.length > 0 && (
        <Typography variant="body2" color={textColor}>
          已選擇 {selectedFiles.length} 張圖片
        </Typography>
      )}

      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={uploading || selectedFiles.length === 0}
      >
        {uploading ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            上傳中...
          </>
        ) : (
          `上傳 ${selectedFiles.length} 張圖片`
        )}
      </Button>

      {uploadedUrls.length > 0 && (
        <Stack spacing={1}>
          <Typography variant="body2" color={textColor}>
            上傳成功的圖片:
          </Typography>
          {uploadedUrls.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`uploaded-${idx}`}
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'cover',
                borderRadius: '4px'
              }}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default ImageUploader;
