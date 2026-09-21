import { query } from '../config/db';

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
}

export class FeedRepository {
  static async list(userId: number, limit = 20): Promise<PostRow[]> {
    const rows = await query<any[]>(
      `SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
      [userId, limit]
    );

    return rows.map((p) => ({
      ...p,
      tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags || [],
    }));
  }

  static async create(userId: number, data: { author_name: string; author_title?: string | null; author_avatar?: string | null; content: string; tags?: string[] }): Promise<number> {
    const result: any = await query(
      `INSERT INTO posts (user_id, author_name, author_title, author_avatar, content, tags, likes_count)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [
        userId,
        data.author_name,
        data.author_title || null,
        data.author_avatar || null,
        data.content,
        JSON.stringify(data.tags || []),
      ]
    );
    return result.insertId;
  }

  static async like(userId: number, postId: number): Promise<void> {
    await query(
      `UPDATE posts SET likes_count = likes_count + 1 WHERE post_id = ?`,
      [postId]
    );
  }
}
