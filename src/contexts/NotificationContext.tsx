import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { websocketServiceWithSockJS as websocketService } from '@/services/websocketServiceWithSockJS';
import { toast } from 'react-toastify';
import type { NotificationData } from '@/api/notificationApi';

interface NotificationContextType {
  notifications: NotificationData[];
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  hasUnread: boolean;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          websocketService.connect(token, user.id);

          websocketService.onConnectionStatusChange((connected) => {
            setIsConnected(connected);
          });

          websocketService.onNotification((notification) => {
            setNotifications(prev => [notification, ...prev]);

            if (!notification.read) {
              setHasUnread(true);
            }

            showToastNotification(notification);
          });
        } catch (error) {
          console.error('Failed to connect WebSocket:', error);
        }

        return () => {
          websocketService.disconnect();
        };
      }
    }
  }, [user?.id]);

  // Kiểm tra còn thông báo chưa đọc không (để hiển thị badge trên quả chuông đoáa)
  useEffect(() => {
    const hasUnreadNotifications = notifications.some(notification => !notification.read);
    setHasUnread(hasUnreadNotifications);
  }, [notifications]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const showToastNotification = (notification: NotificationData) => {

    toast.info(
      <div className="flex flex-col">
        <p className="text-sm font-medium text-gray-900">
          {notification.message}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(notification.createdAt).toLocaleTimeString()}
        </p>
      </div>,
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        icon: (
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
        ),
      }
    );
  };

  const value: NotificationContextType = {
    notifications,
    markAsRead,
    markAllAsRead,
    clearAll,
    hasUnread,
    isConnected
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}; 