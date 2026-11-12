import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { query, withTransaction } from '../config/db';

export interface PostRow {
  post_id: number;
  user_id: number;
  author_name: string;
  author_title: string | null;
  author_avatar: string | null;
  content: string;
  tags: any;
  likes_count: number;
  created_at: string;
  matchScore?: number;
  combinedScore?: number;
}

export interface PostReplyRow {
  reply_id: number;
  post_id: number;
  user_id: number;
  author_name: string;
  author_avatar: string | null;
  reply_type: string;
  target_person: string;
  content: string | null;
  created_at: string;
}

type NewPost = Pick<PostRow, 'author_name' | 'content'> &
  Partial<Pick<PostRow, 'author_title' | 'author_avatar'>> & { tags?: string[] | null };

export class FeedRepository {
  private static repliesTableChecked = false;

  static async ensureRepliesTableExist(): Promise<void> {
    if (this.repliesTableChecked) return;
    try {
      await query(`
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
    } catch (err) {
      console.warn('⚠️ post_replies auto table creation notice:', err);
    }
  }

  static async getRepliesForPost(postId: number): Promise<PostReplyRow[]> {
    await this.ensureRepliesTableExist();
    const rows = await query<PostReplyRow[]>(
      `SELECT * FROM post_replies WHERE post_id = ? ORDER BY created_at ASC`,
      [postId]
    );
    return rows;
  }

  static async createReply(
    userId: number,
    postId: number,
    authorName: string,
    authorAvatar: string | null,
    replyType: string,
    targetPerson: string,
    content: string | null
  ): Promise<number> {
    await this.ensureRepliesTableExist();
    const existing = await query<PostReplyRow[]>(
      `SELECT * FROM post_replies WHERE post_id = ? AND user_id = ?`,
      [postId, userId]
    );
    if (existing.length > 0) {
      await query(
        `UPDATE post_replies SET reply_type = ?, target_person = ?, content = ?, author_name = ?, author_avatar = ? WHERE reply_id = ?`,
        [replyType, targetPerson, content || null, authorName, authorAvatar || null, existing[0].reply_id]
      );
      return existing[0].reply_id;
    } else {
      const result: any = await query(
        `INSERT INTO post_replies (post_id, user_id, author_name, author_avatar, reply_type, target_person, content)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [postId, userId, authorName, authorAvatar || null, replyType, targetPerson, content || null]
      );
      return result.insertId;
    }
  }

  private static async hideRedundantContactShares(posts: PostRow[]): Promise<PostRow[]> {
    const groups = new Map<string, PostRow[]>();
    for (const post of posts) {
      if (!post.content.startsWith('[can connect you to] ')) continue;
      const key = JSON.stringify([post.user_id, post.content.trim()]);
      const group = groups.get(key) ?? [];
      group.push(post);
      groups.set(key, group);
    }

    const duplicateGroups = [...groups.values()].filter((group) => group.length > 1);
    const postIds = duplicateGroups.flat().map((post) => post.post_id);
    if (postIds.length === 0) return posts;

    await this.ensureRepliesTableExist();
    const replies = await query<{ post_id: number }[]>(
      `SELECT DISTINCT post_id FROM post_replies WHERE post_id IN (${postIds.map(() => '?').join(',')})`,
      postIds,
    );
    const repliedTo = new Set(replies.map(({ post_id }) => post_id));
    const hasActivity = (post: PostRow) => post.likes_count > 0 || repliedTo.has(post.post_id);
    const hidden = new Set<number>();

    for (const group of duplicateGroups) {
      for (const post of group) {
        if (hasActivity(post)) continue;
        const redundant = group.some((other) =>
          other.post_id !== post.post_id &&
          Math.abs(Date.parse(other.created_at) - Date.parse(post.created_at)) <= 5 * 60 * 1000 &&
          (hasActivity(other) || other.post_id > post.post_id)
        );
        if (redundant) hidden.add(post.post_id);
      }
    }

    return posts.filter((post) => !hidden.has(post.post_id));
  }

  static async list(userId: number, limit = 30): Promise<PostRow[]> {
    let rows = await query<any[]>(
      `SELECT * FROM posts ORDER BY created_at DESC LIMIT 100`
    );

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
        const introText = `Hello SansNetworks Network! Excited to connect with leaders and peers.${groupsStr ? ' Active in ' + groupsStr + '.' : ''}`;

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

    if (rows.length === 0) return [];
    rows = await this.hideRedundantContactShares(rows).catch((error) => {
      console.warn('Could not check for duplicate contact shares:', error);
      return rows;
    });

    const authorIds = [...new Set(rows.map((p) => p.user_id))];

    // Fetch precomputed match scores for authors
    const scores = await query<any[]>(
      `SELECT user_b_id, score FROM user_match_scores WHERE user_a_id = ? AND user_b_id IN (${authorIds.map(() => '?').join(',')})`,
      [userId, ...authorIds]
    );

    const scoreMap = new Map<number, number>();
    scores.forEach((s) => scoreMap.set(Number(s.user_b_id), s.score));

    const now = Date.now();
    const HALF_LIFE_HOURS = 24;
    const DECAY_LAMBDA = Math.LN2 / HALF_LIFE_HOURS;

    const rankedPosts: PostRow[] = rows.map((p) => {
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

  static async createContactShare(userId: number, data: NewPost): Promise<number> {
    return withTransaction(async (conn) => {
      // Serialize contact shares by author so concurrent confirmations cannot create two posts.
      await conn.execute('SELECT user_id FROM users WHERE user_id = ? FOR UPDATE', [userId]);
      const [existing] = await conn.execute<RowDataPacket[]>(
        'SELECT post_id FROM posts WHERE user_id = ? AND BINARY content = ? LIMIT 1',
        [userId, data.content],
      );
      return existing[0]?.post_id ?? this.create(userId, data, conn);
    });
  }

  static async create(userId: number, data: NewPost, conn?: PoolConnection): Promise<number> {
    const sql = `INSERT INTO posts (user_id, author_name, author_title, author_avatar, content, tags, likes_count)
       VALUES (?, ?, ?, ?, ?, NULL, 0)`;
    const params = [
      userId,
      data.author_name,
      data.author_title || null,
      data.author_avatar || null,
      data.content,
    ];
    const result = conn ? (await conn.execute(sql, params))[0] : await query(sql, params);
    return result.insertId;
  }

  static async findById(postId: number): Promise<PostRow | null> {
    const rows = await query<PostRow[]>(
      `SELECT * FROM posts WHERE post_id = ?`,
      [postId]
    );
    return rows[0] || null;
  }

  static async like(userId: number, postId: number): Promise<void> {
    await query(
      `UPDATE posts SET likes_count = likes_count + 1 WHERE post_id = ?`,
      [postId]
    );
  }
}
