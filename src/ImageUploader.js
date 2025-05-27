import React, { useState } from 'react';
import { Stack, Button, Typography, CircularProgress } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

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
    const newFiles = Array.from(e.target.files);
    const totalFiles = [...selectedFiles, ...newFiles].slice(0, MAX_IMAGES);
    setSelectedFiles(totalFiles);
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
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

      setUploadedUrls([...uploadedUrls, ...urls]);
      
      // 確保 onUpload 是函數後再呼叫
      if (typeof onUpload === 'function') {
        onUpload([...uploadedUrls, ...urls]);
      }

      setSelectedFiles([]); // 清空已上傳的選擇圖
      
    } catch (err) {
      console.error('Upload failed:', err);
      alert('圖片上傳失敗，請重試');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteUploaded = (index) => {
    setUploadedUrls(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (typeof onUpload === 'function') {
        onUpload(updated); // ❗ 通知父元件更新
      }
      return updated;
    });
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6" color={textColor}>
        圖片上傳（最多 {MAX_IMAGES} 張）
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

       {selectedFiles.length > 0 && (
        <Stack spacing={1}>
          <Typography variant="body2" color={textColor}>
            已選擇圖片：
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {selectedFiles.map((file, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <img
                  src={URL.createObjectURL(file)}
                  alt={`preview-${idx}`}
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFile(idx)}
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    background: '#fff',
                    border: '1px solid #ccc',
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
            ))}
          </Stack>
        </Stack>
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
            上傳成功的圖片：
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {uploadedUrls.map((url, idx) => (
              <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={url}
                  alt={`uploaded-${idx}`}
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    marginRight: '8px'
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleDeleteUploaded(idx)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white'
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
            ))}

          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

export default ImageUploader;