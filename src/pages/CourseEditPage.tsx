import React from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';

const CourseEditPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Tạo / Sửa lớp học</Typography>
        <TextField label="Tên lớp học" fullWidth sx={{ mb: 2 }} />
        <TextField label="Mô tả" fullWidth multiline rows={3} sx={{ mb: 2 }} />
        <TextField label="Môn học" fullWidth sx={{ mb: 2 }} />
        {/* Thêm các trường chọn bài giảng, trợ giảng, học sinh ở đây */}
        <Button variant="contained" sx={{ mt: 2 }}>Lưu</Button>
      </Paper>
    </Box>
  );
};

export default CourseEditPage;
