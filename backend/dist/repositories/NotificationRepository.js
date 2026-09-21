"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const db_1 = require("../config/db");
class NotificationRepository {
    static async list(userId, limit = 20) {
        return (0, db_1.query)(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`, [userId, limit]);
    }
    static async getUnreadCount(userId) {
        const rows = await (0, db_1.query)(`SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = 0`, [userId]);
        return rows[0]?.unread_count || 0;
    }
    static async markAsRead(userId, notificationId) {
        await (0, db_1.query)(`UPDATE notifications SET is_read = 1 WHERE user_id = ? AND notification_id = ?`, [userId, notificationId]);
    }
    static async markAllAsRead(userId) {
        await (0, db_1.query)(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [userId]);
    }
    static async create(userId, data) {
        const result = await (0, db_1.query)(`INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, is_read)
       VALUES (?, ?, ?, ?, ?, ?, 0)`, [
            userId,
            data.type,
            data.title,
            data.message,
            data.entity_type || null,
            data.entity_id || null,
        ]);
        return result.insertId;
    }
}
exports.NotificationRepository = NotificationRepository;
