import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form'; // Removed Controller as it's not strictly needed for native date input
import { yupResolver } from '@hookform/resolvers/yup';
import type { Resolver } from 'react-hook-form';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { registerUser } from '../../api/authApi';
import { ToastContainer, toast } from 'react-toastify';


interface RegisterFormProps {
  onRegisterSuccess: () => void;
}

const schema = yup.object().shape({
  name: yup.string().required('Tên là bắt buộc'),
  email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
  password: yup.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự').required('Mật khẩu là bắt buộc'),
  role: yup.string().oneOf(['student', 'teacher'] as const).required('Vai trò là bắt buộc'),
  grade: yup.string().when('role', {
    is: 'student',
    then: (schema) => schema.required('Lớp là bắt buộc đối với học sinh'),
    otherwise: (schema) => schema.optional().nullable(),
  }),
  school: yup.string().required('Trường học là bắt buộc'),
  address: yup.string().optional().nullable(),
  birthday: yup.string()
    .optional()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .matches(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'Ngày sinh không hợp lệ (YYYY-MM-DD)',
      excludeEmptyString: true
    }),
});

type FormData = yup.InferType<typeof schema>;

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const [selectedAvatarPreview, setSelectedAvatarPreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as Resolver<FormData>,
    defaultValues: {
      role: 'student',
      name: '',
      email: '',
      password: '',
      grade: '',
      school: '',
      address: '',
      birthday: '', // Hoặc null nếu bạn đã transform '' thành null trong schema và muốn default là null
    },
  });

  const currentRole = watch('role');

  useEffect(() => {
    if (currentRole !== 'student') {
      setValue('grade', '', { shouldValidate: true });
    }
  }, [currentRole, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setRegisterError(null);

    try {

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('role', data.role === 'teacher' ? '1' : '0');
      formData.append('address', data.address || '');
      if (data.grade) formData.append('grade', data.grade);
      formData.append('school', data.school);
      if (data.birthday) formData.append('birthday', data.birthday);
      if (selectedFile) formData.append('avatar', selectedFile);

      await registerUser(formData);

      toast.success('Đăng ký thành công');
      onRegisterSuccess();
    } catch (error: any) {
      setRegisterError(error?.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại sau.');
      console.error('Registration error:', error);

      toast.error('Đăng ký thất bại. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    document.getElementById('avatarUpload')?.click();
  };


  const rootStyle: React.CSSProperties & { '--checkbox-tick-svg'?: string } = {
    '--checkbox-tick-svg': "url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(248,250,252)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e')",
    fontFamily: 'Inter, "Noto Sans", sans-serif',
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={rootStyle}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <form onSubmit={handleSubmit(onSubmit)} className="layout-content-container flex flex-row w-[512px] py-5 flex-1">
            <div className="flex flex-col w-[512px] max-w-[512px] py-5 flex-1">
              <h2 className="text-[#0e141b] tracking-light text-[28px] font-bold leading-tight px-4 text-left pb-3 pt-5">
                Tạo tài khoản
              </h2>
              {/* Your name */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Tên của bạn</p>
                  <input
                    {...register('name')}
                    placeholder="Nguyễn Văn A"
                    className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border ${errors.name ? 'border-red-500' : 'border-[#d0dbe7]'} bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </label>
              </div>

              {/* Email address */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Email</p>
                  <input
                    {...register('email')}
                    placeholder="nguyenvana@gmail.com"
                    className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border ${errors.email ? 'border-red-500' : 'border-[#d0dbe7]'} bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </label>
              </div>
              <p className="text-[#4e7397] text-sm font-normal leading-normal pb-3 pt-1 px-4">Vui lòng nhập địa chỉ email hợp lệ</p>

              {/* Password */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Mật khẩu</p>
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="Nhập mật khẩu của bạn"
                    className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border ${errors.password ? 'border-red-500' : 'border-[#d0dbe7]'} bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal`}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                </label>
              </div>
              <p className="text-[#4e7397] text-sm font-normal leading-normal pb-3 pt-1 px-4">Mật khẩu phải có ít nhất 8 ký tự</p>

              {/* Role */}

              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Bạn là: </p>
                  <div className="flex flex-wrap gap-6">
                    <label className={`text-sm font-medium leading-normal flex items-center justify-center rounded-xl border px-4 h-11 text-[#0e141b] relative cursor-pointer ${currentRole === 'student' ? 'border-[3px] px-3.5 border-[#1980e6]' : 'border-[#d0dbe7]'}`}>
                      Học sinh
                      <input
                        type="radio"
                        {...register('role')}
                        value="student"
                        className="invisible absolute"
                      />
                    </label>
                    <label className={`text-sm font-medium leading-normal flex items-center justify-center rounded-xl border px-4 h-11 text-[#0e141b] relative cursor-pointer ${currentRole === 'teacher' ? 'border-[3px] px-3.5 border-[#1980e6]' : 'border-[#d0dbe7]'}`}>
                      Giáo viên
                      <input
                        type="radio"
                        {...register('role')}
                        value="teacher"
                        className="invisible absolute"
                      />
                    </label>
                  </div>
                  {errors.role && <p className="text-red-500 text-sm px-4">{errors.role.message}</p>}
                </label>
              </div>

              {currentRole === 'student' && (
                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Lớp</p>
                    <input
                      {...register('grade')}
                      placeholder="9"
                      className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border ${errors.grade ? 'border-red-500' : 'border-[#d0dbe7]'} bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal`}
                    />
                    {errors.grade && <p className="text-red-500 text-sm mt-1">{errors.grade.message}</p>}
                  </label>
                </div>
              )}

              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Trường học</p>
                  <input
                    {...register('school')}
                    placeholder="Trường học"
                    className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border ${errors.school ? 'border-red-500' : 'border-[#d0dbe7]'} bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal`}
                  />
                  {errors.school && <p className="text-red-500 text-sm mt-1">{errors.school.message}</p>}
                </label>
              </div>

              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Địa chỉ (Tùy chọn)</p>
                  <input
                    {...register('address')}
                    placeholder="Đại Cồ Việt, Hà Nội"
                    className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border ${errors.address ? 'border-red-500' : 'border-[#d0dbe7]'} bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal`}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                </label>
              </div>

              {/* Birthday */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Ngày sinh (Tùy chọn)</p>
                  <input
                    {...register('birthday')}
                    type="date" // Thay đổi type thành "date"
                    // Không cần placeholder cho type="date"
                    className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border ${errors.birthday ? 'border-red-500' : 'border-[#d0dbe7]'} bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal`}
                  />
                  {errors.birthday && <p className="text-red-500 text-sm mt-1">{errors.birthday.message}</p>}
                </label>
              </div>

              {registerError && <p className="text-red-500 text-sm text-center pb-2">{registerError}</p>}

              <div className="flex px-4 py-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-1 bg-[#1980e6] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">
                    {isLoading ? 'Đang xử lý...' : 'Tạo tài khoản'}
                  </span>
                </button>
              </div>

              <div className="h-10"></div>
              <div style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
              </div>
            </div>
            <div className="md:w-1/3 flex flex-col items-center">
              <div
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 transition-colors aspect-square max-w-xs mx-auto"
                onClick={handleAvatarClick}
              >
                {selectedAvatarPreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={selectedAvatarPreview}
                      alt="Selected avatar"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-gray-400 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-[#0e141b] text-base font-medium leading-normal mb-1">Class avatar</p>
                    <p className="text-[#4e7397] text-sm font-normal leading-normal">
                      Drag & drop or <span className="text-blue-600 font-semibold">click to upload</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleAvatarChange}
                  id="avatarUpload"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default RegisterForm;