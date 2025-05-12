import axios from '../config/axios';

const API_URL = '/api/auth';

export const login = async (email: string, password: string): Promise<{ token: string }> => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data; // Backend trả về { token: "..." }
  } catch (error: any) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    throw error; // Re-throw lỗi để component LoginForm có thể xử lý
  }
};

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  birthday?: string;
  school?: string;
  grade?: number;
  address?: string;
  role?: number;
  avatar?: string;
}

export const registerUser = async (payload: FormData) => {
  const response = await axios.post(`${API_URL}/register`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getUser = async (userId: string) => {
  const response = await axios.get(`${API_URL}/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId: string, payload: RegisterPayload) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/users/${userId}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to update user:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateUserAvatar = async (avatar: File) => {
  try {
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('file', avatar);

    const response = await axios.post(`${API_URL}/users/avatar`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Failed to update user avatar:', error.response ? error.response.data : error.message);
    throw error;
  }
};