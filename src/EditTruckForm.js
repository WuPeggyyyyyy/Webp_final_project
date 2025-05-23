import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { verifyAdminPassword } from './useAdminAuth';

const EditTruckForm = ({ truck, onClose, adminPassword }) => {
  const [editData, setEditData] = useState({ ...truck });
  const [inputPwd, setInputPwd] = useState('');

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
          <TextField
            label="餐車名稱"
            value={editData.name || ''}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>餐點類型</InputLabel>
            <Select
              value={editData.type || ''}
              label="餐點類型"
              onChange={(e) => setEditData({ ...editData, type: e.target.value })}
            >
              <MenuItem value="台式">台式</MenuItem>
              <MenuItem value="中式料理">中式料理</MenuItem>
              <MenuItem value="日式料理">日式料理</MenuItem>
              <MenuItem value="韓式料理">韓式料理</MenuItem>
              <MenuItem value="西式料理">西式料理</MenuItem>
              <MenuItem value="素食">素食</MenuItem>
              <MenuItem value="甜點／甜品">甜點／甜品</MenuItem>
              <MenuItem value="飲料／咖啡">飲料／咖啡</MenuItem>
              <MenuItem value="麵食">麵食</MenuItem>
              <MenuItem value="海鮮">海鮮</MenuItem>
              <MenuItem value="烤肉／燒烤">烤肉／燒烤</MenuItem>
              <MenuItem value="速食">速食</MenuItem>
              <MenuItem value="早餐">早餐</MenuItem>
              <MenuItem value="炸物">炸物</MenuItem>
              <MenuItem value="其他">其他</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>地點</InputLabel>
            <Select
              value={editData.location || ''}
              label="地點"
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
            >
              <MenuItem value="管理大樓">管理大樓</MenuItem>
              <MenuItem value="工學大樓">工學大樓</MenuItem>
              <MenuItem value="明德樓">明德樓</MenuItem>
              <MenuItem value="藴德樓">藴德樓</MenuItem>
            </Select>
          </FormControl>

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
