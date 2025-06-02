import axios from '@/config/axios';

import type { Course } from './courseApi';
import type { LectureResponse } from './lectureApi';
import type { Exam } from './examApi';

export interface FavouriteResponse<T> {
  id: string;
  userId: string;
  type: number;
  targetId: string;
  details: T;
}

export interface FavouriteCourseResponse extends FavouriteResponse<Course> {
  type: 1;
}

export interface FavouriteLectureResponse extends FavouriteResponse<LectureResponse> {
  type: 2;
}

export interface FavouriteExamResponse extends FavouriteResponse<Exam> {
  type: 4;
}

export const getFavouriteCourses = async (subjectId: string): Promise<FavouriteCourseResponse[]> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`/api/favourites/detailed/1/subject/${subjectId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getFavouriteLectures = async (subjectId: string): Promise<FavouriteLectureResponse[]> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`/api/favourites/detailed/2/subject/${subjectId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const getFavouriteExams = async (subjectId: string): Promise<FavouriteExamResponse[]> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`/api/favourites/detailed/4/subject/${subjectId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

// FAVORITE
export const addFavorite = async (id: string, type: number): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.post(`/api/favourites/${type}/${id}`, null, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error: any) {
    console.error('Failed to add favorite:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const removeFavorite = async (id: string, type: number): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`/api/favourites/${type}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error: any) {
    console.error('Failed to remove favorite:', error.response ? error.response.data : error.message);
    throw error;
  }
};