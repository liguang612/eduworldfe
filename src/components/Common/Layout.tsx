import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Box } from '@mui/material';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Header />
    {children}
    <Footer />
  </Box>
);

export default Layout;
