import axios from '../config/axios';

const API_URL = '/api';

export interface SharedMedia {
  id: string;
  mediaUrl: string | null;
  mediaType: number;
  text: string | null;
  title: string;
  usageCount: number;
}

export interface Question {
  id: string;
  title: string;
  subjectId: string;
  type: string;
  sharedMedia?: SharedMedia;
  level: number;
  createdBy: string;
  categories: string[];
  solutionIds: string[];
  reviewIds: string[];
  createdAt: string;
  updatedAt: string;
  choices?: Array<{
    id: string;
    text: string;
    orderIndex?: number;
    isCorrect: boolean;
    value: string;
  }>;
  matchingColumns?: Array<{
    id: string;
    label: string;
    side: string;
  }>;
  matchingPairs?: Array<{
    id: string;
    from: string;
    to: string;
  }>;
}

interface CreateQuestionRequest {
  title: string;
  type: string;
  level: number;
  subjectId: string;
  sharedMediaId?: string;
  categories: string[];
}

interface CreateChoiceRequest {
  text: string | null;
  value: string;
  questionId: string;
  orderIndex: number | null;
  isCorrect: boolean | null;
}

interface MatchingQuestionRequest {
  questionId: string;
  left: Array<{
    label: string;
    orderIndex: number;
  }>;
  right: Array<{
    label: string;
  }>;
  pairs: Array<{
    leftIndex: number;
    rightIndex: number;
  }>;
}

interface SharedMediaRequest {
  title: string;
  mediaType: number;
  mediaUrl?: string;
  text?: string;
}

export interface LocationState {
  subjectId: string;
}

export interface SurveyValue {
  type: string;
  name: string;
  question: {
    name: string;
    title: string;
    leftItems?: string;
    rightItems?: string;
  };
  value: any;
}

interface UploadSharedMediaRequest {
  file?: File;
  title: string;
  mediaType: number;
  text?: string; // Optional text for some media types if needed
}

export interface SurveyValue {
  type: string;
  name: string;
  question: {
    name: string;
    title: string;
    leftItems?: string;
    rightItems?: string;
  };
  value: any;
}

export const questionTypeToApiType: { [key: string]: string } = {
  'Multiple Choice': 'radio',
  'Matching': 'itemConnector',
  'Sorting': 'ranking',
  'Fill in the Blank': 'shortAnswer'
};

export const getLevelText = (level: number) => {
  switch (level) {
    case 1:
      return 'Nhận biết';
    case 2:
      return 'Thông hiểu';
    case 3:
      return 'Vận dụng';
    case 4:
      return 'Vận dụng cao';
    default:
      return 'Không xác định';
  }
};

export const getTypeText = (type: string) => {
  switch (type) {
    case 'radio':
      return 'Chọn đáp án';
    case 'checkbox':
      return 'Chọn nhiều đáp án';
    case 'itemConnector':
      return 'Ghép đôi';
    case 'ranking':
      return 'Sắp xếp';
    case 'shortAnswer':
      return 'Điền vào chỗ trống';
  }
}

export const updateQuestion = async (questionId: string, data: {
  title: string;
  type: string;
  level: number;
  sharedMediaId?: string | null;
  categories: string[];
}): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`${API_URL}/questions/${questionId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error: any) {
    console.error('Failed to update question:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateMatchingQuestion = async (questionId: string, data: {
  left: { label: string; orderIndex: number }[];
  right: { label: string }[];
  pairs: { leftIndex: number; rightIndex: number }[];
}): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`${API_URL}/questions/${questionId}/matching`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error: any) {
    console.error('Failed to update matching question:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateChoicesBatch = async (questionId: string, choices: {
  text: string | null;
  value: string;
  orderIndex: number | null;
  isCorrect: boolean | null;
}[]): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`${API_URL}/questions/${questionId}/choices`, choices, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error: any) {
    console.error('Failed to update choices:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const createQuestion = async (request: CreateQuestionRequest) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/questions`, request, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createChoice = async (request: CreateChoiceRequest) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/choices`, request, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createMatchingQuestion = async (request: MatchingQuestionRequest) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/matching-questions`, request, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createSharedMedia = async (request: SharedMediaRequest) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/shared-media`, request, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createChoicesBatch = async (data: {
  questionId: string;
  choices: Array<{
    text: string | null;
    value: string;
    orderIndex: number | null;
    isCorrect: boolean | null;
  }>;
}) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/choices/batch`, data, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

export const uploadSharedMedia = async (data: UploadSharedMediaRequest) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  if (data.file) {
    formData.append('file', data.file);
  }
  formData.append('title', data.title);
  formData.append('mediaType', data.mediaType.toString());
  if (data.text) {
    formData.append('text', data.text);
  }

  const response = await axios.post(`${API_URL}/shared-media/upload`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateSharedMedia = async (mediaId: string, data: UploadSharedMediaRequest) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  if (data.file) {
    formData.append('file', data.file);
  }
  formData.append('title', data.title);
  formData.append('mediaType', data.mediaType.toString());
  if (data.text) {
    formData.append('text', data.text);
  }

  const response = await axios.post(`${API_URL}/shared-media/upload/${mediaId}`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Helper function to convert question type to API type
export const convertQuestionTypeToApiType = (type: string): string => {
  const mapping: { [key: string]: string } = {
    'Multiple Choice': 'radio',
    'Matching': 'itemConnector',
    'Sorting': 'ranking',
    'Fill in the Blank': 'shortAnswer'
  };
  return mapping[type] || type;
};

export const getQuestions = async (createdBy: string, subjectId: string): Promise<Question[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/questions`, {
      params: { createdBy, subjectId },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch questions:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getQuestionDetail = async (questionId: string): Promise<Question> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/questions/${questionId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch question detail:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteQuestion = async (questionId: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/questions/${questionId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error: any) {
    console.error('Failed to delete question:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getQuestionsBySharedMedia = async (sharedMediaId: string): Promise<Question[]> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/questions/shared-media/${sharedMediaId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};