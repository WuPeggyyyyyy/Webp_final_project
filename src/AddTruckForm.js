import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import ImageUploader from './ImageUploader';
import { verifyAdminPassword } from './useAdminAuth';
import TruckFormFields from './TruckFormFields';
import { Button, Stack, Dialog, DialogTitle, DialogActions, DialogContent, TextField, Box } from '@mui/material';

const AddTruckForm = ({ open, onClose, adminPassword }) => {
  const [formData, setFormData] = useState({ name: '', type: '', location: '' });
  const [imageUrls, setImageUrls] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [inputPwd, setInputPwd] = useState('');
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 新增缺少的 handleFormSubmit 函數
  const handleFormSubmit = () => {
    if (!formData.name || !formData.type || !formData.location || imageUrls.length === 0) {
      alert('請填寫所有欄位並上傳至少一張圖片');
      return;
    }
    setConfirmOpen(true);
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

  const formIncomplete = !formData.name || !formData.type || !formData.location || imageUrls.length === 0;

  // 按鈕躲避邏輯
  const handleButtonHover = () => {
    if (!inputPwd.trim()) {
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
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>新增餐車</DialogTitle>
        <DialogContent>
          <TruckFormFields formData={formData} handleChange={handleChange} />
          <ImageUploader imageUrls={imageUrls} setImageUrls={setImageUrls} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>取消</Button>
          <Button 
            onClick={handleFormSubmit} 
            variant="contained" 
            disabled={formIncomplete}
          >
            新增餐車
          </Button>
        </DialogActions>
      </Dialog>

      {/* 密碼確認對話框 */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>確認新增餐車</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="請輸入管理員密碼"
            type="password"
            fullWidth
            variant="outlined"
            value={inputPwd}
            onChange={(e) => setInputPwd(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>取消</Button>
          <Box sx={{ position: 'relative' }}>
            <Button
              onClick={handleButtonClick}
              onMouseEnter={handleButtonHover}
              variant="contained"
              sx={{
                transform: `translate(${buttonPos.x}px, ${buttonPos.y}px)`,
                transition: 'transform 0.3s ease',
              }}
            >
              {!inputPwd.trim() ? '按不到我喔' : '確認新增'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddTruckForm;
