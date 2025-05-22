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

// Attempt API functions
export interface ExamAttempt {
  id: string;
  examId: string;
  classId: string;
  duration: number;
  maxScore: number;
  title: string;
  userId: string;
  startTime: string;
  endTime?: string;
  status: 'in_progress' | 'started' | 'submitted`' | string;
  score?: number;
  createdAt: string;
  updatedAt: string;
  savedAnswers?: { [questionId: string]: any };
}

export interface ExamAttemptDetails extends ExamAttempt {
  duration: number;
  title: string;
  easyScore: number;
  mediumScore: number;
  hardScore: number;
  veryHardScore: number;
  classId: string;
  createdAt: string;
  updatedAt: string;
  savedAnswers: { [questionId: string]: any };
}

export const startExamAttempt = async (examId: string): Promise<ExamAttempt> => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`/api/exam-attempts/${examId}/start`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getExamAttemptDetails = async (attemptId: string): Promise<ExamAttemptDetails> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`/api/exam-attempts/${attemptId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const saveExamAnswer = async (attemptId: string, questionId: string, answer: any): Promise<void> => {
  const token = localStorage.getItem('token');
  await axios.post(`/api/exam-attempts/${attemptId}/answers/${questionId}`, answer, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': answer instanceof Object ? 'application/json' : 'text/plain',
    },
  });
};

export const submitExamAttempt = async (attemptId: string): Promise<ExamAttempt> => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`/api/exam-attempts/${attemptId}/submit`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}; 