import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import ImageUploader from './ImageUploader';
import { verifyAdminPassword } from './useAdminAuth';
import TruckFormFields from './TruckFormFields';

import {
  Button, Stack, Dialog, DialogTitle, DialogActions, DialogContent, TextField, Box
} from '@mui/material';

const AddTruckForm = ({ onClose, adminPassword }) => {
  const [formData, setFormData] = useState({ name: '', type: '', location: '' });
  const [imageUrls, setImageUrls] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [inputPwd, setInputPwd] = useState('');
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });

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

  // 按鈕躲避邏輯
  const handleButtonHover = () => {
    if (!inputPwd.trim()) {
      // 如果密碼為空，按鈕就躲避
      const maxMove = 100;
      const randomX = Math.floor(Math.random() * maxMove * 2 - maxMove);
      const randomY = Math.floor(Math.random() * maxMove * 2 - maxMove);
      setButtonPos({ x: randomX, y: randomY });
    }
  };

  const handleButtonClick = () => {
    if (!inputPwd.trim()) {
      alert('請先輸入密碼！');
      return;
    }
    handleSubmit();
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
            label="管理員密碼"
            type="password"
            fullWidth
            value={inputPwd}
            onChange={(e) => setInputPwd(e.target.value)}
            sx={{ mt: 2 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>取消</Button>
          
          {/* 有趣的躲避按鈕 */}
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Button
              onMouseEnter={handleButtonHover}
              onClick={handleButtonClick}
              variant="contained"
              color="primary"
              sx={{
                transform: `translate(${buttonPos.x}px, ${buttonPos.y}px)`,
                transition: 'transform 0.3s ease',
                position: 'relative',
              }}
            >
              確認新增
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddTruckForm;
