import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../config/axios'; // Đảm bảo axios đã được cấu hình baseURL

const schema = yup.object().shape({
  email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
  password: yup.string().required('Mật khẩu là bắt buộc'),
});

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string; password: string }>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoginError(null);
    try {
      const response = await axios.post('/api/auth/login', data);
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        authLogin(response.data.token, {
          id: response.data.id,
          name: response.data.name,
          email: data.email,
          avatar: response.data.avatar
        });
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setLoginError('Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (error: any) {
      setLoginError('Email hoặc mật khẩu không đúng.');
    }
  };

  const customStyles = {
    '--checkbox-tick-svg':
      'url(\'data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(248,250,252)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e\')',
    fontFamily: 'Inter, "Noto Sans", sans-serif',
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={customStyles}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <h1 className="text-[#0e141b] tracking-light text-[28px] font-bold leading-tight px-4 text-left pb-3 pt-5">
              Đăng nhập
            </h1>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-0">
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Email</p>
                  <input
                    placeholder="you@example.com"
                    className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border ${errors.email ? 'border-red-500' : 'border-[#d0dbe7]'
                      } bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal`}
                    {...register('email')}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </label>
              </div>
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Mật khẩu</p>
                  <input
                    placeholder="••••••••••••••••"
                    type="password"
                    className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border ${errors.password ? 'border-red-500' : 'border-[#d0dbe7]'
                      } bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal`}
                    {...register('password')}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                </label>
              </div>
              <div className="px-4">
                <label className="flex gap-x-3 py-3 flex-row">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-[#d0dbe7] border-2 bg-transparent text-[#1980e6] checked:bg-[#1980e6] checked:border-[#1980e6] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#d0dbe7] focus:outline-none"
                  />
                  <p className="text-[#0e141b] text-base font-normal leading-normal">Ghi nhớ tài khoản</p>
                </label>
              </div>
              {loginError && <p className="text-red-500 text-sm text-center pb-2">{loginError}</p>}
              <div className="flex px-4 py-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex min-w-[84px] max-w-[480px] items-center justify-center rounded-xl h-10 px-4 flex-1 bg-[#1A80E5] text-white text-sm font-bold tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">{isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
                </button>
              </div>
            </form>
            <p className="text-[#4e7397] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
              Chưa có tài khoản?
            </p>
            <div className="flex px-4 py-3">
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em]"
                onClick={() => navigate('/register')}
                type="button"
              >
                <span className="truncate">Đăng ký</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;