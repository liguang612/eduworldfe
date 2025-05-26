import axios from '@/config/axios';

export interface Review {
  id: string;
  userId: string;
  targetType: number;
  targetId: string;
  score: number;
  comment: string;
  createdAt: string;
  userName: string;
  userAvatar: string;
  userSchool: string;
  userGrade: number;
}

export interface Comment {
  id: string;
  reviewId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userName: string;
  userAvatar: string;
  userSchool: string;
  userGrade: number;
}

export const createReview = async (targetType: number, targetId: string, score: number, comment: string) => {
  const token = localStorage.getItem('token');
  const response = await axios.post('/api/reviews', {
    targetType,
    targetId,
    score,
    comment
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const getReviews = async (targetType: number, targetId: string) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`/api/reviews?targetType=${targetType}&targetId=${targetId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data as Review[];
};

export const getComments = async (reviewId: string) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`/api/reviews/${reviewId}/comments`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data as Comment[];
};

export const createComment = async (reviewId: string, content: string) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`/api/reviews/${reviewId}/comments`, content, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}; 