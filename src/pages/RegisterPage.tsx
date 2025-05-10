import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RegisterForm from '../components/Auth/RegisterForm';
import Header from '../components/Common/Header';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    // Chuyển hướng sang trang đăng nhập
    navigate('/login');
  };

  return (
    <div >
      <Header />
      <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
      <div style={{ marginTop: 16 }}>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </div>
    </div>
  );
};

export default RegisterPage;
