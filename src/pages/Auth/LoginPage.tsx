import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/Auth/LoginForm';
import Header from '@/components/Common/Header';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (role: number) => {
    if (role === 100) {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <div>
      <Header />
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
};

export default LoginPage;
