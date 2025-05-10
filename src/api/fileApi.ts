import axios from 'axios';

const API_URL = '/api/files';

export const uploadFile = async (file: File, folder: string) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_URL}/upload/${folder}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url;
}; 