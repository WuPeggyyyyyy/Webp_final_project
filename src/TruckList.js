import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Card, CardContent, CardActions, Typography, TextField, Button, Stack, Dialog,
  DialogContent, DialogTitle, DialogActions, Checkbox, FormControlLabel
} from '@mui/material';
import { db, storage } from './firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, onSnapshot, addDoc, serverTimestamp, updateDoc, deleteDoc, doc, where } from 'firebase/firestore';

import EditTruckForm from './EditTruckForm';
import DeleteTruckForm from './DeleteTruckForm';

function TruckList({ adminPassword }) {
  const [trucks, setTrucks] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', location: '', type: '', imageUrls: [] });
  const [commentData, setCommentData] = useState({});
  const [comments, setComments] = useState({});
  //const [previewImage, setPreviewImage] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [modalUrl, setModalUrl] = useState(null);
  const [editingTruck, setEditingTruck] = useState(null);
  const [deletingTruckId, setDeletingTruckId] = useState(null);

  // 新增餐車用狀態
  const [newTruckName, setNewTruckName] = useState('');
  const [newTruckLocation, setNewTruckLocation] = useState('管理大樓');
  const [newTruckType, setNewTruckType] = useState('小吃');
  const [newTruckImageFiles, setNewTruckImageFiles] = useState([]);
  const [newTruckImagePreviews, setNewTruckImagePreviews] = useState([]);
  const [newTruckImageUrls, setNewTruckImageUrls] = useState({});

  const canvasRef = useRef(null);

  // 讀取餐車資料
  useEffect(() => {
    const q = query(collection(db, 'trucks'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTrucks(data);
    });
    return () => unsubscribe();
  }, []);


  // 監聽評論
  useEffect(() => {
  const unsubscribeFns = [];

  const fetchComments = async () => {
    trucks.forEach(truck => {
      const reviewsRef = collection(db, 'trucks', truck.id, 'reviews');

      const unsubscribe = onSnapshot(reviewsRef, snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(prev => ({ ...prev, [truck.id]: data }));
      });

      unsubscribeFns.push(unsubscribe);
    });
  };

  if (trucks.length > 0) fetchComments();

  return () => {
    unsubscribeFns.forEach(unsub => unsub());
  };
  }, [trucks]);

  // 監聽收藏餐車
  useEffect(() => {
    const q = query(collection(db, 'favorites'), where('userId', '==', 'demo-user'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const favs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFavorites(favs);
    });
    return () => unsubscribe();
  }, []);

  // 刪除餐車
  const handleDelete = async (id) => {
    if (window.confirm('確定要刪除這筆餐車資料嗎？')) {
      await deleteDoc(doc(db, 'trucks', id));
      setTrucks(trucks.filter(truck => truck.id !== id));
    }
  };

  // 儲存編輯後資料
  const handleSave = async (id) => {
    const refDoc = doc(db, 'trucks', id);
    await updateDoc(refDoc, {
      name: editData.name,
      location: editData.location,
      type: editData.type,
      imageUrls: editData.imageUrls,
    });
    setEditingId(null);
    const updated = trucks.map(t =>
      t.id === id ? { ...t, ...editData } : t
    );
    setTrucks(updated);
  };

  const handleCommentChange = (id, value) => {
    setCommentData(prev => ({ ...prev, [id]: value }));
  };

  const filteredTrucks = trucks.filter((truck) => {
    const match = truck.name.toLowerCase().includes(search.toLowerCase());
    const fav = showFavoritesOnly ? favorites.includes(truck.id) : true;
    return match && fav;
  });

  // 評分系統 - 新增評論
  const handleCommentSubmit = async (truckId) => {
  if (!commentData[truckId]?.comment || !commentData[truckId]?.rating) {
    alert('請輸入評分與評論內容');
    return;
  }

  // 檢查評分範圍
  await addDoc(collection(db, 'trucks', truckId, 'reviews'), {
    userId: 'demo-user', // 之後接入 Firebase Auth 再改為動態值
    rating: Number(commentData[truckId].rating),
    comment: commentData[truckId].comment,
    timestamp: serverTimestamp(),
  });

  // 清空評論欄位
  setCommentData(prev => ({ ...prev, [truckId]: { rating: '', comment: '' } }));
  alert('評論成功！');
  };

  // 計算平均評分
  const getAverageRating = (truckId) => {
  const truckComments = comments[truckId];
  if (!truckComments || truckComments.length === 0) return null;

  const total = truckComments.reduce((sum, c) => sum + (c.rating || 0), 0);
    return (total / truckComments.length).toFixed(1);
  };

  // 收藏餐車
  useEffect(() => {
    const q = query(collection(db, 'favorites'), where('userId', '==', 'demo-user'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const favs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFavorites(favs);
    });

    return () => unsubscribe();
  }, []);

  const isFavorite = (truckId) => {
    return favorites.some(fav => fav.truckId === truckId);
  };

  // 收藏切換
  const toggleFavorite = async (truckId) => {
    const existing = favorites.find(fav => fav.truckId === truckId);
    if (existing) {
      // 已收藏，取消
      await deleteDoc(doc(db, 'favorites', existing.id));
    } else {
      // 尚未收藏，新增
      await addDoc(collection(db, 'favorites'), {
        userId: 'demo-user', // 之後用 Firebase Auth 替換
        truckId,
      });
    }
  };

  // 新增餐車 - 圖片檔案選擇後顯示預覽（Canvas）
  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    if (!files) return;
    setNewTruckImageFiles(files);

    const previews = [];
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      previews.push(event.target.result);
      if (previews.length === files.length) {
        setNewTruckImagePreviews(previews); // 顯示預覽圖
      }
      };
    
    reader.readAsDataURL(file);
  });
  };

  // 新增餐車 - 上傳圖片到 Firebase Storage 並新增資料
  const handleAddTruck = async () => {
    if (!newTruckName.trim()) {
      alert('請輸入餐車名稱');
      return;
    }
    if (!newTruckImageFiles) {
      alert('請選擇餐車圖片');
      return;
    }

    const handleAddImageUrls = (truckId, imageUrls) => {
      setNewTruckImageUrls((prev) => ({
        ...prev,
        [truckId]: [...(prev[truckId] || []), imageUrls],
      }));
    };

    const handleDeleteImage = (truckId, indexToDelete) => {
      setNewTruckImageUrls((prev) => ({
        ...prev,
        [truckId]: prev[truckId].filter((_, index) => index !== indexToDelete),
      }));
    };


    // 上傳圖片到 Storage
    const storageRef = ref(storage, `trucks/${Date.now()}_${newTruckImageFiles.name}`);
    try {
      await uploadBytes(storageRef, newTruckImageFiles);
      const downloadUrl = await getDownloadURL(storageRef);

      // 新增 Firestore 文件
      const docRef = await addDoc(collection(db, 'trucks'), {
        name: newTruckName,
        location: newTruckLocation,
        type: newTruckType,
        imageUrls: [downloadUrl],
        createdAt: serverTimestamp(),
      });

      // 更新本地狀態
      setTrucks(prev => [
        ...prev,
        {
          id: docRef.id,
          name: newTruckName,
          location: newTruckLocation,
          type: newTruckType,
          imageUrls: [downloadUrl],
        }
      ]);

      // 清空表單
      setNewTruckName('');
      setNewTruckLocation('管理大樓');
      setNewTruckType('小吃');
      setNewTruckImageFiles(null);
      setNewTruckImageUrls([]);

      // 清空畫布
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      alert('新增餐車成功！');

    } catch (error) {
      alert('圖片上傳失敗，請再試一次');
      console.error(error);
    }
  };

  return (
    <Box>
      <TextField
        label="搜尋餐車"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={showFavoritesOnly}
            onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
          />
        }
        label="只看我的收藏"
        sx={{ mb: 2 }}
      />

      <Stack spacing={2}>
        {filteredTrucks.map((truck) => (
          <Card key={truck.id}>
            <CardContent>
              <Typography variant="h6">{truck.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                類型：{truck.type} / 地點：{truck.location}
              </Typography>

              {truck.imageUrls?.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {truck.imageUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`圖${idx + 1}`}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 6,
                        cursor: 'pointer',
                      }}
                      onClick={() => setModalUrl(url)}
                    />
                  ))}
                </Stack>
              )}
            </CardContent>

            <CardActions>
              <Button onClick={() => setEditingTruck(truck)} color="primary">編輯</Button>
              <Button onClick={() => setDeletingTruckId(truck.id)} color="error">刪除</Button>
              <Button onClick={() => toggleFavorite(truck.id)} color="secondary">
                {isFavorite(truck.id) ? '💔 取消收藏' : '🤍 收藏'}
              </Button>
            </CardActions>

            <Box sx={{ px: 2, pb: 2 }}>
              <TextField
                label="留言"
                value={commentData[truck.id] || ''}
                onChange={(e) => handleCommentChange(truck.id, e.target.value)}
                fullWidth
                size="small"
              />
              <Button
                variant="outlined"
                onClick={() => handleCommentSubmit(truck.id)}
                sx={{ mt: 1 }}
              >
                送出留言
              </Button>
            </Box>
          </Card>
        ))}
      </Stack>

      {/* 預覽圖片 */}
      <Dialog open={Boolean(modalUrl)} onClose={() => setModalUrl(null)} maxWidth="md">
        <DialogContent sx={{ p: 0 }}>
          <img src={modalUrl} alt="預覽" style={{ width: '100%', height: 'auto' }} />
        </DialogContent>
      </Dialog>

      {/* 編輯 Dialog */}
      {editingTruck && (
        <EditTruckForm
          truck={editingTruck}
          onClose={() => setEditingTruck(null)}
          onSave={handleSave}
          adminPassword={adminPassword}
        />
      )}

      {/* 刪除 Dialog */}
      {deletingTruckId && (
        <DeleteTruckForm
          truckId={deletingTruckId}
          onClose={() => setDeletingTruckId(null)}
          adminPassword={adminPassword}
        />
      )}
    </Box>
  );
}

export default TruckList;
