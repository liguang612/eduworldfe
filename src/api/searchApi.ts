import axios from '@/config/axios';
import type { Course } from './courseApi';
import type { LectureResponse } from './lectureApi';

export interface SearchExam {
  id: string;
  classId: string;
  subjectId: string;
  title: string;
  openTime: string;
  closeTime: string;
  maxScore: number;
  durationMinutes: number;
  shuffleQuestion: boolean;
  shuffleChoice: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  categories: string[];
  totalQuestions: number;
  questionBankSize: number;
  averageRating: number;
  reviewCount: number;
  allowReview: boolean;
  maxAttempts: number;
  allowViewAnswer: boolean;
  className: string;
  subjectName: string;
  grade: number;
  favourite: boolean;
}
export type SearchType = 'course' | 'lecture' | 'exam';
export type SortBy = 'name' | 'rating' | 'time';
export type SortOrder = 'asc' | 'desc';

interface SearchParams {
  type: SearchType;
  subjectId?: string;
  grade?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  keyword?: string;
}

export const searchContent = async <T>({
  type,
  subjectId,
  grade,
  sortBy,
  sortOrder,
  keyword
}: SearchParams): Promise<T[]> => {
  try {
    const token = localStorage.getItem('token');

    const params = new URLSearchParams();
    params.append('type', type);
    if (subjectId) params.append('subjectId', subjectId);
    if (grade) params.append('grade', grade.toString());
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);
    if (keyword) params.append('keyword', keyword);

    const response = await axios.get<T[]>(`/api/search?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data ?? [];
  } catch (error) {
    console.error(`Error searching ${type}:`, error);
    throw error;
  }
};

export const searchCourses = (params: Omit<SearchParams, 'type'>) => {
  return searchContent<Course>({ ...params, type: 'course' });
};

export const searchLectures = (params: Omit<SearchParams, 'type'>) => {
  return searchContent<LectureResponse>({ ...params, type: 'lecture' });
};

export const searchExams = (params: Omit<SearchParams, 'type'>) => {
  return searchContent<SearchExam>({ ...params, type: 'exam' });
};
