import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddTruckForm from './AddTruckForm';
import TruckList from './TruckList';
import SchedulePage from './SchedulePage';
import ChangePassword from './ChangePassword'; // 引入你的 ChangePassword 元件
import {
  AppBar, Toolbar, Typography, Container, Switch, FormControlLabel, CssBaseline,
  IconButton, Button, Menu, MenuItem
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function App() {
  const [openAddForm, setOpenAddForm] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const storedMode = localStorage.getItem('darkMode');
    return storedMode === null ? false : storedMode === 'true';
  });
  const [adminPassword, setAdminPassword] = useState('0000');
  const [editPwdOpen, setEditPwdOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

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
            <Route path="/" element={<TruckList />} />
            <Route path="/schedule" element={<SchedulePage />} />
          </Routes>
        </Container>

        <AddTruckForm open={openAddForm} onClose={handleCloseAdd} />
        
        {/* 使用你現有的 ChangePassword 元件 */}
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
