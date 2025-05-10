import React from 'react';
import { Box, Typography, Button, Paper, TextField } from '@mui/material';
import CourseCard from '../components/Course/CourseCard';

const CoursesPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Danh sách lớp học</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField label="Tìm kiếm lớp học" size="small" />
        <Button variant="contained">Tạo lớp học</Button>
      </Box>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' } }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <CourseCard key={i} name={`Tên lớp học ${i}`} teacher="Giáo viên: --" onDetail={() => { }} />
        ))}
      </Box>
    </Box>
  );
};

export default CoursesPage;
