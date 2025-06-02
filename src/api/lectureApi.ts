import axios from '@/config/axios';

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
  favourite: boolean;
}

export const getLectures = async (subjectId: string, keyword: string): Promise<LectureResponse[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`api/lectures`, {
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

export const getLectureById = async (lectureId: string, courseId: string | undefined): Promise<LectureResponse> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`api/lectures/${lectureId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        courseId,
      },
    });
    console.log(response.data);
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

  const response = await axios.post(`api/files/upload`, formData, {
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

  const response = await axios.post(`api/lectures`, lectureData, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteLecture = async (lectureId: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`api/lectures/${lectureId}`, {
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
    const response = await axios.put(`api/lectures/${lectureId}`, lectureData, {
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
    const response = await axios.post(`api/lectures/by-ids`, lectureIds, {
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
    const response = await axios.get(`api/questions/search`, {
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

// FAVORITE
export const addFavorite = async (id: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.post(`api/favourites/LECTURE/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error: any) {
    console.error('Failed to add favorite:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const removeFavorite = async (id: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`api/favourites/LECTURE/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error: any) {
    console.error('Failed to remove favorite:', error.response ? error.response.data : error.message);
    throw error;
  }
};

