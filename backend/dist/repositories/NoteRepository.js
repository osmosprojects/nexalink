"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteRepository = void 0;
const db_1 = require("../config/db");
class NoteRepository {
    static async list(userId, filters = {}) {
        const whereClauses = ['n.user_id = ?'];
        const params = [userId];
        if (filters.contact_id) {
            whereClauses.push('n.contact_id = ?');
            params.push(filters.contact_id);
        }
        if (filters.search) {
            whereClauses.push('(n.title LIKE ? OR n.content LIKE ?)');
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }
        return (0, db_1.query)(`SELECT 
        n.*,
        CONCAT(c.first_name, ' ', c.last_name) as contact_name
       FROM notes n
       LEFT JOIN contacts c ON n.contact_id = c.contact_id
       WHERE ${whereClauses.join(' AND ')}
       ORDER BY n.is_pinned DESC, n.updated_at DESC`, params);
    }
    static async getById(userId, noteId) {
        const rows = await (0, db_1.query)(`SELECT 
        n.*,
        CONCAT(c.first_name, ' ', c.last_name) as contact_name
       FROM notes n
       LEFT JOIN contacts c ON n.contact_id = c.contact_id
       WHERE n.user_id = ? AND n.note_id = ?
       LIMIT 1`, [userId, noteId]);
        return rows[0] || null;
    }
    static async create(userId, data) {
        const result = await (0, db_1.query)(`INSERT INTO notes (
        user_id, contact_id, meeting_id, goal_id, task_id, title, content, is_pinned
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            userId,
            data.contact_id || null,
            data.meeting_id || null,
            data.goal_id || null,
            data.task_id || null,
            data.title || 'Untitled Note',
            data.content || '',
            data.is_pinned ? 1 : 0,
        ]);
        return result.insertId;
    }
    static async update(userId, noteId, data) {
        await (0, db_1.query)(`UPDATE notes SET
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        is_pinned = COALESCE(?, is_pinned),
        contact_id = COALESCE(?, contact_id),
        meeting_id = COALESCE(?, meeting_id),
        goal_id = COALESCE(?, goal_id),
        task_id = COALESCE(?, task_id)
      WHERE user_id = ? AND note_id = ?`, [
            data.title ?? null,
            data.content ?? null,
            data.is_pinned !== undefined ? (data.is_pinned ? 1 : 0) : null,
            data.contact_id ?? null,
            data.meeting_id ?? null,
            data.goal_id ?? null,
            data.task_id ?? null,
            userId,
            noteId,
        ]);
    }
    static async delete(userId, noteId) {
        const result = await (0, db_1.query)(`DELETE FROM notes WHERE user_id = ? AND note_id = ?`, [userId, noteId]);
        return result.affectedRows > 0;
    }
}
exports.NoteRepository = NoteRepository;
