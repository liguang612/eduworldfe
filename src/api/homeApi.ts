import axios from '@/config/axios';
import type { Course } from './courseApi';
import type { Exam } from './examApi';

const API_URL = '/api';

export const getHighlightCourses = async (): Promise<Course[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/courses/highlight`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch highlight courses:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getUpcomingExams = async (total: number = 5): Promise<Exam[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/exams/upcoming`, {
      params: { total },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch upcoming exams:', error.response ? error.response.data : error.message);
    throw error;
  }
};
