"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../config/db");
const router = (0, express_1.Router)();
/**
 * GET /api/feed
 * Returns network feed posts ranked by combined match score (60%) + recency time decay (40%).
 */
router.get('/', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const limit = parseInt(String(req.query.limit || '20'), 10);
        // 1. Fetch recent network posts
        const posts = await (0, db_1.query)(`SELECT post_id, user_id, author_name, author_title, author_avatar, content, tags, likes_count, created_at
       FROM posts
       ORDER BY created_at DESC
       LIMIT 100`);
        if (posts.length === 0) {
            return res.json({ success: true, data: [] });
        }
        const authorIds = [...new Set(posts.map((p) => p.user_id))];
        // 2. Fetch precomputed match scores for post authors
        const scores = await (0, db_1.query)(`SELECT userB_id, score FROM match_scores WHERE userA_id = ? AND userB_id IN (${authorIds.map(() => '?').join(',')})`, [userId, ...authorIds]);
        const scoreMap = new Map();
        scores.forEach((s) => scoreMap.set(Number(s.userB_id), s.score));
        const now = Date.now();
        const HALF_LIFE_HOURS = 24;
        const DECAY_LAMBDA = Math.LN2 / HALF_LIFE_HOURS;
        // 3. Compute combined score (60% Match Score + 40% Recency Score)
        const rankedPosts = posts.map((post) => {
            const matchScore = scoreMap.get(Number(post.user_id)) || 45; // Default baseline
            const hoursAgo = Math.max(0, (now - new Date(post.created_at).getTime()) / (1000 * 60 * 60));
            const timeDecayScore = 100 * Math.exp(-DECAY_LAMBDA * hoursAgo);
            const combinedScore = Math.round(matchScore * 0.6 + timeDecayScore * 0.4);
            return {
                ...post,
                tags: typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags || [],
                matchScore,
                combinedScore,
            };
        });
        // 4. Sort posts DESC by combinedScore
        rankedPosts.sort((a, b) => b.combinedScore - a.combinedScore);
        return res.json({
            success: true,
            data: rankedPosts.slice(0, limit),
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
