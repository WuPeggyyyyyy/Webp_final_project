import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box
} from '@mui/material';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { verifyAdminPassword } from './useAdminAuth';

const DeleteTruckForm = ({ truckId, onClose, adminPassword }) => {
  const [inputPwd, setInputPwd] = useState('');
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });

  const handleDelete = async () => {
    if (!verifyAdminPassword(inputPwd, adminPassword)) {
      alert('密碼錯誤，無法刪除');
      return;
    }

    try {
      await deleteDoc(doc(db, 'trucks', truckId));
      alert('刪除成功');
      onClose();
    } catch (err) {
      console.error('刪除失敗：', err);
      alert('刪除失敗');
    }
  };

  // 按鈕躲避邏輯
  const handleButtonHover = () => {
    if (!inputPwd.trim()) {
      const maxMove = 80;
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
    handleDelete();
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>確定要刪除這筆餐車資料嗎？</DialogTitle>
      <DialogContent>
        <TextField
          label="請輸入管理員密碼"
          type="password"
          fullWidth
          value={inputPwd}
          onChange={(e) => setInputPwd(e.target.value)}
          sx={{ mt: 2 }}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        
        {/* 有趣的躲避按鈕 */}
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Button
            onMouseEnter={handleButtonHover}
            onClick={handleButtonClick}
            variant="contained"
            color="error"
            sx={{
              transform: `translate(${buttonPos.x}px, ${buttonPos.y}px)`,
              transition: 'transform 0.3s ease',
              position: 'relative',
            }}
          >
            確認刪除
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteTruckForm;
