import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import ImageUploader from './ImageUploader';

function AddTruckForm() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [imageUrls, setImageUrls] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrls.length) return alert("請先上傳圖片");

    try {
      await addDoc(collection(db, 'trucks'), {
        name,
        location,
        type,
        imageUrls,
        createdAt: new Date()
      });
      alert('新增成功！');
      setName('');
      setLocation('');
      setType('');
      setImageUrls('');
    } catch (err) {
      console.error('新增錯誤：', err);
      alert('上傳失敗');
    }
  };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input placeholder="餐車名稱" value={name} onChange={e => setName(e.target.value)} />
//       <input placeholder="地點" value={location} onChange={e => setLocation(e.target.value)} />
//       <input placeholder="類型" value={type} onChange={e => setType(e.target.value)} />

//       <ImageUploader onUploadSuccess={setImageUrls} />

//       <button type="submit" disabled={!imageUrls}>新增餐車</button>
//     </form>
//   );
 }

export default AddTruckForm;
