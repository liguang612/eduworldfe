import React from 'react';
import { Box, Typography, Tabs, Tab, Paper, Button } from '@mui/material';

const CourseDetailPage: React.FC = () => {
  const [tab, setTab] = React.useState(0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Tên lớp học</Typography>
      <Paper sx={{ mb: 2, p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Thông tin" />
          <Tab label="Thành viên" />
          <Tab label="Bài giảng" />
          <Tab label="Đề thi" />
          <Tab label="Đánh giá" />
        </Tabs>
        {tab === 0 && <Box sx={{ p: 2 }}>Thông tin lớp học...</Box>}
        {tab === 1 && <Box sx={{ p: 2 }}>Danh sách thành viên, phê duyệt yêu cầu...</Box>}
        {tab === 2 && <Box sx={{ p: 2 }}>Danh sách bài giảng, thêm/sửa/xoá...</Box>}
        {tab === 3 && <Box sx={{ p: 2 }}>Danh sách đề thi...</Box>}
        {tab === 4 && <Box sx={{ p: 2 }}>Đánh giá lớp học, form đánh giá...</Box>}
      </Paper>
      <Button variant="outlined">Quay lại danh sách lớp học</Button>
    </Box>
  );
};

export default CourseDetailPage;
