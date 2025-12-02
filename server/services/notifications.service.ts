import { storage } from '../storage';

export class NotificationsService {
  async getNotifications(userId: string, limit?: number) {
    return storage.getNotifications(userId, limit);
  }

  async markNotificationAsRead(id: string, userId: string) {
    return storage.markNotificationAsRead(id, userId);
  }

  async markAllNotificationsAsRead(userId: string) {
    return storage.markAllNotificationsAsRead(userId);
  }

  async getUnreadNotificationsCount(userId: string) {
    return storage.getUnreadNotificationsCount(userId);
  }
}

export const notificationsService = new NotificationsService();
