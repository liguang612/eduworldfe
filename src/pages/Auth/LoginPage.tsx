import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/Auth/LoginForm';
import Header from '@/components/Common/Header';
import { ToastContainer } from 'react-toastify';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    console.log('login success');
    navigate('/');
  };

  return (
    <div>
      <Header />
      <LoginForm onLoginSuccess={handleLoginSuccess} />
      <ToastContainer />
    </div>
  );
};

export default LoginPage;
