import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
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
          label="目前密碼"
          type="password"
          fullWidth
          sx={{ mt: 1 }}
          value={currentPwd}
          onChange={(e) => setCurrentPwd(e.target.value)}
        />
        <TextField
          label="新密碼"
          type="password"
          fullWidth
          sx={{ mt: 2 }}
          value={newPwd}
          onChange={(e) => setNewPwd(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <ProtectedButton
          label="確認修改"
          disabledCondition={incomplete}
          fallback="dialog"
          onClick={handleSubmit}
        />
      </DialogActions>
    </Dialog>
  );
};

export default ChangePassword;