import axios from '@/config/axios';
import { handleStorageLimitError } from '@/lib/utils';

const API_URL = '/api/files';

export const uploadFile = async (file: File, folder: string) => {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${API_URL}/upload/${folder}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
      timeout: 10000,
    });

    return response.data.url;
  } catch (error: any) {
    handleStorageLimitError(error);
    throw error;
  }
};

export const deleteFile = async (url: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`api/files/delete?url=${url}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
    });
  } catch (error: any) {
    console.error('Failed to delete file:', error.response ? error.response.data : error.message);
    throw error;
  }
};