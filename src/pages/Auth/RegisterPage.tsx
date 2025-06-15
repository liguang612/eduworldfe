import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RegisterForm from '@/components/Auth/RegisterForm';
import Header from '@/components/Common/Header';
import { ToastContainer } from 'react-toastify';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sampleData = location.state?.sampleData;

  const handleRegisterSuccess = () => {
    navigate('/login');
  };

  return (
    <div>
      <Header />
      <RegisterForm onRegisterSuccess={handleRegisterSuccess} googleData={sampleData} />
      <ToastContainer />
    </div>
  );
};

export default RegisterPage;
