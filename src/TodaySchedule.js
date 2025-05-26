import React, { useState, useEffect } from 'react';
import { Paper, Typography, Grid, Chip } from '@mui/material';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

const getLocalDateString = () => {
  // 使用本地時間，格式為 YYYY-MM-DD
  return new Date().toLocaleDateString('sv-SE'); // sv-SE 給出 YYYY-MM-DD
};

const TodaySchedule = () => {
  const [fullSchedule, setFullSchedule] = useState({});
  const [currentDate, setCurrentDate] = useState(getLocalDateString());

  // 根據 currentDate 載入當前 schedule
  useEffect(() => {
    const loadFullSchedule = async () => {
      try {
        const scheduleDoc = await getDoc(doc(db, 'schedule', 'current'));
        if (scheduleDoc.exists()) {
          setFullSchedule(scheduleDoc.data().schedule || {});
        }
      } catch (error) {
        console.error('載入時間表失敗:', error);
      }
    };

    loadFullSchedule();
  }, [currentDate]); // 當日期變更時重新載入資料

  // 每分鐘檢查是否跨日
  useEffect(() => {
    const checkDateChange = () => {
      const newDate = getLocalDateString();
      if (newDate !== currentDate) {
        setCurrentDate(newDate);
        console.log('日期已更新:', newDate);
      }
    };

    const interval = setInterval(checkDateChange, 60000); // 每分鐘檢查一次
    return () => clearInterval(interval);
  }, [currentDate]);

  // 取得今天要顯示的 schedule
  const getTodaySchedule = () => {
    const todayData = {};
    ['早餐', '午餐', '宵夜'].forEach(timeSlot => {
      const key = `${currentDate}-${timeSlot}`;
      todayData[timeSlot] = fullSchedule[key] || [];
    });
    return todayData;
  };

  const todaySchedule = getTodaySchedule();

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        📅 今日餐車時間表 ({currentDate})
      </Typography>
      <Grid container spacing={2}>
        {['早餐', '午餐', '宵夜'].map(timeSlot => (
          <Grid item xs={4} key={timeSlot}>
            <Paper sx={{ p: 1, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="primary">
                {timeSlot}
              </Typography>
              {todaySchedule[timeSlot]?.length > 0 ? (
                todaySchedule[timeSlot].map((truck, index) => (
                  <Chip
                    key={index}
                    label={truck.name}
                    size="small"
                    sx={{ m: 0.5 }}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  暫無餐車
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default TodaySchedule;
