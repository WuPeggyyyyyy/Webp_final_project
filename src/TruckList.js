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
  const [editData, setEditData] = useState({});
  const [commentData, setCommentData] = useState({});
  const [comments, setComments] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // 新增餐車用狀態
  const [newTruckName, setNewTruckName] = useState('');
  const [newTruckLocation, setNewTruckLocation] = useState('管理大樓');
  const [newTruckType, setNewTruckType] = useState('小吃');
  const [newTruckImageFile, setNewTruckImageFile] = useState(null);
  const [newTruckImagePreview, setNewTruckImagePreview] = useState(null);

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
      imageUrl: editData.imageUrl,
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

    await addDoc(collection(db, 'trucks', truckId, 'reviews'), {
      userId: 'demo-user',
      rating: Number(commentData[truckId].rating),
      comment: commentData[truckId].comment,
      timestamp: serverTimestamp(),
    });

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

  // 收藏判斷
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
        }
      ]);

      // 清空表單
      setNewTruckName('');
      setNewTruckLocation('管理大樓');
      setNewTruckType('小吃');
      setNewTruckImageFile(null);

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
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  // 上傳新圖片
                  const storageRef = ref(storage, `trucks/${Date.now()}_${file.name}`);
                  await uploadBytes(storageRef, file);
                  const url = await getDownloadURL(storageRef);
                  setEditData(prev => ({ ...prev, imageUrl: url }));
                }}
                style={{ marginTop: '5px' }}
              />

              <div style={{ marginTop: '5px' }}>
                <button onClick={() => handleSave(truck.id)}>儲存</button>
                <button onClick={() => setEditingId(null)}>取消</button>
              </div>
            </div>
          ) : (
            <>
              <h3>{truck.name}</h3>
              <p>地點：{truck.location}</p>
              <p>類型：{truck.type}</p>

              <button onClick={() => {
                setEditingId(truck.id);
                setEditData({
                  name: truck.name,
                  location: truck.location,
                  type: truck.type,
                  imageUrl: truck.imageUrl,
                });
              }}>編輯</button>

              <button onClick={() => handleDelete(truck.id)}>刪除</button>

              <button onClick={() => toggleFavorite(truck.id)}>
                {isFavorite(truck.id) ? '取消收藏' : '收藏'}
              </button>

              {/* 評論區 */}
              <div style={{ marginTop: '10px' }}>
                <strong>平均評分: </strong>
                {getAverageRating(truck.id) ?? '尚無評分'}
              </div>

              <div>
                {(comments[truck.id] || []).map(c => (
                  <div key={c.id} style={{ borderTop: '1px solid #ccc', marginTop: '5px' }}>
                    <p>⭐ {c.rating}</p>
                    <p>{c.comment}</p>
                  </div>
                ))}
              </div>

              {/* 新增評論 */}
              <div style={{ marginTop: '10px' }}>
                <input
                  type="number"
                  min="1"
                  max="5"
                  placeholder="評分 (1~5)"
                  value={commentData[truck.id]?.rating || ''}
                  onChange={e => setCommentData(prev => ({
                    ...prev,
                    [truck.id]: {
                      ...prev[truck.id],
                      rating: e.target.value,
                    }
                  }))}
                  style={{ width: '80px', marginRight: '10px' }}
                />
                <input
                  type="text"
                  placeholder="寫下你的評論"
                  value={commentData[truck.id]?.comment || ''}
                  onChange={e => setCommentData(prev => ({
                    ...prev,
                    [truck.id]: {
                      ...prev[truck.id],
                      comment: e.target.value,
                    }
                  }))}
                  style={{ width: '300px', marginRight: '10px' }}
                />
                <button onClick={() => handleCommentSubmit(truck.id)}>送出評論</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default TruckList;
