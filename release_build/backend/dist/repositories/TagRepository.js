"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagRepository = void 0;
const db_1 = require("../config/db");
class TagRepository {
    static async listByUserId(userId) {
        return (0, db_1.query)(`SELECT tag_id, user_id, name, color, created_at FROM tags WHERE user_id = ? ORDER BY name ASC`, [userId]);
    }
    static async findOrCreate(userId, name, color = '#2563EB') {
        const existing = await (0, db_1.query)(`SELECT tag_id FROM tags WHERE user_id = ? AND name = ? LIMIT 1`, [userId, name.trim()]);
        if (existing.length > 0) {
            return existing[0].tag_id;
        }
        const result = await (0, db_1.query)(`INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)`, [userId, name.trim(), color]);
        return result.insertId;
    }
}
exports.TagRepository = TagRepository;
