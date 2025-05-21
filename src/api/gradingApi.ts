import axios from '../config/axios';

const API_URL = '/api';

export interface GradingRequest {
  answers: {
    [key: string]: string | string[] | Array<{ from: string; to: string }>;
  };
}

export interface GradingResponse {
  results: {
    [key: string]: boolean;
  };
  correctCount: number;
  totalCount: number;
  correctAnswers: {
    [key: string]: string | string[] | Array<{ from: string; to: string }>;
  };
}

export const gradeAnswers = async (request: GradingRequest): Promise<GradingResponse> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/simple-grading/grade`, request, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to grade answers:', error.response ? error.response.data : error.message);
    throw error;
  }
}; 