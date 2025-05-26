import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';

const ProtectedButton = ({
  label = '確認',
  onClick = () => {},
  disabledCondition = false,
  fallback = 'move', // 'move' | 'dialog' | 'none'
}) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [showDialog, setShowDialog] = useState(false);

  const moveRandom = () => {
    const max = 80;
    const rand = () => Math.floor(Math.random() * max * 2 - max);
    setPos({ x: rand(), y: rand() });
  };

  const handleMouseEnter = () => {
    if (disabledCondition) {
      if (fallback === 'move') moveRandom();
      else if (fallback === 'dialog') setShowDialog(true);
    }
  };

  const handleClick = () => {
    if (!disabledCondition) onClick();
    else if (fallback === 'dialog') setShowDialog(true);
  };

  return (
    <>
      <Button
        variant="contained"
        color="warning"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        sx={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          transition: 'transform 0.2s ease',
          position: 'relative',
        }}
      >
        {label}
      </Button>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>⚠️ 無法送出</DialogTitle>
        <DialogContent>
          <Typography>請先輸入正確的密碼，再嘗試送出。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>了解</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProtectedButton;