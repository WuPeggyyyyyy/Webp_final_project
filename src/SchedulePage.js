import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Chip, IconButton, AppBar, Toolbar, Alert
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, query, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { verifyAdminPassword } from './useAdminAuth';

const SchedulePage = ({ adminPassword }) => {
  const navigate = useNavigate();
  const [trucks, setTrucks] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [inputPwd, setInputPwd] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState(false);

  // 躲避按鈕用的狀態
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });

  const timeSlots = ['早餐', '午餐', '宵夜'];

  const generateDates = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      dates.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        dayName: date.toLocaleDateString('zh-TW', { weekday: 'short' }),
        dayNumber: day
      });
    }
    return dates;
  };

  const [dates] = useState(generateDates());

  useEffect(() => {
    const q = query(collection(db, 'trucks'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTrucks(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const scheduleDoc = await getDoc(doc(db, 'schedule', 'current'));
        if (scheduleDoc.exists()) {
          setSchedule(scheduleDoc.data().schedule || {});
        }
      } catch (error) {
        console.error('載入時間表失敗:', error);
      }
    };
    loadSchedule();
  }, []);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setDragError(false);
  }, []);

  const handleDragEnd = useCallback((result) => {
    setIsDragging(false);
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      setSchedule(prevSchedule => {
        const newSchedule = { ...prevSchedule };
        if (source.droppableId !== 'trucks') {
          const sourceKey = source.droppableId;
          newSchedule[sourceKey] = [...(newSchedule[sourceKey] || [])];
          newSchedule[sourceKey].splice(source.index, 1);
        }

        if (destination.droppableId !== 'trucks') {
          const destKey = destination.droppableId;
          newSchedule[destKey] = [...(newSchedule[destKey] || [])];
          const actualTruckId = draggableId.split('-')[0];
          const truck = trucks.find(t => t.id === actualTruckId);
          if (truck) {
            newSchedule[destKey].splice(destination.index, 0, {
              id: truck.id,
              name: truck.name,
              type: truck.type
            });
          }
        }

        return newSchedule;
      });
    } catch (error) {
      console.error('拖拉處理錯誤:', error);
      setDragError(true);
    }
  }, [trucks]);

  const handleSave = async () => {
    if (!verifyAdminPassword(inputPwd, adminPassword)) {
      alert('密碼錯誤，無法儲存');
      return;
    }

    try {
      await setDoc(doc(db, 'schedule', 'current'), {
        schedule,
        lastUpdated: new Date()
      });
      alert('時間表儲存成功！');
      setSaveDialogOpen(false);
      setInputPwd('');
      setButtonPos({ x: 0, y: 0 });
    } catch (error) {
      console.error('儲存失敗:', error);
      alert('儲存失敗，請重試');
    }
  };

  const handleCloseDialog = () => {
    setSaveDialogOpen(false);
    setInputPwd('');
    setButtonPos({ x: 0, y: 0 });
  };

  const handleButtonHover = () => {
    if (inputPwd.trim()) return;
    const offsetX = Math.floor(Math.random() * 120 - 60);
    const offsetY = Math.floor(Math.random() * 60 - 30);
    setButtonPos({ x: offsetX, y: offsetY });
  };

  const handleSaveClick = () => {
    if (!inputPwd.trim()) return;
    handleSave();
  };

  const resetError = () => {
    setDragError(false);
    setIsDragging(false);
  };

  if (dragError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          拖拉功能發生錯誤，請重新整理頁面或點擊重置按鈕
        </Alert>
        <Button variant="contained" onClick={resetError} sx={{ mr: 2 }}>
          重置
        </Button>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          重新整理頁面
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate('/')} edge="start">
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            餐車時間表管理
          </Typography>
          <Button
            color="inherit"
            startIcon={<Save />}
            onClick={() => setSaveDialogOpen(true)}
            disabled={isDragging}
          >
            儲存時間表
          </Button>
        </Toolbar>
      </AppBar>

      <DragDropContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onBeforeCapture={() => setDragError(false)}
      >
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>可用餐車</Typography>
              <Droppable droppableId="trucks" isDropDisabled={true}>
                {(provided) => (
                  <Box {...provided.droppableProps} ref={provided.innerRef} sx={{ minHeight: 100 }}>
                    {trucks.map((truck, index) => (
                      <Draggable
                        key={truck.id}
                        draggableId={truck.id}
                        index={index}
                        isDragDisabled={isDragging}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              mb: 1,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                              cursor: isDragging ? 'not-allowed' : 'grab',
                            }}
                          >
                            <CardContent sx={{ py: 1 }}>
                              <Typography variant="body2">{truck.name}</Typography>
                              <Chip label={truck.type} size="small" />
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Paper>
          </Grid>

          <Grid item xs={12} md={9}>
            <Typography variant="h5" gutterBottom>
              {new Date().getFullYear()}年{new Date().getMonth() + 1}月 餐車時間表
            </Typography>
            <Grid container spacing={1}>
              {dates.map((dateInfo) => (
                <Grid item xs={12} sm={6} md={4} key={dateInfo.date}>
                  <Paper sx={{ p: 1, minHeight: 300 }}>
                    <Typography variant="h6" align="center" gutterBottom>
                      {dateInfo.dayNumber}日 ({dateInfo.dayName})
                    </Typography>
                    {timeSlots.map((timeSlot) => {
                      const slotKey = `${dateInfo.date}-${timeSlot}`;
                      return (
                        <Box key={slotKey} sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>{timeSlot}</Typography>
                          <Droppable droppableId={slotKey}>
                            {(provided, snapshot) => (
                              <Box
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                sx={{
                                  minHeight: 60,
                                  p: 1,
                                  border: '1px dashed #ccc',
                                  borderRadius: 1,
                                  backgroundColor: snapshot.isDraggingOver ? '#e3f2fd' : 'transparent'
                                }}
                              >
                                {(schedule[slotKey] || []).map((truck, index) => (
                                  <Draggable
                                    key={`${truck.id}-${slotKey}-${index}`}
                                    draggableId={`${truck.id}-${slotKey}-${index}`}
                                    index={index}
                                    isDragDisabled={isDragging}
                                  >
                                    {(provided, snapshot) => (
                                      <Chip
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        label={truck.name}
                                        size="small"
                                        sx={{
                                          m: 0.5,
                                          opacity: snapshot.isDragging ? 0.8 : 1,
                                          cursor: isDragging ? 'not-allowed' : 'grab'
                                        }}
                                        color="primary"
                                      />
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </Box>
                            )}
                          </Droppable>
                        </Box>
                      );
                    })}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </DragDropContext>

      {/* ✅ 躲避按鈕的儲存確認對話框 */}
      <Dialog open={saveDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>儲存時間表</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            請輸入管理員密碼以儲存時間表
          </Typography>
          <TextField
            label="管理員密碼"
            type="password"
            fullWidth
            value={inputPwd}
            onChange={(e) => setInputPwd(e.target.value)}
            sx={{ mt: 2 }}
            autoFocus
            placeholder="請輸入密碼..."
          />
        </DialogContent>
        <DialogActions sx={{ position: 'relative', minHeight: 80 }}>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button
            variant="contained"
            onMouseEnter={handleButtonHover}
            onClick={handleSaveClick}
            sx={{
              position: 'relative',
              transform: `translate(${buttonPos.x}px, ${buttonPos.y}px)`,
              transition: 'transform 0.3s ease',
              backgroundColor: !inputPwd.trim() ? '#ff9800' : '#1976d2',
              '&:hover': {
                backgroundColor: !inputPwd.trim() ? '#f57c00' : '#1565c0',
              }
            }}
          >
            {!inputPwd.trim() ? '按不到我喔' : '確認儲存'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchedulePage;
