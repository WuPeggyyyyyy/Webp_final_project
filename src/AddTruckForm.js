import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import ImageUploader from './ImageUploader';
import { verifyAdminPassword } from './useAdminAuth';

import {
  TextField, Button, Stack, Select, MenuItem, InputLabel,
  FormControl, Dialog, DialogTitle, DialogActions, DialogContent
} from '@mui/material';

const AddTruckForm = ({ onClose, adminPassword }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [inputPwd, setInputPwd] = useState('');

  const handleSubmit = async () => {
    if (!verifyAdminPassword(inputPwd, adminPassword)) {
      alert('密碼錯誤，新增失敗');
      return;
    }

    try {
      await addDoc(collection(db, 'trucks'), {
        name,
        type,
        location,
        imageUrls,
        createdAt: serverTimestamp(),
      });
      alert('新增成功');
      setName('');
      setType('');
      setLocation('');
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
    if (!name || !type || !location || imageUrls.length === 0) {
      alert('請填寫所有欄位並上傳圖片');
      return;
    }
    setConfirmOpen(true);
  };

  return (
    <>
      <form onSubmit={handleFormSubmit}>
        <Stack spacing={2}>
          <TextField
            label="餐車名稱"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />

          <FormControl fullWidth required>
            <InputLabel>餐點類型</InputLabel>
            <Select value={type} label="餐點類型" onChange={(e) => setType(e.target.value)}>
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

          <FormControl fullWidth required>
            <InputLabel>地點</InputLabel>
            <Select value={location} label="地點" onChange={(e) => setLocation(e.target.value)}>
              <MenuItem value="管理大樓">管理大樓</MenuItem>
              <MenuItem value="工學大樓">工學大樓</MenuItem>
              <MenuItem value="明德樓">明德樓</MenuItem>
              <MenuItem value="藴德樓">藴德樓</MenuItem>
            </Select>
          </FormControl>

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
            label="請輸入管理員密碼"
            type="password"
            fullWidth
            sx={{ mt: 1 }}
            value={inputPwd}
            onChange={(e) => setInputPwd(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>取消</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">確認新增</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddTruckForm;
