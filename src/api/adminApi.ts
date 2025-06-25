import axios from '@/config/axios';

export interface DashboardStats {
  totalTeachers: number;
  totalStudents: number;
  todayActiveUsers: number;
  todayLogins: number;
}

export interface MonthlyUserData {
  month: string;
  teacherCount: number;
  studentCount: number;
}

export interface DailyUserData {
  date: string;
  teacherCount: number;
  studentCount: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  monthlyUserChart: MonthlyUserData[];
  dailyUserChart: DailyUserData[];
}

// Dữ liệu mock
const mockDashboardData: DashboardResponse = {
  stats: {
    totalTeachers: 45,
    totalStudents: 1234,
    todayActiveUsers: 89,
    todayLogins: 156
  },
  monthlyUserChart: [
    { month: "2024-01", teacherCount: 12, studentCount: 156 },
    { month: "2024-02", teacherCount: 15, studentCount: 234 },
    { month: "2024-03", teacherCount: 18, studentCount: 345 },
    { month: "2024-04", teacherCount: 22, studentCount: 456 },
    { month: "2024-05", teacherCount: 28, studentCount: 567 },
    { month: "2024-06", teacherCount: 32, studentCount: 678 },
    { month: "2024-07", teacherCount: 35, studentCount: 789 },
    { month: "2024-08", teacherCount: 38, studentCount: 890 },
    { month: "2024-09", teacherCount: 40, studentCount: 987 },
    { month: "2024-10", teacherCount: 42, studentCount: 1056 },
    { month: "2024-11", teacherCount: 44, studentCount: 1123 },
    { month: "2024-12", teacherCount: 45, studentCount: 1234 }
  ],
  dailyUserChart: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      teacherCount: Math.floor(Math.random() * 20) + 15,
      studentCount: Math.floor(Math.random() * 100) + 50
    };
  })
};

export const getDashboardData = async (): Promise<DashboardResponse> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.warn('API not available, using mock data:', error);
    // Trả về dữ liệu mẫu khi API chưa sẵn sàng
    return mockDashboardData;
  }
};

// User Management APIs
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  school?: string;
  grade?: number;
  address?: string;
  role: number; // 0: học sinh, 1: giáo viên, 100: admin
  birthday?: string;
  createdAt: string;
  isActive: boolean;
  searchScore?: number;
}

export interface UserSearchRequest {
  name?: string;
  email?: string;
  role?: number;
  isActive?: boolean;
  page: number;
  size: number;
}

export interface UserSearchResponse {
  users: UserResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}

export interface ChangeRoleRequest {
  role: number; // 0: học sinh, 1: giáo viên, 100: admin
}

export interface ResetPasswordResponse {
  password: string;
}

// Lấy danh sách user với phân trang và tìm kiếm
export const searchUsers = async (request: UserSearchRequest): Promise<UserSearchResponse> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post('/api/admin/users', request, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to search users:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Thay đổi role của user
export const changeUserRole = async (userId: string, role: number): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`/api/admin/users/${userId}/role`, { role }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error('Failed to change user role:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Khóa/mở khóa tài khoản
export const toggleUserStatus = async (userId: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`/api/admin/users/${userId}/status`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error: any) {
    console.error('Failed to toggle user status:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Reset mật khẩu user
export const resetUserPassword = async (userId: string): Promise<string> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`/api/admin/users/${userId}/reset-password`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to reset user password:', error.response ? error.response.data : error.message);
    throw error;
  }
}; 