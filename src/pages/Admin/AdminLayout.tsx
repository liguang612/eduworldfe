import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BookOpen, ClipboardCheck, FileVideo, LayoutDashboard, Users } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/assets/logo.svg';

const AdminLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
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

  const sidebarNavItems = [
    {
      title: "Tổng quan",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Người dùng",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Khóa học",
      href: "/admin/courses",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "Bài giảng",
      href: "/admin/lectures",
      icon: <FileVideo className="h-5 w-5" />,
    },
    {
      title: "Đề thi",
      href: "/admin/exams",
      icon: <ClipboardCheck className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-['Inter',_'Noto_Sans',_sans-serif]">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-solid border-r-[#e7edf3] bg-white sm:flex">
        <div className="flex items-center gap-4 border-b border-solid border-b-[#e7edf3] px-6 h-[65px]">
          <Link to="/admin" className="flex items-center gap-2 font-semibold">
            <img src={Logo} alt="logo" className="h-6 w-6" />
            <span className="text-[#0e141b] text-lg font-bold">Eduworld</span>
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {sidebarNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-[#0e141b] transition-all hover:bg-slate-100 text-base font-medium",
                location.pathname.startsWith(item.href) ? "bg-slate-100 text-[#1980e6]" : ""
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-4 pb-6">
          <div className="relative" ref={menuRef}>
            <div
              className="flex items-center gap-2 cursor-pointer select-none rounded-xl p-2 hover:bg-slate-100"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <img
                src={user?.avatar ? `${user?.avatar}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'U')}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover border border-[#d0dbe7]"
              />
              <span className="text-[#0e141b] text-base font-medium leading-normal truncate max-w-[120px]">{user?.name || 'User'}</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
            {menuOpen && (
              <div className="absolute right-0 bottom-14 w-56 bg-white rounded-xl shadow-lg border border-[#e7edf3] z-50 flex flex-col gap-0">
                <button
                  className="w-full text-left px-4 py-3 hover:bg-slate-100 text-[#0e141b] text-base font-medium rounded-t-xl"
                  onClick={() => { setMenuOpen(false); navigate('/admin/account'); }}
                >
                  Thông tin cá nhân
                </button>
                <button
                  className="w-full text-left px-4 py-3 hover:bg-slate-100 text-[#0e141b] text-base font-medium"
                  onClick={() => { setMenuOpen(false); navigate('/admin/change-password'); }}
                >
                  Đổi mật khẩu
                </button>
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
        </div>
      </aside>
      <main className="flex flex-1 flex-col sm:pl-64">
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout; 