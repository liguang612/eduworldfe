import axios from '../config/axios';
import type { User } from '../contexts/AuthContext';
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
  pendingStudents: any[];
  chapters: Chapter[];
  reviewIds: string[];
  averageRating: number;
  hidden: boolean;
  allowStudentPost: boolean;
  requirePostApproval: boolean;
  favourite: boolean;
  grade: number;
  subjectName: string;
}

export interface Chapter {
  id: string;
  name: string;
  courseId: string;
  lectureIds: string[];
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

export interface CreateCourseRequestPayload {
  name: string;
  description: string;
  subjectId: string;
  teacherAssistantIds: string[];
  studentIds: string[];
  hidden: boolean;
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

export const getSubjectById = async (subjectId: string): Promise<Subject> => {
  try {
    const response = await axios.get(`${API_URL}/subjects/${subjectId}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch subject:', error.response ? error.response.data : error.message);
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

export const getCourseById = async (courseId: string): Promise<Course | null> => {
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
export const createCourse = async (courseData: CreateCourseRequestPayload): Promise<Course> => {
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

// DELETE
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
  allowStudentPost: boolean;
  requirePostApproval: boolean;
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

// JOIN REQUEST
export const requestJoinCourse = async (courseId: string): Promise<number> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/courses/${courseId}/request-join`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to request join course:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const rejectJoinRequest = async (courseId: string, studentId: string): Promise<Course> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/courses/${courseId}/reject-join/${studentId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to reject join request:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const approveJoinRequest = async (courseId: string, studentId: string): Promise<Course> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/courses/${courseId}/approve-join/${studentId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to approve join request:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// CHAPTER
export const addLectureToChapter = async (chapterId: string, lectureId: string): Promise<Chapter> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/chapters/${chapterId}/add-lecture`, {
      lectureId
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to add lecture to chapter:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const removeLectureFromChapter = async (chapterId: string, lectureId: string): Promise<Chapter> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/chapters/${chapterId}/remove-lecture`, {
      lectureId
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to remove lecture from chapter:', error.response ? error.response.data : error.message);
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

