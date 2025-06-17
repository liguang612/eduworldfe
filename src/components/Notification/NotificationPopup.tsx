import React, { useState, useEffect } from 'react';
import NotificationItem from './NotificationItem';
import ReloadIcon from '@/assets/reload.svg';
import {
  getNotifications,
  markAllNotificationsAsRead,
  clearAllNotifications,
  type NotificationData,
} from '../../api/notificationApi';

const NOTIFICATIONS_PAGE_SIZE = 5;

interface NotificationPopupProps {
  onClose: () => void;
  onHasUnreadChange?: (hasUnread: boolean) => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  onHasUnreadChange,
  onClose
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(false);


  const updateHasUnread = (notificationsList: NotificationData[]) => {
    const hasUnread = notificationsList.some(n => !n.read);
    onHasUnreadChange?.(hasUnread);
  };

  const fetchNotifications = async (currentCursor?: string) => {
    setIsLoading(true);
    try {
      const data = await getNotifications(currentCursor, NOTIFICATIONS_PAGE_SIZE);
      const newNotifications = currentCursor ? [...notifications, ...data.notifications] : data.notifications;
      setNotifications(newNotifications);
      setNextCursor(data.nextCursor || null);
      setHasMoreNotifications(data.hasNextPage || false);
      updateHasUnread(newNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (nextCursor && !isLoading) {
      fetchNotifications(nextCursor);
    }
  };

  const handleMarkAllRead = async () => {
    setIsLoading(true);
    try {
      await markAllNotificationsAsRead();
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updatedNotifications);
      updateHasUnread(updatedNotifications);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = async () => {
    setIsLoading(true);
    try {
      await clearAllNotifications();
      setNotifications([]);
      setNextCursor(null);
      setHasMoreNotifications(false);
      updateHasUnread([]);
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefetch = async () => {
    await fetchNotifications();
  };

  const handleItemMarkedAsRead = () => {
    onClose();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="absolute top-0 right-0 w-[30vw] max-h-[70vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-[#e7edf3] z-50">
      <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-2 p-4 border-b border-[#e7edf3]">
        <div className="flex items-center gap-2">
          <p className="text-[#0e141b] text-lg font-bold leading-tight">Thông báo</p>
          {isLoading && (
            <div className="animate-spin h-4 w-4 border-2 border-[#0D7CF2] border-t-transparent rounded-full" />
          )}
          {!isLoading && (
            <button onClick={handleRefetch} className="p-1 rounded hover:bg-gray-200">
              <img src={ReloadIcon} alt="Refetch Notifications" className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-[#0D7CF2] hover:underline"
            >
              Đánh dấu tất cả đã đọc
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-red-600 hover:underline"
            >
              Xóa tất cả
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col">
        {notifications.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Không có thông báo mới.</p>
        ) : (
          <>
            {notifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                data={notif}
                onClick={handleItemMarkedAsRead}
              />
            ))}
            {hasMoreNotifications && !isLoading && (
              <button
                onClick={handleLoadMore}
                className="w-full py-3 text-center text-[#4e7297] text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Hiển thị thêm
              </button>
            )}
            {isLoading && (
              <div className="w-full py-3 text-center text-[#4e7297] text-sm font-medium hover:bg-slate-50 transition-colors">
                Đang tải...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationPopup;