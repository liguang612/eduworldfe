import axios from '../config/axios';

const API_URL = '/api';

interface CreateQuestionRequest {
  title: string;
  type: string;
  level: number;
  subjectId: string;
  sharedMediaId?: string;
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

interface UploadSharedMediaRequest {
  file: File;
  title: string;
  mediaType: number;
  text?: string; // Optional text for some media types if needed
}

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
  formData.append('file', data.file);
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

// Helper function to convert question level to number
export const convertLevelToNumber = (level: string): number => {
  switch (level) {
    case 'Easy': return 1;
    case 'Medium': return 2;
    case 'Hard': return 3;
    case 'VeryHard': return 4;
    default: return 2;
  }
};

// Helper function to convert question type to API type
export const convertQuestionTypeToApiType = (type: string): string => {
  const mapping: { [key: string]: string } = {
    'Multiple Choice': 'radio',
    'Matching': 'itemConnector',
    'Sorting': 'ordering',
    'Fill in the Blank': 'shortAnswer'
  };
  return mapping[type] || type;
};
