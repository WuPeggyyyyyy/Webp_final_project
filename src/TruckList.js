import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';


function TruckList() {
  const [trucks, setTrucks] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [commentData, setCommentData] = useState({});
  const [comments, setComments] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);


  // 抓取 Firestore 資料
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

  // 刪除餐車
  const handleDelete = async (id) => {
    if (window.confirm('確定要刪除這筆餐車資料嗎？')) {
      await deleteDoc(doc(db, 'trucks', id));
      setTrucks(trucks.filter(truck => truck.id !== id));
    }
  };

  // 儲存編輯後資料
  const handleSave = async (id) => {
    const ref = doc(db, 'trucks', id);
    await updateDoc(ref, {
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

  // 評分系統
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

  const getAverageRating = (truckId) => {
  const truckComments = comments[truckId];
  if (!truckComments || truckComments.length === 0) return null;

  const total = truckComments.reduce((sum, c) => sum + (c.rating || 0), 0);
  return (total / truckComments.length).toFixed(1); // 保留一位小數
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


  return (
    <div>
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
            onClick={() => setPreviewImage(truck.imageUrl)}
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
              <input
                value={editData.location}
                onChange={e =>
                  setEditData({ ...editData, location: e.target.value })
                }
                placeholder="地點"
              />
              <input
                value={editData.type}
                onChange={e =>
                  setEditData({ ...editData, type: e.target.value })
                }
                placeholder="類型"
              />
              <input
                value={editData.imageUrl}
                onChange={e =>
                  setEditData({ ...editData, imageUrl: e.target.value })
                }
                placeholder="圖片 URL"
                style={{ marginTop: '5px', marginBottom: '5px' }}
              />

              <br />
              <button onClick={() => handleSave(truck.id)}>儲存</button>
              <button onClick={() => setEditingId(null)}>取消</button>
            </div>
          ) : (
            <>
              <h3>{truck.name}</h3>
              <p>📍 地點：{truck.location}</p>
              <p>🍱 類型：{truck.type}</p>
              <p>⭐ 平均評分：{getAverageRating(truck.id) ?? '尚無評分'}</p>


              <button
                onClick={() => {
                  setEditingId(truck.id);
                  setEditData(truck);
                }}
              >
                編輯
              </button>
              <button onClick={() => handleDelete(truck.id)}>刪除</button>
              {/* 顯示評論 */}
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
                  onChange={e =>
                    setCommentData(prev => ({
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
                  placeholder="撰寫評論"
                  value={commentData[truck.id]?.comment || ''}
                  onChange={e =>
                    setCommentData(prev => ({
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
                <button onClick={() => toggleFavorite(truck.id)}>
                  {isFavorite(truck.id) ? '取消收藏 💔' : '收藏 ❤️'}
                </button>
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
