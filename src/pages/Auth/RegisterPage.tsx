import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '@/components/Auth/RegisterForm';
import Header from '@/components/Common/Header';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate('/login');
  };

  return (
    <div >
      <Header />
      <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
    </div>
  );
};

export default RegisterPage;
