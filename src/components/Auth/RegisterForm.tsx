import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form'; // Removed Controller as it's not strictly needed for native date input
import { yupResolver } from '@hookform/resolvers/yup';
import type { Resolver } from 'react-hook-form';
import * as yup from 'yup';
import axios from '../../config/axios';

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
      const registerData = {
        ...data,
        role: data.role === 'teacher' ? 1 : 0,
        // birthday đã ở định dạng YYYY-MM-DD nếu được chọn
      };

      if (data.role !== 'student') {
        delete (registerData as any).grade;
      }
      // Nếu birthday là null (do không chọn hoặc xóa), và backend không muốn nhận null, bạn có thể xóa nó:
      if (registerData.birthday === null) {
        delete (registerData as any).birthday;
      }

      console.log('Submitting data:', registerData);
      await axios.post('/api/auth/register', registerData);
      onRegisterSuccess();
    } catch (error: any) {
      setRegisterError(error?.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại sau.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
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
          <form onSubmit={handleSubmit(onSubmit)} className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 flex-1">
            <h2 className="text-[#0e141b] tracking-light text-[28px] font-bold leading-tight px-4 text-left pb-3 pt-5">
              Create an account
            </h2>

            {/* Your name */}
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Your name</p>
                <input
                  {...register('name')}
                  placeholder="John Smith"
                  className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border ${errors.name ? 'border-red-500' : 'border-[#d0dbe7]'} bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </label>
            </div>

            {/* Email address */}
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Email address</p>
                <input
                  {...register('email')}
                  placeholder="johnsmith@gmail.com"
                  className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border ${errors.email ? 'border-red-500' : 'border-[#d0dbe7]'} bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </label>
            </div>
            <p className="text-[#4e7397] text-sm font-normal leading-normal pb-3 pt-1 px-4">Please enter a valid email address</p>
            <p className="text-[#4e7397] text-sm font-normal leading-normal pb-3 pt-1 px-4">This will be used for account recovery and important updates</p>

            {/* Password */}
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Password</p>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="Enter your password"
                  className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border ${errors.password ? 'border-red-500' : 'border-[#d0dbe7]'} bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal`}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </label>
            </div>
            <p className="text-[#4e7397] text-sm font-normal leading-normal pb-3 pt-1 px-4">Password must be at least 8 characters</p>
            <p className="text-[#4e7397] text-sm font-normal leading-normal pb-3 pt-1 px-4">This will be used to sign in to your account</p>

            {/* Role */}
            <div className="flex flex-wrap gap-3 p-4">
              <label className={`text-sm font-medium leading-normal flex items-center justify-center rounded-xl border px-4 h-11 text-[#0e141b] relative cursor-pointer ${currentRole === 'student' ? 'border-[3px] px-3.5 border-[#1980e6]' : 'border-[#d0dbe7]'}`}>
                I'm a student
                <input
                  type="radio"
                  {...register('role')}
                  value="student"
                  className="invisible absolute"
                />
              </label>
              <label className={`text-sm font-medium leading-normal flex items-center justify-center rounded-xl border px-4 h-11 text-[#0e141b] relative cursor-pointer ${currentRole === 'teacher' ? 'border-[3px] px-3.5 border-[#1980e6]' : 'border-[#d0dbe7]'}`}>
                I'm a teacher
                <input
                  type="radio"
                  {...register('role')}
                  value="teacher"
                  className="invisible absolute"
                />
              </label>
            </div>
            {errors.role && <p className="text-red-500 text-sm px-4">{errors.role.message}</p>}

            {currentRole === 'student' && (
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Grade</p>
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
                <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">School</p>
                <input
                  {...register('school')}
                  placeholder="High School"
                  className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border ${errors.school ? 'border-red-500' : 'border-[#d0dbe7]'} bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal`}
                />
                {errors.school && <p className="text-red-500 text-sm mt-1">{errors.school.message}</p>}
              </label>
            </div>

            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Address (Optional)</p>
                <input
                  {...register('address')}
                  placeholder="123 Main St, City, State, Zip"
                  className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border ${errors.address ? 'border-red-500' : 'border-[#d0dbe7]'} bg-slate-50 focus:border-[#d0dbe7] h-14 placeholder:text-[#4e7397] p-[15px] text-base font-normal leading-normal`}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
              </label>
            </div>

            {/* Birthday */}
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">Birthday (Optional)</p>
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
                  {isLoading ? 'Đang xử lý...' : 'Create account'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;