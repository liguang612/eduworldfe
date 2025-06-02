import React, { useState, useRef, useEffect } from 'react';
import { getUser } from '@/api/authApi';
import type { User } from '@/contexts/AuthContext';

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const ProfileDialog: React.FC<ProfileDialogProps> = ({ isOpen, onClose, user }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [fetchedUser, setFetchedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Fetch user data when dialog opens and user prop is available
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setFetchedUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const userData = await getUser(user.id);
        setFetchedUser(userData);
      } catch (err: any) {
        console.error('Failed to fetch user data:', err);
        setError('Không thể tải thông tin người dùng.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchUserData();
    } else {
      // Reset state when closing
      setFetchedUser(null);
      setLoading(false);
      setError(null);
    }
  }, [isOpen, user?.id]);

  if (!isOpen) {
    return null;
  }

  // Display loading, error, or user data
  if (loading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
      >
        <div className="bg-slate-50 rounded-lg shadow-xl p-8">
          <p className="text-[#0e141b] text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
      >
        <div className="bg-slate-50 rounded-lg shadow-xl p-8">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-[#e7edf3] text-[#0e141b] rounded-xl text-sm font-bold"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  // Use fetchedUser for display
  if (!fetchedUser) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
      >
        <div className="bg-slate-50 rounded-lg shadow-xl p-8">
          <p className="text-red-500 text-lg">Không có thông tin người dùng.</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-[#e7edf3] text-[#0e141b] rounded-xl text-sm font-bold"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  // Display fetched user data
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.4)]"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      {fetchedUser && (
        <div
          ref={dialogRef}
          className="relative flex flex-col bg-slate-50 rounded-lg shadow-xl overflow-hidden w-full max-w-xl mx-4"
        >
          <div className="flex flex-col max-h-[80vh] overflow-y-auto">
            <div className="p-6 @container">
              <div className="flex w-full flex-col gap-4 items-center">
                <div className="flex gap-4 flex-col items-center">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-24 w-28"
                    style={{ backgroundImage: `url('${fetchedUser.avatar}')` }}
                  ></div>
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-[#0e141b] text-xl font-bold leading-tight tracking-[-0.015em] text-center">{fetchedUser.name}</p>
                    <p className="text-[#4e7397] text-sm font-normal leading-normal text-center">{fetchedUser.email}</p>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-[#0e141b] text-md font-bold leading-tight tracking-[-0.015em] px-6 pb-2 pt-4">Thông tin cá nhân</h3>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              {fetchedUser.birthday && (
                <div className="flex flex-col gap-1 border-t border-solid border-t-[#d0dbe7] py-3">
                  <p className="text-[#4e7397] text-xs font-normal leading-normal">Ngày sinh</p>
                  <p className="text-[#0e141b] text-sm font-normal leading-normal">{new Date(fetchedUser.birthday).toLocaleDateString()}</p>
                </div>
              )}
              {fetchedUser.school && (
                <div className="flex flex-col gap-1 border-t border-solid border-t-[#d0dbe7] py-3 sm:pl-2">
                  <p className="text-[#4e7397] text-xs font-normal leading-normal">Trường</p>
                  <p className="text-[#0e141b] text-sm font-normal leading-normal">{fetchedUser.school}</p>
                </div>
              )}
              {fetchedUser.grade !== null && fetchedUser.grade !== undefined && (
                <div className="flex flex-col gap-1 border-t border-solid border-t-[#d0dbe7] py-3">
                  <p className="text-[#4e7397] text-xs font-normal leading-normal">Lớp</p>
                  <p className="text-[#0e141b] text-sm font-normal leading-normal">{fetchedUser.grade}</p>
                </div>
              )}
              {fetchedUser.address && (
                <div className="flex flex-col gap-1 border-t border-solid border-t-[#d0dbe7] py-3 sm:pl-2">
                  <p className="text-[#4e7397] text-xs font-normal leading-normal">Địa chỉ</p>
                  <p className="text-[#0e141b] text-sm font-normal leading-normal">{fetchedUser.address}</p>
                </div>
              )}
              {fetchedUser.role !== null && fetchedUser.role !== undefined && (
                <div className="flex flex-col gap-1 border-t border-solid border-t-[#d0dbe7] py-3 col-span-1 sm:col-span-2 sm:pr-[50%]">
                  <p className="text-[#4e7397] text-xs font-normal leading-normal">Chức danh</p>
                  <p className="text-[#0e141b] text-sm font-normal leading-normal">{fetchedUser.role === 1 ? 'Giáo viên' : 'Học sinh'}</p>
                </div>
              )}
            </div>
            <div className="flex px-6 py-4 border-t border-slate-200">
              <button
                onClick={onClose}
                className="flex min-w-[84px] w-full sm:w-auto sm:ml-auto max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Đóng</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDialog;