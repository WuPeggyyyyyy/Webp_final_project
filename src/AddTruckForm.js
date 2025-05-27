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

  // 處理圖片上傳回調
  const handleImageUpload = (urls) => {
    setImageUrls(urls);
  };

  // 修正後的 handleFormSubmit 函數
  const handleFormSubmit = () => {
    if (!formData.name || !formData.type || !formData.location || imageUrls.length === 0) {
      alert('請填寫所有欄位並上傳至少一張圖片');
      return;
    } // 添加缺失的閉合大括號
    
    setConfirmOpen(true);
  };

  // 修正後的 handleSubmit 函數
  const handleSubmit = async () => {
    if (!verifyAdminPassword(inputPwd, adminPassword)) {
      alert('密碼錯誤，新增失敗');
      return;
    } // 添加缺失的閉合大括號
    
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

  // 這個變數現在可以正確計算了
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
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TruckFormFields formData={formData} handleChange={handleChange} />
            
            {/* 正確整合 ImageUploader */}
            <ImageUploader onUpload={handleImageUpload} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>取消</Button>
          <Button 
            onClick={handleFormSubmit}
            disabled={formIncomplete}
            variant="contained"
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
            label="請輸入管理員密碼"
            type="password"
            value={inputPwd}
            onChange={(e) => setInputPwd(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>取消</Button>
          <Box
            component="div"
            sx={{
              position: 'relative',
              transform: `translate(${buttonPos.x}px, ${buttonPos.y}px)`,
              transition: 'transform 0.3s ease',
            }}
          >
            <Button
              onMouseEnter={handleButtonHover}
              onClick={handleButtonClick}
              variant="contained"
              color="primary"
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
