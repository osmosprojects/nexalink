"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const db_1 = require("../config/db");
class UserRepository {
    static async findByEmail(email) {
        const rows = await (0, db_1.query)(`SELECT user_id, email, password_hash, display_name, avatar_url, status, created_at, updated_at
       FROM users WHERE email = ? LIMIT 1`, [email.toLowerCase().trim()]);
        return rows[0] || null;
    }
    static async findById(userId) {
        const rows = await (0, db_1.query)(`SELECT user_id, email, password_hash, display_name, avatar_url, status, created_at, updated_at
       FROM users WHERE user_id = ? LIMIT 1`, [userId]);
        return rows[0] || null;
    }
    static async create(data) {
        const result = await (0, db_1.query)(`INSERT INTO users (email, password_hash, display_name, avatar_url)
       VALUES (?, ?, ?, ?)`, [data.email.toLowerCase().trim(), data.passwordHash, data.displayName, data.avatarUrl || null]);
        return result.insertId;
    }
    static async updateAvatar(userId, avatarUrl) {
        await (0, db_1.query)(`UPDATE users SET avatar_url = ? WHERE user_id = ?`, [avatarUrl, userId]);
    }
}
exports.UserRepository = UserRepository;
