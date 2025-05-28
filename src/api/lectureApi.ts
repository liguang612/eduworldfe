import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

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
        Authorization: `Bearer ${token}`
      }
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

  return response.data.url;
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

export const deleteLecture = async (lectureId: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/lectures/${lectureId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error: any) {
    console.error('Failed to delete lecture:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateLecture = async (lectureId: string, lectureData: {
  name?: string;
  description?: string;
  contents?: string;
  endQuestions?: any[];
  duration?: number;
}) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/lectures/${lectureId}`, lectureData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to update lecture:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getLecturesByIds = async (lectureIds: string[]): Promise<LectureResponse[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/lectures/by-ids`, lectureIds, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch lectures by IDs:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const searchQuestions = async (keyword: string, subjectId: string, userId: string): Promise<any[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/questions/search`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: {
        createdBy: userId,
        subjectId: subjectId,
        keyword: keyword,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to search questions:', error.response ? error.response.data : error.message);
    throw error;
  }
};