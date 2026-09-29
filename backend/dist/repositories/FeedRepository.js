"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedRepository = void 0;
const db_1 = require("../config/db");
class FeedRepository {
    static repliesTableChecked = false;
    static async ensureRepliesTableExist() {
        if (this.repliesTableChecked)
            return;
        try {
            await (0, db_1.query)(`
        CREATE TABLE IF NOT EXISTS post_replies (
          reply_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          post_id BIGINT UNSIGNED NOT NULL,
          user_id BIGINT UNSIGNED NOT NULL,
          author_name VARCHAR(150) NOT NULL,
          author_avatar VARCHAR(500) NULL,
          reply_type VARCHAR(50) NOT NULL DEFAULT 'wants to meet to',
          target_person VARCHAR(150) NOT NULL DEFAULT 'Sanjeev Sarma',
          content TEXT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          KEY idx_replies_post (post_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
            this.repliesTableChecked = true;
        }
        catch (err) {
            console.warn('⚠️ post_replies auto table creation notice:', err);
        }
    }
    static async getRepliesForPost(postId) {
        await this.ensureRepliesTableExist();
        const rows = await (0, db_1.query)(`SELECT * FROM post_replies WHERE post_id = ? ORDER BY created_at ASC`, [postId]);
        return rows;
    }
    static async createReply(userId, postId, authorName, authorAvatar, replyType, targetPerson, content) {
        await this.ensureRepliesTableExist();
        const existing = await (0, db_1.query)(`SELECT * FROM post_replies WHERE post_id = ? AND user_id = ?`, [postId, userId]);
        if (existing.length > 0) {
            await (0, db_1.query)(`UPDATE post_replies SET reply_type = ?, target_person = ?, content = ?, author_name = ?, author_avatar = ? WHERE reply_id = ?`, [replyType, targetPerson, content || null, authorName, authorAvatar || null, existing[0].reply_id]);
            return existing[0].reply_id;
        }
        else {
            const result = await (0, db_1.query)(`INSERT INTO post_replies (post_id, user_id, author_name, author_avatar, reply_type, target_person, content)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [postId, userId, authorName, authorAvatar || null, replyType, targetPerson, content || null]);
            return result.insertId;
        }
    }
    static async list(userId, limit = 30) {
        let rows = await (0, db_1.query)(`SELECT * FROM posts ORDER BY created_at DESC LIMIT 100`);
        // Auto-generate welcome network posts disabled on TRUNCATE
        /*
        if (rows.length === 0) {
          const members = await query<any[]>(
            `SELECT u.user_id, u.display_name, u.avatar_url, p.headline, p.company, p.skills, p.networking_goals
             FROM users u
             JOIN user_profiles p ON u.user_id = p.user_id
             WHERE u.status = 'active'`
          );
    
          for (const m of members) {
            const skillsObj = typeof m.skills === 'string' ? JSON.parse(m.skills) : m.skills || {};
            const rawGroups = skillsObj.networkingGroup;
            const groupsStr = Array.isArray(rawGroups) ? rawGroups.join(' & ') : typeof rawGroups === 'string' ? rawGroups : '';
            const introText = `Hello NexaLink Network! Excited to connect with leaders and peers.${groupsStr ? ' Active in ' + groupsStr + '.' : ''}`;
    
            await this.create(m.user_id, {
              author_name: m.display_name,
              author_title: m.headline || 'Network Member',
              author_avatar: m.avatar_url,
              content: introText,
              tags: ['Networking', 'Growth'],
            });
          }
    
          rows = await query<any[]>(
            `SELECT * FROM posts ORDER BY created_at DESC LIMIT 100`
          );
        }
        */
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
            const matchScore = scoreMap.get(Number(p.user_id)) || 55;
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
       VALUES (?, ?, ?, ?, ?, NULL, 0)`, [
            userId,
            data.author_name,
            data.author_title || null,
            data.author_avatar || null,
            data.content,
        ]);
        return result.insertId;
    }
    static async findById(postId) {
        const rows = await (0, db_1.query)(`SELECT * FROM posts WHERE post_id = ?`, [postId]);
        return rows[0] || null;
    }
    static async like(userId, postId) {
        await (0, db_1.query)(`UPDATE posts SET likes_count = likes_count + 1 WHERE post_id = ?`, [postId]);
    }
}
exports.FeedRepository = FeedRepository;
