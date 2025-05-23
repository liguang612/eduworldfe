import axios from '@/config/axios';
import { type Question, type SharedMedia } from '../api/questionApi';

const API_URL = '/api/exam-attempts';

// Attempt API functions
export interface ExamAttempt {
  id: string;
  examId?: string; // examId might be null for some attempts
  classId: string;
  duration?: number; // duration might be null for completed attempts
  maxScore: number;
  title: string;
  userId?: string; // userId might not be needed on frontend
  startTime: string;
  endTime?: string;
  status: 'in_progress' | 'started' | 'submitted' | string;
  score?: number | null; // score can be null for in_progress attempts
  createdAt: string;
  updatedAt: string;
  savedAnswers?: { [questionId: string]: any };
  className: string; // Added className based on API response
}

export interface ExamAttemptDetails extends ExamAttempt {
  // Inherits properties from ExamAttempt
  duration: number; // Override to non-optional if always present in details
  title: string; // Override to non-optional
  easyScore?: number;
  mediumScore?: number;
  hardScore?: number;
  veryHardScore?: number;
  classId: string; // Override to non-optional
  createdAt: string; // Override to non-optional
  updatedAt: string; // Override to non-optional
  savedAnswers?: { [questionId: string]: any }; // Override to non-optional
  // Thêm các trường mới từ API response
  answers: { [key: string]: any };
  questions: Question[];
  correctAnswers: { [key: string]: any };
}

export const getExamAttemptsByStatus = async (status: 'in_progress' | 'submitted'): Promise<ExamAttempt[]> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      status: status,
    },
  });
  return response.data;
};

export const startExamAttempt = async (examId: string): Promise<ExamAttempt> => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/${examId}/start`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getExamAttemptDetails = async (attemptId: string): Promise<ExamAttemptDetails> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/${attemptId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const saveExamAnswer = async (attemptId: string, questionId: string, answer: any): Promise<void> => {
  const token = localStorage.getItem('token');
  await axios.post(`${API_URL}/${attemptId}/answers/${questionId}`, answer, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': answer instanceof Object ? 'application/json' : 'text/plain',
    },
  });
};

export const submitExamAttempt = async (attemptId: string): Promise<ExamAttempt> => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/${attemptId}/submit`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}; 