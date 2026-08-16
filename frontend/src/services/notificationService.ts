import { apiClient } from './api';
import {
  Notification,
  NotificationFilter,
  NotificationListResponse,
} from '@/types/notification';

export const notificationService = {
  async getNotifications(
    filter: NotificationFilter = 'all',
    limit: number = 30
  ): Promise<NotificationListResponse> {
    const res = await apiClient.get<{
      success: boolean;
      data: NotificationListResponse;
    }>('/notifications', {
      params: { filter, limit },
    });
    return res.data.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<{
      success: boolean;
      data: { unreadCount: number };
    }>('/notifications/unread-count');
    return res.data.data.unreadCount;
  },

  async markAsRead(id: string): Promise<Notification> {
    const res = await apiClient.patch<{
      success: boolean;
      data: { notification: Notification; unreadCount: number };
    }>(`/notifications/${id}/read`);
    return res.data.data.notification;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },
};
