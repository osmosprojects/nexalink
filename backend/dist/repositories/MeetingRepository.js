"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingRepository = void 0;
const db_1 = require("../config/db");
class MeetingRepository {
    static async list(userId, filters = {}) {
        const whereClauses = ['m.user_id = ?'];
        const params = [userId];
        if (filters.contact_id) {
            whereClauses.push('m.contact_id = ?');
            params.push(filters.contact_id);
        }
        if (filters.upcoming_only) {
            whereClauses.push('m.start_at >= NOW()');
        }
        const whereSql = whereClauses.join(' AND ');
        const limit = filters.limit ? `LIMIT ${Number(filters.limit)}` : '';
        return (0, db_1.query)(`SELECT 
        m.*,
        CONCAT(c.first_name, ' ', c.last_name) as contact_name,
        c.avatar_url as contact_avatar,
        g.title as goal_title
       FROM meetings m
       LEFT JOIN contacts c ON m.contact_id = c.contact_id
       LEFT JOIN goals g ON m.goal_id = g.goal_id
       WHERE ${whereSql}
       ORDER BY m.start_at ASC
       ${limit}`, params);
    }
    static async getById(userId, meetingId) {
        const rows = await (0, db_1.query)(`SELECT 
        m.*,
        CONCAT(c.first_name, ' ', c.last_name) as contact_name,
        c.avatar_url as contact_avatar,
        g.title as goal_title
       FROM meetings m
       LEFT JOIN contacts c ON m.contact_id = c.contact_id
       LEFT JOIN goals g ON m.goal_id = g.goal_id
       WHERE m.user_id = ? AND m.meeting_id = ?
       LIMIT 1`, [userId, meetingId]);
        return rows[0] || null;
    }
    static async create(userId, data) {
        const result = await (0, db_1.query)(`INSERT INTO meetings (
        user_id, contact_id, goal_id, title, meeting_type, start_at, end_at, location, meeting_url, agenda, outcome, notes, follow_up_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            userId,
            data.contact_id || null,
            data.goal_id || null,
            data.title || 'Untitled Meeting',
            data.meeting_type || 'video',
            data.start_at,
            data.end_at,
            data.location || null,
            data.meeting_url || null,
            data.agenda || null,
            data.outcome || null,
            data.notes || null,
            data.follow_up_date || null,
        ]);
        return result.insertId;
    }
    static async update(userId, meetingId, data) {
        await (0, db_1.query)(`UPDATE meetings SET
        title = COALESCE(?, title),
        contact_id = COALESCE(?, contact_id),
        goal_id = COALESCE(?, goal_id),
        meeting_type = COALESCE(?, meeting_type),
        start_at = COALESCE(?, start_at),
        end_at = COALESCE(?, end_at),
        location = COALESCE(?, location),
        meeting_url = COALESCE(?, meeting_url),
        agenda = COALESCE(?, agenda),
        outcome = COALESCE(?, outcome),
        notes = COALESCE(?, notes),
        follow_up_date = COALESCE(?, follow_up_date)
      WHERE user_id = ? AND meeting_id = ?`, [
            data.title ?? null,
            data.contact_id ?? null,
            data.goal_id ?? null,
            data.meeting_type ?? null,
            data.start_at ?? null,
            data.end_at ?? null,
            data.location ?? null,
            data.meeting_url ?? null,
            data.agenda ?? null,
            data.outcome ?? null,
            data.notes ?? null,
            data.follow_up_date ?? null,
            userId,
            meetingId,
        ]);
    }
    static async delete(userId, meetingId) {
        const result = await (0, db_1.query)(`DELETE FROM meetings WHERE user_id = ? AND meeting_id = ?`, [userId, meetingId]);
        return result.affectedRows > 0;
    }
}
exports.MeetingRepository = MeetingRepository;
