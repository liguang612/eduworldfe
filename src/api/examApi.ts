import axios from '@/config/axios';
import { type Question } from './questionApi';

const API_URL = '/api/exams';

export interface Exam {
  id: string;
  classId: string;
  title: string;
  openTime: string | null;
  closeTime: string | null;
  maxScore: number;
  durationMinutes: number;
  shuffleQuestion: boolean;
  shuffleChoice: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  categories: string[];
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  veryHardCount: number;
  easyScore: number;
  mediumScore: number;
  hardScore: number;
  veryHardScore: number;
  totalQuestions: number;
  questionBankSize: number;
  averageRating: number;
  reviewCount: number;
  allowReview: boolean;
  allowViewAnswer: boolean;
  maxAttempts: number;
}

export interface CreateExamRequest {
  classId: string;
  title: string;
  questionIds: string[];
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  veryHardCount: number;
  easyScore: number;
  mediumScore: number;
  hardScore: number;
  veryHardScore: number;
  openTime?: string;
  closeTime?: string;
  maxScore: number;
  durationMinutes: number;
  shuffleQuestion: boolean;
  shuffleChoice: boolean;
  categories: string[];
  allowReview: boolean;
  allowViewAnswer: boolean;
  maxAttempts: number;
}

export const createExam = async (data: CreateExamRequest) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(API_URL, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getExamsByClassId = async (classId: string): Promise<Exam[]> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/class/${classId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export interface ExamQuestionsResponse {
  exam: Exam;
  questions: Question[];
}

export const getExamQuestionsDetails = async (examId: string): Promise<ExamQuestionsResponse> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/${examId}/questions/details`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateExam = async (examId: string, data: CreateExamRequest): Promise<void> => {
  const token = localStorage.getItem('token');

  await axios.put(`${API_URL}/${examId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteExam = async (examId: string): Promise<void> => {
  const token = localStorage.getItem('token');
  await axios.delete(`${API_URL}/${examId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}; 