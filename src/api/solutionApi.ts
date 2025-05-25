import axios from '@/config/axios';

export interface Solution {
  id: string;
  questionId: string;
  createdBy: string;
  content: string;
  status: number;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  creatorId: string;
  creatorName: string;
  creatorSchool: string;
  creatorGrade: number;
  creatorAvatar: string | null;
  creatorRole: number;
}

export const createSolution = async (data: {
  questionId: string;
  content: string;
}) => {
  const token = localStorage.getItem('token');
  const response = await axios.post('/api/solutions', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getSolutionsByQuestionId = async (questionId: string): Promise<Solution[]> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`/api/solutions/question/${questionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteSolution = async (solutionId: string): Promise<void> => {
  const token = localStorage.getItem('token');
  await axios.delete(`/api/solutions/${solutionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const reviewSolution = async (solutionId: string, status: number): Promise<void> => {
  const token = localStorage.getItem('token');
  await axios.post(`/api/solutions/${solutionId}/review?status=${status}`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}; 