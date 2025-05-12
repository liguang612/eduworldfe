import axios from '../config/axios';
import type { User } from '../contexts/AuthContext';
import type { Lecture } from './lectureApi';

const API_URL = '/api';

export type Course = {
  id: string;
  name: string;
  description: string;
  avatar: string | null;
  subjectId: string;
  allCategories: string[];
  teacher: User;
  teacherAssistants: any[];
  students: any[];
  chapters: Chapter[];
  reviewIds: string[];
  averageRating: number;
  hidden: boolean;
}

export interface Chapter {
  id: string; // Hoặc number, dùng cho key khi map
  name: string;
  lectures: Lecture[];
}


export type Subject = {
  id: string;
  name: string;
  grade: number;
}

export type SearchUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  school: string;
  grade: number;
}

// GET
export const getSubjectsByGrade = async (grade: number): Promise<Subject[]> => {
  try {
    const response = await axios.get(`${API_URL}/subjects/grade/${grade}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch subjects:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getCoursesBySubject = async (subjectId: string, enrolled: boolean, keyword: string): Promise<Course[]> => {
  try {
    const token = localStorage.getItem('token');

    const response = await axios.get(`${API_URL}/courses`, {
      params: { 'subjectId': subjectId, 'enrolled': enrolled, 'keyword': keyword },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch courses:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const searchUserByEmail = async (email: string, role: number): Promise<SearchUser[]> => {
  if (!email.trim()) return [];
  try {
    const response = await axios.get(
      `${API_URL}/auth/users/search?email=${encodeURIComponent(email)}&role=${role}`
    );
    const data = response.data;
    // Map API response về đúng định dạng Teacher
    return data.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      school: user.school,
      grade: user.grade,
    }));
  } catch (error) {
    console.error('Error searching teachers:', error);
    throw error;
  }
};

export const getCourseById = async (courseId: string): Promise<Course> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/courses/${courseId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch course:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// CREATE
export const createCourse = async (courseData: Course): Promise<Course> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/courses`, courseData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to create course:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const createChapter = async (chapterData: {
  name: string;
  courseId: string;
}): Promise<Chapter> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/chapters`, chapterData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to create chapter:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// UPDATE
export const updateCoruseAvatar = async (courseId: string, avatar: File): Promise<Course> => {
  try {
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('file', avatar);

    const response = await axios.post(`${API_URL}/courses/${courseId}/avatar`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Failed to update course avatar:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteCourse = async (courseId: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/courses/${courseId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error: any) {
    console.error('Failed to delete course:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateCourse = async (courseId: string, courseData: {
  name: string;
  description: string;
  hidden: boolean;
  teacherAssistantIds: string[];
  studentIds: string[];
}): Promise<Course> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/courses/${courseId}`, courseData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to update course:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateChapter = async (chapterId: string, chapterData: {
  name: string;
}): Promise<Chapter> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/chapters/${chapterId}`, chapterData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to update chapter:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteChapter = async (chapterId: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/chapters/${chapterId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error: any) {
    console.error('Failed to delete chapter:', error.response ? error.response.data : error.message);
    throw error;
  }
};