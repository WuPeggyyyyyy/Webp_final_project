import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, IconButton, Typography
} from '@mui/material';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { verifyAdminPassword } from './useAdminAuth';
import TruckFormFields from './TruckFormFields';
import ImageUploader from './ImageUploader';
import DeleteIcon from '@mui/icons-material/Close';

const EditTruckForm = ({ truck, onClose, adminPassword }) => {
  const [editData, setEditData] = useState({ ...truck });
  const [inputPwd, setInputPwd] = useState('');
  const [imageUrls, setImageUrls] = useState(truck.imageUrls || []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadImages = (newUrls) => {
    // 把新圖片合併進現有圖片
    setImageUrls((prev) => [...prev, ...newUrls]);
  };

  const handleDeleteImage = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!verifyAdminPassword(inputPwd, adminPassword)) {
      alert('密碼錯誤，儲存失敗');
      return;
    }

    try {
      await updateDoc(doc(db, 'trucks', truck.id), {
        ...editData,
        imageUrls: imageUrls, // ✅ 更新圖片
      });
      alert('已儲存');
      onClose();
    } catch (err) {
      console.error('儲存失敗：', err);
      alert('儲存失敗');
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>編輯餐車資料</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TruckFormFields formData={editData} handleChange={handleChange} />

          {/* 圖片預覽與刪除 */}
          {imageUrls.length > 0 && (
            <Stack spacing={1}>
              <Typography variant="body2">目前圖片：</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {imageUrls.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={url}
                      alt={`img-${idx}`}
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteImage(idx)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: 'rgba(0,0,0,0.5)',
                        color: '#fff'
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                ))}
              </Stack>
            </Stack>
          )}

          {/* 圖片新增 */}
          <ImageUploader onUpload={handleUploadImages} />

          <TextField
            label="請輸入管理員密碼"
            type="password"
            value={inputPwd}
            onChange={(e) => setInputPwd(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleSave} variant="contained" color="primary">儲存</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTruckForm;
