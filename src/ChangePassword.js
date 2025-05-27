import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';
import ProtectedButton from './ProtectedButton';

const ChangePassword = ({ open, onClose, adminPassword, setAdminPassword }) => {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');

  const handleSubmit = (inputPwd) => {
    if (inputPwd === adminPassword) {
      setAdminPassword(newPwd);
      alert('密碼修改成功');
      handleClose();
    } else {
      alert('密碼錯誤，無法修改');
    }
  };

  const handleClose = () => {
    setCurrentPwd('');
    setNewPwd('');
    onClose();
  };

  const incomplete = !currentPwd || !newPwd;

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
        <ProtectedButton
          onSubmit={handleSubmit}
          disabled={incomplete}
          variant="contained"
        >
          修改密碼
        </ProtectedButton>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePassword;
