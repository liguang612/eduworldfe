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

export const register = async (payload: RegisterPayload) => {
  const response = await axios.post(`${API_URL}/register`, payload);
  return response.data;
};
