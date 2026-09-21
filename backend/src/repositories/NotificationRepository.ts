import { query } from '../config/db';

export interface NotificationRow {
  notification_id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: number | null;
  is_read: number;
  created_at: string;
}

export class NotificationRepository {
  static async list(userId: number, limit = 20): Promise<NotificationRow[]> {
    return query<NotificationRow[]>(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
      [userId, limit]
    );
  }

  static async getUnreadCount(userId: number): Promise<number> {
    const rows = await query<any[]>(
      `SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = 0`,
      [userId]
    );
    return rows[0]?.unread_count || 0;
  }

  static async markAsRead(userId: number, notificationId: number): Promise<void> {
    await query(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND notification_id = ?`,
      [userId, notificationId]
    );
  }

  static async markAllAsRead(userId: number): Promise<void> {
    await query(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
      [userId]
    );
  }

  static async create(userId: number, data: { type: string; title: string; message: string; entity_type?: string; entity_id?: number }): Promise<number> {
    const result: any = await query(
      `INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, is_read)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [
        userId,
        data.type,
        data.title,
        data.message,
        data.entity_type || null,
        data.entity_id || null,
      ]
    );
    return result.insertId;
  }
}
