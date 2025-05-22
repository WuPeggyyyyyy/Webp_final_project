import React, { useState, useMemo } from 'react';
import AddTruckForm from './AddTruckForm';
import TruckList from './TruckList';

import {
  AppBar, Toolbar, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Container, Switch, FormControlLabel, CssBaseline,
  IconButton, TextField
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';

function App() {
  const [openAddForm, setOpenAddForm] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [adminPassword, setAdminPassword] = useState('0000');
  const [editPwdOpen, setEditPwdOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');

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
  const toggleTheme = () => setDarkMode(prev => !prev);

  const handleOpenPwdDialog = () => setEditPwdOpen(true);
  const handleClosePwdDialog = () => {
    setCurrentPwd('');
    setNewPwd('');
    setEditPwdOpen(false);
  };

  const handleChangePassword = () => {
    if (currentPwd === adminPassword) {
      setAdminPassword(newPwd);
      alert('密碼修改成功');
      handleClosePwdDialog();
    } else {
      alert('密碼錯誤，無法修改');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
          <Button variant="contained" color="warning" onClick={handleOpenAdd}>
            ➕ 新增餐車
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <TruckList adminPassword={adminPassword} />
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
    </ThemeProvider>
  );
}

export default App;

//https://console.cloudinary.com/app/c-52b22a1a285d1828bf344d100f615a/settings/upload/presets
//https://console.firebase.google.com/project/cgu-foodtruck/settings/general/web:ODllMDVmYjktMTBhOC00OGZhLWE5MjgtZDRiZTk0MDBjMTU4?nonce=1747594581487