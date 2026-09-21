"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const NotificationRepository_1 = require("../repositories/NotificationRepository");
const response_1 = require("../helpers/response");
class NotificationController {
    static async list(req, res, next) {
        try {
            const userId = req.user.userId;
            const notifications = await NotificationRepository_1.NotificationRepository.list(userId, 30);
            const unreadCount = await NotificationRepository_1.NotificationRepository.getUnreadCount(userId);
            return (0, response_1.sendSuccess)(res, {
                notifications,
                unread_count: unreadCount,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async markAsRead(req, res, next) {
        try {
            const userId = req.user.userId;
            const notifId = parseInt(String(req.params.id), 10);
            if (isNaN(notifId))
                return (0, response_1.sendError)(res, 'Invalid notification ID', 400);
            await NotificationRepository_1.NotificationRepository.markAsRead(userId, notifId);
            return (0, response_1.sendSuccess)(res, { message: 'Marked as read' });
        }
        catch (err) {
            next(err);
        }
    }
    static async markAllAsRead(req, res, next) {
        try {
            const userId = req.user.userId;
            await NotificationRepository_1.NotificationRepository.markAllAsRead(userId);
            return (0, response_1.sendSuccess)(res, { message: 'All marked as read' });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.NotificationController = NotificationController;
