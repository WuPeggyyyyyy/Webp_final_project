import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box
} from '@mui/material';

const ChangePassword = ({ open, onClose, adminPassword, setAdminPassword }) => {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });
  const [bounce, setBounce] = useState(false);

  const handleButtonHover = () => {
    // 如果任一欄位為空，按鈕會移動
    if (!currentPwd.trim() || !newPwd.trim()) {
      const maxMove = 40;
      const randomX = Math.floor(Math.random() * maxMove * 2 - maxMove);
      const randomY = Math.floor(Math.random() * maxMove * 2 - maxMove);
      setButtonPos({ x: randomX, y: randomY });
      
      // 加入彈跳效果
      setBounce(true);
      setTimeout(() => setBounce(false), 300);
    }
  };

  const handleButtonClick = () => {
    // 檢查是否有空欄位
    if (!currentPwd.trim()) {
      alert('請先輸入目前密碼！');
      return;
    }
    
    if (!newPwd.trim()) {
      alert('請先輸入新密碼！');
      return;
    }

    // 執行密碼修改邏輯
    handleSubmit();
  };

  const handleSubmit = () => {
    if (currentPwd === adminPassword) {
      if (newPwd.length <4) {
        alert('新密碼長度至少需要6個字元');
        return;
      }
      
      setAdminPassword(newPwd);
      alert('密碼修改成功');
      handleClose();
    } else {
      alert('目前密碼錯誤，無法修改');
    }
  };

  const handleClose = () => {
    setCurrentPwd('');
    setNewPwd('');
    setButtonPos({ x: 0, y: 0 }); // 重置按鈕位置
    setBounce(false); // 重置彈跳效果
    onClose();
  };

  const incomplete = !currentPwd.trim() || !newPwd.trim();

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>修改管理員密碼</DialogTitle>
      <DialogContent>
        <TextField
          type="password"
          label="目前密碼"
          fullWidth
          margin="normal"
          value={currentPwd}
          onChange={(e) => setCurrentPwd(e.target.value)}
          autoFocus
        />
        <TextField
          type="password"
          label="新密碼"
          fullWidth
          margin="normal"
          value={newPwd}
          onChange={(e) => setNewPwd(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Box
          component="div"
          sx={{
            position: 'relative',
            display: 'inline-block',
            transform: `translate(${buttonPos.x}px, ${buttonPos.y}px) ${bounce ? 'scale(1.1)' : 'scale(1)'}`,
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <Button
            onClick={handleButtonClick}
            onMouseEnter={handleButtonHover}
            variant="contained"
            color="primary"
          >
            {incomplete ? '抓不到我' : '修改密碼'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePassword;
