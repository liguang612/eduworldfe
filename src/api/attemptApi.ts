import axios from '@/config/axios';
import { type Question } from '../api/questionApi';

const API_URL = '/api/exam-attempts';

export interface ExamAttempt {
  id: string;
  examId?: string;
  classId: string;
  duration?: number;
  maxScore: number;
  title: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  status: 'in_progress' | 'started' | 'submitted' | string;
  score?: number | null;
  createdAt: string;
  updatedAt: string;
  savedAnswers?: { [questionId: string]: any };
  className: string;
}

export interface ExamAttemptDetails extends ExamAttempt {
  duration: number;
  title: string;
  easyScore?: number;
  mediumScore?: number;
  hardScore?: number;
  veryHardScore?: number;
  classId: string;
  createdAt: string;
  updatedAt: string;
  savedAnswers?: { [questionId: string]: any };
  answers: { [key: string]: any };
  questions: Question[];
  correctAnswers: { [key: string]: any };
  studentName: string;
  studentEmail: string;
  studentAvatar: string;
  studentSchool: string;
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