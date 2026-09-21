"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationRepository = void 0;
const db_1 = require("../config/db");
class RecommendationRepository {
    static async list(userId, status = 'pending') {
        const rows = await (0, db_1.query)(`SELECT * FROM recommendations WHERE user_id = ? AND status = ? ORDER BY score DESC, created_at DESC`, [userId, status]);
        return rows.map((r) => ({
            ...r,
            skills: typeof r.skills === 'string' ? JSON.parse(r.skills) : r.skills || [],
        }));
    }
    static async updateStatus(userId, recommendationId, status) {
        await (0, db_1.query)(`UPDATE recommendations SET status = ? WHERE user_id = ? AND recommendation_id = ?`, [status, userId, recommendationId]);
    }
}
exports.RecommendationRepository = RecommendationRepository;
