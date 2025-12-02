import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { notificationsController } from '../controllers/notifications.controller';

const router = Router();

// All notification routes require authentication
router.use(requireAuth);

// Notification CRUD routes
router.get('/', notificationsController.getNotifications);
router.patch('/:notificationId/read', notificationsController.markAsRead);
router.patch('/read-all', notificationsController.markAllAsRead);
router.get('/unread-count', notificationsController.getUnreadCount);

export default router;
