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
    totalTeachers: 0,
    totalStudents: 0,
    todayActiveUsers: 0,
    todayLogins: 0
  },
  monthlyUserChart: [
  ],
  dailyUserChart: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      teacherCount: 0,
      studentCount: 0
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
  storageLimit?: number;
  totalStorageUsed?: number;
  fileCount?: number;
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

// Storage Usage APIs
export interface TeacherStorageInfo {
  id: string;
  name: string;
  email: string;
  avatar: string;
  birthday: string;
  totalStorageUsed: number;
  fileCount: number;
  storageLimit: number;
}

export interface UserFileInfo {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadTime: string;
}

export interface StorageSearchRequest {
  name?: string;
  email?: string;
  page: number;
  size: number;
}

export interface StorageSearchResponse {
  teachers: TeacherStorageInfo[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export const getTeachersStorageUsage = async (searchParams?: StorageSearchRequest): Promise<StorageSearchResponse> => {
  const token = localStorage.getItem('token');
  const response = await axios.post('/api/storage-usage/teachers', searchParams || { page: 0, size: 10 }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const getUserFiles = async (userId: string): Promise<UserFileInfo[]> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`/api/storage-usage/users/${userId}/files`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const getUserTotalStorage = async (userId: string): Promise<number> => {
  const token = localStorage.getItem('token');

  const response = await axios.get(`/api/storage-usage/users/${userId}/total`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const getSystemTotalStorage = async (): Promise<number> => {
  const token = localStorage.getItem('token');
  const response = await axios.get('/api/storage-usage/total', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const updateUserStorageLimit = async (userId: string, storageLimit: number): Promise<void> => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`/api/storage-usage/admin/users/${userId}/storage-limit`,
    { storageLimit },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}; 