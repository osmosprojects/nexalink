"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionRepository = void 0;
const db_1 = require("../config/db");
class InteractionRepository {
    static async list(userId, filters = {}) {
        const page = Math.max(1, Number(filters.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
        const offset = (page - 1) * limit;
        const whereClauses = ['i.user_id = ?'];
        const params = [userId];
        if (filters.contact_id) {
            whereClauses.push('i.contact_id = ?');
            params.push(filters.contact_id);
        }
        if (filters.goal_id) {
            whereClauses.push('i.goal_id = ?');
            params.push(filters.goal_id);
        }
        if (filters.type && filters.type !== 'all') {
            whereClauses.push('i.interaction_type = ?');
            params.push(filters.type);
        }
        const whereSql = whereClauses.join(' AND ');
        const countRows = await (0, db_1.query)(`SELECT COUNT(*) as total FROM interactions i WHERE ${whereSql}`, params);
        const total = countRows[0]?.total || 0;
        const items = await (0, db_1.query)(`SELECT 
        i.*,
        CONCAT(c.first_name, ' ', c.last_name) as contact_name,
        c.avatar_url as contact_avatar,
        g.title as goal_title
       FROM interactions i
       JOIN contacts c ON i.contact_id = c.contact_id
       LEFT JOIN goals g ON i.goal_id = g.goal_id
       WHERE ${whereSql}
       ORDER BY i.interaction_date DESC
       LIMIT ${limit} OFFSET ${offset}`, params);
        return {
            items,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
        };
    }
    static async getById(userId, interactionId) {
        const rows = await (0, db_1.query)(`SELECT 
        i.*,
        CONCAT(c.first_name, ' ', c.last_name) as contact_name,
        c.avatar_url as contact_avatar,
        g.title as goal_title
       FROM interactions i
       JOIN contacts c ON i.contact_id = c.contact_id
       LEFT JOIN goals g ON i.goal_id = g.goal_id
       WHERE i.user_id = ? AND i.interaction_id = ?
       LIMIT 1`, [userId, interactionId]);
        return rows[0] || null;
    }
    static async create(userId, data) {
        return (0, db_1.withTransaction)(async (conn) => {
            const interactionDate = data.interaction_date || new Date().toISOString().slice(0, 19).replace('T', ' ');
            const followUpReq = data.follow_up_required ? 1 : 0;
            // 1. Insert Interaction
            const [iRes] = await conn.execute(`INSERT INTO interactions (
          user_id, contact_id, goal_id, interaction_type, title, interaction_date, duration_minutes, summary, outcome, follow_up_required, follow_up_date, sentiment
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                userId,
                data.contact_id,
                data.goal_id || null,
                data.interaction_type || 'note',
                data.title,
                interactionDate,
                data.duration_minutes || 30,
                data.summary || null,
                data.outcome || null,
                followUpReq,
                data.follow_up_date || null,
                data.sentiment || 'positive',
            ]);
            const interactionId = iRes.insertId;
            // 2. Update Contact last_interaction_at & strength & next_follow_up_at
            await conn.execute(`UPDATE contacts 
         SET last_interaction_at = ?, 
             next_follow_up_at = COALESCE(?, next_follow_up_at),
             relationship_strength = LEAST(100, relationship_strength + 5)
         WHERE user_id = ? AND contact_id = ?`, [interactionDate, data.follow_up_date || null, userId, data.contact_id]);
            // 3. If follow up required, create a Task automatically
            if (followUpReq && data.follow_up_date) {
                await conn.execute(`INSERT INTO tasks (
            user_id, contact_id, goal_id, title, description, status, priority, due_date
          ) VALUES (?, ?, ?, ?, ?, 'todo', 'high', ?)`, [
                    userId,
                    data.contact_id,
                    data.goal_id || null,
                    `Follow up regarding: ${data.title}`,
                    `Scheduled follow-up from interaction on ${interactionDate}. Outcome: ${data.outcome || 'N/A'}`,
                    data.follow_up_date,
                ]);
            }
            // 4. If linked goal, increment goal current_value and log progress
            if (data.goal_id) {
                await conn.execute(`UPDATE goals 
           SET current_value = LEAST(target_value, current_value + 1)
           WHERE user_id = ? AND goal_id = ?`, [userId, data.goal_id]);
                await conn.execute(`INSERT INTO goal_progress (goal_id, progress_date, progress_value, notes)
           VALUES (?, CURDATE(), 1, ?)`, [data.goal_id, `Progress logged from interaction: ${data.title}`]);
            }
            return interactionId;
        });
    }
    static async update(userId, interactionId, data) {
        await (0, db_1.query)(`UPDATE interactions SET
        title = COALESCE(?, title),
        interaction_type = COALESCE(?, interaction_type),
        interaction_date = COALESCE(?, interaction_date),
        duration_minutes = COALESCE(?, duration_minutes),
        summary = COALESCE(?, summary),
        outcome = COALESCE(?, outcome),
        follow_up_required = COALESCE(?, follow_up_required),
        follow_up_date = COALESCE(?, follow_up_date),
        sentiment = COALESCE(?, sentiment),
        goal_id = COALESCE(?, goal_id)
      WHERE user_id = ? AND interaction_id = ?`, [
            data.title ?? null,
            data.interaction_type ?? null,
            data.interaction_date ?? null,
            data.duration_minutes ?? null,
            data.summary ?? null,
            data.outcome ?? null,
            data.follow_up_required !== undefined ? (data.follow_up_required ? 1 : 0) : null,
            data.follow_up_date ?? null,
            data.sentiment ?? null,
            data.goal_id ?? null,
            userId,
            interactionId,
        ]);
    }
    static async delete(userId, interactionId) {
        const result = await (0, db_1.query)(`DELETE FROM interactions WHERE user_id = ? AND interaction_id = ?`, [userId, interactionId]);
        return result.affectedRows > 0;
    }
}
exports.InteractionRepository = InteractionRepository;
