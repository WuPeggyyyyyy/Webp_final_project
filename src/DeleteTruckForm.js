import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box
} from '@mui/material';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { verifyAdminPassword } from './useAdminAuth';

const DeleteTruckForm = ({ truckId, onClose, adminPassword = '' }) => {
    const [inputPwd, setInputPwd] = useState('');
    const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });

    const handleDelete = async () => {
        console.log('inputPwd:', `"${inputPwd}"`, 'adminPassword:', `"${adminPassword}"`);
        
        // 使用統一的密碼驗證函數
        if (!verifyAdminPassword(inputPwd, adminPassword)) {
            alert('密碼錯誤，無法刪除');
            return;
        }

        try {
            await deleteDoc(doc(db, 'trucks', truckId));
            alert('刪除成功');
            setInputPwd('');
            onClose();
        } catch (err) {
            console.error('刪除失敗：', err);
            alert('刪除失敗');
        }
    };

    const handleButtonHover = () => {
        if (!inputPwd.trim()) {
            const maxMove = 40;
            const randomX = Math.floor(Math.random() * maxMove * 2 - maxMove);
            const randomY = Math.floor(Math.random() * maxMove * 2 - maxMove);
            setButtonPos({ x: randomX, y: randomY });
        }
    };

    const handleButtonClick = () => {
        if (!inputPwd.trim()) {
            alert('請先輸入密碼！');
            return;
        }
        handleDelete();
    };

    const handleClose = () => {
        setInputPwd('');
        onClose();
    };

    return (
        <Dialog open={true} onClose={handleClose}>
            <DialogTitle>刪除餐車</DialogTitle>
            <DialogContent>
                確定要刪除這筆餐車資料嗎？
                <TextField
                    type="password"
                    label="管理員密碼"
                    value={inputPwd}
                    onChange={(e) => setInputPwd(e.target.value)}
                    fullWidth
                    sx={{ mt: 2 }}
                    autoFocus
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>取消</Button>
                <Box
                    component="div"
                    sx={{
                        position: 'relative',
                        display: 'inline-block',
                        transform: `translate(${buttonPos.x}px, ${buttonPos.y}px)`,
                        transition: 'transform 0.3s ease'
                    }}
                >
                    <Button
                        onClick={handleButtonClick}
                        onMouseEnter={handleButtonHover}
                        color="error"
                        variant="contained"
                    >
                        {!inputPwd.trim() ? '抓不到我' : '確認刪除'}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteTruckForm;
