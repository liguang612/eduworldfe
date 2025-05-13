import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export interface Lecture {
  id: string;
  number: string;
  title: string;
  duration: string;
  rating: number;
  questions: number;
}

export const uploadFile = async (file: File, type: string): Promise<string> => {
  const token = localStorage.getItem('token');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await axios.post(`${API_URL}/files/upload`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url; // Giả sử API trả về URL của file đã upload
};

export const createLecture = async (lectureData: {
  name: string;
  description: string;
  contents: any;
  subjectId: string;
  teacherId: string;
  duration: number;
}) => {
  const token = localStorage.getItem('token');

  const response = await axios.post(`${API_URL}/lectures`, lectureData, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};