import axios from '@/config/axios';

const API_URL = '/api/notifications';
const NOTIFICATIONS_PAGE_SIZE = 5; // Default page size, can be overridden

interface NotificationsApiResponse {
  notifications: NotificationData[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface NotificationData {
  id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;

  actorId?: string;
  actorName?: string;
  actorAvatarUrl?: string;

  courseId?: string;
  courseName?: string;
  courseAvatarUrl?: string;

  lectureId?: string;
  lectureTitle?: string;

  questionId?: string;
  questionTitle?: string;

  solutionId?: string;

  examId?: string;
  examTitle?: string;

  postId?: string;
  postTitle?: string;

  commentId?: string;
  commentContentSnippet?: string;

  joinRequestId?: string;
}

export const getNotifications = async (cursor?: string, size: number = NOTIFICATIONS_PAGE_SIZE): Promise<NotificationsApiResponse> => {
  const token = localStorage.getItem('token');
  let url = `${API_URL}?size=${size}`;
  if (cursor) {
    url += `&cursor=${cursor}`;
  }
  const response = await axios.get<NotificationsApiResponse>(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const token = localStorage.getItem('token');
  await axios.put(`${API_URL}/${notificationId}/read`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  const token = localStorage.getItem('token');
  await axios.put(`${API_URL}/read-all`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const clearAllNotifications = async (): Promise<void> => {
  const token = localStorage.getItem('token');
  await axios.delete(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

