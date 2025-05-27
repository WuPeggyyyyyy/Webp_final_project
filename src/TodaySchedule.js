import React, { useState, useEffect } from 'react';
import { Paper, Typography, Grid, Chip, Box, Button } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';

const getLocalDateString = () => {
  return new Date().toISOString().split('T')[0];
};

const TodaySchedule = ({ globalSchedule = {} }) => {
  const [currentDate, setCurrentDate] = useState(getLocalDateString());

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

  useEffect(() => {
    console.log('TodaySchedule: 接收到新的 globalSchedule:', globalSchedule);
    console.log('TodaySchedule: globalSchedule keys:', Object.keys(globalSchedule));
  }, [globalSchedule]);

  const getTodaySchedule = () => {
    console.log('=== TodaySchedule 詳細除錯 ===');
    console.log('當前日期:', currentDate);
    console.log('globalSchedule 類型:', typeof globalSchedule);
    console.log('globalSchedule 是否為空物件:', Object.keys(globalSchedule).length === 0);

    if (!globalSchedule || typeof globalSchedule !== 'object') {
      console.warn('TodaySchedule: globalSchedule 無效');
      return { '早餐': [], '午餐': [], '宵夜': [] };
    }

    const todayData = {};
    console.log('所有 globalSchedule keys:', Object.keys(globalSchedule));
    Object.keys(globalSchedule).forEach(key => {
      console.log(`Key: ${key}, 資料:`, globalSchedule[key]);
    });

    ['早餐', '午餐', '宵夜'].forEach(timeSlot => {
      const key = `${currentDate}-${timeSlot}`;
      const fallbackKey = timeSlot === '晚餐' ? `${currentDate}-宵夜` : null;

      let scheduleData = globalSchedule[key];
      if (!scheduleData && fallbackKey) {
        scheduleData = globalSchedule[fallbackKey];
        console.log(`使用備用 key: ${fallbackKey}`);
      }

      if (Array.isArray(scheduleData)) {
        todayData[timeSlot] = scheduleData;
      } else if (scheduleData && typeof scheduleData === 'object') {
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

  const scrollToTruck = (truckId) => {
    const element = document.getElementById(`truck-${truckId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.style.border = '2px solid #ffc107';
      setTimeout(() => {
        element.style.border = '';
      }, 3000);
    }
  };

  const scrollToTruckList = () => {
    const element = document.getElementById('truck-list-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const todaySchedule = getTodaySchedule();
  const maxTrucksCount = Math.max(
    todaySchedule['早餐']?.length || 0,
    todaySchedule['午餐']?.length || 0,
    todaySchedule['宵夜']?.length || 0,
    1
  );
  const dynamicMinHeight = Math.max(200, 120 + (maxTrucksCount * 40));

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        📅 今日餐車時間表 ({currentDate})
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, minHeight: dynamicMinHeight }}>
        {['早餐', '午餐', '宵夜'].map((timeSlot, index) => {
          const timeIcon = index === 0 ? '🌅' :
                          index === 1 ? '☀️' : '🌙';

          return (
            <Paper 
              key={timeSlot}
              elevation={2} 
              sx={{ 
                flex: 1,
                p: 2,
                minHeight: dynamicMinHeight,
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

              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {todaySchedule[timeSlot]?.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {todaySchedule[timeSlot].map((truck, truckIndex) => (
                      <Chip
                        key={`${truck.id}-${truckIndex}`}
                        label={`${truck.name} (${truck.type})`}
                        variant="outlined"
                        size="small"
                        onClick={() => scrollToTruck(truck.id)}
                        sx={{ 
                          width: '100%',
                          justifyContent: 'flex-start',
                          borderRadius: 2,
                          cursor: 'pointer',
                          '& .MuiChip-label': {
                            fontSize: '0.875rem',
                            padding: '8px 12px'
                          },
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: 2
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
