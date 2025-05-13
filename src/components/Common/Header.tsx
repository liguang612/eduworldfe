import React, { useState, useRef, useEffect } from 'react';
import Logo from '../../assets/logo.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { baseURL } from '../../config/axios';

interface HeaderProps { } // Hiện tại Header không nhận props, bạn có thể thêm nếu cần

const Header: React.FC<HeaderProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi click ra ngoài
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

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf3] px-10 py-3">
      <div className="flex items-center gap-4 text-[#0e141b]">
        <div className="size-4">
          <img src={Logo} alt="EduWorld Logo" className="size-full" />
        </div>
        <h2 className="text-[#0e141b] text-lg font-bold leading-tight tracking-[-0.015em]">EduWorld</h2>
      </div>
      <div className="flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-9">
          <a className="text-[#0e141b] text-sm font-medium leading-normal" href="#" onClick={() => navigate('/')}>
            Trang chủ
          </a>
          <a className="text-[#0e141b] text-sm font-medium leading-normal" href="#" onClick={() => navigate('/courses')}>
            Lớp học
          </a>
          <a className="text-[#0e141b] text-sm font-medium leading-normal" href="#" onClick={() => navigate('/lectures')}>
            Bài giảng
          </a>
          <a className="text-[#0e141b] text-sm font-medium leading-normal" href="#" onClick={() => navigate('/questions')}>
            Ngân hàng câu hỏi
          </a>
          <a className="text-[#0e141b] text-sm font-medium leading-normal" href="#" onClick={() => navigate('/my-editor')}>
            Đề thi
          </a>
        </div>
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
                src={user?.avatar ? `${baseURL}${user?.avatar}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'U')}
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
                  className="w-full text-left px-4 py-3 hover:bg-slate-100 text-[#0e141b] text-base font-medium rounded-b-xl"
                  onClick={() => { setMenuOpen(false); navigate('/change-password'); }}
                >
                  Đổi mật khẩu
                </button>
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