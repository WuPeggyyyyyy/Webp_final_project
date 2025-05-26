import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddTruckForm from './AddTruckForm';
import TruckList from './TruckList';
import SchedulePage from './SchedulePage';

import {
  AppBar, Toolbar, Typography, Dialog, DialogTitle,
  DialogContent, Container, Switch, FormControlLabel, CssBaseline,
  IconButton, TextField, Button, Menu, MenuItem, Box,
  DialogActions  // 加入這個 import
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function App() {
  const [openAddForm, setOpenAddForm] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const storedMode = localStorage.getItem('darkMode');
    return storedMode === null ? false : storedMode === 'true';
  });
  const [adminPassword, setAdminPassword] = useState('0000');
  const [editPwdOpen, setEditPwdOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
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
        <AppBar position="static" color="default" enableColorOnDark>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }} color="primary">
              學校餐車查詢系統
            </Typography>
            <FormControlLabel
              control={<Switch checked={darkMode} onChange={toggleTheme} />}
              label="Dark Mode"
            />
            <IconButton color="inherit" onClick={handleOpenPwdDialog}>
              <SettingsIcon />
            </IconButton>
            
            {/* 多功能下拉按鈕 */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="contained"
                color="warning"
                onClick={handleMenuClick}
                endIcon={<ExpandMoreIcon />}
                startIcon={<AddIcon />}
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
            </Box>
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<TruckList adminPassword={adminPassword} />} />
            <Route path="/schedule" element={<SchedulePage adminPassword={adminPassword} />} />
          </Routes>
        </Container>

        <Dialog open={openAddForm} onClose={handleCloseAdd} maxWidth="sm" fullWidth>
          <DialogTitle>新增餐車</DialogTitle>
          <DialogContent>
            <AddTruckForm onClose={handleCloseAdd} adminPassword={adminPassword} />
          </DialogContent>
        </Dialog>

        <Dialog open={editPwdOpen} onClose={handleClosePwdDialog}>
          <DialogTitle>修改管理員密碼</DialogTitle>
          <DialogContent>
            <TextField
              label="目前密碼"
              type="password"
              fullWidth
              sx={{ mt: 1 }}
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
            />
            <TextField
              label="新密碼"
              type="password"
              fullWidth
              sx={{ mt: 2 }}
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePwdDialog}>取消</Button>
            <Button onClick={handleChangePassword} variant="contained" color="primary">
              確認修改
            </Button>
          </DialogActions>
        </Dialog>
      </Router>
    </ThemeProvider>
  );
}

export default App;
