import axios from '@/config/axios';
import { handleStorageLimitError } from '@/lib/utils';

const FILE_API_URL = '/api/files';

export interface Post {
  id: string;
  content: string;
  imageUrls: string[];
  createdAt: string;
  user: {
    id: string;
    userName: string;
    userAvatar: string;
    userSchool: string;
  };
  courseId: string;
  approved: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    userName: string;
    userAvatar: string;
    userSchool: string;
  };
}

export interface PaginatedPostsResponse {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
}

export interface PaginatedCommentsResponse {
  comments: Comment[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
}

export interface CreatePostRequest {
  content: string;
  imageUrls: string[];
  courseId: string;
}

export interface UpdatePostRequest {
  content: string;
  imageUrls: string[];
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// POST
export const createPost = async (data: CreatePostRequest): Promise<Post> => {
  const token = localStorage.getItem('token');
  const response = await axios.post('/api/posts', data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

export const updatePost = async (postId: string, data: { content: string; imageUrls: string[] }): Promise<Post> => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`/api/posts/${postId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const deletePost = async (postId: string): Promise<void> => {
  const token = localStorage.getItem('token');
  await axios.delete(`/api/posts/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getCoursePosts = async (courseId: string, page: number = 0, size: number = 10): Promise<PaginatedPostsResponse> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`/api/posts/course/${courseId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: {
      page,
      size
    }
  });
  return response.data;
};

export const getPendingPosts = async (courseId: string, page: number = 0, size: number = 10): Promise<PaginatedPostsResponse> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`/api/posts/course/${courseId}/pending`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: {
      page,
      size
    }
  });
  return response.data;
};

export const approvePost = async (postId: string, approved: boolean): Promise<Post | null> => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`/api/posts/${postId}/approve`, { approved }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

// COMMENTS
export const createComment = async (data: CreateCommentRequest): Promise<Comment> => {
  const token = localStorage.getItem('token');
  const response = await axios.post('/api/comments', data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const updateComment = async (commentId: string, data: UpdateCommentRequest): Promise<Comment> => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`/api/comments/${commentId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  const token = localStorage.getItem('token');
  await axios.delete(`/api/comments/${commentId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getPostComments = async (postId: string, page: number = 0, size: number = 10): Promise<PaginatedCommentsResponse> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`/api/comments/post/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: {
      page,
      size
    }
  });
  return response.data;
};

export const uploadFile = async (file: File, type: string): Promise<string> => {
  const token = localStorage.getItem('token');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  try {
    const response = await axios.post(`${FILE_API_URL}/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': undefined,
      },
    });

    return response.data.url;
  } catch (error: any) {
    handleStorageLimitError(error);
    throw error;
  }
};