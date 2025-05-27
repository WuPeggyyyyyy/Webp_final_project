import React, { useState, useEffect } from 'react';
import { Paper, Typography, Grid, Chip, Box } from '@mui/material';

const getLocalDateString = () => {
  return new Date().toISOString().split('T')[0];
};

const TodaySchedule = ({ globalSchedule = {} }) => {
  const [currentDate, setCurrentDate] = useState(getLocalDateString());

  // 監控日期變化
  useEffect(() => {
    const checkDateChange = () => {
      const newDate = getLocalDateString();
      if (newDate !== currentDate) {
        setCurrentDate(newDate);
        console.log('TodaySchedule: 日期已更新:', newDate);
      }
    };

    const interval = setInterval(checkDateChange, 60000);
    return () => clearInterval(interval);
  }, [currentDate]);

  // 監控 globalSchedule 變化
  useEffect(() => {
    console.log('TodaySchedule: 接收到新的 globalSchedule:', globalSchedule);
    console.log('TodaySchedule: globalSchedule keys:', Object.keys(globalSchedule));
  }, [globalSchedule]);

  const getTodaySchedule = () => {
    console.log('=== TodaySchedule 詳細除錯 ===');
    console.log('當前日期:', currentDate);
    console.log('globalSchedule 類型:', typeof globalSchedule);
    console.log('globalSchedule 是否為空物件:', Object.keys(globalSchedule).length === 0);
    
    // 確保 globalSchedule 是有效物件
    if (!globalSchedule || typeof globalSchedule !== 'object') {
      console.warn('TodaySchedule: globalSchedule 無效');
      return { '早餐': [], '午餐': [], '晚餐': [] };
    }

    const todayData = {};
    
    // 顯示所有 keys 的詳細資訊
    console.log('所有 globalSchedule keys:', Object.keys(globalSchedule));
    Object.keys(globalSchedule).forEach(key => {
      console.log(`Key: ${key}, 資料:`, globalSchedule[key]);
    });

    // 更改為早午晚餐，並支援原有的宵夜資料
    ['早餐', '午餐', '晚餐'].forEach(timeSlot => {
      const key = `${currentDate}-${timeSlot}`;
      // 如果找不到晚餐，嘗試找宵夜的資料
      const fallbackKey = timeSlot === '晚餐' ? `${currentDate}-宵夜` : null;
      
      let scheduleData = globalSchedule[key];
      if (!scheduleData && fallbackKey) {
        scheduleData = globalSchedule[fallbackKey];
        console.log(`使用備用 key: ${fallbackKey}`);
      }
      
      // 確保資料是陣列格式
      if (Array.isArray(scheduleData)) {
        todayData[timeSlot] = scheduleData;
      } else if (scheduleData && typeof scheduleData === 'object') {
        // 如果是物件，嘗試轉換為陣列
        todayData[timeSlot] = Object.values(scheduleData);
      } else {
        todayData[timeSlot] = [];
      }
      
      console.log(`查找 key: "${key}", 找到資料:`, globalSchedule[key]);
      console.log(`Key 是否存在:`, globalSchedule.hasOwnProperty(key));
      console.log(`時段 "${timeSlot}": 找到 ${todayData[timeSlot].length} 筆資料`);
    });

    console.log('今日時間表結果:', todayData);
    return todayData;
  };

  const todaySchedule = getTodaySchedule();

  // 計算每個時段的最大餐車數量，用於平均分配高度
  const maxTrucksCount = Math.max(
    todaySchedule['早餐']?.length || 0,
    todaySchedule['午餐']?.length || 0,
    todaySchedule['晚餐']?.length || 0,
    1 // 至少保持最小高度
  );

  // 根據最大餐車數量動態計算最小高度
  const dynamicMinHeight = Math.max(200, 120 + (maxTrucksCount * 40));

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        📅 今日餐車時間表 ({currentDate})
      </Typography>

      {/* 使用 Flexbox 確保平均分配 */}
      <Box sx={{ display: 'flex', gap: 2, minHeight: dynamicMinHeight }}>
        {['早餐', '午餐', '晚餐'].map((timeSlot, index) => {
          // 為每個時段設定不同的背景色
          const backgroundColor = index === 0 ? '#fff3e0' : 
                                 index === 1 ? '#e8f5e8' : '#f3e5f5';
          
          // 為每個時段設定不同的圖示
          const timeIcon = index === 0 ? '🌅' : 
                          index === 1 ? '☀️' : '🌙';

          return (
            <Paper 
              key={timeSlot}
              elevation={2} 
              sx={{ 
                flex: 1, // 平均分配寬度
                p: 2,
                minHeight: dynamicMinHeight,
                backgroundColor,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  mb: 2,
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                  pb: 1
                }}
              >
                {timeIcon} {timeSlot}
              </Typography>

              {/* 餐車列表容器 - 使用 flex-grow 填滿剩餘空間 */}
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {todaySchedule[timeSlot]?.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {todaySchedule[timeSlot].map((truck, truckIndex) => (
                      <Chip
                        key={`${truck.id}-${truckIndex}`}
                        label={`${truck.name} (${truck.type})`}
                        variant="outlined"
                        size="small"
                        sx={{ 
                          width: '100%',
                          justifyContent: 'flex-start',
                          borderRadius: 2,
                          '& .MuiChip-label': {
                            fontSize: '0.875rem',
                            padding: '8px 12px'
                          },
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            transform: 'translateY(-1px)',
                            boxShadow: 1
                          }
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Box 
                    sx={{ 
                      flexGrow: 1, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        textAlign: 'center', 
                        color: 'text.secondary',
                        fontStyle: 'italic'
                      }}
                    >
                      暫無餐車
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* 餐車數量顯示 */}
              <Typography 
                variant="caption" 
                sx={{ 
                  textAlign: 'center', 
                  color: 'text.secondary',
                  mt: 1,
                  pt: 1,
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}
              >
                共 {todaySchedule[timeSlot]?.length || 0} 台餐車
              </Typography>
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );
};

export default TodaySchedule;
