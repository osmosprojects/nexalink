"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedRepository = void 0;
const db_1 = require("../config/db");
class FeedRepository {
    static async list(userId, limit = 20) {
        const rows = await (0, db_1.query)(`SELECT * FROM posts ORDER BY created_at DESC LIMIT 100`);
        if (rows.length === 0)
            return [];
        const authorIds = [...new Set(rows.map((p) => p.user_id))];
        // Fetch precomputed match scores for authors
        const scores = await (0, db_1.query)(`SELECT user_b_id, score FROM user_match_scores WHERE user_a_id = ? AND user_b_id IN (${authorIds.map(() => '?').join(',')})`, [userId, ...authorIds]);
        const scoreMap = new Map();
        scores.forEach((s) => scoreMap.set(Number(s.user_b_id), s.score));
        const now = Date.now();
        const HALF_LIFE_HOURS = 24;
        const DECAY_LAMBDA = Math.LN2 / HALF_LIFE_HOURS;
        const rankedPosts = rows.map((p) => {
            const matchScore = scoreMap.get(Number(p.user_id)) || 50;
            const hoursAgo = Math.max(0, (now - new Date(p.created_at).getTime()) / (1000 * 60 * 60));
            const timeDecayScore = 100 * Math.exp(-DECAY_LAMBDA * hoursAgo);
            // Combined score: 60% Match Score + 40% Time Decay Score
            const combinedScore = Math.round(matchScore * 0.6 + timeDecayScore * 0.4);
            return {
                ...p,
                tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags || [],
                matchScore,
                combinedScore,
            };
        });
        rankedPosts.sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0));
        return rankedPosts.slice(0, limit);
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
