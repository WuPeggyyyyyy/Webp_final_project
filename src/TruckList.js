import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, CardActions, Typography, TextField, Button, Stack, Dialog,
  DialogContent, DialogTitle, DialogActions, Checkbox, FormControlLabel
} from '@mui/material';
import { db } from './firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

import EditTruckForm from './EditTruckForm';
import DeleteTruckForm from './DeleteTruckForm';

function TruckList({ adminPassword }) {
  const [trucks, setTrucks] = useState([]);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [modalUrl, setModalUrl] = useState(null);
  const [editingTruck, setEditingTruck] = useState(null);
  const [deletingTruckId, setDeletingTruckId] = useState(null);
  const [commentData, setCommentData] = useState({});

  useEffect(() => {
    const q = query(collection(db, 'trucks'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTrucks(data);
    });
    return () => unsubscribe();
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const handleCommentChange = (id, value) => {
    setCommentData(prev => ({ ...prev, [id]: value }));
  };

  const handleCommentSubmit = async (id) => {
    const content = commentData[id];
    if (!content) return;
    await addDoc(collection(db, 'trucks', id, 'comments'), {
      content,
      createdAt: serverTimestamp(),
    });
    setCommentData(prev => ({ ...prev, [id]: '' }));
  };

  const filteredTrucks = trucks.filter((truck) => {
    const match = truck.name.toLowerCase().includes(search.toLowerCase());
    const fav = showFavoritesOnly ? favorites.includes(truck.id) : true;
    return match && fav;
  });

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
                {favorites.includes(truck.id) ? '💖 取消收藏' : '🤍 收藏'}
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
