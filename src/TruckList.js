import React, { useEffect, useState, useRef } from 'react';
import { db, storage } from './firebase';
import {
  collection, getDocs, deleteDoc, doc, updateDoc,
  addDoc, serverTimestamp, query, where, onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function TruckList() {
  const [trucks, setTrucks] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', location: '', type: '', imageUrls: [] });
  const [commentData, setCommentData] = useState({});
  const [comments, setComments] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // 新增餐車用狀態
  const [newTruckName, setNewTruckName] = useState('');
  const [newTruckLocation, setNewTruckLocation] = useState('管理大樓');
  const [newTruckType, setNewTruckType] = useState('小吃');
  const [newTruckImageFile, setNewTruckImageFile] = useState(null);
  const [newTruckImagePreview, setNewTruckImagePreview] = useState(null);
  const [newTruckImageUrls, setNewTruckImageUrls] = useState({});

  const canvasRef = useRef(null);

  // 讀取餐車資料
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'trucks'));
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrucks(items);
    };
    fetchData();
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

  // 過濾搜尋結果
  const filtered = trucks.filter(truck => {
    const matchSearch = truck.name.toLowerCase().includes(search.toLowerCase());
    const matchFavorite = !showFavoritesOnly || favorites.some(fav => fav.truckId === truck.id);
    return matchSearch && matchFavorite;
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
    const file = e.target.files[0];
    if (!file) return;
    setNewTruckImageFile(file);

    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        // 調整 canvas 大小跟圖片一樣
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // 新增餐車 - 上傳圖片到 Firebase Storage 並新增資料
  const handleAddTruck = async () => {
    if (!newTruckName.trim()) {
      alert('請輸入餐車名稱');
      return;
    }
    if (!newTruckImageFile) {
      alert('請選擇餐車圖片');
      return;
    }

    const handleAddImageUrl = (truckId, imageUrl) => {
      setNewTruckImageUrls((prev) => ({
        ...prev,
        [truckId]: [...(prev[truckId] || []), imageUrl],
      }));
    };

    const handleDeleteImage = (truckId, indexToDelete) => {
      setNewTruckImageUrls((prev) => ({
        ...prev,
        [truckId]: prev[truckId].filter((_, index) => index !== indexToDelete),
      }));
    };


    // 上傳圖片到 Storage
    const storageRef = ref(storage, `trucks/${Date.now()}_${newTruckImageFile.name}`);
    try {
      await uploadBytes(storageRef, newTruckImageFile);
      const downloadUrl = await getDownloadURL(storageRef);

      // 新增 Firestore 文件
      const docRef = await addDoc(collection(db, 'trucks'), {
        name: newTruckName,
        location: newTruckLocation,
        type: newTruckType,
        imageUrl: downloadUrl,
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
          imageUrl: downloadUrl,
          imageUrls: newTruckImageUrls,
        }
      ]);

      // 清空表單
      setNewTruckName('');
      setNewTruckLocation('管理大樓');
      setNewTruckType('小吃');
      setNewTruckImageFile(null);
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
    <div style={{ padding: '1rem' }}>
      <h2>新增餐車</h2>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="餐車名稱"
          value={newTruckName}
          onChange={e => setNewTruckName(e.target.value)}
          style={{ marginRight: '10px', padding: '0.5rem' }}
        />

        {/* 地點下拉 */}
        <select
          value={newTruckLocation}
          onChange={e => setNewTruckLocation(e.target.value)}
          style={{ marginRight: '10px', padding: '0.5rem' }}
        >
          <option>管理大樓</option>
          <option>工學大樓</option>
          <option>明德樓</option>
          <option>藴德樓</option>
        </select>

        {/* 類型下拉 */}
        <select
          value={newTruckType}
          onChange={e => setNewTruckType(e.target.value)}
          style={{ marginRight: '10px', padding: '0.5rem' }}
        >
          <option>小吃</option>
          <option>中式料理</option>
          <option>日式料理</option>
          <option>韓式料理</option>
          <option>西式料理</option>
          <option>素食</option>
          <option>甜點／甜品</option>
          <option>飲料／咖啡</option>
          <option>麵食</option>
          <option>海鮮</option>
          <option>烤肉／燒烤</option>
          <option>速食</option>
          <option>早餐</option>
          <option>其他</option>
        </select>
      </div>

      {/* 圖片上傳及 Canvas 顯示 */}
      <div style={{ marginBottom: '1rem' }}>
        <input type="file" accept="image/*" onChange={handleNewImageChange} />
      </div>
      <canvas ref={canvasRef} style={{ maxWidth: '300px', border: '1px solid #ccc', marginBottom: '1rem' }} />

      <button onClick={handleAddTruck} style={{ padding: '0.5rem 1rem' }}>新增餐車</button>

      <hr style={{ margin: '2rem 0' }} />

      <h2>目前餐車列表</h2>

      {/* 搜尋框 */}
      <input
        type="text"
        placeholder="搜尋餐車名稱"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: '1rem', padding: '0.5rem', width: '300px' }}
      />

      {/* 收藏篩選器 */}
      <label style={{ display: 'block', marginBottom: '1rem' }}>
        <input
          type="checkbox"
          checked={showFavoritesOnly}
          onChange={() => setShowFavoritesOnly(prev => !prev)}
          style={{ marginRight: '5px' }}
        />
        只顯示我收藏的餐車
      </label>

      {filtered.map(truck => (
        <div
          key={truck.id}
          style={{
            border: '1px solid #ccc',
            margin: '10px',
            padding: '10px',
          }}
        >
          <img
            src={truck.imageUrl}
            alt={truck.name}
            width="200"
            style={{ marginBottom: '10px', cursor: 'pointer' }}
          />

          {truck.imageUrls?.length > 0 && (
            <div
              style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '10px',
                marginBottom: '10px',
                paddingBottom: '5px',
              }}
            >
              {truck.imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`餐車圖片-${index}`}
                  width="150"
                  style={{ borderRadius: '8px', cursor: 'pointer' }}
                  onClick={() => setPreviewImage(url)}
                />
              ))}
            </div>
          )}

          {editingId === truck.id ? (
            <div>
              <input
                value={editData.name}
                onChange={e =>
                  setEditData({ ...editData, name: e.target.value })
                }
                placeholder="餐車名稱"
              />
              <select
                value={editData.location}
                onChange={e =>
                  setEditData({ ...editData, location: e.target.value })
                }
              >
                <option>管理大樓</option>
                <option>工學大樓</option>
                <option>明德樓</option>
                <option>藴德樓</option>
              </select>
              <select
                value={editData.type}
                onChange={e =>
                  setEditData({ ...editData, type: e.target.value })
                }
              >
                <option>小吃</option>
                <option>中式料理</option>
                <option>日式料理</option>
                <option>韓式料理</option>
                <option>西式料理</option>
                <option>素食</option>
                <option>甜點／甜品</option>
                <option>飲料／咖啡</option>
                <option>麵食</option>
                <option>海鮮</option>
                <option>烤肉／燒烤</option>
                <option>速食</option>
                <option>早餐</option>
                <option>其他</option>
              </select>

              {/* 編輯時可更換圖片 */}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files);
                  const newImageUrls = [];

                  for (const file of files) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('upload_preset', 'CGUfoodtruck_preset');

                    const res = await fetch('https://api.cloudinary.com/v1_1/duij4v2sx/image/upload', {
                      method: 'POST',
                      body: formData,
                    });
                    const data = await res.json();
                    newImageUrls.push(data.secure_url);
                  }

                  if (editingId) {
                    // 編輯餐車
                    setEditData(prev => ({
                      ...prev,
                      imageUrls: [...(prev.imageUrls || []), ...newImageUrls],
                    }));
                  } else {
                    // 新增餐車
                    setNewTruckImageUrls(prev => ({
                      ...prev,
                      imageUrls: [...(prev.imageUrls || []), ...newImageUrls],
                    }));
                  }
                }}
                style={{ marginBottom: '10px' }}
              />


              {editData.imageUrls?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                  {editData.imageUrls.map((url, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img src={url} alt="圖片預覽" width="150" style={{ borderRadius: '8px' }} />
                      <button
                        onClick={() =>
                          setEditData(prev => ({
                            ...prev,
                            imageUrls: prev.imageUrls.filter((_, i) => i !== index),
                          }))
                        }
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          backgroundColor: 'red',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          width: '24px',
                          height: '24px',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 圖片預覽與刪除 */}
              {editData.imageUrls && (
                <div style={{ marginBottom: '10px' }}>
                  <img src={editData.imageUrls} alt="預覽圖片" width="200" />
                  <br />
                  <button onClick={() => setEditData(prev => ({ ...prev, imageUrls: '' }))}>
                    刪除圖片
                  </button>
                </div>
              )}
              <br />
              <button onClick={() => handleSave(truck.id)}>儲存</button>
              <button onClick={() => setEditingId(null)}>取消</button>
            </div>
          ) : (
            <>
              <h3>{truck.name}</h3>
              <p>地點：{truck.location}</p>
              <p>類型：{truck.type}</p>
              <p>平均評分：{getAverageRating(truck.id) ?? '尚無評分'}</p>

              <button onClick={() => {
                  setEditingId(truck.id);
                  setEditData({
                  name: truck.name,
                  location: truck.location,
                  type: truck.type,
                    ...truck,
                    imageUrls: truck.imageUrls || (truck.imageUrls ? [truck.imageUrls] : []), // 向下相容舊資料
                  });
              }}>編輯</button>

              <button onClick={() => handleDelete(truck.id)}>刪除</button>

              <button onClick={() => toggleFavorite(truck.id)}>
                {isFavorite(truck.id) ? '取消收藏' : '收藏'}
              </button>

              {/* 評論區 */}
              <div style={{ marginTop: '10px' }}>
                <h4>📝 評論區：</h4>
                {comments[truck.id]?.length > 0 ? (
                  comments[truck.id].map(comment => (
                    <div key={comment.id} style={{ borderTop: '1px solid #eee', paddingTop: '5px' }}>
                      <p><strong>{comment.user || '匿名使用者'}：</strong> {comment.text || comment.comment}</p>
                      <p>⭐ 評分：{comment.rating || '未提供'}</p>
                    </div>
                  ))
                ) : (
                  <p>尚無評論。</p>
                )}
              </div>

              {/* 評論區塊 */}
              <div style={{ marginTop: '10px' }}>
                <h4>新增評論</h4>
                <input
                  type="number"
                  min="1"
                  max="5"
                  placeholder="評分（1~5）"
                  value={commentData[truck.id]?.rating || ''}
                  onChange={e => setCommentData(prev => ({
                      ...prev,
                      [truck.id]: {
                        ...prev[truck.id],
                        rating: e.target.value
                      }
                    }))
                  }
                  style={{ width: '100px', marginRight: '10px' }}
                />
                <input
                  type="text"
                  placeholder="寫下你的評論"
                  value={commentData[truck.id]?.comment || ''}
                  onChange={e => setCommentData(prev => ({
                      ...prev,
                      [truck.id]: {
                        ...prev[truck.id],
                        comment: e.target.value
                      }
                    }))
                  }
                  
                  style={{ width: '300px', marginRight: '10px' }}
                />
                <button onClick={() => handleCommentSubmit(truck.id)}>送出評論</button>
              </div>
            </>
          )}
        </div>
      ))}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <img
            src={previewImage}
            alt="預覽圖"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              boxShadow: '0 0 20px white',
              borderRadius: '10px',
            }}
          />
        </div>
      )}

    </div>
  );
}

export default TruckList;
