import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import ImageUploader from './ImageUploader';
import { verifyAdminPassword } from './useAdminAuth';
import TruckFormFields from './TruckFormFields';
import ProtectedButton from './ProtectedButton';

import { Stack } from '@mui/material';

const AddTruckForm = ({ onClose, adminPassword }) => {
  const [formData, setFormData] = useState({ name: '', type: '', location: '' });
  const [imageUrls, setImageUrls] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (password) => {
    if (!verifyAdminPassword(password, adminPassword)) {
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
      if (onClose) onClose();
    } catch (error) {
      console.error('新增失敗:', error);
      alert('新增失敗');
    }
  };

  const formIncomplete = !formData.name || !formData.type || !formData.location || imageUrls.length === 0;

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Stack spacing={2}>
        <TruckFormFields formData={formData} handleChange={handleChange} />
        <ImageUploader onUpload={setImageUrls} />
        <ProtectedButton
          label="送出"
          onClick={handleSubmit}
          disabledCondition={formIncomplete}
          fallback="dialog"
        />
      </Stack>
    </form>
  );
};

export default AddTruckForm;
