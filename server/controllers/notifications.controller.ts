import { Request, Response } from 'express';
import { notificationsService } from '../services/notifications.service';

export class NotificationsController {
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const notifications = await notificationsService.getNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { notificationId } = req.params;

      const success = await notificationsService.markNotificationAsRead(notificationId, userId);

      if (!success) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      await notificationsService.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ message: 'Failed to mark all notifications as read' });
    }
  }

  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const count = await notificationsService.getUnreadNotificationsCount(userId);
      res.json({ count });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ message: 'Failed to fetch unread count' });
    }
  }
}

export const notificationsController = new NotificationsController();
