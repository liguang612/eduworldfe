import React, { useState, useRef, useEffect } from 'react';
import Logo from '../../assets/logo.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import BellIcon from '@/assets/bell.svg';
import NotificationPopup from '../Notification/NotificationPopup';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { hasUnread } = useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [showNotifications, setShowNotifications] = useState(false);

  const notificationPopupRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationPopupRef.current &&
        !notificationPopupRef.current.contains(event.target as Node) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleToggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf3] px-10 py-3 bg-white font-['Lexend']">
      <div className="flex items-center gap-4 text-[#0e141b] cursor-pointer" onClick={() => navigate('/')}>
        <div className="size-4">
          <img src={Logo} alt="EduWorld Logo" className="size-full" />
        </div>
        <h2 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em]">EduWorld</h2>
      </div>
      <div className="flex flex-1 justify-end gap-8 ml-8">
        <div className="flex items-center gap-9 flex-1">
          {user?.role === 0 && <a className="text-[#0e141b] text-sm font-medium leading-normal" href="#" onClick={() => navigate('/')}>
            Trang chủ
          </a>}
          {user && <a className="text-[#0e141b] text-sm font-medium leading-normal" href="#" onClick={() => navigate('/courses')}>
            Lớp học
          </a>}
          {user?.role === 1 && <a className="text-[#0e141b] text-sm font-medium leading-normal" href="#" onClick={() => navigate('/lectures')}>
            Bài giảng
          </a>}
          {user?.role === 1 && <a className="text-[#0e141b] text-sm font-medium leading-normal" href="#" onClick={() => navigate('/question-bank')}>
            Ngân hàng câu hỏi
          </a>}
          {user?.role === 0 && <a className="text-[#0e141b] text-sm font-medium leading-normal" href="#" onClick={() => navigate('/exams')}>
            Đề thi
          </a>}
          {user?.role === 0 && <a className="text-[#0e141b] text-sm font-medium leading-normal" href="#" onClick={() => navigate('/attempts')}>
            Kết quả
          </a>}
        </div>
        {(user?.role === 0 || user?.role === 1) && <div className="flex justify-end gap-4">
          <div className="relative flex gap-2 items-center">
            <button
              ref={notificationButtonRef}
              onClick={handleToggleNotifications}
              className="relative flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 w-10 bg-[#e7edf3] text-[#0e141b] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 p-2.5"
            >
              <img src={BellIcon} alt="Bell" className="w-4 h-4" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
              )}
            </button>
            {showNotifications && (
              <div ref={notificationPopupRef} className="absolute right-0 top-full mt-2 z-50">
                <NotificationPopup
                  onClose={() => setShowNotifications(false)}
                />
              </div>
            )}
          </div>
        </div>}
        {!user ? (
          location.pathname === '/register' ? (
            <button
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em]"
              onClick={() => navigate('/login')}
            >
              <span className="truncate">Đăng nhập</span>
            </button>
          ) : (
            <button
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em]"
              onClick={() => navigate('/register')}
            >
              <span className="truncate">Đăng ký</span>
            </button>
          )
        ) : (
          <div className="relative" ref={menuRef}>
            <div
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <img
                src={user?.avatar ? `${user?.avatar}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'U')}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover border border-[#d0dbe7]"
              />
              <span className="text-[#0e141b] text-base font-medium leading-normal">{user?.name || 'User'}</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#e7edf3] z-50 flex flex-col gap-0">
                <button
                  className="w-full text-left px-4 py-3 hover:bg-slate-100 text-[#0e141b] text-base font-medium rounded-t-xl"
                  onClick={() => { setMenuOpen(false); navigate('/account'); }}
                >
                  Thông tin cá nhân
                </button>
                <button
                  className="w-full text-left px-4 py-3 hover:bg-slate-100 text-[#0e141b] text-base font-medium"
                  onClick={() => { setMenuOpen(false); navigate('/change-password'); }}
                >
                  Đổi mật khẩu
                </button>
                {user?.role === 0 && <>
                  <hr />
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-slate-100 text-[#0e141b] text-base font-medium"
                    onClick={() => { setMenuOpen(false); navigate('/favourite'); }}
                  >
                    Danh sách yêu thích
                  </button>
                </>}
                <hr />
                <button
                  className="w-full text-left px-4 py-3 hover:bg-slate-100 text-red-600 text-base font-medium rounded-b-xl"
                  onClick={() => { setMenuOpen(false); logout(); }}
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;