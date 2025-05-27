import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from '@/config/axios';
import { toast } from 'react-toastify';

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const schema = yup.object().shape({
  currentPassword: yup.string().required('Vui lòng nhập mật khẩu hiện tại'),
  newPassword: yup
    .string()
    .required('Vui lòng nhập mật khẩu mới')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  confirmPassword: yup
    .string()
    .required('Vui lòng xác nhận mật khẩu')
    .oneOf([yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp')
});

const ChangePassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangePasswordForm>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/auth/users/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Đổi mật khẩu thành công!');
      reset(); // Reset form sau khi thành công
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden layout-container flex h-full grow flex-col px-40 flex flex-1 justify-center py-5"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <p className="text-[#0e141b] text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
            Đổi mật khẩu
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">
                Mật khẩu hiện tại*
              </p>
              <input
                {...register('currentPassword')}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal"
                type="password"
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
              )}
            </label>
          </div>
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Mật khẩu mới*</p>
              <input
                {...register('newPassword')}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal"
                type="password"
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
              )}
            </label>
          </div>
          <p className="text-[#4e7397] text-sm font-normal leading-normal pb-3 pt-1 px-4">
            Sử dụng ít nhất 8 ký tự. Không sử dụng mật khẩu từ trang web khác hoặc thông tin dễ đoán.
          </p>
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">
                Xác nhận mật khẩu mới*
              </p>
              <input
                {...register('confirmPassword')}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal"
                type="password"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </label>
          </div>
          <div className="flex px-4 py-3 justify-start">
            <button
              type="submit"
              disabled={isLoading}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="truncate">{isLoading ? 'Đang xử lý...' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;