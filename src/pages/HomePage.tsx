import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

const HomePage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Banner */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>Chào mừng đến với EduWorld!</Typography>
        <Typography variant="h6">Nền tảng quản lý lớp học, bài giảng, đề thi hiện đại.</Typography>
      </Paper>
      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, mb: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <Box key={i}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5">Số liệu {i}</Typography>
              <Typography variant="h4">--</Typography>
            </Paper>
          </Box>
        ))}
      </Box>
      {/* Quick Actions */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Button variant="contained" sx={{ mx: 1 }}>Tạo lớp học</Button>
        <Button variant="outlined" sx={{ mx: 1 }}>Xem tất cả lớp học</Button>
        <Button variant="outlined" sx={{ mx: 1 }}>Tạo đề thi</Button>
      </Box>
      {/* Featured Courses */}
      <Typography variant="h5" sx={{ mb: 2 }}>Lớp học nổi bật</Typography>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
        {[1, 2, 3].map(i => (
          <Box key={i}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6">Tên lớp học {i}</Typography>
              <Typography>Giáo viên: --</Typography>
              <Button size="small" sx={{ mt: 1 }}>Xem chi tiết</Button>
            </Paper>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default HomePage; 