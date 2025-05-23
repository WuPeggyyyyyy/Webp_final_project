import React, { useState, useRef } from 'react';
import {
  Box, TextField, Button, Typography, Fade, Paper
} from '@mui/material';

const AdminPasswordInput = ({ onSubmit, correctPassword }) => {
  const [inputPwd, setInputPwd] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const buttonRef = useRef(null);
  const [buttonPos, setButtonPos] = useState({ left: '0%' });

  const handleHover = () => {
    if (inputPwd.trim() === '') {
      setError(true);
      setButtonPos((prev) => ({
        left: prev.left === '0%' ? '60%' : '0%',
      }));
    }
  };

  const handleClick = () => {
    if (inputPwd.trim() === '') return;

    if (inputPwd !== correctPassword) {
      alert('密碼錯誤');
      return;
    }

    setSubmitted(true);
    onSubmit(); // 呼叫上層邏輯（如刪除、送出等）
  };

  const handleReset = () => {
    setSubmitted(false);
    setInputPwd('');
    setButtonPos({ left: '0%' });
    setError(false);
  };

  return (
    <Box position="relative" p={3} sx={{ border: '1px solid #ccc', borderRadius: 2 }}>
      <Box maxWidth={320} mx="auto" display="flex" flexDirection="column" gap={2}>
        <TextField
          label="管理員密碼"
          type="password"
          fullWidth
          value={inputPwd}
          onChange={(e) => setInputPwd(e.target.value)}
          error={error}
          helperText={error ? '請輸入密碼' : ''}
        />

        <Box position="relative" height={40}>
          <Button
            variant="contained"
            color="warning"
            onMouseEnter={handleHover}
            onClick={handleClick}
            ref={buttonRef}
            sx={{
              position: 'absolute',
              top: 0,
              left: buttonPos.left,
              transition: 'all 0.3s ease',
              minWidth: 160,
            }}
          >
            送出表單
          </Button>
        </Box>
      </Box>

      {/* 遮罩動畫 */}
      <Fade in={submitted}>
        <Paper
          onClick={handleReset}
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(51, 65, 85, 0.9)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            borderRadius: 2,
            color: 'white',
            cursor: 'pointer',
          }}
        >
          <Typography variant="h6">表單已送出！(*´∀`)~♥</Typography>
          <Typography variant="body2">點一下再來一次</Typography>
        </Paper>
      </Fade>
    </Box>
  );
};

export default AdminPasswordInput;
