import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import ImageUploader from './ImageUploader';
import { verifyAdminPassword } from './useAdminAuth';
import TruckFormFields from './TruckFormFields';

import {
  TextField, Button, Stack, Dialog, DialogTitle, DialogActions, DialogContent
} from '@mui/material';

const AddTruckForm = ({ onClose, adminPassword }) => {
  const [formData, setFormData] = useState({ name: '', type: '', location: '' });
  const [imageUrls, setImageUrls] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [inputPwd, setInputPwd] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!verifyAdminPassword(inputPwd, adminPassword)) {
      alert('密碼錯誤，新增失敗');
      return;
    }

    try {
      await addDoc(collection(db, 'trucks'), {
        ...formData,
        imageUrls,
        createdAt: serverTimestamp(),
      });
      alert('新增成功');
      setFormData({ name: '', type: '', location: '' });
      setImageUrls([]);
      setInputPwd('');
      setConfirmOpen(false);
      if (onClose) onClose();
    } catch (error) {
      console.error('新增失敗:', error);
      alert('新增失敗');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const { name, type, location } = formData;
    if (!name || !type || !location || imageUrls.length === 0) {
      alert('請填寫所有欄位並上傳圖片');
      return;
    }
    setConfirmOpen(true);
  };

  return (
    <>
      <form onSubmit={handleFormSubmit}>
        <Stack spacing={2}>
          <TruckFormFields formData={formData} handleChange={handleChange} />
          <ImageUploader onUpload={setImageUrls} />
          <Button type="submit" variant="contained" color="warning">
            送出
          </Button>
        </Stack>
      </form>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>確認新增？</DialogTitle>
        <DialogContent>
          <TextField
            label="請輸入管理員密碼"
            type="password"
            fullWidth
            sx={{ mt: 1 }}
            value={inputPwd}
            onChange={(e) => setInputPwd(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>取消</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">確認新增</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddTruckForm;
