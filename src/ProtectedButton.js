import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Tooltip
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AdminPasswordInput from './AdminPasswordInput';

const ProtectedButton = ({
  label = '確認',
  onClick = () => {},
  disabledCondition = false,
  fallback = 'move', // 'move' | 'dialog' | 'none'
}) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [showDialog, setShowDialog] = useState(false);
  const [passwordInputOpen, setPasswordInputOpen] = useState(false);
  const [bounce, setBounce] = useState(false);

  const moveRandom = () => {
    const max = 120;
    const rand = () => Math.floor(Math.random() * max * 2 - max);
    const newPos = { x: rand(), y: rand() };
    setPos(newPos);
    setBounce(true);
    setTimeout(() => {
      setBounce(false);
      setPos({ x: 0, y: 0 });
    }, 1200);
  };

  const handleMouseMove = () => {
    if (disabledCondition && fallback === 'move') {
      moveRandom();
    }
  };

  const handleClick = () => {
    if (!disabledCondition) {
      setPasswordInputOpen(true);
    } else if (fallback === 'dialog') {
      setShowDialog(true);
    }
  };

  const handlePasswordConfirm = (pwd) => {
    setPasswordInputOpen(false);
    onClick(pwd);
  };

  return (
    <>
      <Tooltip title={disabledCondition ? '你按不到我喔 😜' : ''} arrow>
        <span>
          <Button
            variant="contained"
            color="warning"
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            startIcon={<WarningAmberIcon />}
            sx={{
              transform: `translate(${pos.x}px, ${pos.y}px) ${bounce ? 'scale(1.1)' : 'scale(1)'}`,
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              position: 'relative',
              pointerEvents: 'auto'
            }}
          >
            {label}
          </Button>
        </span>
      </Tooltip>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>⚠️ 無法送出</DialogTitle>
        <DialogContent>
          <Typography>請先完成所有欄位，再嘗試送出。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>了解</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={passwordInputOpen} onClose={() => setPasswordInputOpen(false)}>
        <DialogTitle>請輸入管理員密碼</DialogTitle>
        <DialogContent>
          <AdminPasswordInput onPasswordSubmit={handlePasswordConfirm} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordInputOpen(false)}>取消</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProtectedButton;
