import React, { useState } from 'react';
import { auth } from '@/config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import GoogleIcon from '@/assets/google.svg';
import { baseURL } from '@/config/axios';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';

interface GoogleLoginButtonProps {
  onLoginSuccess?: () => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { login: authLogin } = useAuth();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Thêm scopes nếu cần
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const response = await fetch(`${baseURL}/api/auth/google/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();

      if (!responseText) {
        throw new Error('Empty response from server');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      if (data.newUser) {
        toast.warning('Bạn chưa từng tạo tài khoản trong hệ thống, hãy điền thêm thông tin để bắt dầu tham gia nhé.');
        navigate('/register', {
          state: {
            googleData: {
              fullName: data.userInfo.fullName,
              email: data.userInfo.email,
              avatar: data.userInfo.avatar
            }
          }
        });
      } else {
        localStorage.setItem('token', data.accessToken);
        authLogin(data.accessToken, {
          id: data.userInfo.id,
          name: data.userInfo.fullName,
          email: data.userInfo.email,
          avatar: data.userInfo.avatar,
          role: data.userInfo.role
        });
        if (onLoginSuccess) onLoginSuccess();
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 py-3 flex-1 bg-white text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <img src={GoogleIcon} alt="Google" className="w-5 h-5 mr-2" />
      <span className="truncate">
        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập với Google'}
      </span>
    </button>
  );
};

export default GoogleLoginButton; 