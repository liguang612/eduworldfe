import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RegisterForm from '@/components/Auth/RegisterForm';
import Header from '@/components/Common/Header';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const googleData = location.state?.googleData;

  console.log(googleData);

  const handleRegisterSuccess = () => {
    navigate('/login');
  };

  return (
    <div>
      <Header />
      <RegisterForm onRegisterSuccess={handleRegisterSuccess} googleData={googleData} />
    </div>
  );
};

export default RegisterPage;
