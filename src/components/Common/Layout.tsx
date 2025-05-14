import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Box } from '@mui/material';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
      <Header />
    </Box>
    <Box sx={{ mt: '64px', flex: 1 }}>
      {children}
    </Box>
    <Footer />
  </Box>
);

export default Layout;
