import { Request, Response, NextFunction } from 'express';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { sendSuccess, sendError } from '../helpers/response';

export class NotificationController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const notifications = await NotificationRepository.list(userId, 30);
      const unreadCount = await NotificationRepository.getUnreadCount(userId);

      return sendSuccess(res, {
        notifications,
        unread_count: unreadCount,
      });
    } catch (err) {
      next(err);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const notifId = parseInt(String(req.params.id), 10);
      if (isNaN(notifId)) return sendError(res, 'Invalid notification ID', 400);

      await NotificationRepository.markAsRead(userId, notifId);
      return sendSuccess(res, { message: 'Marked as read' });
    } catch (err) {
      next(err);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      await NotificationRepository.markAllAsRead(userId);
      return sendSuccess(res, { message: 'All marked as read' });
    } catch (err) {
      next(err);
    }
  }
}
