import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button
} from '@mui/material';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { verifyAdminPassword } from './useAdminAuth';

const DeleteTruckForm = ({ truckId, onClose, adminPassword }) => {
  const [inputPwd, setInputPwd] = useState('');

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
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleDelete} variant="contained" color="error">確認刪除</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteTruckForm;
