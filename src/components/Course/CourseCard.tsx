import React from 'react';
import { Paper, Typography, Button } from '@mui/material';

interface CourseCardProps {
  name: string;
  teacher: string;
  onDetail?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ name, teacher, onDetail }) => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="h6">{name}</Typography>
    <Typography>Giáo viên: {teacher}</Typography>
    <Button size="small" sx={{ mt: 1 }} onClick={onDetail}>Xem chi tiết</Button>
  </Paper>
);

export default CourseCard;
