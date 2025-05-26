import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack
} from '@mui/material';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { verifyAdminPassword } from './useAdminAuth';
import TruckFormFields from './TruckFormFields';

const EditTruckForm = ({ truck, onClose, adminPassword }) => {
  const [editData, setEditData] = useState({ ...truck });
  const [inputPwd, setInputPwd] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!verifyAdminPassword(inputPwd, adminPassword)) {
      alert('密碼錯誤，儲存失敗');
      return;
    }

    try {
      await updateDoc(doc(db, 'trucks', truck.id), editData);
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
