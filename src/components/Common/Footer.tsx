import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => (
  <Box sx={{ py: 2, textAlign: 'center', bgcolor: '#f5f5f5', borderTop: '1px solid #eee' }}>
    <Typography variant="body2" color="text.secondary">
      © {new Date().getFullYear()} EduWorld. All rights reserved.
    </Typography>
  </Box>
);

export default Footer;
