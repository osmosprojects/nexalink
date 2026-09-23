"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedRepository = void 0;
const db_1 = require("../config/db");
class FeedRepository {
    static async list(userId, limit = 20) {
        const rows = await (0, db_1.query)(`SELECT * FROM posts ORDER BY created_at DESC LIMIT ?`, [limit]);
        return rows.map((p) => ({
            ...p,
            tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags || [],
        }));
    }
    static async create(userId, data) {
        const result = await (0, db_1.query)(`INSERT INTO posts (user_id, author_name, author_title, author_avatar, content, tags, likes_count)
       VALUES (?, ?, ?, ?, ?, ?, 0)`, [
            userId,
            data.author_name,
            data.author_title || null,
            data.author_avatar || null,
            data.content,
            JSON.stringify(data.tags || []),
        ]);
        return result.insertId;
    }
    static async like(userId, postId) {
        await (0, db_1.query)(`UPDATE posts SET likes_count = likes_count + 1 WHERE post_id = ?`, [postId]);
    }
}
exports.FeedRepository = FeedRepository;
