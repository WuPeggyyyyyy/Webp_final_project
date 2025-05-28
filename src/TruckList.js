import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Card, CardContent, CardActions, Typography, TextField, Button, Stack, Dialog,
  DialogContent, DialogTitle, DialogActions, Checkbox, FormControlLabel, Rating,
  Divider, Avatar, Paper, Grid, Chip
} from '@mui/material';
import { db, storage } from './firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, onSnapshot, addDoc, serverTimestamp, updateDoc, deleteDoc, doc, where, getDoc } from 'firebase/firestore';

import EditTruckForm from './EditTruckForm';
import DeleteTruckForm from './DeleteTruckForm';
import TodaySchedule from './TodaySchedule';

function TruckList({ adminPassword, globalSchedule }) {
  const [trucks, setTrucks] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', location: '', type: '', imageUrls: [] });
  
  // 修正評論資料結構
  const [commentData, setCommentData] = useState({});
  const [comments, setComments] = useState({});
  
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [modalUrl, setModalUrl] = useState(null);
  const [editingTruck, setEditingTruck] = useState(null);
  const [deletingTruckId, setDeletingTruckId] = useState(null);

  // 其他狀態
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

  // 修正評論輸入處理
  const handleCommentChange = (truckId, field, value) => {
    setCommentData(prev => ({
      ...prev,
      [truckId]: {
        ...prev[truckId],
        [field]: value
      }
    }));
  };

  const filteredTrucks = trucks.filter((truck) => {
    const match = truck.name.toLowerCase().includes(search.toLowerCase());
    const fav = showFavoritesOnly ? favorites.some(fav => fav.truckId === truck.id) : true;
    return match && fav;
  });

  // 修正評論提交函式
  const handleCommentSubmit = async (truckId) => {
    const data = commentData[truckId];
    if (!data?.comment || !data?.rating) {
      alert('請輸入評分與評論內容');
      return;
    }

    try {
      await addDoc(collection(db, 'trucks', truckId, 'reviews'), {
        userId: '匿名',
        rating: Number(data.rating),
        comment: data.comment,
        timestamp: serverTimestamp(),
      });

      // 清空評論欄位
      setCommentData(prev => ({ 
        ...prev, 
        [truckId]: { rating: 0, comment: '' } 
      }));
      alert('評論成功！');
    } catch (error) {
      console.error('評論提交失敗:', error);
      alert('評論提交失敗，請再試一次');
    }
  };

  // 計算平均評分
  const getAverageRating = (truckId) => {
    const truckComments = comments[truckId];
    if (!truckComments || truckComments.length === 0) return 0;

    const total = truckComments.reduce((sum, c) => sum + (c.rating || 0), 0);
    return (total / truckComments.length).toFixed(1);
  };

  const isFavorite = (truckId) => {
    return favorites.some(fav => fav.truckId === truckId);
  };

  // 收藏切換
  const toggleFavorite = async (truckId) => {
    const existing = favorites.find(fav => fav.truckId === truckId);
    if (existing) {
      await deleteDoc(doc(db, 'favorites', existing.id));
    } else {
      await addDoc(collection(db, 'favorites'), {
        userId: 'demo-user',
        truckId,
      });
    }
  };

  // 格式化時間
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 圖片處理函式
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
          setNewTruckImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // 新增餐車函式
  const handleAddTruck = async () => {
    if (!newTruckName.trim()) {
      alert('請輸入餐車名稱');
      return;
    }
    if (!newTruckImageFiles) {
      alert('請選擇餐車圖片');
      return;
    }

    const storageRef = ref(storage, `trucks/${Date.now()}_${newTruckImageFiles.name}`);
    try {
      await uploadBytes(storageRef, newTruckImageFiles);
      const downloadUrl = await getDownloadURL(storageRef);

      const docRef = await addDoc(collection(db, 'trucks'), {
        name: newTruckName,
        location: newTruckLocation,
        type: newTruckType,
        imageUrls: [downloadUrl],
        createdAt: serverTimestamp(),
      });

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

      setNewTruckName('');
      setNewTruckLocation('管理大樓');
      setNewTruckType('小吃');
      setNewTruckImageFiles(null);
      setNewTruckImageUrls([]);

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
    <Box id="truck-list-section">
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

      {/* 使用全域狀態的今日時間表元件 */}
      <TodaySchedule globalSchedule={globalSchedule} />

      <Stack spacing={2}>
        {filteredTrucks.map((truck) => (
          <Card key={truck.id} id={`truck-${truck.id}`}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{truck.name}</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Rating value={Number(getAverageRating(truck.id))} readOnly precision={0.1} />
                  <Typography variant="body2" color="text.secondary">
                    ({getAverageRating(truck.id)})
                  </Typography>
                </Box>
              </Box>
              
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

            {/* 評論輸入區域 */}
            <Box sx={{ px: 2, pb: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                新增評論
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography component="legend">評分</Typography>
                <Rating
                  value={commentData[truck.id]?.rating || 0}
                  onChange={(event, newValue) => {
                    handleCommentChange(truck.id, 'rating', newValue);
                  }}
                />
              </Box>

              <TextField
                label="留言內容"
                value={commentData[truck.id]?.comment || ''}
                onChange={(e) => handleCommentChange(truck.id, 'comment', e.target.value)}
                fullWidth
                multiline
                rows={2}
                size="small"
                sx={{ mb: 1 }}
              />
              
              <Button
                variant="outlined"
                onClick={() => handleCommentSubmit(truck.id)}
                size="small"
              >
                送出評論
              </Button>

              {/* 顯示現有評論 */}
              {comments[truck.id] && comments[truck.id].length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    評論 ({comments[truck.id].length})
                  </Typography>
                  
                  <Stack spacing={2}>
                    {comments[truck.id].map((comment) => (
                      <Box key={comment.id} sx={{ 
                        p: 2, 
                        backgroundColor: 'background.paper',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Avatar sx={{ width: 24, height: 24 }}>
                            {comment.userId.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight="bold">
                            {comment.userId}
                          </Typography>
                          <Rating value={comment.rating} readOnly size="small" />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(comment.timestamp)}
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          {comment.comment}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
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
