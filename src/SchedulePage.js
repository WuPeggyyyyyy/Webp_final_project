import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Chip, IconButton, AppBar, Toolbar, Alert, Container
} from '@mui/material';
import { ArrowBack, Save, CalendarMonth } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { Timestamp, collection, query, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { verifyAdminPassword } from './useAdminAuth';
import './SchedulePage.css';

const SchedulePage = ({ adminPassword, globalSchedule, setGlobalSchedule }) => {
  const navigate = useNavigate();
  const [trucks, setTrucks] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [inputPwd, setInputPwd] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState(false);
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const timeSlots = ['早餐', '午餐', '宵夜'];

  // 同步 globalSchedule 到本地 schedule
  useEffect(() => {
    console.log('SchedulePage: 接收到 globalSchedule:', globalSchedule);
    setSchedule(globalSchedule);
  }, [globalSchedule]);

  // 生成月曆日期
  const generateDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const dates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push({
        date: currentDate.toISOString().split('T')[0],
        dayName: currentDate.toLocaleDateString('zh-TW', { weekday: 'short' }),
        dayNumber: currentDate.getDate(),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toDateString() === new Date().toDateString()
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const [dates, setDates] = useState(generateDates());

  useEffect(() => {
    setDates(generateDates());
  }, [currentMonth]);

  // 載入餐車資料
  useEffect(() => {
    const q = query(collection(db, 'trucks'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTrucks(data);
    });
    return () => unsubscribe();
  }, []);

  // 拖拽處理
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
      const newSchedule = { ...schedule };

      // 從來源移除
      if (source.droppableId !== 'trucks') {
        const sourceKey = source.droppableId;
        newSchedule[sourceKey] = [...(newSchedule[sourceKey] || [])];
        newSchedule[sourceKey].splice(source.index, 1);
      }

      // 加入目標
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

      console.log('SchedulePage: 更新 schedule:', newSchedule);
      setSchedule(newSchedule);
      
      // 同時更新全域狀態
      if (setGlobalSchedule) {
        setGlobalSchedule(newSchedule);
      }
    } catch (error) {
      console.error('拖拉處理錯誤:', error);
      setDragError(true);
    }
  }, [trucks, schedule, setGlobalSchedule]);

// 儲存時間表
  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'schedule', 'current'), {
        schedule,
        lastUpdated: Timestamp.fromDate(new Date())  // 使用 Firestore 時間戳
      });

      // 儲存成功後，確保全域狀態是最新的
      if (setGlobalSchedule) {
        setGlobalSchedule(schedule);
      }

      console.log('SchedulePage: 儲存並同步成功');
      alert('時間表儲存成功！');
    } catch (error) {
      console.error('儲存失敗:', error);
    }
  };

  // 月份導航
  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  // 躲避按鈕邏輯
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

  const handleCloseDialog = () => {
    setSaveDialogOpen(false);
    setInputPwd('');
    setButtonPos({ x: 0, y: 0 });
  };

  if (dragError) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          拖拉功能發生錯誤，請重新整理頁面或點擊重置按鈕
        </Alert>
        <Button onClick={() => setDragError(false)} sx={{ mt: 1, mr: 1 }}>
          重置
        </Button>
        <Button onClick={() => window.location.reload()} sx={{ mt: 1 }}>
          重新整理頁面
        </Button>
      </Container>
    );
  }

  return (
    <Box className="schedule-page">
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => navigate('/')}
            edge="start"
            sx={{ mr: 2 }}
          >
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

      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* 可用餐車區域 */}
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              可用餐車
            </Typography>
            <Droppable 
              droppableId="trucks" 
              direction="horizontal"
              isDropDisabled={false}
              isCombineEnabled={false}
              ignoreContainerClipping={false}
            >
              {(provided) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="trucks-container"
                >
                  {trucks.map((truck, index) => (
                    <Draggable 
                      key={truck.id} 
                      draggableId={truck.id} 
                      index={index}
                      isDragDisabled={false}
                    >
                      {(provided, snapshot) => (
                        <Chip
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          label={truck.name}
                          className={`truck-chip ${snapshot.isDragging ? 'dragging' : ''}`}
                          sx={{
                            m: 0.5,
                            cursor: 'grab',
                            '&:active': { cursor: 'grabbing' }
                          }}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Paper>

          {/* 月曆標題和導航 */}
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Box className="calendar-header">
              <Button onClick={() => navigateMonth(-1)}>‹ 上個月</Button>
              <Typography variant="h5" className="month-title">
                <CalendarMonth sx={{ mr: 1 }} />
                {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月 餐車時間表
              </Typography>
              <Button onClick={() => navigateMonth(1)}>下個月 ›</Button>
            </Box>
          </Paper>

          {/* 週標題 */}
          <Box className="week-header">
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <Typography key={day} className="week-day">
                {day}
              </Typography>
            ))}
          </Box>

          {/* 月曆網格 */}
          <Box className="calendar-grid">
            {dates.map((dateInfo) => (
              <Paper
                key={dateInfo.date}
                className={`calendar-cell ${!dateInfo.isCurrentMonth ? 'other-month' : ''} ${dateInfo.isToday ? 'today' : ''}`}
                elevation={1}
              >
                <Typography className="date-number">
                  {dateInfo.dayNumber}
                </Typography>
                
                {timeSlots.map((timeSlot) => {
                  const slotKey = `${dateInfo.date}-${timeSlot}`;
                  return (
                    <Box key={timeSlot} className="time-slot">
                      <Typography className="time-slot-label">
                        {timeSlot}
                      </Typography>
                      <Droppable 
                        droppableId={slotKey}
                        isDropDisabled={false}
                        isCombineEnabled={false}
                        ignoreContainerClipping={false}
                      >
                        {(provided, snapshot) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`drop-zone ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                          >
                            {(schedule[slotKey] || []).map((truck, index) => (
                              <Draggable 
                                key={`${truck.id}-${slotKey}`} 
                                draggableId={`${truck.id}-${slotKey}`} 
                                index={index}
                                isDragDisabled={false}
                              >
                                {(provided, snapshot) => (
                                  <Chip
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    label={truck.name}
                                    size="small"
                                    className={`scheduled-truck ${snapshot.isDragging ? 'dragging' : ''}`}
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
            ))}
          </Box>
        </DragDropContext>
      </Container>

      {/* 儲存確認對話框 */}
      <Dialog open={saveDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>儲存時間表</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            請輸入管理員密碼以儲存時間表
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="管理員密碼"
            value={inputPwd}
            onChange={(e) => setInputPwd(e.target.value)}
            sx={{ mt: 2 }}
            autoFocus
            placeholder="請輸入密碼..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button
            onClick={handleSaveClick}
            onMouseEnter={handleButtonHover}
            sx={{
              transform: `translate(${buttonPos.x}px, ${buttonPos.y}px)`,
              transition: 'transform 0.3s ease'
            }}
            variant="contained"
          >
            {!inputPwd.trim() ? '按不到我喔' : '確認儲存'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchedulePage;
