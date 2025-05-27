import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddTruckForm from './AddTruckForm';
import TruckList from './TruckList';
import SchedulePage from './SchedulePage';
import ChangePassword from './ChangePassword';
import {
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Switch, 
  FormControlLabel, 
  CssBaseline,
  IconButton, 
  Button, 
  Menu, 
  MenuItem
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';

function App() {
  const [openAddForm, setOpenAddForm] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const storedMode = localStorage.getItem('darkMode');
    return storedMode === null ? false : storedMode === 'true';
  });
  const [adminPassword, setAdminPassword] = useState('0000');
  const [editPwdOpen, setEditPwdOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // 全域時間表狀態
  const [globalSchedule, setGlobalSchedule] = useState({});

  // 監聽 Firebase 時間表變化
  useEffect(() => {
    console.log('App: 設置 Firebase 監聽器');
    
    const unsubscribe = onSnapshot(
      doc(db, 'schedule', 'current'),
      (docSnapshot) => {
        console.log('App: 收到 Firebase 更新');
        console.log('App: 文檔存在:', docSnapshot.exists());
        
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const newSchedule = data?.schedule || {};
          
          console.log('App: 新的時間表資料:', newSchedule);
          console.log('App: 時間表 keys:', Object.keys(newSchedule));
          
          setGlobalSchedule(newSchedule);
        } else {
          console.log('App: 文檔不存在，清空時間表');
          setGlobalSchedule({});
        }
      },
      (error) => {
        console.error('App: 監聽時間表失敗:', error);
      }
    );

    return () => {
      console.log('App: 清理 Firebase 監聽器');
      unsubscribe();
    };
  }, []);

  // 除錯：監控 globalSchedule 變化
  useEffect(() => {
    console.log('App: globalSchedule 已更新:', globalSchedule);
    console.log('App: globalSchedule keys 數量:', Object.keys(globalSchedule).length);
  }, [globalSchedule]);

  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: { main: '#f9a825' },
        warning: { main: '#f9a825' },
      },
    }), [darkMode]);

  const handleOpenAdd = () => setOpenAddForm(true);
  const handleCloseAdd = () => setOpenAddForm(false);

  const toggleTheme = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', newMode);
      return newMode;
    });
  };

  const handleOpenPwdDialog = () => setEditPwdOpen(true);
  const handleClosePwdDialog = () => setEditPwdOpen(false);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              學校餐車查詢系統
            </Typography>
            <FormControlLabel
              control={<Switch checked={darkMode} onChange={toggleTheme} />}
              label="Dark Mode"
            />
            <IconButton color="inherit" onClick={handleOpenPwdDialog}>
              <SettingsIcon />
            </IconButton>

            <Button
              color="inherit"
              startIcon={<ExpandMoreIcon />}
              onClick={handleMenuClick}
            >
              新增功能
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => {
                handleOpenAdd();
                handleMenuClose();
              }}>
                ➕ 新增餐車
              </MenuItem>
              <MenuItem onClick={() => {
                window.location.href = '/schedule';
                handleMenuClose();
              }}>
                📅 新增時間
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Container>
          <Routes>
            <Route 
              path="/" 
              element={
                <TruckList 
                  adminPassword={adminPassword} 
                  globalSchedule={globalSchedule}
                />
              } 
            />
            <Route 
              path="/schedule" 
              element={
                <SchedulePage 
                  adminPassword={adminPassword}
                  globalSchedule={globalSchedule}
                  setGlobalSchedule={setGlobalSchedule}
                />
              } 
            />
          </Routes>
        </Container>

        <AddTruckForm
          open={openAddForm}
          onClose={handleCloseAdd}
          adminPassword={adminPassword}
        />

        <ChangePassword 
          open={editPwdOpen} 
          onClose={handleClosePwdDialog}
          adminPassword={adminPassword}
          setAdminPassword={setAdminPassword}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;
