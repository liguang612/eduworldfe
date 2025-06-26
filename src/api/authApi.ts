import type { AxiosResponse } from 'axios';
import axios from '../config/axios';

const API_URL = '/api/auth';

export const login = async (email: string, password: string): Promise<AxiosResponse<any, any>> => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error: any) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    throw error;
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

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: number; // 0: học sinh, 1: giáo viên, 100: admin
  birthday?: string;
  school?: string;
  grade?: number;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
  isVerified?: boolean;
  isActive?: boolean;
}

export const registerUser = async (payload: FormData, googleToken?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'multipart/form-data'
  };
  if (googleToken) {
    headers.Authorization = `Bearer ${googleToken}`;
  }

  console.log(headers);

  const response = await axios.post(`${API_URL}/register`, payload, {
    headers
  });
  return response.data;
};

export const getUser = async (userId: string) => {
  const response = await axios.get(`${API_URL}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
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