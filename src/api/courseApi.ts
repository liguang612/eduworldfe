import axios from '../config/axios';

const API_URL = '/api';

export type Course = {
  id: string;
  name: string;
  subjectId: string;
  allCategories: string[];
  teacher: {
    id: string;
    name: string;
    avatar: string;
  };
  students: any[];
  averageRating: number;
  hidden: boolean;
  avatar: string;
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

export const getCoursesBySubject = async (subjectId: string): Promise<Course[]> => {
  try {
    const token = localStorage.getItem('token');

    const response = await axios.get(`${API_URL}/courses`, {
      params: { 'subjectId': subjectId },
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
    const response = await fetch(
      `http://localhost:8080/api/auth/users/search?email=${encodeURIComponent(email)}&role=${role}`
    );
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
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

// UPDATE
export const updateCoruseAvatar = async (courseId: string, avatar: File): Promise<Course> => {
  try {
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('file', avatar);

    const response = await axios.post(`${API_URL}/courses/${courseId}/avatar`, formData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Failed to update course avatar:', error.response ? error.response.data : error.message);
    throw error;
  }
};