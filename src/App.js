import React, { useState, useMemo } from 'react';
import AddTruckForm from './AddTruckForm';
import TruckList from './TruckList';
import ChangePassword from './ChangePassword';

import {
  AppBar, Toolbar, Typography, Dialog, DialogTitle,
  DialogContent, Container, Switch, FormControlLabel, CssBaseline,
  IconButton, Button
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';

function App() {
  const [openAddForm, setOpenAddForm] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const storedMode = localStorage.getItem('darkMode');
    return storedMode === null ? false : storedMode === 'true';
  });
  const [adminPassword, setAdminPassword] = useState('0000');
  const [editPwdOpen, setEditPwdOpen] = useState(false);

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

      <ChangePassword
        open={editPwdOpen}
        onClose={handleClosePwdDialog}
        adminPassword={adminPassword}
        setAdminPassword={setAdminPassword}
      />
    </ThemeProvider>
  );
}

export default App;
