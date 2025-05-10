import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Giả lập lấy user từ token (bạn nên thay bằng API thực tế)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          name: payload.name,
          email: payload.email,
          avatar: payload.avatar,
          role: payload.role,
          birthday: payload.birthday,
          school: payload.school,
          grade: payload.grade,
          address: payload.address,
        });
      } catch {
        setUser(null);
      }
    }
    setLoading(false); // Đã kiểm tra xong
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    // Giả lập lấy user từ token (bạn nên thay bằng API thực tế)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        name: payload.name,
        email: payload.email,
        avatar: payload.avatar,
        role: payload.role,
        birthday: payload.birthday,
        school: payload.school,
        grade: payload.grade,
        address: payload.address,
      });
    } catch {
      setUser(null);
    }
    toast.success('Đăng nhập thành công!');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
    toast.success('Đăng xuất thành công!');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 