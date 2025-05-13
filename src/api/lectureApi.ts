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

export interface LectureResponse {
  id: string;
  name: string;
  description: string;
  contents: string;
  endQuestions: any[];
  categories: string[];
  pdfUrl: string | null;
  subjectId: string;
  teacher: {
    id: string;
    email: string;
    name: string;
    school: string;
    grade: number;
    avatar: string;
  };
  duration: number;
}

export const getLectures = async (subjectId: string, keyword: string): Promise<LectureResponse[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/lectures`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: {
        subjectId,
        keyword,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch lectures:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getLectureById = async (lectureId: string): Promise<LectureResponse> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/lectures/${lectureId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch lecture:', error.response ? error.response.data : error.message);
    throw error;
  }
};

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