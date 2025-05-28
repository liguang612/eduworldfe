import axios from '@/config/axios';

const API_URL = '/api/files';

export const uploadFile = async (file: File, folder: string) => {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/upload/${folder}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.data.url;
}; 